"use client";

import { useEffect, useRef, useState } from "react";
import { X, Maximize2 } from "lucide-react";

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
  const [fullscreen, setFullscreen] = useState(false);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!fullscreen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fullscreen]);

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
    <>
      <button
        type="button"
        onClick={() => setFullscreen(true)}
        className="group relative w-full bg-white border border-gray-100 rounded-2xl p-4 overflow-x-auto [&_svg]:mx-auto cursor-zoom-in text-left"
        title="Click to view full screen"
      >
        <div dangerouslySetInnerHTML={{ __html: svg }} />
        <div className="absolute top-2 right-2 bg-white/90 border border-gray-100 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Maximize2 size={14} className="text-gray-500" />
        </div>
      </button>

      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setFullscreen(false)}
        >
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
          <div
            className="bg-white rounded-2xl p-6 w-[95vw] max-h-[90vh] overflow-auto [&_svg]:mx-auto"
            onClick={(e) => e.stopPropagation()}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      )}
    </>
  );
}
