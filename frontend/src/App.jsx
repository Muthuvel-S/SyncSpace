import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import JoinWorkspace from "./pages/JoinWorkspace";
import WorkspaceHub from "./pages/WorkspaceHub";
import Profile from "./pages/Profile";
import Welcome from "./pages/Welcome";

// ✅ Full Screen Maintenance Component
const Maintenance = () => {
  return (
    <div className="fixed inset-0 bg-black/80 text-white flex flex-col items-center justify-center z-50 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">
        🚧 Sorry for the inconvenience
      </h1>
      <p className="text-lg text-center max-w-md">
        The website is currently undergoing updates.  
        Please check back after some time.
      </p>
    </div>
  );
};

function App() {
  const token = localStorage.getItem("token");

  // 🔥 Enable/Disable maintenance mode here
  const maintenanceMode = false; // set to true to turn ON the block

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 relative">

        {/* 🔥 Full screen block always above all content */}
        {maintenanceMode && <Maintenance />}

        {/* 🔒 Routes still exist but are blocked visually */}
        <Routes>
          <Route
            path="/"
            element={token ? <Navigate to="/dashboard" replace /> : <Welcome />}
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/join/:token" element={<JoinWorkspace />} />
          <Route path="/workspace/:workspaceId" element={<WorkspaceHub />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
