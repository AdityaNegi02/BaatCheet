import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 px-5 py-4 rounded-lg text-[11px] font-bold uppercase tracking-widest animate-fade-in flex items-center gap-3">
          <span className="text-base">⚠️</span>
          {error}
        </div>
      )}

      <div className="space-y-3">
        <label className="text-[var(--text-h)] text-[11px] font-extrabold tracking-[0.2em] uppercase ml-1 opacity-80">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          placeholder="name@payload.io"
          value={form.email}
          onChange={handleChange}
          required
          className="input-minimal !py-4 !text-[13px] tracking-tight"
        />
      </div>

      <div className="space-y-3">
        <label className="text-[var(--text-h)] text-[11px] font-extrabold tracking-[0.2em] uppercase ml-1 opacity-80">
          Access Password
        </label>
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          required
          className="input-minimal !py-4 !text-[13px] tracking-tight"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-black w-full mt-4 !py-4 text-[11px] font-bold uppercase tracking-[0.3em] shadow-lg"
      >
        {loading ? "Authenticating..." : "Establish Session →"}
      </button>
    </form>
  );
};

export default Login;