import { Order, InventoryItem, ProductionItem } from './types';

const DB_KEYS = {
    ORDERS: 'dusakabin_orders',
    INVENTORY: 'dusakabin_inventory',
};

// Seed Data
const seedInventory = (): InventoryItem[] => {
    const items: InventoryItem[] = [];
    const colors = ['Parlak', 'Antrasit'];

    // Aluminum Profiles
    // Note: Rails are 'Boy', others might be 'Adet' if pre-cut, but usually raw stock is 'Boy'. 
    // Owner request: "count profiles (excluding rails) as pieces". 
    // This implies we stock them as "Pieces" (e.g. wall profiles come in set lengths?).
    // For now, let's keep vertical profiles as 'Boy' in stock (standard length), 
    // but we can deduct 1 'Boy' per 2 pieces if they fit? 
    // Simplicity: Stock everything as 'Boy', 1 unit = 1 full profile (6m).

    const profiles = [
        { name: 'Süperlüx Ray', cat: 'aluminyum' },
        { name: 'Süperlüx Duvar Dikmesi', cat: 'aluminyum' },
        { name: 'Liverno Ray', cat: 'aluminyum' },
        { name: 'Bella Dikme', cat: 'pleksi' },
        { name: 'Dişi Profil', cat: 'pleksi' }, // Added for Pleksi
        { name: 'Duvar Dikmesi (U)', cat: 'pleksi' } // Added for Pleksi
    ];

    profiles.forEach(p => {
        colors.forEach(c => {
            items.push({
                id: Math.random().toString(36).substr(2, 9),
                name: `${p.name} (${c})`,
                category: p.cat as any,
                quantity: 50,
                unit: 'boy',
            });
        });
    });

    // Glass (5cm steps from 10 to 85)
    for (let i = 10; i <= 85; i += 5) {
        items.push({
            id: Math.random().toString(36).substr(2, 9),
            name: `Sabit Cam ${i}cm`,
            category: 'cam',
            quantity: 10,
            unit: 'adet' // Glass is piece
        });
    }

    // Accessories
    ['Rulman Seti', 'Kulp Takımı', 'Mıknatıs Suluk'].forEach(acc => {
        items.push({
            id: Math.random().toString(36).substr(2, 9),
            name: acc,
            category: 'aksesuar',
            quantity: 100,
            unit: 'adet'
        });
    });

    return items;
};

export const db = {
    getOrders: (): Order[] => {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(DB_KEYS.ORDERS);
        return data ? JSON.parse(data) : [];
    },

    saveOrder: (order: Order) => {
        const orders = db.getOrders();
        orders.push(order);
        localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
        return order;
    },

    updateOrder: (id: string, updates: Partial<Order>) => {
        const orders = db.getOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index > -1) {
            const oldStatus = orders[index].status;
            const newStatus = updates.status;

            // Logic: If moving from Pending -> Manufacturing, Deduct Stock?
            // Or manually? Let's do it when moving to Manufacturing.
            if (oldStatus === 'pending' && newStatus === 'manufacturing') {
                db.deductStockForOrder(orders[index]);
            }

            orders[index] = { ...orders[index], ...updates };
            localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
        }
    },

    deleteOrder: (id: string) => {
        const orders = db.getOrders();
        const newOrders = orders.filter(o => o.id !== id);
        localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(newOrders));
    },

    getInventory: (): InventoryItem[] => {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(DB_KEYS.INVENTORY);
        if (!data) {
            const initial = seedInventory();
            localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(initial));
            return initial;
        }
        return JSON.parse(data);
    },

    updateInventory: (id: string, qtyDelta: number) => {
        const items = db.getInventory();
        const idx = items.findIndex(i => i.id === id);
        if (idx > -1) {
            items[idx].quantity += qtyDelta;
            localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(items));
        }
    },

    deductStockForOrder: (order: Order) => {
        if (!order.items) return;
        const inv = db.getInventory();

        order.items.forEach(item => {
            // Determine what to deduct
            // If item has stockName, look for it.
            if (item.stockName) {
                const stockItem = inv.find(i => i.name === item.stockName);
                if (stockItem) {
                    // Rails are 'Boy', we usually deduct 1 boy for the whole order 
                    // or calculate meters. 
                    // Owner said: "count profiles (excluding rails) as pieces".

                    // Logic:
                    // If unit is 'adet', deduct qty.
                    // If unit is 'boy', deduct 1 per qty? Or 1 total?
                    // Let's deduct 1 'unit' per item qty for simplicity.
                    // (e.g. 2 vertical profiles = 2 units/boys deducted if they are long)
                    stockItem.quantity -= item.qty;
                }
            }
            // Glass deduction logic?
            // Item name: "Sabit Cam (Stok: 40cm)" matches Inventory "Sabit Cam 40cm"
            if (item.type === 'glass') {
                // Try to match by name
                // Our inventory names are like "Sabit Cam 40cm"
                // Our item names are like "Sabit Cam (Stok: 40cm)"
                // Regex to extract
                const match = item.name.match(/Stok:\s*(\d+cm)/);
                if (match) {
                    const stockName = `Sabit Cam ${match[1]}`;
                    const stockItem = inv.find(i => i.name === stockName);
                    if (stockItem) stockItem.quantity -= item.qty;
                }
            }
        });
        localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(inv));
    },

    init: () => {
        if (typeof window !== 'undefined' && !localStorage.getItem(DB_KEYS.INVENTORY)) {
            db.getInventory(); // triggers seed
        }
    }
};
