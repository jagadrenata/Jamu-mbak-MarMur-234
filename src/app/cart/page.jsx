"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  User,
  MapPin,
  CheckCircle2,
  Tag,
  Truck,
  Info,
  MessageCircle,
  Ticket,
  X,
  Loader2
} from "lucide-react";
import Link from "next/link";
import nextDynamic from "next/dynamic";
import { toast } from "sonner";
import { C } from "@/components/Navbar";
import PublicLayout from "@/components/PublicLayout";
import { useGuestCartStore } from "@/store/useGuestCartStore";
import { useAuthStore } from "@/store/useAuthStore";

export const dynamic = "force-dynamic";

const Map = nextDynamic(() => import("@/components/Map"), { ssr: false });

// Helpers

function formatRupiah(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

/** Minimal order quantity based on distance (km). Returns null if > 5km. */
function getMinQtyByDistance(km) {
  if (km === null || km === undefined) return null;
  if (km < 1) return 1;
  if (km < 2.5) return 5;
  if (km < 5) return 10;
  return null; // >5km chat admin
}

/** Distance hint message for display */
function getDistanceHint(km) {
  if (km === null || km === undefined) return null;
  if (km > 5)
    return {
      type: "admin",
      msg: `Jarak pengiriman ${km.toFixed(1)} km — lebih dari 5 km, silakan chat admin untuk melakukan pemesanan.`
    };
  const min = getMinQtyByDistance(km);
  return {
    type: "info",
    msg: `Jarak pengiriman ±${km.toFixed(1)} km — minimal pembelian ${min} item.`
  };
}

const EMPTY_GUEST_FORM = {
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  street: "",
  village: "",
  district: "",
  city: "",
  province: "",
  postal_code: "",
  delivery_notes: "",
  payment_method: "bank_transfer"
};

// Sub-components

function Field({ label, error, children }) {
  return (
    <div className='space-y-1'>
      <label
        className='block text-xs font-semibold uppercase tracking-wider'
        style={{ color: C.mid }}
      >
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className='text-xs font-medium'
            style={{ color: "#e53e3e" }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputBase({ error, ...props }) {
  return (
    <input
      className='w-full px-3 py-2.5 text-sm outline-none bg-transparent transition-colors focus:ring-1'
      style={{
        border: `1px solid ${error ? "#e53e3e" : C.border}`,
        color: C.text,
        "--tw-ring-color": C.accent
      }}
      {...props}
    />
  );
}

function SkeletonCard() {
  return (
    <div
      className='p-5 animate-pulse'
      style={{ border: `1px solid ${C.border}`, backgroundColor: C.bgCard }}
    >
      <div className='flex gap-4'>
        <div className='w-20 h-20' style={{ backgroundColor: C.border }} />
        <div className='flex-1 space-y-2 pt-1'>
          <div
            className='h-4 w-2/3 rounded'
            style={{ backgroundColor: C.border }}
          />
          <div
            className='h-3 w-1/3 rounded'
            style={{ backgroundColor: C.border }}
          />
          <div
            className='h-4 w-1/4 rounded'
            style={{ backgroundColor: C.border }}
          />
        </div>
      </div>
    </div>
  );
}

function CartItemCard({ item, updating, removing, onUpdateQty, onRemove }) {
  const itemKey = item.id ?? item.variant_id;
  const isUpdating = updating === itemKey;
  const isRemoving = removing === itemKey;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: isRemoving ? 0.4 : 1, y: 0 }}
      exit={{ opacity: 0, x: -30, transition: { duration: 0.22 } }}
      className='overflow-hidden'
      style={{ border: `1px solid ${C.border}`, backgroundColor: C.bgCard }}
    >
      <div className='flex gap-4 p-4'>
        {/* Image */}
        <div
          className='w-20 h-20 flex-shrink-0 overflow-hidden'
          style={{ backgroundColor: C.border }}
        >
          {item.product_image && (
            <img
              src={item.product_image}
              alt={item.product_name}
              className='w-full h-full object-cover'
              onError={e => {
                e.target.style.display = "none";
              }}
            />
          )}
        </div>

        {/* Details */}
        <div className='flex-1 min-w-0'>
          <p
            className='font-bold text-sm mb-0.5 truncate'
            style={{ fontFamily: "'Georgia', serif", color: C.text }}
          >
            {item.product_name}
          </p>
          <div className='flex items-center gap-1.5 mb-2 flex-wrap'>
            <span
              className='text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1'
              style={{ backgroundColor: C.accent + "18", color: C.accent }}
            >
              <Tag className='w-2.5 h-2.5' />
              {item.variant_name}
            </span>
            <span className='text-xs opacity-40' style={{ color: C.text }}>
              SKU: {item.variant_sku}
            </span>
          </div>
          <p className='text-sm font-bold' style={{ color: C.accent }}>
            {formatRupiah(item.variant_price)}
          </p>
        </div>

        {/* Actions */}
        <div className='flex flex-col items-end justify-between gap-2 flex-shrink-0'>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => onRemove(item)}
            disabled={isRemoving}
            className='p-1.5 transition-colors hover:bg-red-50'
            title='Hapus item'
            style={{ color: "#e53e3e", opacity: isRemoving ? 0.4 : 0.6 }}
          >
            <Trash2 className='w-4 h-4' />
          </motion.button>

          {/* Qty stepper */}
          <div
            className='flex items-center overflow-hidden'
            style={{ border: `1px solid ${C.border}` }}
          >
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => onUpdateQty(item, item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className='w-8 h-8 flex items-center justify-center transition-colors hover:bg-black/5 disabled:opacity-30'
              style={{ color: C.accent }}
            >
              <Minus className='w-3 h-3' />
            </motion.button>
            <span
              className='text-sm font-semibold w-8 text-center select-none'
              style={{ color: C.text }}
            >
              {isUpdating ? "·" : item.quantity}
            </span>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => onUpdateQty(item, item.quantity + 1)}
              disabled={isUpdating || item.quantity >= item.stock}
              className='w-8 h-8 flex items-center justify-center transition-colors hover:bg-black/5 disabled:opacity-30'
              style={{ color: C.accent }}
            >
              <Plus className='w-3 h-3' />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Subtotal bar */}
      <div
        className='px-4 py-2 flex justify-between items-center'
        style={{
          borderTop: `1px solid ${C.border}`,
          backgroundColor: C.accent + "08"
        }}
      >
        <span className='text-xs opacity-50' style={{ color: C.text }}>
          {item.quantity} × {formatRupiah(item.variant_price)}
        </span>
        <span className='text-xs font-bold' style={{ color: C.accent }}>
          {formatRupiah(item.variant_price * item.quantity)}
        </span>
      </div>
    </motion.div>
  );
}

// Distance Hint Banner

function DistanceHintBanner({ distanceKm }) {
  const hint = getDistanceHint(distanceKm);
  if (!hint) return null;

  const isAdmin = hint.type === "admin";

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex items-start gap-2.5 p-3.5 text-xs rounded'
      style={{
        backgroundColor: isAdmin ? "#fff3cd" : C.accent + "12",
        border: `1px solid ${isAdmin ? "#ffc107" : C.accent + "40"}`,
        color: isAdmin ? "#856404" : C.accent
      }}
    >
      {isAdmin ? (
        <MessageCircle className='w-3.5 h-3.5 mt-0.5 flex-shrink-0' />
      ) : (
        <Info className='w-3.5 h-3.5 mt-0.5 flex-shrink-0' />
      )}
      <span>{hint.msg}</span>
      {isAdmin && (
        <a
          href='https://wa.me/6281234567890'
          target='_blank'
          rel='noopener noreferrer'
          className='ml-auto font-semibold underline whitespace-nowrap'
          style={{ color: "#856404" }}
        >
          Chat Admin →
        </a>
      )}
    </motion.div>
  );
}

// COD Notice

function CodNotice() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex items-start gap-2.5 p-3.5 text-xs rounded'
      style={{
        backgroundColor: "#fff3cd",
        border: "1px solid #ffc107",
        color: "#856404"
      }}
    >
      <MessageCircle className='w-3.5 h-3.5 mt-0.5 flex-shrink-0' />
      <span>
        Pembelian dengan metode <strong>Bayar di Tempat (COD)</strong> harus
        dilakukan melalui admin.{" "}
        <a
          href='https://wa.me/6281234567890'
          target='_blank'
          rel='noopener noreferrer'
          className='font-semibold underline'
        >
          Chat Admin →
        </a>
      </span>
    </motion.div>
  );
}

// Shipping Method Selector

function ShippingMethodSelector({ methods, selectedId, onSelect }) {
  if (!methods || methods.length === 0) return null;

  return (
    <div className='space-y-2'>
      {methods.map(m => (
        <label
          key={m.id}
          className='flex items-center gap-3 p-3 cursor-pointer transition-all'
          style={{
            border: `1px solid ${selectedId === m.id ? C.accent : C.border}`,
            backgroundColor:
              selectedId === m.id ? C.accent + "0a" : "transparent"
          }}
        >
          <input
            type='radio'
            name='shipping_method'
            checked={selectedId === m.id}
            onChange={() => onSelect(m)}
            style={{ accentColor: C.accent }}
          />
          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between gap-2'>
              <span className='text-xs font-semibold' style={{ color: C.text }}>
                {m.name}
              </span>
              <span
                className='text-xs font-bold flex-shrink-0'
                style={{ color: C.accent }}
              >
                {m.price === 0 ? "Gratis" : formatRupiah(m.price)}
              </span>
            </div>
            {m.estimated_time && (
              <span className='text-xs opacity-60' style={{ color: C.text }}>
                Estimasi: {m.estimated_time}
              </span>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}

// Promo Code Input

function PromoCodeInput({ onApply, appliedPromo, onRemove }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleApply() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/promo-codes?code=${encodeURIComponent(trimmed)}`
      );
      const json = await res.json();
      if (!res.ok || !json.data) {
        toast.error("Kode promo tidak ditemukan atau tidak aktif.");
        return;
      }
      const promo = json.data;
      if (!promo.is_active) {
        toast.error("Kode promo sudah tidak aktif.");
        return;
      }
      if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
        toast.error("Kode promo sudah kadaluarsa.");
        return;
      }
      if (promo.usage_limit !== null && promo.used_count >= promo.usage_limit) {
        toast.error("Kode promo sudah mencapai batas penggunaan.");
        return;
      }
      onApply(promo);
      toast.success(`Promo "${promo.code}" berhasil digunakan!`);
    } catch {
      toast.error("Gagal memeriksa kode promo.");
    } finally {
      setLoading(false);
    }
  }

  if (appliedPromo) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex items-center gap-2 px-3 py-2 rounded'
        style={{
          backgroundColor: C.accent + "12",
          border: `1px solid ${C.accent + "40"}`
        }}
      >
        <Ticket
          className='w-3.5 h-3.5 flex-shrink-0'
          style={{ color: C.accent }}
        />
        <span
          className='flex-1 text-xs font-semibold'
          style={{ color: C.accent }}
        >
          {appliedPromo.code}
          {appliedPromo.type === "percent"
            ? ` — Diskon ${appliedPromo.value}%`
            : ` — Diskon ${formatRupiah(appliedPromo.value)}`}
        </span>
        <button
          onClick={onRemove}
          className='p-0.5 opacity-60 hover:opacity-100 transition-opacity'
          style={{ color: C.accent }}
        >
          <X className='w-3.5 h-3.5' />
        </button>
      </motion.div>
    );
  }

  return (
    <div className='flex gap-2'>
      <input
        type='text'
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase())}
        onKeyDown={e => e.key === "Enter" && handleApply()}
        placeholder='Kode promo'
        className='flex-1 px-3 py-2 text-xs outline-none bg-transparent'
        style={{ border: `1px solid ${C.border}`, color: C.text }}
      />
      <button
        onClick={handleApply}
        disabled={loading || !code.trim()}
        className='px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-opacity disabled:opacity-50'
        style={{ backgroundColor: C.accent, color: C.textLight }}
      >
        {loading ? <Loader2 className='w-3 h-3 animate-spin' /> : "Pakai"}
      </button>
    </div>
  );
}

// Main Page

export default function CartPage() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [updating, setUpdating] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [guestForm, setGuestForm] = useState(EMPTY_GUEST_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [mapGeoLoading, setMapGeoLoading] = useState(false);
  const [coordinate, setCoordinate] = useState(null);
  const [showMap, setShowMap] = useState(false);

  // Shipping methods
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  // Promo
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Distance (km) — computed from coordinate vs toko
  const [distanceKm, setDistanceKm] = useState(null);

  const initialSyncDone = useRef(false);

  const guestUpdateQuantity = useGuestCartStore(s => s.updateQuantity);
  const guestRemoveItem = useGuestCartStore(s => s.removeItem);
  const guestClearCart = useGuestCartStore(s => s.clearCart);
  const guestSync = useGuestCartStore(s => s.syncWithServer);
  const guestIsSyncing = useGuestCartStore(s => s.isSyncing);

  const { user, loading: authLoading, fetchUser } = useAuthStore();
  const userId = user?.id ?? (authLoading ? undefined : false);

  // Cart fetchers
  const fetchUserCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/cart");
      const json = await res.json();
      const normalized = (json.data || []).map(item => ({
        id: item.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        product_name: item.variant?.product?.name ?? "-",
        variant_name: item.variant?.name ?? "-",
        variant_sku: item.variant?.sku ?? "-",
        variant_price: item.variant?.price ?? 0,
        stock: item.variant?.stock ?? 0,
        product_image: item.variant?.product?.primary_image ?? null
      }));
      setItems(normalized);
      setSubtotal(json.subtotal || 0);
      setTotalItems(json.total || 0);
    } catch {
      toast.error("Gagal memuat keranjang.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGuestCart = useCallback(async () => {
    setLoading(true);
    try {
      if (!initialSyncDone.current) {
        await guestSync();
        initialSyncDone.current = true;
      }
      const latestItems = useGuestCartStore.getState().items;
      setItems(latestItems);
      setSubtotal(
        latestItems.reduce((s, i) => s + i.variant_price * i.quantity, 0)
      );
      setTotalItems(latestItems.reduce((s, i) => s + i.quantity, 0));
    } catch {
      toast.error("Gagal memuat keranjang.");
    } finally {
      setLoading(false);
    }
  }, [guestSync]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Load cart
  useEffect(() => {
    if (authLoading) return;
    if (userId) fetchUserCart();
    else loadGuestCart();
  }, [userId, authLoading, fetchUserCart, loadGuestCart]);

  // Load addresses (logged-in)
  useEffect(() => {
    if (!userId || authLoading) return;
    async function fetchAddresses() {
      setAddressesLoading(true);
      try {
        const res = await fetch("/api/dashboard/addresses");
        const json = await res.json();
        if (res.ok && json.data) {
          setAddresses(json.data);
          const defaultAddr = json.data.find(a => a.is_default);
          setSelectedAddressId(
            defaultAddr ? defaultAddr.id : (json.data[0]?.id ?? null)
          );
        }
      } catch {
        toast.error("Gagal memuat alamat tersimpan.");
      } finally {
        setAddressesLoading(false);
      }
    }
    fetchAddresses();
  }, [userId, authLoading]);

  // Load shipping methods
  useEffect(() => {
    async function fetchShipping() {
      setShippingLoading(true);
      try {
        const res = await fetch(
          "/api/shipping/shipping-methods?is_active=true"
        );
        const json = await res.json();
        if (res.ok && json.data?.length > 0) {
          setShippingMethods(json.data);
          setSelectedShipping(json.data[0]);
        }
      } catch {
        // silently fail — fallback to flat cost
      } finally {
        setShippingLoading(false);
      }
    }
    fetchShipping();
  }, []);

  // Compute distance when coordinate changes
  useEffect(() => {
    if (!coordinate) {
      setDistanceKm(null);
      return;
    }
    // Koordinat toko — ganti sesuai lokasi asli
    const STORE_LAT = -7.7956;
    const STORE_LNG = 110.3695;
    const km = haversineKm(
      coordinate.lat,
      coordinate.lng,
      STORE_LAT,
      STORE_LNG
    );
    setDistanceKm(km);
  }, [coordinate]);


  // Quantity update
  function updateGuestQty(variant_id, quantity) {
    setUpdating(variant_id);
    const updatedItems = items.map(i =>
      i.variant_id === variant_id
        ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
        : i
    );
    setItems(updatedItems);
    guestUpdateQuantity(variant_id, quantity);
    recalc(updatedItems);
    setTimeout(() => setUpdating(null), 200);
  }

  async function updateUserQty(item, quantity) {
    setUpdating(item.id);
    try {
      const res = await fetch(`/api/dashboard/cart?id=${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity })
      });
      if (!res.ok) throw new Error();
      const updatedItems = items.map(i =>
        i.id === item.id ? { ...i, quantity } : i
      );
      setItems(updatedItems);
      recalc(updatedItems);
    } catch {
      toast.error("Gagal mengubah jumlah item.");
    } finally {
      setUpdating(null);
    }
  }

  // Remove item
  function removeGuestItemFn(variant_id) {
    setRemoving(variant_id);
    const itemName =
      items.find(i => i.variant_id === variant_id)?.product_name ?? "Item";
    guestRemoveItem(variant_id);
    const newItems = items.filter(i => i.variant_id !== variant_id);
    setItems(newItems);
    recalc(newItems);
    toast.success(`${itemName} dihapus dari keranjang.`);
    setTimeout(() => setRemoving(null), 300);
  }

  async function removeUserItemFn(item) {
    setRemoving(item.id);
    try {
      const res = await fetch(`/api/dashboard/cart?id=${item.id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error();
      const newItems = items.filter(i => i.id !== item.id);
      setItems(newItems);
      recalc(newItems);
      toast.success(`${item.product_name} dihapus dari keranjang.`);
    } catch {
      toast.error("Gagal menghapus item.");
    } finally {
      setRemoving(null);
    }
  }

  function recalc(list) {
    setSubtotal(list.reduce((s, i) => s + i.variant_price * i.quantity, 0));
    setTotalItems(list.reduce((s, i) => s + i.quantity, 0));
  }

  // Derived values
  const isGuest = !authLoading && !userId;
  const shippingCost = selectedShipping?.price ?? 0;

  // Discount calculation
  const discountAmount = (() => {
    if (!appliedPromo) return 0;
    const base = subtotal + shippingCost;
    if (appliedPromo.min_purchase && base < appliedPromo.min_purchase) return 0;
    if (appliedPromo.type === "percent") {
      const disc = Math.floor((base * appliedPromo.value) / 100);
      return appliedPromo.max_discount
        ? Math.min(disc, appliedPromo.max_discount)
        : disc;
    }
    return Math.min(appliedPromo.value, base);
  })();

  const grandTotal = subtotal + shippingCost - discountAmount;

  async function handleCheckout() {
    // Block COD via normal checkout
    if (
      guestForm.payment_method === "cod" ||
      (!userId && guestForm.payment_method === "cod")
    ) {
      toast.info("Pembelian COD dilakukan melalui admin. Silakan chat admin.");
      return;
    }

    if (!userId) {
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        toast.error("Lengkapi data pengiriman terlebih dahulu.");
        document
          .getElementById("guest-form")
          ?.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    if (userId && !selectedAddressId) {
      toast.error("Pilih alamat pengiriman terlebih dahulu.");
      return;
    }

    // Min qty check for guest with distance
    if (!userId && distanceKm !== null) {
      if (distanceKm > 5) {
        toast.error(
          "Jarak lebih dari 5 km. Silakan chat admin untuk pemesanan."
        );
        return;
      }
      const minQty = getMinQtyByDistance(distanceKm);
      if (totalItems < minQty) {
        toast.error(
          `Minimal pembelian ${minQty} item untuk jarak ±${distanceKm.toFixed(1)} km.`
        );
        return;
      }
    }

    const toastId = toast.loading("Memproses pesanan...");
    setCheckoutLoading(true);

    try {
      const orderItems = items.map(item => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.variant_price
      }));

      const body = userId
        ? {
            items: orderItems,
            address_id: selectedAddressId,
            shipping_method_id: selectedShipping?.id ?? null,
            promo_code_id: appliedPromo?.id ?? null
          }
        : {
            items: orderItems,
            customer_name: guestForm.customer_name,
            customer_email: guestForm.customer_email,
            customer_phone: guestForm.customer_phone,
            shipping_address: {
              street: guestForm.street,
              village: guestForm.village,
              district: guestForm.district,
              city: guestForm.city,
              province: guestForm.province,
              postal_code: guestForm.postal_code,
              delivery_notes: guestForm.delivery_notes
            },
            coordinate: coordinate ?? null,
            payment_method: guestForm.payment_method,
            shipping_method_id: selectedShipping?.id ?? null,
            promo_code_id: appliedPromo?.id ?? null
          };

      const endpoint = userId ? "/api/data/orders" : "/api/data/guest-orders";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Checkout gagal");

      toast.success("Pesanan berhasil dibuat!", { id: toastId });

      if (json.data?.midtrans_payment_url) {
        if (!userId) guestClearCart();
        window.location.href = json.data.midtrans_payment_url;
        return;
      }

      if (!userId) guestClearCart();
      router.push("/orders");
    } catch (err) {
      toast.error(err.message || "Checkout gagal. Coba lagi.", { id: toastId });
    } finally {
      setCheckoutLoading(false);
    }
  }

  function validateForm() {
    const errors = {};
    if (!guestForm.customer_name.trim()) errors.customer_name = "Wajib diisi";
    if (!guestForm.customer_email.trim()) errors.customer_email = "Wajib diisi";
    if (!guestForm.customer_phone.trim()) errors.customer_phone = "Wajib diisi";
    if (!guestForm.city.trim()) errors.city = "Pilih lokasi di peta";
    if (!guestForm.postal_code.trim()) errors.postal_code = "Wajib diisi";
    return errors;
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setGuestForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: "" }));
  }

  function handleMapGeocode(geoResult, latlng) {
    setMapGeoLoading(false);
    setCoordinate({ lat: latlng.lat, lng: latlng.lng });
    setGuestForm(prev => ({
      ...prev,
      street: geoResult.street || prev.street,
      village: geoResult.village || "",
      district: geoResult.district || "",
      city: geoResult.city || "",
      province: geoResult.province || ""
    }));
    setFormErrors(prev => ({ ...prev, city: "" }));
    toast.success("Lokasi berhasil dipilih dari peta.");
  }

  function handleUpdateQty(item, quantity) {
    if (quantity < 1) return;
    if (quantity > item.stock) {
      toast.warning(`Stok tersedia hanya ${item.stock} item.`);
      return;
    }
    if (userId) updateUserQty(item, quantity);
    else updateGuestQty(item.variant_id, quantity);
  }

  function handleRemove(item) {
    if (userId) removeUserItemFn(item);
    else removeGuestItemFn(item.variant_id);
  }

  return (
    <PublicLayout
      heroTitle='Keranjang'
      heroSubtitle={
        isGuest
          ? "Isi data pengiriman dan checkout sebagai tamu — atau login agar pesanan tersimpan di akunmu."
          : "Pesanan tersimpan di akun kamu."
      }
      sectionTitle='Keranjang Belanja'
      sidebarExtra={
        !loading && items.length > 0 ? (
          <div>
            <p
              className='text-xs font-semibold uppercase tracking-widest mb-2 px-1'
              style={{ color: C.mid }}
            >
              Ringkasan
            </p>
            <div className='px-4 space-y-2 text-sm' style={{ color: C.text }}>
              <div className='flex justify-between'>
                <span className='opacity-70'>Item</span>
                <span>{totalItems}</span>
              </div>
              <div className='flex justify-between'>
                <span className='opacity-70'>Subtotal</span>
                <span style={{ color: C.accent }} className='font-medium'>
                  {formatRupiah(subtotal)}
                </span>
              </div>
            </div>
          </div>
        ) : null
      }
    >
      {/* Sync indicator */}
      <AnimatePresence>
        {guestIsSyncing && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='text-xs text-center mb-3 opacity-60'
            style={{ color: C.text }}
          >
            Sinkronisasi harga &amp; stok...
          </motion.p>
        )}
      </AnimatePresence>

      {/* Loading skeleton */}
      {loading || authLoading ? (
        <div className='space-y-4'>
          {[1, 2, 3].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center py-28'
        >
          <div
            className='w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5'
            style={{ backgroundColor: C.accent + "18" }}
          >
            <ShoppingBag className='w-9 h-9' style={{ color: C.accent }} />
          </div>
          <p
            className='text-xl mb-2'
            style={{ fontFamily: "'Georgia', serif", color: C.text }}
          >
            Keranjang masih kosong
          </p>
          <p className='text-sm mb-8 opacity-60' style={{ color: C.text }}>
            Yuk belanja jamu sehat untuk keluarga!
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/")}
            className='inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold'
            style={{ backgroundColor: C.accent, color: C.textLight }}
          >
            Lihat Produk
            <ArrowRight className='w-4 h-4' />
          </motion.button>
        </motion.div>
      ) : (
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Left column: items + guest form */}
          <div className='flex-1 space-y-4'>
            <AnimatePresence mode='popLayout'>
              {items.map(item => (
                <CartItemCard
                  key={item.id ?? item.variant_id}
                  item={item}
                  updating={updating}
                  removing={removing}
                  onUpdateQty={handleUpdateQty}
                  onRemove={handleRemove}
                />
              ))}
            </AnimatePresence>

            {/* Guest form */}
            {isGuest && (
              <motion.div
                id='guest-form'
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className='mt-6 p-6 space-y-5'
                style={{
                  border: `1px solid ${C.border}`,
                  backgroundColor: C.bgCard
                }}
              >
                {/* Header */}
                <div>
                  <div className='flex items-center gap-2 mb-1'>
                    <User className='w-4 h-4' style={{ color: C.accent }} />
                    <h3
                      className='text-base font-bold'
                      style={{ fontFamily: "'Georgia', serif", color: C.text }}
                    >
                      Data Pengiriman
                    </h3>
                  </div>
                  <p className='text-xs opacity-60' style={{ color: C.text }}>
                    Kamu berbelanja sebagai tamu. Isi data di bawah untuk
                    menyelesaikan pesanan.
                  </p>
                </div>

                <Field label='Nama Lengkap' error={formErrors.customer_name}>
                  <InputBase
                    name='customer_name'
                    value={guestForm.customer_name}
                    onChange={handleFormChange}
                    placeholder='Dewi Sartika'
                    error={formErrors.customer_name}
                  />
                </Field>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <Field label='Email' error={formErrors.customer_email}>
                    <InputBase
                      name='customer_email'
                      type='email'
                      value={guestForm.customer_email}
                      onChange={handleFormChange}
                      placeholder='email@contoh.com'
                      error={formErrors.customer_email}
                    />
                  </Field>
                  <Field label='Nomor HP' error={formErrors.customer_phone}>
                    <InputBase
                      name='customer_phone'
                      value={guestForm.customer_phone}
                      onChange={handleFormChange}
                      placeholder='081234567890'
                      error={formErrors.customer_phone}
                    />
                  </Field>
                </div>

                {/* Map picker */}
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <label
                      className='text-xs font-semibold uppercase tracking-wider flex items-center gap-1'
                      style={{ color: formErrors.city ? "#e53e3e" : C.mid }}
                    >
                      Lokasi di Peta
                      {coordinate && (
                        <CheckCircle2 className='w-3.5 h-3.5 text-green-500' />
                      )}
                      {formErrors.city && (
                        <span className='font-normal normal-case ml-1 text-red-500'>
                          — {formErrors.city}
                        </span>
                      )}
                    </label>
                    <button
                      type='button'
                      onClick={() => setShowMap(v => !v)}
                      className='flex items-center gap-1 text-xs font-medium underline transition-opacity hover:opacity-70'
                      style={{ color: C.accent }}
                    >
                      <MapPin className='w-3 h-3' />
                      {showMap ? "Sembunyikan Peta" : "Pilih dari Peta"}
                    </button>
                  </div>
                  <AnimatePresence>
                    {showMap && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className='overflow-hidden'
                      >
                        <Map
                          isLoading={mapGeoLoading}
                          onSelect={() => setMapGeoLoading(true)}
                          onGeocode={handleMapGeocode}
                        />
                        <p
                          className='mt-1.5 text-xs opacity-50'
                          style={{ color: C.text }}
                        >
                          Klik pada peta untuk mengisi otomatis kota, provinsi,
                          dan jalan.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Distance hint banner (langsung tampil setelah koordinat dipilih) */}
                  <AnimatePresence>
                    {distanceKm !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className='mt-2'
                      >
                        <DistanceHintBanner distanceKm={distanceKm} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Field label='Alamat Jalan'>
                  <InputBase
                    name='street'
                    value={guestForm.street}
                    onChange={handleFormChange}
                    placeholder='Jl. Mawar No. 5 (terisi otomatis dari peta)'
                  />
                </Field>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <Field label='Kelurahan / Desa'>
                    <InputBase
                      name='village'
                      value={guestForm.village}
                      onChange={handleFormChange}
                      placeholder='Terisi otomatis dari peta'
                    />
                  </Field>
                  <Field label='Kecamatan'>
                    <InputBase
                      name='district'
                      value={guestForm.district}
                      onChange={handleFormChange}
                      placeholder='Terisi otomatis dari peta'
                    />
                  </Field>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  <Field label='Kota / Kabupaten' error={formErrors.city}>
                    <InputBase
                      name='city'
                      value={guestForm.city}
                      onChange={handleFormChange}
                      placeholder='Yogyakarta'
                      error={formErrors.city}
                    />
                  </Field>
                  <Field label='Provinsi'>
                    <InputBase
                      name='province'
                      value={guestForm.province}
                      onChange={handleFormChange}
                      placeholder='DI Yogyakarta'
                    />
                  </Field>
                  <Field label='Kode Pos' error={formErrors.postal_code}>
                    <InputBase
                      name='postal_code'
                      value={guestForm.postal_code}
                      onChange={handleFormChange}
                      placeholder='55281'
                      error={formErrors.postal_code}
                    />
                  </Field>
                </div>

                <Field label='Keterangan Pengantaran'>
                  <InputBase
                    name='delivery_notes'
                    value={guestForm.delivery_notes}
                    onChange={handleFormChange}
                    placeholder='cth: Rumah No. 5A, pagar besi warna hijau, depan warung'
                  />
                </Field>

                <Field label='Metode Pembayaran'>
                  <select
                    name='payment_method'
                    value={guestForm.payment_method}
                    onChange={handleFormChange}
                    className='w-full px-3 py-2.5 text-sm outline-none appearance-none transition-colors'
                    style={{
                      border: `1px solid ${C.border}`,
                      backgroundColor: C.bgCard,
                      color: C.text
                    }}
                  >
                    <option value='bank_transfer'>Transfer Bank</option>
                    <option value='cod'>Bayar di Tempat (COD)</option>
                    <option value='e_wallet'>E-Wallet</option>
                  </select>
                </Field>

                {/* COD notice */}
                <AnimatePresence>
                  {guestForm.payment_method === "cod" && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                    >
                      <CodNotice />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Right column: address + shipping + promo + order summary */}
          <div className='lg:w-72 flex-shrink-0 space-y-4'>
            {/* Address picker (logged-in only) */}
            {!isGuest && !loading && items.length > 0 && (
              <div
                className='p-5 space-y-4'
                style={{
                  border: `1px solid ${C.border}`,
                  backgroundColor: C.bgCard
                }}
              >
                <div className='flex items-center justify-between'>
                  <h3
                    className='text-sm font-bold'
                    style={{ fontFamily: "'Georgia', serif", color: C.text }}
                  >
                    Alamat Pengiriman
                  </h3>
                  <Link
                    href='/dashboard/addresses'
                    className='text-xs underline flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity'
                    style={{ color: C.accent }}
                  >
                    <Plus size={12} /> Tambah
                  </Link>
                </div>

                {addressesLoading ? (
                  <div className='space-y-2'>
                    {[1, 2].map(i => (
                      <div
                        key={i}
                        className='h-16 animate-pulse'
                        style={{ backgroundColor: C.border }}
                      />
                    ))}
                  </div>
                ) : addresses.length === 0 ? (
                  <div
                    className='text-center py-4 opacity-60 text-xs'
                    style={{ color: C.text }}
                  >
                    Belum ada alamat tersimpan.{" "}
                    <Link
                      href='/dashboard/addresses'
                      className='underline'
                      style={{ color: C.accent }}
                    >
                      Tambah sekarang
                    </Link>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {addresses.map(addr => (
                      <label
                        key={addr.id}
                        className='flex items-start gap-3 p-3 cursor-pointer transition-all'
                        style={{
                          border: `1px solid ${selectedAddressId === addr.id ? C.accent : C.border}`,
                          backgroundColor:
                            selectedAddressId === addr.id
                              ? C.accent + "0a"
                              : "transparent"
                        }}
                      >
                        <input
                          type='radio'
                          name='address'
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className='mt-0.5'
                          style={{ accentColor: C.accent }}
                        />
                        <div
                          className='flex-1 text-xs'
                          style={{ color: C.text }}
                        >
                          <div className='font-semibold mb-0.5 flex items-center gap-1.5'>
                            {addr.recipient_name || "—"}
                            {addr.is_default && (
                              <span
                                className='text-xs px-1.5 py-0.5 rounded-full'
                                style={{
                                  backgroundColor: C.accent + "22",
                                  color: C.accent
                                }}
                              >
                                Utama
                              </span>
                            )}
                          </div>
                          <div className='opacity-70 leading-snug'>
                            {[
                              addr.address?.street,
                              addr.address?.village,
                              addr.address?.district,
                              addr.address?.city,
                              addr.address?.province,
                              addr.address?.postal_code
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                          {addr.phone && (
                            <div className='opacity-60 mt-0.5'>
                              {addr.phone}
                            </div>
                          )}
                          {addr.notes && (
                            <div className='opacity-50 mt-0.5 italic'>
                              {addr.notes}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Shipping method selector */}
            {!loading && items.length > 0 && (
              <div
                className='p-5 space-y-3'
                style={{
                  border: `1px solid ${C.border}`,
                  backgroundColor: C.bgCard
                }}
              >
                <div className='flex items-center gap-2'>
                  <Truck className='w-4 h-4' style={{ color: C.accent }} />
                  <h3
                    className='text-sm font-bold'
                    style={{ fontFamily: "'Georgia', serif", color: C.text }}
                  >
                    Metode Pengiriman
                  </h3>
                </div>
                {shippingLoading ? (
                  <div className='space-y-2'>
                    {[1, 2].map(i => (
                      <div
                        key={i}
                        className='h-12 animate-pulse'
                        style={{ backgroundColor: C.border }}
                      />
                    ))}
                  </div>
                ) : shippingMethods.length === 0 ? (
                  <p className='text-xs opacity-60' style={{ color: C.text }}>
                    Tidak ada metode pengiriman tersedia.
                  </p>
                ) : (
                  <ShippingMethodSelector
                    methods={shippingMethods}
                    selectedId={selectedShipping?.id}
                    onSelect={setSelectedShipping}
                  />
                )}
              </div>
            )}

            {/* Order summary */}
            <div
              className='p-6 sticky top-24'
              style={{
                border: `1px solid ${C.border}`,
                backgroundColor: C.bgCard
              }}
            >
              <h3
                className='text-base font-bold mb-5'
                style={{ fontFamily: "'Georgia', serif", color: C.text }}
              >
                Ringkasan Pesanan
              </h3>

              {/* Promo code input */}
              <div className='mb-4 space-y-2'>
                <label
                  className='text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5'
                  style={{ color: C.mid }}
                >
                  <Ticket className='w-3.5 h-3.5' />
                  Kode Promo
                </label>
                <PromoCodeInput
                  appliedPromo={appliedPromo}
                  onApply={setAppliedPromo}
                  onRemove={() => setAppliedPromo(null)}
                />
                {appliedPromo &&
                  appliedPromo.min_purchase > 0 &&
                  subtotal + shippingCost < appliedPromo.min_purchase && (
                    <p className='text-xs' style={{ color: "#e53e3e" }}>
                      Minimal belanja {formatRupiah(appliedPromo.min_purchase)}{" "}
                      untuk menggunakan promo ini.
                    </p>
                  )}
              </div>

              <div className='space-y-3 mb-5 text-sm' style={{ color: C.text }}>
                <div className='flex justify-between'>
                  <span className='opacity-70'>
                    Subtotal ({totalItems} item)
                  </span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='opacity-70'>
                    Ongkos Kirim
                    {selectedShipping && (
                      <span className='opacity-60 ml-1 text-xs'>
                        ({selectedShipping.name})
                      </span>
                    )}
                  </span>
                  <span>{formatRupiah(shippingCost)}</span>
                </div>
                {discountAmount > 0 && (
                  <div
                    className='flex justify-between'
                    style={{ color: "#16a34a" }}
                  >
                    <span className='opacity-80'>Diskon Promo</span>
                    <span>−{formatRupiah(discountAmount)}</span>
                  </div>
                )}
                <div
                  className='pt-3 flex justify-between font-bold text-base'
                  style={{ borderTop: `1px solid ${C.border}` }}
                >
                  <span>Total</span>
                  <span style={{ color: C.accent }}>
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCheckout}
                disabled={
                  checkoutLoading ||
                  (isGuest && distanceKm !== null && distanceKm > 5)
                }
                className='w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'
                style={{ backgroundColor: C.accent, color: C.textLight }}
              >
                {checkoutLoading ? (
                  <>
                    <span className='inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin' />
                    Memproses...
                  </>
                ) : (
                  <>
                    {isGuest ? "Checkout sebagai Tamu" : "Checkout"}
                    <ArrowRight className='w-4 h-4' />
                  </>
                )}
              </motion.button>

              {/* COD shortcut hint for user accounts */}
              {!isGuest && (
                <p
                  className='mt-2 text-xs text-center opacity-50'
                  style={{ color: C.text }}
                >
                  Ingin COD?{" "}
                  <a
                    href='https://wa.me/6281234567890'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='underline font-medium opacity-100'
                    style={{ color: C.accent }}
                  >
                    Chat admin
                  </a>
                </p>
              )}

              {isGuest && (
                <p
                  className='mt-3 text-xs text-center opacity-60'
                  style={{ color: C.text }}
                >
                  Punya akun?{" "}
                  <Link
                    href='/login'
                    className='underline font-medium'
                    style={{ color: C.accent }}
                  >
                    Login dulu
                  </Link>
                </p>
              )}

              <button
                onClick={() => router.push("/")}
                className='w-full mt-3 py-2.5 text-xs font-medium text-center transition-colors hover:opacity-80'
                style={{ border: `1px solid ${C.border}`, color: C.accent }}
              >
                Lanjut Belanja
              </button>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}

// Haversine distance helper

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
