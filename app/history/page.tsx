"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { Order } from '@/lib/types';
import { Search, CheckCircle } from 'lucide-react';

export default function HistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setOrders(db.getOrders().filter(o => o.status === 'installed').reverse());
    }, []);

    const filtered = orders.filter(o =>
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.id.includes(search)
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Geçmiş Siparişler</h1>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <Search size={20} className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Geçmişte ara..."
                    className="flex-1 outline-none text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                {filtered.map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between opacity-75 hover:opacity-100 transition">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-green-100 text-green-600 rounded-full"><CheckCircle size={20} /></div>
                            <div>
                                <div className="font-bold text-gray-800">{order.customerName}</div>
                                <div className="text-xs text-gray-500">#{order.id} • {new Date(order.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-gray-800">{order.width}x{order.height}</div>
                            <div className="text-xs text-gray-500 uppercase">{order.model}</div>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <div className="text-center text-gray-400 py-10">Kayıt yok.</div>}
            </div>
        </div>
    );
}
