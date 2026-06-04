import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import ChatHeader from "../components/Chat/ChatHeader";
import ChatMessages from "../components/Chat/ChatMessages";
import MessageInput from "../components/Chat/MessageInput";
import CallInterface from "../components/Chat/CallInterface";

const ChatPage = () => {
  const { roomCode } = useParams();
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [copied, setCopied] = useState(false);
  const [peerCount, setPeerCount] = useState(1);
  const typingTimeoutRef = useRef(null);

  // Call States
  const [isCallActive, setIsCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isInitiator, setIsInitiator] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/chat/messages/${roomCode}`);
        setMessages(data);
      } catch {}
    };
    fetchMessages();
  }, [roomCode]);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      console.log("Socket: Connected/Reconnected, joining room", roomCode);
      socket.emit("join_room", roomCode);
    };

    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", () => console.log("Socket: Disconnected"));

    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("user_typing", ({ username }) => setTypingUser(username));
    socket.on("user_stop_typing", () => setTypingUser(""));

    socket.on("user_joined", ({ message }) => {
      setMessages((prev) => [
        ...prev,
        { _id: Date.now(), system: true, content: message },
      ]);
    });

    socket.on("user_left", ({ message }) => {
      setMessages((prev) => [
        ...prev,
        { _id: Date.now(), system: true, content: message },
      ]);
    });

    socket.on("peer_count_update", ({ count }) => {
      console.log("Socket: Peer count updated:", count);
      setPeerCount(count);
    });

    socket.on("room_deleted", ({ message }) => {
      alert(message);
      navigate("/");
    });

    // Call signaling listeners
    socket.on("incoming_call", (data) => {
      console.log("Incoming call received:", data);
      setIncomingCall(data);
    });

    socket.on("call_accepted", (data) => {
      console.log("Call accepted by peer:", data);
    });

    return () => {
      socket.emit("leave_room", roomCode);
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("peer_count_update");
      socket.off("room_deleted");
      socket.off("incoming_call");
      socket.off("call_accepted");
    };
  }, [socket, roomCode]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    socket.emit("send_message", { roomCode, content: newMessage });
    socket.emit("stop_typing", roomCode);
    setNewMessage("");
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socket.emit("typing", roomCode);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", roomCode);
    }, 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSent = (message) => {
    socket.emit("broadcast_file", { roomCode, message });
    setMessages((prev) => [...prev, message]);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startCall = () => {
    setIsInitiator(true);
    setIsCallActive(true);
  };

  const acceptCall = () => {
    setIsInitiator(false);
    setIsCallActive(true);
    setIncomingCall(null);
  };

  const rejectCall = () => {
    setIncomingCall(null);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden relative bg-[var(--bg)]">
      <ChatHeader
        roomCode={roomCode}
        onBack={() => navigate("/")}
        onCopy={copyRoomCode}
        copied={copied}
        onStartCall={startCall}
        peerCount={peerCount}
      />
      <ChatMessages
        messages={messages}
        typingUser={typingUser}
        currentUser={user}
      />
      <MessageInput
        value={newMessage}
        onChange={handleTyping}
        onSend={handleSend}
        onKeyDown={handleKeyDown}
        roomCode={roomCode}
        onFileSent={handleFileSent}
      />

      {/* Incoming Call Notification */}
      {incomingCall && (
        <div className="absolute top-24 right-6 z-40 bg-[var(--bg)] border border-[var(--border)] shadow-2xl rounded-2xl p-6 animate-slide-up w-80 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent-bg)] flex items-center justify-center text-2xl border border-[var(--accent-border)]">
              📞
            </div>
            <div>
              <p className="text-[var(--text-h)] font-bold text-base pr-2 truncate">{incomingCall.from}</p>
              <p className="text-[var(--text)] text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Incoming Call...</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={acceptCall}
              className="flex-1 py-3 bg-[var(--accent)] text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-lg shadow-[var(--accent-bg)]"
            >
              Accept
            </button>
            <button 
              onClick={rejectCall}
              className="flex-1 py-3 bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Ignore
            </button>
          </div>
        </div>
      )}

      {/* Full Screen Call UI */}
      {isCallActive && (
        <CallInterface
          roomCode={roomCode}
          socket={socket}
          currentUser={user}
          incomingCall={incomingCall}
          isInitiator={isInitiator}
          onClose={() => setIsCallActive(false)}
        />
      )}
    </div>
  );
};

export default ChatPage;