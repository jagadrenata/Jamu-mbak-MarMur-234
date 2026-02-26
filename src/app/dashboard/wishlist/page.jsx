'use client';

import { useState, useEffect } from 'react';
import { wishlist } from '../../../lib/api';
import { PageHeader, Card, LoadingSpinner, Button } from '../../../components/ui';
import { Heart, Trash2 } from 'lucide-react';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await wishlist.list();
      setItems(res.data || []);
    } catch {}
    setLoading(false);
  }

  async function remove(productId) {
    await wishlist.remove(productId);
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <PageHeader title="Wishlist" subtitle="Produk yang Anda simpan" />
      {loading ? <LoadingSpinner /> : items.length === 0 ? (
        <Card><div className="text-center text-gray-400 py-12">Wishlist kosong</div></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map(item => (
            <div key={item.product_id} className="bg-cream-100 rounded shadow-sm overflow-hidden">
              {item.product?.primary_image && (
                <img src={item.product.primary_image} alt={item.product.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{item.product?.name}</h3>
                <p className="text-cream-700 font-bold mt-1">
                  Rp {(item.product?.min_price || 0).toLocaleString('id-ID')}
                  {item.product?.max_price !== item.product?.min_price && ` – Rp ${(item.product?.max_price || 0).toLocaleString('id-ID')}`}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="flex-1">Beli Sekarang</Button>
                  <button onClick={() => remove(item.product_id)} className="p-2 text-red-400 hover:text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
