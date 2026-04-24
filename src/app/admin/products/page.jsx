"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { products, categories } from "@/lib/api";
import {
  PageHeader,
  Card,
  Table,
  Tr,
  Td,
  Button,
  Modal,
  Input,
  Select,
  Textarea,
  LoadingSpinner,
  Pagination,
  statusBadge
} from "@/components/ui";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ImageIcon,
  Eye,
  Archive,
  ArchiveRestore,
  AlertTriangle,
  PackageX
} from "lucide-react";

const emptyForm = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  category_id: "",
  status: "active"
};

// Tab definitions
const TABS = [
  { key: "active", label: "Produk Aktif" },
  { key: "archived", label: "Arsip" }
];

export default function ProductsPage() {
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState("active");

  // Data state
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [cats, setCats] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const limit = 15;

  // Modal state
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Confirm modal state (for hard delete)
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const refresh = useCallback(() => setReload(n => n + 1), []);

  // Reset offset when tab/search/status changes
  useEffect(() => {
    setOffset(0);
  }, [activeTab, search, status]);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setLoading(true);

      const params = { limit, offset };
      if (search) params.search = search;

      // When on archived tab, always filter by archived
      // When on active tab, use the status filter (defaults to non-archived)
      if (activeTab === "archived") {
        params.status = "archived";
      } else {
        if (status) params.status = status;
        else params.exclude_status = "archived"; // only active + draft
      }

      try {
        const [res, catsRes] = await Promise.all([
          products.list(params),
          cats.length ? Promise.resolve({ data: cats }) : categories.list()
        ]);

        if (!active) return;

        setData(res.data || []);
        setTotal(res.total || 0);
        if (!cats.length) setCats(catsRes.data || []);
      } catch (e) {
        console.error("Fetch products error:", e);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, [search, status, offset, reload, activeTab]);

  // --- Handlers ---

  function openCreate() {
    setEditItem(null);
    setForm(emptyForm);
    setModal(true);
  }

  function openEdit(e, item) {
    e.stopPropagation();
    setEditItem(item);
    setForm({
      name: item.name || "",
      slug: item.slug || "",
      sku: item.sku || "",
      description: item.description || "",
      category_id: item.category_id || "",
      status: item.status || "active"
    });
    setModal(true);
  }

  async function save() {
    setSaving(true);
    try {
      if (editItem) {
        await products.update(editItem.id, form);
        setModal(false);
        refresh();
      } else {
        const res = await products.create(form);
        setModal(false);
        router.push(`/admin/products/${res.data.id}`);
        return;
      }
    } catch (e) {
      console.error("Save product error:", e);
    }
    setSaving(false);
  }

  // Soft delete → archive
  async function archive(e, id) {
    e.stopPropagation();
    if (!confirm("Arsipkan produk ini? Produk tidak akan tampil di toko."))
      return;
    try {
      await products.delete(id); // API already does soft-delete (status: archived)
      refresh();
    } catch (e) {
      console.error("Archive error:", e);
    }
  }

  // Restore from archive
  async function restore(e, id) {
    e.stopPropagation();
    try {
      await products.restore(id);
      refresh();
    } catch (e) {
      console.error("Restore error:", e);
    }
  }

  // Open hard-delete confirmation
  function openHardDelete(e, item) {
    e.stopPropagation();
    setConfirmTarget(item);
    setConfirmModal(true);
  }

  // Confirm permanent delete
  async function hardDelete() {
    if (!confirmTarget) return;
    setConfirming(true);
    try {
      await products.hardDelete(confirmTarget.id);
      setConfirmModal(false);
      setConfirmTarget(null);
      refresh();
    } catch (e) {
      console.error("Hard delete error:", e);
    }
    setConfirming(false);
  }

  function setField(f, v) {
    setForm(prev => ({ ...prev, [f]: v }));
  }

  // --- Render ---

  return (
    <div>
      <PageHeader
        title="Produk"
        subtitle="Kelola semua produk toko"
        action={
          activeTab === "active" && (
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 inline mr-1" />
              Tambah Produk
            </Button>
          )
        }
      />

      <Card>
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 -mt-2">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSearch("");
                setStatus("");
                setOffset(0);
              }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.key
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.key === "archived" &&
                total > 0 &&
                activeTab === "archived" && (
                  <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs">
                    {total}
                  </span>
                )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder={
                activeTab === "archived"
                  ? "Cari produk diarsipkan..."
                  : "Cari produk..."
              }
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setOffset(0);
              }}
            />
          </div>

          {/* Status filter only for active tab */}
          {activeTab === "active" && (
            <Select
              value={status}
              onChange={e => {
                setStatus(e.target.value);
                setOffset(0);
              }}
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="draft">Draft</option>
            </Select>
          )}
        </div>

        {/* Archived banner */}
        {activeTab === "archived" && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
            <Archive className="w-4 h-4 shrink-0" />
            <span>
              Produk di arsip tidak tampil di toko. Kamu bisa memulihkan atau
              menghapus permanen.
            </span>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {activeTab === "active" ? (
              <ActiveTable
                data={data}
                router={router}
                openEdit={openEdit}
                archive={archive}
              />
            ) : (
              <ArchivedTable
                data={data}
                router={router}
                restore={restore}
                openHardDelete={openHardDelete}
              />
            )}

            {total > limit && (
              <Pagination
                limit={limit}
                offset={offset}
                total={total}
                onChange={setOffset}
              />
            )}
          </>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editItem ? "Edit Produk" : "Tambah Produk"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>
              Batal
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving
                ? "Menyimpan..."
                : editItem
                  ? "Simpan"
                  : "Buat & Buka Detail"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nama Produk *"
            value={form.name}
            onChange={e => {
              setField("name", e.target.value);
              setOffset(0);
            }}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Slug"
              value={form.slug}
              onChange={e => {
                setField("slug", e.target.value);
                setOffset(0);
              }}
            />
            <Input
              label="SKU"
              value={form.sku}
              onChange={e => {
                setField("sku", e.target.value);
                setOffset(0);
              }}
            />
          </div>
          <Select
            label="Kategori"
            value={form.category_id}
            onChange={e => {
              setField("category_id", e.target.value);
              setOffset(0);
            }}
          >
            <option value="">Pilih Kategori</option>
            {cats.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Textarea
            label="Deskripsi"
            value={form.description}
            onChange={e => {
              setField("description", e.target.value);
              setOffset(0);
            }}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={e => {
              setField("status", e.target.value);
              setOffset(0);
            }}
          >
            <option value="active">Aktif</option>
            <option value="draft">Draft</option>
          </Select>
          {!editItem && (
            <p className="text-xs text-cream-700 bg-cream-50 rounded p-2 border border-cream-100">
              Setelah membuat produk, kamu akan diarahkan ke halaman detail
              untuk menambahkan gambar dan variant.
            </p>
          )}
        </div>
      </Modal>

      {/* Hard Delete Confirmation Modal */}
      <Modal
        open={confirmModal}
        onClose={() => {
          if (!confirming) {
            setConfirmModal(false);
            setConfirmTarget(null);
          }
        }}
        title="Hapus Permanen"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setConfirmModal(false);
                setConfirmTarget(null);
              }}
              disabled={confirming}
            >
              Batal
            </Button>
            <Button variant="danger" onClick={hardDelete} disabled={confirming}>
              {confirming ? "Menghapus..." : "Ya, Hapus Permanen"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">
                Tindakan ini tidak bisa dibatalkan.
              </p>
              <p>
                Semua data termasuk variant, gambar, dan riwayat pesanan terkait
                produk <strong>{confirmTarget?.name}</strong> akan dihapus
                permanen dari database.
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Ketik nama produk untuk konfirmasi jika diperlukan, atau langsung
            klik hapus permanen.
          </p>
        </div>
      </Modal>
    </div>
  );
}

// --- Sub-components ---

function ProductThumbnail({ p }) {
  return (
    <div className="flex items-center gap-3">
      {p.primary_image ? (
        <img
          src={p.primary_image}
          alt={p.name}
          className="w-10 h-10 object-cover rounded border border-gray-100"
        />
      ) : (
        <div className="w-10 h-10 bg-gray-100 rounded border border-gray-100 flex items-center justify-center">
          <ImageIcon className="w-4 h-4 text-gray-300" />
        </div>
      )}
      <div>
        <div className="font-medium text-gray-900">{p.name}</div>
        <div className="text-xs text-gray-400">{p.slug || "—"}</div>
      </div>
    </div>
  );
}

function ActiveTable({ data, router, openEdit, archive }) {
  return (
    <Table
      headers={[
        "Produk",
        "SKU",
        "Kategori",
        "Harga",
        "Variant",
        "Status",
        "Views",
        ""
      ]}
    >
      {data.map(p => (
        <Tr
          key={p.id}
          className="cursor-pointer hover:bg-cream-50 transition-colors"
          onClick={() => router.push(`/admin/products/${p.id}`)}
        >
          <Td>
            <ProductThumbnail p={p} />
          </Td>
          <Td>
            <span className="font-mono text-xs text-gray-500">
              {p.sku || "—"}
            </span>
          </Td>
          <Td>
            <span className="text-sm text-gray-600">
              {p.category_name || "—"}
            </span>
          </Td>
          <Td>
            <span className="text-sm">
              {p.min_price != null
                ? `Rp ${p.min_price.toLocaleString("id-ID")}`
                : "—"}
              {p.max_price != null && p.max_price !== p.min_price
                ? ` – Rp ${p.max_price.toLocaleString("id-ID")}`
                : ""}
            </span>
          </Td>
          <Td>
            <span className="text-sm text-gray-500">
              {p.variant_count || 0} variant
            </span>
          </Td>
          <Td>{statusBadge(p.status)}</Td>
          <Td>
            <span className="text-sm text-gray-500">{p.views_count || 0}</span>
          </Td>
          <Td>
            <div className="flex gap-1">
              <button
                onClick={() => router.push(`/admin/products/${p.id}`)}
                className="p-1.5 text-gray-400 hover:text-cream-600 hover:bg-cream-50 rounded transition-colors"
                title="Lihat detail"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={e => openEdit(e, p)}
                className="p-1.5 text-gray-400 hover:text-cream-700 hover:bg-cream-50 rounded transition-colors"
                title="Edit cepat"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={e => archive(e, p.id)}
                className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                title="Arsipkan produk"
              >
                <Archive className="w-4 h-4" />
              </button>
            </div>
          </Td>
        </Tr>
      ))}
      {data.length === 0 && (
        <Tr>
          <Td colSpan={8}>
            <div className="text-center py-10 text-gray-400">
              <PackageX className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Tidak ada produk ditemukan
            </div>
          </Td>
        </Tr>
      )}
    </Table>
  );
}

function ArchivedTable({ data, router, restore, openHardDelete }) {
  return (
    <Table
      headers={[
        "Produk",
        "SKU",
        "Kategori",
        "Harga",
        "Variant",
        "Diarsipkan",
        ""
      ]}
    >
      {data.map(p => (
        <Tr
          key={p.id}
          className="opacity-75 hover:opacity-100 transition-opacity cursor-default"
        >
          <Td>
            <div className="flex items-center gap-3">
              {/* Greyed thumbnail */}
              {p.primary_image ? (
                <img
                  src={p.primary_image}
                  alt={p.name}
                  className="w-10 h-10 object-cover rounded border border-gray-100 grayscale"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded border border-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-gray-300" />
                </div>
              )}
              <div>
                <div className="font-medium text-gray-500">{p.name}</div>
                <div className="text-xs text-gray-400">{p.slug || "—"}</div>
              </div>
            </div>
          </Td>
          <Td>
            <span className="font-mono text-xs text-gray-400">
              {p.sku || "—"}
            </span>
          </Td>
          <Td>
            <span className="text-sm text-gray-400">
              {p.category_name || "—"}
            </span>
          </Td>
          <Td>
            <span className="text-sm text-gray-400">
              {p.min_price != null
                ? `Rp ${p.min_price.toLocaleString("id-ID")}`
                : "—"}
              {p.max_price != null && p.max_price !== p.min_price
                ? ` – Rp ${p.max_price.toLocaleString("id-ID")}`
                : ""}
            </span>
          </Td>
          <Td>
            <span className="text-sm text-gray-400">
              {p.variant_count || 0} variant
            </span>
          </Td>
          <Td>
            <span className="text-xs text-gray-400">
              {p.updated_at
                ? new Date(p.updated_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })
                : "—"}
            </span>
          </Td>
          <Td>
            <div className="flex gap-1">
              <button
                onClick={e => restore(e, p.id)}
                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Pulihkan produk"
              >
                <ArchiveRestore className="w-4 h-4" />
              </button>
              <button
                onClick={e => openHardDelete(e, p)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                title="Hapus permanen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Td>
        </Tr>
      ))}
      {data.length === 0 && (
        <Tr>
          <Td colSpan={7}>
            <div className="text-center py-10 text-gray-400">
              <Archive className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Tidak ada produk di arsip
            </div>
          </Td>
        </Tr>
      )}
    </Table>
  );
}
