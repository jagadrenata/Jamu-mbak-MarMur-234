'use client';

import { useState, useEffect } from 'react';
import { addresses } from '@/lib/api';
import { PageHeader, Card, Button, Modal, Input, LoadingSpinner } from '@/components/ui';
import { Plus, Trash2, Star } from 'lucide-react';

const emptyForm = { name: '', address: { province: '', city: '', detail: '' }, is_default: false };

export default function AddressesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    addresses.list()
      .then(res => { if (active) setItems(res.data || []); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);

  function refresh() { setLoading(true); setReload(n => n + 1); }

  async function save() {
    setSaving(true);
    try {
      await addresses.create(form);
      setModal(false);
      setForm(emptyForm);
      refresh();
    } catch {}
    setSaving(false);
  }

  async function setDefault(id) {
    await addresses.update(id, { is_default: true });
    refresh();
  }

  async function remove(id) {
    if (!confirm('Hapus alamat ini?')) return;
    await addresses.delete(id);
    refresh();
  }

  function setField(field, val) { setForm(f => ({ ...f, [field]: val })); }
  function setAddrField(field, val) { setForm(f => ({ ...f, address: { ...f.address, [field]: val } })); }

  return (
    <div>
      <PageHeader
        title="Alamat"
        subtitle="Kelola alamat pengiriman Anda"
        action={<Button onClick={() => setModal(true)}><Plus className="w-4 h-4 inline mr-1" />Tambah Alamat</Button>}
      />
      {loading ? <LoadingSpinner /> : items.length === 0 ? (
        <Card><div className="text-center text-gray-400 py-12">Belum ada alamat tersimpan</div></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map(item => (
            <Card key={item.id} className={item.is_default ? 'border-2 border-cream-600' : ''}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  {item.is_default && <span className="text-xs bg-cream-700 text-white px-2 py-0.5 rounded">Utama</span>}
                </div>
                <div className="flex gap-2">
                  {!item.is_default && (
                    <button onClick={() => setDefault(item.id)} className="text-gray-400 hover:text-cream-700" title="Jadikan utama">
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => remove(item.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">{item.address?.detail}</p>
              <p className="text-sm text-gray-500">{item.address?.city}, {item.address?.province}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Tambah Alamat"
        footer={<>
          <Button variant="secondary" onClick={() => setModal(false)}>Batal</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </>}
      >
        <div className="space-y-4">
          <Input label="Nama Alamat (contoh: Rumah)" value={form.name} onChange={e => setField('name', e.target.value)} />
          <Input label="Provinsi" value={form.address.province} onChange={e => setAddrField('province', e.target.value)} />
          <Input label="Kota" value={form.address.city} onChange={e => setAddrField('city', e.target.value)} />
          <Input label="Detail Alamat" value={form.address.detail} onChange={e => setAddrField('detail', e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.is_default} onChange={e => setField('is_default', e.target.checked)} className="rounded" />
            Jadikan alamat utama
          </label>
        </div>
      </Modal>
    </div>
  );
}
