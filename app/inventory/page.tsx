"use client";

import { useEffect, useState } from 'react';
import { getInventory, updateInventory, createInventoryItem, editInventoryItem, deleteInventoryItem } from '@/app/actions';
import { AlertCircle, Plus, Search, Pencil, Trash2, X } from 'lucide-react';

export default function InventoryPage() {
    const [items, setItems] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'aluminyum',
        quantity: 0,
        unit: 'adet'
    });
    const [loading, setLoading] = useState(false);

    const load = async () => {
        const data = await getInventory();
        setItems(data);
    };

    useEffect(() => {
        load();
    }, []);

    const handleUpdateQty = async (id: string, delta: number) => {
        await updateInventory(id, delta);
        load();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu stoğu silmek istediğinize emin misiniz?')) {
            await deleteInventoryItem(id);
            load();
        }
    };

    const openNewModal = () => {
        setEditingItem(null);
        setFormData({ name: '', category: 'aluminyum', quantity: 0, unit: 'adet' });
        setIsModalOpen(true);
    };

    const openEditModal = (item: any) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (editingItem) {
            await editInventoryItem(editingItem.id, formData);
        } else {
            await createInventoryItem(formData);
        }

        setLoading(false);
        setIsModalOpen(false);
        load();
    };

    const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

    // Group by category
    const categories: any = {
        aluminyum: filtered.filter(i => i.category === 'aluminyum'),
        cam: filtered.filter(i => i.category === 'cam'),
        aksesuar: filtered.filter(i => i.category === 'aksesuar'),
        pleksi: filtered.filter(i => i.category === 'pleksi')
    };

    const exportToExcel = () => {
        const headers = ["Kategori", "Ürün Adı", "Miktar", "Birim"];
        if (!items.length) return;

        const csvContent = [
            headers.join(";"),
            ...filtered.map(i => [
                i.category,
                i.name,
                i.quantity,
                i.unit
            ].join(";"))
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Stok_Raporu_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Stok Yönetimi</h1>
                <div className="flex gap-2">
                    <button
                        onClick={openNewModal}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                        <Plus size={18} />
                        Yeni Stok Ekle
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition"
                    >
                        Excel'e Aktar
                    </button>
                </div>
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

            {(Object.entries(categories) as [string, any[]][]).map(([cat, list]) => (
                list.length > 0 && (
                    <div key={cat} className="space-y-3">
                        <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider border-b pb-2">{cat} ({list.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {list.map(item => (
                                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 group relative">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-gray-800">{item.name}</div>
                                            <div className="text-xs text-gray-400 capitalize">{item.unit}</div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditModal(item)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-3 mt-1">
                                        <div className="text-xs text-gray-400">Miktar:</div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleUpdateQty(item.id, -1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600">-</button>
                                            <div className={`w-12 text-center font-bold ${item.quantity < 10 ? 'text-red-500' : 'text-gray-800'}`}>{item.quantity}</div>
                                            <button onClick={() => handleUpdateQty(item.id, 1)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center font-bold">+</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            ))}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold mb-6 text-gray-800">
                            {editingItem ? 'Stok Düzenle' : 'Yeni Stok Ekle'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                    <select
                                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="aluminyum">Alüminyum</option>
                                        <option value="cam">Cam</option>
                                        <option value="pleksi">Pleksi</option>
                                        <option value="aksesuar">Aksesuar</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Birim</label>
                                    <select
                                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    >
                                        <option value="adet">Adet</option>
                                        <option value="boy">Boy</option>
                                        <option value="takım">Takım</option>
                                        <option value="m">Metre</option>
                                        <option value="m2">m²</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Miktar</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Kaydediliyor...' : (editingItem ? 'Güncelle' : 'Oluştur')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
