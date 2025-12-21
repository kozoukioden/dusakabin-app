"use client";

import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus } from '@/app/actions';
import { Order } from '@/lib/types';
import { ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { CabinVisual } from '@/components/CabinVisual';

export default function ProductionPage() {
    const [orders, setOrders] = useState<any[]>([]);

    const load = async () => {
        const data = await getOrders();
        setOrders(data.filter((o: any) => o.status !== 'installed'));
    };

    useEffect(() => {
        load();
    }, []);

    const handleUpdateStatus = async (id: string, status: string) => {
        const result = await updateOrderStatus(id, status);
        if (result && !result.success) {
            alert(result.error || 'İşlem başarısız oldu');
            return;
        }
        load();
    };

    const KanbanColumn = ({ title, status, items, actionLabel, nextStatus, color }: any) => {
        const [expanded, setExpanded] = useState<Record<string, boolean>>({});

        const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

        return (
            <div className="flex-1 min-w-[350px] bg-gray-100/50 rounded-2xl p-4">
                <h3 className={`font-bold mb-4 flex items-center gap-2 ${color}`}>
                    <div className={`w-3 h-3 rounded-full ${color.replace('text', 'bg')}`}></div>
                    {title} <span className="text-gray-400 text-xs ml-auto bg-gray-200 px-2 py-1 rounded-full">{items.length}</span>
                </h3>
                <div className="space-y-3">
                    {items.map((order: any) => (
                        <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-mono text-xs text-gray-400">#{order.id.substr(0, 8)}</span>
                                <span className="text-sm font-bold text-gray-800">{order.width} x {order.depth || order.width}</span>
                            </div>
                            <div className="font-bold text-gray-900 mb-1">{order.customerName}</div>
                            <div className="text-xs text-gray-500 mb-3 flex justify-between">
                                <span>{order.model} / {order.series}</span>
                                <button onClick={() => toggle(order.id)} className="text-blue-600 font-bold hover:underline">
                                    {expanded[order.id] ? 'Detayı Gizle' : 'Detayı Göster'}
                                </button>
                            </div>

                            {/* Master View: Cutting List & Visual */}
                            {expanded[order.id] && (
                                <div className="mt-4 mb-4 pt-4 border-t border-dashed bg-gray-50/50 -mx-4 px-4 pb-4">
                                    <div className="flex flex-col gap-4">
                                        {/* Visual */}
                                        <div className="flex justify-center bg-white p-2 rounded-lg border border-gray-100">
                                            <CabinVisual width={order.width} height={order.height} model={order.model} />
                                        </div>

                                        {/* Detailed Table */}
                                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                            <div className="p-2 bg-gray-100 border-b text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kesim Listesi</div>
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-gray-50 border-b">
                                                    <tr>
                                                        <th className="p-2 font-semibold text-gray-600">Parça Adı</th>
                                                        <th className="p-2 font-semibold text-gray-600">Ölçü</th>
                                                        <th className="p-2 font-semibold text-gray-600 text-right">Adet</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {order.items.map((item: any, idx: number) => (
                                                        <tr key={idx} className={item.type === 'glass' ? 'bg-blue-50/30' : ''}>
                                                            <td className="p-2 text-gray-800 font-medium">
                                                                {item.name}
                                                                {item.type === 'glass' && <span className="ml-1 text-[9px] bg-blue-100 text-blue-700 px-1 rounded">CAM</span>}
                                                            </td>
                                                            <td className="p-2 text-gray-600 font-mono">
                                                                {item.type === 'glass'
                                                                    ? `${item.w} x ${item.h}`
                                                                    : (item.val === '-' ? '-' : item.val)
                                                                }
                                                                <span className="text-[10px] text-gray-400 ml-0.5">{item.unit !== 'adet' && item.unit}</span>
                                                            </td>
                                                            <td className="p-2 font-bold text-gray-900 text-right">{item.qty}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {order.note && (
                                            <div className="p-3 bg-yellow-50 text-xs text-gray-800 rounded border border-yellow-200 shadow-sm">
                                                <div className="font-bold text-yellow-700 uppercase mb-1 text-[10px]">Usta İçin Not:</div>
                                                {order.note}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {nextStatus && (
                                <button
                                    onClick={() => handleUpdateStatus(order.id, nextStatus)}
                                    className="w-full py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                                >
                                    {actionLabel} <ArrowRight size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                    {items.length === 0 && <div className="text-center text-gray-400 text-xs py-10">Sipariş yok</div>}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">İmalat Hattı</h1>

            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-6 h-full pb-4">
                    <KanbanColumn
                        title="Bekleyen"
                        items={orders.filter(o => o.status === 'pending')}
                        actionLabel="Üretime Başla"
                        nextStatus="manufacturing"
                        color="text-yellow-600"
                    />
                    <KanbanColumn
                        title="İmalatta"
                        items={orders.filter(o => o.status === 'manufacturing')}
                        actionLabel="Tamamla"
                        nextStatus="ready"
                        color="text-orange-600"
                    />
                    <KanbanColumn
                        title="Hazır / Montaj Bekleyen"
                        items={orders.filter(o => o.status === 'ready')}
                        actionLabel="Teslim Et & Arşivle"
                        nextStatus="installed"
                        color="text-green-600"
                    />
                </div>
            </div>
        </div>
    );
}
