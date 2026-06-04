const dotenv = require("dotenv");
dotenv.config();


const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const uploadRoutes = require("./routes/upload");
const socketHandler = require("./socket/socketHandler");
const Room = require("./models/Room");
const Message = require("./models/Message");
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

// Inactivity Cleanup Task (Runs every 1 minute)
setInterval(async () => {
  try {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    // Find rooms with no activity for 30 mins
    const inactiveRooms = await Room.find({ lastActivity: { $lt: thirtyMinsAgo } });

    for (const room of inactiveRooms) {
      console.log(`Cleaning up inactive room: ${room.roomCode}`);
      
      // Notify users in the room before deleting
      io.to(room.roomCode).emit("room_deleted", {
        message: "Room deleted due to 30 minutes of inactivity"
      });

      // Delete messages and the room
      await Message.deleteMany({ roomCode: room.roomCode });
      await Room.deleteOne({ _id: room._id });
    }
  } catch (err) {
    console.error("Cleanup task error:", err);
  }
}, 60 * 1000);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("BaatCheet API is running...");
});

// Socket
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});