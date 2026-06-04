const Message = require("../models/Message");
const User = require("../models/User");
const Room = require("../models/Room");
const jwt = require("jsonwebtoken");

// Store active room timers
const roomTimers = {};
// Store user socket IDs: { userId: socketId }
const userSockets = {};

// Start 10 min delete timer for a room
const startRoomTimer = (roomCode, io) => {
  if (roomTimers[roomCode]) {
    clearTimeout(roomTimers[roomCode]);
  }

  roomTimers[roomCode] = setTimeout(async () => {
    try {
      const socketsInRoom = await io.in(roomCode).fetchSockets();

      if (socketsInRoom.length === 0) {
        await Message.deleteMany({ roomCode });
        await Room.deleteOne({ roomCode });
        console.log(`Room ${roomCode} deleted: Empty for 10 mins`);
      }
    } catch (err) {
      console.error("Error deleting empty room:", err);
    } finally {
      delete roomTimers[roomCode];
    }
  }, 10 * 60 * 1000);
};

const updateRoomActivity = async (roomCode) => {
  try {
    await Room.findOneAndUpdate({ roomCode }, { lastActivity: new Date() });
  } catch (err) {
    console.error("Error updating room activity:", err);
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
      if (!user) return next(new Error("User not found"));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    await User.findByIdAndUpdate(socket.user._id, { isOnline: true });
    // Map userId to socketId
    userSockets[socket.user._id.toString()] = socket.id;

    // Join room
    socket.on("join_room", (roomCode) => {
      if (!roomCode) return;
      
      socket.join(roomCode);
      socket.currentRoom = roomCode;
      console.log(`[JOIN] ${socket.user.username} (${socket.id}) -> ${roomCode}`);
      
      // Update everyone on peer count
      const room = io.sockets.adapter.rooms.get(roomCode);
      const peerCount = room ? room.size : 0;
      io.to(roomCode).emit("peer_count_update", { count: peerCount });

      updateRoomActivity(roomCode);
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
        
        // Update activity on every message
        await updateRoomActivity(roomCode);
      } catch (err) {
        console.error("Message error:", err);
      }
    });

    // File Broadcast
    socket.on("broadcast_file", async ({ roomCode, message }) => {
      socket.to(roomCode).emit("receive_message", message);
      await updateRoomActivity(roomCode);
    });

    // WebRTC Signaling
    socket.on("call_user", async ({ roomCode, offer }) => {
      console.log(`[CALL] ${socket.user.username} calling in ${roomCode}`);
      
      // Deep Room Inspection
      const room = io.sockets.adapter.rooms.get(roomCode);
      const peers = room ? Array.from(room) : [];
      console.log(`[ROOM STATE] ${roomCode} has ${peers.length} peers:`, peers);

      // Force join if somehow missing
      if (!socket.rooms.has(roomCode)) {
        console.warn(`[FIX] ${socket.user.username} was not in room ${roomCode}. Force joining...`);
        socket.join(roomCode);
      }

      socket.to(roomCode).emit("incoming_call", {
        from: socket.user.username,
        fromId: socket.user._id,
        offer,
      });
      await updateRoomActivity(roomCode);
    });

    socket.on("answer_call", ({ roomCode, answer, toId }) => {
      const targetId = toId?.toString();
      console.log(`Call: Answer from ${socket.user.username} to ${targetId}`);
      if (targetId && userSockets[targetId]) {
        io.to(userSockets[targetId]).emit("call_accepted", { answer, fromId: socket.user._id });
      } else {
        socket.to(roomCode).emit("call_accepted", { answer, fromId: socket.user._id });
      }
    });

    socket.on("ice_candidate", ({ roomCode, candidate, toId }) => {
      const targetId = toId?.toString();
      if (targetId && userSockets[targetId]) {
        io.to(userSockets[targetId]).emit("ice_candidate", { candidate, fromId: socket.user._id });
      } else {
        socket.to(roomCode).emit("ice_candidate", { candidate, fromId: socket.user._id });
      }
    });

    socket.on("end_call", ({ roomCode }) => {
      socket.to(roomCode).emit("call_ended");
    });

    // Leave room manually
    socket.on("leave_room", async (roomCode) => {
      socket.leave(roomCode);
      socket.currentRoom = null;

      const room = io.sockets.adapter.rooms.get(roomCode);
      const peerCount = room ? room.size : 0;
      io.to(roomCode).emit("peer_count_update", { count: peerCount });

      socket.to(roomCode).emit("user_left", {
        username: socket.user.username,
        message: `${socket.user.username} left the room`,
      });

      const socketsInRoom = await io.in(roomCode).fetchSockets();
      if (socketsInRoom.length === 0) {
        startRoomTimer(roomCode, io);
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      await User.findByIdAndUpdate(socket.user._id, { isOnline: false });
      delete userSockets[socket.user._id.toString()];

      if (socket.currentRoom) {
        const roomCode = socket.currentRoom;
        
        const room = io.sockets.adapter.rooms.get(roomCode);
        const peerCount = room ? room.size : 0;
        io.to(roomCode).emit("peer_count_update", { count: peerCount });

        socket.to(roomCode).emit("user_left", {
          username: socket.user.username,
          message: `${socket.user.username} left the room`,
        });

        const socketsInRoom = await io.in(roomCode).fetchSockets();
        if (socketsInRoom.length === 0) {
          startRoomTimer(roomCode, io);
        }
      }
    });
  });
};

module.exports = socketHandler;