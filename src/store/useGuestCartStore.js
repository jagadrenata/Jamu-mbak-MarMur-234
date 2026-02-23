// store/useGuestCartStore.js
// Zustand store untuk menyimpan keranjang belanja guest (bukan user login)
// Data disimpan di localStorage agar persist antar navigasi

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Struktur item:
 * {
 *   variant_id: string,
 *   product_id: string,
 *   product_name: string,
 *   product_image: string,
 *   variant_name: string,
 *   variant_sku: string,
 *   variant_price: number,
 *   stock: number,
 *   quantity: number,
 * }
 */

export const useGuestCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.variant_id === item.variant_id
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variant_id === item.variant_id
                  ? {
                      ...i,
                      quantity: Math.min(i.quantity + item.quantity, i.stock),
                    }
                  : i
              ),
            };
          }

          return { items: [...state.items, { ...item }] };
        });
      },

      updateQuantity: (variant_id, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.variant_id === variant_id
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
              : i
          ),
        }));
      },

      removeItem: (variant_id) => {
        set((state) => ({
          items: state.items.filter((i) => i.variant_id !== variant_id),
        }));
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.variant_price * i.quantity, 0),

      getTotalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "guest-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

