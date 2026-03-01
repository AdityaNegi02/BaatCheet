const express = require("express");
const { upload } = require("../config/cloudinary");
const Message = require("../models/Message");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// @route POST /api/upload/file
router.post("/file", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { roomCode } = req.body;

    // Determine file type
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
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileType,
      messageType,
    });

    const populatedMessage = await message.populate("sender", "username avatar");

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;