import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const isCurrentUser = !userId;

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const url = isCurrentUser
          ? `${API_BASE}/auth/me`
          : `${API_BASE}/auth/${userId}`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
      } catch {
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate, userId, isCurrentUser]);

  const handleUpload = async () => {
    const token = localStorage.getItem("token");
    if (!file || !token) return alert("Select an image first");

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(
        `${API_BASE}/profile/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser((prev) => ({
        ...prev,
        profilePicture: res.data.imageUrl,
      }));

      alert("Profile image updated");
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateTitle = async () => {
    const token = localStorage.getItem("token");
    if (!newTitle.trim()) return alert("Title cannot be empty");

    try {
      const res = await axios.put(
        `${API_BASE}/auth/me`,
        { title: newTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(res.data);
      setNewTitle("");
      alert("Title updated");
    } catch {
      alert("Failed to update title");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-12 w-12 border-b-2 border-gray-700 rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-600 px-4">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-6 sm:p-10">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-8 sm:mb-10">
          <Link to="/dashboard" className="text-blue-600 font-medium">
            ← Back
          </Link>

          {isCurrentUser && (
            <button
              onClick={handleLogout}
              className="text-red-600 font-medium"
            >
              Logout
            </button>
          )}
        </div>

        {/* PROFILE HEADER */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-10 mb-10 sm:mb-14 text-center md:text-left">
          <img
            src={
              user?.profilePicture
                ? user.profilePicture
                : "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg"
            }
            alt="Profile"
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border"
          />

          <div>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
              {user.name}
            </h2>
            <p className="text-lg sm:text-2xl text-gray-700 font-medium mb-1">
              {user.title || user.role}
            </p>
            <p className="text-gray-600 break-all">{user.email}</p>
          </div>
        </div>

        {/* SECTIONS */}
        {isCurrentUser && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            
            {/* PROFILE IMAGE */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
                Profile Image
              </h3>

              <label className="block text-sm font-medium mb-2">
                Upload new photo
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="flex-1 text-sm"
                />

                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>

            {/* PROFESSIONAL DETAILS */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
                Professional Details
              </h3>

              <label className="block text-sm font-medium mb-2">
                Job title
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                  className="flex-1 border px-4 py-3 rounded-lg"
                />

                <button
                  onClick={handleUpdateTitle}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
