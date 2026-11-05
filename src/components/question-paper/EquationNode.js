"use client";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { DecoratorNode, $getNodeByKey, $getSelection, $isRangeSelection, $getRoot, $createParagraphNode } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EQUATION_PALETTE, insertSnippet, renderEquation, styleForEquation } from "@/lib/equation";

// ═══════════════════════════════════════════════════════════
// An equation in the paper: LaTeX source + a PNG picture of it (sizes in em).
// It is saved as <img class="lms-eq" data-latex=… data-w/h/d=…>, so the Word export gets a picture
// and the editor can open the equation again to edit it.
// ═══════════════════════════════════════════════════════════

export const EquationDialogCtx = createContext({ openEquation: () => { } });

function EquationView({ nodeKey, equation }) {
  const [editor] = useLexicalComposerContext();
  const { openEquation } = useContext(EquationDialogCtx);
  const [hover, setHover] = useState(false);
  const style = {
    width: `${equation.w}em`,
    height: `${equation.h}em`,
    cursor: "pointer",
    userSelect: "none",
    borderRadius: 3,
    outline: hover ? "2px solid #93c5fd" : "2px solid transparent",
    ...(equation.display ? { display: "block", margin: "8px auto" } : { verticalAlign: `-${equation.d}em` }),
  };
  return (
    <img
      src={equation.src}
      alt={equation.latex}
      title="Click to edit this equation"
      draggable={false}
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => openEquation({ editor, nodeKey, equation })}
    />
  );
}

export class EquationNode extends DecoratorNode {
  __equation;

  static getType() { return "equation"; }
  static clone(node) { return new EquationNode(node.__equation, node.__key); }

  constructor(equation, key) {
    super(key);
    this.__equation = equation;
  }

  static importJSON(serialized) { return $createEquationNode(serialized.equation); }
  exportJSON() { return { type: "equation", version: 1, equation: this.__equation }; }

  createDOM() {
    const span = document.createElement("span");
    span.setAttribute("contenteditable", "false");
    span.style.display = this.__equation.display ? "block" : "inline-block";
    return span;
  }
  updateDOM(prev) { return prev.__equation.display !== this.__equation.display; }
  isInline() { return true; }
  getTextContent() { return `$${this.__equation.latex}$`; }

  exportDOM() {
    const { latex, display, src, w, h, d } = this.__equation;
    const img = document.createElement("img");
    img.setAttribute("class", "lms-eq");
    img.setAttribute("src", src);
    img.setAttribute("alt", latex);
    img.setAttribute("data-latex", latex);
    img.setAttribute("data-display", display ? "1" : "0");
    img.setAttribute("data-w", String(w));
    img.setAttribute("data-h", String(h));
    img.setAttribute("data-d", String(d));
    img.setAttribute("style", styleForEquation(this.__equation));
    return { element: img };
  }

  static importDOM() {
    return {
      // Higher priority than the plain image, but only for pictures that carry their LaTeX.
      img: (dom) => (dom.hasAttribute("data-latex") ? { conversion: convertEquationImage, priority: 2 } : null),
    };
  }

  setEquation(equation) { this.getWritable().__equation = equation; }
  decorate() { return <EquationView nodeKey={this.__key} equation={this.__equation} />; }
}

function convertEquationImage(dom) {
  const w = Number(dom.getAttribute("data-w"));
  const h = Number(dom.getAttribute("data-h"));
  const d = Number(dom.getAttribute("data-d"));
  const src = dom.getAttribute("src");
  if (!src || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  return {
    node: $createEquationNode({
      latex: dom.getAttribute("data-latex") || "",
      display: dom.getAttribute("data-display") === "1",
      src, w, h, d: Number.isFinite(d) ? d : 0,
    }),
  };
}

export function $createEquationNode(equation) { return new EquationNode(equation); }
export function $isEquationNode(node) { return node instanceof EquationNode; }

// ═══════════════════════════════════════════════════════════
// Dialog: type LaTeX or click symbols, see the result, press Insert.
// ═══════════════════════════════════════════════════════════

export function EquationDialogProvider({ children }) {
  const [request, setRequest] = useState(null); // { editor, nodeKey?, equation? }
  const openEquation = useCallback((next) => setRequest(next), []);
  return (
    <EquationDialogCtx.Provider value={{ openEquation }}>
      {children}
      {request && <EquationDialog request={request} onClose={() => setRequest(null)} />}
    </EquationDialogCtx.Provider>
  );
}

const overlay = { position: "fixed", inset: 0, background: "rgba(15,23,42,.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999 };
const card = { width: 560, maxWidth: "94vw", maxHeight: "92vh", overflowY: "auto", background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 20px 40px rgba(0,0,0,.25)" };
const button = { height: 40, padding: "0 18px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" };

function EquationDialog({ request, onClose }) {
  const { editor, nodeKey, equation: existing } = request;
  const [latex, setLatex] = useState(existing?.latex || "");
  const [display, setDisplay] = useState(!!existing?.display);
  const [tab, setTab] = useState(0);
  const [preview, setPreview] = useState({ status: existing ? "loading" : "idle" });
  const textareaRef = useRef(null);
  const runId = useRef(0);

  // Draw the equation 250 ms after typing stops; ignore answers that arrive late.
  useEffect(() => {
    if (!latex.trim()) { setPreview({ status: "idle" }); return undefined; }
    setPreview((p) => ({ ...p, status: "loading" }));
    const id = ++runId.current;
    const timer = setTimeout(() => {
      renderEquation(latex, display)
        .then((equation) => { if (id === runId.current) setPreview({ status: "ok", equation }); })
        .catch((error) => { if (id === runId.current) setPreview({ status: "error", message: error.message }); });
    }, 250);
    return () => clearTimeout(timer);
  }, [latex, display]);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const addSnippet = (snippet) => {
    const box = textareaRef.current;
    const start = box ? box.selectionStart : latex.length;
    const end = box ? box.selectionEnd : latex.length;
    const next = insertSnippet(latex, start, end, snippet);
    setLatex(next.text);
    requestAnimationFrame(() => { box?.focus(); box?.setSelectionRange(next.cursor, next.cursor); });
  };

  const canInsert = preview.status === "ok";
  const apply = () => {
    if (!canInsert) return;
    const eq = preview.equation;
    editor.update(() => {
      if (nodeKey) {
        const node = $getNodeByKey(nodeKey);
        if ($isEquationNode(node)) node.setEquation(eq);
        return;
      }
      const node = $createEquationNode(eq);
      const selection = $getSelection();
      if ($isRangeSelection(selection)) selection.insertNodes([node]);
      else { const p = $createParagraphNode(); p.append(node); $getRoot().append(p); }
    });
    onClose();
    editor.focus();
  };

  const remove = () => {
    editor.update(() => { $getNodeByKey(nodeKey)?.remove(); });
    onClose();
    editor.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); apply(); }
  };

  return (
    <div style={overlay} onKeyDown={onKeyDown} data-testid="equation-dialog">
      <div style={card}>
        <h2 style={{ color: "#111827", fontSize: 20, fontWeight: 700, marginBottom: 14 }}>
          {nodeKey ? "Edit Equation" : "Insert Equation"}
        </h2>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {EQUATION_PALETTE.map((group, i) => (
            <button key={group.name} type="button" onClick={() => setTab(i)}
              style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, border: "1px solid #d1d5db", cursor: "pointer", background: tab === i ? "#dbeafe" : "#f8fafc", color: tab === i ? "#1d4ed8" : "#374151", fontWeight: tab === i ? 600 : 400 }}>
              {group.name}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {EQUATION_PALETTE[tab].items.map(([label, snippet]) => (
            <button key={label} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => addSnippet(snippet)}
              style={{ minWidth: 38, height: 34, padding: "0 8px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 14 }}
              title={snippet.replace("@@", "")}>
              {label}
            </button>
          ))}
        </div>

        <label htmlFor="equation-latex" style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>
          Equation (LaTeX, for example \frac{"{a}{b}"} or x^2)
        </label>
        <textarea id="equation-latex" ref={textareaRef} value={latex} rows={3} spellCheck={false}
          onChange={(e) => setLatex(e.target.value)}
          style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 12px", fontFamily: "Consolas, monospace", fontSize: 14, background: "#f8fafc", boxSizing: "border-box", resize: "vertical" }} />

        <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0", fontSize: 13, color: "#374151", cursor: "pointer" }}>
          <input type="checkbox" checked={display} onChange={(e) => setDisplay(e.target.checked)} />
          Show on its own line, centred
        </label>

        <div aria-live="polite" style={{ minHeight: 70, border: "1px dashed #cbd5e1", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", padding: 12, background: "#fff", marginBottom: 6, fontFamily: "Georgia, serif", fontSize: 24 }}>
          {preview.status === "ok" && (
            <img src={preview.equation.src} alt={preview.equation.latex}
              style={{ width: `${preview.equation.w}em`, height: `${preview.equation.h}em` }} />
          )}
          {preview.status === "idle" && <span style={{ fontSize: 13, color: "#9ca3af", fontFamily: "Arial, sans-serif" }}>The equation appears here</span>}
          {preview.status === "loading" && <span style={{ fontSize: 13, color: "#9ca3af", fontFamily: "Arial, sans-serif" }}>Drawing…</span>}
          {preview.status === "error" && <span role="alert" style={{ fontSize: 13, color: "#dc2626", fontFamily: "Arial, sans-serif" }}>{preview.message}</span>}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14 }}>
          <div>{nodeKey && <button type="button" onClick={remove} style={{ ...button, color: "#dc2626", background: "#fee2e2", border: "none" }}>Delete</button>}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} style={button}>Cancel</button>
            <button type="button" disabled={!canInsert} onClick={apply}
              style={{ ...button, border: "none", background: canInsert ? "#2563eb" : "#cbd5e1", color: "#fff", fontWeight: 500, cursor: canInsert ? "pointer" : "not-allowed" }}>
              {nodeKey ? "Update" : "Insert"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
