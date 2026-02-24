import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

// Components
import KanbanBoard from "./KanbanBoard";
import ChatBox from "./ChatBox";
import FileManagement from "./FileManagement";
import DocumentsList from "./DocumentsList";
import DocumentEditor from "./DocumentEditor";

// Icons
import {
  FiLayout,
  FiMessageSquare,
  FiFileText,
  FiFolder,
  FiUsers,
  FiArrowLeft,
  FiChevronsLeft,
  FiVideo
} from "react-icons/fi";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const BACKEND_BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace("/api", "")
  : "http://localhost:5000";

const navItems = [
  {
    id: "kanban",
    label: "Kanban",
    fullLabel: "Kanban Board",
    icon: <FiLayout size={24} />,
    description: "Organize tasks and track progress."
  },
  {
    id: "chat",
    label: "Chat",
    fullLabel: "Team Chat",
    icon: <FiMessageSquare size={24} />,
    description: "Communicate with your team in real-time."
  },
  {
    id: "files",
    label: "Files",
    fullLabel: "Project Files",
    icon: <FiFolder size={24} />,
    description: "Manage and share important assets."
  },
  {
    id: "documents",
    label: "Docs",
    fullLabel: "Documents",
    icon: <FiFileText size={24} />,
    description: "Collaborate on shared documents."
  },
  {
    id: "members",
    label: "Members",
    fullLabel: "Team Members",
    icon: <FiUsers size={24} />,
    description: "View and manage workspace members."
  },
  {
    id: "meet",
    label: "Meet",
    fullLabel: "Meet",
    icon: <FiVideo size={24} />,
    description: "Start a video meeting."
  }
];

// Mobile Bottom Tab Bar
const BottomTabBar = ({ activeTab, handleTabClick }) => (
  <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t">
    <div className="flex justify-around items-center h-16">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => handleTabClick(item.id)}
          className={`flex flex-col items-center gap-1 text-xs font-medium w-full h-full ${
            activeTab === item.id ? "text-indigo-600" : "text-slate-500"
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  </nav>
);

function WorkspaceHub() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("kanban");
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  useEffect(() => {
    const fetchWorkspaceDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const [workspaceRes, userRes] = await Promise.all([
          axios.get(`${API_BASE}/workspaces/${workspaceId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setWorkspace(workspaceRes.data);
        setUser(userRes.data);
      } catch {
        setError("Failed to load workspace data.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceDetails();
  }, [workspaceId, navigate]);

 const handleTabClick = (tab) => {
  if (tab === "meet") {
    window.open(
      "https://mv-meet.vercel.app/",
      "_blank",
      "noopener,noreferrer"
    );
    return;
  }

  setActiveTab(tab);
  setSelectedDocumentId(null);
};

  const handleBackToDocs = () => setSelectedDocumentId(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-12 w-12 border-b-2 border-indigo-600 rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        {error}
      </div>
    );
  }

  const activeNavItem = navItems.find(
    (item) => item.id === activeTab
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-white flex-col border-r">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-lg font-bold">
            {workspace?.name?.charAt(0)}
          </div>
          <h1 className="font-bold truncate">{workspace?.name}</h1>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                activeTab === item.id
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.icon}
              {item.fullLabel}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <FiChevronsLeft />
            All Workspaces
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden relative flex items-center justify-center h-14 bg-white border-b">
          <button
            onClick={() => navigate("/dashboard")}
            className="absolute left-4 flex items-center gap-1 text-sm font-medium text-slate-700"
          >
            <FiChevronsLeft size={20} />
          </button>

          <span className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold truncate max-w-[60%] text-center">
            {workspace?.name}
          </span>
        </header>

        <header className="hidden lg:block px-6 py-4 bg-white border-b">
          <h2 className="text-2xl font-bold">
            {activeNavItem?.fullLabel}
          </h2>
          <p className="text-sm text-slate-500">
            {activeNavItem?.description}
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-20 lg:pb-8">
          {activeTab === "kanban" && (
            <KanbanBoard workspaceId={workspaceId} />
          )}
          {activeTab === "chat" && user && (
            <ChatBox workspaceId={workspaceId} user={user} />
          )}
          {activeTab === "files" && (
            <FileManagement workspaceId={workspaceId} />
          )}
          {activeTab === "documents" &&
            (selectedDocumentId ? (
              <>
                <button
                  onClick={handleBackToDocs}
                  className="flex items-center gap-2 mb-4 text-sm text-slate-600"
                >
                  <FiArrowLeft /> Back to documents
                </button>
                <DocumentEditor documentId={selectedDocumentId} />
              </>
            ) : (
              <DocumentsList
                workspaceId={workspaceId}
                onDocumentSelect={setSelectedDocumentId}
              />
            ))}

          {activeTab === "members" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspace?.members.map((member) => (
                <Link
                  to={`/profile/${member._id}`}
                  key={member._id}
                  className="bg-white p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        member.profilePicture
                          ? member.profilePicture.includes("http")
                            ? member.profilePicture
                            : `${BACKEND_BASE}${member.profilePicture}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              member.name || "U"
                            )}`
                      }
                      className="w-12 h-12 rounded-full object-cover"
                      alt=""
                    />
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-slate-500">
                        {member.role || "Member"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomTabBar
        activeTab={activeTab}
        handleTabClick={handleTabClick}
      />
    </div>
  );
}

export default WorkspaceHub;