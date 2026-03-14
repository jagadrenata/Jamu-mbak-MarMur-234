"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import LoadingProgress from "@/components/dashboard/LoadingProgress";
import { LayoutDashboard, MapPin, ShoppingCart, Heart } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Page({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLoading, setShowLoading] = useState(true);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user]);

  useEffect(() => {
    if (user && !loading) {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 1500); // delay 1 detik

      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  // if (showLoading) {
  //   return <LoadingProgress onComplete={user ? true : null} />;
  // }

  const mainMenus = [
    {
      name: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard
    },
    {
      name: "addresses",
      label: "Addresses",
      href: "/dashboard/addresses",
      icon: MapPin
    },
    {
      name: "cart",
      label: "Cart",
      href: "/dashboard/cart",
      icon: ShoppingCart
    },
    {
      name: "wishlist",
      label: "Wishlist",
      href: "/dashboard/wishlist",
      icon: Heart
    }
  ];

  return (
    <>
      {showLoading && <LoadingProgress onComplete={user ? true : null} />}

      <div className='flex bg-beige-50 text-black'>
        <Sidebar navMenus={mainMenus} />

        <div className='flex-1'>
          <Navbar />
          <div className='p-4 mt-20 overflow-auto'>{children}</div>
        </div>
      </div>
    </>
  );
}
