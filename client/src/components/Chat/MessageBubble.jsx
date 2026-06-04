const getAvatarLetter = (username) => username?.[0]?.toUpperCase() || "?";

const getAvatarColor = (username) => {
  const colors = [
    "bg-slate-100 border-slate-200 text-slate-800",
    "bg-zinc-100 border-zinc-200 text-zinc-800",
    "bg-neutral-100 border-neutral-200 text-neutral-800",
    "bg-gray-100 border-gray-200 text-gray-800",
  ];
  const index = username?.charCodeAt(0) % colors.length || 0;
  return colors[index];
};

const FileIcon = ({ fileType }) => {
  const icons = {
    pdf: "📄",
    doc: "📝",
    image: "🖼️",
    zip: "🗜️",
    document: "📎",
  };
  return <span className="grayscale">{icons[fileType] || "📎"}</span>;
};

const MessageContent = ({ msg, isMe }) => {
  // Image message
  if (msg.messageType === "image") {
    return (
      <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="block mt-2">
        <img
          src={msg.fileUrl}
          alt={msg.fileName}
          className="max-w-xs rounded-lg border border-[var(--border)] cursor-pointer hover:opacity-80 transition-all shadow-md"
        />
      </a>
    );
  }

  // File/document message
  if (msg.messageType === "file") {
    const fileClass = isMe
      ? "bg-[var(--accent)] border-[var(--accent)] text-[var(--accent-contrast)]"
      : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-h)] hover:bg-[var(--bg-subtle)]";

    return (
      <a
        href={msg.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={"flex items-center gap-4 px-5 py-4 rounded-lg border transition-all mt-2 " + fileClass}
      >
        <div className="w-10 h-10 rounded bg-black/10 flex items-center justify-center text-xl">
          <FileIcon fileType={msg.fileType} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold truncate pr-4">
            {msg.fileName}
          </p>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-50 mt-1">
            Download Attachment
          </p>
        </div>
      </a>
    );
  }

  // Regular text message
  const textClass = isMe
    ? "msg-bubble-min msg-sent-min font-medium"
    : "msg-bubble-min msg-received-min font-medium";

  return <div className={textClass + " mt-1"}>{msg.content}</div>;
};

const MessageBubble = ({ msg, currentUser }) => {
  if (msg.system) {
    return (
      <div className="flex items-center gap-6 my-6 px-10 opacity-30">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-[var(--text)] text-[9px] font-mono font-bold uppercase tracking-[0.4em] whitespace-nowrap">{msg.content}</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>
    );
  }

  const isMe =
    msg.sender?._id === currentUser?._id ||
    msg.sender?.username === currentUser?.username;
  const senderName = msg.sender?.username || "Unknown";

  return (
    <div className={"flex items-end gap-3 px-4 sm:px-10 " + (isMe ? "flex-row-reverse animate-slide-up" : "flex-row animate-slide-up")}>
      {!isMe && (
        <div className={"w-8 h-8 rounded border flex items-center justify-center text-[10px] font-bold shadow-sm shrink-0 mb-4 grayscale " + getAvatarColor(senderName)}>
          {getAvatarLetter(senderName)}
        </div>
      )}

      <div className={"flex flex-col gap-1 max-w-[90%] lg:max-w-xl " + (isMe ? "items-end" : "items-start")}>
        {!isMe && (
          <span className="text-[var(--text-h)] text-[9px] font-bold tracking-[0.2em] px-1 mb-1 uppercase opacity-60">{senderName}</span>
        )}

        <MessageContent msg={msg} isMe={isMe} />

        <span className="text-[var(--text)] text-[9px] font-mono font-bold uppercase tracking-[0.1em] px-1 mt-1 opacity-40">
          {msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "now"}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;