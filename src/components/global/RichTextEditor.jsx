"use client"; // This is a client-side component for Next.js

import React, { useRef, useState } from "react";

const RichTextEditor = ({ initialContent = "", onChange }) => {
  const editorRef = useRef(null);
  const [content, setContent] = useState(initialContent);

  const handleExecCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const handleLink = () => {
    const url = prompt("Enter the URL:");
    if (url) {
      handleExecCommand("createLink", url);
    }
  };

  const updateContent = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      if (onChange) {
        onChange(newContent);
      }
    }
  };

  return (
    <div>
      <div className="toolbar" style={{ marginBottom: "10px" }}>
        <button onClick={() => handleExecCommand("bold")}>
          <b>B</b>
        </button>
        <button onClick={() => handleExecCommand("italic")}>
          <i>I</i>
        </button>
        <button onClick={() => handleExecCommand("underline")}>
          <u>U</u>
        </button>
        <button onClick={() => handleExecCommand("formatBlock", "blockquote")}>
          Quote
        </button>
        <button onClick={() => handleExecCommand("insertOrderedList")}>
          OL
        </button>
        <button onClick={() => handleExecCommand("insertUnorderedList")}>
          UL
        </button>
        <button onClick={handleLink}>Link</button>
      </div>
      <div
        ref={editorRef}
        contentEditable={true}
        onInput={updateContent}
        style={{
          border: "1px solid #ccc",
          minHeight: "200px",
          padding: "10px",
          outline: "none",
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default RichTextEditor;
