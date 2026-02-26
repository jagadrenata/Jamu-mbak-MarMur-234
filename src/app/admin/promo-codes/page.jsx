'use client';

import { useState, useEffect } from 'react';
import { promoCodes } from '@/lib/api';
import { PageHeader, Card, Table, Tr, Td, Button, Modal, Input, Select, LoadingSpinner, Badge } from '@/components/ui';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const emptyForm = { code: '', type: 'percent', value: '', min_purchase: '', max_discount: '', usage_limit: '', expires_at: '', is_active: true };

export default function PromoCodesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await promoCodes.list();
      setData(res.data || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setEditItem(null); setForm(emptyForm); setModal(true); }
  function openEdit(item) {
    setEditItem(item);
    setForm({
      code: item.code, type: item.type, value: item.value,
      min_purchase: item.min_purchase || '', max_discount: item.max_discount || '',
      usage_limit: item.usage_limit || '', expires_at: item.expires_at?.slice(0, 10) || '',
      is_active: item.is_active,
    });
    setModal(true);
  }

  async function save() {
    setSaving(true);
    try {
      const body = {
        ...form,
        value: Number(form.value),
        min_purchase: form.min_purchase ? Number(form.min_purchase) : null,
        max_discount: form.max_discount ? Number(form.max_discount) : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      };
      if (editItem) await promoCodes.update(editItem.id, body);
      else await promoCodes.create(body);
      setModal(false);
      load();
    } catch {}
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm('Hapus kode promo ini?')) return;
    await promoCodes.delete(id);
    load();
  }

  async function toggleActive(item) {
    await promoCodes.update(item.id, { is_active: !item.is_active });
    load();
  }

  function setField(f, v) { setForm(p => ({ ...p, [f]: v })); }

  return (
    <div>
      <PageHeader
        title="Kode Promo"
        subtitle="Kelola diskon dan promo"
        action={<Button onClick={openCreate}><Plus className="w-4 h-4 inline mr-1" />Tambah Promo</Button>}
      />
      <Card>
        {loading ? <LoadingSpinner /> : (
          <Table headers={['Kode', 'Tipe', 'Nilai', 'Min. Beli', 'Terpakai', 'Aktif', 'Kedaluwarsa', '']}>
            {data.map(promo => (
              <Tr key={promo.id}>
                <Td><span className="font-mono font-bold">{promo.code}</span></Td>
                <Td><Badge>{promo.type}</Badge></Td>
                <Td>{promo.type === 'percent' ? `${promo.value}%` : `Rp ${promo.value.toLocaleString('id-ID')}`}</Td>
                <Td>{promo.min_purchase ? `Rp ${promo.min_purchase.toLocaleString('id-ID')}` : '-'}</Td>
                <Td>{promo.used_count || 0} / {promo.usage_limit || '∞'}</Td>
                <Td>
                  <button onClick={() => toggleActive(promo)} className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${promo.is_active ? 'bg-cream-700' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-3 w-3 rounded-full bg-white transform transition-transform mt-1 ${promo.is_active ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </Td>
                <Td>{promo.expires_at ? new Date(promo.expires_at).toLocaleDateString('id-ID') : '-'}</Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(promo)} className="text-gray-400 hover:text-cream-700"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(promo.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editItem ? 'Edit Kode Promo' : 'Tambah Kode Promo'}
        footer={<>
          <Button variant="secondary" onClick={() => setModal(false)}>Batal</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </>}
      >
        <div className="space-y-4">
          <Input label="Kode Promo" value={form.code} onChange={e => setField('code', e.target.value.toUpperCase())} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tipe" value={form.type} onChange={e => setField('type', e.target.value)}>
              <option value="percent">Persentase (%)</option>
              <option value="fixed">Nominal (Rp)</option>
            </Select>
            <Input label={form.type === 'percent' ? 'Nilai (%)' : 'Nilai (Rp)'} type="number" value={form.value} onChange={e => setField('value', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min. Pembelian (Rp)" type="number" value={form.min_purchase} onChange={e => setField('min_purchase', e.target.value)} />
            {form.type === 'percent' && <Input label="Maks. Diskon (Rp)" type="number" value={form.max_discount} onChange={e => setField('max_discount', e.target.value)} />}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Batas Penggunaan" type="number" value={form.usage_limit} onChange={e => setField('usage_limit', e.target.value)} />
            <Input label="Kedaluwarsa" type="date" value={form.expires_at} onChange={e => setField('expires_at', e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setField('is_active', e.target.checked)} className="rounded" />
            Aktifkan kode promo
          </label>
        </div>
      </Modal>
    </div>
  );
}
