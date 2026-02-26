'use client';

import { useState, useEffect } from 'react';
import { suppliers } from '@/lib/api';
import { PageHeader, Card, Table, Tr, Td, Button, Modal, Input, LoadingSpinner } from '@/components/ui';
import { Plus, Building2 } from 'lucide-react';

const emptyForm = { name: '', contact: '', email: '', phone: '', address: { province: '', city: '', detail: '' } };

export default function SuppliersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await suppliers.list();
      setData(res.data || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    try {
      await suppliers.create(form);
      setModal(false);
      setForm(emptyForm);
      load();
    } catch {}
    setSaving(false);
  }

  function setField(f, v) { setForm(p => ({ ...p, [f]: v })); }
  function setAddrField(f, v) { setForm(p => ({ ...p, address: { ...p.address, [f]: v } })); }

  return (
    <div>
      <PageHeader
        title="Supplier"
        subtitle="Kelola data supplier"
        action={<Button onClick={() => setModal(true)}><Plus className="w-4 h-4 inline mr-1" />Tambah Supplier</Button>}
      />
      <Card>
        {loading ? <LoadingSpinner /> : data.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            Belum ada supplier
          </div>
        ) : (
          <Table headers={['Nama', 'Kontak', 'Email', 'Telepon', 'Kota']}>
            {data.map(s => (
              <Tr key={s.id}>
                <Td><span className="font-medium">{s.name}</span></Td>
                <Td>{s.contact}</Td>
                <Td>{s.email}</Td>
                <Td>{s.phone}</Td>
                <Td>{s.address?.city}, {s.address?.province}</Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Tambah Supplier"
        footer={<>
          <Button variant="secondary" onClick={() => setModal(false)}>Batal</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </>}
      >
        <div className="space-y-4">
          <Input label="Nama Perusahaan" value={form.name} onChange={e => setField('name', e.target.value)} />
          <Input label="Nama Kontak" value={form.contact} onChange={e => setField('contact', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={form.email} onChange={e => setField('email', e.target.value)} />
            <Input label="Telepon" value={form.phone} onChange={e => setField('phone', e.target.value)} />
          </div>
          <Input label="Provinsi" value={form.address.province} onChange={e => setAddrField('province', e.target.value)} />
          <Input label="Kota" value={form.address.city} onChange={e => setAddrField('city', e.target.value)} />
          <Input label="Alamat Lengkap" value={form.address.detail} onChange={e => setAddrField('detail', e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
