import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

const Register = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const recaptchaRef = useRef();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaToken) {
      return setError("Please complete the CAPTCHA");
    }

    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register", { ...form, captchaToken });
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      recaptchaRef.current.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 px-5 py-4 rounded-lg text-[11px] font-bold uppercase tracking-widest animate-fade-in flex items-center gap-3">
          <span className="text-base">⚠️</span>
          {error}
        </div>
      )}

      <div className="space-y-3">
        <label className="text-[var(--text-h)] text-[11px] font-extrabold tracking-[0.2em] uppercase ml-1 opacity-80">
          User Identifier
        </label>
        <input
          type="text"
          name="username"
          placeholder="engineer_01"
          value={form.username}
          onChange={handleChange}
          required
          className="input-minimal !py-4 !text-[13px] tracking-tight"
        />
      </div>

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
          Create Password
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

      <div className="flex justify-center py-4 scale-90 sm:scale-100">
        <div className="rounded-lg overflow-hidden border-2 border-[var(--border)] shadow-sm grayscale hover:grayscale-0 transition-all duration-500">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"} // Fallback to test key
            onChange={handleCaptchaChange}
            theme={window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-black w-full mt-2 !py-4 text-[11px] font-bold uppercase tracking-[0.3em] shadow-lg"
      >
        {loading ? "Creating Identity..." : "Initialize Account →"}
      </button>
    </form>
  );
};

export default Register;