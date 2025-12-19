"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { InventoryItem } from '@/lib/types';
import { AlertCircle, Plus, Search } from 'lucide-react';

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        db.init(); // ensure seed
        setItems(db.getInventory());
    }, []);

    const updateQty = (id: string, delta: number) => {
        db.updateInventory(id, delta);
        setItems(db.getInventory());
    };

    const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

    // Group by category
    const categories = {
        aluminyum: filtered.filter(i => i.category === 'aluminyum'),
        cam: filtered.filter(i => i.category === 'cam'),
        aksesuar: filtered.filter(i => i.category === 'aksesuar'),
        pleksi: filtered.filter(i => i.category === 'pleksi' as any)
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Stok Yönetimi</h1>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <Search size={20} className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Stok ara..."
                    className="flex-1 outline-none text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {Object.entries(categories).map(([cat, list]) => (
                list.length > 0 && (
                    <div key={cat} className="space-y-3">
                        <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider border-b pb-2">{cat} ({list.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {list.map(item => (
                                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-gray-800">{item.name}</div>
                                        <div className="text-xs text-gray-400">{item.unit}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600">-</button>
                                        <div className={`w-12 text-center font-bold ${item.quantity < 10 ? 'text-red-500' : 'text-gray-800'}`}>{item.quantity}</div>
                                        <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center font-bold">+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            ))}
        </div>
    );
}
