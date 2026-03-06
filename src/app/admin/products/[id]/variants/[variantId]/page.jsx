'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { variants, images } from '@/lib/api';
import { Card, Button, Input, LoadingSpinner, statusBadge } from '@/components/ui';
import ImageUploader from '@/components/ImageUploader';
import {
  ArrowLeft, Info, ImageIcon, Pencil, Package,
  ToggleLeft, ToggleRight,
} from 'lucide-react';

const TABS = [
  { key: 'info', label: 'Info Variant', icon: Info },
  { key: 'images', label: 'Gambar', icon: ImageIcon },
];

export default function VariantDetailPage() {
  const { id, variantId } = useParams();
  const router = useRouter();

  const [variant, setVariant] = useState(null);
  const [variantImages, setVariantImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');

  // Edit state
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadVariant = useCallback(async () => {
    setLoading(true);
    try {
      const res = await variants.get(variantId);
      const v = res.data;
      setVariant(v);
      setVariantImages(v.images || []);
      setForm({
        name: v.name || '',
        sku: v.sku || '',
        price: String(v.price ?? ''),
        cost_price: String(v.cost_price ?? ''),
        quantity: String(v.quantity ?? ''),
        weight: String(v.weight ?? ''),
        is_active: v.is_active ?? true,
        attributes: v.attributes ? JSON.stringify(v.attributes, null, 2) : '',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [variantId]);

  useEffect(() => { loadVariant(); }, [loadVariant]);

  async function save() {
    setFormError('');
    if (!form.sku) { setFormError('SKU wajib diisi'); return; }
    if (!form.price) { setFormError('Harga wajib diisi'); return; }
    setSaving(true);
    try {
      let attrs = null;
      if (form.attributes.trim()) {
        try { attrs = JSON.parse(form.attributes); } catch { setFormError('Format atribut JSON tidak valid'); setSaving(false); return; }
      }
      await variants.update(variantId, {
        name: form.name || null,
        sku: form.sku,
        price: parseInt(form.price),
        cost_price: parseInt(form.cost_price || 0),
        quantity: parseInt(form.quantity || 0),
        weight: parseInt(form.weight || 0),
        is_active: form.is_active,
        attributes: attrs,
      });
      setEditing(false);
      await loadVariant();
    } catch (e) {
      setFormError(e.message || 'Gagal menyimpan');
    }
    setSaving(false);
  }

  function setField(f, v) { setForm(prev => ({ ...prev, [f]: v })); }

  if (loading) return <div className="flex items-center justify-center min-h-64"><LoadingSpinner /></div>;
  if (!variant) return (
    <div className="text-center py-20 text-gray-400">
      <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>Variant tidak ditemukan.</p>
      <button onClick={() => router.push(`/admin/products/${id}`)} className="mt-4 text-sm text-cream-600 hover:underline">
        ← Kembali ke produk
      </button>
    </div>
  );

  const primaryImage = variantImages.find(i => i.is_primary) ?? variantImages[0];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <button
          onClick={() => router.push(`/admin/products/${id}?tab=variants`)}
          className="mt-1 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1 flex-wrap">
            <button onClick={() => router.push('/admin/products')} className="hover:text-cream-600 transition-colors">Produk</button>
            <span>/</span>
            <button onClick={() => router.push(`/admin/products/${id}`)} className="hover:text-cream-600 transition-colors">
              {variant.product?.name || `Produk #${id}`}
            </button>
            <span>/</span>
            <span className="text-gray-600">Variant</span>
          </div>
          <div className="flex items-center gap-3">
            {primaryImage && (
              <img src={primaryImage.url} alt={variant.name} className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {variant.name || <span className="text-gray-400 italic">Variant #{variant.id}</span>}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${variant.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {variant.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
                <span className="font-mono text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{variant.sku}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Harga Jual', value: `Rp ${(variant.price || 0).toLocaleString('id-ID')}`, accent: true },
          { label: 'Harga Pokok', value: `Rp ${(variant.cost_price || 0).toLocaleString('id-ID')}` },
          {
            label: 'Stok',
            value: variant.quantity,
            color: variant.quantity === 0 ? 'text-red-600' : variant.quantity < 5 ? 'text-cream-600' : 'text-gray-900',
          },
          { label: 'Berat', value: variant.weight ? `${variant.weight} gram` : '—' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.accent ? 'border-cream-200 bg-cream-50' : 'border-gray-200 bg-white'}`}>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{s.label}</div>
            <div className={`text-lg font-bold ${s.color || (s.accent ? 'text-cream-700' : 'text-gray-900')}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
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
              {t.key === 'images' && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-cream-100 text-cream-700' : 'bg-gray-100 text-gray-500'}`}>
                  {variantImages.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab: Info ── */}
      {tab === 'info' && (
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-800">Informasi Variant</h2>
            {!editing
              ? <Button variant="secondary" onClick={() => setEditing(true)}><Pencil className="w-4 h-4 inline mr-1" />Edit</Button>
              : (
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => { setEditing(false); setFormError(''); }}>Batal</Button>
                  <Button onClick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
                </div>
              )
            }
          </div>

          {formError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{formError}</div>
          )}

          {editing ? (
            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nama Variant" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="cth: Merah / L" />
                <Input label="SKU *" value={form.sku} onChange={e => setField('sku', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Harga Jual (Rp) *" type="number" value={form.price} onChange={e => setField('price', e.target.value)} />
                <Input label="Harga Pokok (Rp)" type="number" value={form.cost_price} onChange={e => setField('cost_price', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Stok" type="number" value={form.quantity} onChange={e => setField('quantity', e.target.value)} />
                <Input label="Berat (gram)" type="number" value={form.weight} onChange={e => setField('weight', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Atribut (JSON opsional)</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cream-400"
                  rows={4}
                  placeholder='{"warna": "merah", "ukuran": "L"}'
                  value={form.attributes}
                  onChange={e => setField('attributes', e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setField('is_active', !form.is_active)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-cream-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm text-gray-700">Variant aktif</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 max-w-2xl">
              {[
                { label: 'Nama', value: variant.name || '—' },
                { label: 'SKU', value: variant.sku, mono: true },
                { label: 'Harga Jual', value: `Rp ${(variant.price || 0).toLocaleString('id-ID')}` },
                { label: 'Harga Pokok', value: `Rp ${(variant.cost_price || 0).toLocaleString('id-ID')}` },
                { label: 'Stok', value: variant.quantity ?? 0 },
                { label: 'Berat', value: variant.weight ? `${variant.weight} gram` : '—' },
                {
                  label: 'Status',
                  value: (
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${variant.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {variant.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                      {variant.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  ),
                },
                { label: 'Dibuat', value: variant.created_at ? new Date(variant.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '—' },
              ].map(row => (
                <div key={row.label}>
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{row.label}</div>
                  {typeof row.value === 'string' || typeof row.value === 'number'
                    ? <div className={`text-sm text-gray-800 ${row.mono ? 'font-mono' : ''}`}>{row.value}</div>
                    : row.value
                  }
                </div>
              ))}
              {variant.attributes && (
                <div className="col-span-2">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Atribut</div>
                  <pre className="text-xs font-mono bg-gray-50 border border-gray-100 rounded p-3 overflow-x-auto text-gray-700">
                    {JSON.stringify(variant.attributes, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* ── Tab: Images ── */}
      {tab === 'images' && (
        <Card>
          <h2 className="font-semibold text-gray-800 mb-5">Gambar Variant</h2>
          <ImageUploader
            variantId={parseInt(variantId)}
            images={variantImages}
            onChange={setVariantImages}
          />
        </Card>
      )}
    </div>
  );
}
