'use client';

import { useState, useEffect } from 'react';
import { shippingMethods } from '@/lib/api';
import { PageHeader, Card, Table, Tr, Td, Button, Modal, Input, LoadingSpinner, Badge } from '@/components/ui';
import { Plus, Pencil } from 'lucide-react';

const emptyForm = { name: '', code: '', price: '', estimated_time: '', is_active: true };

export default function ShippingPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await shippingMethods.list();
      setData(res.data || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setEditItem(null); setForm(emptyForm); setModal(true); }
  function openEdit(item) {
    setEditItem(item);
    setForm({ name: item.name, code: item.code, price: item.price, estimated_time: item.estimated_time, is_active: item.is_active });
    setModal(true);
  }

  async function save() {
    setSaving(true);
    try {
      const body = { ...form, price: Number(form.price) };
      if (editItem) await shippingMethods.update(editItem.id, body);
      else await shippingMethods.create(body);
      setModal(false);
      load();
    } catch {}
    setSaving(false);
  }

  async function toggle(item) {
    await shippingMethods.update(item.id, { is_active: !item.is_active });
    load();
  }

  function setField(f, v) { setForm(p => ({ ...p, [f]: v })); }

  return (
    <div>
      <PageHeader
        title="Metode Pengiriman"
        subtitle="Kelola opsi pengiriman"
        action={<Button onClick={openCreate}><Plus className="w-4 h-4 inline mr-1" />Tambah Metode</Button>}
      />
      <Card>
        {loading ? <LoadingSpinner /> : (
          <Table headers={['Nama', 'Kode', 'Harga', 'Estimasi', 'Status', '']}>
            {data.map(m => (
              <Tr key={m.id}>
                <Td><span className="font-medium">{m.name}</span></Td>
                <Td><span className="font-mono text-xs">{m.code}</span></Td>
                <Td>Rp {m.price.toLocaleString('id-ID')}</Td>
                <Td>{m.estimated_time}</Td>
                <Td>
                  <button onClick={() => toggle(m)} className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${m.is_active ? 'bg-cream-700' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-3 w-3 rounded-full bg-white transform transition-transform mt-1 ${m.is_active ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </Td>
                <Td>
                  <button onClick={() => openEdit(m)} className="text-gray-400 hover:text-cream-700"><Pencil className="w-4 h-4" /></button>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editItem ? 'Edit Metode Pengiriman' : 'Tambah Metode Pengiriman'}
        footer={<>
          <Button variant="secondary" onClick={() => setModal(false)}>Batal</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </>}
      >
        <div className="space-y-4">
          <Input label="Nama" value={form.name} onChange={e => setField('name', e.target.value)} />
          <Input label="Kode" value={form.code} onChange={e => setField('code', e.target.value.toUpperCase())} />
          <Input label="Harga (Rp)" type="number" value={form.price} onChange={e => setField('price', e.target.value)} />
          <Input label="Estimasi Waktu (contoh: 2-3 hari)" value={form.estimated_time} onChange={e => setField('estimated_time', e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setField('is_active', e.target.checked)} className="rounded" />
            Aktifkan metode pengiriman
          </label>
        </div>
      </Modal>
    </div>
  );
}
