"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const identifier = form.identifier.trim();
    const { password } = form;

    // Validasi client-side
    if (!identifier || !password) {
      toast.error("Identifier dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Login gagal. Coba lagi.");
        return;
      }

      toast.success(`Selamat datang kembali, ${data.user.name}!`);
      router.push("/dashboard");
      router.refresh(); // sync cookie/session ke layout
    } catch {
      toast.error("Terjadi kesalahan. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  };

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
              Masuk ke Akun
            </h1>
            <p className="text-sm text-gray-500">
              Belum punya akun?{" "}
              <a href="/signup" className="font-semibold hover:underline" style={{ color: "#6B3A2A" }}>
                Daftar sekarang
              </a>
            </p>
          </div>

          {/* Card */}
          <div className="p-8 shadow-sm" style={{ background: "#FAF7F2", border: "1px solid #D9CCBA" }}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

              {/* Identifier */}
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: "#6B3A2A" }}
                >
                  Email atau Nomor Telepon
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  value={form.identifier}
                  onChange={handleChange}
                  placeholder="contoh@email.com atau 08123456789"
                  autoComplete="username"
                  disabled={loading}
                  className="w-full px-4 py-3 text-sm outline-none transition-colors disabled:opacity-50"
                  style={{ border: "1px solid #D9CCBA", background: "#fff", color: "#2C1810" }}
                  onFocus={(e) => (e.target.style.borderColor = "#6B3A2A")}
                  onBlur={(e) => (e.target.style.borderColor = "#D9CCBA")}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold"
                    style={{ color: "#6B3A2A" }}
                  >
                    Password
                  </label>
                  <a href="/forgot-password" className="text-xs hover:underline" style={{ color: "#C4956A" }}>
                    Lupa password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full px-4 py-3 pr-11 text-sm outline-none transition-colors disabled:opacity-50"
                    style={{ border: "1px solid #D9CCBA", background: "#fff", color: "#2C1810" }}
                    onFocus={(e) => (e.target.style.borderColor = "#6B3A2A")}
                    onBlur={(e) => (e.target.style.borderColor = "#D9CCBA")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-opacity mt-1"
                style={{
                  background: loading ? "#C4956A" : "#6B3A2A",
                  color: "#F5F0E8",
                  cursor: loading ? "wait" : "pointer",
                }}
              >
                {loading ? <><Spinner /> Memproses...</> : <><LogIn size={16} /> Masuk</>}
              </button>

            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Dengan masuk, Anda menyetujui{" "}
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

function Spinner() {
  return (
    <span
      className="inline-block rounded-full animate-spin"
      style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff" }}
    />
  );
}
