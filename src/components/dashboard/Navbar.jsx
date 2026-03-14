"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, LogOut, Settings, User, Bell } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

function UserAvatar({ name, avatarUrl, size = 36 }) {
  const initials = name
    ? name
        .split(" ")
        .map(w => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        className='w-full h-full object-cover'
      />
    );
  }

  return (
    <span className='text-white text-xs font-bold select-none'>{initials}</span>
  );
}

const ROLE_LABEL = {
  customer: "Customer",
  admin: "Admin",
  superadmin: "Super Admin"
};

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, loading, fetchUser, clearUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    clearUser();
    window.location.href = "/login";
  };

  const displayName = user?.name || "Pengguna";
  const roleLabel = ROLE_LABEL[user?.role] || user?.role || "";

  return (
    <nav className='fixed top-0 left-0 right-0 md:relative h-16 bg-white border-b border-gray-200 z-30'>
      <div className='flex items-center justify-between h-full px-4 md:px-6'>
        <div className='flex-1 flex items-center gap-3'>
          <div className='hidden md:flex items-center bg-gray-50 border border-gray-200 rounded px-3 py-2 w-60 gap-2 focus-within:border-gray-400 transition-colors'>
            <svg
              className='w-4 h-4 text-gray-400 flex-shrink-0'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
            <input
              type='text'
              placeholder='Cari...'
              className='bg-transparent outline-none w-full text-sm text-gray-700 placeholder-gray-400'
            />
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <button className='relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors'>
            <Bell className='w-5 h-5' />
            <span className='absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full' />
          </button>

          <div className='w-px h-5 bg-gray-200 mx-1' />

          <div className='relative' ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(v => !v)}
              className='flex items-center gap-2.5 px-2 py-1.5 hover:bg-gray-100 rounded transition-colors'
            >
              <div className='w-8 h-8 rounded-full bg-gradient-to-br from-beige-500 to-cream-600 flex items-center justify-center overflow-hidden flex-shrink-0'>
                <UserAvatar
                  name={user?.name}
                  avatarUrl={user?.avatar_url}
                  size={32}
                />
              </div>

              <div className='hidden sm:flex flex-col items-start leading-tight'>
                {loading ? (
                  <>
                    <span className='w-20 h-3 bg-gray-200 rounded animate-pulse' />
                    <span className='w-12 h-2.5 bg-gray-100 rounded animate-pulse mt-1' />
                  </>
                ) : (
                  <>
                    <span className='text-sm font-semibold text-gray-900 max-w-[120px] truncate'>
                      {displayName}
                    </span>
                    <span className='text-xs text-gray-500'>{roleLabel}</span>
                  </>
                )}
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className='absolute right-0 mt-1.5 w-52 bg-white rounded border border-gray-200 shadow-md py-1 z-50'>
                <div className='px-4 py-2.5 border-b border-gray-100'>
                  <p className='text-sm font-semibold text-gray-900 truncate'>
                    {displayName}
                  </p>
                  <p className='text-xs text-gray-500 truncate mt-0.5'>
                    {user?.email || ""}
                  </p>
                </div>

                <a
                  href='/dashboard/profile'
                  className='flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User className='w-4 h-4 text-gray-400' />
                  <span>Profil Saya</span>
                </a>

                <a
                  href='/dashboard/settings'
                  className='flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings className='w-4 h-4 text-gray-400' />
                  <span>Pengaturan</span>
                </a>

                <div className='border-t border-gray-100 my-1' />

                <button
                  onClick={handleLogout}
                  className='w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors'
                >
                  <LogOut className='w-4 h-4' />
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
