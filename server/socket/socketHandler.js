const Message = require("../models/Message");
const User = require("../models/User");
const Room = require("../models/Room");
const jwt = require("jsonwebtoken");

// Store active room timers
const roomTimers = {};

// Start 10 min delete timer for a room
const startRoomTimer = (roomCode, io) => {
  // Clear existing timer if any
  if (roomTimers[roomCode]) {
    clearTimeout(roomTimers[roomCode]);
  }

  console.log(`Starting 10 min timer for room: ${roomCode}`);

  roomTimers[roomCode] = setTimeout(async () => {
    try {
      // Check if anyone is in the room
      const socketsInRoom = await io.in(roomCode).fetchSockets();

      if (socketsInRoom.length === 0) {
        // Delete messages and room from DB
        await Message.deleteMany({ roomCode });
        await Room.deleteOne({ roomCode });

        console.log(`Room ${roomCode} deleted due to inactivity`);

        // Notify anyone who might rejoin
        io.to(roomCode).emit("room_deleted", {
          message: "Room was deleted due to 10 minutes of inactivity",
        });
      }
    } catch (err) {
      console.error("Error deleting room:", err);
    } finally {
      delete roomTimers[roomCode];
    }
  }, 10 * 60 * 1000); // 10 minutes
};

// Cancel timer when someone joins
const cancelRoomTimer = (roomCode) => {
  if (roomTimers[roomCode]) {
    clearTimeout(roomTimers[roomCode]);
    delete roomTimers[roomCode];
    console.log(`Timer cancelled for room: ${roomCode}`);
  }
};

const socketHandler = (io) => {
  // Authenticate socket
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    console.log(`User connected: ${socket.user.username}`);

    await User.findByIdAndUpdate(socket.user._id, { isOnline: true });

    // Broadcast file message to room
    socket.on("broadcast_file", ({ roomCode, message }) => {
     socket.to(roomCode).emit("receive_message", message);
    });
    // Join room
    socket.on("join_room", (roomCode) => {
      socket.join(roomCode);
      socket.currentRoom = roomCode;

      // Cancel delete timer since someone joined
      cancelRoomTimer(roomCode);

      console.log(`${socket.user.username} joined room: ${roomCode}`);

      socket.to(roomCode).emit("user_joined", {
        username: socket.user.username,
        message: `${socket.user.username} joined the room`,
      });
    });

    // Send message
    socket.on("send_message", async (data) => {
      const { roomCode, content } = data;
      try {
        const message = await Message.create({
          roomCode,
          sender: socket.user._id,
          content,
        });
        const populatedMessage = await message.populate("sender", "username avatar");
        io.to(roomCode).emit("receive_message", populatedMessage);
      } catch (err) {
        console.error("Message error:", err);
      }
    });

    // Typing
    socket.on("typing", (roomCode) => {
      socket.to(roomCode).emit("user_typing", { username: socket.user.username });
    });

    socket.on("stop_typing", (roomCode) => {
      socket.to(roomCode).emit("user_stop_typing");
    });

    // Leave room manually
    socket.on("leave_room", async (roomCode) => {
      socket.leave(roomCode);

      socket.to(roomCode).emit("user_left", {
        username: socket.user.username,
        message: `${socket.user.username} left the room`,
      });

      // Check if room is now empty
      const socketsInRoom = await io.in(roomCode).fetchSockets();
      if (socketsInRoom.length === 0) {
        startRoomTimer(roomCode, io);
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.user.username}`);
      await User.findByIdAndUpdate(socket.user._id, { isOnline: false });

      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit("user_left", {
          username: socket.user.username,
          message: `${socket.user.username} left the room`,
        });

        // Check if room is now empty
        const socketsInRoom = await io.in(socket.currentRoom).fetchSockets();
        if (socketsInRoom.length === 0) {
          startRoomTimer(socket.currentRoom, io);
        }
      }
    });
  });
};

module.exports = socketHandler;