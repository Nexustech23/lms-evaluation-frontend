// Build a complete draft first. A rejected workbook must not change the editor.
export function mergeCoImport(rows, existingCOs = [], existingMatrix = {}, programmePOs = []) {
  if (!Array.isArray(rows) || rows.length < 2 || !Array.isArray(rows[0]))
    throw new Error("Excel file is empty or has no data rows.");
  const text = (value) => String(value ?? "").trim();
  const header = rows[0].map(text);
  if (!header[0] || !header[1])
    throw new Error("The first two columns must have CO code and description headers.");

  const knownPOs = new Map(programmePOs.map((po) => [text(po.po_code).toUpperCase(), text(po.po_code)]));
  const columns = [];
  const seenPOs = new Set();
  for (let index = 2; index < header.length; index++) {
    const name = header[index];
    if (!name) {
      if (rows.slice(1).some((row) => text(row[index]) !== ""))
        throw new Error(`Column ${index + 1} has values but no PO header.`);
      continue;
    }
    const key = name.toUpperCase();
    const code = knownPOs.get(key) || (knownPOs.size === 0 && /^PO\d+$/i.test(name) ? key : null);
    if (!code) throw new Error(`Unknown PO column: ${name}. Use this programme's PO codes.`);
    if (seenPOs.has(code)) throw new Error(`Duplicate PO column: ${name}.`);
    seenPOs.add(code);
    columns.push({ index, code });
  }

  const coDraft = new Map(existingCOs.filter((co) => text(co.co_code)).map((co) => [text(co.co_code), { ...co }]));
  const matrixDraft = new Map(Object.entries(existingMatrix).map(([code, values]) => [code, { ...values }]));
  const seenCOs = new Set();
  for (let index = 1; index < rows.length; index++) {
    const row = rows[index];
    if (!Array.isArray(row)) throw new Error(`Row ${index + 1} is invalid.`);
    if (row.every((cell) => text(cell) === "")) continue;
    const code = text(row[0]);
    const description = text(row[1]);
    if (!code || !description) throw new Error(`Row ${index + 1}: CO code and description are required.`);
    if (seenCOs.has(code)) throw new Error(`Row ${index + 1}: duplicate CO code ${code}.`);
    seenCOs.add(code);
    const existing = coDraft.get(code);
    coDraft.set(code, { ...existing, co_code: code, description, threshold: existing?.threshold ?? 0 });

    const mapping = new Map(Object.entries(matrixDraft.get(code) || {}));
    for (const { index: column, code: po } of columns) {
      const cell = row[column];
      // An omitted/blank mapping does not mean "clear". Explicit zero does.
      if (text(cell) === "") continue;
      const value = Number(cell);
      if (typeof cell === "boolean" || !Number.isFinite(value) || ![0, 1, 2, 3].includes(value))
        throw new Error(`Row ${index + 1}, ${po}: use a mapping of 0, 1, 2 or 3.`);
      mapping.set(po, value);
    }
    matrixDraft.set(code, Object.fromEntries(mapping));
  }
  if (seenCOs.size === 0) throw new Error("No valid CO rows found. Check your Excel format.");
  return {
    coList: [...coDraft.values()], matrix: Object.fromEntries(matrixDraft),
    importedCount: seenCOs.size, poColumnCount: columns.length,
  };
}
