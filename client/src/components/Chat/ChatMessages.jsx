import { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

const ChatMessages = ({ messages, typingUser, currentUser }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-10 py-10 flex flex-col gap-4 bg-[var(--bg)] relative">
      {/* Subtle Background pattern for feed */}
      <div className="absolute inset-0 bg-diagonal pointer-events-none opacity-[0.03]" />

      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20 animate-fade-in z-10">
          <div className="w-16 h-16 border-2 border-[var(--text-h)] rounded-2xl flex items-center justify-center text-3xl mb-8 grayscale opacity-20">
            💬
          </div>
          <h2 className="text-[var(--text-h)] font-extrabold text-2xl tracking-tighter">INITIALIZING FEED</h2>
          <p className="text-[var(--text)] text-[11px] mt-4 font-mono font-bold uppercase tracking-[0.3em] opacity-40">
            Waiting for peer payloads...
          </p>
        </div>
      )}

      <div className="space-y-6 z-10">
        {messages.map((msg) => (
          <MessageBubble key={msg._id} msg={msg} currentUser={currentUser} />
        ))}
      </div>

      <div className="z-10">
        <TypingIndicator username={typingUser} />
      </div>

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;