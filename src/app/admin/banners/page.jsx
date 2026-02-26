'use client';

import { useState, useEffect } from 'react';
import { bannerAds } from '@/lib/api';
import { PageHeader, Card, Table, Tr, Td, Button, Modal, Input, Select, LoadingSpinner, Badge } from '@/components/ui';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const emptyForm = { title: '', image_url: '', link_url: '', position: 'hero', is_active: true, start_date: '', end_date: '' };
const POSITIONS = ['hero', 'mid', 'sidebar', 'footer'];

export default function BannersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await bannerAds.list();
      setData(res.data || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setEditItem(null); setForm(emptyForm); setModal(true); }
  function openEdit(item) {
    setEditItem(item);
    setForm({
      title: item.title, image_url: item.image_url, link_url: item.link_url || '',
      position: item.position, is_active: item.is_active,
      start_date: item.start_date?.slice(0, 10) || '', end_date: item.end_date?.slice(0, 10) || '',
    });
    setModal(true);
  }

  async function save() {
    setSaving(true);
    try {
      const body = {
        ...form,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      };
      if (editItem) await bannerAds.update(editItem.id, body);
      else await bannerAds.create(body);
      setModal(false);
      load();
    } catch {}
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm('Hapus banner ini?')) return;
    await bannerAds.delete(id);
    load();
  }

  async function toggle(item) {
    await bannerAds.update(item.id, { is_active: !item.is_active });
    load();
  }

  function setField(f, v) { setForm(p => ({ ...p, [f]: v })); }

  return (
    <div>
      <PageHeader
        title="Banner Iklan"
        subtitle="Kelola banner promosi halaman"
        action={<Button onClick={openCreate}><Plus className="w-4 h-4 inline mr-1" />Tambah Banner</Button>}
      />
      <Card>
        {loading ? <LoadingSpinner /> : (
          <Table headers={['Preview', 'Judul', 'Posisi', 'Periode', 'Status', '']}>
            {data.map(banner => (
              <Tr key={banner.id}>
                <Td>
                  {banner.image_url && (
                    <img src={banner.image_url} alt={banner.title} className="w-20 h-12 object-cover rounded" />
                  )}
                </Td>
                <Td>
                  <div className="font-medium">{banner.title}</div>
                  <div className="text-xs text-gray-400">{banner.link_url}</div>
                </Td>
                <Td><Badge>{banner.position}</Badge></Td>
                <Td>
                  <div className="text-xs">
                    {banner.start_date && <div>Mulai: {new Date(banner.start_date).toLocaleDateString('id-ID')}</div>}
                    {banner.end_date && <div>Selesai: {new Date(banner.end_date).toLocaleDateString('id-ID')}</div>}
                  </div>
                </Td>
                <Td>
                  <button onClick={() => toggle(banner)} className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${banner.is_active ? 'bg-cream-700' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-3 w-3 rounded-full bg-white transform transition-transform mt-1 ${banner.is_active ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(banner)} className="text-gray-400 hover:text-cream-700"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(banner.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
        title={editItem ? 'Edit Banner' : 'Tambah Banner'}
        footer={<>
          <Button variant="secondary" onClick={() => setModal(false)}>Batal</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </>}
      >
        <div className="space-y-4">
          <Input label="Judul" value={form.title} onChange={e => setField('title', e.target.value)} />
          <Input label="URL Gambar" value={form.image_url} onChange={e => setField('image_url', e.target.value)} />
          <Input label="Link URL" value={form.link_url} onChange={e => setField('link_url', e.target.value)} />
          <Select label="Posisi" value={form.position} onChange={e => setField('position', e.target.value)}>
            {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tanggal Mulai" type="date" value={form.start_date} onChange={e => setField('start_date', e.target.value)} />
            <Input label="Tanggal Selesai" type="date" value={form.end_date} onChange={e => setField('end_date', e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setField('is_active', e.target.checked)} className="rounded" />
            Aktifkan banner
          </label>
        </div>
      </Modal>
    </div>
  );
}
