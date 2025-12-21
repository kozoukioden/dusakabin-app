import { getOrders, getInventory } from './actions';
import { ShoppingCart, Hammer, AlertTriangle, TrendingUp, Package } from 'lucide-react';
import Link from 'next/link';

// Server Component
export default async function DashboardPage() {
  const orders = await getOrders();
  const inventory = await getInventory();

  const stats = {
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    productionOrders: orders.filter(o => o.status === 'manufacturing').length,
    totalOrders: orders.length,
    lowStock: inventory.filter(i => i.quantity < 10).length
  };

  const cards = [
    { label: 'Bekleyen Sipariş', val: stats.pendingOrders, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'İmalatta', val: stats.productionOrders, icon: Hammer, color: 'bg-orange-500' },
    { label: 'Toplam Kayıt', val: stats.totalOrders, icon: TrendingUp, color: 'bg-indigo-500' },
    { label: 'Kritik Stok', val: stats.lowStock, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  // Calculate Material Needs for Pending Orders
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const needs: Record<string, number> = {};

  pendingOrders.forEach(order => {
    order.items.forEach((item: any) => {
      if (item.type === 'profile' && item.stockName) {
        const len = parseFloat(item.val);
        if (!isNaN(len)) {
          const totalLen = len * item.qty;
          needs[item.stockName] = (needs[item.stockName] || 0) + totalLen;
        }
      }
    });
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 font-display">Genel Bakış</h1>
        <div className="text-sm text-gray-500">
          <strong>{stats.pendingOrders}</strong> Bekleyen Sipariş
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Reports */}
        <div className="lg:col-span-2 space-y-6">
          {/* Material Needs Report */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <Hammer size={20} className="text-orange-500" />
              Günlük Profil İhtiyacı <span className="text-xs font-normal text-gray-400 ml-auto">(Bekleyen Siparişler İçin)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(needs).length > 0 ? (
                Object.entries(needs).map(([name, totalCm]) => (
                  <div key={name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700 text-sm">{name}</span>
                    <span className="font-bold text-gray-900 font-mono text-sm">
                      {(totalCm / 100).toFixed(1)} m
                      <span className="text-xs text-gray-400 font-normal ml-1">({Math.ceil(totalCm / 600)} boy)</span>
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-gray-400 py-8 text-sm">Kesilecek parça yok.</div>
              )}
            </div>
          </div>

          {/* Usta İş Dağılımı (Pending) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <TrendingUp size={20} className="text-purple-500" />
              Usta İş Dağılımı <span className="text-xs font-normal text-gray-400 ml-auto">(Bekleyen)</span>
            </h3>
            <div className="space-y-3">
              {Object.entries(
                pendingOrders.reduce((acc: any, o) => {
                  const usta = o.assignedTo ? o.assignedTo.name : 'Atanmamış';
                  if (!acc[usta]) acc[usta] = { count: 0, revenue: 0, cost: 0 };
                  acc[usta].count += 1;
                  acc[usta].revenue += (o.price || 0);
                  acc[usta].cost += (o.costMaterials || 0) + (o.costLabor || 0);
                  return acc;
                }, {})
              ).map(([usta, data]: any) => (
                <div key={usta} className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700">{usta}</span>
                    <span className="bg-white px-2 py-0.5 rounded text-xs text-purple-600 font-bold border border-purple-100">{data.count} Sipariş</span>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-bold text-gray-800">Ciro: {data.revenue.toLocaleString('tr-TR')} ₺</div>
                    <div className="text-gray-500">Maliyet: {data.cost.toLocaleString('tr-TR')} ₺</div>
                  </div>
                </div>
              ))}
              {pendingOrders.length === 0 && <div className="text-center text-gray-400 text-sm">Bekleyen iş yok.</div>}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Package size={20} className="text-blue-600" />
            Hızlı İşlemler
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <Link href="/orders/new" className="p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition text-center font-bold text-sm flex items-center justify-center gap-2">
              <ShoppingCart size={20} />
              Yeni Sipariş Oluştur
            </Link>
            <Link href="/inventory" className="p-4 bg-teal-50 text-teal-700 rounded-xl hover:bg-teal-100 transition text-center font-bold text-sm flex items-center justify-center gap-2">
              <Package size={20} />
              Stok Yönetimi
            </Link>
            <Link href="/production" className="p-4 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition text-center font-bold text-sm flex items-center justify-center gap-2">
              <Hammer size={20} />
              İmalat Hattı
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="text-xs text-gray-400">
              <strong>Sistem Durumu:</strong> {inventory.length} stok kalemi, {orders.length} toplam sipariş.
              <br />
              Veritabanı: Aktif 🟢
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
