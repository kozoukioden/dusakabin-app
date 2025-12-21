"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SERIES, MODELS, PROFILE_COLORS } from '@/lib/constants';
import { calculateProductionDetails } from '@/lib/calculations';
import { createOrder } from '@/app/actions';
import { Order, ProductionItem, ModelType, ProfileSeries } from '@/lib/types';
import { Calculator, Save, AlertCircle, CheckCircle, Package, Settings } from 'lucide-react';
import clsx from 'clsx';

const Input = ({ label, ...props }: any) => (
    <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
        <input
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            {...props}
        />
    </div>
);

const Select = ({ label, options, ...props }: any) => (
    <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
        <select
            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            {...props}
        >
            {options.map((o: any) => (
                <option key={o.value || o.id || o} value={o.value || o.id || o}>
                    {o.label || o.name || o}
                </option>
            ))}
        </select>
    </div>
);

export function OrderForm({ users = [] }: { users?: any[] }) {
    const router = useRouter();
    const [formData, setFormData] = useState<Partial<Order>>({
        customerName: '',
        width: 0,
        height: 180,
        depth: 0,
        model: 'kose',
        series: 'superlux',
        material: 'cam',
        profileColor: 'Parlak',
        status: 'pending',
        note: '',
        assignedToId: '',
        price: 0,
        costMaterials: 0,
        costLabor: 0
    });

    const [calculatedItems, setCalculatedItems] = useState<ProductionItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-calculate when relevant fields change
    useEffect(() => {
        if (formData.width && formData.height && formData.model && formData.series) {
            const items = calculateProductionDetails(formData as Order);
            setCalculatedItems(items);
        }
    }, [formData.width, formData.height, formData.depth, formData.model, formData.series, formData.material, formData.profileColor]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.customerName) return alert('Müşteri adı zorunlu');

        setIsSubmitting(true);
        await createOrder(formData, calculatedItems);
        router.push('/orders');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* FORM */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Calculator size={24} /></div>
                    <h2 className="text-lg font-bold text-gray-800">Sipariş Bilgileri</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Müşteri Adı"
                        value={formData.customerName}
                        onChange={(e: any) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="Örn: Ahmet Yılmaz"
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Genişlik (cm)"
                            type="number"
                            value={formData.width || ''}
                            onChange={(e: any) => setFormData({ ...formData, width: Number(e.target.value) })}
                        />
                        <Input
                            label="Yükseklik (cm)"
                            type="number"
                            value={formData.height || ''}
                            onChange={(e: any) => setFormData({ ...formData, height: Number(e.target.value) })}
                        />
                    </div>

                    {(formData.model === 'kose' || formData.model === 'oval') && (
                        <Input
                            label="Derinlik (cm)"
                            type="number"
                            placeholder="Boş bırakılırsa kare (G=D)"
                            value={formData.depth || ''}
                            onChange={(e: any) => setFormData({ ...formData, depth: Number(e.target.value) })}
                        />
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Model"
                            value={formData.model}
                            onChange={(e: any) => setFormData({ ...formData, model: e.target.value as ModelType })}
                            options={MODELS}
                        />
                        <Select
                            label="Seri"
                            value={formData.series}
                            onChange={(e: any) => setFormData({ ...formData, series: e.target.value as ProfileSeries })}
                            options={SERIES}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Profil Rengi"
                            value={formData.profileColor}
                            onChange={(e: any) => setFormData({ ...formData, profileColor: e.target.value })}
                            options={PROFILE_COLORS}
                        />
                        <Select
                            label="Materyal (Cam/Pleksi)"
                            value={formData.material}
                            onChange={(e: any) => setFormData({ ...formData, material: e.target.value as any })}
                            options={[
                                { value: 'cam', label: 'Cam (Temperli)' },
                                { value: 'pleksi', label: 'Pleksi (Mika)' }
                            ]}
                        />
                    </div>

                    {/* Management & Finance Section */}
                    <div className="pt-4 border-t border-dashed space-y-4">
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 space-y-4">
                            <h3 className="font-bold text-gray-800 text-sm uppercase flex items-center gap-2">
                                <Settings size={16} /> Yönetim & Finans
                            </h3>

                            <Select
                                label="Siparişi Atayacağınız Usta"
                                value={formData.assignedToId || ''}
                                onChange={(e: any) => setFormData({ ...formData, assignedToId: e.target.value })}
                                options={[{ value: '', label: 'Seçiniz' }, ...users.map(u => ({ value: u.id, label: u.name }))]}
                            />

                            <div className="grid grid-cols-3 gap-2">
                                <Input
                                    label="Satış Fiyatı (TL)"
                                    type="number"
                                    value={formData.price || ''}
                                    onChange={(e: any) => setFormData({ ...formData, price: Number(e.target.value) })}
                                />
                                <Input
                                    label="Malzeme Mal. (TL)"
                                    type="number"
                                    value={formData.costMaterials || ''}
                                    onChange={(e: any) => setFormData({ ...formData, costMaterials: Number(e.target.value) })}
                                />
                                <Input
                                    label="İşçilik Mal. (TL)"
                                    type="number"
                                    value={formData.costLabor || ''}
                                    onChange={(e: any) => setFormData({ ...formData, costLabor: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sipariş Notu</label>
                            <textarea
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 text-sm"
                                placeholder="Örn: Kapıda ödeme alınacak, zile basma..."
                                value={formData.note || ''}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Kaydediliyor...' : <><Save size={20} /> Siparişi Kaydet</>}
                    </button>
                </form>
            </div>

            {/* PREVIEW */}
            <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                    <div className="p-2 bg-gray-800 rounded-lg"><Package size={24} /></div>
                    <div>
                        <h2 className="text-lg font-bold">Kesim Listesi</h2>
                        <p className="text-xs text-gray-400">Otomatik Hesaplanan Değerler</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                    {calculatedItems.length === 0 ? (
                        <div className="text-center text-gray-500 py-10 flex flex-col items-center">
                            <AlertCircle size={48} className="mb-2 opacity-50" />
                            <p>Ölçü girildiğinde liste oluşacaktır.</p>
                        </div>
                    ) : (
                        calculatedItems.map((item, idx) => (
                            <div key={idx} className="bg-gray-800/50 p-3 rounded-lg flex items-center justify-between border border-gray-700 hover:border-blue-500/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        "w-2 h-8 rounded-full",
                                        item.type === 'profile' ? "bg-blue-500" :
                                            item.type === 'glass' ? "bg-cyan-400" : "bg-purple-500"
                                    )}></div>
                                    <div>
                                        <h4 className="font-semibold text-sm">{item.name}</h4>
                                        <div className="text-xs text-gray-400">
                                            {item.type === 'glass'
                                                ? `${item.w} x ${item.h} ${item.unit}`
                                                : `${item.val !== '-' ? item.val + ' ' + item.unit : ''}`
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xl font-bold font-mono text-white bg-gray-800 px-3 py-1 rounded">
                                    {item.qty}<span className="text-xs text-gray-400 ml-1">ad.</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500 flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    Tüm kesim payları ve düşümler seriye göre ayarlandı.
                </div>
            </div>
        </div>
    );
}
