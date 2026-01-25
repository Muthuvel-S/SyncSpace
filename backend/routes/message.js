import express from "express";
import mongoose from "mongoose";
import Message from "../models/Message.js";
import authMiddleware from "../middleware/auth.js";

const createRouter = (io) => {
  const router = express.Router();

  // ✅ Create a new message
  router.post("/", authMiddleware, async (req, res) => {
    try {
      const { content, workspaceId } = req.body;

      const newMessage = new Message({
        content,
        sender: req.user.id,
        workspace: workspaceId,
      });

      await newMessage.save();
      await newMessage.populate("sender", "name email profilePicture");

      io.to(workspaceId).emit("receive_message", newMessage);

      res.status(201).json(newMessage);
    } catch (err) {
      console.error("Error sending message:", err.message);
      res.status(500).json({ msg: "Server error" });
    }
  });

  // ✅ Get all messages for a specific workspace
  router.get("/:workspaceId", authMiddleware, async (req, res) => {
    try {
      const messages = await Message.find({
        workspace: req.params.workspaceId,
      })
        .populate("sender", "name email profilePicture")
        .sort({ createdAt: 1 });

      res.json(messages);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  });

  // ✅ Delete multiple messages
  router.delete("/", authMiddleware, async (req, res) => {
    try {
      const { messageIds, workspaceId } = req.body;

      if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
        return res.status(400).json({ msg: "Message IDs are required." });
      }

      const result = await Message.deleteMany({
        _id: { $in: messageIds },
        sender: req.user.id,
      });

      if (result.deletedCount > 0) {
        io.to(workspaceId).emit("messages_deleted", messageIds);
      }

      res.json({
        msg: `${result.deletedCount} messages deleted successfully.`,
      });
    } catch (err) {
      console.error("Error deleting messages:", err.message);
      res.status(500).json({ msg: "Server error" });
    }
  });

  // ✅ Delete a single message
  router.delete("/:messageId", authMiddleware, async (req, res) => {
    try {
      const message = await Message.findById(req.params.messageId);

      if (!message) {
        return res.status(404).json({ msg: "Message not found" });
      }

      if (message.sender.toString() !== req.user.id) {
        return res.status(403).json({ msg: "Access denied." });
      }

      await Message.findByIdAndDelete(req.params.messageId);
      io.to(message.workspace.toString()).emit(
        "message_deleted",
        req.params.messageId
      );

      res.json({ msg: "Message deleted successfully" });
    } catch (err) {
      console.error("Error deleting message:", err.message);
      res.status(500).json({ msg: "Server error" });
    }
  });

  return router;
};

export default createRouter;
