"use client";
import React, {
  useEffect, useRef, useCallback, useState, createContext, useContext, useMemo,
} from "react";
import {
  Bold, Italic, Underline, List, ListOrdered,
  Undo, Redo, Table, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, Link2, Eraser, Palette,
  Rows3, Columns3, Maximize2, Plus, Scissors,
} from "lucide-react";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { DecoratorNode } from "lexical";

import {
  TableNode, TableCellNode, TableRowNode,
  INSERT_TABLE_COMMAND,
  $insertTableRow__EXPERIMENTAL,
  $insertTableColumn__EXPERIMENTAL,
} from "@lexical/table";

import { HeadingNode, $createHeadingNode, $isHeadingNode } from "@lexical/rich-text";

import {
  ListNode, ListItemNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
} from "@lexical/list";

import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";

import {
  $getRoot, $getSelection, $isRangeSelection,
  FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND, REDO_COMMAND,
  $createParagraphNode, $createTextNode,
  createCommand, $getNodeByKey,
} from "lexical";

import {
  $setBlocksType, $patchStyleText, $getSelectionStyleValueForProperty,
} from "@lexical/selection";

import axios from "axios";
import toast from "react-hot-toast";

// ─── A4 at 96 dpi ───
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

// ─── Active editor context ───
const ActiveEditorCtx = createContext({ ref: { current: null }, setToolbarState: () => { } });

// ═══════════════════════════════════════════════════════════
// ImageNode
// ═══════════════════════════════════════════════════════════
export const INSERT_IMAGE_COMMAND = createCommand("INSERT_IMAGE_COMMAND");

function ImageComponent({ src, altText, width, align, nodeKey }) {
  const [editor] = useLexicalComposerContext();
  const [hovered, setHovered] = useState(false);

  const handleDelete = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) {
        node.remove();
      }
    });
    toast.success("Image deleted");
  };

  const handleWidthChange = (newWidth) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setWidthAndAlign(newWidth, align);
      }
    });
  };

  const handleAlignChange = (newAlign) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setWidthAndAlign(width, newAlign);
      }
    });
  };

  let margin = "16px 0";
  if (align === "center") {
    margin = "16px auto";
  } else if (align === "right") {
    margin = "16px 0 16px auto";
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        maxWidth: width,
        width: "100%",
        margin: margin,
        borderRadius: 8,
        border: hovered ? "2px solid #3b82f6" : "1px solid transparent",
        transition: "border 0.2s",
        display: "block",
        boxSizing: "border-box",
      }}
    >
      <img
        src={src}
        alt={altText}
        style={{
          width: "100%",
          height: "auto",
          borderRadius: 8,
          display: "block",
        }}
        draggable={false}
      />
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(4px)",
            padding: "4px 8px",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            zIndex: 10,
          }}
        >
          {/* Alignment controls */}
          <button
            type="button"
            onClick={() => handleAlignChange("left")}
            style={{
              padding: "4px 6px",
              background: align === "left" ? "#dbeafe" : "transparent",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 11,
              color: align === "left" ? "#1d4ed8" : "#374151",
            }}
            title="Align Left"
          >
            Align L
          </button>
          <button
            type="button"
            onClick={() => handleAlignChange("center")}
            style={{
              padding: "4px 6px",
              background: align === "center" ? "#dbeafe" : "transparent",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 11,
              color: align === "center" ? "#1d4ed8" : "#374151",
            }}
            title="Align Center"
          >
            Align C
          </button>
          <button
            type="button"
            onClick={() => handleAlignChange("right")}
            style={{
              padding: "4px 6px",
              background: align === "right" ? "#dbeafe" : "transparent",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 11,
              color: align === "right" ? "#1d4ed8" : "#374151",
            }}
            title="Align Right"
          >
            Align R
          </button>

          <span style={{ width: 1, height: 12, background: "#cbd5e1" }} />

          {/* Width controls */}
          <button
            type="button"
            onClick={() => handleWidthChange("50%")}
            style={{
              padding: "4px 6px",
              background: width === "50%" ? "#dbeafe" : "transparent",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 11,
              color: width === "50%" ? "#1d4ed8" : "#374151",
            }}
            title="50% Width"
          >
            50%
          </button>
          <button
            type="button"
            onClick={() => handleWidthChange("75%")}
            style={{
              padding: "4px 6px",
              background: width === "75%" ? "#dbeafe" : "transparent",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 11,
              color: width === "75%" ? "#1d4ed8" : "#374151",
            }}
            title="75% Width"
          >
            75%
          </button>
          <button
            type="button"
            onClick={() => handleWidthChange("100%")}
            style={{
              padding: "4px 6px",
              background: width === "100%" ? "#dbeafe" : "transparent",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 11,
              color: width === "100%" ? "#1d4ed8" : "#374151",
            }}
            title="100% Width"
          >
            100%
          </button>

          <span style={{ width: 1, height: 12, background: "#cbd5e1" }} />

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            style={{
              padding: "4px 8px",
              background: "#fee2e2",
              border: "none",
              borderRadius: 4,
              color: "#dc2626",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: "bold",
            }}
            title="Delete Image"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export class ImageNode extends DecoratorNode {
  __src; __altText; __width; __align;
  static getType() { return "image"; }
  static clone(n) { return new ImageNode(n.__src, n.__altText, n.__width, n.__align, n.__key); }
  constructor(src, altText = "Uploaded", width = "100%", align = "center", key) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__align = align;
  }
  static importJSON(s) { return $createImageNode(s.src, s.altText, s.width || "100%", s.align || "center"); }
  exportJSON() {
    return {
      type: "image",
      version: 1,
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      align: this.__align,
    };
  }
  createDOM() { const s = document.createElement("span"); s.style.display = "block"; return s; }
  updateDOM() { return false; }
  exportDOM() {
    const img = document.createElement("img");
    img.src = this.__src; img.alt = this.__altText;
    let margin = "16px 0";
    if (this.__align === "center") {
      margin = "16px auto";
    } else if (this.__align === "right") {
      margin = "16px 0 16px auto";
    }
    img.style.cssText = `max-width:${this.__width};width:${this.__width};margin:${margin};border-radius:8px;border:1px solid #e5e7eb;display:block;`;
    return { element: img };
  }
  static importDOM() {
    return {
      img: () => ({
        conversion: (d) => {
          if (d instanceof HTMLImageElement) {
            const w = d.style.width || "100%";
            let a = "center";
            if (d.style.margin && d.style.margin.includes("auto 0")) {
              a = "left";
            } else if (d.style.margin && d.style.margin.includes("0 auto")) {
              a = "center";
            } else if (d.style.margin && d.style.margin.includes("auto")) {
              a = "right";
            }
            return { node: $createImageNode(d.src, d.alt || "Uploaded", w, a) };
          }
          return null;
        },
        priority: 0
      })
    };
  }
  setWidthAndAlign(width, align) {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__align = align;
  }
  decorate() {
    return React.createElement(ImageComponent, {
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      align: this.__align,
      nodeKey: this.__key,
    });
  }
}
export function $createImageNode(src, alt = "Uploaded", width = "100%", align = "center") { return new ImageNode(src, alt, width, align); }
export function $isImageNode(n) { return n instanceof ImageNode; }

function ImagePlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => editor.registerCommand(INSERT_IMAGE_COMMAND, ({ src, altText }) => {
    const root = $getRoot();
    root.append($createImageNode(src, altText));
    const p = $createParagraphNode(); root.append(p); p.select();
    return true;
  }, 1), [editor]);
  return null;
}

// ═══════════════════════════════════════════════════════════
// Toolbar primitives
// ═══════════════════════════════════════════════════════════
function Btn({ onClick, active, disabled, danger, title, children }) {
  return (
    <button type="button"
      onMouseDown={e => { e.preventDefault(); onClick?.(); }}
      disabled={disabled} title={title}
      style={{
        padding: "2px 8px", border: active ? "1px solid #93c5fd" : "1px solid transparent",
        borderRadius: 6, height: 34,
        background: danger ? "#fee2e2" : active ? "#dbeafe" : "transparent",
        color: danger ? "#dc2626" : active ? "#1d4ed8" : "#111827",
        cursor: disabled ? "not-allowed" : "pointer", fontSize: 12,
        fontWeight: active ? 600 : 400, minWidth: 34,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}
    >{children}</button>
  );
}
function Sep() {
  return <span style={{ width: 1, height: 16, background: "#e5e7eb", display: "inline-block", margin: "0 3px", verticalAlign: "middle" }} />;
}

// ═══════════════════════════════════════════════════════════
// Toolbar
// ═══════════════════════════════════════════════════════════
function SharedToolbar({ pageStyle, setPageStyle, onAddPage }) {
  const { ref: activeEditorRef, toolbarState } = useContext(ActiveEditorCtx);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showTextColors, setShowTextColors] = useState(false);
  const [draftMargin, setDraftMargin] = useState({ top: pageStyle.marginTop, bottom: pageStyle.marginBottom, left: pageStyle.marginLeft, right: pageStyle.marginRight });
  const [draftBorder, setDraftBorder] = useState(pageStyle.border);
  const [draftBorderColor, setDraftBorderColor] = useState(pageStyle.borderColor);
  const [draftBorderWidth, setDraftBorderWidth] = useState(pageStyle.borderWidth);

  const COLORS = ["#000000", "#1d4ed8", "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#8b5cf6", "#ec4899"];

  const dispatch = cmd => payload => activeEditorRef.current?.dispatchCommand(cmd, payload);
  const update = fn => activeEditorRef.current?.update(fn);

  const setBlock = type => update(() => {
    const s = $getSelection(); if (!$isRangeSelection(s)) return;
    if (type === "paragraph") $setBlocksType(s, () => $createParagraphNode());
    else $setBlocksType(s, () => $createHeadingNode(type));
  });

  const toggleList = kind => {
    const editor = activeEditorRef.current; if (!editor) return;
    const { blockType } = toolbarState;
    if (kind === "bullet") blockType === "ul" ? editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined) : editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    else blockType === "ol" ? editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined) : editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const authenticator = async () => {
    const res = await fetch("/api/imagekit-auth", { credentials: "include" });
    if (!res.ok) throw new Error("Auth failed");
    return res.json();
  };

  const handleImageUpload = async file => {
    if (!file) return; setUploading(true);
    try {
      const auth = await authenticator();
      const fd = new FormData();
      fd.append("file", file); fd.append("fileName", file.name);
      fd.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY);
      fd.append("signature", auth.signature); fd.append("expire", auth.expire); fd.append("token", auth.token);
      const r = await axios.post("https://upload.imagekit.io/api/v1/files/upload", fd);
      setImageUrl(r.data.url); toast.success("Image uploaded");
    } catch { toast.error("Upload failed"); } finally { setUploading(false); }
  };

  const handleInsert = () => {
    if (!linkUrl && !imageUrl) return;
    update(() => {
      if (linkUrl) { const s = $getSelection(); if ($isRangeSelection(s)) s.insertText(linkUrl + " "); }
      if (imageUrl) {
        const s = $getSelection();
        if ($isRangeSelection(s)) { const p = $createParagraphNode(); s.insertNodes([$createImageNode(imageUrl, "Uploaded"), p]); p.select(); }
      }
    });
    setShowLinkModal(false); setLinkUrl(""); setImageUrl("");
  };

  const applyLayout = () => {
    setPageStyle(prev => ({ ...prev, marginTop: draftMargin.top, marginBottom: draftMargin.bottom, marginLeft: draftMargin.left, marginRight: draftMargin.right, border: draftBorder, borderColor: draftBorderColor, borderWidth: draftBorderWidth }));
    setShowLayoutModal(false); toast.success("Layout applied");
  };

  const openLayoutModal = () => {
    setDraftMargin({ top: pageStyle.marginTop, bottom: pageStyle.marginBottom, left: pageStyle.marginLeft, right: pageStyle.marginRight });
    setDraftBorder(pageStyle.border); setDraftBorderColor(pageStyle.borderColor); setDraftBorderWidth(pageStyle.borderWidth);
    setShowLayoutModal(true);
  };

  const iStyle = { height: 34, border: "1px solid #cbd5e1", borderRadius: 8, padding: "0 10px", fontSize: 13, color: "#111827", background: "#f8fafc", outline: "none", width: "100%", boxSizing: "border-box" };
  const lStyle = { fontSize: 12, color: "#6b7280", marginBottom: 4, display: "block" };
  const { isBold, isItalic, isUnderline, fontSize, fontFamily, blockType } = toolbarState;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap", padding: "8px 14px", background: "#f8fafc", borderBottom: "1px solid #d1d5db", position: "sticky", top: 0, zIndex: 999, backdropFilter: "blur(6px)" }}>
        <select value={["h1", "h2", "h3"].includes(blockType) ? blockType : "paragraph"} onChange={e => setBlock(e.target.value)}
          style={{ fontSize: 12, border: "1px solid #d1d5db", borderRadius: 6, padding: "0 6px", background: "#fff", height: 28, cursor: "pointer" }}>
          <option value="paragraph">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <select value={fontFamily} onChange={e => update(() => { const s = $getSelection(); if ($isRangeSelection(s)) $patchStyleText(s, { "font-family": e.target.value }); })}
          style={{ height: 34, minWidth: 130, padding: "0 8px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer", outline: "none" }}>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Calibri">Calibri</option>
          <option value="Courier New">Courier New</option>
        </select>
        <Sep />
        <select value={fontSize} onChange={e => update(() => { const s = $getSelection(); if ($isRangeSelection(s)) $patchStyleText(s, { "font-size": e.target.value }); })}
          style={{ fontSize: 12, border: "1px solid #d1d5db", borderRadius: 6, padding: "0 6px", background: "#fff", height: 34, cursor: "pointer" }}>
          {["10px", "11px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px"].map(s => <option key={s} value={s}>{s.replace("px", "")}</option>)}
        </select>

        <Btn onClick={() => dispatch(FORMAT_TEXT_COMMAND)("bold")} active={isBold} title="Bold"><Bold size={14} /></Btn>
        <Btn onClick={() => dispatch(FORMAT_TEXT_COMMAND)("italic")} active={isItalic} title="Italic"><Italic size={14} /></Btn>
        <Btn onClick={() => dispatch(FORMAT_TEXT_COMMAND)("underline")} active={isUnderline} title="Underline"><Underline size={14} /></Btn>

        <div style={{ position: "relative" }}>
          <Btn onClick={() => setShowTextColors(v => !v)} title="Text Color"><Palette size={14} /></Btn>
          {showTextColors && (
            <div style={{ position: "absolute", top: 38, left: 0, background: "#fff", border: "1px solid #d1d5db", borderRadius: 8, padding: 8, display: "grid", gridTemplateColumns: "repeat(3,24px)", gap: 5, boxShadow: "0 8px 20px rgba(0,0,0,.12)", zIndex: 200 }}>
              {COLORS.map(c => (
                <button key={c} onMouseDown={e => { e.preventDefault(); update(() => { const s = $getSelection(); if ($isRangeSelection(s)) $patchStyleText(s, { color: c }); }); setShowTextColors(false); }}
                  style={{ width: 24, height: 24, borderRadius: 5, border: "1px solid #d1d5db", background: c, cursor: "pointer" }} />
              ))}
            </div>
          )}
        </div>
        <Sep />
        <Btn onClick={() => toggleList("bullet")} active={blockType === "ul"} title="Bullet List"><List size={14} /></Btn>
        <Btn onClick={() => toggleList("ordered")} active={blockType === "ol"} title="Numbered List"><ListOrdered size={14} /></Btn>
        <Sep />
        <Btn onClick={() => dispatch(FORMAT_ELEMENT_COMMAND)("left")} title="Align Left"><AlignLeft size={14} /></Btn>
        <Btn onClick={() => dispatch(FORMAT_ELEMENT_COMMAND)("center")} title="Align Center"><AlignCenter size={14} /></Btn>
        <Btn onClick={() => dispatch(FORMAT_ELEMENT_COMMAND)("right")} title="Align Right"><AlignRight size={14} /></Btn>
        <Btn onClick={() => dispatch(FORMAT_ELEMENT_COMMAND)("justify")} title="Justify"><AlignJustify size={14} /></Btn>
        <Sep />
        <Btn onClick={() => setShowLinkModal(true)} title="Insert Link / Image"><Link2 size={14} /></Btn>
        <Btn onClick={openLayoutModal} title="Page Layout"><Maximize2 size={14} /></Btn>
        <Btn onClick={() => { update(() => { const s = $getSelection(); if ($isRangeSelection(s)) $setBlocksType(s, () => $createParagraphNode()); }); activeEditorRef.current?.dispatchCommand(INSERT_TABLE_COMMAND, { columns: "2", rows: "2", includeHeaders: { rows: true, columns: false } }); }} title="Insert Table"><Table size={14} /></Btn>
        <Btn onClick={() => update(() => { try { $insertTableRow__EXPERIMENTAL(false); } catch (e) { } })} title="Add Row"><Rows3 size={14} /></Btn>
        <Btn onClick={() => update(() => { try { $insertTableColumn__EXPERIMENTAL(false); } catch (e) { } })} title="Add Column"><Columns3 size={14} /></Btn>
        <Sep />
        <Btn onClick={() => update(() => { const s = $getSelection(); if (!$isRangeSelection(s)) return; $patchStyleText(s, { color: "", "background-color": "", "font-size": "", "font-family": "", "text-decoration": "" }); $setBlocksType(s, () => $createParagraphNode()); })} title="Clear Formatting" danger><Eraser size={14} /></Btn>
        <Btn onClick={() => dispatch(UNDO_COMMAND)(undefined)} title="Undo"><Undo size={14} /></Btn>
        <Btn onClick={() => dispatch(REDO_COMMAND)(undefined)} title="Redo"><Redo size={14} /></Btn>
        <Sep />
        <Btn onClick={onAddPage} title="Add Page"><Plus size={14} /><span style={{ marginLeft: 4, fontSize: 11 }}>Page</span></Btn>
      </div>

      {/* Link/Image modal */}
      {showLinkModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999 }}>
          <div style={{ width: 420, background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 20px 40px rgba(0,0,0,.25)" }}>
            <h2 style={{ color: "#111827", fontSize: 20, fontWeight: 700, marginBottom: 18 }}>Insert Link / Image</h2>
            <input type="text" placeholder="Paste Link URL..." value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
              style={{ width: "100%", height: 44, border: "1px solid #cbd5e1", background: "#f8fafc", color: "#111827", outline: "none", borderRadius: 10, padding: "0 14px", marginBottom: 14, fontSize: 14 }} />
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 14, padding: "8px 16px", borderRadius: 8, border: "1px solid #d1d5db", background: uploading ? "#f1f5f9" : "#fff", fontSize: 13, color: "#374151", cursor: uploading ? "not-allowed" : "pointer" }}>
              {uploading ? "Uploading…" : "📎 Choose Image"}
              <input type="file" accept="image/*" disabled={uploading} style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
            </label>
            {imageUrl && (
              <div style={{ marginTop: 8, border: "1px dashed #86efac", background: "#f0fdf4", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                <img src={imageUrl} alt="preview" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid #d1d5db" }} />
                <div><div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Image uploaded ✓</div><div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>Click Insert to add image</div></div>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <button onClick={() => { setShowLinkModal(false); setLinkUrl(""); setImageUrl(""); }} style={{ height: 40, padding: "0 18px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>Cancel</button>
              <button disabled={uploading || (!linkUrl && !imageUrl)} onClick={handleInsert} style={{ height: 40, padding: "0 18px", borderRadius: 10, border: "none", background: uploading || (!linkUrl && !imageUrl) ? "#cbd5e1" : "#2563eb", color: "#fff", fontWeight: 500, cursor: uploading || (!linkUrl && !imageUrl) ? "not-allowed" : "pointer" }}>Insert</button>
            </div>
          </div>
        </div>
      )}

      {/* Layout modal */}
      {showLayoutModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999 }}>
          <div style={{ width: 460, background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 20px 40px rgba(0,0,0,.25)" }}>
            <h2 style={{ color: "#111827", fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Page Layout</h2>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Margins (px)</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["top", "Top"], ["bottom", "Bottom"], ["left", "Left"], ["right", "Right"]].map(([k, l]) => (
                  <div key={k}><label style={lStyle}>{l}</label>
                    <input type="number" min={0} max={200} value={draftMargin[k]} onChange={e => setDraftMargin(p => ({ ...p, [k]: Number(e.target.value) }))} style={iStyle} /></div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {[["Normal (56px)", { top: 56, bottom: 56, left: 56, right: 56 }], ["Narrow (28px)", { top: 28, bottom: 28, left: 28, right: 28 }], ["Wide (80px)", { top: 56, bottom: 56, left: 80, right: 80 }]].map(([l, v]) => (
                  <button key={l} onClick={() => setDraftMargin(v)} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 6, border: "1px solid #d1d5db", background: "#f8fafc", cursor: "pointer", color: "#374151" }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Page Border</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div><label style={lStyle}>Style</label>
                  <select value={draftBorder} onChange={e => setDraftBorder(e.target.value)} style={{ ...iStyle, cursor: "pointer" }}>
                    {["none", "solid", "dashed", "dotted", "double"].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                  </select></div>
                <div><label style={lStyle}>Width (px)</label>
                  <input type="number" min={1} max={10} value={draftBorderWidth} onChange={e => setDraftBorderWidth(Number(e.target.value))} style={iStyle} disabled={draftBorder === "none"} /></div>
                <div><label style={lStyle}>Color</label>
                  <input type="color" value={draftBorderColor} onChange={e => setDraftBorderColor(e.target.value)} disabled={draftBorder === "none"} style={{ ...iStyle, padding: "2px 4px", cursor: draftBorder === "none" ? "not-allowed" : "pointer" }} /></div>
              </div>
              {draftBorder !== "none" && <div style={{ marginTop: 12, height: 48, borderRadius: 6, border: `${draftBorderWidth}px ${draftBorder} ${draftBorderColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#6b7280" }}>Border preview</div>}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setShowLayoutModal(false)} style={{ height: 40, padding: "0 18px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>Cancel</button>
              <button onClick={applyLayout} style={{ height: 40, padding: "0 18px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontWeight: 500, cursor: "pointer" }}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// ToolbarStateSync
// ═══════════════════════════════════════════════════════════
function ToolbarStateSync({ isActive }) {
  const [editor] = useLexicalComposerContext();
  const { setToolbarState } = useContext(ActiveEditorCtx);
  useEffect(() => {
    if (!isActive) return;
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        const anchor = selection.anchor.getNode();
        const el = anchor.getKey() === "root" ? anchor : anchor.getTopLevelElementOrThrow();
        let blockType = "paragraph";
        if ($isHeadingNode(el)) blockType = el.getTag();
        else if ($isListNode(el)) blockType = el.getListType() === "bullet" ? "ul" : "ol";
        setToolbarState({
          isBold: selection.hasFormat("bold"),
          isItalic: selection.hasFormat("italic"),
          isUnderline: selection.hasFormat("underline"),
          fontSize: $getSelectionStyleValueForProperty(selection, "font-size", "16px"),
          fontFamily: $getSelectionStyleValueForProperty(selection, "font-family", "Georgia"),
          blockType,
        });
      });
    });
  }, [editor, isActive, setToolbarState]);
  return null;
}

function FocusRegistrar({ onFocus }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const root = editor.getRootElement(); if (!root) return;
    const handler = () => onFocus(editor);
    root.addEventListener("focus", handler, true);
    return () => root.removeEventListener("focus", handler, true);
  }, [editor, onFocus]);
  return null;
}

function InitialHtmlPlugin({ html }) {
  const [editor] = useLexicalComposerContext();
  const done = useRef(false);
  useEffect(() => {
    if (!html || done.current) return;
    done.current = true;
    editor.update(() => {
      const root = $getRoot();
      const dom = new DOMParser().parseFromString(html, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      root.clear();
      nodes.forEach(n => { try { if (n && n.getType?.() !== "root") root.append(n); } catch (e) { } });
    });
  }, [editor, html]);
  return null;
}

function cleanHtml(html) {
  if (!html) return html;
  return html.replace(/<p([^>]*)>\s*[•·‣▪▸]\s*/gi, "<p$1>");
}

// ═══════════════════════════════════════════════════════════
// Paginator hook
// Measures top-level block heights in the live editor DOM
// and returns an array of page-break index ranges.
// ═══════════════════════════════════════════════════════════
function useAutoPaginator(editorRootRef, writableHeight, triggerVersion) {
  const [pageBreaks, setPageBreaks] = useState([{ start: 0, end: Infinity }]);

  const paginate = useCallback(() => {
    const root = editorRootRef.current;
    if (!root) return;
    const children = Array.from(root.children);
    if (children.length === 0) { setPageBreaks([{ start: 0, end: 0 }]); return; }

    const pages = [];
    let pageStart = 0;
    let usedHeight = 0;

    for (let i = 0; i < children.length; i++) {
      const h = children[i].offsetHeight || 0;
      if (i > pageStart && usedHeight + h > writableHeight) {
        pages.push({ start: pageStart, end: i - 1 });
        pageStart = i;
        usedHeight = h;
      } else {
        usedHeight += h;
      }
    }
    pages.push({ start: pageStart, end: children.length - 1 });
    setPageBreaks(pages);
  }, [editorRootRef, writableHeight]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setTimeout(paginate, 0));
    return () => cancelAnimationFrame(id);
  }, [paginate, triggerVersion]);

  // Also watch resizes
  useEffect(() => {
    const root = editorRootRef.current; if (!root) return;
    const ro = new ResizeObserver(paginate);
    ro.observe(root);
    return () => ro.disconnect();
  }, [editorRootRef, paginate]);

  return pageBreaks;
}

// ═══════════════════════════════════════════════════════════
// PageView — visual A4 card for the editor (with real Lexical)
// Each page shows only the slice of content within its range
// using CSS clip on a shared scrollable container.
// ═══════════════════════════════════════════════════════════

// ─── Single page card with its own Lexical instance ───────
const PAGE_EDITOR_CONFIG = (id) => ({
  namespace: `QpPage_${id}`,
  theme: {
    text: { bold: "qp-bold", italic: "qp-italic", underline: "qp-underline", strikethrough: "qp-strike" },
    heading: { h1: "qp-h1", h2: "qp-h2", h3: "qp-h3" },
    list: { ul: "qp-ul", ol: "qp-ol", listitem: "qp-li" },
    table: "qp-table", tableCell: "qp-td", tableCellHeader: "qp-th",
  },
  nodes: [HeadingNode, ListNode, ListItemNode, TableNode, TableCellNode, TableRowNode, ImageNode],
  onError(e) { console.error("[Page]", e); },
});

// ═══════════════════════════════════════════════════════════
// THE CORRECT APPROACH:
// ─ Single Lexical editor with overflow:hidden per page height
// ─ Pages are visual windows into the same scrollable editor
// ─ A "ghost" measurement div tracks real content height
// ─ Page breaks computed from measured heights
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// ResizableSplitPane
// ═══════════════════════════════════════════════════════════
function ResizableSplitPane({ left, right, initialLeftPercent = 55 }) {
  const containerRef = useRef(null);
  const [leftPct, setLeftPct] = useState(initialLeftPercent);
  const dragging = useRef(false);
  const onMouseDown = e => { e.preventDefault(); dragging.current = true; document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; };
  useEffect(() => {
    const onMove = e => {
      if (!dragging.current || !containerRef.current) return;
      const { left, width } = containerRef.current.getBoundingClientRect();
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setLeftPct(Math.min(80, Math.max(20, ((x - left) / width) * 100)));
    };
    const onUp = () => { if (!dragging.current) return; dragging.current = false; document.body.style.cursor = ""; document.body.style.userSelect = ""; };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove); window.addEventListener("touchend", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onUp); };
  }, []);
  return (
    <div ref={containerRef} style={{ display: "flex", width: "100%", height: "100%", flex: 1, overflow: "hidden" }}>
      <div style={{ width: `${leftPct}%`, minWidth: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>{left}</div>
      <div onMouseDown={onMouseDown} onTouchStart={onMouseDown}
        style={{ width: 8, flexShrink: 0, background: "#e2e8f0", cursor: "col-resize", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}
        onMouseEnter={e => e.currentTarget.style.background = "#94a3b8"} onMouseLeave={e => e.currentTarget.style.background = "#e2e8f0"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {[0, 1, 2, 3].map(i => <div key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: "#94a3b8" }} />)}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>{right}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Default page style
// ═══════════════════════════════════════════════════════════
const DEFAULT_PAGE_STYLE = {
  marginTop: 56, marginBottom: 56, marginLeft: 56, marginRight: 56,
  border: "none", borderColor: "#1e40af", borderWidth: 2,
};

// ═══════════════════════════════════════════════════════════
// splitHtmlIntoPages — splits raw HTML string into A4 pages
// by rendering each block into a hidden div and measuring heights.
// Returns array of HTML strings, one per page.
// ═══════════════════════════════════════════════════════════
function splitHtmlIntoPages(html, writableWidth, writableHeight) {
  if (typeof window === "undefined") return [html];

  // Create off-screen measurement container
  const container = document.createElement("div");
  container.style.cssText = `position:fixed;left:-9999px;top:0;width:${writableWidth}px;visibility:hidden;pointer-events:none;font-family:Georgia,serif;font-size:16px;line-height:1.85;color:#111827;`;
  document.body.appendChild(container);

  // Parse HTML and get block-level elements
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const blocks = Array.from(doc.body.children);

  const pages = [];
  let currentPageBlocks = [];
  let usedHeight = 0;

  for (const block of blocks) {
    const clone = block.cloneNode(true);
    container.innerHTML = "";
    container.appendChild(clone);
    const h = container.offsetHeight || 0;

    if (currentPageBlocks.length > 0 && usedHeight + h > writableHeight) {
      // Save current page and start new one
      pages.push(currentPageBlocks.map(b => b.outerHTML).join(""));
      currentPageBlocks = [block.cloneNode(true)];
      usedHeight = h;
    } else {
      currentPageBlocks.push(block.cloneNode(true));
      usedHeight += h;
    }
  }

  if (currentPageBlocks.length > 0) {
    pages.push(currentPageBlocks.map(b => b.outerHTML).join(""));
  }

  document.body.removeChild(container);
  return pages.length > 0 ? pages : [html];
}

// ═══════════════════════════════════════════════════════════
// ExamHeader — styled university exam header for preview
// ═══════════════════════════════════════════════════════════
function ExamHeader({ meta }) {
  return (
    <div
      style={{
        textAlign: "center",
        borderBottom: "3px double #1d4ed8",
        paddingBottom: 16,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 1,
            background:
              "linear-gradient(to right,transparent,#1d4ed8)",
          }}
        />
        <span
          style={{
            fontSize: 18,
            color: "#1d4ed8",
          }}
        >
          ⚜
        </span>
        <div
          style={{
            flex: 1,
            height: 1,
            background:
              "linear-gradient(to left,transparent,#1d4ed8)",
          }}
        />
      </div>

      <div
        style={{
          fontSize: 17,
          fontWeight: 800,
          color: "#1d4ed8",
          letterSpacing: "0.04em",
          lineHeight: 1.3,
          textTransform: "uppercase",
          fontFamily: "Georgia, serif",
          marginBottom: 4,
        }}
      >
        {meta?.instituteName || "University"}
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#1e40af",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 12,
          fontFamily: "Georgia, serif",
        }}
      >
        {meta?.departmentName || ""}
      </div>

      <div
        style={{
          height: 2,
          background:
            "linear-gradient(to right,transparent,#1d4ed8 20%,#1d4ed8 80%,transparent)",
          margin: "10px auto",
          maxWidth: 400,
        }}
      />

      <div
        style={{
          display: "inline-block",
          background:
            "linear-gradient(135deg,#1d4ed8,#1e40af)",
          color: "#fff",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "5px 28px",
          borderRadius: 4,
          margin: "8px 0",
          fontFamily: "Georgia, serif",
        }}
      >
        {meta?.examType || "EXAMINATION"}
      </div>

      <div
        style={{
          fontSize: 12,
          color: "#374151",
          marginTop: 8,
          fontFamily: "Georgia, serif",
        }}
      >
        Academic Year:{" "}
        <strong style={{ color: "#1d4ed8" }}>
          {meta?.batchName || ""}
        </strong>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          marginTop: 14,
          border: "1px solid #bfdbfe",
          borderRadius: 6,
          overflow: "hidden",
          fontSize: 12,
          fontFamily: "Georgia, serif",
        }}
      >
        {[
          [
            "Subject",
            meta?.subjectName || "",
          ],
          [
            "Semester",
            meta?.semester || "",
          ],
          [
            "Duration",
            meta?.duration || "",
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              padding: "7px 10px",
              background: "#eff6ff",
              borderRight: "1px solid #bfdbfe",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "#6b7280",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 2,
              }}
            >
              {label}
            </div>

            <div
              style={{
                color: "#1d4ed8",
                fontWeight: 700,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 8,
          textAlign: "right",
          fontSize: 11,
          color: "#6b7280",
          fontFamily: "Georgia, serif",
        }}
      >
        Maximum Marks:{" "}
        <strong
          style={{
            color: "#1d4ed8",
          }}
        >
          {meta?.totalMarks || ""}
        </strong>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PreviewPane — splits content into real A4 pages
// ═══════════════════════════════════════════════════════════
function PreviewPane({ html, pageStyle, previewMeta }) {
  const [pages, setPages] = useState([html]);
  const writableWidth = A4_WIDTH_PX - pageStyle.marginLeft - pageStyle.marginRight;
  const writableHeight = A4_HEIGHT_PX - pageStyle.marginTop - pageStyle.marginBottom - 80; // 80 = header reserve on p1

  useEffect(() => {
    if (!html) return;
    // Defer to after paint so measurement is accurate
    const id = requestAnimationFrame(() => {
      const result = splitHtmlIntoPages(html, writableWidth, writableHeight);
      setPages(result);
    });
    return () => cancelAnimationFrame(id);
  }, [html, writableWidth, writableHeight]);

  const pageBorder = pageStyle.border === "none"
    ? "1px solid #c8cdd5"
    : `${pageStyle.borderWidth}px ${pageStyle.border} ${pageStyle.borderColor}`;

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "#d1d5db", padding: "28px 20px" }}>
      {pages.map((pageHtml, idx) => (
        <div key={idx} style={{
          width: A4_WIDTH_PX,
          minHeight: A4_HEIGHT_PX,
          background: "#fff",
          margin: "0 auto 32px",
          position: "relative",
          boxShadow: "0 2px 16px rgba(0,0,0,.18)",
          border: pageBorder,
          boxSizing: "border-box",
          borderRadius: 2,
          paddingTop: pageStyle.marginTop,
          paddingBottom: pageStyle.marginBottom,
          paddingLeft: pageStyle.marginLeft,
          paddingRight: pageStyle.marginRight,
          overflow: "hidden",
        }}>
          {/* Page number top-right */}
          <div style={{ position: "absolute", top: 8, right: 12, fontSize: 11, color: "#94a3b8", fontFamily: "Georgia,serif", userSelect: "none" }}>
            Page {idx + 1} / {pages.length}
          </div>

          {/* Exam header on first page only */}
          {idx === 0 && (
            <ExamHeader
              meta={previewMeta}
            />
          )}

          {/* Page content */}
          <div className="preview-body" dangerouslySetInnerHTML={{ __html: pageHtml }} />

          {/* Bottom page number */}
          <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center", fontSize: 11, color: "#94a3b8", fontFamily: "Georgia,serif", userSelect: "none" }}>
            — {idx + 1} —
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// EditorPage — single A4 page in the editor (Lexical instance)
// ═══════════════════════════════════════════════════════════
function EditorPage({
  pageNum, totalPages, initialHtml, pageStyle,
  isActive, onFocus, onHtmlChange, onAddPage,
}) {
  const { ref: activeEditorRef } = useContext(ActiveEditorCtx);
  const id = useRef(`page_${pageNum}_${Date.now()}`).current;
  const writableHeight = A4_HEIGHT_PX - pageStyle.marginTop - pageStyle.marginBottom - 40;

  const handleChange = useCallback((editorState, editor) => {
    editor.read(() => {
      const html = cleanHtml($generateHtmlFromNodes(editor, null));
      onHtmlChange(pageNum - 1, html);
    });
  }, [onHtmlChange, pageNum]);

  const handleFocus = useCallback((editor) => {
    activeEditorRef.current = editor;
    onFocus(pageNum - 1);
  }, [activeEditorRef, onFocus, pageNum]);

  const pageBorder = pageStyle.border === "none"
    ? "1px solid #c8cdd5"
    : `${pageStyle.borderWidth}px ${pageStyle.border} ${pageStyle.borderColor}`;

  return (
    <div style={{
      width: A4_WIDTH_PX,
      minHeight: A4_HEIGHT_PX,
      background: "#fff",
      margin: "0 auto 32px",
      position: "relative",
      boxShadow: isActive ? "0 0 0 2px #3b82f6, 0 4px 24px rgba(0,0,0,.18)" : "0 2px 12px rgba(0,0,0,.13)",
      border: pageBorder,
      boxSizing: "border-box",
      transition: "box-shadow .15s",
      borderRadius: 2,
    }}>
      <div style={{ position: "absolute", top: 8, right: 12, fontSize: 11, color: "#94a3b8", fontFamily: "Georgia,serif", userSelect: "none", pointerEvents: "none" }}>
        Page {pageNum} / {totalPages}
      </div>

      <LexicalComposer initialConfig={PAGE_EDITOR_CONFIG(id)}>
        <div style={{ paddingTop: pageStyle.marginTop, paddingBottom: pageStyle.marginBottom, paddingLeft: pageStyle.marginLeft, paddingRight: pageStyle.marginRight, minHeight: A4_HEIGHT_PX, boxSizing: "border-box" }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable style={{ outline: "none", minHeight: writableHeight, fontFamily: "Georgia, serif", fontSize: 16, lineHeight: 1.85, color: "#111827" }} />
            }
            placeholder={
              pageNum === 1 ? (
                <div style={{ position: "absolute", top: pageStyle.marginTop, left: pageStyle.marginLeft, color: "#9ca3af", pointerEvents: "none", fontFamily: "Georgia,serif", fontSize: 16 }}>
                  Start typing your document…
                </div>
              ) : null
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <TablePlugin />
          <ListPlugin />
          <ImagePlugin />
          <InitialHtmlPlugin html={initialHtml} />
          <OnChangePlugin onChange={handleChange} />
          <FocusRegistrar onFocus={handleFocus} />
          <ToolbarStateSync isActive={isActive} />
        </div>
      </LexicalComposer>

      <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center", fontSize: 11, color: "#94a3b8", fontFamily: "Georgia,serif", userSelect: "none", pointerEvents: "none" }}>
        — {pageNum} —
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// RichEditorPane — main export
// ═══════════════════════════════════════════════════════════
export function RichEditorPane({ editorContent, setEditorContent, showPreview, previewMeta }) {
  const [pageStyle, setPageStyle] = useState(DEFAULT_PAGE_STYLE);

  const [pages, setPages] = useState(() => {
    const text = editorContent;
    let html = "";
    if (!text) html = "<p></p>";
    else if (text.trim().startsWith("<")) html = text;
    else html = text.split("\n").map(l => `<p>${l || "<br/>"}</p>`).join("");
    return [{ id: Date.now(), html }];
  });

  const [activePageIdx, setActivePageIdx] = useState(0);
  const pageRefs = useRef([]);

  const activeEditorRef = useRef(null);
  const [toolbarState, setToolbarState] = useState({ isBold: false, isItalic: false, isUnderline: false, fontSize: "16px", fontFamily: "Georgia", blockType: "paragraph" });

  const handleHtmlChange = useCallback((idx, html) => {
    setPages(prev => { const next = [...prev]; next[idx] = { ...next[idx], html }; return next; });
  }, []);

  const lastEditorContentRef = useRef(editorContent || "");

  // Aggregate all pages into one HTML string for parent + preview
  const [aggregatedHtml, setAggregatedHtml] = useState(editorContent || "");
  useEffect(() => {
    const combined = pages.map(p => p.html).join("");
    setAggregatedHtml(combined);
    lastEditorContentRef.current = combined;
    setEditorContent(combined);
  }, [pages, setEditorContent]);

  // Sync parent's editorContent back to pages if parent gets diagrams loaded asynchronously
  useEffect(() => {
    if (editorContent && editorContent !== lastEditorContentRef.current) {
      setPages([{ id: Date.now(), html: editorContent }]);
      lastEditorContentRef.current = editorContent;
    }
  }, [editorContent]);

  const addPage = useCallback(() => {
    setPages(prev => [...prev, { id: Date.now(), html: "<p></p>" }]);
    setTimeout(() => {
      const idx = pages.length;
      const container = pageRefs.current[idx];
      if (container) container.querySelector('[contenteditable]')?.focus();
    }, 100);
  }, [pages.length]);

  // ── Editor area ──
  const editorArea = (
    <div style={{ height: "100%", overflowY: "auto", overflowX: "auto", background: "#d1d5db", padding: "28px 20px" }}>
      {pages.map((page, idx) => (
        <div key={page.id} ref={el => pageRefs.current[idx] = el}>
          <EditorPage
            pageNum={idx + 1}
            totalPages={pages.length}
            initialHtml={page.html}
            pageStyle={pageStyle}
            isActive={activePageIdx === idx}
            onFocus={setActivePageIdx}
            onHtmlChange={handleHtmlChange}
            onAddPage={addPage}
          />
        </div>
      ))}
      <div style={{ width: A4_WIDTH_PX, margin: "0 auto 40px", display: "flex", justifyContent: "center" }}>
        <button onClick={addPage} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 20px", borderRadius: 8,
          border: "1.5px dashed #9ca3af", background: "transparent",
          color: "#6b7280", cursor: "pointer", fontSize: 13, transition: "all .15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#3b82f6"; e.currentTarget.style.background = "#eff6ff"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#9ca3af"; e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.background = "transparent"; }}
        >
          <Plus size={14} /> Add Page
        </button>
      </div>
    </div>
  );

  const editorWithToolbar = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <SharedToolbar pageStyle={pageStyle} setPageStyle={setPageStyle} onAddPage={addPage} />
      <div style={{ flex: 1, overflow: "hidden" }}>{editorArea}</div>
    </div>
  );

  return (
    <ActiveEditorCtx.Provider value={{ ref: activeEditorRef, toolbarState, setToolbarState }}>
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)", overflow: "hidden" }}>
        {showPreview ? (
          <ResizableSplitPane
            left={editorWithToolbar}
            right={
              <PreviewPane
                html={aggregatedHtml}
                pageStyle={pageStyle}
                previewMeta={previewMeta}
              />
            }
            initialLeftPercent={55}
          />
        ) : (
          editorWithToolbar
        )}
      </div>

      <style>{`
        /* ── Editor text styles ── */
        .qp-h1 { font-size:1.5rem; font-weight:700; margin:1rem 0 .4rem; }
        .qp-h2 { font-size:1.2rem; font-weight:600; margin:.9rem 0 .3rem; }
        .qp-h3 { font-size:1rem;   font-weight:600; margin:.8rem 0 .3rem; }
        .qp-ul { padding-left:1.5rem; list-style:disc; }
        .qp-ol { padding-left:1.5rem; list-style:decimal; }
        .qp-table { border-collapse:collapse; width:100%; margin:16px 0; table-layout:fixed; }
        .qp-table td, .qp-table th { border:1px solid #cbd5e1; padding:8px 10px; min-width:80px; vertical-align:top; }
        .qp-table th { background:#f8fafc; font-weight:600; }
        .qp-bold      { font-weight:700; }
        .qp-italic    { font-style:italic; }
        .qp-underline { text-decoration:underline; }
        .qp-strike    { text-decoration:line-through; }

        /* ── Preview body content styles ── */
        .preview-body { font-family: Georgia, serif; font-size: 15px; line-height: 1.8; color: #111827; }
        .preview-body h1 {
          font-size: 17px; font-weight: 800; color: #1d4ed8;
          text-transform: uppercase; letter-spacing: 0.04em;
          text-align: center; margin: 18px 0 6px;
          border-bottom: 2px solid #bfdbfe; padding-bottom: 6px;
        }
        .preview-body h2 {
          font-size: 15px; font-weight: 700; color: #1e40af;
          text-transform: uppercase; letter-spacing: 0.03em;
          text-align: center; margin: 14px 0 5px;
        }
        .preview-body h3 {
          font-size: 14px; font-weight: 700; color: #1e3a8a;
          margin: 12px 0 4px;
        }
        .preview-body p  { margin: 0 0 9px; }
        .preview-body ul { margin: 10px 0; padding-left: 22px; list-style: disc; }
        .preview-body ol { margin: 10px 0; padding-left: 22px; list-style: decimal; }
        .preview-body li { margin-bottom: 6px; line-height: 1.7; }
        .preview-body li::before { content: none !important; }
        .preview-body table { width: 100%; border-collapse: collapse; margin: 14px 0; }
        .preview-body table th { background: #eff6ff; color: #1d4ed8; font-weight: 700; border: 1px solid #bfdbfe; padding: 8px 10px; text-align: left; }
        .preview-body table td { border: 1px solid #e2e8f0; padding: 7px 10px; }
        .preview-body img { max-width: 100%; display: block; margin: 14px auto; border-radius: 6px; border: 1px solid #e5e7eb; }
        .preview-body blockquote { border-left: 4px solid #bfdbfe; padding-left: 12px; color: #475569; margin: 12px 0; font-style: italic; }
        .preview-body pre  { background: #f8fafc; border: 1px solid #e5e7eb; padding: 12px; border-radius: 6px; overflow-x: auto; }
        .preview-body code { font-family: Consolas, monospace; font-size: 13px; }
        .preview-body strong { font-weight: 700; }
        .preview-body em { font-style: italic; }
      `}</style>
    </ActiveEditorCtx.Provider>
  );
}