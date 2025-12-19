"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { Order, InventoryItem } from '@/lib/types';
import { ShoppingCart, Hammer, AlertTriangle, TrendingUp, Package } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    pendingOrders: 0,
    productionOrders: 0,
    totalOrders: 0,
    lowStock: 0
  });

  useEffect(() => {
    // Init DB if empty
    db.init();

    const orders = db.getOrders();
    const inventory = db.getInventory();

    setStats({
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      productionOrders: orders.filter(o => o.status === 'manufacturing').length,
      totalOrders: orders.length,
      lowStock: inventory.filter(i => i.quantity < 10).length
    });
  }, []);

  const cards = [
    { label: 'Bekleyen Sipariş', val: stats.pendingOrders, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'İmalatta', val: stats.productionOrders, icon: Hammer, color: 'bg-orange-500' },
    { label: 'Toplam Kayıt', val: stats.totalOrders, icon: TrendingUp, color: 'bg-indigo-500' },
    { label: 'Kritik Stok', val: stats.lowStock, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 font-display">Genel Bakış</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${c.color}`}>
              <c.icon size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{c.val}</div>
              <div className="text-xs text-gray-500 uppercase font-bold tracking-wide">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Package size={20} className="text-blue-600" />
            Hızlı İşlemler
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/orders/new" className="p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition text-center font-bold text-sm flex flex-col items-center gap-2">
              <ShoppingCart size={24} />
              Yeni Sipariş
            </Link>
            <Link href="/inventory" className="p-4 bg-teal-50 text-teal-700 rounded-xl hover:bg-teal-100 transition text-center font-bold text-sm flex flex-col items-center gap-2">
              <Package size={24} />
              Stok Ekle
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg text-white">
          <h3 className="font-bold text-lg mb-2">DuşakabinPro'ya Hoşgeldiniz</h3>
          <p className="text-gray-400 text-sm mb-4">
            v25 Sürümü. Tüm verileriniz yerel bilgisayarınızda güvenle saklanmaktadır.
            İmalat takibi ve kesim listeleri için "Sipariş" menüsünü kullanabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
