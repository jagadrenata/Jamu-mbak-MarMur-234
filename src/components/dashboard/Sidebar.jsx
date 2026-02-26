"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function Sidebar({ navMenus = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleSubMenu = (menu) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`md:hidden fixed top-4 z-50 w-8 h-8 flex items-center justify-center text-xl rotate-90 
        ${isOpen ? "left-44" : "left-4"} 
        text-cream-900 bg-cream-200 rounded-md shadow`}
      >
        |||
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 top-0 h-screen w-60 p-5 transition-all duration-300
        ${isOpen ? "left-0" : "-left-full md:left-0"}
        bg-cream-100 shadow-lg`}
      >
        {/* Logo */}
        <div className="h-10 flex items-center gap-2 font-semibold text-cream-900">
          <img src="/next.svg" className="h-5" alt="logo" />
          <span>Admin</span>
        </div>

        {/* Menu */}
        <ul className="mt-6 flex flex-col gap-1 text-cream-900">
          {navMenus.map((menu) => {
            const Icon = menu.icon;
            const isExpanded = expandedMenus[menu.name];

            // guard biar aman
            if (!menu.href && !menu.children) return null;

            return (
              <li key={menu.name}>
                <div className="flex items-center justify-between group">
                  
                  {/* MENU DENGAN LINK */}
                  {menu.href ? (
                    <Link
                      href={menu.href}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg 
                      hover:bg-cream-200 transition"
                    >
                      {Icon && <Icon size={18} />}
                      <span className="text-sm font-medium">
                        {menu.label}
                      </span>
                    </Link>
                  ) : (
                    /* MENU DROPDOWN (TANPA HREF) */
                    <button
                      onClick={() => toggleSubMenu(menu.name)}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg 
                      hover:bg-cream-200 transition text-left"
                    >
                      {Icon && <Icon size={18} />}
                      <span className="text-sm font-medium">
                        {menu.label}
                      </span>
                    </button>
                  )}

                  {/* ICON DROPDOWN */}
                  {menu.children && (
                    <button
                      onClick={() => toggleSubMenu(menu.name)}
                      className={`p-1 transition-transform duration-200 
                      ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <ChevronDown size={16} />
                    </button>
                  )}
                </div>

                {/* SUBMENU */}
                {menu.children && isExpanded && (
                  <ul className="ml-8 mt-1 flex flex-col gap-1">
                    {menu.children.map((sub, i) => (
                      <li key={i}>
                        <Link
                          href={sub.href}
                          className="block text-sm px-2 py-1 rounded-md 
                          hover:bg-cream-200 transition"
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
}