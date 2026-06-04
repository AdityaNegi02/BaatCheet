import { useRef, useState } from "react";
import api from "../../utils/api";

const MessageInput = ({ value, onChange, onSend, onKeyDown, roomCode, onFileSent }) => {
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be under 10MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("roomCode", roomCode);

    try {
      const { data } = await api.post("/upload/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      onFileSent(data);
    } catch (err) {
      alert("Upload failed. Try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-[var(--bg)] border-t border-[var(--border)] px-4 sm:px-10 py-5 shrink-0 z-10">

      {/* Upload progress bar */}
      {uploading && (
        <div className="mb-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--text)] text-[9px] font-mono font-bold uppercase tracking-[0.2em] opacity-60">Pushing Payload...</span>
            <span className="text-[var(--text-h)] text-[9px] font-mono font-bold">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] h-1 overflow-hidden">
            <div
              className="bg-[var(--text-h)] h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">

        {/* File upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-11 h-11 border-2 border-[var(--border)] flex items-center justify-center text-lg text-[var(--text)] hover:border-[var(--text-h)] hover:text-[var(--text-h)] transition-all disabled:opacity-30 shrink-0 rounded-lg"
          title="Attach Payload"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
        />

        {/* Text input */}
        <div className="flex-1 relative flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Write message..."
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            disabled={uploading}
            className="input-minimal w-full !py-3.5 !rounded-lg"
          />
          <button
            onClick={onSend}
            disabled={!value.trim() || uploading}
            className="w-11 h-11 bg-[var(--text-h)] text-[var(--bg)] flex items-center justify-center text-xl transition-all hover:opacity-90 active:scale-90 disabled:opacity-30 rounded-lg shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>

      <p className="text-[var(--text)] text-[8px] font-mono font-bold text-center mt-4 uppercase tracking-[0.4em] opacity-30">
        End-to-End Encrypted Channel · Port 5000
      </p>
    </div>
  );
};

export default MessageInput;