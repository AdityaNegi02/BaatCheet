import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import CreateRoom from "../components/Room/CreateRoom";
import JoinRoom from "../components/Room/JoinRoom";
import { useTheme } from "../context/ThemeContext";

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toggleTheme, theme } = useTheme();

  const createRoom = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/chat/create-room");
      navigate(`/chat/${data.roomCode}`);
    } catch {
      setError("Failed to create room. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!roomCode.trim()) return setError("Please enter a room code");
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/chat/join-room", { roomCode });
      navigate(`/chat/${data.roomCode}`);
    } catch (err) {
      setError(err.response?.data?.message || "Room not found");
    } finally {
      setLoading(false);
    }
  };

  const avatarLetter = user?.username?.[0]?.toUpperCase() || "?";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-10 bg-[var(--bg)] relative overflow-hidden">
      {/* Background Decorative Element - Diagonal Pattern */}
      <div className="absolute inset-0 bg-diagonal pointer-events-none" />

      <div className="w-full max-w-2xl z-10 animate-slide-up">
        {/* Profile Card Section (Matching Screenshot) */}
        <div className="card-minimal overflow-hidden shadow-xl mb-8">
          <div className="h-32 sm:h-48 bg-[var(--bg-subtle)] border-b border-[var(--border)] relative flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
             <span className="text-8xl opacity-10 font-bold select-none">BAATCHEET</span>
          </div>
          
          <div className="p-6 sm:p-10 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text-h)] tracking-tight">
                  {user?.username}
                </h1>
                <p className="text-[var(--text)] text-[12px] font-bold uppercase tracking-[0.25em] mt-2 opacity-60">
                  REAL-TIME COMMUNICATIONS · P2P
                </p>
                <p className="text-[var(--text)] mt-6 text-sm sm:text-base max-w-lg leading-relaxed font-medium">
                  Welcome to your private bridge. Create an isolated channel or join an existing one using a 6-character code. Experience performant, encrypted messaging built for the modern web.
                </p>
              </div>

              {/* Action Buttons to match pic */}
              <div className="flex flex-col gap-3 w-full sm:w-auto shrink-0">
                 <button 
                   onClick={createRoom}
                   disabled={loading}
                   className="btn-black w-full sm:w-40"
                 >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                   New Room
                 </button>
                 <button 
                   onClick={logout}
                   className="btn-white w-full sm:w-40"
                 >
                   Sign Out
                 </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search/Join Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-minimal p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2">Connect to Channel</h3>
              <p className="text-xs text-[var(--text)] opacity-60 font-medium mb-4 uppercase tracking-widest">Enter room access code</p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="ABC123"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="input-minimal text-center font-mono tracking-[0.5em] text-lg uppercase !py-4"
              />
              <button 
                onClick={joinRoom}
                disabled={loading || !roomCode}
                className="absolute right-2 top-2 bottom-2 px-4 bg-[var(--text-h)] text-[var(--bg)] rounded-md font-bold text-xs uppercase hover:opacity-90 disabled:opacity-30 transition-all"
              >
                Go →
              </button>
            </div>
          </div>

          <div className="card-minimal p-6 bg-[var(--bg-subtle)] border-dashed border-2">
            <h3 className="text-lg font-bold mb-2">Active Status</h3>
            <div className="flex items-center gap-3 mt-4">
               <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-pulse" />
               <span className="font-mono text-sm font-bold tracking-tight">ENCRYPTION ACTIVE</span>
            </div>
            <p className="text-[11px] mt-4 font-medium opacity-50 uppercase tracking-widest">No logs maintained · Peer identification synced</p>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-3 animate-fade-in">
             <span>⚠️</span> {error}
          </div>
        )}

        {/* Footer to match screenshot style */}
        <footer className="mt-20 py-10 border-t border-[var(--border)] w-full flex flex-col sm:flex-row justify-between items-center gap-6 opacity-60 hover:opacity-100 transition-opacity duration-500">
           <div className="flex flex-col items-center sm:items-start">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-h)]">Developed By</span>
              <span className="text-sm font-extrabold tracking-tight mt-1">© 2024 ADITYA NEGI</span>
           </div>
           
           <div className="flex items-center gap-6">
              <a 
                href="https://github.com/AdityaNegi02" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] font-bold uppercase tracking-widest hover:text-[var(--text-h)] transition-colors border-b border-transparent hover:border-[var(--text-h)]"
              >
                Github
              </a>
              <a 
                href="https://www.linkedin.com/in/aditya-negi-1825122b3/" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] font-bold uppercase tracking-widest hover:text-[var(--text-h)] transition-colors border-b border-transparent hover:border-[var(--text-h)]"
              >
                LinkedIn
              </a>
              <div className="w-8 h-px bg-[var(--border)]" />
              <span className="text-[9px] font-mono opacity-50">v1.0.4-STABLE</span>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;