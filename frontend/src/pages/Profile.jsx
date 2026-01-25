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

  // =========================
  // FETCH USER
  // =========================
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
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate, userId, isCurrentUser]);

  // =========================
  // PROFILE IMAGE UPLOAD
  // =========================
  const handleUpload = async () => {
    const token = localStorage.getItem("token");
    if (!file || !token) return alert("Select an image first");

    setUploading(true);
    const formData = new FormData();

    // ✅ MUST MATCH BACKEND FIELD NAME
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

      // ✅ ALWAYS STORE profilePicture
      setUser((prev) => ({
        ...prev,
        profilePicture: res.data.imageUrl,
      }));

      alert("Profile image updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload profile image");
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // UPDATE TITLE
  // =========================
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
      alert("Title updated!");
    } catch (err) {
      alert("Failed to update title");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // =========================
  // UI STATES
  // =========================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-12 w-12 border-b-2 border-gray-900 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10 p-6 bg-red-100 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-8">
        <div className="flex justify-between mb-6">
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            ← Back
          </Link>
          {isCurrentUser && (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          )}
        </div>

        <div className="flex flex-col items-center mb-8">
          <img
            src={
              user?.profilePicture
                ? user.profilePicture.includes("http")
                  ? user.profilePicture
                  : user.profilePicture
                : "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg"
            }
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
          />

          <h3 className="mt-4 text-2xl font-semibold">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500">{user.role}</p>
          <p className="text-sm text-gray-500">
            {user.title || "No title set"}
          </p>
        </div>

        {isCurrentUser && (
          <>
            <div className="border-t pt-6">
              <h4 className="text-xl font-semibold mb-4">
                Update Profile Image
              </h4>

              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="mb-3"
              />

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>

            <div className="border-t pt-6 mt-6">
              <h4 className="text-xl font-semibold mb-4">
                Update Job Title
              </h4>

              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Frontend Developer"
                className="border px-3 py-2 rounded-lg w-full mb-3"
              />

              <button
                onClick={handleUpdateTitle}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Update
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;
