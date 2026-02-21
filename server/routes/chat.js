const express = require("express");
const Room = require("../models/Room");
const Message = require("../models/Message");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Generate random 6-character room code
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// @route POST /api/chat/create-room
router.post("/create-room", protect, async (req, res) => {
  try {
    const roomCode = generateRoomCode();

    const room = await Room.create({
      roomCode,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json({ roomCode: room.roomCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/chat/join-room
router.post("/join-room", protect, async (req, res) => {
  const { roomCode } = req.body;

  try {
    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Add user to members if not already there
    if (!room.members.includes(req.user._id)) {
      room.members.push(req.user._id);
      await room.save();
    }

    res.json({ roomCode: room.roomCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/chat/messages/:roomCode
router.get("/messages/:roomCode", protect, async (req, res) => {
  try {
    const messages = await Message.find({ roomCode: req.params.roomCode })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;