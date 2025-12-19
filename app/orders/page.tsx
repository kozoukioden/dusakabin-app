"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { Order } from '@/lib/types';
import Link from 'next/link';
import { Plus, Search, Trash2, Printer, Eye } from 'lucide-react';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState('');

    const loadOrders = () => {
        setOrders(db.getOrders().reverse()); // Newest first
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleDelete = (id: string) => {
        if (confirm('Siparişi silmek istediğinize emin misiniz?')) {
            db.deleteOrder(id);
            loadOrders();
        }
    };

    const filtered = orders.filter(o =>
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.id.includes(search)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Siparişler</h1>
                <Link href="/orders/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition">
                    <Plus size={18} />
                    Yeni Sipariş
                </Link>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <Search size={20} className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Müşteri adı veya Sipariş No ara..."
                    className="flex-1 outline-none text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-bold text-gray-500 uppercase text-xs">Sipariş No</th>
                                <th className="p-4 font-bold text-gray-500 uppercase text-xs">Müşteri</th>
                                <th className="p-4 font-bold text-gray-500 uppercase text-xs">Ölçü</th>
                                <th className="p-4 font-bold text-gray-500 uppercase text-xs">Model/Seri</th>
                                <th className="p-4 font-bold text-gray-500 uppercase text-xs">Durum</th>
                                <th className="p-4 font-bold text-gray-500 uppercase text-xs text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-400">Kayıt bulunamadı.</td></tr>
                            ) : filtered.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-4 font-mono text-gray-400">#{order.id}</td>
                                    <td className="p-4 font-bold text-gray-800">{order.customerName}</td>
                                    <td className="p-4 text-gray-600">{order.width}x{order.height}</td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900 capitalize">{order.model}</div>
                                        <div className="text-xs text-gray-400 capitalize">{order.series}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            order.status === 'manufacturing' ? 'bg-orange-100 text-orange-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                            {order.status === 'pending' ? 'Bekliyor' :
                                                order.status === 'manufacturing' ? 'İmalatta' : 'Tamamlandı'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/orders/${order.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Detaylar">
                                                <Eye size={18} />
                                            </Link>
                                            <button onClick={() => handleDelete(order.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Sil">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
