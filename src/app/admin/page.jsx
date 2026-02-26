'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Users, ShoppingCart, Package, TrendingUp, ArrowUp, ArrowDown, Eye, Clock } from 'lucide-react';
import { adminOrders, adminUsers, products, feedbacks } from '@/lib/api';
import { LoadingSpinner, Card } from '@/components/ui';

const COLORS = ['#64748b', '#c2b18f', '#8b5e3c', '#10b981'];

const visitorData = [
  { name: 'Sen', visitors: 1200 }, { name: 'Sel', visitors: 1900 },
  { name: 'Rab', visitors: 1500 }, { name: 'Kam', visitors: 2200 },
  { name: 'Jum', visitors: 2800 }, { name: 'Sab', visitors: 2400 },
  { name: 'Min', visitors: 1800 },
];

const salesData = [
  { name: 'Jan', sales: 4000000 }, { name: 'Feb', sales: 3200000 },
  { name: 'Mar', sales: 5100000 }, { name: 'Apr', sales: 4700000 },
  { name: 'Mei', sales: 6300000 }, { name: 'Jun', sales: 5900000 },
];

const trafficData = [
  { name: 'Direct', value: 400 }, { name: 'Search', value: 300 },
  { name: 'Social', value: 200 }, { name: 'Referral', value: 100 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  async function load() {
    setLoading(true);
    try {
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        adminOrders.list({ limit: 5 }),
        adminUsers.list({ limit: 1 }),
        products.list({ limit: 1 }),
      ]);
      setStats({
        orders: ordersRes.total || 0,
        users: usersRes.total || 0,
        products: productsRes.total || 0,
        recentOrders: ordersRes.data || [],
      });
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const statCards = stats ? [
    { title: 'Total Pesanan', value: stats.orders.toLocaleString(), change: '+12.5%', pos: true, icon: ShoppingCart },
    { title: 'Total Pengguna', value: stats.users.toLocaleString(), change: '+8.2%', pos: true, icon: Users },
    { title: 'Total Produk', value: stats.products.toLocaleString(), change: '+5.1%', pos: true, icon: Package },
    { title: 'Avg. Reading Time', value: '3.5 min', change: '-2.3%', pos: false, icon: Clock },
  ] : [];

  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  function generateCalendar() {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`e${i}`} />);
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      days.push(
        <div key={d} className={`p-2 text-center rounded text-sm cursor-pointer transition-colors ${isToday ? 'bg-cream-700 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
          {d}
        </div>
      );
    }
    return days;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang kembali! Berikut ringkasan data Anda.</p>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-cream-100 rounded shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-cream-700 p-3 rounded">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`flex items-center text-sm font-medium ${s.pos ? 'text-green-600' : 'text-red-600'}`}>
                      {s.pos ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      {s.change}
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium">{s.title}</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-cream-100 rounded shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Statistik Pengunjung</h2>
                <select className="px-4 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cream-500">
                  <option>7 Hari Terakhir</option>
                  <option>30 Hari Terakhir</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={visitorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="visitors" stroke="#ab9f85" strokeWidth={3} dot={{ fill: '#c5b79d', r: 5 }} activeDot={{ r: 7 }} name="Pengunjung" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-cream-100 rounded shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Kalender</h2>
              </div>
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded transition-colors">←</button>
                <span className="font-semibold text-gray-900 text-sm">{monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</span>
                <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))} className="p-2 hover:bg-gray-100 rounded transition-colors">→</button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs mb-2">
                {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => (
                  <div key={d} className="text-center font-semibold text-gray-600 p-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-sm">{generateCalendar()}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-cream-100 rounded shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Penjualan (6 Bulan Terakhir)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={v => `${(v/1000000).toFixed(1)}jt`} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} formatter={v => `Rp ${v.toLocaleString('id-ID')}`} />
                  <Legend />
                  <Bar dataKey="sales" fill="#c5b79d" radius={[4, 4, 0, 0]} name="Penjualan" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-cream-100 rounded shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Sumber Traffic</h2>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={trafficData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">
                    {trafficData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {trafficData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-cream-100 rounded shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Pesanan Terbaru</h2>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {stats?.recentOrders?.map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 hover:bg-cream-200 rounded transition-colors">
                  <div>
                    <p className="font-medium text-gray-900 font-mono text-sm">{order.id}</p>
                    <p className="text-sm text-gray-500">{order.customer_name} • {new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">Rp {(order.final_price || 0).toLocaleString('id-ID')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                      {order.status_label || order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
