'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 md:relative h-16 bg-cream-100 border-b border-gray-200 shadow-sm z-40">
      <div className="flex items-center justify-between h-full px-4 md:px-8">
        {/* Left Side - Search/Title */}
        <div className="flex-1 flex items-center gap-4">
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 w-64">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent ml-2 outline-none w-full text-sm text-gray-700"
            />
          </div>
        </div>

        {/* Right Side - Avatar & Dropdown */}
        <div className="flex items-center gap-6">
          {/* Notification Icon */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200"></div>

          {/* Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-3 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&q=80"
                  alt="User Avatar"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* User Info & Chevron */}
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-900">John Doe</span>
                <span className="text-xs text-gray-500">Admin</span>
              </div>

              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">john@example.com</p>
                </div>

                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </a>

                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </a>

                <div className="border-t border-gray-200 my-1"></div>

                <button
                  onClick={() => {
                    // Handle logout
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
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
