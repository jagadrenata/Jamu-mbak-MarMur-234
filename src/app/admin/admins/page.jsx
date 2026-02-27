'use client';

import { useState, useEffect } from 'react';
import { admins } from '@/lib/api';
import { PageHeader, Card, Table, Tr, Td, Button, Modal, Input, Select, LoadingSpinner, Badge } from '@/components/ui';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const emptyForm = { name: '', email: '', password: '', role: 'staff' };
const ROLES = ['staff', 'manager', 'superadmin'];

export default function AdminsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    admins.list()
      .then(res => { if (active) setData(res.data || []); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);

  function refresh() { setLoading(true); setReload(n => n + 1); }

  function openCreate() { setEditItem(null); setForm(emptyForm); setModal(true); }
  function openEdit(item) {
    setEditItem(item);
    setForm({ name: item.name, email: item.email, password: '', role: item.role });
    setModal(true);
  }

  async function save() {
    setSaving(true);
    try {
      if (editItem) {
        const body = { name: form.name, role: form.role };
        if (form.password) body.password = form.password;
        await admins.update(editItem.id, body);
      } else {
        await admins.create(form);
      }
      setModal(false);
      refresh();
    } catch {}
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm('Hapus admin ini?')) return;
    await admins.delete(id);
    refresh();
  }

  function setField(f, v) { setForm(p => ({ ...p, [f]: v })); }

  return (
    <div>
      <PageHeader
        title="Admin"
        subtitle="Kelola akun admin"
        action={<Button onClick={openCreate}><Plus className="w-4 h-4 inline mr-1" />Tambah Admin</Button>}
      />
      <Card>
        {loading ? <LoadingSpinner /> : (
          <Table headers={['Nama', 'Email', 'Role', 'Login Terakhir', '']}>
            {data.map(admin => (
              <Tr key={admin.id}>
                <Td><span className="font-medium">{admin.name}</span></Td>
                <Td>{admin.email}</Td>
                <Td><Badge variant={admin.role === 'manager' ? 'info' : admin.role === 'superadmin' ? 'success' : 'default'}>{admin.role}</Badge></Td>
                <Td>{admin.last_login ? new Date(admin.last_login).toLocaleDateString('id-ID') : '-'}</Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(admin)} className="text-gray-400 hover:text-cream-700"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(admin.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
        title={editItem ? 'Edit Admin' : 'Tambah Admin'}
        footer={<>
          <Button variant="secondary" onClick={() => setModal(false)}>Batal</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </>}
      >
        <div className="space-y-4">
          <Input label="Nama" value={form.name} onChange={e => setField('name', e.target.value)} />
          <Input label="Email" type="email" value={form.email} onChange={e => setField('email', e.target.value)} disabled={!!editItem} />
          <Input label={editItem ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'} type="password" value={form.password} onChange={e => setField('password', e.target.value)} />
          <Select label="Role" value={form.role} onChange={e => setField('role', e.target.value)}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        </div>
      </Modal>
    </div>
  );
}
