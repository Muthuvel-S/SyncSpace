import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import io from "socket.io-client";
import axios from "axios";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const BACKEND_BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace("/api", "")
  : "http://localhost:5000";

const socket = io(BACKEND_BASE);

function DocumentEditor({ documentId }) {
  const [doc, setDoc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const quillRef = useRef(null);
  const saveTimeout = useRef(null);

  /* =============================
     IMAGE UPLOAD HANDLER
  ============================== */
  const imageHandler = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await axios.post(
          `${API_BASE}/uploads/editor-image`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const editor = quillRef.current.getEditor();
        const range = editor.getSelection(true);
        editor.insertEmbed(range.index, "image", res.data.imageUrl);
        editor.setSelection(range.index + 1);
      } catch (err) {
        alert("Image upload failed");
      }
    };
  };

  /* =============================
     QUILL CONFIG (SINGLE TOOLBAR)
  ============================== */
  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ font: [] }],
          [{ header: [1, 2, 3, false] }],
          [{ size: ["small", false, "large", "huge"] }],

          ["bold", "italic", "underline", "strike"],
          ["blockquote", "code-block"],

          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],

          [{ align: [] }],
          [{ color: [] }, { background: [] }],

          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      history: {
        delay: 1000,
        maxStack: 100,
        userOnly: true,
      },
    }),
    []
  );

  const quillFormats = [
    "font",
    "header",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "list",
    "bullet",
    "indent",
    "align",
    "color",
    "background",
    "link",
    "image",
  ];

  /* =============================
     FETCH DOCUMENT
  ============================== */
  useEffect(() => {
    const fetchDoc = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE}/documents/${documentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDoc(res.data);
    };

    fetchDoc();
  }, [documentId]);

  /* =============================
     SOCKET + AUTOSAVE
  ============================== */
  useEffect(() => {
    if (!doc || !quillRef.current) return;

    const editor = quillRef.current.getEditor();
    editor.setContents(doc.content || { ops: [] });

    socket.emit("join_document", documentId);

    const handleChange = () => {
      setSaving(true);

      const content = editor.getContents();
      socket.emit("document_change", { documentId, delta: content });

      clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        const token = localStorage.getItem("token");
        await axios.put(
          `${API_BASE}/documents/${documentId}`,
          { content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSaving(false);
        setLastSaved(new Date());
      }, 1000);
    };

    editor.on("text-change", handleChange);

    return () => {
      editor.off("text-change", handleChange);
      socket.emit("leave_document", documentId);
    };
  }, [doc, documentId]);

  if (!doc) return <p className="text-center">Loading document…</p>;

  /* =============================
     UI
  ============================== */
  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b">
        <h3 className="text-xl font-semibold truncate">{doc.title}</h3>
        <span className="text-sm text-gray-500">
          {saving
            ? "Saving…"
            : lastSaved
            ? `Saved ${lastSaved.toLocaleTimeString()}`
            : "All changes saved"}
        </span>
      </div>

      {/* EDITOR */}
      <div className="flex-1 overflow-y-auto flex justify-center py-6">
        <div className="w-full max-w-4xl bg-white shadow-sm rounded-lg border">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            modules={quillModules}
            formats={quillFormats}
            className="min-h-[70vh]"
          />
        </div>
      </div>
    </div>
  );
}

export default DocumentEditor;
