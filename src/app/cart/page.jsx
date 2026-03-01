"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShoppingCart,
  ClipboardList,
  User,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar, { C } from "@/components/Navbar";
import { useGuestCartStore } from "@/store/useGuestCartStore";

function formatRupiah(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

const navItems = [
  { label: "Products", href: "/", icon: <ShoppingBag className='w-4 h-4' /> },
  { label: "Cart", href: "/cart", icon: <ShoppingCart className='w-4 h-4' /> },
  {
    label: "My Orders",
    href: "/orders",
    icon: <ClipboardList className='w-4 h-4' />
  }
];

const EMPTY_GUEST_FORM = {
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  street: "",
  city: "",
  province: "",
  postal_code: "",
  payment_method: "bank_transfer"
};

export default function CartPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [updating, setUpdating] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const [guestForm, setGuestForm] = useState(EMPTY_GUEST_FORM);
  const [formErrors, setFormErrors] = useState({});

  // Track whether initial guest sync has been done
  const initialSyncDone = useRef(false);

  const guestItems = useGuestCartStore(s => s.items);
  const guestUpdateQuantity = useGuestCartStore(s => s.updateQuantity);
  const guestRemoveItem = useGuestCartStore(s => s.removeItem);
  const guestClearCart = useGuestCartStore(s => s.clearCart);
  const guestSync = useGuestCartStore(s => s.syncWithServer);
  const guestIsSyncing = useGuestCartStore(s => s.isSyncing);

  // 1. Auth check - only runs once
  useEffect(() => {
    fetch("/api/user/me")
      .then(res => (res.ok ? res.json() : null))
      .then(json => {
        setUserId(json?.user?.id ?? false);
        setAuthLoading(false);
      })
      .catch(() => {
        setUserId(false);
        setAuthLoading(false);
      });
  }, []);

  // 2. Load cart once after auth resolves
  useEffect(() => {
    if (authLoading) return;
    if (userId) {
      fetchUserCart();
    } else {
      // Only sync with server ONCE on initial load
      loadGuestCart();
    }
  }, [userId, authLoading]);

  // 3. REMOVED: the problematic useEffect that watched guestItems
  //    It was causing an infinite loop:
  //    guestSync() → updates store → guestItems changes → loadGuestCart() → guestSync() → ...
  //
  //    Instead, for guest UI updates (remove/qty change), we update local state directly
  //    inside updateGuestQty and removeGuestItemFn — no need to re-sync.

  async function fetchUserCart() {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/cart`);
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
        product_image: item.variant?.product?.primary_image ?? null,
      }));
      setItems(normalized);
      setSubtotal(json.subtotal || 0);
      setTotalItems(json.total || 0);
    } finally {
      setLoading(false);
    }
  }

  async function loadGuestCart() {
    setLoading(true);
    try {
      // Only hit Supabase on the FIRST load, not on every local cart change
      if (!initialSyncDone.current) {
        await guestSync();
        initialSyncDone.current = true;
      }
      const latestItems = useGuestCartStore.getState().items;
      setItems(latestItems);
      setSubtotal(latestItems.reduce((s, i) => s + i.variant_price * i.quantity, 0));
      setTotalItems(latestItems.reduce((s, i) => s + i.quantity, 0));
    } catch (err) {
      console.error("Failed to sync guest cart", err);
    } finally {
      setLoading(false);
    }
  }

  function updateGuestQty(variant_id, quantity) {
    setUpdating(variant_id);
    const updatedItems = items.map(i =>
      i.variant_id === variant_id
        ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
        : i
    );
    setItems(updatedItems);
    guestUpdateQuantity(variant_id, quantity);
    setSubtotal(updatedItems.reduce((s, i) => s + i.variant_price * i.quantity, 0));
    setTotalItems(updatedItems.reduce((s, i) => s + i.quantity, 0));
    setTimeout(() => setUpdating(null), 200);
  }

  async function updateUserQty(item, quantity) {
    setUpdating(item.id);
    try {
      await fetch(`/api/dashboard/cart?id=${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity })
      });
      const updatedItems = items.map(i =>
        i.id === item.id ? { ...i, quantity } : i
      );
      setItems(updatedItems);
      setSubtotal(updatedItems.reduce((s, i) => s + i.variant_price * i.quantity, 0));
      setTotalItems(updatedItems.reduce((s, i) => s + i.quantity, 0));
    } finally {
      setUpdating(null);
    }
  }

  function removeGuestItemFn(variant_id) {
    setRemoving(variant_id);
    guestRemoveItem(variant_id);
    const newItems = items.filter(i => i.variant_id !== variant_id);
    setItems(newItems);
    setSubtotal(newItems.reduce((s, i) => s + i.variant_price * i.quantity, 0));
    setTotalItems(newItems.reduce((s, i) => s + i.quantity, 0));
    setTimeout(() => setRemoving(null), 200);
  }

  async function removeUserItemFn(item) {
    setRemoving(item.id);
    try {
      await fetch(`/api/dashboard/cart?id=${item.id}`, { method: "DELETE" });
      const newItems = items.filter(i => i.id !== item.id);
      setItems(newItems);
      setSubtotal(newItems.reduce((s, i) => s + i.variant_price * i.quantity, 0));
      setTotalItems(newItems.reduce((s, i) => s + i.quantity, 0));
    } finally {
      setRemoving(null);
    }
  }

  async function handleCheckout() {
    setCheckoutError("");

    if (!userId) {
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        document.getElementById("guest-form")?.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    setCheckoutLoading(true);
    try {
      const orderItems = items.map(item => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.variant_price
      }));

      const body = userId
        ? { items: orderItems }
        : { items: orderItems, ...guestForm };

      const endpoint = userId ? "/api/data/orders" : "/api/data/guest-orders";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Checkout gagal");

      if (!userId) guestClearCart();
      router.push("/orders");
    } catch (err) {
      setCheckoutError(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  }

  function validateForm() {
    const errors = {};
    if (!guestForm.customer_name) errors.customer_name = "Wajib";
    if (!guestForm.customer_email) errors.customer_email = "Wajib";
    if (!guestForm.customer_phone) errors.customer_phone = "Wajib";
    return errors;
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setGuestForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  }

  const isGuest = !authLoading && !userId;
  const shippingCost = 10000;
  const grandTotal = subtotal + shippingCost;

  function handleUpdateQty(item, quantity) {
    if (quantity < 1) return;
    if (userId) updateUserQty(item, quantity);
    else updateGuestQty(item.variant_id, quantity);
  }

  function handleRemove(item) {
    if (userId) removeUserItemFn(item);
    else removeGuestItemFn(item.variant_id);
  }

  function getItemKey(item) {
    return userId ? item.id : item.variant_id;
  }

  return (
    <div className='font-sans min-h-screen' style={{ backgroundColor: C.bg }}>
      <Navbar />

      {/* Hero */}
      <div
        className='relative w-full overflow-hidden flex items-center justify-center'
        style={{ minHeight: "320px", backgroundColor: C.accent }}
      >
        <div className='text-center px-4'>
          <h1
            className='text-4xl md:text-5xl font-bold mb-3'
            style={{ fontFamily: "'Georgia', serif", color: C.textLight }}
          >
            Keranjang
          </h1>
          <p
            className='text-base md:text-lg opacity-80 max-w-xl mx-auto'
            style={{ color: C.textLight }}
          >
            {isGuest
              ? "Isi data pengiriman dan checkout sebagai tamu — atau login agar pesanan tersimpan di akunmu."
              : "Pesanan tersimpan di akun kamu."}
          </p>
        </div>
      </div>

      <div className='px-5 sm:px-8 py-10 md:py-12 max-w-7xl mx-auto'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
          <h2
            className='text-2xl md:text-3xl font-bold'
            style={{ fontFamily: "'Georgia', serif", color: C.text }}
          >
            Keranjang Belanja
          </h2>
        </div>

        <div className='flex flex-col md:flex-row gap-8'>
          {/* Sidebar */}
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
                  {navItems.map(({ label, href, icon }) => {
                    const isActive = pathname === href;
                    return (
                      <li key={label}>
                        <Link
                          href={href}
                          className='w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all'
                          style={
                            isActive
                              ? { backgroundColor: C.accent, color: C.textLight }
                              : { color: C.accent }
                          }
                        >
                          <span style={{ color: isActive ? C.textLight : C.mid }}>
                            {icon}
                          </span>
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div style={{ borderTop: `1px solid ${C.border}` }} />
              {!loading && items.length > 0 && (
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
              )}
            </div>
          </aside>

          {/* Main */}
          <div className='flex-1'>
            {guestIsSyncing && (
              <p className="text-xs text-center mb-3 opacity-60" style={{ color: C.text }}>
                Sinkronisasi harga &amp; stok...
              </p>
            )}

            {loading || authLoading ? (
              <div className='space-y-4'>
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className='p-5 animate-pulse'
                    style={{ border: `1px solid ${C.border}`, backgroundColor: C.bgCard }}
                  >
                    <div className='flex gap-4'>
                      <div className='w-20 h-20' style={{ backgroundColor: C.border }} />
                      <div className='flex-1 space-y-2'>
                        <div className='h-4 w-2/3' style={{ backgroundColor: C.border }} />
                        <div className='h-3 w-1/3' style={{ backgroundColor: C.border }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className='text-center py-24'>
                <ShoppingBag
                  className='w-16 h-16 mx-auto mb-4 opacity-30'
                  style={{ color: C.accent }}
                />
                <p
                  className='text-lg mb-2'
                  style={{ fontFamily: "'Georgia', serif", color: C.text }}
                >
                  Keranjang masih kosong
                </p>
                <p className='text-sm mb-6 opacity-60' style={{ color: C.text }}>
                  Yuk belanja jamu sehat untuk keluarga!
                </p>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => router.push("/")}
                  className='px-6 py-2.5 text-sm font-medium'
                  style={{ backgroundColor: C.accent, color: C.textLight }}
                >
                  Lihat Produk
                </motion.button>
              </div>
            ) : (
              <div className='flex flex-col lg:flex-row gap-8'>
                {/* Cart items */}
                <div className='flex-1 space-y-4'>
                  <AnimatePresence>
                    {items.map(item => (
                      <motion.div
                        key={getItemKey(item)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        className='overflow-hidden'
                        style={{ border: `1px solid ${C.border}`, backgroundColor: C.bgCard }}
                      >
                        <div className='flex gap-4 p-4'>
                          <div
                            className='w-20 h-20 flex-shrink-0 overflow-hidden'
                            style={{ backgroundColor: C.border }}
                          >
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className='w-full h-full object-cover'
                              onError={e => { e.target.style.display = "none"; }}
                            />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p
                              className='font-bold text-sm mb-0.5 truncate'
                              style={{ fontFamily: "'Georgia', serif", color: C.text }}
                            >
                              {item.product_name}
                            </p>
                            <p className='text-xs mb-2 opacity-60' style={{ color: C.text }}>
                              Varian: {item.variant_name} · SKU: {item.variant_sku}
                            </p>
                            <p className='text-sm font-bold' style={{ color: C.accent }}>
                              {formatRupiah(item.variant_price)}
                            </p>
                          </div>
                          <div className='flex flex-col items-end justify-between gap-2 flex-shrink-0'>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRemove(item)}
                              disabled={removing === getItemKey(item)}
                              className='p-1.5 opacity-50 hover:opacity-100 transition-opacity'
                              style={{ color: C.accent }}
                            >
                              <Trash2 className='w-4 h-4' />
                            </motion.button>
                            <div className='flex items-center gap-2'>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleUpdateQty(item, item.quantity - 1)}
                                disabled={updating === getItemKey(item) || item.quantity <= 1}
                                className='w-7 h-7 flex items-center justify-center'
                                style={{ border: `1px solid ${C.border}`, color: C.accent }}
                              >
                                <Minus className='w-3 h-3' />
                              </motion.button>
                              <span
                                className='text-sm font-medium w-6 text-center'
                                style={{ color: C.text }}
                              >
                                {updating === getItemKey(item) ? "…" : item.quantity}
                              </span>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleUpdateQty(item, item.quantity + 1)}
                                disabled={
                                  updating === getItemKey(item) ||
                                  item.quantity >= item.stock
                                }
                                className='w-7 h-7 flex items-center justify-center'
                                style={{ border: `1px solid ${C.border}`, color: C.accent }}
                              >
                                <Plus className='w-3 h-3' />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                        <div
                          className='px-4 py-2 flex justify-end'
                          style={{ borderTop: `1px solid ${C.border}` }}
                        >
                          <span className='text-xs' style={{ color: C.mid }}>
                            Subtotal:{" "}
                            <strong style={{ color: C.accent }}>
                              {formatRupiah(item.variant_price * item.quantity)}
                            </strong>
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* FORM GUEST */}
                  {isGuest && (
                    <div
                      id='guest-form'
                      className='mt-6 p-6 space-y-4'
                      style={{ border: `1px solid ${C.border}`, backgroundColor: C.bgCard }}
                    >
                      <div className='flex items-center gap-2 mb-4'>
                        <User className='w-4 h-4' style={{ color: C.accent }} />
                        <h3
                          className='text-base font-bold'
                          style={{ fontFamily: "'Georgia', serif", color: C.text }}
                        >
                          Data Pengiriman
                        </h3>
                      </div>
                      <p className='text-xs opacity-60 -mt-2' style={{ color: C.text }}>
                        Kamu berbelanja sebagai tamu. Isi data di bawah untuk menyelesaikan pesanan.
                      </p>

                      <Field label='Nama Lengkap' error={formErrors.customer_name}>
                        <input
                          name='customer_name'
                          value={guestForm.customer_name}
                          onChange={handleFormChange}
                          placeholder='Dewi Sartika'
                          className='w-full px-3 py-2 text-sm outline-none bg-transparent'
                          style={{
                            border: `1px solid ${formErrors.customer_name ? "#e53e3e" : C.border}`,
                            color: C.text
                          }}
                        />
                      </Field>

                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <Field label='Email' error={formErrors.customer_email}>
                          <input
                            name='customer_email'
                            type='email'
                            value={guestForm.customer_email}
                            onChange={handleFormChange}
                            placeholder='email@contoh.com'
                            className='w-full px-3 py-2 text-sm outline-none bg-transparent'
                            style={{
                              border: `1px solid ${formErrors.customer_email ? "#e53e3e" : C.border}`,
                              color: C.text
                            }}
                          />
                        </Field>
                        <Field label='Nomor HP' error={formErrors.customer_phone}>
                          <input
                            name='customer_phone'
                            value={guestForm.customer_phone}
                            onChange={handleFormChange}
                            placeholder='081234567890'
                            className='w-full px-3 py-2 text-sm outline-none bg-transparent'
                            style={{
                              border: `1px solid ${formErrors.customer_phone ? "#e53e3e" : C.border}`,
                              color: C.text
                            }}
                          />
                        </Field>
                      </div>

                      <Field label='Alamat Jalan' error={formErrors.street}>
                        <input
                          name='street'
                          value={guestForm.street}
                          onChange={handleFormChange}
                          placeholder='Jl. Mawar No. 5'
                          className='w-full px-3 py-2 text-sm outline-none bg-transparent'
                          style={{
                            border: `1px solid ${formErrors.street ? "#e53e3e" : C.border}`,
                            color: C.text
                          }}
                        />
                      </Field>

                      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                        <Field label='Kota' error={formErrors.city}>
                          <input
                            name='city'
                            value={guestForm.city}
                            onChange={handleFormChange}
                            placeholder='Yogyakarta'
                            className='w-full px-3 py-2 text-sm outline-none bg-transparent'
                            style={{
                              border: `1px solid ${formErrors.city ? "#e53e3e" : C.border}`,
                              color: C.text
                            }}
                          />
                        </Field>
                        <Field label='Provinsi' error={formErrors.province}>
                          <input
                            name='province'
                            value={guestForm.province}
                            onChange={handleFormChange}
                            placeholder='DIY'
                            className='w-full px-3 py-2 text-sm outline-none bg-transparent'
                            style={{
                              border: `1px solid ${formErrors.province ? "#e53e3e" : C.border}`,
                              color: C.text
                            }}
                          />
                        </Field>
                        <Field label='Kode Pos' error={formErrors.postal_code}>
                          <input
                            name='postal_code'
                            value={guestForm.postal_code}
                            onChange={handleFormChange}
                            placeholder='55281'
                            className='w-full px-3 py-2 text-sm outline-none bg-transparent'
                            style={{
                              border: `1px solid ${formErrors.postal_code ? "#e53e3e" : C.border}`,
                              color: C.text
                            }}
                          />
                        </Field>
                      </div>

                      <Field label='Metode Pembayaran'>
                        <select
                          name='payment_method'
                          value={guestForm.payment_method}
                          onChange={handleFormChange}
                          className='w-full px-3 py-2 text-sm outline-none appearance-none'
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
                    </div>
                  )}
                </div>

                {/* Order summary */}
                <div className='lg:w-72 flex-shrink-0'>
                  <div
                    className='p-6 sticky top-24'
                    style={{ border: `1px solid ${C.border}`, backgroundColor: C.bgCard }}
                  >
                    <h3
                      className='text-base font-bold mb-5'
                      style={{ fontFamily: "'Georgia', serif", color: C.text }}
                    >
                      Ringkasan Pesanan
                    </h3>
                    <div className='space-y-3 mb-5 text-sm' style={{ color: C.text }}>
                      <div className='flex justify-between'>
                        <span className='opacity-70'>Subtotal ({totalItems} item)</span>
                        <span>{formatRupiah(subtotal)}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='opacity-70'>Ongkos Kirim</span>
                        <span>{formatRupiah(shippingCost)}</span>
                      </div>
                      <div
                        className='pt-3 flex justify-between font-bold'
                        style={{ borderTop: `1px solid ${C.border}` }}
                      >
                        <span>Total</span>
                        <span style={{ color: C.accent }}>{formatRupiah(grandTotal)}</span>
                      </div>
                    </div>

                    {checkoutError && (
                      <div
                        className='mb-3 flex items-start gap-2 text-xs p-3'
                        style={{
                          backgroundColor: "#fff5f5",
                          border: "1px solid #fed7d7",
                          color: "#c53030"
                        }}
                      >
                        <AlertCircle className='w-4 h-4 flex-shrink-0 mt-0.5' />
                        {checkoutError}
                      </div>
                    )}

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                      className='w-full flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors'
                      style={{
                        backgroundColor: C.accent,
                        color: C.textLight,
                        opacity: checkoutLoading ? 0.7 : 1
                      }}
                    >
                      {checkoutLoading
                        ? "Memproses..."
                        : isGuest
                          ? "Checkout sebagai Tamu"
                          : "Checkout"}
                      {!checkoutLoading && <ArrowRight className='w-4 h-4' />}
                    </motion.button>

                    {isGuest && (
                      <p
                        className='mt-3 text-xs text-center opacity-60'
                        style={{ color: C.text }}
                      >
                        Punya akun?{" "}
                        <Link href='/login' className='underline' style={{ color: C.accent }}>
                          Login dulu
                        </Link>
                      </p>
                    )}

                    <button
                      onClick={() => router.push("/")}
                      className='w-full mt-3 py-2.5 text-sm font-medium text-center transition-colors'
                      style={{ border: `1px solid ${C.border}`, color: C.accent }}
                    >
                      Lanjut Belanja
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className='block text-xs font-semibold mb-1' style={{ color: C.mid }}>
        {label}
      </label>
      {children}
      {error && (
        <p className='mt-1 text-xs' style={{ color: "#e53e3e" }}>
          {error}
        </p>
      )}
    </div>
  );
}
