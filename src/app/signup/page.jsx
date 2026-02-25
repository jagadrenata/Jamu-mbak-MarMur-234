"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus, CheckCircle, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const strength = getPasswordStrength(form.password);
  const confirmMismatch = form.confirm && form.password !== form.confirm;
  const confirmMatch = form.confirm && form.password === form.confirm && form.confirm.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!form.email.trim()) return setStatus({ type: "error", message: "Email wajib diisi." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setStatus({ type: "error", message: "Format email tidak valid." });
    if (form.password.length < 8)
      return setStatus({ type: "error", message: "Password minimal 8 karakter." });
    if (form.password !== form.confirm)
      return setStatus({ type: "error", message: "Konfirmasi password tidak cocok." });

    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", message: data.error || "Pendaftaran gagal. Coba lagi." });
        return;
      }

      setStatus({
        type: "success",
        message: `Akun berhasil dibuat! Selamat datang, ${data.user.name}. Mengalihkan...`,
      });
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch {
      setStatus({ type: "error", message: "Terjadi kesalahan. Periksa koneksi Anda." });
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = status?.type === "success";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F5F0E8" }}>
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Heading */}
          <div className="text-center mb-8">
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: "#2C1810", fontFamily: "'Georgia', serif" }}
            >
              Buat Akun Baru
            </h1>
            <p className="text-sm text-gray-500">
              Sudah punya akun?{" "}
              <a href="/login" className="font-semibold hover:underline" style={{ color: "#6B3A2A" }}>
                Masuk di sini
              </a>
            </p>
          </div>

          {/* Inline feedback banner */}
          {status && (
            <div
              className="flex items-start gap-2.5 px-4 py-3.5 mb-5 text-sm leading-relaxed"
              style={{
                background: isSuccess ? "#eafaf1" : "#fff2f2",
                border: `1px solid ${isSuccess ? "#a9dfbf" : "#f5c0c0"}`,
                color: isSuccess ? "#1e7e4a" : "#c0392b",
                animation: "fadeSlideIn 0.25s ease",
              }}
            >
              <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(-5px); } to { opacity:1; transform:translateY(0); } }`}</style>
              {isSuccess
                ? <CheckCircle size={17} className="shrink-0 mt-0.5" />
                : <XCircle size={17} className="shrink-0 mt-0.5" />
              }
              <span>{status.message}</span>
            </div>
          )}

          {/* Card */}
          <div className=" p-8 shadow-sm" style={{ background: "#FAF7F2", border: "1px solid #D9CCBA" }}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#6B3A2A" }}>
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contoh@email.com"
                  autoComplete="email"
                  disabled={isSuccess}
                  className="w-full px-4 py-3 text-sm outline-none transition-colors disabled:opacity-60"
                  style={{ border: "1px solid #D9CCBA", background: "#fff", color: "#2C1810" }}
                  onFocus={(e) => (e.target.style.borderColor = "#6B3A2A")}
                  onBlur={(e) => (e.target.style.borderColor = "#D9CCBA")}
                />
                {form.email && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    Nama akun:{" "}
                    <strong style={{ color: "#6B3A2A" }}>{deriveNameFromEmail(form.email)}</strong>
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#6B3A2A" }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    disabled={isSuccess}
                    className="w-full px-4 py-3 pr-11 text-sm outline-none transition-colors disabled:opacity-60"
                    style={{ border: "1px solid #D9CCBA", background: "#fff", color: "#2C1810" }}
                    onFocus={(e) => (e.target.style.borderColor = "#6B3A2A")}
                    onBlur={(e) => (e.target.style.borderColor = "#D9CCBA")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Strength bar */}
                {form.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex-1 h-1 rounded-full transition-colors duration-300"
                          style={{ background: i <= strength.score ? strength.color : "#E8E0D5" }}
                        />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#6B3A2A" }}>
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    placeholder="Ulangi password"
                    autoComplete="new-password"
                    disabled={isSuccess}
                    className="w-full px-4 py-3 pr-11 text-sm outline-none transition-colors disabled:opacity-60"
                    style={{
                      border: `1px solid ${confirmMismatch ? "#e74c3c" : "#D9CCBA"}`,
                      background: "#fff",
                      color: "#2C1810",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#6B3A2A")}
                    onBlur={(e) => (e.target.style.borderColor = confirmMismatch ? "#e74c3c" : "#D9CCBA")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmMismatch && (
                  <p className="text-xs mt-1.5" style={{ color: "#e74c3c" }}>Password tidak cocok.</p>
                )}
                {confirmMatch && (
                  <p className="text-xs mt-1.5" style={{ color: "#27ae60" }}>✓ Password cocok.</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || isSuccess}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all mt-1"
                style={{
                  background: isSuccess ? "#27ae60" : loading ? "#C4956A" : "#6B3A2A",
                  color: "#F5F0E8",
                  cursor: loading || isSuccess ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <><Spinner /> Memproses...</>
                ) : isSuccess ? (
                  <><CheckCircle size={16} /> Berhasil Daftar!</>
                ) : (
                  <><UserPlus size={16} /> Buat Akun</>
                )}
              </button>

            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Dengan mendaftar, Anda menyetujui{" "}
            <a href="/syarat" className="hover:underline" style={{ color: "#C4956A" }}>Syarat & Ketentuan</a>
            {" "}dan{" "}
            <a href="/privasi" className="hover:underline" style={{ color: "#C4956A" }}>Kebijakan Privasi</a>
            {" "}kami.
          </p>

        </div>
      </main>

      <Footer />
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function deriveNameFromEmail(email) {
  const raw = email.split("@")[0];
  return (
    raw
      .replace(/[._\-+]/g, " ")
      .replace(/\d+/g, "")
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
      .trim() || raw
  );
}

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return [
    { score: 0, label: "", color: "#E8E0D5" },
    { score: 1, label: "Lemah", color: "#e74c3c" },
    { score: 2, label: "Cukup", color: "#e67e22" },
    { score: 3, label: "Kuat", color: "#f1c40f" },
    { score: 4, label: "Sangat Kuat", color: "#27ae60" },
  ][score];
}

function Spinner() {
  return (
    <span
      className="inline-block rounded-full animate-spin"
      style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff" }}
    />
  );
}
