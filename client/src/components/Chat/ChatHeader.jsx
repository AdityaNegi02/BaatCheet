import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const ChatHeader = ({ roomCode, onBack, onCopy, copied, onStartCall, peerCount }) => {
  const { toggleTheme, theme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="bg-[var(--bg)] border-b border-[var(--border)] px-4 sm:px-8 py-3 flex items-center justify-between shrink-0 z-20 sticky top-0">
      <div className="flex items-center gap-6 sm:gap-10">
        {/* Boxed Logo */}
        <button
          onClick={onBack}
          className="w-10 h-10 border-2 border-[var(--text-h)] flex items-center justify-center rounded-lg hover:bg-[var(--text-h)] hover:text-[var(--bg)] transition-all group"
          title="Back to Home"
        >
          <span className="text-xl font-bold font-mono tracking-tighter group-hover:scale-110 transition-transform">>-</span>
        </button>

        {/* Navigation Links Style Info */}
        <div className="hidden md:flex items-center gap-8 text-[13px] font-medium tracking-tight">
          <div className="flex flex-col">
            <span className="text-[var(--text-h)] font-bold">{user?.username}</span>
            <span className="text-[var(--text)] text-[10px] uppercase tracking-widest opacity-50">Current Identity</span>
          </div>
          <div className="w-px h-8 bg-[var(--border)]" />
          <div className="flex flex-col">
            <span className="text-[var(--text-h)] font-mono font-bold tracking-widest uppercase">{roomCode}</span>
            <span className="text-[var(--text)] text-[10px] uppercase tracking-widest opacity-50">Room Channel</span>
          </div>
          <div className="w-px h-8 bg-[var(--border)]" />
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${peerCount > 1 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'} animate-pulse`} />
            <span className="text-[var(--text-h)] font-bold">{peerCount} Peers</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Search placeholder to match pic */}
        <button className="nav-icon" title="Search messages">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>

        <a href="https://github.com/AdityaNegi02" target="_blank" rel="noreferrer" className="nav-icon" title="View Source">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.02-1.04-.032-2.037-3.363.73-4.073-1.622-4.073-1.622-.55-1.396-1.34-1.767-1.34-1.767-1.097-.75.083-.735.083-.735 1.213.085 1.853 1.246 1.853 1.246 1.079 1.848 2.81 1.314 3.495 1.005.109-.782.463-1.314.85-1.617-2.684-.305-5.506-1.342-5.506-5.978 0-1.32.472-2.4 1.246-3.245-.124-.307-.54-1.535.118-3.193 0 0 1.012-.324 3.31 1.23.96-.267 1.983-.4 3.003-.404 1.02.004 2.043.137 3.005.404 2.296-1.554 3.307-1.23 3.307-1.23.66 1.658.244 2.886.12 3.193.776.845 1.245 1.925 1.245 3.245 0 4.647-2.825 5.67-5.522 5.968.435.374.812 1.114.812 2.247 0 1.624-.015 2.934-.015 3.333 0 .323.217.697.828.577 4.805-1.588 8.24-6.086 8.24-11.385 0-6.627-5.373-12-12-12"/></svg>
        </a>

        <button 
          onClick={toggleTheme} 
          className="nav-icon"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 18v1m9-11h1m-18 0h1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 110 14 7 7 0 010-14z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>

        <div className="w-px h-6 bg-[var(--border)] mx-1" />

        <button
          onClick={onStartCall}
          className="btn-black !px-4 !py-2 text-[11px] uppercase tracking-widest hidden sm:flex"
        >
          Call
        </button>
        <button
          onClick={onCopy}
          className="btn-white !px-4 !py-2 text-[11px] uppercase tracking-widest"
        >
          {copied ? "✓" : "Share"}
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;