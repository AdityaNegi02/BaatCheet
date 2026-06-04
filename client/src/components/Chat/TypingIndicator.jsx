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

const TypingIndicator = ({ username }) => {
  if (!username) return null;

  return (
    <div className="flex items-center gap-4 px-4 py-2 animate-fade-in grayscale">
      <div
        className={`w-8 h-8 rounded border flex items-center justify-center text-[10px] font-mono font-bold shrink-0 shadow-sm ${getAvatarColor(username)}`}
      >
        {getAvatarLetter(username)}
      </div>
      <div className="bg-[var(--bg-subtle)] border border-[var(--border)] px-4 py-3 rounded-xl rounded-tl-none flex items-center gap-1.5">
        <div className="w-1 h-1 rounded-full bg-[var(--text-h)] animate-bounce" />
        <div className="w-1 h-1 rounded-full bg-[var(--text-h)] animate-bounce [animation-delay:0.2s]" />
        <div className="w-1 h-1 rounded-full bg-[var(--text-h)] animate-bounce [animation-delay:0.4s]" />
      </div>
    </div>
  );
};

export default TypingIndicator;