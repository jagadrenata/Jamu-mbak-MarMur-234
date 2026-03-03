"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ShoppingCart,
  ClipboardList,
  Menu,
  X,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";

export const C = {
  bg: "#F5F0E8",
  bgCard: "#FAF7F2",
  bgDark: "#2C1810",
  bgDarkCard: "#3D2318",
  accent: "#6B3A2A",
  mid: "#C4956A",
  border: "#D9CCBA",
  text: "#2C1810",
  textLight: "#F5F0E8"
};

const navItems = [
  { label: "Products", href: "/", icon: <ShoppingBag className="w-5 h-5" /> },
  { label: "Cart", href: "/cart", icon: <ShoppingCart className="w-5 h-5" /> },
  {
    label: "My Orders",
    href: "/orders",
    icon: <ClipboardList className="w-5 h-5" />
  }
];

function AuthButtons({ user, loading, mobile = false, onClose }) {
  const baseClass = mobile
    ? "w-full text-center py-2.5 text-sm font-medium"
    : "px-4 py-2 text-sm font-medium transition-colors";

  if (loading) {
    return (
      <div className="flex items-center gap-2" style={{ color: C.mid }}>
        <Loader2 className="w-4 h-4 animate-spin" />
        {mobile && <span className="text-sm">Memuat...</span>}
      </div>
    );
  }

  if (user) {
    return (
      <Link
        href="/dashboard"
        className={`${baseClass} flex items-center justify-center gap-2`}
        style={{ backgroundColor: C.accent, color: C.textLight }}
        onClick={onClose}
      >
        Dashboard
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className={baseClass}
        style={
          mobile
            ? { border: `1px solid ${C.border}`, color: C.accent }
            : { color: C.accent }
        }
        onClick={onClose}
      >
        Login
      </Link>
      <Link
        href="/signup"
        className={baseClass}
        style={{ backgroundColor: C.accent, color: C.textLight }}
        onClick={onClose}
      >
        Sign Up
      </Link>
    </>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const { user, loading, fetchUser } = useAuthStore();

  // Fetch sekali saat Navbar pertama mount.
  // Karena state ada di Zustand (module scope), kalau user navigasi
  // ke page lain dan Navbar re-mount, hasFetched = true → tidak fetch ulang.
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const sidebarVariants = {
    hidden: { x: "100%" },
    visible: {
      x: 0,
      transition: { type: "spring", damping: 25, stiffness: 200 }
    },
    exit: { x: "100%", transition: { duration: 0.3, ease: "easeIn" } }
  };

  return (
    <>
      <header
        style={{
          backgroundColor: C.bg,
          borderBottom: `1px solid ${C.border}`
        }}
        className="relative w-full px-5 sm:px-8"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.webp" alt="logo" width={48} height={48} />
            <span
              className="text-lg font-bold"
              style={{
                fontFamily: "'Georgia', serif",
                letterSpacing: "-0.5px",
                color: C.text
              }}
            >
              jamu mbak <span style={{ color: C.accent }}>MarMur 234</span>
            </span>
          </Link>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <AuthButtons user={user} loading={loading} />
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <Link href="/cart" className="p-2" style={{ color: C.accent }}>
              <ShoppingCart className="w-6 h-6" />
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2"
              style={{ color: C.accent }}
              onClick={() => setOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 z-50 w-72 md:hidden flex flex-col"
              style={{
                backgroundColor: C.bg,
                boxShadow: `-4px 0 24px rgba(44,24,16,0.2)`
              }}
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Sidebar Header */}
              <div
                className="p-6 flex justify-between items-center"
                style={{ borderBottom: `1px solid ${C.border}` }}
              >
                <span
                  className="font-bold flex items-center gap-2"
                  style={{ fontFamily: "'Georgia', serif", color: C.text }}
                >
                  <Image src="/logo.webp" alt="logo" width={32} height={32} />
                  jamu mbak <span style={{ color: C.accent }}>MarMur</span>
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpen(false)}
                  style={{ color: C.accent }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Nav Items */}
              <nav className="flex-1 px-6 py-8 space-y-2">
                {navItems.map(({ label, href, icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={label}
                      href={href}
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium transition-colors"
                      style={
                        isActive
                          ? { backgroundColor: C.accent, color: C.textLight }
                          : { color: C.accent }
                      }
                      onClick={() => setOpen(false)}
                    >
                      <span style={{ color: isActive ? C.textLight : C.mid }}>
                        {icon}
                      </span>
                      {label}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Auth Buttons */}
              <div
                className="px-6 py-6 flex flex-col gap-3"
                style={{ borderTop: `1px solid ${C.border}` }}
              >
                <AuthButtons
                  user={user}
                  loading={loading}
                  mobile
                  onClose={() => setOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
