import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";
import { Hammer, LayoutDashboard, Package, ShoppingCart } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DuşakabinPro v25",
  description: "Atölye ve Saha Takip Sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} min-h-screen flex bg-gray-50`}>
        <Sidebar />

        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Mobile Header */}
          <header className="md:hidden bg-white border-b px-4 py-3 flex justify-between items-center sticky top-0 z-20 shadow-sm">
            <div className="font-bold text-gray-800 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg text-white flex items-center justify-center font-bold">D</div>
              DuşakabinPro
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
            {children}
          </main>

          {/* Mobile Bottom Nav */}
          <nav className="md:hidden bg-white/90 backdrop-blur-md border-t fixed bottom-0 w-full flex justify-around py-3 pb-safe z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <Link href="/" className="flex flex-col items-center text-gray-400 hover:text-blue-600 active:text-blue-600">
              <LayoutDashboard size={20} />
              <span className="text-[10px] font-bold mt-1">Ana Sayfa</span>
            </Link>
            <Link href="/orders" className="flex flex-col items-center text-gray-400 hover:text-blue-600 active:text-blue-600">
              <ShoppingCart size={20} />
              <span className="text-[10px] font-bold mt-1">Sipariş</span>
            </Link>
            <Link href="/production" className="flex flex-col items-center text-gray-400 hover:text-blue-600 active:text-blue-600">
              <Hammer size={20} />
              <span className="text-[10px] font-bold mt-1">İmalat</span>
            </Link>
            <Link href="/inventory" className="flex flex-col items-center text-gray-400 hover:text-blue-600 active:text-blue-600">
              <Package size={20} />
              <span className="text-[10px] font-bold mt-1">Stok</span>
            </Link>
          </nav>
        </div>
      </body>
    </html>
  );
}
