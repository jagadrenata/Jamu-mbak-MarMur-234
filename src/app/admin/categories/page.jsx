'use client';

import { useState, useEffect } from 'react';
import { categories } from '@/lib/api';
import { PageHeader, Card, Table, Tr, Td, Button, Modal, Input, Textarea, LoadingSpinner } from '@/components/ui';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const emptyForm = { name: '', slug: '', description: '', parent_id: null };

export default function CategoriesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    categories.list()
      .then(res => { if (active) setData(res.data || []); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);

  function refresh() { setLoading(true); setReload(n => n + 1); }

  function openCreate() { setEditItem(null); setForm(emptyForm); setModal(true); }
  function openEdit(item) {
    setEditItem(item);
    setForm({ name: item.name, slug: item.slug, description: item.description, parent_id: item.parent_id });
    setModal(true);
  }

  async function save() {
    setSaving(true);
    try {
      if (editItem) await categories.update(editItem.id, form);
      else await categories.create(form);
      setModal(false);
      refresh();
    } catch {}
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm('Hapus kategori ini?')) return;
    await categories.delete(id);
    refresh();
  }

  function setField(f, v) { setForm(p => ({ ...p, [f]: v })); }

  const parentCats = data.filter(c => !c.parent_id);

  return (
    <div>
      <PageHeader
        title="Kategori"
        subtitle="Kelola kategori produk"
        action={<Button onClick={openCreate}><Plus className="w-4 h-4 inline mr-1" />Tambah Kategori</Button>}
      />
      <Card>
        {loading ? <LoadingSpinner /> : (
          <Table headers={['Nama', 'Slug', 'Deskripsi', 'Parent', '']}>
            {data.map(cat => (
              <Tr key={cat.id}>
                <Td><span className="font-medium">{cat.name}</span></Td>
                <Td><span className="font-mono text-xs text-gray-500">{cat.slug}</span></Td>
                <Td>{cat.description || '-'}</Td>
                <Td>{cat.parent_id ? data.find(c => c.id === cat.parent_id)?.name || cat.parent_id : <span className="text-gray-400">Root</span>}</Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(cat)} className="text-gray-400 hover:text-cream-700"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(cat.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
        title={editItem ? 'Edit Kategori' : 'Tambah Kategori'}
        footer={<>
          <Button variant="secondary" onClick={() => setModal(false)}>Batal</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </>}
      >
        <div className="space-y-4">
          <Input label="Nama" value={form.name} onChange={e => setField('name', e.target.value)} />
          <Input label="Slug" value={form.slug} onChange={e => setField('slug', e.target.value)} />
          <Textarea label="Deskripsi" value={form.description || ''} onChange={e => setField('description', e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Kategori</label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cream-500 bg-white"
              value={form.parent_id || ''}
              onChange={e => setField('parent_id', e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Tidak ada (Root)</option>
              {parentCats.filter(c => !editItem || c.id !== editItem.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
