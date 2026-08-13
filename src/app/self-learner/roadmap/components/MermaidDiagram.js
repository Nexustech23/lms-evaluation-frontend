"use client";

import { useEffect, useRef, useState } from "react";

let renderCounter = 0;

/**
 * Renders a Mermaid diagram source string client-side (lazy-loaded — mermaid
 * is a large dependency and most notes views never show one). Backend
 * already structurally validates + repairs diagrams before caching them
 * (see app/services/roadmap_ai.py::validate_and_repair_diagram), so a parse
 * failure here should be rare — but mermaid's real parser is stricter than
 * that server-side regex check, so this is a second line of defense: it
 * reports failures via onError rather than silently showing nothing, so the
 * caller can self-heal (regenerate once).
 */
export default function MermaidDiagram({ diagram, onError }) {
  const [svg, setSvg] = useState(null);
  const [failed, setFailed] = useState(false);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!diagram) {
      setSvg(null);
      setFailed(false);
      return;
    }

    let cancelled = false;
    renderCounter += 1;
    const renderId = `roadmap-mermaid-${renderCounter}-${Date.now()}`;

    (async () => {
      try {
        const mermaidModule = await import("mermaid");
        const mermaid = mermaidModule.default;
        mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "strict" });
        const { svg: renderedSvg } = await mermaid.render(renderId, diagram);
        if (!cancelled) {
          setSvg(renderedSvg);
          setFailed(false);
        }
      } catch (err) {
        console.error("Mermaid render failed", err);
        if (!cancelled) {
          setSvg(null);
          setFailed(true);
          onErrorRef.current?.(err);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [diagram]);

  if (!diagram || failed) return null;

  if (!svg) {
    return (
      <div className="bg-[#FAFBFF] border border-gray-100 rounded-2xl p-6 text-center text-xs font-semibold text-gray-400">
        Rendering diagram…
      </div>
    );
  }

  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl p-4 overflow-x-auto [&_svg]:mx-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
