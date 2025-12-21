"use client";

import { useEffect, useState } from 'react';
import { getOrders } from '@/app/actions';
import { Search, CheckCircle } from 'lucide-react';

export default function HistoryPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        getOrders().then(data => {
            setOrders(data.filter((o: any) => o.status === 'installed'));
        });
    }, []);

    const exportToExcel = () => {
        const headers = ["ID", "Müşteri", "Tarih", "Model", "Seri", "Ölçü", "Fiyat"];
        if (!orders.length) return;

        const csvContent = [
            headers.join(";"),
            ...filtered.map(o => [
                o.id,
                o.customerName,
                new Date(o.createdAt).toLocaleDateString('tr-TR'),
                o.model,
                o.series,
                `${o.width}x${o.height}`,
                o.price || 0
            ].join(";"))
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Gecmis_Siparisler_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between print:hidden">
                <h1 className="text-2xl font-bold text-gray-800">Geçmiş Siparişler</h1>
                <div className="flex gap-2">
                    <button
                        onClick={exportToExcel}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition"
                    >
                        Excel'e Aktar
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-700 transition"
                    >
                        Yazdır (PDF)
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 print:hidden">
                <Search size={20} className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Geçmişte ara..."
                    className="flex-1 outline-none text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="bg-white border rounded-xl overflow-hidden print:border-none">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b print:bg-gray-200">
                        <tr>
                            <th className="p-4 font-bold text-gray-600">Müşteri</th>
                            <th className="p-4 font-bold text-gray-600">Tarih</th>
                            <th className="p-4 font-bold text-gray-600">Model</th>
                            <th className="p-4 font-bold text-gray-600 text-right">Ölçü</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50 transition">
                                <td className="p-4 font-bold text-gray-800">
                                    {order.customerName}
                                    <div className="text-xs text-gray-400 font-normal">#{order.id.substr(0, 8)}</div>
                                </td>
                                <td className="p-4 text-gray-600">
                                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                                </td>
                                <td className="p-4 text-gray-600 capitalize">
                                    {order.model}
                                    <div className="text-xs text-gray-400">{order.series}</div>
                                </td>
                                <td className="p-4 text-right font-mono font-bold text-gray-800">
                                    {order.width}x{order.height}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <div className="text-center text-gray-400 py-10">Kayıt yok.</div>}
            </div>

            {/* Print Header */}
            <div className="hidden print:block fixed bottom-4 right-4 text-xs text-gray-400">
                DuşakabinPro Geçmiş Raporu - {new Date().toLocaleDateString()}
            </div>
        </div>
    );
}
