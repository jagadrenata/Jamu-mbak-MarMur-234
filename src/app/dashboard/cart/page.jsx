'use client';

import { useState, useEffect } from 'react';
import { cart } from '@/lib/api';
import { PageHeader, Card, Table, Tr, Td, Button, LoadingSpinner } from '@/components/ui';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    cart.list()
      .then(res => {
        if (active) {
          setItems(res.data || []);
          setSubtotal(res.subtotal || 0);
        }
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);

  function refresh() { setLoading(true); setReload(n => n + 1); }

  async function updateQty(id, qty) {
    if (qty < 1) return;
    await cart.update(id, qty);
    refresh();
  }

  async function removeItem(id) {
    await cart.remove(id);
    refresh();
  }

  async function clearCart() {
    if (!confirm('Kosongkan semua keranjang?')) return;
    await cart.clear();
    refresh();
  }

  return (
    <div>
      <PageHeader
        title="Keranjang Belanja"
        subtitle="Kelola item dalam keranjang Anda"
        action={items.length > 0 && <Button variant="danger" size="sm" onClick={clearCart}>Kosongkan</Button>}
      />
      <Card>
        {loading ? <LoadingSpinner /> : items.length === 0 ? (
          <div className="text-center text-gray-400 py-12">Keranjang kosong</div>
        ) : (
          <>
            <Table headers={['Produk', 'Varian', 'Harga', 'Jumlah', 'Subtotal', '']}>
              {items.map(item => (
                <Tr key={item.id}>
                  <Td>
                    <div className="font-medium">{item.variant?.product?.name}</div>
                    <div className="text-xs text-gray-400">{item.variant?.sku}</div>
                  </Td>
                  <Td>{item.variant?.name}</Td>
                  <Td>Rp {(item.variant?.price || 0).toLocaleString('id-ID')}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center bg-cream-200 rounded hover:bg-cream-300">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center bg-cream-200 rounded hover:bg-cream-300">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </Td>
                  <Td>Rp {((item.variant?.price || 0) * item.quantity).toLocaleString('id-ID')}</Td>
                  <Td>
                    <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Td>
                </Tr>
              ))}
            </Table>
            <div className="mt-6 flex justify-end">
              <div className="bg-cream-50 rounded p-4 min-w-48">
                <div className="flex justify-between font-bold text-gray-900 text-lg">
                  <span>Total</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <Button className="w-full mt-4">Checkout</Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
