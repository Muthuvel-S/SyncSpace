import express from "express";
import mongoose from "mongoose";
import Task from "../models/Task.js";
import authMiddleware from "../middleware/auth.js";
import User from "../models/User.js";

const createRouter = (io) => {
  const router = express.Router();

  // ✅ Create a new task
  router.post("/", authMiddleware, async (req, res) => {
    try {
      const { title, description, workspaceId, assignedTo } = req.body;

      const task = new Task({
        title,
        description,
        workspace: workspaceId,
        assignedTo,
        createdBy: req.user.id,
      });

      await task.save();

      await task.populate("assignedTo createdBy", "name email");
      io.to(workspaceId).emit("task_created", task);

      res.status(201).json(task);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  });

  // ✅ Get all tasks for a workspace
  router.get("/:workspaceId", authMiddleware, async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.workspaceId)) {
        return res.status(400).json({ msg: "Invalid workspace ID" });
      }

      const tasks = await Task.find({ workspace: req.params.workspaceId })
        .populate("assignedTo createdBy", "name email");

      res.json(tasks);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  });

  // ✅ Update a task
  router.put("/:taskId", authMiddleware, async (req, res) => {
    try {
      const updatedTask = await Task.findByIdAndUpdate(
        req.params.taskId,
        req.body,
        { new: true }
      );

      if (!updatedTask) {
        return res.status(404).json({ msg: "Task not found" });
      }

      await updatedTask.populate("assignedTo createdBy", "name email");
      io.to(updatedTask.workspace.toString()).emit(
        "task_updated",
        updatedTask
      );

      res.json(updatedTask);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  });

  // ✅ Delete a task
  router.delete("/:taskId", authMiddleware, async (req, res) => {
    try {
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
