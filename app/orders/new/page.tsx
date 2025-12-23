import { OrderForm } from '@/components/OrderForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { getUsers, getProductionRules } from '@/app/actions';

export default async function NewOrderPage() {
    const users = await getUsers();
    const rules = await getProductionRules();

    // Filter out admins from assignment if needed, or allow all. Usually assign to roles 'usta'
    const ustaUsers = users.filter((u: any) => u.role === 'usta');

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <Link href="/orders" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm mb-4">
                    <ArrowLeft size={16} />
                    Siparişlere Dön
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Yeni Sipariş Oluştur</h1>
                <p className="text-gray-500">Müşteri bilgileri ve ölçüleri girerek kesim listesi oluşturun.</p>
            </div>

            <OrderForm users={ustaUsers} rules={rules} />
        </div>
    );
}
