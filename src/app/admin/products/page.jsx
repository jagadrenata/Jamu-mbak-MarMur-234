"use client";

import { useState, useEffect } from "react";
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
  ExternalLink,
  Eye
} from "lucide-react";

const emptyForm = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  category_id: "",
  status: "active"
};

export default function ProductsPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [cats, setCats] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);
  const limit = 15;

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = { limit, offset };
    if (search) params.search = search;
    if (status) params.status = status;
    Promise.all([products.list(params), categories.list()])
      .then(([res, catsRes]) => {
        if (!active) return;
        setData(res.data || []);
        setTotal(res.total || 0);
        setCats(catsRes.data || []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, status, offset, reload]);

  function refresh() {
    setReload(n => n + 1);
  }

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
      if (editItem) await products.update(editItem.id, form);
      else {
        const res = await products.create(form);
        // After create --> go straight to detail page
        setModal(false);
        router.push(`/admin/products/${res.data.id}`);
        return;
      }
      setModal(false);
      refresh();
    } catch {}
    setSaving(false);
  }

  async function remove(e, id) {
    e.stopPropagation();
    if (
      !confirm("Hapus produk ini? Semua variant dan gambar juga akan dihapus.")
    )
      return;
    await products.delete(id);
    refresh();
  }

  function setField(f, v) {
    setForm(prev => ({ ...prev, [f]: v }));
  }

  return (
    <div>
      <PageHeader
        title='Produk'
        subtitle='Kelola semua produk toko'
        action={
          <Button onClick={openCreate}>
            <Plus className='w-4 h-4 inline mr-1' />
            Tambah Produk
          </Button>
        }
      />

      <Card>
        <div className='flex gap-4 mb-6'>
          <div className='relative flex-1 max-w-sm'>
            <Search className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
            <input
              className='w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cream-400'
              placeholder='Cari produk...'
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setOffset(0);
              }}
            />
          </div>
          <Select
            value={status}
            onChange={e => {
              setStatus(e.target.value);
              setOffset(0);
            }}
          >
            <option value=''>Semua Status</option>
            <option value='active'>Aktif</option>
            <option value='draft'>Draft</option>
            <option value='archived'>Diarsipkan</option>
          </Select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
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
                  className='cursor-pointer hover:bg-cream-50 transition-colors'
                  onClick={() => router.push(`/admin/products/${p.id}`)}
                >
                  <Td>
                    <div className='flex items-center gap-3'>
                      {p.primary_image ? (
                        <img
                          src={p.primary_image}
                          alt={p.name}
                          className='w-10 h-10 object-cover rounded border border-gray-100'
                        />
                      ) : (
                        <div className='w-10 h-10 bg-gray-100 rounded border border-gray-100 flex items-center justify-center'>
                          <ImageIcon className='w-4 h-4 text-gray-300' />
                        </div>
                      )}
                      <div>
                        <div className='font-medium text-gray-900'>
                          {p.name}
                        </div>
                        <div className='text-xs text-gray-400'>
                          {p.slug || "—"}
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <span className='font-mono text-xs text-gray-500'>
                      {p.sku || "—"}
                    </span>
                  </Td>
                  <Td>
                    <span className='text-sm text-gray-600'>
                      {p.category_name || "—"}
                    </span>
                  </Td>
                  <Td>
                    <span className='text-sm'>
                      {p.min_price != null
                        ? `Rp ${p.min_price.toLocaleString("id-ID")}`
                        : "—"}
                      {p.max_price != null && p.max_price !== p.min_price
                        ? ` – Rp ${p.max_price.toLocaleString("id-ID")}`
                        : ""}
                    </span>
                  </Td>
                  <Td>
                    <span className='text-sm text-gray-500'>
                      {p.variant_count || 0} variant
                    </span>
                  </Td>
                  <Td>{statusBadge(p.status)}</Td>
                  <Td>
                    <span className='text-sm text-gray-500'>
                      {p.views_count || 0}
                    </span>
                  </Td>
                  <Td>
                    <div className='flex gap-1'>
                      <button
                        onClick={() => router.push(`/admin/products/${p.id}`)}
                        className='p-1.5 text-gray-400 hover:text-cream-600 hover:bg-cream-50 rounded transition-colors'
                        title='Lihat detail'
                      >
                        <Eye className='w-4 h-4' />
                      </button>
                      <button
                        onClick={e => openEdit(e, p)}
                        className='p-1.5 text-gray-400 hover:text-cream-700 hover:bg-cream-50 rounded transition-colors'
                        title='Edit cepat'
                      >
                        <Pencil className='w-4 h-4' />
                      </button>
                      <button
                        onClick={e => remove(e, p.id)}
                        className='p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors'
                        title='Hapus'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
              {data.length === 0 && (
                <Tr>
                  <Td colSpan={8}>
                    <div className='text-center py-8 text-gray-400'>
                      Tidak ada produk ditemukan
                    </div>
                  </Td>
                </Tr>
              )}
            </Table>
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

      {/* Quick edit / create modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editItem ? "Edit Produk" : "Tambah Produk"}
        footer={
          <>
            <Button variant='secondary' onClick={() => setModal(false)}>
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
        <div className='space-y-4'>
          <Input
            label='Nama Produk *'
            value={form.name}
            onChange={e => setField("name", e.target.value)}
          />
          <div className='grid grid-cols-2 gap-4'>
            <Input
              label='Slug'
              value={form.slug}
              onChange={e => setField("slug", e.target.value)}
            />
            <Input
              label='SKU'
              value={form.sku}
              onChange={e => setField("sku", e.target.value)}
            />
          </div>
          <Select
            label='Kategori'
            value={form.category_id}
            onChange={e => setField("category_id", e.target.value)}
          >
            <option value=''>Pilih Kategori</option>
            {cats.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Textarea
            label='Deskripsi'
            value={form.description}
            onChange={e => setField("description", e.target.value)}
          />
          <Select
            label='Status'
            value={form.status}
            onChange={e => setField("status", e.target.value)}
          >
            <option value='active'>Aktif</option>
            <option value='draft'>Draft</option>
            <option value='archived'>Diarsipkan</option>
          </Select>
          {!editItem && (
            <p className='text-xs text-cream-700 bg-cream-50 rounded p-2 border border-cream-100'>
              Setelah membuat produk, kamu akan diarahkan ke halaman detail
              untuk menambahkan gambar dan variant.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
