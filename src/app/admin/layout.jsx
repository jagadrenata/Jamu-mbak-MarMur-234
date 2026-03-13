"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";
import { useAdminStore } from "@/store/useAdminStore";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import LoadingProgress from "@/components/dashboard/LoadingProgress";
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
  const router = useRouter();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fetchDone, setFetchDone] = useState(false);

  const { admin, loading, fetchAdmin } = useAdminStore();

  useEffect(() => {
    fetchAdmin({ roles: ["admin", "superadmin"] }).finally(() =>
      setFetchDone(true)
    ); // trigger saat fetch selesai
  }, [fetchAdmin]);

  useEffect(() => {
    if (!loading && !admin) {
      router.replace("/login?from=admin");
    }
  }, [loading, admin, router]);

  if (loading || !admin) {
    return <LoadingProgress onComplete={fetchDone ? true : null} />;
  }

  if (!admin) {
    return null;
  }

  return (
    <div className='flex bg-cream-50 text-black'>
      <Sidebar navMenus={adminMenus} admin={true} />

      <div className='flex-1'>
        <Navbar />
        <div className='p-4 mt-20'>{children}</div>
      </div>
    </div>
  );
}