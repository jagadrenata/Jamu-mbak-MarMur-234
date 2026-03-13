"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useDebounce } from "@/hooks/useDebounce";
import { adminOrders, adminGuestOrders } from "@/lib/api";
import {
  Search,
  Eye,
  MessageCircle,
  Mail,
  Phone,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Navigation,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  Box,
  RotateCcw
} from "lucide-react";

const MapContainer = dynamic(
  () => import("react-leaflet").then(m => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then(m => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), {
  ssr: false
});
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), {
  ssr: false
});
const Polyline = dynamic(() => import("react-leaflet").then(m => m.Polyline), {
  ssr: false
});

const STORE_COORDS = [-7.7956, 110.3695];

const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipping",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
  "expired"
];

const STATUS_META = {
  pending: {
    label: "Menunggu Bayar",
    cls: "bg-amber-50 text-amber-700 ring-amber-200"
  },
  paid: { label: "Dibayar", cls: "bg-sky-50 text-sky-700 ring-sky-200" },
  processing: {
    label: "Diproses",
    cls: "bg-violet-50 text-violet-700 ring-violet-200"
  },
  shipping: { label: "Dikirim", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  delivered: {
    label: "Terkirim",
    cls: "bg-teal-50 text-teal-700 ring-teal-200"
  },
  completed: {
    label: "Selesai",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200"
  },
  cancelled: {
    label: "Dibatalkan",
    cls: "bg-red-50 text-red-600 ring-red-200"
  },
  refunded: {
    label: "Dikembalikan",
    cls: "bg-orange-50 text-orange-700 ring-orange-200"
  },
  expired: {
    label: "Kedaluwarsa",
    cls: "bg-neutral-100 text-neutral-500 ring-neutral-200"
  }
};

const WA_TEMPLATE = {
  pending: (n, id) =>
    `Halo ${n}!\n\nPesanan Anda *#${id}* sedang menunggu pembayaran.\n\nSilakan selesaikan pembayaran agar pesanan segera kami proses.\n\nTerima kasih 🙏`,
  paid: (n, id) =>
    `Halo ${n}!\n\nPembayaran pesanan *#${id}* telah dikonfirmasi.\n\nPesanan Anda sedang kami siapkan. Kami akan segera mengabarkan info pengiriman.\n\nTerima kasih!️`,
  processing: (n, id) =>
    `Halo ${n}!\n\nPesanan *#${id}* Anda sedang dikemas.\n\nSebentar lagi siap dikirim!\n\nTerima kasih atas kesabarannya 🙏`,
  shipping: (n, id) =>
    `Halo ${n}! \n\nPesanan *#${id}* sudah dalam perjalanan!\n\nMohon pastikan ada yang di rumah untuk menerima paket.\n\nTerima kasih! // `,
  delivered: (n, id) =>
    `Halo ${n}! // \n\nPesanan *#${id}* sudah terkirim.\n\nMohon konfirmasi jika sudah diterima dengan baik.\n\nTerima kasih! 😊`,
  completed: (n, id) =>
    `Halo ${n}! 🎉\n\nTerima kasih! Pesanan *#${id}* telah selesai.\n\nJangan lupa berikan ulasan ya!\n\nSampai jumpa! ❤️`,
  cancelled: (n, id) =>
    `Halo ${n},\n\nPesanan *#${id}* telah dibatalkan.\n\nJika ada pertanyaan, jangan ragu hubungi kami.\n\nTerima kasih 🙏`,
  refunded: (n, id) =>
    `Halo ${n},\n\nPengembalian dana pesanan *#${id}* sedang diproses dalam 3-7 hari kerja.\n\nTerima kasih 🙏`,
  expired: (n, id) =>
    `Halo ${n},\n\nPesanan *#${id}* telah kedaluwarsa. Jika masih berminat, silakan buat pesanan baru.\n\nTerima kasih 🙏`
};

const EMAIL_SUBJECT = {
  pending: id => `[Pesanan #${id}] Menunggu Pembayaran`,
  paid: id => `[Pesanan #${id}] Pembayaran Dikonfirmasi`,
  processing: id => `[Pesanan #${id}] Sedang Diproses`,
  shipping: id => `[Pesanan #${id}] Pesanan Sudah Dikirim`,
  delivered: id => `[Pesanan #${id}] Pesanan Telah Tiba`,
  completed: id => `[Pesanan #${id}] Pesanan Selesai`,
  cancelled: id => `[Pesanan #${id}] Pesanan Dibatalkan`,
  refunded: id => `[Pesanan #${id}] Proses Pengembalian Dana`,
  expired: id => `[Pesanan #${id}] Pesanan Kedaluwarsa`
};

const PAYMENT_LABEL = {
  bank_transfer: "Transfer Bank",
  credit_card: "Kartu Kredit",
  gopay: "GoPay",
  shopeepay: "ShopeePay",
  qris: "QRIS",
  cod: "Bayar di Tempat"
};

function rp(n) {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

function fmtDate(d, withTime = false) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {})
  });
}

function toWaPhone(phone) {
  if (!phone) return null;
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("0")) p = "62" + p.slice(1);
  return p;
}

// Reusable: Status Badge
function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.expired;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1 ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

function Avatar({ src, name }) {
  const initials = (name || "?")
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  if (src)
    return (
      <img
        src={src}
        alt={name}
        className='w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-neutral-200'
      />
    );
  return (
    <div className='w-8 h-8 rounded-full bg-neutral-100 ring-1 ring-neutral-200 flex items-center justify-center flex-shrink-0 text-neutral-500 font-medium text-xs'>
      {initials}
    </div>
  );
}

function ProductThumb({ src, name }) {
  const [err, setErr] = useState(false);
  if (!src || err)
    return (
      <div className='w-9 h-9 rounded bg-neutral-100 flex items-center justify-center flex-shrink-0'>
        <Box className='w-3.5 h-3.5 text-neutral-400' />
      </div>
    );
  return (
    <img
      src={src}
      alt={name}
      onError={() => setErr(true)}
      className='w-9 h-9 rounded object-cover flex-shrink-0 ring-1 ring-neutral-200'
    />
  );
}

function Collapse({ title, children, defaultOpen = false, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className='border-b border-neutral-100 last:border-0'>
      <button
        onClick={() => setOpen(v => !v)}
        className='w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-neutral-50 transition-colors'
      >
        <span className='flex items-center gap-2'>
          <span className='text-sm font-medium text-neutral-700'>{title}</span>
          {badge != null && (
            <span className='text-xs text-neutral-400 font-normal'>
              {badge}
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className='px-5 pb-4'>{children}</div>}
    </div>
  );
}

function InfoPair({ label, value }) {
  return (
    <div className='flex items-start justify-between gap-4 py-1.5 text-sm'>
      <span className='text-neutral-500 flex-shrink-0'>{label}</span>
      <span className='text-neutral-800 text-right'>{value ?? "-"}</span>
    </div>
  );
}

function DeliveryMap({ address, coordinates }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    import("leaflet").then(L => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
      });
      setReady(true);
    });
  }, []);

  const coords = coordinates
    ? [
        coordinates.lat ?? coordinates.latitude,
        coordinates.lng ?? coordinates.longitude
      ]
    : null;
  const center = coords || STORE_COORDS;

  const addrStr =
    address && typeof address === "object"
      ? [
          address.street,
          address.village,
          address.district,
          address.city,
          address.province,
          address.postal_code
        ]
          .filter(Boolean)
          .join(", ")
      : typeof address === "string"
        ? address
        : "";

  const gMaps = addrStr
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addrStr)}`
    : coords
      ? `https://www.google.com/maps?q=${coords[0]},${coords[1]}`
      : null;

  if (!ready)
    return (
      <div className='h-48 rounded-lg bg-neutral-100 flex items-center justify-center'>
        <span className='text-xs text-neutral-400 animate-pulse'>
          Memuat peta…
        </span>
      </div>
    );

  return (
    <div className='space-y-2'>
      <div className='relative rounded-lg overflow-hidden ring-1 ring-neutral-200'>
        <MapContainer
          center={center}
          zoom={coords ? 15 : 13}
          className='h-48 w-full z-0'
          key={center.join(",")}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
          <Marker position={STORE_COORDS}>
            <Popup>
              <span className='text-xs'>Toko</span>
            </Popup>
          </Marker>
          {coords && (
            <>
              <Marker position={coords}>
                <Popup>
                  <span className='text-xs'>
                    {addrStr || "Tujuan pengiriman"}
                  </span>
                </Popup>
              </Marker>
              <Polyline
                positions={[STORE_COORDS, coords]}
                pathOptions={{
                  color: "#525252",
                  weight: 2,
                  dashArray: "6 4",
                  opacity: 0.5
                }}
              />
            </>
          )}
        </MapContainer>
      </div>
      {gMaps && (
        <a
          href={gMaps}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 transition-colors'
        >
          <Navigation className='w-3 h-3' /> Buka di Google Maps{" "}
          <ExternalLink className='w-3 h-3' />
        </a>
      )}
    </div>
  );
}

// Address block
function AddressBlock({
  address,
  notes,
  recipientName,
  recipientPhone,
  label
}) {
  if (!address) return <span className='text-sm text-neutral-400'>-</span>;
  const a = typeof address === "object" ? address : {};
  const displayNotes = notes || a.delivery_notes;
  return (
    <div className='space-y-1 text-sm text-neutral-700'>
      {(label || recipientName) && (
        <div className='flex flex-wrap items-center gap-2'>
          {label && (
            <span className='text-xs bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded ring-1 ring-neutral-200'>
              {label}
            </span>
          )}
          {recipientName && (
            <span className='font-medium text-neutral-800'>
              {recipientName}
            </span>
          )}
          {recipientPhone && (
            <span className='text-neutral-500'>{recipientPhone}</span>
          )}
        </div>
      )}
      {a.street && <div>{a.street}</div>}
      <div className='text-neutral-500'>
        {[a.village, a.district, a.city, a.province].filter(Boolean).join(", ")}
        {a.postal_code && ` ${a.postal_code}`}
      </div>
      {displayNotes && (
        <div className='mt-2 text-xs text-neutral-600 bg-neutral-50 ring-1 ring-neutral-200 px-3 py-2 rounded-lg'>
          <span className='font-medium'>Catatan: </span>
          {displayNotes}
        </div>
      )}
    </div>
  );
}

// Order Detail Drawer
function OrderDetailDrawer({ order, isGuest, onClose, onUpdated }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  const name = isGuest ? order.customer_name : order.customer?.name;
  const email = isGuest ? order.customer_email : order.customer?.email;
  const phone = isGuest ? order.customer_phone : order.customer?.phone;
  const avatar = isGuest ? null : order.customer?.avatar_url;
  const address = order.shipping_address;
  const coordinates = isGuest
    ? (order.shipping_address?.coordinates ?? null)
    : order.coordinates;
  const recipientName = isGuest ? order.customer_name : order.recipient_name;
  const recipientPhone = isGuest ? order.customer_phone : order.recipient_phone;
  const addressLabel = isGuest ? null : order.address_label;
  const deliveryNotes = isGuest
    ? order.shipping_address?.delivery_notes
    : order.delivery_notes;
  const totalItems = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
  const waPhone = toWaPhone(phone);
  const waMsg = WA_TEMPLATE[order.status]?.(name, order.id) ?? "";
  const emailSubject = EMAIL_SUBJECT[order.status]?.(order.id) ?? "";

  async function handleUpdate() {
    if (newStatus === order.status) return;
    setSaving(true);
    try {
      const fn = isGuest ? adminGuestOrders.update : adminOrders.update;
      await fn(order.id, { status: newStatus });
      onUpdated();
    } catch {}
    setSaving(false);
  }

  return (
    <div
      className='fixed inset-0 z-50 flex'
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className='absolute inset-0 bg-black/30' onClick={onClose} />
      <div className='relative ml-auto w-full max-w-xl h-full bg-white shadow-2xl flex flex-col overflow-hidden'>
        {/* Header */}
        <div className='flex-none px-5 py-4 border-b border-neutral-100 flex items-center justify-between'>
          <div>
            <p className='text-xs text-neutral-400 mb-0.5'>Detail Pesanan</p>
            <p className='font-mono font-semibold text-neutral-800 text-sm tracking-wide'>
              #{order.id}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <StatusBadge status={order.status} />
            <button
              onClick={onClose}
              className='w-7 h-7 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors'
            >
              <XCircle className='w-4 h-4' />
            </button>
          </div>
        </div>

        {/* Body — accordion sections */}
        <div className='flex-1 overflow-y-auto divide-y divide-neutral-100'>
          {/* Pelanggan */}
          <Collapse title='Pelanggan' defaultOpen={true}>
            <div className='flex items-center gap-3 mb-3'>
              <Avatar src={avatar} name={name} />
              <div>
                <p className='text-sm font-medium text-neutral-800'>
                  {name || "-"}
                </p>
                <p className='text-xs text-neutral-400'>
                  {isGuest ? "Guest" : `UID: ${order.customer?.id ?? "-"}`}
                </p>
              </div>
            </div>
            <div className='divide-y divide-neutral-50'>
              <InfoPair label='Email' value={email || "-"} />
              <InfoPair label='Telepon' value={phone || "-"} />
            </div>
            {/* Contact actions — compact, monochrome */}
            <div className='flex gap-2 mt-3 pt-3 border-t border-neutral-100'>
              {waPhone && (
                <a
                  href={`https://wa.me/${waPhone}?text=${encodeURIComponent(waMsg)}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-800 text-white hover:bg-neutral-700 transition-colors'
                >
                  <MessageCircle className='w-3 h-3' /> WhatsApp
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(waMsg)}`}
                  className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors'
                >
                  <Mail className='w-3 h-3' /> Email
                </a>
              )}
              {waPhone && (
                <a
                  href={`tel:+${waPhone}`}
                  className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors'
                >
                  <Phone className='w-3 h-3' /> Telepon
                </a>
              )}
            </div>
          </Collapse>

          {/* Pembayaran */}
          <Collapse title='Pembayaran' defaultOpen={true}>
            <div className='divide-y divide-neutral-50'>
              <InfoPair
                label={`Subtotal (${totalItems} item)`}
                value={rp(order.total_price)}
              />
              {order.shipping_price > 0 && (
                <InfoPair
                  label={`Ongkir${order.shipping_method ? ` · ${order.shipping_method.name}` : ""}`}
                  value={rp(order.shipping_price)}
                />
              )}
              {order.tax_amount > 0 && (
                <InfoPair label='Pajak' value={rp(order.tax_amount)} />
              )}
              {order.discount_amount > 0 && (
                <InfoPair
                  label={`Diskon${order.promo_code ? ` · ${order.promo_code.code}` : ""}`}
                  value={`-${rp(order.discount_amount)}`}
                />
              )}
            </div>
            <div className='flex justify-between items-center pt-3 mt-1 border-t border-neutral-200'>
              <span className='text-sm font-semibold text-neutral-800'>
                Total
              </span>
              <span className='text-base font-bold text-neutral-900'>
                {rp(order.final_price)}
              </span>
            </div>
            <div className='mt-2'>
              <InfoPair
                label='Metode Bayar'
                value={
                  PAYMENT_LABEL[order.payment_method] ||
                  order.payment_method ||
                  "-"
                }
              />
            </div>
            {(order.midtrans_payment_url || order.midtrans_url) && (
              <div className='mt-3 pt-3 border-t border-neutral-100'>
                <a
                  href={order.midtrans_payment_url || order.midtrans_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 underline underline-offset-2 transition-colors break-all'
                >
                  Link pembayaran{" "}
                  <ExternalLink className='w-3 h-3 flex-shrink-0' />
                </a>
              </div>
            )}
          </Collapse>

          {/* Items */}
          {order.items?.length > 0 && (
            <Collapse
              title='Item Pesanan'
              badge={`${order.items.length} produk`}
            >
              <div className='space-y-3'>
                {order.items.map((item, idx) => (
                  <div key={item.id || idx} className='flex items-center gap-3'>
                    <ProductThumb
                      src={item.product?.image}
                      name={item.product?.name}
                    />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-neutral-800 truncate'>
                        {item.product?.name ?? `Produk #${item.variant_id}`}
                      </p>
                      {item.variant && (
                        <p className='text-xs text-neutral-400 mt-0.5 truncate'>
                          {[item.variant.sku, item.variant.name]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className='text-right flex-shrink-0'>
                      <p className='text-sm font-semibold text-neutral-800'>
                        {rp(item.subtotal)}
                      </p>
                      <p className='text-xs text-neutral-400'>
                        {item.quantity}×
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Collapse>
          )}

          {/* Alamat + Peta */}
          {address && (
            <Collapse title='Alamat Pengiriman'>
              <AddressBlock
                address={address}
                notes={deliveryNotes}
                recipientName={recipientName}
                recipientPhone={recipientPhone}
                label={addressLabel}
              />
              <div className='mt-4'>
                <DeliveryMap address={address} coordinates={coordinates} />
              </div>
            </Collapse>
          )}

          {/* Timeline */}
          <Collapse title='Timeline'>
            <div className='divide-y divide-neutral-50'>
              <InfoPair
                label='Dibuat'
                value={fmtDate(order.created_at, true)}
              />
              {order.paid_at && (
                <InfoPair
                  label='Dibayar'
                  value={fmtDate(order.paid_at, true)}
                />
              )}
              {order.updated_at && (
                <InfoPair
                  label='Diperbarui'
                  value={fmtDate(order.updated_at, true)}
                />
              )}
              {order.delivered_at && (
                <InfoPair
                  label='Terkirim'
                  value={fmtDate(order.delivered_at, true)}
                />
              )}
              {order.completed_at && (
                <InfoPair
                  label='Selesai'
                  value={fmtDate(order.completed_at, true)}
                />
              )}
            </div>
          </Collapse>

          {/* Update Status */}
          <Collapse title='Update Status'>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              className='w-full border border-neutral-200 bg-white rounded-lg px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300'
            >
              {ORDER_STATUSES.map(s => (
                <option key={s} value={s}>
                  {STATUS_META[s]?.label ?? s}
                </option>
              ))}
            </select>
            {newStatus !== order.status && (
              <p className='mt-2 text-xs text-neutral-500'>
                <ArrowUpDown className='inline w-3 h-3 mr-1' />
                <strong>{STATUS_META[order.status]?.label}</strong> →{" "}
                <strong>{STATUS_META[newStatus]?.label}</strong>
              </p>
            )}
          </Collapse>
        </div>

        {/* Footer */}
        <div className='flex-none border-t border-neutral-100 bg-white px-5 py-3.5 flex items-center justify-between gap-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors'
          >
            Tutup
          </button>
          <button
            onClick={handleUpdate}
            disabled={saving || newStatus === order.status}
            className='px-5 py-2 text-sm font-semibold bg-neutral-900 hover:bg-neutral-700 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
          >
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Order Row
function OrderRow({ order, isGuest, onClick }) {
  const name = isGuest ? order.customer_name : order.customer?.name;
  const email = isGuest ? order.customer_email : order.customer?.email;
  const avatar = isGuest ? null : order.customer?.avatar_url;
  const firstItem = order.items?.[0];
  const moreItems = (order.items?.length ?? 0) - 1;

  return (
    <tr
      className='border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer group'
      onClick={onClick}
    >
      <td className='px-4 py-3'>
        <span className='font-mono text-xs text-neutral-500'>#{order.id}</span>
      </td>
      <td className='px-4 py-3'>
        <div className='flex items-center gap-2.5'>
          <Avatar src={avatar} name={name} />
          <div className='min-w-0'>
            <p className='text-sm font-medium text-neutral-800 truncate max-w-36'>
              {name || "-"}
            </p>
            <p className='text-xs text-neutral-400 truncate max-w-36'>
              {email || "-"}
            </p>
          </div>
        </div>
      </td>
      <td className='px-4 py-3'>
        {firstItem ? (
          <div className='flex items-center gap-2'>
            <ProductThumb
              src={firstItem.product?.image}
              name={firstItem.product?.name}
            />
            <div className='min-w-0'>
              <p className='text-xs text-neutral-700 truncate max-w-32'>
                {firstItem.product?.name ?? `Variant #${firstItem.variant_id}`}
              </p>
              {moreItems > 0 && (
                <p className='text-xs text-neutral-400'>+{moreItems} lainnya</p>
              )}
            </div>
          </div>
        ) : (
          <span className='text-xs text-neutral-400'>-</span>
        )}
      </td>
      <td className='px-4 py-3 text-right'>
        <p className='text-sm font-semibold text-neutral-800'>
          {rp(order.final_price)}
        </p>
        {order.items_count > 0 && (
          <p className='text-xs text-neutral-400'>{order.items_count} item</p>
        )}
      </td>
      <td className='px-4 py-3'>
        <StatusBadge status={order.status} />
      </td>
      <td className='px-4 py-3 text-xs text-neutral-400'>
        {fmtDate(order.created_at)}
      </td>
      <td className='px-4 py-3'>
        <button
          onClick={e => {
            e.stopPropagation();
            onClick();
          }}
          className='opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all'
          title='Lihat Detail'
        >
          <Eye className='w-3.5 h-3.5' />
        </button>
      </td>
    </tr>
  );
}

// Stat Card
function StatCard({ label, value, note }) {
  return (
    <div className='bg-white border border-neutral-100 rounded-xl px-4 py-3.5'>
      <p className='text-xs text-neutral-400 mb-1'>{label}</p>
      <p className='text-xl font-bold text-neutral-900 leading-none'>{value}</p>
      {note && <p className='text-xs text-neutral-400 mt-1'>{note}</p>}
    </div>
  );
}

// Main Page
export default function AdminOrdersPage() {
  const [tab, setTab] = useState("member");
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reload, setReload] = useState(0);
  const limit = 15;
  const debouncedSearch = useDebounce(search, 400);

  const stats = {
    pending: data.filter(o => o.status === "pending").length,
    shipping: data.filter(o => o.status === "shipping").length,
    revenue: data.reduce((s, o) => s + (o.final_price || 0), 0)
  };

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { limit, offset };
    if (debouncedSearch) params.search = debouncedSearch;
    if (status) params.status = status;
    const fn = tab === "member" ? adminOrders.list : adminGuestOrders.list;
    fn(params)
      .then(res => {
        setData(res.data || []);
        setTotal(res.total || 0);
      })
      .catch(() => {
        setData([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [tab, search, status, offset, reload]);
  1;

  useEffect(() => {
    async function run() {
      setLoading(true);

      const params = { limit, offset };

      if (debouncedSearch) params.search = debouncedSearch;
      if (status) params.status = status;

      const fn = tab === "member" ? adminOrders.list : adminGuestOrders.list;

      try {
        const res = await fn(params);
        setData(res.data || []);
        setTotal(res.total || 0);
      } catch {
        setData([]);
        setTotal(0);
      }

      setLoading(false);
    }

    run();
  }, [tab, debouncedSearch, status, offset, reload]);

  const totalPages = Math.ceil(total / limit);
  const page = Math.floor(offset / limit) + 1;

  function handleTabChange(t) {
    setTab(t);
    setOffset(0);
  }

  function handleSearch(v) {
    setSearch(v);
    setOffset(0);
  }

  function handleStatus(v) {
    setStatus(v);
    setOffset(0);
  }

  return (
    <div className='min-h-screen bg-neutral-50'>
      <div className='max-w-screen-xl mx-auto px-6 py-8 space-y-5'>
        {/* Page header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-xl font-semibold text-neutral-900'>Pesanan</h1>
            <p className='text-sm text-neutral-400 mt-0.5'>
              Kelola semua pesanan masuk
            </p>
          </div>
          <button
            onClick={() => setReload(n => n + 1)}
            className='inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors'
          >
            <RefreshCw className='w-3.5 h-3.5' /> Refresh
          </button>
        </div>

        {/* Stats row */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
          <StatCard
            label='Total Pesanan'
            value={total}
            note={`halaman ${page}`}
          />
          <StatCard label='Menunggu Bayar' value={stats.pending} />
          <StatCard label='Sedang Dikirim' value={stats.shipping} />
          <StatCard
            label='Revenue (halaman ini)'
            value={rp(stats.revenue)}
            note={`${data.length} order`}
          />
        </div>

        {/* Table card */}
        <div className='bg-white border border-neutral-100 rounded-xl overflow-hidden'>
          {/* Tabs + search in one row */}
          <div className='flex items-center justify-between border-b border-neutral-100 px-4 gap-3 flex-wrap'>
            <div className='flex'>
              {[
                { key: "member", label: "Member" },
                { key: "guest", label: "Guest" }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`px-4 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    tab === key
                      ? "border-neutral-800 text-neutral-900"
                      : "border-transparent text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className='flex items-center gap-2 py-2'>
              {/* Search */}
              <div className='relative'>
                <Search className='w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400' />
                <input
                  className='pl-8 pr-3 py-1.5 border border-neutral-200 bg-neutral-50 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 w-52'
                  placeholder='Cari pesanan…'
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                />
              </div>
              {/* Status filter */}
              <select
                value={status}
                onChange={e => handleStatus(e.target.value)}
                className='px-3 py-1.5 border border-neutral-200 bg-neutral-50 rounded-lg text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-200'
              >
                <option value=''>Semua Status</option>
                {ORDER_STATUSES.map(s => (
                  <option key={s} value={s}>
                    {STATUS_META[s]?.label ?? s}
                  </option>
                ))}
              </select>
              {(search || status) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatus("");
                  }}
                  className='p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors'
                  title='Reset filter'
                >
                  <RotateCcw className='w-3.5 h-3.5' />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className='overflow-x-auto'>
            {loading ? (
              <div className='flex flex-col items-center justify-center py-20 gap-3'>
                <div className='w-6 h-6 border-2 border-neutral-200 border-t-neutral-600 rounded-full animate-spin' />
                <span className='text-sm text-neutral-400'>Memuat…</span>
              </div>
            ) : data.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-20 gap-2'>
                <p className='text-sm text-neutral-400'>
                  Tidak ada pesanan ditemukan
                </p>
                {(search || status) && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setStatus("");
                    }}
                    className='text-xs text-neutral-600 underline'
                  >
                    Reset filter
                  </button>
                )}
              </div>
            ) : (
              <table className='w-full'>
                <thead className='bg-neutral-50 border-b border-neutral-100'>
                  <tr>
                    {[
                      "ID",
                      "Pelanggan",
                      "Produk",
                      "Total",
                      "Status",
                      "Tanggal",
                      ""
                    ].map(h => (
                      <th
                        key={h}
                        className='text-left px-4 py-2.5 text-xs font-medium text-neutral-400 uppercase tracking-wider whitespace-nowrap'
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map(order => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      isGuest={tab === "guest"}
                      onClick={() => setSelected(order)}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className='flex items-center justify-between px-4 py-3 border-t border-neutral-100'>
              <span className='text-xs text-neutral-400'>
                {offset + 1}–{Math.min(offset + limit, total)} dari {total}
              </span>
              <div className='flex items-center gap-1'>
                <button
                  disabled={offset === 0}
                  onClick={() => setOffset(o => Math.max(0, o - limit))}
                  className='px-3 py-1.5 text-xs border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                >
                  ←
                </button>
                <span className='px-2 text-xs text-neutral-500'>
                  {page} / {totalPages}
                </span>
                <button
                  disabled={offset + limit >= total}
                  onClick={() => setOffset(o => o + limit)}
                  className='px-3 py-1.5 text-xs border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <OrderDetailDrawer
          order={selected}
          isGuest={tab === "guest"}
          onClose={() => setSelected(null)}
          onUpdated={() => {
            setSelected(null);
            setReload(n => n + 1);
          }}
        />
      )}
    </div>
  );
}
