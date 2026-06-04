const CreateRoom = ({ onCreate, loading }) => {
  return (
    <div className="card-clean p-8 group transition-all duration-500 hover:border-[var(--accent-border)] hover:shadow-xl transform hover:-translate-y-1">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-[var(--text-h)] font-syne font-extrabold text-lg tracking-tight">New Room</h2>
          <p className="text-[var(--text)] text-[11px] mt-1 font-bold uppercase tracking-[0.1em] opacity-60">Instant Private Access</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[var(--accent-bg)] flex items-center justify-center text-2xl border border-[var(--accent-border)] shadow-sm transform group-hover:rotate-12 transition-transform">
          ✨
        </div>
      </div>
      <button
        onClick={onCreate}
        disabled={loading}
        className="btn-indigo w-full py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-[var(--accent-bg)]"
      >
        {loading ? "Generating Code..." : "Create Room"}
      </button>
    </div>
  );
};

export default CreateRoom;