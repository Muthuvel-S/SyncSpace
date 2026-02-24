import express from "express";
import mongoose from "mongoose";
import Task from "../models/Task.js";
import authMiddleware from "../middleware/auth.js";
import sendEmail from "../utils/sendEmail.js";
import taskAssignedEmail from "../utils/taskAssignedEmail.js";

const createRouter = (io) => {
  const router = express.Router();

  // =====================================
  // ✅ CREATE TASK + EMAIL NOTIFICATION
  // =====================================
  router.post("/", authMiddleware, async (req, res) => {
    try {
      const { title, description, workspaceId, assignedTo } = req.body;

      // Validate workspace ID
      if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).json({ msg: "Invalid workspace ID" });
      }

      // Create task
      const task = new Task({
        title,
        description,
        workspace: workspaceId,
        assignedTo,
        createdBy: req.user.id,
      });

      await task.save();

      // Populate required fields (IMPORTANT)
      await task.populate([
        { path: "assignedTo", select: "name email" },
        { path: "createdBy", select: "name email" },
        { path: "workspace", select: "name" },
      ]);

      // 🔔 SEND BEAUTIFUL EMAIL TO ASSIGNED USERS
      if (assignedTo && assignedTo.length > 0) {
        for (const user of task.assignedTo) {
          if (!user.email) continue;

          sendEmail({
            to: user.email,
            subject: "📌 New Task Assigned | SyncSpace",
            html: taskAssignedEmail({
              userName: user.name || "Team Member",
              taskTitle: task.title,
              workspaceName: task.workspace?.name || "Your Workspace",
            }),
          }).catch((err) =>
            console.error("❌ Email send failed:", err.message)
          );
        }
      }

      // 🔁 SOCKET EVENT
      io.to(workspaceId).emit("task_created", task);

      res.status(201).json(task);
    } catch (err) {
      console.error("❌ Create task error:", err);
      res.status(500).json({ msg: err.message });
    }
  });

  // =====================================
  // ✅ GET TASKS BY WORKSPACE
  // =====================================
  router.get("/:workspaceId", authMiddleware, async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.workspaceId)) {
        return res.status(400).json({ msg: "Invalid workspace ID" });
      }

      const tasks = await Task.find({ workspace: req.params.workspaceId })
        .populate("assignedTo createdBy workspace", "name email")
        .sort({ createdAt: -1 });

      res.json(tasks);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  });

  // =====================================
  // ✅ UPDATE TASK
  // =====================================
  router.put("/:taskId", authMiddleware, async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.taskId)) {
        return res.status(400).json({ msg: "Invalid task ID" });
      }

      const updatedTask = await Task.findByIdAndUpdate(
        req.params.taskId,
        req.body,
        { new: true }
      ).populate("assignedTo createdBy workspace", "name email");

      if (!updatedTask) {
        return res.status(404).json({ msg: "Task not found" });
      }

      io.to(updatedTask.workspace._id.toString()).emit(
        "task_updated",
        updatedTask
      );

      res.json(updatedTask);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  });

  // =====================================
  // ✅ DELETE TASK
  // =====================================
  router.delete("/:taskId", authMiddleware, async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.taskId)) {
        return res.status(400).json({ msg: "Invalid task ID" });
      }

      const task = await Task.findByIdAndDelete(req.params.taskId);

      if (!task) {
        return res.status(404).json({ msg: "Task not found" });
      }

      io.to(task.workspace.toString()).emit("task_deleted", task._id);

      res.json({ msg: "Task deleted successfully" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  });

  return router;
};

export default createRouter;
