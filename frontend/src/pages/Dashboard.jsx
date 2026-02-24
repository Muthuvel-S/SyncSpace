// src/pages/Dashboard.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
    FiLogOut, FiCopy, FiAlertCircle,
    FiCheckCircle, FiArrowRight, FiInbox, FiUsers, FiTrash, FiEdit
} from 'react-icons/fi';
import Modal from "../components/Modal";

// --- Constants ---
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const BACKEND_BASE = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api', '')
    : 'http://localhost:5000';

// =================================================================================
// --- UI Components ---
// =================================================================================

const Header = ({ user, onLogout }) => (
    <header className="bg- backdrop-blur-md sticky top-0 z-50 border-4 border-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <Link to="/dashboard" className="flex items-center gap-2 group">
                    
                   <span className="text-3xl font-bold tracking-tight">
                   <span className="text-indigo-600">Sync</span>
                   <span className="text-black">Space</span>
                   </span> 
                   
                </Link>

                <div className="flex items-center gap-6">
                    <Link to="/profile" className="flex items-center gap-3 py-1 px-2 rounded-full hover:bg-slate-100 transition-all group">
                        <div className="text-right hidden sm:block">
                            
                        <p className="text-sm font-semibold text-slate-700 leading-none">{user?.username}</p>
                        </div>
                        <img
                            src={
                                user?.profilePicture
                                    ? user.profilePicture.includes("http")
                                        ? user.profilePicture
                                        : `${BACKEND_BASE}${user.profilePicture}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=6366f1&color=fff`
                            }
                            alt="Profile"
                            className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                    </Link>

                    <button
                        onClick={onLogout}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                        <FiLogOut size={20} />
                    </button>
                </div>
            </div>
        </div>
    </header>
);

const WorkspaceCard = ({ workspace, isAdmin, onCopyInvite, onUpdate, onDelete }) => {
    const inviteLink = `${window.location.origin}/join/${workspace._id}`;

    return (
        <div className="group relative bg-white border-2 border-slate-400 rounded-2xl p-5 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-indigo-50 transition-colors">
                    <FiInbox className="text-slate-400 group-hover:text-indigo-600" size={24} />
                </div>
                {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onUpdate(workspace)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                            <FiEdit size={16} />
                        </button>
                        <button onClick={() => onDelete(workspace)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <FiTrash size={16} />
                        </button>
                    </div>
                )}
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors truncate">
                {workspace.name}
            </h3>
            
            <div className="flex items-center gap-3 text-sm text-slate-500 mb-6">
                <span className="flex items-center gap-1.5">
                    <FiUsers className="text-slate-400" /> {workspace.memberCount} members
                </span>
            </div>

            <div className="flex items-center gap-2">
                <Link
                    to={`/workspace/${workspace._id}`}
                    className="flex-grow flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/10"
                >
                    Enter <FiArrowRight size={16} />
                </Link>
                {isAdmin && (
                    <button
                        onClick={() => onCopyInvite(inviteLink)}
                        className="p-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                        title="Copy Invite Link"
                    >
                        <FiCopy size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};

const ActionPanel = ({ onJoin, onAdminCreate, isAdmin }) => {
    const [inviteLink, setInviteLink] = useState("");
    const [workspaceName, setWorkspaceName] = useState("");

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Join Section */}
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-300 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Join Workspace</h3>
                    <p className="text-sm text-slate-500 mb-4">Enter an invite link to collaborate.</p>
                    <form onSubmit={(e) => { e.preventDefault(); onJoin(inviteLink); setInviteLink(""); }} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Paste invite link..."
                            value={inviteLink}
                            onChange={(e) => setInviteLink(e.target.value)}
                            className="flex-grow bg-slate-50 border-4 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                        <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
                            Join
                        </button>
                    </form>
                </div>
            </div>

            {/* Create Section (Only for Admins) */}
            {isAdmin ? (
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-300 shadow-sm relative overflow-hidden">
                    
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">New Workspace</h3>
                        <p className="text-sm text-slate-500 mb-4">Launch a new project space.</p>
                        <form onSubmit={(e) => { e.preventDefault(); onAdminCreate(workspaceName); setWorkspaceName(""); }} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Workspace Name..."
                                value={workspaceName}
                                onChange={(e) => setWorkspaceName(e.target.value)}
                                className="flex-grow bg-slate-50 border-4 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
                                Create
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-100 p-6 rounded-2xl border border-dashed border-slate-300 flex items-center justify-center text-center">
                    <p className="text-slate-500 text-sm italic">Contact an admin to create new workspaces.</p>
                </div>
            )}
        </div>
    );
};

// ... (WorkspaceGridSkeleton, EmptyState, and Toast remain largely the same, just updating classes)

const WorkspaceGridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 h-52 animate-pulse">
                <div className="flex justify-between mb-4">
                    <div className="h-10 w-10 bg-slate-100 rounded-xl"></div>
                    <div className="h-8 w-16 bg-slate-100 rounded-lg"></div>
                </div>
                <div className="h-6 bg-slate-100 rounded-lg w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-50 rounded-lg w-1/2 mb-6"></div>
                <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
            </div>
        ))}
    </div>
);

const EmptyState = () => (
    <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiInbox className="h-10 w-10 text-slate-300" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800">Your dashboard is quiet</h3>
        <p className="text-slate-500 mt-2 max-w-xs mx-auto">Create your first workspace or join an existing one to get started.</p>
    </div>
);

const Toast = ({ message, type, show }) => {
    if (!show) return null;
    return (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-2xl text-white font-semibold transition-all duration-500 animate-bounce-short
            ${type === 'success' ? 'bg-slate-900' : 'bg-red-600'}`}>
            {type === 'success' ? <FiCheckCircle className="text-green-400" size={20} /> : <FiAlertCircle size={20} />}
            <span>{message}</span>
        </div>
    );
};

// =================================================================================
// --- Main Dashboard Component ---
// =================================================================================

function Dashboard() {
    // Logic remains EXACTLY as provided
    const [workspaces, setWorkspaces] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
    const navigate = useNavigate();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [workspaceToDelete, setWorkspaceToDelete] = useState(null);

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [workspaceToUpdate, setWorkspaceToUpdate] = useState(null);
    const [newWorkspaceName, setNewWorkspaceName] = useState("");

    const fetchDashboardData = useCallback(async (token) => {
        try {
            const [userRes, workspacesRes] = await Promise.all([
                axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE}/workspaces/my`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setUser(userRes.data);
            setWorkspaces(workspacesRes.data);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            showToast("Session expired. Please log in again.");
            localStorage.removeItem("token");
            setTimeout(() => navigate("/login"), 2000);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        fetchDashboardData(token);
    }, [fetchDashboardData, navigate]);

    const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 3000);
    };

    const handleCreateWorkspace = async (workspaceName) => {
        const token = localStorage.getItem("token");
        if (!workspaceName.trim()) {
            showToast("Workspace name cannot be empty.");
            return;
        }
        try {
            const res = await axios.post(
                `${API_BASE}/workspaces/create`,
                { name: workspaceName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setWorkspaces(prev => [...prev, res.data.workspace]);
            showToast("Workspace created successfully!", "success");
        } catch (err) {
            showToast(err.response?.data?.msg || "Failed to create workspace.");
        }
    };

    const handleJoinByLink = async (inviteLink) => {
        const token = localStorage.getItem("token");
        if (!inviteLink.trim()) {
            showToast("Please paste a valid invite link.");
            return;
        }
        const inviteCode = inviteLink.split("/").pop();
        if (!inviteCode) {
            showToast("Invalid invite link format.");
            return;
        }
        try {
            const res = await axios.post(
                `${API_BASE}/workspaces/join/${inviteCode}`, {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!workspaces.some(ws => ws._id === res.data.workspace._id)) {
                setWorkspaces(prev => [...prev, res.data.workspace]);
            }
            showToast("Successfully joined workspace!", "success");
        } catch (err) {
            showToast(err.response?.data?.msg || "Failed to join workspace.");
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            showToast("Link copied to clipboard", "success");
        });
    };

    const openUpdateModal = (workspace) => {
        setWorkspaceToUpdate(workspace);
        setNewWorkspaceName(workspace.name);
        setIsUpdateModalOpen(true);
    };
    const closeUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setWorkspaceToUpdate(null);
        setNewWorkspaceName("");
    };
    const confirmUpdateWorkspace = async (e) => {
        e.preventDefault();
        if (!workspaceToUpdate || !newWorkspaceName.trim()) return;
        const token = localStorage.getItem("token");
        try {
            const res = await axios.put(
                `${API_BASE}/workspaces/${workspaceToUpdate._id}`,
                { name: newWorkspaceName.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setWorkspaces(prev => prev.map(ws =>
                ws._id === workspaceToUpdate._id ? { ...ws, name: res.data.name } : ws
            ));
            showToast("Name updated!", "success");
        } catch (err) {
            showToast("Failed to update.");
        } finally {
            closeUpdateModal();
        }
    };

    const openDeleteModal = (workspace) => {
        setWorkspaceToDelete(workspace);
        setIsDeleteModalOpen(true);
    };
    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setWorkspaceToDelete(null);
    };
    const confirmDeleteWorkspace = async () => {
        if (!workspaceToDelete) return;
        const token = localStorage.getItem("token");
        try {
            await axios.delete(
                `${API_BASE}/workspaces/${workspaceToDelete._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setWorkspaces(prev => prev.filter(ws => ws._id !== workspaceToDelete._id));
            showToast("Workspace removed", "success");
        } catch (err) {
            showToast("Delete failed");
        } finally {
            closeDeleteModal();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
            <Header user={user} onLogout={handleLogout} />
            <Toast message={toast.message} type={toast.type} show={toast.show} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                

                <ActionPanel
                    onJoin={handleJoinByLink}
                    onAdminCreate={handleCreateWorkspace}
                    isAdmin={user?.role === "admin"}
                />

                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            Your Workspaces
                        </h2>
                        <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {workspaces.length} Total
                        </span>
                    </div>

                    {loading ? (
                        <WorkspaceGridSkeleton />
                    ) : workspaces.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {workspaces.map((ws) => (
                                <WorkspaceCard
                                    key={ws._id}
                                    workspace={ws}
                                    isAdmin={user?.role === "admin"}
                                    onCopyInvite={copyToClipboard}
                                    onUpdate={openUpdateModal}
                                    onDelete={openDeleteModal}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Modals with updated button styles */}
            <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Delete Workspace">
                <div className="p-1">
                    <p className="text-slate-600 leading-relaxed">
                        Are you sure you want to delete <span className="font-bold text-slate-900">{workspaceToDelete?.name}</span>? 
                        This action is permanent and all associated data will be wiped.
                    </p>
                    <div className="flex justify-end gap-3 mt-8">
                        <button onClick={closeDeleteModal} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                        <button onClick={confirmDeleteWorkspace} className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all">Delete Workspace</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isUpdateModalOpen} onClose={closeUpdateModal} title="Rename Workspace">
                <form onSubmit={confirmUpdateWorkspace} className="p-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">New Name</label>
                    <input
                        type="text"
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-0 transition-all outline-none"
                        autoFocus
                    />
                    <div className="flex justify-end gap-3 mt-8">
                        <button type="button" onClick={closeUpdateModal} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">Save Changes</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default Dashboard;