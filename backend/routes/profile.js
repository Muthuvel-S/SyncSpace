import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Cloudinary storage (NO local files)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "syncspace_profiles",
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: (req) => `profile_${req.user.id}`, // overwrite same image
  },
});

const upload = multer({ storage });

// ✅ Upload profile image
router.post(
  "/upload",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: "No file uploaded" });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // ✅ SAVE TO CORRECT FIELD
      user.profilePicture = req.file.path; // Cloudinary URL
      await user.save();

      res.json({
        msg: "Profile image uploaded successfully",
        profilePicture: user.profilePicture,
      });
    } catch (err) {
      console.error("Profile upload error:", err);
      res.status(500).json({ msg: "Profile image upload failed" });
    }
  }
);

export default router;
