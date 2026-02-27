'use client';

import { useState, useEffect } from 'react';
import { feedbacks } from '@/lib/api';
import { PageHeader, Card, Table, Tr, Td, Button, Select, LoadingSpinner, Pagination, Badge, Modal } from '@/components/ui';
import { Search, Trash2, Eye } from 'lucide-react';

export default function FeedbacksPage() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [reload, setReload] = useState(0);
  const limit = 15;

  useEffect(() => {
    let active = true;
    const params = { limit, offset };
    if (search) params.search = search;
    if (type) params.type = type;
    feedbacks.list(params)
      .then(res => {
        if (active) {
          setData(res.data || []);
          setTotal(res.total || 0);
        }
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search, type, offset, reload]);

  function refresh() { setLoading(true); setReload(n => n + 1); }

  async function remove(id) {
    if (!confirm('Hapus feedback ini?')) return;
    await feedbacks.delete(id);
    refresh();
  }

  return (
    <div>
      <PageHeader title="Feedback" subtitle="Kelola pesan dan keluhan pengguna" />
      <Card>
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cream-500"
              placeholder="Cari feedback..."
              value={search}
              onChange={e => { setSearch(e.target.value); setOffset(0); }}
            />
          </div>
          <Select value={type} onChange={e => { setType(e.target.value); setOffset(0); }}>
            <option value="">Semua Tipe</option>
            <option value="keluhan">Keluhan</option>
            <option value="saran">Saran</option>
            <option value="pertanyaan">Pertanyaan</option>
          </Select>
        </div>
        {loading ? <LoadingSpinner /> : (
          <>
            <Table headers={['Pengirim', 'Tipe', 'Pesan', 'Tanggal', '']}>
              {data.map(fb => (
                <Tr key={fb.id}>
                  <Td>
                    <div className="font-medium">{fb.name}</div>
                    <div className="text-xs text-gray-400">{fb.email}</div>
                  </Td>
                  <Td><Badge variant={fb.type === 'keluhan' ? 'danger' : fb.type === 'saran' ? 'info' : 'default'}>{fb.type}</Badge></Td>
                  <Td><span className="text-sm text-gray-600 line-clamp-1 max-w-xs">{fb.message}</span></Td>
                  <Td>{new Date(fb.created_at).toLocaleDateString('id-ID')}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <button onClick={() => setModal(fb)} className="text-gray-400 hover:text-cream-700"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => remove(fb.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>
            {total > limit && <Pagination limit={limit} offset={offset} total={total} onChange={setOffset} />}
          </>
        )}
      </Card>

      <Modal open={!!modal} onClose={() => setModal(null)} title="Detail Feedback" footer={<Button variant="secondary" onClick={() => setModal(null)}>Tutup</Button>}>
        {modal && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-gray-500">Nama:</span> <span className="font-medium">{modal.name}</span></div>
              <div><span className="text-gray-500">Email:</span> {modal.email}</div>
              <div><span className="text-gray-500">Telepon:</span> {modal.phone || '-'}</div>
              <div><span className="text-gray-500">Tipe:</span> <Badge>{modal.type}</Badge></div>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Pesan:</p>
              <p className="text-gray-900 p-3 bg-cream-50 rounded">{modal.message}</p>
            </div>
            {modal.screenshot_url && (
              <div>
                <p className="text-gray-500 mb-1">Screenshot:</p>
                <img src={modal.screenshot_url} alt="Screenshot" className="max-w-full rounded border border-gray-200" />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
