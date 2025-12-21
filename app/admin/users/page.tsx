"use client";

import { useEffect, useState } from 'react';
import { getUsers, createUser, deleteUser, updateUser } from '@/app/actions';
import { Trash2, UserPlus, Shield, User as UserIcon, Loader2, Pencil, X } from 'lucide-react';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        role: 'usta'
    });

    const loadUsers = async () => {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const resetForm = () => {
        setFormData({ username: '', password: '', name: '', role: 'usta' });
        setEditingId(null);
        setShowModal(false);
    };

    const handleEdit = (user: any) => {
        setFormData({
            username: user.username,
            password: '', // Password hidden/optional for edit
            name: user.name,
            role: user.role
        });
        setEditingId(user.id);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let res;
        if (editingId) {
            res = await updateUser(editingId, formData);
        } else {
            res = await createUser(formData);
        }

        if (res.success) {
            resetForm();
            loadUsers();
        } else {
            alert(res.error || 'Hata oluştu');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
            await deleteUser(id);
            loadUsers();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Kullanıcı Yönetimi</h1>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                    <UserPlus size={20} />
                    Yeni Kullanıcı
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-bold text-gray-600">Ad Soyad</th>
                            <th className="p-4 font-bold text-gray-600">Kullanıcı Adı</th>
                            <th className="p-4 font-bold text-gray-600">Rol</th>
                            <th className="p-4 font-bold text-gray-600">Kayıt Tarihi</th>
                            <th className="p-4 font-bold text-gray-600 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 transition">
                                <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {user.role === 'admin' ? <Shield size={20} /> : <UserIcon size={20} />}
                                    </div>
                                    {user.name}
                                </td>
                                <td className="p-4 text-gray-600 font-mono text-sm">{user.username}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-500 text-sm">{new Date(user.createdAt).toLocaleDateString("tr-TR")}</td>
                                <td className="p-4 text-right flex gap-2 justify-end">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="text-blue-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                                        title="Düzenle"
                                    >
                                        <Pencil size={18} />
                                    </button>

                                    {user.username !== 'admin' && (
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                                            title="Sil"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <div className="p-8 text-center flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                        <button onClick={resetForm} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>

                        <h2 className="text-xl font-bold text-gray-800 mb-6">{editingId ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ad Soyad</label>
                                <input
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kullanıcı Adı</label>
                                <input
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    disabled={editingId ? true : false} // Username usually shouldn't change or safe to allow? Better safe lock it or allow. Let's allow but for admin maybe caution. I'll NOT disable it for now, unless unique constraint hits.
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Şifre {editingId && <span className="font-normal normal-case text-gray-400">(Boş bırakılırsa değişmez)</span>}</label>
                                <input
                                    required={!editingId} // Required only for new
                                    type="password"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={editingId ? "********" : ""}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rol</label>
                                <select
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="usta">Usta</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t">
                                <button type="button" onClick={resetForm} className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">İptal</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                                    {editingId ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
