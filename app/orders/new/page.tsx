import { OrderForm } from '@/components/OrderForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewOrderPage() {
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

            <OrderForm />
        </div>
    );
}
