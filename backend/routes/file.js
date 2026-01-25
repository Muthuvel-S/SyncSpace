import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import File from "../models/File.js";
import Workspace from "../models/Workspace.js";
import authMiddleware from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, path.resolve(__dirname, "../uploads/files/"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// ✅ Upload a new file to a workspace
router.post(
  "/upload/:workspaceId",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      const { workspaceId } = req.params;

      if (!req.file) {
        return res.status(400).json({ msg: "No file uploaded" });
      }

      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ msg: "Workspace not found." });
      }

      if (!workspace.members.some((m) => m._id.equals(req.user.id))) {
        return res.status(403).json({
          msg: "Access denied. You are not a member of this workspace.",
        });
      }

      const newFile = new File({
        name: req.file.originalname,
        path: `/uploads/files/${req.file.filename}`,
        size: req.file.size,
        workspace: workspaceId,
        uploader: req.user.id,
        contentType: req.file.mimetype,
      });

      await newFile.save();

      res
        .status(201)
        .json({ msg: "File uploaded successfully", file: newFile });
    } catch (err) {
      console.error("Error during file upload:", err);
      res.status(500).json({ msg: "Server error during file upload." });
    }
  }
);

// ✅ Get all files for a workspace
router.get("/:workspaceId", authMiddleware, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const files = await File.find({ workspace: workspaceId }).populate(
      "uploader",
      "name email"
    );
    res.json(files);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Download a file
router.get("/download/:fileId", authMiddleware, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ msg: "File not found" });
    }

    const filePath = path.join(__dirname, "..", file.path);
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ msg: "Physical file not found on server" });
    }

    res.download(filePath, file.name);
  } catch (err) {
    console.error("Error in download route:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Delete a file
router.delete("/:fileId", authMiddleware, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ msg: "File not found" });
    }

    if (file.uploader.toString() !== req.user.id) {
      return res.status(403).json({
        msg: "Access denied. You can only delete your own files.",
      });
    }

    await File.findByIdAndDelete(req.params.fileId);

    const filePath = path.join(__dirname, "..", file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ msg: "File deleted successfully" });
  } catch (err) {
    console.error("Error deleting file:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
