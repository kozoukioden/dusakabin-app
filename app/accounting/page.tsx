"use client";

import { useEffect, useState } from 'react';
import { getOrders, getUsers } from '@/app/actions';
import { Settings, TrendingUp, TrendingDown, DollarSign, Calendar, User } from 'lucide-react';

export default function AccountingPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [filterUser, setFilterUser] = useState<string>('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const [ordersData, usersData] = await Promise.all([getOrders(), getUsers()]);
            setOrders(ordersData);
            setUsers(usersData);
            setLoading(false);
        };
        load();
    }, []);

    // Filter Logic
    const filteredOrders = orders.filter(o => {
        const dateMatch = o.createdAt.startsWith(filterMonth);
        const userMatch = filterUser ? o.assignedToId === filterUser : true;
        return dateMatch && userMatch;
    });

    // Calculations
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.price || 0), 0);
    const totalCostMat = filteredOrders.reduce((sum, o) => sum + (o.costMaterials || 0), 0);
    const totalCostLabor = filteredOrders.reduce((sum, o) => sum + (o.costLabor || 0), 0);
    const totalCost = totalCostMat + totalCostLabor;
    const totalProfit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <DollarSign className="text-green-600" />
                    Muhasebe ve Finans
                </h1>
                <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm">
                    Rapor Yazdır
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-end print:hidden">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dönem (Ay)</label>
                    <input
                        type="month"
                        className="w-full p-2 border rounded-lg"
                        value={filterMonth}
                        onChange={e => setFilterMonth(e.target.value)}
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Usta Filtresi</label>
                    <select
                        className="w-full p-2 border rounded-lg bg-white"
                        value={filterUser}
                        onChange={e => setFilterUser(e.target.value)}
                    >
                        <option value="">Tümü</option>
                        {users.filter(u => u.role === 'usta').map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">Toplam Ciro</div>
                    <div className="text-2xl font-bold text-gray-800">{totalRevenue.toLocaleString('tr-TR')} ₺</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">Toplam Stok Maliyeti</div>
                    <div className="text-2xl font-bold text-red-600">-{totalCostMat.toLocaleString('tr-TR')} ₺</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">Toplam İşçilik</div>
                    <div className="text-2xl font-bold text-red-600">-{totalCostLabor.toLocaleString('tr-TR')} ₺</div>
                </div>
                <div className={`p-5 rounded-xl shadow-sm border ${totalProfit >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className={`text-xs font-bold uppercase mb-1 ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>Net Kar</div>
                    <div className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {totalProfit > 0 ? '+' : ''}{totalProfit.toLocaleString('tr-TR')} ₺
                    </div>
                    <div className="text-xs font-mono mt-1 opacity-70">Marj: %{margin.toFixed(1)}</div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex justify-between">
                    <span>Sipariş Bazlı Detaylar</span>
                    <span className="text-sm font-normal text-gray-500">{filteredOrders.length} kayıt bulundu</span>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-3 font-semibold text-gray-600">Tarih</th>
                            <th className="p-3 font-semibold text-gray-600">Müşteri</th>
                            <th className="p-3 font-semibold text-gray-600">Usta</th>
                            <th className="p-3 font-semibold text-gray-600 text-right">Fiyat</th>
                            <th className="p-3 font-semibold text-gray-600 text-right">Maliyet</th>
                            <th className="p-3 font-semibold text-gray-600 text-right">Kar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => {
                                const cost = (order.costMaterials || 0) + (order.costLabor || 0);
                                const profit = (order.price || 0) - cost;
                                return (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="p-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</td>
                                        <td className="p-3 font-medium text-gray-800">{order.customerName}</td>
                                        <td className="p-3">
                                            {order.assignedTo ? (
                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{order.assignedTo.name}</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-right font-mono font-medium">{order.price?.toLocaleString('tr-TR')} ₺</td>
                                        <td className="p-3 text-right font-mono text-red-500">-{cost.toLocaleString('tr-TR')} ₺</td>
                                        <td className={`p-3 text-right font-bold font-mono ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {profit.toLocaleString('tr-TR')} ₺
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-400">Bu kriterlere uygun kayıt bulunamadı.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
