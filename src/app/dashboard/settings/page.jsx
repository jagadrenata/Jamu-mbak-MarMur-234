"use client";

import { useState } from "react";
import {
  Bell,
  Lock,
  LogOut,
  Trash2,
  MessageCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Check
} from "lucide-react";
import { C } from "@/components/Navbar";

export default function SettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [notif, setNotif] = useState({
    email_promo: true,
    email_order: true,
    push_order: true,
    push_promo: false
  });
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteInfo, setShowDeleteInfo] = useState(false);

  const handlePasswordChange = async e => {
    e.preventDefault();
    setPasswordError("");
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError("Password baru tidak cocok.");
      return;
    }
    if (passwordForm.newPass.length < 8) {
      setPasswordError("Password minimal 8 karakter.");
      return;
    }
    setPasswordLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setPasswordLoading(false);
    setPasswordSuccess(true);
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleNotifSave = async () => {
    setNotifLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setNotifLoading(false);
    setNotifSuccess(true);
    setTimeout(() => setNotifSuccess(false), 3000);
  };

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/";
    window.location.href = "/login";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'Georgia', serif"
      }}
    >
      <div
        style={{
          background: C.bgDark,
          padding: "24px 32px",
          marginBottom: "32px"
        }}
      >
        <h1
          style={{
            color: C.textLight,
            fontSize: "22px",
            fontWeight: 600,
            margin: 0,
            letterSpacing: "0.5px"
          }}
        >
          Pengaturan Akun
        </h1>
        <p style={{ color: C.mid, fontSize: "13px", margin: "4px 0 0" }}>
          Kelola keamanan, notifikasi, dan akun Anda
        </p>
      </div>

      <div
        style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px 48px" }}
      >
        <Section title='Keamanan' icon={<Lock size={16} />}>
          <form onSubmit={handlePasswordChange}>
            <PasswordField
              label='Password Saat Ini'
              value={passwordForm.current}
              show={showCurrentPassword}
              onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
              onChange={v => setPasswordForm({ ...passwordForm, current: v })}
            />
            <PasswordField
              label='Password Baru'
              value={passwordForm.newPass}
              show={showNewPassword}
              onToggle={() => setShowNewPassword(!showNewPassword)}
              onChange={v => setPasswordForm({ ...passwordForm, newPass: v })}
            />
            <PasswordField
              label='Konfirmasi Password Baru'
              value={passwordForm.confirm}
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              onChange={v => setPasswordForm({ ...passwordForm, confirm: v })}
            />
            {passwordError && (
              <p
                style={{ color: "#c0392b", fontSize: "13px", marginTop: "8px" }}
              >
                {passwordError}
              </p>
            )}
            <button
              type='submit'
              disabled={
                passwordLoading ||
                !passwordForm.current ||
                !passwordForm.newPass ||
                !passwordForm.confirm
              }
              style={{
                marginTop: "16px",
                padding: "10px 24px",
                background: passwordSuccess ? "#27ae60" : C.accent,
                color: C.textLight,
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: passwordLoading ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity:
                  !passwordForm.current ||
                  !passwordForm.newPass ||
                  !passwordForm.confirm
                    ? 0.5
                    : 1,
                transition: "background 0.3s"
              }}
            >
              {passwordSuccess ? (
                <>
                  <Check size={14} /> Berhasil diubah!
                </>
              ) : passwordLoading ? (
                "Menyimpan..."
              ) : (
                "Ubah Password"
              )}
            </button>
          </form>
        </Section>

        <Section title='Notifikasi' icon={<Bell size={16} />}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {[
              { key: "email_order", label: "Email konfirmasi pesanan" },
              { key: "email_promo", label: "Email promosi & penawaran" },
              { key: "push_order", label: "Push notification status pesanan" },
              { key: "push_promo", label: "Push notification promo" }
            ].map(item => (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span style={{ fontSize: "14px", color: C.text }}>
                  {item.label}
                </span>
                <Toggle
                  value={notif[item.key]}
                  onChange={v => setNotif({ ...notif, [item.key]: v })}
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleNotifSave}
            disabled={notifLoading}
            style={{
              marginTop: "20px",
              padding: "10px 24px",
              background: notifSuccess ? "#27ae60" : C.mid,
              color: C.textLight,
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "background 0.3s"
            }}
          >
            {notifSuccess ? (
              <>
                <Check size={14} /> Tersimpan!
              </>
            ) : notifLoading ? (
              "Menyimpan..."
            ) : (
              "Simpan Preferensi"
            )}
          </button>
        </Section>

        <Section title='Sesi' icon={<LogOut size={16} />}>
          {!showLogoutConfirm ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              style={dangerButtonStyle()}
            >
              <LogOut size={15} /> Keluar dari Akun
            </button>
          ) : (
            <div
              style={{
                background: "#fff8f8",
                border: "1px solid #f5c6c6",
                borderRadius: "8px",
                padding: "16px"
              }}
            >
              <p
                style={{ fontSize: "14px", color: C.text, margin: "0 0 14px" }}
              >
                Yakin ingin keluar dari sesi ini?
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleLogout}
                  style={{ ...dangerButtonStyle(), padding: "8px 18px" }}
                >
                  Ya, Keluar
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    padding: "8px 18px",
                    background: C.border,
                    color: C.text,
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </Section>

        <Section title='Hapus Akun' icon={<Trash2 size={16} />}>
          {!showDeleteInfo ? (
            <div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#888",
                  marginBottom: "14px",
                  lineHeight: "1.6"
                }}
              >
                Penghapusan akun dilakukan secara manual oleh admin. Data Anda
                akan dihapus sepenuhnya setelah verifikasi.
              </p>
              <button
                onClick={() => setShowDeleteInfo(true)}
                style={dangerButtonStyle()}
              >
                <Trash2 size={15} /> Hapus Akun Saya
              </button>
            </div>
          ) : (
            <div
              style={{
                background: "#fff8f8",
                border: "1px solid #f5c6c6",
                borderRadius: "8px",
                padding: "20px"
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#c0392b",
                  margin: "0 0 8px"
                }}
              >
                Penghapusan akun memerlukan konfirmasi admin
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: C.text,
                  margin: "0 0 16px",
                  lineHeight: "1.6"
                }}
              >
                Untuk menghapus akun, silakan hubungi admin kami melalui chat.
                Sertakan alasan penghapusan dan verifikasi identitas Anda.
              </p>
              <a
                href='/dashboard/chat-admin?subject=hapus-akun'
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  background: C.bgDark,
                  color: C.textLight,
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontSize: "14px"
                }}
              >
                <MessageCircle size={15} /> Chat dengan Admin
                <ChevronRight size={14} />
              </a>
              <button
                onClick={() => setShowDeleteInfo(false)}
                style={{
                  marginLeft: "10px",
                  padding: "10px 16px",
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: C.text
                }}
              >
                Batal
              </button>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div
      style={{
        marginBottom: "28px",
        background: "#FAF7F2",
        border: "1px solid #D9CCBA",
        borderRadius: "12px",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #D9CCBA",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#F5F0E8"
        }}
      >
        <span style={{ color: "#6B3A2A" }}>{icon}</span>
        <h2
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#2C1810",
            margin: 0
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ padding: "24px" }}>{children}</div>
    </div>
  );
}

function PasswordField({ label, value, show, onToggle, onChange }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label
        style={{
          fontSize: "13px",
          color: "#6B3A2A",
          display: "block",
          marginBottom: "6px",
          fontWeight: 600
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 40px 10px 12px",
            border: "1px solid #D9CCBA",
            borderRadius: "6px",
            background: "#fff",
            fontSize: "14px",
            color: "#2C1810",
            outline: "none",
            boxSizing: "border-box"
          }}
        />
        <button
          type='button'
          onClick={onToggle}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#888"
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        background: value ? "#6B3A2A" : "#D9CCBA",
        position: "relative",
        transition: "background 0.3s"
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "3px",
          left: value ? "23px" : "3px",
          width: "18px",
          height: "18px",
          background: "#fff",
          borderRadius: "50%",
          transition: "left 0.3s"
        }}
      />
    </button>
  );
}

function dangerButtonStyle() {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    background: "#c0392b",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer"
  };
}
