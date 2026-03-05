"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Package,
  ShoppingBag,
  ShoppingCart,
  ClipboardList,
  Search,
  LogIn,
  User,
  Plus,
  MapPin,
  MessageCircle,
  CheckCircle,
  Star
} from "lucide-react";
import Link from "next/link";
import { C } from "@/components/Navbar";
import PublicLayout from "@/components/PublicLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { siteConfig } from "@/lib/siteConfig";

//  Helpers
function formatRupiah(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatDate(str) {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

//  Constants
const STATUS_COLOR = {
  pending: { bg: "#FFF3CD", text: "#856404" },
  processing: { bg: "#D1ECF1", text: "#0C5460" },
  paid: { bg: "#D4EDDA", text: "#155724" },
  shipping: { bg: "#CCE5FF", text: "#004085" },
  delivered: { bg: "#D4EDDA", text: "#155724" },
  completed: { bg: "#D4EDDA", text: "#155724" },
  cancelled: { bg: "#F8D7DA", text: "#721C24" },
  refunded: { bg: "#E2E3E5", text: "#383D41" },
  expired: { bg: "#F8D7DA", text: "#721C24" }
};

const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "pending", label: "Menunggu Pembayaran" },
  { value: "processing", label: "Diproses" },
  { value: "shipping", label: "Dikirim" },
  { value: "delivered", label: "Terkirim" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" }
];

//  Status Filter (masuk ke sidebarExtra)
function StatusFilter({ filterStatus, setFilterStatus }) {
  return (
    <>
      {/* Desktop */}
      <div className='hidden md:block'>
        <p
          className='text-xs font-semibold uppercase tracking-widest mb-2 px-1'
          style={{ color: C.mid }}
        >
          Status
        </p>
        <ul className='space-y-1'>
          {statusOptions.map(opt => (
            <li key={opt.value}>
              <button
                onClick={() => setFilterStatus(opt.value)}
                className='w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-all'
                style={
                  filterStatus === opt.value
                    ? { backgroundColor: C.accent, color: C.textLight }
                    : { color: C.accent }
                }
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile */}
      <div className='md:hidden mb-6'>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className='w-full px-4 py-2.5 text-sm'
          style={{
            border: `1px solid ${C.border}`,
            backgroundColor: C.bgCard,
            color: C.accent
          }}
        >
          {statusOptions.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

//  Guest Lookup Form
function GuestLookupForm({ onFound }) {
  const [identifier, setIdentifier] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    const trimmed = identifier.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const isEmail = trimmed.includes("@");
      const contactParam = isEmail
        ? `email=${encodeURIComponent(trimmed)}`
        : `phone=${encodeURIComponent(trimmed)}`;

      let url = `/api/data/guest-orders?${contactParam}`;
      if (orderId.trim()) url += `&id=${encodeURIComponent(orderId.trim())}`;

      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        setError("Pesanan tidak ditemukan. Pastikan email/nomor HP benar.");
        return;
      }

      if (orderId.trim()) {
        if (!json.data) {
          setError("Pesanan tidak ditemukan.");
        } else {
          onFound(json.data);
        }
      } else {
        if (!json.data?.length) {
          setError("Tidak ada pesanan ditemukan untuk kontak tersebut.");
        } else {
          setResults(json.data);
        }
      }
    } catch {
      setError("Gagal menghubungi server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (results) {
    return <GuestOrderList orders={results} onReset={() => setResults(null)} />;
  }

  return (
    <div className='py-16 px-4 text-center'>
      <LogIn
        className='w-12 h-12 mx-auto mb-4 opacity-30'
        style={{ color: C.accent }}
      />
      <h2
        className='text-2xl font-bold mb-2'
        style={{ fontFamily: "'Georgia', serif", color: C.text }}
      >
        Lacak Pesananmu
      </h2>
      <p className='text-sm mb-6 opacity-70' style={{ color: C.text }}>
        Masukkan email atau nomor HP untuk melihat semua pesananmu. Tambahkan ID
        pesanan jika ingin mencari pesanan tertentu. Atau{" "}
        <Link
          href='/login'
          className='underline font-medium'
          style={{ color: C.accent }}
        >
          login
        </Link>{" "}
        untuk akses lebih mudah.
      </p>

      <form
        onSubmit={handleSearch}
        className='space-y-3 max-w-md mx-auto text-left'
      >
        <input
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          placeholder='Email atau Nomor HP *'
          required
          className='w-full px-4 py-2.5 text-sm outline-none'
          style={{
            border: `1px solid ${C.border}`,
            backgroundColor: C.bgCard,
            color: C.text
          }}
        />
        <input
          value={orderId}
          onChange={e => setOrderId(e.target.value)}
          placeholder='ID Pesanan (opsional)'
          className='w-full px-4 py-2.5 text-sm outline-none'
          style={{
            border: `1px solid ${C.border}`,
            backgroundColor: C.bgCard,
            color: C.text
          }}
        />
        <button
          type='submit'
          disabled={loading}
          className='w-full px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-opacity disabled:opacity-60'
          style={{ backgroundColor: C.accent, color: C.textLight }}
        >
          <Search className='w-4 h-4' />
          {loading ? "Mencari..." : "Cari Pesanan"}
        </button>
      </form>

      {error && (
        <p className='mt-3 text-sm' style={{ color: "#721C24" }}>
          {error}
        </p>
      )}
    </div>
  );
}

//  Guest Order List
function GuestOrderList({ orders, onReset }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className='space-y-4'>
      <button
        onClick={onReset}
        className='text-sm underline mb-2'
        style={{ color: C.accent }}
      >
        ← Cari dengan email/HP lain
      </button>
      {orders.map(order => (
        <OrderCard
          key={order.id}
          order={order}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
        />
      ))}
    </div>
  );
}

//  Order Card
function OrderCard({ order, expandedId, setExpandedId, isLoggedInUser = false, onOrderCompleted }) {
  const isExpanded = expandedId === order.id;
  const sc = STATUS_COLOR[order.status] || { bg: C.border, text: C.text };
  const [completing, setCompleting] = useState(false);

  // Ambil slug produk pertama untuk link rating
  const firstItemSlug =
    order.items?.[0]?.product_variants?.products?.slug ?? null;

  async function handleCompleteOrder() {
    if (!window.confirm("Tandai pesanan ini sebagai selesai?")) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/data/orders/${order.id}/complete`, {
        method: "PATCH"
      });
      if (res.ok) {
        onOrderCompleted?.(order.id);
      } else {
        alert("Gagal menyelesaikan pesanan. Coba lagi.");
      }
    } catch {
      alert("Terjadi kesalahan. Coba lagi.");
    } finally {
      setCompleting(false);
    }
  }

  return (
    <motion.div
      key={order.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className='overflow-hidden'
      style={{ border: `1px solid ${C.border}`, backgroundColor: C.bgCard }}
    >
      <button
        className='w-full text-left p-5'
        onClick={() => setExpandedId(isExpanded ? null : order.id)}
      >
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div>
            <div className='flex items-center gap-3 mb-1'>
              <span className='text-sm font-bold' style={{ color: C.text }}>
                {order.id}
              </span>
              <span
                className='text-xs px-2 py-0.5 font-medium'
                style={{ backgroundColor: sc.bg, color: sc.text }}
              >
                {order.status_label}
              </span>
            </div>
            <p className='text-xs opacity-60' style={{ color: C.text }}>
              {formatDate(order.created_at)} · {order.items?.length || 0} produk
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <div className='text-right'>
              <p
                className='text-xs opacity-60 mb-0.5'
                style={{ color: C.text }}
              >
                Total Pembayaran
              </p>
              <p className='text-sm font-bold' style={{ color: C.accent }}>
                {formatRupiah(order.total_price)}
              </p>
            </div>
            {isExpanded ? (
              <ChevronUp
                className='w-4 h-4 flex-shrink-0'
                style={{ color: C.mid }}
              />
            ) : (
              <ChevronDown
                className='w-4 h-4 flex-shrink-0'
                style={{ color: C.mid }}
              />
            )}
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key='detail'
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: { duration: 0.3 }
            }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
            style={{ borderTop: `1px solid ${C.border}`, overflow: "hidden" }}
          >
            <div className='p-5 space-y-5'>
              {/* Items */}
              <div className='space-y-3'>
                {order.items?.map(item => (
                  <div key={item.id} className='flex items-center gap-3'>
                    <div
                      className='w-12 h-12 flex-shrink-0 overflow-hidden'
                      style={{ backgroundColor: C.border }}
                    >
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className='w-full h-full object-cover'
                        />
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p
                        className='text-sm font-medium truncate'
                        style={{ color: C.text }}
                      >
                        {`${item.product_variants.products.name} - ${item.product_variants.name}`}
                      </p>
                      <p
                        className='text-xs opacity-60'
                        style={{ color: C.text }}
                      >
                        {item.variant_name ?? ""} × {item.quantity}
                      </p>
                    </div>
                    <p
                      className='text-sm font-medium flex-shrink-0'
                      style={{ color: C.accent }}
                    >
                      {formatRupiah(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div
                className='text-sm space-y-2 pt-3'
                style={{ borderTop: `1px solid ${C.border}`, color: C.text }}
              >
                <div className='flex justify-between opacity-70'>
                  <span>Subtotal</span>
                  <span>{formatRupiah(order.total_price)}</span>
                </div>
                <div className='flex justify-between opacity-70'>
                  <span>Ongkos Kirim</span>
                  <span>{formatRupiah(order.shipping_price)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className='flex justify-between opacity-70'>
                    <span>Diskon</span>
                    <span>-{formatRupiah(order.discount_amount)}</span>
                  </div>
                )}
                <div
                  className='flex justify-between font-bold pt-2'
                  style={{ borderTop: `1px solid ${C.border}` }}
                >
                  <span>Total</span>
                  <span style={{ color: C.accent }}>
                    {formatRupiah(order.total_price)}
                  </span>
                </div>
              </div>

              {/* Shipping address */}
              {order.address && (
                <div className='text-xs opacity-60' style={{ color: C.text }}>
                  <p className='font-medium mb-0.5 opacity-100'>
                    Alamat Pengiriman
                  </p>
                  <p>
                    {typeof order.address.address === "object"
                      ? [
                          order.address.address?.street,
                          order.address.address?.city,
                          order.address.address?.province,
                          order.address.address?.postal_code
                        ]
                          .filter(Boolean)
                          .join(", ")
                      : (order.address.address ?? order.address.name)}
                  </p>
                </div>
              )}

              {/* ── Action Buttons ── */}
              <div className='space-y-2 pt-1'>

                {/* 1. Bayar Sekarang — hanya saat pending */}
                {order.midtrans_url && order.status === "pending" && (
                  <a
                    href={order.midtrans_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center justify-center gap-2 w-full text-center py-2.5 text-sm font-medium transition-colors'
                    style={{ backgroundColor: C.accent, color: C.textLight }}
                  >
                    Bayar Sekarang
                  </a>
                )}

                {/* 2. Hubungi Penjual via WhatsApp — selalu tampil */}
                <a
                  href={siteConfig.whatsappOrderMessage(order.id)}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center justify-center gap-2 w-full text-center py-2.5 text-sm font-medium transition-colors'
                  style={{
                    border: `1px solid #25D366`,
                    color: "#25D366",
                    backgroundColor: "transparent"
                  }}
                >
                  <MessageCircle className='w-4 h-4' />
                  Hubungi Penjual
                </a>

                {/* 3. Selesaikan Pesanan — hanya buyer, hanya saat status delivered */}
                {isLoggedInUser && order.status === "delivered" && (
                  <button
                    onClick={handleCompleteOrder}
                    disabled={completing}
                    className='flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium transition-opacity disabled:opacity-60'
                    style={{ backgroundColor: "#155724", color: "#fff" }}
                  >
                    <CheckCircle className='w-4 h-4' />
                    {completing ? "Memproses..." : "Selesaikan Pesanan"}
                  </button>
                )}

                {/* 4. Beri Rating — hanya saat status completed */}
                {order.status === "completed" && firstItemSlug && (
                  <Link
                    href={`/products/${firstItemSlug}/rating`}
                    className='flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium transition-colors'
                    style={{
                      border: `1px solid ${C.accent}`,
                      color: C.accent,
                      backgroundColor: "transparent"
                    }}
                  >
                    <Star className='w-4 h-4' />
                    Beri Rating Produk
                  </Link>
                )}
              </div>
              {/* ── End Action Buttons ── */}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

//  Address Selector
function AddressSelector({ value, onChange }) {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    street: "",
    village: "",
    district: "",
    city: "",
    province: "",
    postal_code: "",
    notes: ""
  });

  useEffect(() => {
    fetch("/api/dashboard/addresses")
      .then(res => (res.ok ? res.json() : { data: [] }))
      .then(json => setAddresses(json.data ?? []))
      .catch(() => {});
  }, []);

  function handleSelect(addr) {
    onChange({
      street: addr.street,
      village: addr.village,
      district: addr.district,
      city: addr.city,
      province: addr.province,
      postal_code: addr.postal_code,
      notes: addr.notes
    });
  }

  async function handleAddNew(e) {
    e.preventDefault();
    const res = await fetch("/api/dashboard/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const json = await res.json();
    if (res.ok && json.data) {
      setAddresses(prev => [json.data, ...prev]);
      handleSelect(json.data);
      setShowForm(false);
      setForm({ street: "", village: "", district: "", city: "", province: "", postal_code: "", notes: "" });
    }
  }

  return (
    <div className='space-y-3'>
      <p className='text-sm font-semibold' style={{ color: C.text }}>
        Alamat Pengiriman
      </p>
      {addresses.length > 0 && (
        <div className='space-y-2'>
          {addresses.map(addr => {
            const isActive =
              value?.street === addr.street && value?.city === addr.city;
            return (
              <button
                key={addr.id}
                onClick={() => handleSelect(addr)}
                className='w-full text-left px-4 py-3 text-sm flex items-start gap-3 transition-all'
                style={{
                  border: `1px solid ${isActive ? C.accent : C.border}`,
                  backgroundColor: isActive ? `${C.accent}15` : C.bgCard,
                  color: C.text
                }}
              >
                <MapPin
                  className='w-4 h-4 mt-0.5 flex-shrink-0'
                  style={{ color: C.accent }}
                />
                <span>
                  {[addr.street, addr.village, addr.district, addr.city, addr.province, addr.postal_code]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </button>
            );
          })}
        </div>
      )}
      <button
        onClick={() => setShowForm(v => !v)}
        className='flex items-center gap-2 text-sm font-medium'
        style={{ color: C.accent }}
      >
        <Plus className='w-4 h-4' />
        Tambah Alamat Baru
      </button>
      {showForm && (
        <form onSubmit={handleAddNew} className='space-y-2 pt-1'>
          {[
            { key: "street", placeholder: "Jalan / No. Rumah" },
            { key: "village", placeholder: "Kelurahan / Desa" },
            { key: "district", placeholder: "Kecamatan" },
            { key: "city", placeholder: "Kota / Kabupaten" },
            { key: "province", placeholder: "Provinsi" },
            { key: "postal_code", placeholder: "Kode Pos" },
            { key: "notes", placeholder: "Catatan Pengiriman (opsional)", required: false }
          ].map(({ key, placeholder, required = true }) => (
            <input
              key={key}
              required={required}
              value={form[key]}
              onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              placeholder={placeholder}
              className='w-full px-4 py-2.5 text-sm outline-none'
              style={{
                border: `1px solid ${C.border}`,
                backgroundColor: C.bgCard,
                color: C.text
              }}
            />
          ))}
          <button
            type='submit'
            className='w-full py-2.5 text-sm font-medium'
            style={{ backgroundColor: C.accent, color: C.textLight }}
          >
            Simpan & Pilih Alamat Ini
          </button>
        </form>
      )}
    </div>
  );
}

//  Page
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [guestOrder, setGuestOrder] = useState(null);

  const { user, loading: authLoading, fetchUser } = useAuthStore();
  const userId = user?.id ?? (authLoading ? undefined : false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user, filterStatus]);

  async function fetchOrders() {
    setLoading(true);
    try {
      let url = `/api/data/orders`;
      if (filterStatus) url += `?status=${filterStatus}`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.status === 401) {
        setUser(null);
      } else {
        setOrders(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  }

  // Callback ketika pesanan berhasil diselesaikan — update status lokal
  function handleOrderCompleted(orderId) {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, status: "completed", status_label: "Selesai" }
          : o
      )
    );
  }

  // Props PublicLayout yang sama untuk semua state
  const layoutProps = {
    heroTitle: "Pesananmu",
    heroSubtitle: user
      ? `Halo, ${user.name || user.email}. Berikut riwayat pesananmu.`
      : "Pesanan tetap aman tanpa login. Lacak menggunakan email/HP, atau login untuk melihat semua pesanan.",
    sectionTitle: user ? "Pesanan Saya" : "Lacak Pesanan",
    sectionAction: !user && (
      <Link
        href='/login'
        className='flex items-center gap-2 px-4 py-2 text-sm font-medium'
        style={{ backgroundColor: C.accent, color: C.textLight }}
      >
        <User className='w-4 h-4' />
        Login untuk lihat semua
      </Link>
    )
  };

  //  Loading
  if (authLoading) {
    return (
      <PublicLayout {...layoutProps}>
        <div className='flex items-center justify-center py-24'>
          <p className='text-sm opacity-50' style={{ color: C.text }}>
            Memuat...
          </p>
        </div>
      </PublicLayout>
    );
  }

  //  Guest
  if (!user) {
    return (
      <PublicLayout {...layoutProps}>
        {guestOrder ? (
          <div className='space-y-4'>
            <button
              onClick={() => setGuestOrder(null)}
              className='text-sm underline mb-2'
              style={{ color: C.accent }}
            >
              ← Cari pesanan lain
            </button>
            {/* Guest tidak bisa selesaikan pesanan, isLoggedInUser=false */}
            <OrderCard
              order={guestOrder}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              isLoggedInUser={false}
            />
          </div>
        ) : (
          <GuestLookupForm onFound={setGuestOrder} />
        )}
      </PublicLayout>
    );
  }

  //  Logged in
  return (
    <PublicLayout
      {...layoutProps}
      sidebarExtra={
        <StatusFilter
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      }
    >
      {loading ? (
        <div className='space-y-4'>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className='p-5 animate-pulse'
              style={{
                border: `1px solid ${C.border}`,
                backgroundColor: C.bgCard
              }}
            >
              <div
                className='h-4 w-1/3 mb-3'
                style={{ backgroundColor: C.border }}
              />
              <div
                className='h-3 w-2/3'
                style={{ backgroundColor: C.border }}
              />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className='text-center py-24'>
          <Package
            className='w-16 h-16 mx-auto mb-4 opacity-30'
            style={{ color: C.accent }}
          />
          <p
            className='text-lg'
            style={{ fontFamily: "'Georgia', serif", color: C.text }}
          >
            Belum ada pesanan
          </p>
        </div>
      ) : (
        <div className='space-y-4'>
          {orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              isLoggedInUser={true}
              onOrderCompleted={handleOrderCompleted}
            />
          ))}
        </div>
      )}
    </PublicLayout>
  );
}
