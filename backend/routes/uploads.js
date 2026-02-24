import express from "express";
import multer from "multer";
import path from "path";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ Editor image upload
router.post(
  "/editor-image",
  authMiddleware,
  upload.single("image"),
  (req, res) => {
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  }
);

export default router;
