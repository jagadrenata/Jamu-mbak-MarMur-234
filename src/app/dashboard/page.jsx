'use client';

import { useState, useEffect } from 'react';
import { orders } from '@/lib/api';
import { PageHeader, Card, Table, Tr, Td, Badge, Select, LoadingSpinner, Pagination, statusBadge } from '@/components/ui';
import { Package } from 'lucide-react';

export default function OrdersPage() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  async function load() {
    setLoading(true);
    try {
      const params = { limit, offset };
      if (status) params.status = status;
      const res = await orders.list(params);
      setData(res.data || []);
      setTotal(res.total || 0);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [status, offset]);

  return (
    <div>
      <PageHeader title="Pesanan Saya" subtitle="Daftar semua pesanan Anda" />
      <Card>
        <div className="flex gap-4 mb-6">
          <Select value={status} onChange={e => { setStatus(e.target.value); setOffset(0); }}>
            <option value="">Semua Status</option>
            <option value="pending">Menunggu Pembayaran</option>
            <option value="paid">Dibayar</option>
            <option value="processing">Diproses</option>
            <option value="shipping">Dikirim</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </Select>
        </div>
        {loading ? <LoadingSpinner /> : (
          <>
            <Table headers={['ID Pesanan', 'Tanggal', 'Total', 'Status', 'Item']}>
              {data.length === 0 && (
                <tr><Td colSpan={5} className="text-center text-gray-400 py-8">Belum ada pesanan</Td></tr>
              )}
              {data.map(order => (
                <Tr key={order.id}>
                  <Td><span className="font-mono text-xs">{order.id}</span></Td>
                  <Td>{new Date(order.created_at).toLocaleDateString('id-ID')}</Td>
                  <Td>Rp {(order.final_price || 0).toLocaleString('id-ID')}</Td>
                  <Td>{statusBadge(order.status)}</Td>
                  <Td>{order.items?.length || 0} item</Td>
                </Tr>
              ))}
            </Table>
            {total > limit && (
              <Pagination limit={limit} offset={offset} total={total} onChange={setOffset} />
            )}
          </>
        )}
      </Card>
    </div>
  );
}
