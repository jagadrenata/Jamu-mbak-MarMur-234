'use client';

import { useState, useEffect } from 'react';
import { adminOrders, adminGuestOrders } from '@/lib/api';
import { PageHeader, Card, Table, Tr, Td, Button, Modal, Select, LoadingSpinner, Pagination, statusBadge } from '@/components/ui';
import { Search, Eye } from 'lucide-react';

const ORDER_STATUSES = ['pending','paid','processing','shipping','completed','cancelled'];

export default function AdminOrdersPage() {
  const [tab, setTab] = useState('member');
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const limit = 15;

  async function load() {
    setLoading(true);
    try {
      const params = { limit, offset };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = tab === 'member' ? await adminOrders.list(params) : await adminGuestOrders.list(params);
      setData(res.data || []);
      setTotal(res.total || 0);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [tab, search, status, offset]);

  async function updateStatus() {
    setSaving(true);
    try {
      if (tab === 'member') await adminOrders.update(modal.id, { status: newStatus });
      else await adminGuestOrders.update(modal.id, { status: newStatus });
      setModal(null);
      load();
    } catch {}
    setSaving(false);
  }

  return (
    <div>
      <PageHeader title="Pesanan" subtitle="Kelola semua pesanan" />
      <div className="flex gap-2 mb-6">
        {['member', 'guest'].map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setOffset(0); }}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${tab === t ? 'bg-cream-700 text-white' : 'bg-cream-100 text-gray-700 hover:bg-cream-200'}`}
          >
            {t === 'member' ? 'Member' : 'Guest'}
          </button>
        ))}
      </div>
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
          <Select value={status} onChange={e => { setStatus(e.target.value); setOffset(0); }}>
            <option value="">Semua Status</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        {loading ? <LoadingSpinner /> : (
          <>
            <Table headers={['ID', 'Pelanggan', 'Total', 'Status', 'Tanggal', '']}>
              {data.map(order => (
                <Tr key={order.id}>
                  <Td><span className="font-mono text-xs">{order.id}</span></Td>
                  <Td>
                    <div className="font-medium">{order.customer_name}</div>
                    <div className="text-xs text-gray-400">{order.customer_email}</div>
                  </Td>
                  <Td>Rp {(order.final_price || 0).toLocaleString('id-ID')}</Td>
                  <Td>{statusBadge(order.status)}</Td>
                  <Td>{new Date(order.created_at).toLocaleDateString('id-ID')}</Td>
                  <Td>
                    <button onClick={() => { setModal(order); setNewStatus(order.status); }} className="text-gray-400 hover:text-cream-700">
                      <Eye className="w-4 h-4" />
                    </button>
                  </Td>
                </Tr>
              ))}
            </Table>
            {total > limit && <Pagination limit={limit} offset={offset} total={total} onChange={setOffset} />}
          </>
        )}
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={`Pesanan #${modal?.id}`}
        footer={<>
          <Button variant="secondary" onClick={() => setModal(null)}>Tutup</Button>
          <Button onClick={updateStatus} disabled={saving}>{saving ? 'Menyimpan...' : 'Update Status'}</Button>
        </>}
      >
        {modal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Pelanggan:</span> <span className="font-medium">{modal.customer_name}</span></div>
              <div><span className="text-gray-500">Email:</span> {modal.customer_email}</div>
              <div><span className="text-gray-500">Total:</span> <span className="font-bold">Rp {(modal.final_price || 0).toLocaleString('id-ID')}</span></div>
              <div><span className="text-gray-500">Item:</span> {modal.items?.length || 0}</div>
            </div>
            <Select label="Update Status" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        )}
      </Modal>
    </div>
  );
}
