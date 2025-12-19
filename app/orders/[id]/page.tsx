"use client";

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { getOrder } from '@/app/actions';
import { ArrowLeft, Printer, Box } from 'lucide-react';
import Link from 'next/link';
import { CabinVisual } from '@/components/CabinVisual';

export default function OrderDetailPage() {
    const { id } = useParams() as { id: string };
    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        getOrder(id).then(data => {
            if (data) setOrder(data);
        });
    }, [id]);

    if (!order) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between print:hidden">
                <Link href="/orders" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm">
                    <ArrowLeft size={16} />
                    Listeye Dön
                </Link>
                <button
                    onClick={() => window.print()}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-700 transition"
                >
                    <Printer size={18} />
                    Yazdır / PDF
                </button>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-6 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">{order.customerName}</h1>
                        <div className="text-sm text-gray-500">Sipariş No: #{order.id.substr(0, 8)}</div>
                        <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString("tr-TR", { dateStyle: 'full', timeStyle: 'short' })}</div>
                    </div>
                    <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                order.status === 'manufacturing' ? 'bg-orange-100 text-orange-700' :
                                    'bg-green-100 text-green-700'
                            }`}>
                            {order.status === 'pending' ? 'Bekliyor' :
                                order.status === 'manufacturing' ? 'İmalatta' : 'Tamamlandı'}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Visual */}
                    <div className="w-full md:w-1/3">
                        <CabinVisual width={order.width} height={order.height} model={order.model} />
                    </div>

                    {/* Config & Dimensions */}
                    <div className="flex-1">
                        <div className="grid grid-cols-2 gap-6 mb-8 bg-gray-50 p-4 rounded-xl print:bg-transparent print:p-0">
                            <div>
                                <div className="text-xs text-gray-400 uppercase font-bold">Ölçüler (En x Boy)</div>
                                <div className="font-bold text-lg">{order.width} x {order.height}</div>
                                {order.depth && <div className="text-xs text-gray-500">Derinlik: {order.depth}</div>}
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 uppercase font-bold">Model</div>
                                <div className="font-bold capitalize">{order.model}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 uppercase font-bold">Seri & Renk</div>
                                <div className="font-bold capitalize">{order.series}</div>
                                <div className="text-sm text-gray-600">{order.profileColor}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 uppercase font-bold">Materyal</div>
                                <div className="font-bold capitalize">{order.material}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cutting List */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                        <Box size={20} className="text-blue-600" />
                        İmalat Fişi / Kesim Listesi
                    </h3>

                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 print:bg-gray-100">
                            <tr>
                                <th className="p-3 font-bold text-gray-600">Parça / Malzeme Adı</th>
                                <th className="p-3 font-bold text-gray-600">Kesim Ölçüsü</th>
                                <th className="p-3 font-bold text-gray-600 text-right">Adet</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {order.items?.map((item: any, idx: number) => (
                                <tr key={idx} className={item.type === 'glass' ? 'bg-blue-50/50 print:bg-transparent' : ''}>
                                    <td className="p-3 font-medium text-gray-900">
                                        {item.name}
                                        {item.type === 'glass' && <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded uppercase font-bold print:border print:border-gray-300">Cam</span>}
                                    </td>
                                    <td className="p-3 text-gray-600 font-mono">
                                        {item.type === 'glass'
                                            ? `${item.w} x ${item.h} ${item.unit}`
                                            : (item.val === '-' ? '-' : `${item.val} ${item.unit}`)
                                        }
                                    </td>
                                    <td className="p-3 font-bold text-gray-900 text-right">{item.qty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-12 pt-8 border-t text-xs text-gray-400 flex justify-between print:flex print:mt-auto">
                    <div>
                        DuşakabinPro v25 İmalat Sistemi
                        <br />
                        <span className="print:hidden">Bilgi: Fişi yazdırmak için yukarıdaki butonu kullanın.</span>
                    </div>
                    <div>{new Date().toLocaleString()}</div>
                </div>
            </div>
        </div>
    );
}
