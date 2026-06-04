const JoinRoom = ({ roomCode, onChange, onJoin, loading }) => {
  return (
    <div className="card-clean p-8 group transition-all duration-500 hover:border-[var(--accent-border)] hover:shadow-xl transform hover:-translate-y-1">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-[var(--text-h)] font-syne font-extrabold text-lg tracking-tight">Join Room</h2>
          <p className="text-[var(--text)] text-[11px] mt-1 font-bold uppercase tracking-[0.1em] opacity-60">Enter unique access code</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-2xl shadow-sm transform group-hover:rotate-12 transition-transform">
          🚪
        </div>
      </div>
      <input
        type="text"
        placeholder="ABC123"
        value={roomCode}
        onChange={onChange}
        maxLength={6}
        className="input-clean w-full px-5 py-4 text-sm tracking-[0.5em] font-syne text-center mb-5 font-black uppercase placeholder:tracking-normal placeholder:font-sans placeholder:font-medium bg-[var(--bg)]"
      />
      <button
        onClick={onJoin}
        disabled={loading}
        className="w-full py-3.5 rounded-2xl text-[11px] font-bold text-[var(--text)] border border-[var(--border)] bg-[var(--bg)] hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[var(--text-h)] hover:border-[var(--accent-border)] transition-all uppercase tracking-[0.2em] active:scale-95"
      >
        {loading ? "Connecting..." : "Join Bridge →"}
      </button>
    </div>
  );
};

export default JoinRoom;