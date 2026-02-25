"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, User, Phone, Mail, Shield, Save, X } from "lucide-react";
import { C } from "@/components/Navbar";


export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/me");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUser(data.user);
      setForm({ name: data.user.name, phone: data.user.phone || "" });
    } catch {
      // redirect to login if needed
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const body = new FormData();
      body.append("name", form.name);
      body.append("phone", form.phone);
      if (avatarFile) body.append("avatar", avatarFile);

      const res = await fetch("/api/user/me", { method: "PATCH", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan.");
      setUser(data.user);
      setAvatarFile(null);
      setAvatarPreview(null);
      setEditing(false);
      setSaveMsg("Profil berhasil diperbarui!");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setSaveMsg(err.message || "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setAvatarPreview(null);
    setAvatarFile(null);
    if (user) setForm({ name: user.name, phone: user.phone || "" });
  };

  const avatarSrc = avatarPreview || user?.avatar_url || null;

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
          background: C.bg
        }}
      >
        <div style={{ color: C.mid, fontSize: "14px" }}>Memuat profil...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'Georgia', serif"
      }}
    >
      <div style={{ background: C.bgDark, padding: "24px 32px" }}>
        <h1
          style={{
            color: C.textLight,
            fontSize: "22px",
            fontWeight: 600,
            margin: 0
          }}
        >
          Profil Saya
        </h1>
        <p style={{ color: C.mid, fontSize: "13px", margin: "4px 0 0" }}>
          Lihat dan perbarui informasi pribadi Anda
        </p>
      </div>

      <div
        style={{
          maxWidth: "680px",
          margin: "32px auto",
          padding: "0 24px 48px"
        }}
      >
        {saveMsg && (
          <div
            style={{
              padding: "12px 18px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
              background: saveMsg.includes("berhasil") ? "#eafaf1" : "#fff8f8",
              color: saveMsg.includes("berhasil") ? "#27ae60" : "#c0392b",
              border: `1px solid ${saveMsg.includes("berhasil") ? "#a9dfbf" : "#f5c6c6"}`
            }}
          >
            {saveMsg}
          </div>
        )}

        {/* Avatar Card */}
        <div
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            padding: "28px 24px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "24px"
          }}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              style={{
                width: "88px",
                height: "88px",
                borderRadius: "50%",
                overflow: "hidden",
                background: C.border,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `3px solid ${C.mid}`
              }}
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt='avatar'
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <User size={36} color={C.mid} />
              )}
            </div>
            {editing && (
              <>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: C.accent,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Camera size={14} color='#fff' />
                </button>
                <input
                  ref={fileRef}
                  type='file'
                  accept='image/*'
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
              </>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: C.text,
                margin: "0 0 4px"
              }}
            >
              {user?.name}
            </p>
            <p style={{ fontSize: "13px", color: "#888", margin: "0 0 8px" }}>
              {user?.email}
            </p>
            <span
              style={{
                display: "inline-block",
                padding: "3px 10px",
                borderRadius: "20px",
                fontSize: "11px",
                background: user?.role === "vip" ? C.mid : C.border,
                color: user?.role === "vip" ? "#fff" : C.accent,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              {user?.role === "vip" ? "⭐ VIP" : "Customer"}
            </span>
          </div>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: "9px 18px",
                background: C.accent,
                color: C.textLight,
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                whiteSpace: "nowrap"
              }}
            >
              Edit Profil
            </button>
          ) : (
            <button
              onClick={handleCancel}
              style={{
                padding: "9px 18px",
                background: C.border,
                color: C.text,
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px"
              }}
            >
              <X
                size={14}
                style={{ verticalAlign: "middle", marginRight: "4px" }}
              />
              Batal
            </button>
          )}
        </div>

        {/* Info Fields */}
        <div
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "24px"
          }}
        >
          <div
            style={{
              padding: "14px 24px",
              background: C.bg,
              borderBottom: `1px solid ${C.border}`
            }}
          >
            <h2
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: C.text,
                margin: 0
              }}
            >
              Informasi Pribadi
            </h2>
          </div>
          <div
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "18px"
            }}
          >
            <Field
              icon={<User size={15} color={C.accent} />}
              label='Nama Lengkap'
              value={editing ? undefined : user?.name || ""}
              editing={editing}
              inputValue={form.name}
              onChange={v => setForm({ ...form, name: v })}
            />
            <Field
              icon={<Mail size={15} color={C.accent} />}
              label='Email'
              value={user?.email || ""}
              editing={false}
              hint='Email tidak dapat diubah'
            />
            <Field
              icon={<Phone size={15} color={C.accent} />}
              label='Nomor Telepon'
              value={editing ? undefined : user?.phone || "—"}
              editing={editing}
              inputValue={form.phone}
              onChange={v => setForm({ ...form, phone: v })}
              placeholder='+62 812 3456 7890'
              type='tel'
            />
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Shield size={15} color={C.accent} />
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#888",
                    margin: "0 0 2px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}
                >
                  Bergabung sejak
                </p>
                <p style={{ fontSize: "14px", color: C.text, margin: 0 }}>
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {editing && (
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            style={{
              width: "100%",
              padding: "13px",
              background: C.accent,
              color: C.textLight,
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              opacity: !form.name.trim() ? 0.5 : 1
            }}
          >
            <Save size={16} /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  editing,
  inputValue,
  onChange,
  hint,
  placeholder,
  type = "text"
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: editing ? "flex-start" : "center",
        gap: "12px"
      }}
    >
      <div style={{ paddingTop: editing ? "8px" : 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: "11px",
            color: "#888",
            margin: "0 0 4px",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}
        >
          {label}
        </p>
        {editing && onChange !== undefined ? (
          <input
            type={type}
            value={inputValue}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "1px solid #D9CCBA",
              borderRadius: "6px",
              background: "#fff",
              fontSize: "14px",
              color: "#2C1810",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        ) : (
          <>
            <p style={{ fontSize: "14px", color: "#2C1810", margin: 0 }}>
              {value}
            </p>
            {hint && (
              <p style={{ fontSize: "11px", color: "#aaa", margin: "2px 0 0" }}>
                {hint}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
