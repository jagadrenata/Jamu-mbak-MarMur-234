'use client';

import { useState, useEffect } from 'react';
import { inventoryLogs } from '@/lib/api';
import { PageHeader, Card, Table, Tr, Td, Button, Modal, Input, Select, Textarea, LoadingSpinner, Pagination, Badge } from '@/components/ui';
import { Plus } from 'lucide-react';

const emptyForm = { variant_id: '', change: '', type: 'restock', note: '', reference_id: '' };

export default function InventoryPage() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [type, setType] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const limit = 15;

  async function load() {
    setLoading(true);
    try {
      const params = { limit, offset };
      if (type) params.type = type;
      const res = await inventoryLogs.list(params);
      setData(res.data || []);
      setTotal(res.total || 0);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [type, offset]);

  async function save() {
    setSaving(true);
    try {
      await inventoryLogs.create({
        ...form,
        variant_id: Number(form.variant_id),
        change: Number(form.change),
        reference_id: form.reference_id || null,
      });
      setModal(false);
      setForm(emptyForm);
      load();
    } catch {}
    setSaving(false);
  }

  function setField(f, v) { setForm(p => ({ ...p, [f]: v })); }

  return (
    <div>
      <PageHeader
        title="Inventori"
        subtitle="Log perubahan stok produk"
        action={<Button onClick={() => setModal(true)}><Plus className="w-4 h-4 inline mr-1" />Log Manual</Button>}
      />
      <Card>
        <div className="flex gap-4 mb-6">
          <Select value={type} onChange={e => { setType(e.target.value); setOffset(0); }}>
            <option value="">Semua Tipe</option>
            <option value="sale">Penjualan</option>
            <option value="restock">Restock</option>
            <option value="adjustment">Penyesuaian</option>
            <option value="return">Return</option>
          </Select>
        </div>
        {loading ? <LoadingSpinner /> : (
          <>
            <Table headers={['Variant ID', 'Perubahan', 'Tipe', 'Catatan', 'Ref', 'Tanggal']}>
              {data.map(log => (
                <Tr key={log.id}>
                  <Td><span className="font-mono text-xs">{log.variant_id}</span></Td>
                  <Td>
                    <span className={`font-bold ${log.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {log.change > 0 ? '+' : ''}{log.change}
                    </span>
                  </Td>
                  <Td><Badge variant={log.type === 'restock' ? 'success' : log.type === 'sale' ? 'warning' : 'default'}>{log.type}</Badge></Td>
                  <Td>{log.note || '-'}</Td>
                  <Td><span className="font-mono text-xs text-gray-500">{log.reference_id || '-'}</span></Td>
                  <Td>{new Date(log.created_at).toLocaleDateString('id-ID')}</Td>
                </Tr>
              ))}
            </Table>
            {total > limit && <Pagination limit={limit} offset={offset} total={total} onChange={setOffset} />}
          </>
        )}
      </Card>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Tambah Log Inventori"
        footer={<>
          <Button variant="secondary" onClick={() => setModal(false)}>Batal</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </>}
      >
        <div className="space-y-4">
          <Input label="Variant ID" type="number" value={form.variant_id} onChange={e => setField('variant_id', e.target.value)} />
          <Input label="Perubahan Stok (negatif untuk pengurangan)" type="number" value={form.change} onChange={e => setField('change', e.target.value)} />
          <Select label="Tipe" value={form.type} onChange={e => setField('type', e.target.value)}>
            <option value="restock">Restock</option>
            <option value="adjustment">Penyesuaian</option>
            <option value="return">Return</option>
          </Select>
          <Textarea label="Catatan" value={form.note} onChange={e => setField('note', e.target.value)} />
          <Input label="Reference ID (opsional)" value={form.reference_id} onChange={e => setField('reference_id', e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
