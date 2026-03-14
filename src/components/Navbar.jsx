"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ShoppingCart,
  ClipboardList,
  ChevronDown,
  Menu,
  X,
  Loader2,
  Heart,
  Info,
  Percent,
  BookOpen
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
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

export const defaultNavItems = [
  {
    label: "Produk",
    href: "/",
    icon: <ShoppingBag className='w-4 h-4' />
  },
  {
    label: "Keranjang",
    href: "/cart",
    icon: <ShoppingCart className='w-4 h-4' />
  },
  {
    label: "Pesanan",
    href: "/orders",
    icon: <ClipboardList className='w-4 h-4' />
  },
  {
    label: "Lainnya",
    icon: <Menu className='w-4 h-4' />,
    children: [
      {
        label: "Tentang kami",
        href: "/more/about",
        icon: <Info className='w-3.5 h-3.5' />
      },
      {
        label: "Kontak",
        href: "/more/contact",
        icon: <Heart className='w-3.5 h-3.5' />
      },
      {
        label: "Outlet",
        href: "/outlet",
        icon: <Percent className='w-3.5 h-3.5' />
      },
      {
        label: "E-katalog",
        href: "/more/e-catalog",
        icon: <BookOpen className='w-3.5 h-3.5' />
      }
    ]
  }
];

function AuthButtons({ user, loading, mobile = false, onClose }) {
  const baseClass = mobile
    ? "w-full text-center py-2.5 text-sm font-medium"
    : "px-4 py-2 text-sm font-medium transition-colors";

  if (loading) {
    return (
      <div className='flex items-center gap-2' style={{ color: C.mid }}>
        <Loader2 className='w-4 h-4 animate-spin' />
        {mobile && <span className='text-sm'>Memuat...</span>}
      </div>
    );
  }

  if (user) {
    return (
      <Link
        href='/dashboard'
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
        href='/login'
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
        href='/signup'
        className={baseClass}
        style={{ backgroundColor: C.accent, color: C.textLight }}
        onClick={onClose}
      >
        Sign Up
      </Link>
    </>
  );
}

function DropdownMenu({ item, pathname }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const isChildActive = item.children?.some(c => pathname === c.href);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className='relative'>
      <button
        onClick={() => setOpen(prev => !prev)}
        className='flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors rounded'
        style={{ color: isChildActive ? C.accent : C.mid }}
      >
        <span>{item.icon}</span>
        {item.label}
        <ChevronDown
          className='w-3.5 h-3.5 transition-transform'
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className='absolute right-0 top-full mt-1 w-44 rounded shadow-lg z-50'
            style={{
              backgroundColor: C.bg,
              border: `1px solid ${C.border}`
            }}
          >
            {item.children.map(sub => {
              const active = pathname === sub.href;
              return (
                <Link
                  key={sub.label}
                  href={sub.href}
                  onClick={() => setOpen(false)}
                  className='flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors'
                  style={{
                    color: active ? C.accent : C.mid,
                    backgroundColor: active ? `${C.accent}15` : "transparent"
                  }}
                >
                  <span style={{ color: active ? C.accent : C.mid }}>
                    {sub.icon}
                  </span>
                  {sub.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar({ navItems = defaultNavItems }) {
  const [open, setOpen] = useState(false);
  const [openMobileMenus, setOpenMobileMenus] = useState({});
  const pathname = usePathname();

  const { user, loading, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const toggleMobileMenu = label => {
    setOpenMobileMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

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
        className='relative w-full px-5 sm:px-8'
      >
        <div className='max-w-7xl mx-auto flex items-center justify-between h-16'>
          <Link href='/' className='flex items-center gap-2'>
            <Image src='/logo.webp' alt='logo' width={48} height={48} />
            <span
              className='text-lg font-bold'
              style={{
                fontFamily: "'Georgia', serif",
                letterSpacing: "-0.5px",
                color: C.text
              }}
            >
              jamu mbak <span style={{ color: C.accent }}>MarMur 234</span>
            </span>
          </Link>

          <div className='hidden md:flex items-center gap-1'>
            <div className='ml-2 flex items-center gap-2'>
              <AuthButtons user={user} loading={loading} />
            </div>
          </div>

          <div className='md:hidden flex items-center gap-1'>
            <Link href='/cart' className='p-2' style={{ color: C.accent }}>
              <ShoppingCart className='w-6 h-6' />
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='p-2'
              style={{ color: C.accent }}
              onClick={() => setOpen(true)}
            >
              <Menu className='w-6 h-6' />
            </motion.button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className='fixed inset-0 bg-black z-40 md:hidden'
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className='fixed inset-y-0 right-0 z-50 w-72 md:hidden flex flex-col'
              style={{
                backgroundColor: C.bg,
                boxShadow: `-4px 0 24px rgba(44,24,16,0.2)`
              }}
              variants={sidebarVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
            >
              <div
                className='p-6 flex justify-between items-center'
                style={{ borderBottom: `1px solid ${C.border}` }}
              >
                <span
                  className='font-bold flex items-center gap-2'
                  style={{ fontFamily: "'Georgia', serif", color: C.text }}
                >
                  <Image src='/logo.webp' alt='logo' width={32} height={32} />
                  jamu mbak <span style={{ color: C.accent }}>MarMur</span>
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpen(false)}
                  style={{ color: C.accent }}
                >
                  <X className='w-6 h-6' />
                </motion.button>
              </div>

              <nav className='flex-1 px-6 py-8 space-y-1 overflow-y-auto'>
                {navItems.map(item => {
                  if (item.children && item.children.length > 0) {
                    const isOpen = openMobileMenus[item.label] ?? false;
                    return (
                      <div key={item.label}>
                        <button
                          onClick={() => toggleMobileMenu(item.label)}
                          className='w-full flex items-center justify-between gap-3 px-4 py-3 text-base font-medium transition-colors'
                          style={{ color: C.accent }}
                        >
                          <div className='flex items-center gap-3'>
                            <span style={{ color: C.mid }}>{item.icon}</span>
                            {item.label}
                          </div>
                          <ChevronDown
                            className='w-4 h-4 transition-transform'
                            style={{
                              color: C.mid,
                              transform: isOpen
                                ? "rotate(180deg)"
                                : "rotate(0deg)"
                            }}
                          />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className='overflow-hidden ml-7 border-l border-dashed pl-3'
                              style={{ borderColor: `${C.border}` }}
                            >
                              {item.children.map(sub => {
                                const subActive = pathname === sub.href;
                                return (
                                  <li key={sub.label}>
                                    <Link
                                      href={sub.href}
                                      onClick={() => setOpen(false)}
                                      className='flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors'
                                      style={{
                                        color: subActive ? C.accent : C.mid,
                                        backgroundColor: subActive
                                          ? `${C.accent}15`
                                          : "transparent"
                                      }}
                                    >
                                      <span
                                        style={{
                                          color: subActive ? C.accent : C.mid
                                        }}
                                      >
                                        {sub.icon}
                                      </span>
                                      {sub.label}
                                    </Link>
                                  </li>
                                );
                              })}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className='flex items-center gap-3 px-4 py-3 text-base font-medium transition-colors'
                      style={
                        isActive
                          ? { backgroundColor: C.accent, color: C.textLight }
                          : { color: C.accent }
                      }
                      onClick={() => setOpen(false)}
                    >
                      <span style={{ color: isActive ? C.textLight : C.mid }}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div
                className='px-6 py-6 flex flex-col gap-3'
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
