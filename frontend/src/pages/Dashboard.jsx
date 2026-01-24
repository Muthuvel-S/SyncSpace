// src/pages/Dashboard.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  FiLogOut, FiCopy, FiAlertCircle,
  FiCheckCircle, FiArrowRight, FiInbox, FiUsers, FiTrash, FiEdit
} from "react-icons/fi";
import Modal from "../components/Modal";

// --- Constants ---
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const BACKEND_BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace("/api", "")
  : "http://localhost:5000";

/* =================================================================================
   HEADER
================================================================================= */
const Header = ({ user, onLogout }) => (
  <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <Link to="/dashboard" className="text-2xl font-extrabold tracking-tight">
        <span className="text-indigo-600">Sync</span>
        <span className="text-white">Space</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/profile" className="flex items-center gap-3 group">
          <span className="hidden sm:block text-sm text-slate-300 group-hover:text-white transition">
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

/* =================================================================================
   WORKSPACE CARD
================================================================================= */
const WorkspaceCard = ({ workspace, isAdmin, onCopyInvite, onUpdate, onDelete }) => {
  const inviteLink = `${window.location.origin}/join/${workspace._id}`;

  return (
    <div className="relative bg-slate-900/70 border border-white/10 rounded-2xl p-6
                    hover:border-indigo-500/40 hover:shadow-indigo-500/20 hover:shadow-xl
                    transition-all duration-300">
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
            <button onClick={() => onUpdate(workspace)} className="text-slate-400 hover:text-blue-400">
              <FiEdit />
            </button>
            <button onClick={() => onDelete(workspace)} className="text-slate-400 hover:text-red-400">
              <FiTrash />
            </button>
            <button
              onClick={() => onCopyInvite(inviteLink)}
              className="px-3 py-1 text-xs rounded-md bg-white/10 text-slate-200 hover:bg-white/20"
            >
              <FiCopy />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* =================================================================================
   ACTION PANEL
================================================================================= */
const ActionPanel = ({ onJoin, onAdminCreate, isAdmin }) => {
  const [inviteLink, setInviteLink] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");

  return (
    <section className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 mb-10">
      <div className={`grid gap-6 ${isAdmin ? "md:grid-cols-2" : ""}`}>
        <div>
          <label className="text-sm text-slate-400">Join Workspace</label>
          <div className="flex gap-2 mt-2">
            <input
              value={inviteLink}
              onChange={(e) => setInviteLink(e.target.value)}
              placeholder="Invite link"
              className="flex-1 bg-slate-800 text-white border border-white/10 rounded-lg px-4 py-2"
            />
            <button
              onClick={() => onJoin(inviteLink)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white"
            >
              Join
            </button>
          </div>
        </div>

        {isAdmin && (
          <div>
            <label className="text-sm text-slate-400">Create Workspace</label>
            <div className="flex gap-2 mt-2">
              <input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Workspace name"
                className="flex-1 bg-slate-800 text-white border border-white/10 rounded-lg px-4 py-2"
              />
              <button
                onClick={() => onAdminCreate(workspaceName)}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white"
              >
                Create
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/* =================================================================================
   EMPTY STATE
================================================================================= */
const EmptyState = () => (
  <div className="text-center py-20 border border-dashed border-white/20 rounded-xl bg-slate-900/60">
    <FiInbox className="mx-auto text-4xl text-slate-500" />
    <h3 className="mt-4 text-xl font-semibold text-white">No Workspaces</h3>
    <p className="text-slate-400 mt-1">Create or join a workspace to get started</p>
  </div>
);

/* =================================================================================
   DASHBOARD
================================================================================= */
function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async (token) => {
    try {
      const [u, w] = await Promise.all([
        axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/workspaces/my`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUser(u.data);
      setWorkspaces(w.data);
    } catch {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    else fetchDashboardData(token);
  }, [fetchDashboardData, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <Header user={user} onLogout={() => { localStorage.removeItem("token"); navigate("/login"); }} />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <ActionPanel
          onJoin={() => {}}
          onAdminCreate={() => {}}
          isAdmin={user?.role === "admin"}
        />

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
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;

