'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { products, variants, images, categories } from '@/lib/api';
import {
  Card, Button, Input, Select, Textarea, LoadingSpinner, Table, Tr, Td, statusBadge, Modal,
} from '@/components/ui';
import ImageUploader from '@/components/ImageUploader';
import {
  ArrowLeft, Info, ImageIcon, Layers, Pencil, Trash2, Plus, Check, X,
  ToggleLeft, ToggleRight, ExternalLink, Package,
} from 'lucide-react';

const TABS = [
  { key: 'info', label: 'Info Produk', icon: Info },
  { key: 'images', label: 'Gambar', icon: ImageIcon },
  { key: 'variants', label: 'Variant', icon: Layers },
];

const emptyVariantForm = {
  name: '', sku: '', price: '', cost_price: '', quantity: '', weight: '', is_active: true, attributes: '',
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');
  const [cats, setCats] = useState([]);

  // Info edit state
  const [infoForm, setInfoForm] = useState({});
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoEditing, setInfoEditing] = useState(false);

  // Images state
  const [productImages, setProductImages] = useState([]);

  // Variant modal state
  const [variantModal, setVariantModal] = useState(false);
  const [editVariant, setEditVariant] = useState(null);
  const [variantForm, setVariantForm] = useState(emptyVariantForm);
  const [variantSaving, setVariantSaving] = useState(false);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    try {
      const [res, catsRes] = await Promise.all([
        products.get(id),   // uses ?detail=1 → we'll call the detail endpoint
        categories.list(),
      ]);
      // products.get(id) → GET /api/data/products?id=X
      // We need detail, so fetch with detail=1
      const detailRes = await fetch(`/api/data/products?id=${id}&detail=1`).then(r => r.json());
      const p = detailRes.data;
      setProduct(p);
      setProductImages(p.images || []);
      setInfoForm({
        name: p.name || '',
        slug: p.slug || '',
        sku: p.sku || '',
        description: p.description || '',
        category_id: p.category_id || '',
        status: p.status || 'active',
      });
      setCats(catsRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadProduct(); }, [loadProduct]);

  async function saveInfo() {
    setInfoSaving(true);
    try {
      await products.update(id, infoForm);
      setInfoEditing(false);
      await loadProduct();
    } catch {}
    setInfoSaving(false);
  }

  function openCreateVariant() {
    setEditVariant(null);
    setVariantForm(emptyVariantForm);
    setVariantModal(true);
  }

  function openEditVariant(v) {
    setEditVariant(v);
    setVariantForm({
      name: v.name || '',
      sku: v.sku || '',
      price: String(v.price ?? ''),
      cost_price: String(v.cost_price ?? ''),
      quantity: String(v.quantity ?? ''),
      weight: String(v.weight ?? ''),
      is_active: v.is_active ?? true,
      attributes: v.attributes ? JSON.stringify(v.attributes, null, 2) : '',
    });
    setVariantModal(true);
  }

  async function saveVariant() {
    setVariantSaving(true);
    try {
      let attrs = null;
      if (variantForm.attributes.trim()) {
        try { attrs = JSON.parse(variantForm.attributes); } catch { attrs = null; }
      }
      const payload = {
        product_id: id,
        name: variantForm.name || null,
        sku: variantForm.sku,
        price: parseInt(variantForm.price),
        cost_price: parseInt(variantForm.cost_price || 0),
        quantity: parseInt(variantForm.quantity || 0),
        weight: parseInt(variantForm.weight || 0),
        is_active: variantForm.is_active,
        attributes: attrs,
      };
      if (editVariant) await variants.update(editVariant.id, payload);
      else await variants.create(payload);
      setVariantModal(false);
      await loadProduct();
    } catch {}
    setVariantSaving(false);
  }

  async function deleteVariant(variantId) {
    if (!confirm('Hapus variant ini?')) return;
    await variants.delete(variantId);
    await loadProduct();
  }

  async function toggleVariantActive(v) {
    await variants.update(v.id, { is_active: !v.is_active });
    await loadProduct();
  }

  function setVField(f, v) { setVariantForm(prev => ({ ...prev, [f]: v })); }
  function setIField(f, v) { setInfoForm(prev => ({ ...prev, [f]: v })); }

  if (loading) return <div className="flex items-center justify-center min-h-64"><LoadingSpinner /></div>;
  if (!product) return (
    <div className="text-center py-20 text-gray-400">
      <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>Produk tidak ditemukan.</p>
      <button onClick={() => router.push('/admin/products')} className="mt-4 text-sm text-cream-600 hover:underline">
        ← Kembali ke daftar
      </button>
    </div>
  );

  const primaryImage = productImages.find(i => i.is_primary) ?? productImages[0];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <button
          onClick={() => router.push('/admin/products')}
          className="mt-1 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            <button onClick={() => router.push('/admin/products')} className="hover:text-cream-600 transition-colors">Produk</button>
            <span>/</span>
            <span className="text-gray-600 truncate">{product.name}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {primaryImage && (
              <img src={primaryImage.url} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {statusBadge(product.status)}
                {product.sku && <span className="font-mono text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{product.sku}</span>}
                {product.category && <span className="text-xs text-gray-400">{product.category.name}</span>}
              </div>
            </div>
          </div>
        </div>
        <a
          href={`/products/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-cream-600 transition-colors mt-1"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">Lihat di toko</span>
        </a>
      </div>

      <div className="flex border-b border-gray-200 mb-6 gap-1">
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-cream-600 text-cream-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              {t.key === 'variants' && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-cream-100 text-cream-700' : 'bg-gray-100 text-gray-500'}`}>
                  {(product.variants || []).length}
                </span>
              )}
              {t.key === 'images' && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-cream-100 text-cream-700' : 'bg-gray-100 text-gray-500'}`}>
                  {productImages.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === 'info' && (
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-800">Informasi Produk</h2>
            {!infoEditing
              ? <Button onClick={() => setInfoEditing(true)} variant="secondary"><Pencil className="w-4 h-4 inline mr-1" />Edit</Button>
              : (
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setInfoEditing(false)}>Batal</Button>
                  <Button onClick={saveInfo} disabled={infoSaving}>{infoSaving ? 'Menyimpan...' : 'Simpan'}</Button>
                </div>
              )
            }
          </div>

          {infoEditing ? (
            <div className="space-y-4 max-w-2xl">
              <Input label="Nama Produk *" value={infoForm.name} onChange={e => setIField('name', e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Slug" value={infoForm.slug} onChange={e => setIField('slug', e.target.value)} />
                <Input label="SKU" value={infoForm.sku} onChange={e => setIField('sku', e.target.value)} />
              </div>
              <Select label="Kategori" value={infoForm.category_id} onChange={e => setIField('category_id', e.target.value)}>
                <option value="">Tanpa Kategori</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Textarea label="Deskripsi" value={infoForm.description} onChange={e => setIField('description', e.target.value)} rows={4} />
              <Select label="Status" value={infoForm.status} onChange={e => setIField('status', e.target.value)}>
                <option value="active">Aktif</option>
                <option value="draft">Draft</option>
                <option value="archived">Diarsipkan</option>
              </Select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 max-w-2xl">
              {[
                { label: 'Nama', value: product.name },
                { label: 'Slug', value: product.slug || '—', mono: true },
                { label: 'SKU', value: product.sku || '—', mono: true },
                { label: 'Kategori', value: product.category?.name || '—' },
                { label: 'Status', value: statusBadge(product.status) },
                { label: 'Views', value: product.views_count ?? 0 },
                { label: 'Dibuat', value: product.created_at ? new Date(product.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '—' },
                { label: 'Diupdate', value: product.updated_at ? new Date(product.updated_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '—' },
              ].map(row => (
                <div key={row.label}>
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{row.label}</div>
                  {typeof row.value === 'string' || typeof row.value === 'number'
                    ? <div className={`text-sm text-gray-800 ${row.mono ? 'font-mono' : ''}`}>{row.value}</div>
                    : row.value
                  }
                </div>
              ))}
              {product.description && (
                <div className="col-span-2">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Deskripsi</div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{product.description}</div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {tab === 'images' && (
        <Card>
          <h2 className="font-semibold text-gray-800 mb-5">Gambar Produk</h2>
          <ImageUploader
            productId={parseInt(id)}
            images={productImages}
            onChange={setProductImages}
          />
        </Card>
      )}

      {tab === 'variants' && (
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-800">Variant Produk</h2>
            <Button onClick={openCreateVariant}><Plus className="w-4 h-4 inline mr-1" />Tambah Variant</Button>
          </div>

          {(product.variants || []).length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Belum ada variant. Tambahkan variant untuk mengatur harga dan stok.</p>
              <button onClick={openCreateVariant} className="mt-3 text-sm text-cream-600 hover:underline">+ Tambah variant pertama</button>
            </div>
          ) : (
            <Table headers={['Nama / SKU', 'Harga', 'HPP', 'Stok', 'Berat', 'Status', '']}>
              {(product.variants || []).map(v => (
                <Tr key={v.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      {v.images?.[0]
                        ? <img src={v.images[0].url} alt={v.name} className="w-9 h-9 object-cover rounded border border-gray-100" />
                        : <div className="w-9 h-9 bg-gray-100 rounded border border-gray-100 flex items-center justify-center"><ImageIcon className="w-3.5 h-3.5 text-gray-300" /></div>
                      }
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{v.name || <span className="text-gray-400 italic">Tanpa nama</span>}</div>
                        <div className="font-mono text-xs text-gray-400">{v.sku}</div>
                      </div>
                    </div>
                  </Td>
                  <Td><span className="text-sm font-medium">Rp {(v.price || 0).toLocaleString('id-ID')}</span></Td>
                  <Td><span className="text-sm text-gray-500">Rp {(v.cost_price || 0).toLocaleString('id-ID')}</span></Td>
                  <Td>
                    <span className={`text-sm font-medium ${v.quantity === 0 ? 'text-red-500' : v.quantity < 5 ? 'text-cream-600' : 'text-gray-800'}`}>
                      {v.quantity}
                    </span>
                  </Td>
                  <Td><span className="text-sm text-gray-500">{v.weight ? `${v.weight}g` : '—'}</span></Td>
                  <Td>
                    <button
                      onClick={() => toggleVariantActive(v)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                        v.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {v.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                      {v.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </Td>
                  <Td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => router.push(`/admin/products/${id}/variants/${v.id}`)}
                        className="p-1.5 text-gray-400 hover:text-cream-600 hover:bg-cream-50 rounded transition-colors"
                        title="Detail variant"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditVariant(v)}
                        className="p-1.5 text-gray-400 hover:text-cream-700 hover:bg-cream-50 rounded transition-colors"
                        title="Edit variant"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteVariant(v.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Hapus variant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
        </Card>
      )}

      <Modal
        open={variantModal}
        onClose={() => setVariantModal(false)}
        title={editVariant ? 'Edit Variant' : 'Tambah Variant'}
        footer={<>
          <Button variant="secondary" onClick={() => setVariantModal(false)}>Batal</Button>
          <Button onClick={saveVariant} disabled={variantSaving}>{variantSaving ? 'Menyimpan...' : 'Simpan'}</Button>
        </>}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nama Variant" value={variantForm.name} onChange={e => setVField('name', e.target.value)} placeholder="cth: Merah / L" />
            <Input label="SKU *" value={variantForm.sku} onChange={e => setVField('sku', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Harga Jual (Rp) *" type="number" value={variantForm.price} onChange={e => setVField('price', e.target.value)} />
            <Input label="Harga Pokok (Rp)" type="number" value={variantForm.cost_price} onChange={e => setVField('cost_price', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Stok" type="number" value={variantForm.quantity} onChange={e => setVField('quantity', e.target.value)} />
            <Input label="Berat (gram)" type="number" value={variantForm.weight} onChange={e => setVField('weight', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Atribut (JSON opsional)</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cream-400"
              rows={3}
              placeholder='{"warna": "merah", "ukuran": "L"}'
              value={variantForm.attributes}
              onChange={e => setVField('attributes', e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setVField('is_active', !variantForm.is_active)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${variantForm.is_active ? 'bg-cream-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${variantForm.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm text-gray-700">Variant aktif</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
