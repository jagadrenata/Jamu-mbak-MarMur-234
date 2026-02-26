"use client";
import React, { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import { LayoutDashboard, MapPin, ShoppingCart, Heart } from "lucide-react";

export default function Page({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className='flex bg-beige-50'>
      <Sidebar navMenus={mainMenus}/>

      <div className='flex-1'>
        <Navbar />
        <div className='p-4 mt-4'>{children}</div>
      </div>
    </div>
  );
}