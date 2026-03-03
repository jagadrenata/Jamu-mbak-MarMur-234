import { create } from "zustand";

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  hasFetched: false,

  fetchUser: async () => {
    // Kalau sudah pernah fetch, skip — tidak perlu request ulang
    if (get().hasFetched) return;

    set({ loading: true });

    try {
      const res = await fetch("/api/user/me");
      if (!res.ok) throw new Error("Unauthenticated");
      const data = await res.json();
      set({ user: data.user });
    } catch {
      set({ user: null });
    } finally {
      set({ loading: false, hasFetched: true });
    }
  },

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null, hasFetched: false }),
}));
