# BaatCheet 💬
### Real-time Chat Application with Room-based Messaging

A full-stack real-time chat application built with React and Node.js, supporting instant messaging, typing indicators, online/offline status, and room-based conversations using unique room codes.

---

## 🚀 Features

- 🔐 **Authentication** — Secure register/login with JWT tokens and bcrypt password hashing
- 💬 **Real-time Messaging** — Instant message delivery using Socket.IO
- 🏠 **Room-based Chat** — Create or join chat rooms using unique 6-character room codes
- ✍️ **Typing Indicators** — See when someone is typing in real time
- 🟢 **Online/Offline Status** — Know who's active in the room
- 💾 **Message History** — All messages are stored and loaded from MongoDB
- 📱 **Responsive UI** — Works on both desktop and mobile browsers

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Styling | Tailwind CSS |
| Real-time | Socket.IO |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| HTTP Client | Axios |
| Deployment | Render (backend), Vercel (frontend) |

---

## 📁 Project Structure

```
BaatCheet/
├── client/                   # React frontend
│   └── src/
│       ├── components/
│       │   └── Auth/         # Login & Register forms
│       ├── context/          # AuthContext & SocketContext
│       ├── pages/            # AuthPage, HomePage, ChatPage
│       └── utils/            # Axios API config
│
└── server/                   # Node.js backend
    ├── config/               # MongoDB connection
    ├── middleware/           # JWT auth middleware
    ├── models/               # User, Room, Message schemas
    ├── routes/               # Auth & Chat routes
    └── socket/               # Socket.IO event handlers
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v20+
- MongoDB Atlas account (free tier)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/BaatCheet.git
cd BaatCheet
```

### 2. Setup the Backend
```bash
cd server
npm install
```

Create a `.env` file inside `/server`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

Start the server:
```bash
npm run dev
```

### 3. Setup the Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Open the app
Go to **http://localhost:5173** in your browser.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/chat/create-room` | Create a new room |
| POST | `/api/chat/join-room` | Join existing room |
| GET | `/api/chat/messages/:roomCode` | Get room messages |

---

## 🔁 Socket Events

| Event | Direction | Description |
|---|---|---|
| `join_room` | Client → Server | Join a chat room |
| `send_message` | Client → Server | Send a message |
| `receive_message` | Server → Client | Receive a message |
| `typing` | Client → Server | User is typing |
| `stop_typing` | Client → Server | User stopped typing |
| `user_typing` | Server → Client | Show typing indicator |
| `user_joined` | Server → Client | User joined notification |
| `user_left` | Server → Client | User left notification |

---

## 🌐 Deployment

- **Backend** → [Render](https://render.com) — deploy the `/server` folder
- **Frontend** → [Vercel](https://vercel.com) — deploy the `/client` folder
- Update `CLIENT_URL` in backend `.env` to your Vercel URL
- Update `baseURL` in `client/src/utils/api.js` to your Render URL

---

## 📸 Screenshots



---

## 👨‍💻 Author

**Your Name**
- GitHub: [AdityaNegi02]((https://github.com/AdityaNegi02))

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
