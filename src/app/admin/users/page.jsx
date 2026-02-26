'use client';

import { useState, useEffect } from 'react';
import { adminUsers } from '@/lib/api';
import { PageHeader, Card, Table, Tr, Td, Button, Modal, Select, LoadingSpinner, Pagination, Badge } from '@/components/ui';
import { Search, Eye, Trash2 } from 'lucide-react';

const ROLES = ['customer', 'vip'];

export default function AdminUsersPage() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detailUser, setDetailUser] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [saving, setSaving] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const limit = 15;

  async function load() {
    setLoading(true);
    try {
      const params = { limit, offset };
      if (search) params.search = search;
      if (role) params.role = role;
      const res = await adminUsers.list(params);
      setData(res.data || []);
      setTotal(res.total || 0);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [search, role, offset]);

  async function openDetail(user) {
    setDetailUser(user);
    try {
      const res = await adminUsers.orderHistory(user.id);
      setUserOrders(res.data || []);
    } catch { setUserOrders([]); }
  }

  async function updateRole() {
    setSaving(true);
    try {
      await adminUsers.update(editModal.id, { role: newRole });
      setEditModal(null);
      load();
    } catch {}
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm('Hapus pengguna ini?')) return;
    await adminUsers.delete(id);
    load();
  }

  return (
    <div>
      <PageHeader title="Pengguna" subtitle="Kelola semua pengguna terdaftar" />
      <Card>
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cream-500"
              placeholder="Cari nama/email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setOffset(0); }}
            />
          </div>
          <Select value={role} onChange={e => { setRole(e.target.value); setOffset(0); }}>
            <option value="">Semua Role</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        </div>
        {loading ? <LoadingSpinner /> : (
          <>
            <Table headers={['Nama', 'Email', 'Telepon', 'Role', 'Bergabung', '']}>
              {data.map(user => (
                <Tr key={user.id}>
                  <Td><span className="font-medium">{user.name}</span></Td>
                  <Td>{user.email}</Td>
                  <Td>{user.phone || '-'}</Td>
                  <Td><Badge variant={user.role === 'vip' ? 'success' : 'default'}>{user.role}</Badge></Td>
                  <Td>{new Date(user.created_at).toLocaleDateString('id-ID')}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <button onClick={() => openDetail(user)} className="text-gray-400 hover:text-cream-700"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => { setEditModal(user); setNewRole(user.role); }} className="text-gray-400 hover:text-cream-700 text-xs font-medium px-2 py-1 bg-cream-100 rounded hover:bg-cream-200">Role</button>
                      <button onClick={() => remove(user.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>
            {total > limit && <Pagination limit={limit} offset={offset} total={total} onChange={setOffset} />}
          </>
        )}
      </Card>

      <Modal open={!!detailUser} onClose={() => setDetailUser(null)} title={`Detail: ${detailUser?.name}`} footer={<Button variant="secondary" onClick={() => setDetailUser(null)}>Tutup</Button>}>
        {detailUser && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Email:</span> {detailUser.email}</div>
              <div><span className="text-gray-500">Telepon:</span> {detailUser.phone || '-'}</div>
              <div><span className="text-gray-500">Role:</span> <Badge>{detailUser.role}</Badge></div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 mt-4">Riwayat Pesanan</h4>
              {userOrders.length === 0 ? <p className="text-sm text-gray-400">Belum ada pesanan</p> : (
                <div className="space-y-2">
                  {userOrders.map(o => (
                    <div key={o.id} className="flex justify-between items-center p-3 bg-cream-50 rounded text-sm">
                      <span className="font-mono text-xs">{o.id}</span>
                      <span>Rp {(o.final_price || 0).toLocaleString('id-ID')}</span>
                      <Badge variant={o.status === 'completed' ? 'success' : 'default'}>{o.status_label || o.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!editModal}
        onClose={() => setEditModal(null)}
        title="Ubah Role"
        footer={<>
          <Button variant="secondary" onClick={() => setEditModal(null)}>Batal</Button>
          <Button onClick={updateRole} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </>}
      >
        {editModal && (
          <Select label={`Role untuk ${editModal.name}`} value={newRole} onChange={e => setNewRole(e.target.value)}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        )}
      </Modal>
    </div>
  );
}
