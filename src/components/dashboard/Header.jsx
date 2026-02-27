'use client';

import { ChevronRight, Home, Bell, Search, Settings, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Props:
 *  - title        : string   — Judul halaman (e.g. "Dashboard", "Artikel")
 *  - description  : string   — Sub-teks di bawah judul (opsional)
 *  - breadcrumbs  : Array<{ label: string, href?: string }>
 *  - actions      : ReactNode — Tombol / elemen tambahan di sisi kanan (opsional)
 *  - user         : { name: string, avatar?: string, role?: string } (opsional)
 */




export default function DashboardHeader({
  title = 'Dashboard',
  description,
  breadcrumbs = [],
  actions,
  user = { name: 'Admin', role: 'Administrator' },
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className="sticky top-0 z-50 border-b border-[#e8ddd0] bg-[#fdf8f3]"
      style={{ fontFamily: 'var(--font-dm-sans)' }}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-7 h-14 bg-[#2c2420] max-sm:px-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <span
            className="w-2.5 h-2.5 rounded-full bg-[#c5b79d]"
            style={{ boxShadow: '0 0 0 3px rgba(197,183,157,.25)' }}
          />
          <span
            className="text-[1.05rem] text-[#f5ede3] tracking-[.03em]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Jamu Mbak MarMur 234
          </span>
        </div>

        {/* Right: utilities */}
        <div className="flex items-center gap-1.5">
          {/* Search */}
          <div className="flex items-center gap-1">
            {searchOpen && (
              <input
                autoFocus
                className="bg-white/[.08] border border-[#c5b79d]/30 rounded-lg text-[#f5ede3] text-[.85rem] px-3 py-1.5 w-[220px] outline-none focus:border-[#c5b79d] placeholder:text-[#9e9089] transition-colors max-sm:w-[160px]"
                style={{ fontFamily: 'var(--font-dm-sans)' }}
                placeholder="Cari halaman, artikel…"
                onBlur={() => setSearchOpen(false)}
              />
            )}
            <button
              className="flex items-center justify-center w-9 h-9 rounded-lg text-[#c5b79d] hover:bg-[#c5b79d]/15 hover:text-[#f5ede3] transition-colors cursor-pointer border-none bg-transparent"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Cari"
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>
          </div>

          {/* Notifikasi */}
          <div className="relative">
            <button
              className="relative flex items-center justify-center w-9 h-9 rounded-lg text-[#c5b79d] hover:bg-[#c5b79d]/15 hover:text-[#f5ede3] transition-colors cursor-pointer border-none bg-transparent"
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notifikasi"
            >
              <Bell size={18} />
              <span className="absolute top-[5px] right-[5px] w-4 h-4 bg-[#e57c5b] rounded-full text-[.6rem] font-semibold text-white flex items-center justify-center pointer-events-none">
                3
              </span>
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-60 bg-[#2c2420] border border-[#c5b79d]/20 rounded-[10px] p-3 shadow-[0_8px_24px_rgba(0,0,0,.35)] z-50">
                <p className="text-[.7rem] font-semibold uppercase tracking-[.08em] text-[#9e9089] mb-2.5">
                  Notifikasi
                </p>
                {[
                  'Artikel baru ditambahkan',
                  'Komentar perlu dimoderasi',
                  'Update sistem tersedia',
                ].map((n, i, arr) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-[.82rem] text-[#e8ddd0] py-2 ${
                      i < arr.length - 1 ? 'border-b border-[#c5b79d]/10' : ''
                    }`}
                  >
                    <span className="w-1.5 h-1.5 shrink-0 bg-[#c5b79d] rounded-full" />
                    {n}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <Link
            href="/settings"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-[#c5b79d] hover:bg-[#c5b79d]/15 hover:text-[#f5ede3] transition-colors no-underline"
            aria-label="Pengaturan"
          >
            <Settings size={18} />
          </Link>

          {/* Avatar */}
          <div className="flex items-center gap-2.5 px-2.5 py-1 rounded-[10px] cursor-pointer hover:bg-[#c5b79d]/10 transition-colors ml-1.5">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={34}
                height={34}
                className="rounded-full shrink-0 object-cover"
              />
            ) : (
              <div
                className="w-[34px] h-[34px] rounded-full shrink-0 flex items-center justify-center text-[.8rem] font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #c5b79d, #8b5e3c)' }}
              >
                {initials}
              </div>
            )}
            <div className="flex flex-col max-sm:hidden">
              <span className="text-[.82rem] font-semibold text-[#f5ede3] leading-[1.2]">
                {user.name}
              </span>
              {user.role && (
                <span className="text-[.7rem] text-[#9e9089]">{user.role}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex items-end justify-between px-7 pt-5 pb-[18px] gap-4 max-sm:flex-col max-sm:items-start max-sm:px-4 max-sm:pt-4 max-sm:pb-3.5">
        <div>
          {/* Breadcrumb */}
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-0.5 mb-2" aria-label="Breadcrumb">
              <Link
                href="/"
                className="flex items-center text-[#8b7355] hover:text-[#5a4a3a] transition-colors"
                aria-label="Home"
              >
                <Home size={14} />
              </Link>
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <span key={i} className="flex items-center gap-0.5">
                    <ChevronRight size={14} className="text-[#c2b18f] shrink-0" />
                    {isLast || !crumb.href ? (
                      <span
                        className={`text-[.78rem] font-medium ${
                          isLast
                            ? 'text-[#3d2f22] font-semibold'
                            : 'text-[#8b7355]'
                        }`}
                      >
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="text-[.78rem] font-medium text-[#8b7355] hover:text-[#5a4a3a] hover:underline transition-colors no-underline"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </span>
                );
              })}
            </nav>
          )}

          {/* Title + description */}
          <h1
            className="text-[1.75rem] text-[#2c2420] leading-[1.15] m-0"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {title}
          </h1>
          {description && (
            <p className="text-[.85rem] text-[#8b7355] mt-1 mb-0">{description}</p>
          )}
        </div>

        {/* Custom action slot */}
        {actions && (
          <div className="flex items-center gap-2.5 shrink-0">{actions}</div>
        )}
      </div>
    </header>
  );
}
