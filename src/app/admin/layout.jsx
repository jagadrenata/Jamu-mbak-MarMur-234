"use client"
import React, {useState} from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import Navbar from '@/components/dashboard/Navbar'
import {
  UserCog,
  Users,
  Package,
  ShoppingCart,
  Tag,
  Truck,
  Warehouse,
  Megaphone,
  MessageSquare
} from "lucide-react";

const adminMenus = [
  {
    name: "admin-dashboard",
    label: "Admin Dashboard",
    href: "/admin",
    icon: UserCog
  },

  {
    name: "admins",
    label: "Admins",
    href: "/admin/admins",
    icon: Users
  },

  {
    name: "users",
    label: "Users",
    href: "/dashboard/admin/users",
    icon: Users
  },

  {
    name: "catalog",
    label: "Catalog",
    icon: Package,
    children: [
      { label: "Products", href: "/admin/products" },
      { label: "Categories", href: "/admin/categories" },
      { label: "Banners", href: "/admin/banners" }
    ]
  },

  {
    name: "orders",
    label: "Orders",
    icon: ShoppingCart,
    children: [
      { label: "Orders", href: "/admin/orders" },
      { label: "Shipping", href: "/admin/shipping" },
      { label: "Promo Codes", href: "/admin/promo-codes" }
    ]
  },

  {
    name: "inventory",
    label: "Inventory",
    href: "/admin/inventory",
    icon: Warehouse
  },

  {
    name: "suppliers",
    label: "Suppliers",
    href: "/admin/suppliers",
    icon: Truck
  },

  {
    name: "feedback",
    label: "Feedback",
    href: "/admin/feedbacks",
    icon: MessageSquare
  }
];


export default function Page({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="flex bg-beige-50">
      <Sidebar navMenus={adminMenus} />

      <div className="flex-1">
        <Navbar />
        <div className="p-4 mt-4">
          {children}
        </div>
      </div>
    </div>
  )
}