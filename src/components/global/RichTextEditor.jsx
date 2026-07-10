"use client";

import { useEffect, useRef, useCallback } from "react";
import "quill/dist/quill.snow.css";
import { MdFormatBold, MdFormatItalic } from "react-icons/md";
import { GrUnderline } from "react-icons/gr";
import { MdStrikethroughS } from "react-icons/md";
import { MdFormatListBulleted, MdFormatListNumbered } from "react-icons/md";
import {
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdFormatAlignJustify,
} from "react-icons/md";
import { MdLink } from "react-icons/md";

const RichTextEditor = ({ onChange, value = "", initialContent = "" }) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const handleChange = useCallback(onChange, [onChange]);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    const initQuill = async () => {
      // Dynamically import Quill to ensure SSR-safety in Next.js
      const { default: Quill } = await import("quill");

      // Initialize Quill editor
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: false, // Disable default toolbar; we'll create custom one
        },
        placeholder: "Add additional details about your event...",
      });

      // Set initial content (supports both HTML string or JSON-serialized Delta)
      const initialVal = value || initialContent;
      if (initialVal) {
        try {
          if (initialVal.trim().startsWith("{")) {
            quillRef.current.setContents(JSON.parse(initialVal));
          } else {
            quillRef.current.root.innerHTML = initialVal;
          }
        } catch {
          quillRef.current.root.innerHTML = initialVal;
        }
      }

      // Listen for changes and propagate HTML content back
      quillRef.current.on("text-change", () => {
        const html = quillRef.current.root.innerHTML;
        // If empty editor contains only default empty tags, return empty string
        const cleanHtml = html === "<p><br></p>" ? "" : html;
        handleChange(cleanHtml);
      });
    };

    initQuill();

    return () => {
      if (quillRef.current) {
        quillRef.current.off("text-change");
      }
    };
  }, [handleChange, value, initialContent]);

  // Toolbar action handlers
  const applyFormat = (format, value = true) => {
    if (!quillRef.current) return;
    const range = quillRef.current.getSelection();
    if (range) {
      quillRef.current.formatText(range.index, range.length, format, value);
    }
  };

  const insertLink = () => {
    if (!quillRef.current) return;
    const range = quillRef.current.getSelection();
    if (range) {
      const url = prompt("Enter URL:");
      if (url) {
        quillRef.current.formatText(range.index, range.length, "link", url);
      }
    }
  };

  const formatList = (type) => {
    if (!quillRef.current) return;
    const range = quillRef.current.getSelection();
    if (range) {
      if (type === "bullet") {
        quillRef.current.formatLine(
          range.index,
          range.length,
          "list",
          "bullet"
        );
      } else if (type === "ordered") {
        quillRef.current.formatLine(
          range.index,
          range.length,
          "list",
          "ordered"
        );
      }
    }
  };

  const formatAlignment = (align) => {
    if (!quillRef.current) return;
    const range = quillRef.current.getSelection();
    if (range) {
      quillRef.current.formatLine(range.index, range.length, "align", align);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[16px] font-bold text-[#333333] mb-2">
          Additional Information{" "}
          <span className="text-[13px] font-normal text-[#999999]">(Optional)</span>
        </h3>
        <p className="text-[13px] text-[#666666] mb-4">
          Optionally provide additional details about your event. The message
          will appear next to your invitation.
        </p>
      </div>

      {/* Custom Toolbar */}
      <div className="bg-[#E8E8E8] rounded-t-lg p-3 flex items-center gap-2 flex-wrap">
        {/* Bold */}
        <button
          type="button"
          onClick={() => applyFormat("bold")}
          className="p-2 hover:bg-[#D0D0D0] rounded transition cursor-pointer"
          title="Bold"
        >
          <MdFormatBold className="text-[18px] text-[#333333]" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => applyFormat("italic")}
          className="p-2 hover:bg-[#D0D0D0] rounded transition cursor-pointer"
          title="Italic"
        >
          <MdFormatItalic className="text-[18px] text-[#333333]" />
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => applyFormat("underline")}
          className="p-2 hover:bg-[#D0D0D0] rounded transition cursor-pointer"
          title="Underline"
        >
          <GrUnderline className="text-[16px] text-[#333333]" />
        </button>

        {/* Strikethrough */}
        <button
          type="button"
          onClick={() => applyFormat("strike")}
          className="p-2 hover:bg-[#D0D0D0] rounded transition cursor-pointer"
          title="Strikethrough"
        >
          <MdStrikethroughS className="text-[18px] text-[#333333]" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-[#CCCCCC] mx-1"></div>

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => formatList("bullet")}
          className="p-2 hover:bg-[#D0D0D0] rounded transition cursor-pointer"
          title="Bullet List"
        >
          <MdFormatListBulleted className="text-[18px] text-[#333333]" />
        </button>

        {/* Ordered List */}
        <button
          type="button"
          onClick={() => formatList("ordered")}
          className="p-2 hover:bg-[#D0D0D0] rounded transition cursor-pointer"
          title="Ordered List"
        >
          <MdFormatListNumbered className="text-[18px] text-[#333333]" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-[#CCCCCC] mx-1"></div>

        {/* Alignment Buttons */}
        <button
          type="button"
          onClick={() => formatAlignment("left")}
          className="p-2 hover:bg-[#D0D0D0] rounded transition cursor-pointer"
          title="Align Left"
        >
          <MdFormatAlignLeft className="text-[18px] text-[#333333]" />
        </button>

        <button
          type="button"
          onClick={() => formatAlignment("center")}
          className="p-2 hover:bg-[#D0D0D0] rounded transition cursor-pointer"
          title="Align Center"
        >
          <MdFormatAlignCenter className="text-[18px] text-[#333333]" />
        </button>

        <button
          type="button"
          onClick={() => formatAlignment("right")}
          className="p-2 hover:bg-[#D0D0D0] rounded transition cursor-pointer"
          title="Align Right"
        >
          <MdFormatAlignRight className="text-[18px] text-[#333333]" />
        </button>

        <button
          type="button"
          onClick={() => formatAlignment("justify")}
          className="p-2 hover:bg-[#D0D0D0] rounded transition cursor-pointer"
          title="Justify"
        >
          <MdFormatAlignJustify className="text-[18px] text-[#333333]" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-[#CCCCCC] mx-1"></div>

        {/* Link Button */}
        <button
          type="button"
          onClick={insertLink}
          className="p-2 hover:bg-[#D0D0D0] rounded transition cursor-pointer"
          title="Insert Link"
        >
          <MdLink className="text-[18px] text-[#333333]" />
        </button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        className="bg-white border-2 border-t-0 border-[#E8E8E8] rounded-b-lg p-4 min-h-[300px] focus-visible:outline-none"
        style={{
          fontSize: "14px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      />
    </div>
  );
};

export default RichTextEditor;
