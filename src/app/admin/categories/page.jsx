'use client';

import { useState, useEffect } from 'react';
import { categories } from '@/lib/api';
import { PageHeader, Card, Table, Tr, Td, Button, Modal, Input, Textarea, LoadingSpinner, Badge } from '@/components/ui';
import { Plus, Pencil, Trash2, Archive, RotateCcw, AlertTriangle } from 'lucide-react';

const emptyForm = { name: '', slug: '', description: '', parent_id: null };

// Tab definitions
const TABS = [
  { key: "active", label: "Kategori Aktif" },
  { key: "archived", label: "Arsip" }
];

export default function CategoriesPage() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);

  // Tab state
  const [activeTab, setActiveTab] = useState("active");

  // Confirm modal state (for hard delete)
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const refresh = () => setReload(n => n + 1);

  useEffect(() => {
    let active = true;
    const params = activeTab === "archived" ? { status: "archived" } : { status: "active" };
    categories.list(params)
      .then(res => { if (active) { setData(res.data || []); setTotal(res.total || 0); } })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload, activeTab]);

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

  // Soft delete → archive
  async function archive(id) {
    if (!confirm('Arsipkan kategori ini?')) return;
    await categories.delete(id);
    refresh();
  }

  // Restore from archive
  async function restore(id) {
    await categories.restore(id);
    refresh();
  }

  // Open hard-delete confirmation
  function openHardDelete(item) {
    setConfirmTarget(item);
    setConfirmModal(true);
  }

  // Confirm permanent delete
  async function hardDelete() {
    setConfirming(true);
    try {
      await categories.hardDelete(confirmTarget.id);
      setConfirmModal(false);
      refresh();
    } catch {}
    setConfirming(false);
  }

  function setField(f, v) { setForm(p => ({ ...p, [f]: v })); }

  const parentCats = data.filter(c => !c.parent_id && c.status === "active");

  return (
    <div>
      <PageHeader
        title="Kategori"
        subtitle="Kelola kategori produk"
        action={
          activeTab === "active" && (
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 inline mr-1" />
              Tambah Kategori
            </Button>
          )
        }
      />

      <Card>
        {/* Tabs */}
        <div className='flex border-b border-gray-200 mb-6 -mt-2'>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
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
                  <span className='ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs'>
                    {total}
                  </span>
                )}
            </button>
          ))}
        </div>

        {/* Archive notice */}
        {activeTab === "archived" && (
          <div className='flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 text-sm text-amber-800'>
            <Archive className='w-4 h-4 shrink-0' />
            <span>
              Kategori di arsip tidak tampil di toko. Kamu bisa memulihkan atau
              menghapus permanen.
            </span>
          </div>
        )}

        {loading ? <LoadingSpinner /> : (
          <Table headers={['Nama', 'Slug', 'Deskripsi', 'Parent', 'Status', '']}>
            {data.map(cat => (
              <Tr key={cat.id}>
                <Td><span className="font-medium">{cat.name}</span></Td>
                <Td><span className="font-mono text-xs text-gray-500">{cat.slug}</span></Td>
                <Td>{cat.description || '-'}</Td>
                <Td>{cat.parent_id ? data.find(c => c.id === cat.parent_id)?.name || cat.parent_id : <span className="text-gray-400">Root</span>}</Td>
                <Td><Badge variant={cat.status === 'active' ? 'success' : 'default'}>{cat.status === 'active' ? 'Aktif' : 'Arsip'}</Badge></Td>
                <Td>
                  <div className="flex gap-2">
                    {activeTab === "active" ? (
                      <>
                        <button onClick={() => openEdit(cat)} className="text-gray-400 hover:text-gray-700">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => archive(cat.id)} className="text-gray-400 hover:text-amber-500">
                          <Archive className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => restore(cat.id)} className="text-gray-400 hover:text-green-600">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button onClick={() => openHardDelete(cat)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Create/Edit Modal */}
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
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white"
              value={form.parent_id || ''}
              onChange={e => setField('parent_id', e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Tidak ada (Root)</option>
              {parentCats.filter(c => !editItem || c.id !== editItem.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      {/* Hard Delete Confirmation Modal */}
      <Modal
        open={confirmModal}
        onClose={() => setConfirmModal(false)}
        title='Hapus Permanen'
        footer={
          <>
            <Button
              variant='secondary'
              onClick={() => setConfirmModal(false)}
              disabled={confirming}
            >
              Batal
            </Button>
            <Button variant='danger' onClick={hardDelete} disabled={confirming}>
              {confirming ? "Menghapus..." : "Ya, Hapus Permanen"}
            </Button>
          </>
        }
      >
        <div className='space-y-3'>
          <div className='flex items-start gap-3 p-3 bg-red-50 border border-red-200'>
            <AlertTriangle className='w-5 h-5 text-red-500 shrink-0 mt-0.5' />
            <div className='text-sm text-red-800'>
              <p className='font-medium mb-1'>
                Tindakan ini tidak bisa dibatalkan.
              </p>
              <p>
                Semua data terkait kategori <strong>{confirmTarget?.name}</strong> akan dihapus
                permanen dari database.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}