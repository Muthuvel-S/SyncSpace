import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  FiFileText,
  FiDownload,
  FiTrash2,
  FiEdit2,
  FiCheck,
  FiX,
  FiFolder,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function DocumentsList({ workspaceId, onDocumentSelect }) {
  const [documents, setDocuments] = useState([]);
  const [newDocumentTitle, setNewDocumentTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =========================
     FETCH DOCUMENTS
  ========================== */
  const fetchDocuments = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!workspaceId || !token) return;

    try {
      const res = await axios.get(
        `${API_BASE}/documents/workspace/${workspaceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDocuments(res.data);
    } catch {
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  /* =========================
     CREATE DOCUMENT
  ========================== */
  const handleCreateDocument = async () => {
    const token = localStorage.getItem("token");
    if (!newDocumentTitle.trim()) return;

    const res = await axios.post(
      `${API_BASE}/documents`,
      { title: newDocumentTitle, workspaceId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setDocuments((prev) => [...prev, res.data]);
    setNewDocumentTitle("");
  };

  /* =========================
     RENAME DOCUMENT
  ========================== */
  const handleRename = async (docId) => {
    const token = localStorage.getItem("token");

    await axios.put(
      `${API_BASE}/documents/${docId}/rename`,
      { title: editTitle },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setDocuments((prev) =>
      prev.map((doc) =>
        doc._id === docId ? { ...doc, title: editTitle } : doc
      )
    );

    setEditingId(null);
    setEditTitle("");
  };

  /* =========================
     DELETE DOCUMENT
  ========================== */
  const handleDelete = async (docId) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Delete this document?")) return;

    await axios.delete(`${API_BASE}/documents/${docId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setDocuments((prev) => prev.filter((doc) => doc._id !== docId));
  };

  /* =========================
     DOWNLOAD PDF
  ========================== */
  const handleDownload = async (docId, title) => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get(
        `${API_BASE}/documents/${docId}/download/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${title}.pdf`; // ✅ IMPORTANT
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed", err);
    }
  };

  /* =========================
     UI STATES
  ========================== */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <FiLoader className="animate-spin text-4xl text-gray-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center">
        <FiAlertCircle className="text-2xl mr-3" />
        {error}
      </div>
    );
  }

  /* =========================
     UI
  ========================== */
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center">Documents</h2>

      {/* CREATE */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newDocumentTitle}
            onChange={(e) => setNewDocumentTitle(e.target.value)}
            placeholder="Document title"
            className="flex-1 border px-4 py-2 rounded-lg"
          />
          <button
            onClick={handleCreateDocument}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Create
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="bg-white p-6 rounded-lg border">
        {documents.length === 0 ? (
          <div className="text-center text-gray-500">
            <FiFolder className="mx-auto text-5xl mb-2" />
            No documents created
          </div>
        ) : (
          <ul className="space-y-3">
            {documents.map((doc) => (
              <li
                key={doc._id}
                className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <FiFileText className="text-gray-800 text-2xl" />

                  {editingId === doc._id ? (
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="border px-2 py-1 rounded"
                    />
                  ) : (
                    <button
                      onClick={() => onDocumentSelect(doc._id)}
                      className="font-semibold hover:underline text-left"
                    >
                      {doc.title}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xl text-black">
                  {editingId === doc._id ? (
                    <>
                      <button onClick={() => handleRename(doc._id)}>
                        <FiCheck />
                      </button>
                      <button onClick={() => setEditingId(null)}>
                        <FiX />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleDownload(doc._id, doc.title)}
                        title="Download PDF"
                      >
                        <FiDownload />
                      </button>

                      <button
                        onClick={() => {
                          setEditingId(doc._id);
                          setEditTitle(doc.title);
                        }}
                        title="Rename"
                      >
                        <FiEdit2 />
                      </button>

                      <button
                        onClick={() => handleDelete(doc._id)}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default DocumentsList;
