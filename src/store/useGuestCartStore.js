// store untuk menyimpan keranjang belanja guest (bukan user login)
// Data disimpan di localStorage agar persist antar navigasi


import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const useGuestCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isSyncing: false,
      lastSyncedAt: null,

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

          return {
            items: [
              ...state.items,
              {
                ...item,
              },
            ],
          };
        });
      },

      updateQuantity: (variant_id, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.variant_id === variant_id
              ? {
                  ...i,
                  quantity: Math.max(1, Math.min(quantity, i.stock)),
                }
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
        get().items.reduce(
          (sum, i) => sum + i.variant_price * i.quantity,
          0
        ),

      getTotalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      // 🔥 CORE: RE-VALIDATION
      syncWithServer: async () => {
        const items = get().items;
        if (!items.length) return;

        set({ isSyncing: true });

        try {
          const variantIds = items.map((i) => i.variant_id);

          const { data, error } = await supabase
            .from("product_variants")
            .select(`
              id,
              price,
              quantity,
              is_active,
              product:products (
                id,
                name,
                status
              )
            `)
            .in("id", variantIds);

          if (error) throw error;

          set((state) => ({
            items: state.items
              .map((item) => {
                const latest = data.find((d) => d.id === item.variant_id);

                // ❌ variant tidak ditemukan
                if (!latest) return null;

                // ❌ tidak aktif / produk archived
                if (
                  !latest.is_active ||
                  latest.product?.status !== "active"
                ) {
                  return null;
                }

                const stock = latest.quantity;

                return {
                  ...item,
                  variant_price: latest.price,
                  stock: stock,
                  quantity: Math.min(item.quantity, stock),
                  product_name: latest.product?.name || item.product_name,
                };
              })
              .filter(Boolean),
            lastSyncedAt: Date.now(),
          }));
        } catch (err) {
          console.error("Cart sync error:", err.message);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "guest-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);