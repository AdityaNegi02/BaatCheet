const Message = require("../models/Message");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const socketHandler = (io) => {
  // Middleware to authenticate socket connection
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

    // Mark user as online
    await User.findByIdAndUpdate(socket.user._id, { isOnline: true });

    // Join a room
    socket.on("join_room", (roomCode) => {
      socket.join(roomCode);
      socket.currentRoom = roomCode;
      console.log(`${socket.user.username} joined room: ${roomCode}`);

      // Notify others in the room
      socket.to(roomCode).emit("user_joined", {
        username: socket.user.username,
        message: `${socket.user.username} joined the room`,
      });
    });

    // Send a message
    socket.on("send_message", async (data) => {
      const { roomCode, content } = data;

      try {
        // Save message to DB
        const message = await Message.create({
          roomCode,
          sender: socket.user._id,
          content,
        });

        const populatedMessage = await message.populate("sender", "username avatar");

        // Broadcast to everyone in the room including sender
        io.to(roomCode).emit("receive_message", populatedMessage);
      } catch (err) {
        console.error("Message error:", err);
      }
    });

    // Typing indicator
    socket.on("typing", (roomCode) => {
      socket.to(roomCode).emit("user_typing", {
        username: socket.user.username,
      });
    });

    socket.on("stop_typing", (roomCode) => {
      socket.to(roomCode).emit("user_stop_typing", {
        username: socket.user.username,
      });
    });

    // Leave room
    socket.on("leave_room", (roomCode) => {
      socket.leave(roomCode);
      socket.to(roomCode).emit("user_left", {
        username: socket.user.username,
        message: `${socket.user.username} left the room`,
      });
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
      }
    });
  });
};

module.exports = socketHandler;