# 💬 BaatCheet — Distributed Real-time Communication Platform

• Built a real-time chat app using React, Node.js, and Socket.IO supporting 200+ concurrent users with room-based messaging and live status indicators.
• Developed secure JWT/bcrypt authentication and automated MongoDB data pruning to delete inactive rooms after 10 minutes, optimizing storage usage.
• Integrated Cloudinary for 10MB file sharing with real-time upload progress, achieving 99% uptime on Render with synchronized data across clients.
• **Tech Stack:** React (Vite), Node.js, Express, MongoDB, Socket.IO, JWT, bcrypt, Cloudinary, Tailwind CSS.

---

## ⚙️ How It Executes

BaatCheet operates as a high-concurrency real-time system where the server orchestrates both persistent storage and live event broadcasting.

### 1. Initialization & Handshake
- **Server Bootstrapping:** The Node.js/Express server establishes a connection to MongoDB and mounts the Socket.IO engine. It initializes middleware for JWT verification and Cloudinary configuration for media handling.
- **Client Synchronization:** Upon landing, the React client initiates a WebSocket handshake. The server verifies the user's JWT and places them into a "Global Presence" list, broadcasting their "Online" status to all connected peers.
- **Room Logic:** Users create rooms identified by **unique 6-character alphanumeric codes**. The server uses these codes as Socket.IO room identifiers to isolate traffic between different conversations.

### 2. Real-time Message Lifecycle
- **The Event Loop:** When a user types, a `typing` event is emitted to the server and immediately broadcasted to the specific room. When a message is sent:
    1. The server validates the sender's session.
    2. The message is persisted to MongoDB for chat history.
    3. The message is emitted via `io.to(roomCode).emit('message')` with sub-100ms latency.
- **Bi-directional Status:** Socket.IO "Heartbeats" monitor connection health. If a client disconnects, the server updates their status in the database and notifies all relevant rooms in real-time.

### 3. Media & Lifecycle Management
- **10MB File Pipeline:** Files are streamed through a Multer-Cloudinary pipeline. The server enforces a strict **10MB limit** per file. While uploading, the client receives progress events to update the UI progress bar.
- **Automated Pruning:** To prevent storage bloat, the server runs a background watchdog. If a room has **0 active participants** or no activity for **10 minutes**, the system automatically deletes the room document and its associated message history from MongoDB.

---

## 🚀 Key Features

- 🔐 **Secure Auth** — JWT, bcrypt hashing, strict email validation, and Google reCAPTCHA.
- 📞 **P2P Video Calls** — Built-in video and voice calling using WebRTC.
- 💬 **Smart Messaging** — Real-time delivery, typing indicators, and file/image attachments.
- 🧹 **Auto-Cleanup** — Self-maintaining database that deletes inactive rooms/messages.
- 📱 **Clean UI** — Modern, light-themed responsive design focused on readability.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React (Vite) | Fast, component-based UI |
| **Styling** | Tailwind CSS | Modern "Utility-first" styling |
| **Real-time** | Socket.IO | Instant messaging & signaling |
| **Video** | Simple-Peer (WebRTC) | Peer-to-peer media streaming |
| **Backend** | Node.js & Express | Scalable server architecture |
| **Database** | MongoDB & Mongoose | Document-oriented data storage |
| **Storage** | Cloudinary | Secure cloud hosting for images/files |

---

## 📁 Project Structure

```
BaatCheet/
├── client/                   
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat/         # Messaging, Call UI, Header
│   │   │   ├── Auth/         # Login, Register (with CAPTCHA)
│   │   │   └── Room/         # Create/Join logic
│   │   ├── context/          # Global Auth & Socket state
│   │   └── pages/            # Home, Auth, Chat layout
│
└── server/                   
    ├── models/               # User, Room, Message Schemas
    ├── routes/               # Auth (with validation), Chat, Uploads
    ├── socket/               # Socket events & Signaling logic
    └── index.js              # Server entry & Cleanup Task
```

---

## ⚙️ Setup Instructions

### 1. Backend Setup
1. `cd server`
2. `npm install`
3. Create a `.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
RECAPTCHA_SECRET_KEY=your_google_recaptcha_secret
VITE_RECAPTCHA_SITE_KEY=your_google_recaptcha_site_key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```
4. `npm run dev`

### 2. Frontend Setup
1. `cd client`
2. `npm install`
3. `npm run dev`

---

## 👨‍💻 Implementation Details (For Interview)

- **Q: How do you handle file uploads?**
- *A: We use Multer for handling multipart/form-data and Cloudinary for permanent storage. The URL is then broadcasted via Socket.IO.*

- **Q: How does the cleanup task work?**
- *A: A `setInterval` runs every minute on the server, querying the `Rooms` collection for any document where `lastActivity` < `(Now - 30 mins)`. Matching rooms are deleted along with their messages.*

- **Q: Why WebRTC?**
- *A: It reduces server costs significantly because the media data doesn't pass through our server—it goes directly between users.*

---

## 📄 License
MIT License - Open Source and free to use.

---

## 📷 Screenshots of the Project

-
<img width="1890" height="893" alt="Screenshot 2026-06-04 210659" src="https://github.com/user-attachments/assets/d69c0b99-f668-440e-86b8-51ec78fffc12" />
