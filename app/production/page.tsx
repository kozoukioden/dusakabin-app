"use client";

import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus } from '@/app/actions';
import { Order } from '@/lib/types';
import { ArrowRight, CheckCircle, Clock } from 'lucide-react';

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

                            {/* Master View: Cutting List */}
                            {expanded[order.id] && (
                                <div className="mt-4 mb-4 pt-3 border-t border-dashed">
                                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-2">Kesim Listesi</div>
                                    <div className="space-y-1">
                                        {order.items.map((item: any, idx: number) => (
                                            (item.type === 'profile' || item.type === 'glass') && (
                                                <div key={idx} className="flex justify-between text-xs">
                                                    <span className="text-gray-600 truncated max-w-[150px]">{item.name}</span>
                                                    <span className="font-mono font-bold text-gray-900">
                                                        {item.type === 'glass' ? `${item.w}x${item.h}` : item.val}
                                                        <span className="text-gray-400 font-normal ml-0.5">{item.unit}</span>
                                                        <span className="ml-2 text-gray-400">x{item.qty}</span>
                                                    </span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                    {order.note && (
                                        <div className="mt-3 p-2 bg-yellow-50 text-xs text-gray-700 rounded border border-yellow-100">
                                            <span className="font-bold">Not:</span> {order.note}
                                        </div>
                                    )}
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
