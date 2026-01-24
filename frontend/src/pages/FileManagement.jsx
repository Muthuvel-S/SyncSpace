import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  FiFile,
  FiFileText,
  FiImage,
  FiUploadCloud,
  FiDownload,
  FiTrash2,
  FiLoader,
  FiAlertCircle,
  FiFolder,
} from "react-icons/fi";
import { FaFilePdf, FaFileWord, FaFileExcel } from "react-icons/fa";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getFileTypeIcon = (fileName) => {
  const extension = fileName.split(".").pop().toLowerCase();
  switch (extension) {
    case "pdf":
      return <FaFilePdf className="text-red-500 text-2xl" />;
    case "doc":
    case "docx":
      return <FaFileWord className="text-blue-500 text-2xl" />;
    case "xls":
    case "xlsx":
      return <FaFileExcel className="text-green-500 text-2xl" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return <FiImage className="text-purple-500 text-2xl" />;
    case "txt":
      return <FiFileText className="text-gray-500 text-2xl" />;
    default:
      return <FiFile className="text-gray-500 text-2xl" />;
  }
};

function FileManagement({ workspaceId }) {
  const [files, setFiles] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const fetchFiles = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || !workspaceId) return;

    try {
      const res = await axios.get(`${API_BASE}/files/${workspaceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(res.data);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to load files.");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchFiles();
  }, [fetchCurrentUser, fetchFiles]);

  const handleFileChange = (e) => {
    setFileToUpload(e.target.files[0]);
  };

  const handleUpload = async () => {
    const token = localStorage.getItem("token");
    if (!fileToUpload || !token) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      await axios.post(`${API_BASE}/files/upload/${workspaceId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchFiles();
      setFileToUpload(null);
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${API_BASE}/files/download/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading file:", err);
    }
  };

  const handleDelete = async (fileId) => {
    const token = localStorage.getItem("token");
    if (!token || !window.confirm("Delete this file?")) return;

    try {
      await axios.delete(`${API_BASE}/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchFiles();
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <FiLoader className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center">
        <FiAlertCircle className="text-2xl mr-3" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center">Project Files</h2>

      <div className="bg-white p-6 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex-grow flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer">
            <FiUploadCloud className="mr-2" />
            {fileToUpload ? fileToUpload.name : "Choose file"}
            <input type="file" onChange={handleFileChange} className="hidden" />
          </label>
          <button
            onClick={handleUpload}
            disabled={!fileToUpload || uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        {files.length === 0 ? (
          <div className="text-center text-gray-500">
            <FiFolder className="mx-auto text-5xl mb-2" />
            No files uploaded
          </div>
        ) : (
          <ul className="space-y-3">
            {files.map((file) => (
              <li
                key={file._id}
                className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {getFileTypeIcon(file.name)}
                  <div>
                    <p className="font-semibold">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDownload(file._id, file.name)}>
                    <FiDownload />
                  </button>
                  {user && file.uploader._id === user._id && (
                    <button onClick={() => handleDelete(file._id)}>
                      <FiTrash2 />
                    </button>
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

export default FileManagement;
