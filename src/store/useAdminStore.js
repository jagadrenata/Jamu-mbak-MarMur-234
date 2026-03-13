"use client";

import { create } from "zustand";

export const useAdminStore = create((set, get) => ({
  admin: null,
  loading: true,
  hasFetched: false,

  fetchAdmin: async ({ roles = [], redirectTo } = {}) => {
    // skip jika sudah pernah fetch berhasil
    if (get().hasFetched) return;

    set({ loading: true });

    try {
      const res = await fetch("/api/admin/me");
      if (!res.ok) {
        throw new Error("Unauthenticated");
      }

      const data = await res.json();
      const adminData = data.admin || null;

      // cek role jika diberikan
      if (roles.length > 0 && adminData && !roles.includes(adminData.role)) {
        throw new Error("Forbidden");
      }

      set({
        admin: adminData,
        loading: false,
        hasFetched: true
      });
    } catch (err) {
      set({
        admin: null,
        loading: false,
        hasFetched: true
      });
    }
  },

  setAdmin: admin => set({ admin }),

  clearAdmin: () =>
    set({
      admin: null,
      hasFetched: false
    })
}));