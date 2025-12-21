"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Hammer, Package, History, Settings } from 'lucide-react';
import clsx from 'clsx';

const MENU = [
    { label: 'Ana Sayfa', icon: LayoutDashboard, href: '/' },
    { label: 'Siparişler', icon: ShoppingCart, href: '/orders' },
    { label: 'İmalat Hattı', icon: Hammer, href: '/production' },
    { label: 'Stok Yönetimi', icon: Package, href: '/inventory' },
    { label: 'Geçmiş', icon: History, href: '/history' },
];

import { LogOut } from 'lucide-react';
import { logout } from '@/app/actions';

// ... (MENU same as before)

export function Sidebar({ role }: { role: string }) {
    const pathname = usePathname();

    const filteredMenu = role === 'usta'
        ? MENU.filter(item => item.label === 'İmalat Hattı') // Usta only sees Production
        : MENU; // Admin sees all

    return (
        <aside className="w-64 bg-white border-r hidden md:flex flex-col shadow-lg z-10 h-screen sticky top-0">
            <div className="p-6 border-b flex items-center gap-3 bg-gray-50/50 backdrop-blur-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
                    D
                </div>
                <div>
                    <h1 className="font-bold text-gray-800 tracking-tight">DuşakabinPro</h1>
                    <p className="text-xs text-gray-500 font-medium capitalize">{role === 'usta' ? 'Usta Paneli' : 'Admin Paneli'}</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <div className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menü</div>
                {filteredMenu.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-medium group",
                                isActive
                                    ? "bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon size={20} className={clsx("transition-colors", isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t bg-gray-50/30">
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut size={18} />
                    <span>Çıkış Yap</span>
                </button>
            </div>
        </aside>
    );
}
