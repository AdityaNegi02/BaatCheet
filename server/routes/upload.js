const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Message = require("../models/Message");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Use memory storage - files buffered in memory, then streamed to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/zip",
    "video/mp4",
    "audio/mpeg",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

// @route POST /api/upload/file
router.post("/file", protect, (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File too large. Max 10MB." });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { roomCode } = req.body;
      if (!roomCode) {
        return res.status(400).json({ message: "roomCode is required" });
      }

      // Determine resource type for Cloudinary
      let resourceType = "raw";
      if (req.file.mimetype.startsWith("image/")) resourceType = "image";
      else if (req.file.mimetype.startsWith("video/")) resourceType = "video";

      // Upload to Cloudinary via stream
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "baatcheet",
            resource_type: resourceType,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      // Determine message/file type
      let messageType = "file";
      let fileType = "document";
      if (req.file.mimetype.startsWith("image/")) {
        messageType = "image";
        fileType = "image";
      } else if (req.file.mimetype === "application/pdf") {
        fileType = "pdf";
      } else if (req.file.mimetype.includes("word")) {
        fileType = "doc";
      }

      // Save message to DB
      const message = await Message.create({
        roomCode,
        sender: req.user._id,
        content: "",
        fileUrl: result.secure_url,
        fileName: req.file.originalname,
        fileType,
        messageType,
      });

      const populatedMessage = await message.populate("sender", "username avatar");
      res.status(201).json(populatedMessage);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: error.message || "Upload failed" });
    }
  });
});

module.exports = router;