import { useState } from "react";
import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import { useTheme } from "../context/ThemeContext";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { toggleTheme, theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg)] relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute inset-0 bg-diagonal pointer-events-none opacity-20" />

      <div className="w-full max-w-[400px] z-10 animate-slide-up">
        {/* Minimalist Logo/Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-[var(--text-h)] rounded-xl mb-6 bg-[var(--bg)] shadow-sm">
            <span className="text-xl font-bold font-mono tracking-tighter">-</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--text-h)] tracking-tight">
            BaatCheet
          </h1>
          <p className="text-[var(--text)] text-[10px] font-bold uppercase tracking-[0.3em] mt-3 opacity-50">
            Secure · Peer-to-Peer · Minimal
          </p>
        </div>

        <div className="card-minimal shadow-2xl p-8 bg-[var(--bg)]">
          {/* Tab Toggle */}
          <div className="flex border-b border-[var(--border)] mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-4 text-xs font-bold uppercase tracking-widest transition-all ${
                isLogin ? "text-[var(--text-h)] border-b-2 border-[var(--text-h)]" : "text-[var(--text)] opacity-40 hover:opacity-100"
              }`}
            >
              Auth / Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-4 text-xs font-bold uppercase tracking-widest transition-all ${
                !isLogin ? "text-[var(--text-h)] border-b-2 border-[var(--text-h)]" : "text-[var(--text)] opacity-40 hover:opacity-100"
              }`}
            >
              Sign / Up
            </button>
          </div>

          <div className="animate-fade-in">
            {isLogin ? <Login /> : <Register />}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-6">
           <p className="text-[var(--text)] text-[10px] font-medium opacity-40 uppercase tracking-[0.2em] text-center max-w-[200px] leading-loose">
             Developed for engineers who value privacy and performance.
           </p>
           
           <button onClick={toggleTheme} className="nav-icon opacity-50 hover:opacity-100 transition-opacity">
              {theme === 'dark' ? '☀️' : '🌙'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;