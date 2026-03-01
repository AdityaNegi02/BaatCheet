const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    // File attachment fields
    fileUrl: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      default: "",
    },
    fileType: {
      type: String,
      default: "", // "image", "pdf", "doc", etc.
    },
    messageType: {
      type: String,
      enum: ["text", "file", "image"],
      default: "text",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);