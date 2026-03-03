"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  ShoppingBag, 
  ShoppingCart, 
  ClipboardList, 
  ChevronDown, 
  ChevronRight, 
  Package, 
  Tags, 
  Heart, 
  Info, 
  Menu,
  Percent, 
  BookOpen 
} from "lucide-react";
import Navbar, { C } from "@/components/Navbar";

const defaultNavItems = [
  {
    label: "Products",
    href: "/",
    icon: <ShoppingBag className='w-4 h-4' />
  },
  { label: "Cart", href: "/cart", icon: <ShoppingCart className='w-4 h-4' /> },
  {
    label: "My Orders",
    href: "/orders",
    icon: <ClipboardList className='w-4 h-4' />
  },
  {
    label: "Lainnya",
    icon: <Menu className='w-4 h-4' />,
    children: [
      {
        label: "All Products",
        href: "/products",
        icon: <Tags className='w-3.5 h-3.5' />
      },
      {
        label: "Wishlist",
        href: "/wishlist",
        icon: <Heart className='w-3.5 h-3.5' />
      },
      {
        label: "About us",
        href: "/about",
        icon: <Info className='w-3.5 h-3.5' />
      }, // ganti Tags → Info lebih masuk akal
      {
        label: "Outlet",
        href: "/outlet",
        icon: <Percent className='w-3.5 h-3.5' />
      }, // Star → Percent lebih cocok untuk diskon
      {
        label: "E-catalog",
        href: "/e-catalog",
        icon: <BookOpen className='w-3.5 h-3.5' />
      } // Star → BookOpen atau FileText
    ]
  },
];

export function Sidebar({
  pathname,
  navItems = defaultNavItems,
  sidebarExtra
}) {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = label => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = href => (href ? pathname === href : false);

  return (
    <aside className='md:w-44 lg:w-48 flex-shrink-0'>
      <div className='hidden md:block sticky top-24 space-y-6'>
        <div>
          <p
            className='text-xs font-semibold uppercase tracking-widest mb-2 px-1'
            style={{ color: C.mid }}
          >
            Menu
          </p>
          <ul className='space-y-1'>
            {navItems.map(item => {
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openMenus[item.label] ?? false;
              const active = isActive(item.href);

              return (
                <li key={item.label}>
                  {hasChildren ? (
                    <div>
                      <button
                        onClick={() => toggleMenu(item.label)}
                        className='w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition-all hover:bg-gray-100/40'
                        style={{ color: active ? C.accent : C.mid }}
                      >
                        <div className='flex items-center gap-3'>
                          <span style={{ color: active ? C.accent : C.mid }}>
                            {item.icon}
                          </span>
                          {item.label}
                        </div>
                        {isOpen ? (
                          <ChevronDown className='w-4 h-4' />
                        ) : (
                          <ChevronRight className='w-4 h-4' />
                        )}
                      </button>

                      {isOpen && (
                        <ul className='ml-7 mt-1 space-y-1 border-l border-dashed border-gray-300/50 pl-3'>
                          {item.children.map(sub => {
                            const subActive = isActive(sub.href);
                            return (
                              <li key={sub.label}>
                                <Link
                                  href={sub.href}
                                  className='flex items-center gap-2 py-2.5 px-3 text-sm transition-all'
                                  style={{
                                    color: subActive ? C.accent : C.mid,
                                    backgroundColor: subActive
                                      ? `${C.accent}15`
                                      : "transparent"
                                  }}
                                >
                                  {sub.icon}
                                  {sub.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className='w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all'
                      style={
                        active
                          ? { backgroundColor: C.accent, color: C.textLight }
                          : { color: C.mid }
                      }
                    >
                      <span style={{ color: active ? C.textLight : C.mid }}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {sidebarExtra && (
          <>
            <div style={{ borderTop: `1px solid ${C.border}` }} />
            {sidebarExtra}
          </>
        )}
      </div>
    </aside>
  );
}

function Hero({ title, subtitle, heroHeight = "320px", heroContent }) {
  if (heroContent) {
    return (
      <div
        className='relative w-full overflow-hidden flex items-center justify-center'
        style={{ minHeight: heroHeight, backgroundColor: C.accent }}
      >
        {heroContent}
      </div>
    );
  }

  return (
    <div
      className='relative w-full overflow-hidden flex items-center justify-center'
      style={{ minHeight: heroHeight, backgroundColor: C.accent }}
    >
      <div className='text-center px-4'>
        {title && (
          <h1
            className='text-4xl md:text-5xl font-bold mb-3'
            style={{ fontFamily: "'Georgia', serif", color: C.textLight }}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <p
            className='text-base md:text-lg opacity-80 max-w-xl mx-auto'
            style={{ color: C.textLight }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PublicLayout({
  heroTitle,
  heroSubtitle,
  heroHeight,
  heroContent,
  showHero = true,
  showNavbar = true,
  showSidebar = true,
  navItems = defaultNavItems,
  sidebarExtra,
  sectionTitle,
  sectionAction,
  children
}) {
  const pathname = usePathname();

  return (
    <div className='font-sans min-h-screen' style={{ backgroundColor: C.bg }}>
      {showNavbar && <Navbar />}

      {showHero && (
        <Hero
          title={heroTitle}
          subtitle={heroSubtitle}
          heroHeight={heroHeight}
          heroContent={heroContent}
        />
      )}

      <div className='px-5 sm:px-8 py-10 md:py-12 max-w-7xl mx-auto'>
        {(sectionTitle || sectionAction) && (
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
            {sectionTitle && (
              <h2
                className='text-2xl md:text-3xl font-bold'
                style={{ fontFamily: "'Georgia', serif", color: C.text }}
              >
                {sectionTitle}
              </h2>
            )}
            {sectionAction && <div>{sectionAction}</div>}
          </div>
        )}

        <div className='flex flex-col md:flex-row gap-8'>
          {showSidebar && (
            <Sidebar
              pathname={pathname}
              navItems={navItems}
              sidebarExtra={sidebarExtra}
            />
          )}
          <div className='flex-1'>{children}</div>
        </div>
      </div>
    </div>
  );
}