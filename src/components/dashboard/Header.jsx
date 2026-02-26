'use client';

import { ChevronRight, Home, Bell, Search, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

/**
 * Props:
 *  - title        : string   — Judul halaman (e.g. "Dashboard", "Artikel")
 *  - description  : string   — Sub-teks di bawah judul (opsional)
 *  - breadcrumbs  : Array<{ label: string, href?: string }>
 *                             — List item breadcrumb. Item terakhir = halaman aktif.
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
    <header className="dashboard-header">
      {/*  Top Bar  */}
      <div className="top-bar">
        {/* Kiri: Logo / Brand */}
        <div className="brand">
          <span className="brand-dot" />
          <span className="brand-name">CMS Studio</span>
        </div>

        {/* Kanan: utilitas */}
        <div className="top-actions">
          {/* Search */}
          <div className={`search-wrap ${searchOpen ? 'open' : ''}`}>
            {searchOpen && (
              <input
                autoFocus
                className="search-input"
                placeholder="Cari halaman, artikel…"
                onBlur={() => setSearchOpen(false)}
              />
            )}
            <button
              className="icon-btn"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Cari"
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>
          </div>

          {/* Notifikasi */}
          <div className="notif-wrap">
            <button
              className="icon-btn notif-btn"
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notifikasi"
            >
              <Bell size={18} />
              <span className="notif-badge">3</span>
            </button>
            {notifOpen && (
              <div className="notif-dropdown">
                <p className="notif-title">Notifikasi</p>
                {[
                  'Artikel baru ditambahkan',
                  'Komentar perlu dimoderasi',
                  'Update sistem tersedia',
                ].map((n, i) => (
                  <div key={i} className="notif-item">
                    <span className="notif-dot" />
                    {n}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <Link href="/settings" className="icon-btn" aria-label="Pengaturan">
            <Settings size={18} />
          </Link>

          {/* Avatar */}
          <div className="avatar-wrap">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="avatar-img" />
            ) : (
              <div className="avatar-initials">{initials}</div>
            )}
            <div className="avatar-info">
              <span className="avatar-name">{user.name}</span>
              {user.role && <span className="avatar-role">{user.role}</span>}
            </div>
          </div>
        </div>
      </div>

      {/*  Page Header  */}
      <div className="page-header">
        <div className="page-header-left">
          {/* Breadcrumb */}
          {breadcrumbs.length > 0 && (
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/" className="bc-home" aria-label="Home">
                <Home size={14} />
              </Link>
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <span key={i} className="bc-item">
                    <ChevronRight size={14} className="bc-sep" />
                    {isLast || !crumb.href ? (
                      <span className={`bc-label ${isLast ? 'active' : ''}`}>
                        {crumb.label}
                      </span>
                    ) : (
                      <Link href={crumb.href} className="bc-label bc-link">
                        {crumb.label}
                      </Link>
                    )}
                  </span>
                );
              })}
            </nav>
          )}

          {/* Title + description */}
          <h1 className="page-title">{title}</h1>
          {description && <p className="page-desc">{description}</p>}
        </div>

        {/* Slot untuk tombol aksi custom */}
        {actions && <div className="page-actions">{actions}</div>}
      </div>

      {/*  Styles  */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');

        .dashboard-header {
          font-family: 'DM Sans', sans-serif;
          background: #fdf8f3;
          border-bottom: 1px solid #e8ddd0;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        /*  Top Bar  */
        .top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          height: 56px;
          background: #2c2420;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #c5b79d;
          box-shadow: 0 0 0 3px rgba(197,183,157,.25);
        }
        .brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem;
          color: #f5ede3;
          letter-spacing: .03em;
        }

        .top-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* icon buttons */
        .icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #c5b79d;
          cursor: pointer;
          transition: background .18s, color .18s;
          text-decoration: none;
        }
        .icon-btn:hover { background: rgba(197,183,157,.15); color: #f5ede3; }

        /* search */
        .search-wrap { display: flex; align-items: center; gap: 4px; }
        .search-input {
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(197,183,157,.3);
          border-radius: 8px;
          color: #f5ede3;
          font-family: 'DM Sans', sans-serif;
          font-size: .85rem;
          padding: 6px 12px;
          width: 220px;
          outline: none;
          transition: border-color .2s;
        }
        .search-input::placeholder { color: #9e9089; }
        .search-input:focus { border-color: #c5b79d; }

        /* notif */
        .notif-wrap { position: relative; }
        .notif-btn { position: relative; }
        .notif-badge {
          position: absolute; top: 5px; right: 5px;
          width: 16px; height: 16px;
          background: #e57c5b;
          border-radius: 50%;
          font-size: .6rem; font-weight: 600;
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          pointer-events: none;
        }
        .notif-dropdown {
          position: absolute; right: 0; top: calc(100% + 8px);
          width: 240px;
          background: #2c2420;
          border: 1px solid rgba(197,183,157,.2);
          border-radius: 10px;
          padding: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,.35);
        }
        .notif-title {
          font-size: .7rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: .08em;
          color: #9e9089; margin-bottom: 10px;
        }
        .notif-item {
          display: flex; align-items: center; gap: 8px;
          font-size: .82rem; color: #e8ddd0;
          padding: 8px 0;
          border-bottom: 1px solid rgba(197,183,157,.1);
        }
        .notif-item:last-child { border-bottom: none; }
        .notif-dot {
          width: 6px; height: 6px; flex-shrink: 0;
          background: #c5b79d; border-radius: 50%;
        }

        /* avatar */
        .avatar-wrap {
          display: flex; align-items: center; gap: 10px;
          padding: 4px 10px;
          border-radius: 10px;
          cursor: pointer;
          transition: background .18s;
          margin-left: 6px;
        }
        .avatar-wrap:hover { background: rgba(197,183,157,.1); }
        .avatar-img, .avatar-initials {
          width: 34px; height: 34px; border-radius: 50%;
          flex-shrink: 0;
        }
        .avatar-initials {
          background: linear-gradient(135deg, #c5b79d, #8b5e3c);
          display: flex; align-items: center; justify-content: center;
          font-size: .8rem; font-weight: 600; color: #fff;
        }
        .avatar-info { display: flex; flex-direction: column; }
        .avatar-name { font-size: .82rem; font-weight: 600; color: #f5ede3; line-height: 1.2; }
        .avatar-role { font-size: .7rem; color: #9e9089; }

        /*  Page Header  */
        .page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 20px 28px 18px;
          gap: 16px;
        }

        /* breadcrumb */
        .breadcrumb {
          display: flex; align-items: center; gap: 2px;
          margin-bottom: 8px;
        }
        .bc-home {
          display: flex; align-items: center;
          color: #8b7355;
          text-decoration: none;
          transition: color .15s;
        }
        .bc-home:hover { color: #5a4a3a; }
        .bc-item { display: flex; align-items: center; gap: 2px; }
        .bc-sep { color: #c2b18f; flex-shrink: 0; }
        .bc-label {
          font-size: .78rem;
          color: #8b7355;
          font-weight: 500;
        }
        .bc-label.active { color: #3d2f22; font-weight: 600; }
        .bc-link {
          text-decoration: none;
          transition: color .15s;
        }
        .bc-link:hover { color: #5a4a3a; text-decoration: underline; }

        /* title */
        .page-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          color: #2c2420;
          line-height: 1.15;
          margin: 0;
        }
        .page-desc {
          font-size: .85rem;
          color: #8b7355;
          margin: 4px 0 0;
        }

        .page-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

        /* responsive */
        @media (max-width: 640px) {
          .top-bar { padding: 0 16px; }
          .page-header { padding: 16px 16px 14px; flex-direction: column; align-items: flex-start; }
          .avatar-info { display: none; }
          .search-input { width: 160px; }
        }
      `}</style>
    </header>
  );
}
