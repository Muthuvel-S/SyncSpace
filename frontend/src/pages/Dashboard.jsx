import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  FiLogOut,
  FiCopy,
  FiArrowRight,
  FiInbox,
  FiUsers,
  FiTrash,
  FiEdit,
  FiAlertCircle,
  FiCheckCircle
} from "react-icons/fi";
import Modal from "../components/Modal";

/* ================= CONSTANTS ================= */
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const BACKEND_BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace("/api", "")
  : "http://localhost:5000";

/* ================= HEADER ================= */
const Header = ({ user, onLogout }) => (
  <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <Link to="/dashboard" className="text-2xl font-extrabold tracking-tight">
        <span className="text-indigo-600">Sync</span>
        <span className="text-white">Space</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/profile" className="flex items-center gap-3 group">
          <span className="hidden sm:block text-sm text-slate-300">
            {user?.username}
          </span>
          <img
            src={
              user?.profilePicture
                ? `${BACKEND_BASE}${user.profilePicture}`
                : `https://ui-avatars.com/api/?name=${user?.name || "U"}`
            }
            className="w-10 h-10 rounded-full ring-2 ring-indigo-500/40"
            alt="profile"
          />
        </Link>

        <button
          onClick={onLogout}
          className="p-2 rounded-full text-slate-400 hover:text-red-400 hover:bg-white/10 transition"
        >
          <FiLogOut />
        </button>
      </div>
    </div>
  </header>
);

/* ================= TOAST ================= */
const Toast = ({ show, message, type }) => {
  if (!show) return null;

  return (
    <div
      className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-xl text-white flex items-center gap-2
        ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
    >
      {type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
      {message}
    </div>
  );
};

/* ================= WORKSPACE CARD ================= */
const WorkspaceCard = ({ workspace, isAdmin, onCopyInvite, onUpdate, onDelete }) => {
  const inviteLink = `${window.location.origin}/join/${workspace._id}`;

  return (
    <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/40 transition">
      <h3 className="text-xl font-semibold text-white mb-2">
        {workspace.name}
      </h3>

      <p className="flex items-center gap-2 text-slate-400 text-sm">
        <FiUsers className="text-indigo-400" />
        {workspace.memberCount} Members
      </p>

      <div className="mt-6 flex justify-between items-center">
        <Link
          to={`/workspace/${workspace._id}`}
          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          Open <FiArrowRight />
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <button onClick={() => onUpdate(workspace)} className="hover:text-blue-400">
              <FiEdit />
            </button>
            <button onClick={() => onDelete(workspace)} className="hover:text-red-400">
              <FiTrash />
            </button>
            <button
              onClick={() => onCopyInvite(inviteLink)}
              className="px-2 py-1 text-xs rounded bg-white/10"
            >
              <FiCopy />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= EMPTY STATE ================= */
const EmptyState = () => (
  <div className="text-center py-20 border border-dashed border-white/20 rounded-xl bg-slate-900/60">
    <FiInbox className="mx-auto text-4xl text-slate-500" />
    <h3 className="mt-4 text-xl font-semibold text-white">No Workspaces</h3>
    <p className="text-slate-400 mt-1">
      Create or join a workspace to get started
    </p>
  </div>
);

/* ================= DASHBOARD ================= */
function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });

  const navigate = useNavigate();

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type }), 3000);
  };

  const fetchData = useCallback(async (token) => {
    try {
      const [u, w] = await Promise.all([
        axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/workspaces/my`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUser(u.data);
      setWorkspaces(w.data);
    } catch {
      showToast("Session expired");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    else fetchData(token);
  }, [fetchData, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <Header user={user} onLogout={() => { localStorage.removeItem("token"); navigate("/login"); }} />
      <Toast {...toast} />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-6">Your Workspaces</h2>

        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : workspaces.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map(ws => (
              <WorkspaceCard
                key={ws._id}
                workspace={ws}
                isAdmin={user?.role === "admin"}
                onCopyInvite={() => showToast("Invite copied", "success")}
                onUpdate={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;


