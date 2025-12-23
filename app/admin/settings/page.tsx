"use client";

import { useState, useEffect } from 'react';
import { getProductionRules, createProductionRule, updateProductionRule, deleteProductionRule } from '@/app/actions';
import { Plus, Trash2, Save, X, Edit, FlaskConical, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<any>(null);

    // Test Calculator State
    const [testW, setTestW] = useState(100);
    const [testH, setTestH] = useState(180);
    const [testResult, setTestResult] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        series: 'bella',
        material: '',
        model: '',
        componentName: '',
        formula: 'W - 9',
        quantity: 2,
        type: 'profile',
        stockName: '',
        displayOrder: 0
    });

    const load = async () => {
        setLoading(true);
        const data = await getProductionRules();
        setRules(data);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const openNew = () => {
        setEditingRule(null);
        setFormData({
            series: 'bella',
            material: '',
            model: '',
            componentName: '',
            formula: 'W - 9',
            quantity: 2,
            type: 'profile',
            stockName: '',
            displayOrder: rules.length + 1
        });
        setIsModalOpen(true);
    };

    const openEdit = (rule: any) => {
        setEditingRule(rule);
        setFormData({
            series: rule.series,
            material: rule.material || '',
            model: rule.model || '',
            componentName: rule.componentName,
            formula: rule.formula,
            quantity: rule.quantity,
            type: rule.type,
            stockName: rule.stockName || '',
            displayOrder: rule.displayOrder
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu kuralı silmek istediğinize emin misiniz?')) {
            await deleteProductionRule(id);
            load();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...formData,
            quantity: Number(formData.quantity),
            displayOrder: Number(formData.displayOrder),
            material: formData.material || null,
            model: formData.model || null,
            stockName: formData.stockName || null
        };

        if (editingRule) {
            await updateProductionRule(editingRule.id, data);
        } else {
            await createProductionRule(data);
        }
        setIsModalOpen(false);
        load();
    };

    const testFormula = (formula: string) => {
        try {
            // Replicate safeEval logic for client-side preview
            const ROUND = (n: number) => Math.round(n);
            const ROUND5 = (n: number) => Math.round(n / 5) * 5;

            const expr = formula.toUpperCase()
                .replace(/W/g, String(testW))
                .replace(/H/g, String(testH))
                .replace(/D/g, String(testW)); // Assume square for test

            const func = new Function('W', 'H', 'D', 'ROUND', 'ROUND5', 'return ' + formula);
            const res = func(testW, testH, testW, ROUND, ROUND5);
            return typeof res === 'number' && !isNaN(res) ? res : 'Hata';
        } catch (e) {
            return 'Hata';
        }
    };

    // Grouping
    const grouped: any = {};
    rules.forEach(r => {
        if (!grouped[r.series]) grouped[r.series] = [];
        grouped[r.series].push(r);
    });

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Link href="/orders" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm mb-2">
                        <ArrowLeft size={16} />
                        Ana Menüye Dön
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800">İmalat Ayarları</h1>
                    <p className="text-gray-500">Kesim formüllerini ve parça tanımlarını buradan yönetebilirsiniz.</p>
                </div>
                <button onClick={openNew} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
                    <Plus size={20} /> Yeni Kural Ekle
                </button>
            </div>

            {/* Test Calculator */}
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl mb-8 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex items-center gap-4 text-indigo-800 font-bold mb-2 md:mb-0">
                    <FlaskConical size={24} />
                    <span className="text-lg">Formül Testi</span>
                </div>
                <div className="flex gap-4 items-center">
                    <div>
                        <span className="text-xs font-bold text-indigo-400 block">GENİŞLİK (W)</span>
                        <input type="number" value={testW} onChange={e => setTestW(Number(e.target.value))} className="w-20 p-2 rounded border border-indigo-200" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-indigo-400 block">YÜKSEKLİK (H)</span>
                        <input type="number" value={testH} onChange={e => setTestH(Number(e.target.value))} className="w-20 p-2 rounded border border-indigo-200" />
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {(Object.entries(grouped) as [string, any[]][]).map(([series, list]) => (
                    <div key={series} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg capitalize text-gray-800">{series === 'all' ? 'Genel (Tüm Seriler)' : series + ' Serisi'}</h3>
                            <span className="text-xs font-bold text-gray-400 bg-gray-200 px-2 py-1 rounded">{list.length} Kural</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3">Parça Adı</th>
                                        <th className="px-6 py-3">Tip</th>
                                        <th className="px-6 py-3">Formül</th>
                                        <th className="px-6 py-3">Test Sonucu (W:{testW}, H:{testH})</th>
                                        <th className="px-6 py-3">Adet</th>
                                        <th className="px-6 py-3">Stok Adı</th>
                                        <th className="px-6 py-3 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {list.sort((a, b) => a.displayOrder - b.displayOrder).map(rule => (
                                        <tr key={rule.id} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-gray-800">{rule.componentName}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${rule.type === 'profile' ? 'bg-blue-100 text-blue-600' :
                                                    rule.type === 'glass' ? 'bg-cyan-100 text-cyan-600' : 'bg-purple-100 text-purple-600'
                                                    }`}>
                                                    {rule.type === 'profile' ? 'Profil' : rule.type === 'glass' ? 'Cam' : 'Aksesuar'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs bg-gray-50 rounded text-gray-600 border border-gray-200 inline-block mt-2 mb-2 w-fit px-2">
                                                {rule.formula}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-800">
                                                {testFormula(rule.formula)}
                                            </td>
                                            <td className="px-6 py-4">{rule.quantity}</td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">{rule.stockName || '-'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEdit(rule)} className="p-2 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-lg">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(rule.id)} className="p-2 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-lg">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 text-gray-800">
                            {editingRule ? 'Kuralı Düzenle' : 'Yeni İmalat Kuralı'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Seri</label>
                                    <select
                                        className="w-full border rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.series}
                                        onChange={e => setFormData({ ...formData, series: e.target.value })}
                                    >
                                        <option value="all">Tümü (Genel)</option>
                                        <option value="bella">Bella</option>
                                        <option value="superlux">Süperlüx</option>
                                        <option value="liverno">Liverno</option>
                                        <option value="pratiko">Pratiko</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Tip</label>
                                    <select
                                        className="w-full border rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="profile">Profil</option>
                                        <option value="glass">Cam</option>
                                        <option value="accessory">Aksesuar</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Parça Adı (Kesim Listesinde Görünür)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.componentName}
                                    onChange={e => setFormData({ ...formData, componentName: e.target.value })}
                                    placeholder="Örn: Erkek Ray (Alt/Üst)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Formül</label>
                                <div className="flex gap-2 mb-2">
                                    <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">W = En</div>
                                    <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">H = Boy</div>
                                    <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">D = Derinlik</div>
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded-lg p-3 font-mono bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.formula}
                                    onChange={e => setFormData({ ...formData, formula: e.target.value })}
                                    placeholder="Örn: W - 9"
                                />
                                <div className="text-xs text-green-600 mt-2 font-bold">
                                    Önizleme ({testW}x{testH}): {testFormula(formData.formula)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Adet</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Sıralama (Opsiyonel)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.displayOrder}
                                        onChange={e => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Stok Eşleşmesi (Opsiyonel)</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.stockName}
                                    onChange={e => setFormData({ ...formData, stockName: e.target.value })}
                                    placeholder="Stoktan düşülecek ana ürün adı"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Sadece Bu Materyal</label>
                                    <select
                                        className="w-full border rounded-lg p-2 text-sm"
                                        value={formData.material}
                                        onChange={e => setFormData({ ...formData, material: e.target.value })}
                                    >
                                        <option value="">Hepsi</option>
                                        <option value="pleksi">Pleksi</option>
                                        <option value="cam">Cam</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Sadece Bu Model</label>
                                    <select
                                        className="w-full border rounded-lg p-2 text-sm"
                                        value={formData.model}
                                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                                    >
                                        <option value="">Hepsi</option>
                                        <option value="kose">Köşe</option>
                                        <option value="oval">Oval</option>
                                        <option value="duz_1s1c">İki Duvar Arası (1S1Ç)</option>
                                        <option value="duz_2s2c">İki Duvar Arası (2S2Ç)</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-xl"
                            >
                                {editingRule ? 'Değişiklikleri Kaydet' : 'Kuralı Oluştur'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
