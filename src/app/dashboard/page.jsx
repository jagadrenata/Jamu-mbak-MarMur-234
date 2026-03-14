"use client";

import { useState, useEffect } from "react";
import { orders } from "@/lib/api";
import {
  PageHeader,
  Card,
  Select,
  LoadingSpinner,
  Pagination,
  statusBadge
} from "@/components/ui";
import {
  MessageCircle,
  CheckCircle,
  Star,
  Package,
  Calendar,
  MapPin,
  ChevronDown,
  CreditCard,
  AlertCircle,
  Clock
} from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

const formatRupiah = amount =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(amount || 0);

const formatDate = dateStr => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const formatDateTime = dateStr => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const STATUS_CONFIG = {
  pending: {
    label: "Menunggu Pembayaran",
    color: "bg-amber-100 text-amber-700 border border-amber-200"
  },
  paid: {
    label: "Dibayar",
    color: "bg-blue-100 text-blue-700 border border-blue-200"
  },
  processing: {
    label: "Diproses",
    color: "bg-indigo-100 text-indigo-700 border border-indigo-200"
  },
  shipping: {
    label: "Dikirim",
    color: "bg-cyan-100 text-cyan-700 border border-cyan-200"
  },
  completed: {
    label: "Selesai",
    color: "bg-beige-100 text-beige-700 border border-beige-200"
  },
  cancelled: {
    label: "Dibatalkan",
    color: "bg-red-100 text-red-700 border border-red-200"
  },
  expired: {
    label: "Kedaluwarsa",
    color: "bg-gray-100 text-gray-500 border border-gray-200"
  }
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status,
    color: "bg-gray-100 text-gray-500"
  };
  return (
    <span
      className={`inline-flex rounded-full items-center gap-1.5 px-2.5 py-1 text-xs font-semibold ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
}

function ProductImage({ images, name }) {
  const primary = images?.find(i => i.is_primary)?.url || images?.[0]?.url;
  if (!primary || primary.includes("example.com")) {
    return (
      <div className="w-10 h-10 bg-beige-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
        <Package className="w-4 h-4 text-gray-400" />
      </div>
    );
  }
  return (
    <img
      src={primary}
      alt={name}
      className="w-10 h-10 object-cover flex-shrink-0 border border-gray-200"
      onError={e => {
        e.target.replaceWith(
          Object.assign(document.createElement("div"), {
            className:
              "w-10 h-10 bg-beige-100 border border-gray-200 flex items-center justify-center flex-shrink-0"
          })
        );
      }}
    />
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const addr = order.address?.address;
  const totalQty = order.items?.reduce((s, i) => s + i.quantity, 0) || 0;

  const firstItemSlug =
    order.items?.[0]?.product_variants?.products?.slug ?? null;

  return (
    <div className="border border-gray-200 overflow-hidden bg-white hover:shadow-sm transition-shadow duration-150">
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-gray-800 bg-beige-100 px-2 py-0.5 tracking-wide border border-gray-200">
                {order.id}
              </span>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{formatDateTime(order.created_at)}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-base font-bold text-gray-900">
              {formatRupiah(order.final_price)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {totalQty} produk · {order.items?.length || 0} jenis
            </p>
          </div>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {order.items?.slice(0, 3).map(item => (
            <div
              key={item.id}
              className="flex items-center gap-2 bg-beige-50 border border-gray-200 px-3 py-2 flex-shrink-0"
            >
              <ProductImage
                images={item.product_variants?.products?.product_images}
                name={item.product_variants?.products?.name}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate max-w-[120px]">
                  {item.product_variants?.products?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {item.product_variants?.name}
                </p>
                <p className="text-xs text-cream-900 font-semibold mt-0.5">
                  {formatRupiah(item.price)} × {item.quantity}
                </p>
              </div>
            </div>
          ))}
          {(order.items?.length || 0) > 3 && (
            <div className="flex items-center justify-center bg-beige-100 border border-gray-200 px-4 py-2 flex-shrink-0">
              <span className="text-xs text-gray-500 font-medium">
                +{order.items.length - 3} lagi
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
          {addr ? (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate max-w-[220px]">
                {order.address.name} · {addr.district}, {addr.city}
              </span>
            </div>
          ) : (
            <span />
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-700 font-medium transition-colors"
          >
            {expanded ? "Sembunyikan" : "Detail"}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-150 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-beige-50 px-5 py-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Rincian Produk
            </p>
            <div className="space-y-2">
              {order.items?.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ProductImage
                      images={item.product_variants?.products?.product_images}
                      name={item.product_variants?.products?.name}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {item.product_variants?.products?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.product_variants?.name} · {item.quantity} pcs
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-800">
                      {formatRupiah(item.price * item.quantity)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatRupiah(item.price)} / pcs
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Alamat Pengiriman
              </p>
              {addr ? (
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p className="font-medium text-gray-800">
                    {order.address.name}
                  </p>
                  <p>
                    {addr.street}, {addr.village}
                  </p>
                  <p>
                    {addr.district}, {addr.city}
                  </p>
                  <p>
                    {addr.province} {addr.postal_code}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Belum diisi</p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Ringkasan Biaya
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatRupiah(order.total_price)}</span>
                </div>
                {order.shipping_price > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Pengiriman</span>
                    <span>{formatRupiah(order.shipping_price)}</span>
                  </div>
                )}
                {order.tax_amount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Pajak</span>
                    <span>{formatRupiah(order.tax_amount)}</span>
                  </div>
                )}
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-beige-600">
                    <span>Diskon</span>
                    <span>-{formatRupiah(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatRupiah(order.final_price)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Riwayat Waktu
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span className="text-gray-400">Dibuat</span>
                <span>{formatDate(order.created_at)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="text-gray-400">Dibayar</span>
                <span>
                  {order.paid_at ? (
                    formatDate(order.paid_at)
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="text-gray-400">Dikirim</span>
                <span>
                  {order.delivered_at ? (
                    formatDate(order.delivered_at)
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="text-gray-400">Selesai</span>
                <span>
                  {order.completed_at ? (
                    formatDate(order.completed_at)
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {order.status === "pending" && order.midtrans_url && (
            <a
              href={order.midtrans_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Bayar Sekarang
            </a>
          )}
          <a
            href={siteConfig.whatsappOrderMessage(order.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full text-center py-2.5 text-sm font-medium transition-colors"
            style={{
              border: `1px solid #25D366`,
              color: "#25D366",
              backgroundColor: "transparent"
            }}
          >
            <MessageCircle className="w-4 h-4" />
            Hubungi Penjual
          </a>

          {order.status === "delivered" && (
            <button
              onClick={handleCompleteOrder}
              disabled={completing}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium transition-opacity disabled:opacity-60"
              style={{ backgroundColor: "#155724", color: "#fff" }}
            >
              <CheckCircle className="w-4 h-4" />
              {completing ? "Memproses..." : "Selesaikan Pesanan"}
            </button>
          )}

          {order.status === "completed" && firstItemSlug && (
            <Link
              href={`/products/${firstItemSlug}/rating`}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium transition-colors"
              style={{
                border: `1px solid ${C.accent}`,
                color: C.accent,
                backgroundColor: "transparent"
              }}
            >
              <Star className="w-4 h-4" />
              Beri Rating Produk
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const limit = 10;

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = { limit, offset };
    if (status) params.status = status;
    orders
      .list(params)
      .then(res => {
        if (active) {
          setData(res.data || []);
          setTotal(res.total || 0);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status, offset]);

  const pendingCount = data.filter(o => o.status === "pending").length;

  return (
    <div>
      <PageHeader title="Pesanan Saya" subtitle="Daftar semua pesanan Anda" />

      {pendingCount > 0 && (
        <div className="mb-4 flex items-center gap-2.5 bg-cream-50 border border-cream-200 px-4 py-3 text-sm text-amber-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            Anda memiliki <strong>{pendingCount} pesanan</strong> yang menunggu
            pembayaran.
          </span>
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <p className="text-sm text-gray-500">
            Menampilkan{" "}
            <span className="font-semibold text-gray-700">{data.length}</span>{" "}
            dari <span className="font-semibold text-gray-700">{total}</span>{" "}
            pesanan
          </p>
          <Select
            value={status}
            onChange={e => {
              setStatus(e.target.value);
              setOffset(0);
            }}
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu Pembayaran</option>
            <option value="paid">Dibayar</option>
            <option value="processing">Diproses</option>
            <option value="shipping">Dikirim</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
            <option value="expired">Kedaluwarsa</option>
          </Select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <Package className="w-10 h-10 text-gray-300" />
            <div>
              <p className="text-gray-600 font-medium text-sm">
                Belum ada pesanan
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                Pesanan Anda akan muncul di sini
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        {total > limit && (
          <div className="mt-5">
            <Pagination
              limit={limit}
              offset={offset}
              total={total}
              onChange={setOffset}
            />
          </div>
        )}
      </Card>
    </div>
  );
}