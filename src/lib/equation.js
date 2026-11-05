// Equation rendering shared by the paper editor, its preview and the Word export.
// An equation is stored as LaTeX and drawn as a PNG picture; sizes are kept in em so they follow the text size.
// The backend (docx_from_html.py) reads the same data-w / data-h / data-d values.

export const EQ_FONT_PX = 16; // the editor body font size
export const EQ_SCALE = 3; // the picture is drawn 3x larger than shown, so it stays sharp when printed

// Only packages that render offline: base maths, amsmath, \newcommand, bold symbols, physics macros (\vb, \dv), chemistry (\ce).
const TEX_PACKAGES = ["base", "ams", "newcommand", "configmacros", "boldsymbol", "physics", "mhchem"];

let engine = null;

async function loadEngine() {
  if (!engine) {
    engine = (async () => {
      const [{ mathjax }, { TeX }, { SVG }, { browserAdaptor }, { RegisterHTMLHandler }] = await Promise.all([
        import("mathjax-full/js/mathjax.js"),
        import("mathjax-full/js/input/tex.js"),
        import("mathjax-full/js/output/svg.js"),
        import("mathjax-full/js/adaptors/browserAdaptor.js"),
        import("mathjax-full/js/handlers/html.js"),
      ]);
      await import("mathjax-full/js/input/tex/AllPackages.js"); // registers the packages named above
      RegisterHTMLHandler(browserAdaptor());
      const tex = new TeX({
        packages: TEX_PACKAGES,
        formatError(_jax, error) { throw error; }, // report a mistake instead of drawing red text
      });
      const svg = new SVG({ fontCache: "none" }); // each picture carries its own glyph shapes
      return mathjax.document(document, { InputJax: tex, OutputJax: svg });
    })().catch((error) => { engine = null; throw error; });
  }
  return engine;
}

/** "0 -716 3000 1716" (1000 units = 1em) -> size and baseline drop in em. Pure, so it can be tested. */
export function metricsFromViewBox(viewBox) {
  const [, y, w, h] = String(viewBox || "").trim().split(/\s+/).map(Number);
  if (![y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) throw new Error("Equation has no size");
  const round = (n) => Math.round(n * 10000) / 10000;
  return { w: round(w / 1000), h: round(h / 1000), d: round(Math.max(0, (y + h) / 1000)) };
}

export function styleForEquation({ w, h, d, display }) {
  const size = `width:${w}em;height:${h}em;`;
  return display ? `${size}display:block;margin:8px auto;` : `${size}vertical-align:-${d}em;`;
}

function svgToPng(svgText, pxW, pxH) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pxW;
      canvas.height = pxH;
      canvas.getContext("2d").drawImage(image, 0, 0, pxW, pxH);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => reject(new Error("Could not draw the equation"));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
  });
}

/** LaTeX -> { latex, display, src (PNG data URL), w, h, d }. Throws with a readable message on a mistake. */
export async function renderEquation(latex, display = false) {
  const source = String(latex || "").trim();
  if (!source) throw new Error("Type an equation");
  if (source.length > 2000) throw new Error("Equation is too long");
  const doc = await loadEngine();
  let container;
  try {
    // "display" gives fractions, sums and integrals their larger form, as in a centred equation.
    container = doc.convert(source, { display: !!display, em: EQ_FONT_PX, ex: EQ_FONT_PX / 2, containerWidth: 80 * EQ_FONT_PX });
  } catch (error) {
    throw new Error(String(error?.message || error).replace(/^TeX parse error:\s*/i, ""));
  }
  const svg = container.querySelector("svg");
  if (!svg) throw new Error("Could not draw the equation");
  const { w, h, d } = metricsFromViewBox(svg.getAttribute("viewBox"));
  const pxW = Math.max(1, Math.ceil(w * EQ_FONT_PX * EQ_SCALE));
  const pxH = Math.max(1, Math.ceil(h * EQ_FONT_PX * EQ_SCALE));
  svg.setAttribute("width", `${pxW}px`);
  svg.setAttribute("height", `${pxH}px`);
  svg.removeAttribute("style");
  const svgText = new XMLSerializer().serializeToString(svg).replace(/currentColor/g, "#000000");
  return { latex: source, display: !!display, src: await svgToPng(svgText, pxW, pxH), w, h, d };
}

// ─── Symbol palette ("@@" marks where the cursor goes) ───
export const EQUATION_PALETTE = [
  {
    name: "Basic",
    items: [
      ["a/b", "\\frac{@@}{}"], ["xⁿ", "^{@@}"], ["xₙ", "_{@@}"], ["√", "\\sqrt{@@}"], ["ⁿ√", "\\sqrt[n]{@@}"],
      ["( )", "\\left(@@\\right)"], ["| |", "\\left|@@\\right|"], ["±", "\\pm "], ["×", "\\times "], ["÷", "\\div "], ["·", "\\cdot "],
    ],
  },
  {
    name: "Relations",
    items: [
      ["≤", "\\le "], ["≥", "\\ge "], ["≠", "\\ne "], ["≈", "\\approx "], ["∝", "\\propto "], ["∞", "\\infty "],
      ["→", "\\rightarrow "], ["⇌", "\\rightleftharpoons "], ["∴", "\\therefore "], ["°", "^\\circ "],
    ],
  },
  {
    name: "Calculus",
    items: [
      ["∫", "\\int_{@@}^{}"], ["∑", "\\sum_{@@}^{}"], ["∏", "\\prod_{@@}^{}"], ["lim", "\\lim_{@@ \\to }"],
      ["d/dx", "\\frac{d}{dx}"], ["∂", "\\partial "], ["∇", "\\nabla "], ["sin", "\\sin "], ["cos", "\\cos "], ["tan", "\\tan "], ["log", "\\log "], ["ln", "\\ln "],
    ],
  },
  {
    name: "Greek",
    items: [
      ["α", "\\alpha "], ["β", "\\beta "], ["γ", "\\gamma "], ["δ", "\\delta "], ["ε", "\\varepsilon "], ["θ", "\\theta "], ["λ", "\\lambda "],
      ["μ", "\\mu "], ["π", "\\pi "], ["ρ", "\\rho "], ["σ", "\\sigma "], ["τ", "\\tau "], ["φ", "\\phi "], ["ω", "\\omega "],
      ["Δ", "\\Delta "], ["Σ", "\\Sigma "], ["Φ", "\\Phi "], ["Ω", "\\Omega "],
    ],
  },
  {
    name: "Physics & Chemistry",
    items: [
      ["vector", "\\vec{@@}"], ["unit vec", "\\hat{@@}"], ["bar", "\\overline{@@}"], ["dot", "\\dot{@@}"],
      ["unit", "\\,\\mathrm{@@}"], ["text", "\\text{@@}"], ["chem", "\\ce{@@}"], ["matrix", "\\begin{pmatrix} @@ & \\\\ & \\end{pmatrix}"],
    ],
  },
];

/** Put a palette snippet into text at a selection. Returns the new text and where the cursor goes. Pure. */
export function insertSnippet(text, start, end, snippet) {
  const marker = snippet.indexOf("@@");
  const body = snippet.replace("@@", "");
  const next = text.slice(0, start) + body + text.slice(end);
  return { text: next, cursor: start + (marker === -1 ? body.length : marker) };
}
