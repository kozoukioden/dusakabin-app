"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// --- AUTH & USERS ---

export async function login(password: string, username: string = 'admin') {
    // Default seed check on first login attempt if empty
    const userCount = await prisma.user.count();
    if (userCount === 0) {
        await seedUsers();
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (user && user.password === password) {
        const cookieStore = await cookies();
        cookieStore.set('role', user.role);
        cookieStore.set('userId', user.id); // Track who logged in
        cookieStore.set('username', user.name);
        return { success: true, role: user.role };
    }
    return { success: false, error: 'Kullanıcı adı veya şifre hatalı' };
}

export async function logout() {
    (await cookies()).delete('role');
    (await cookies()).delete('userId');
    (await cookies()).delete('username');
    revalidatePath('/');
}

// User Management Actions
export async function getUsers() {
    return await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function createUser(data: any) {
    try {
        await prisma.user.create({ data });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateUser(id: string, data: any) {
    try {
        const updateData = { ...data };
        if (!updateData.password) {
            delete updateData.password;
        }
        await prisma.user.update({ where: { id }, data: updateData });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteUser(id: string) {
    await prisma.user.delete({ where: { id } });
    revalidatePath('/admin/users');
}

async function seedUsers() {
    // Create Default Admin and Usta
    await prisma.user.createMany({
        data: [
            { username: 'admin', password: 'admin123', name: 'Yönetici', role: 'admin' },
            { username: 'usta', password: 'usta123', name: 'Genel Usta', role: 'usta' }
        ]
    });
}

// --- INVENTORY ---

export async function getInventory() {
    // If empty, seed
    const count = await prisma.inventoryItem.count();
    if (count === 0) {
        await seedInventory();
    }
    return await prisma.inventoryItem.findMany();
}

export async function updateInventory(id: string, qtyDelta: number) {
    try {
        await prisma.inventoryItem.update({
            where: { id },
            data: { quantity: { increment: qtyDelta } }
        });
        revalidatePath('/inventory');
    } catch (e) {
        console.error(e);
    }
}

export async function createInventoryItem(data: any) {
    try {
        await prisma.inventoryItem.create({
            data: {
                name: data.name,
                category: data.category,
                quantity: Number(data.quantity) || 0,
                unit: data.unit || 'adet'
            }
        });
        revalidatePath('/inventory');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function editInventoryItem(id: string, data: any) {
    try {
        await prisma.inventoryItem.update({
            where: { id },
            data: {
                name: data.name,
                category: data.category,
                quantity: Number(data.quantity),
                unit: data.unit
            }
        });
        revalidatePath('/inventory');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteInventoryItem(id: string) {
    try {
        await prisma.inventoryItem.delete({ where: { id } });
        revalidatePath('/inventory');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

async function seedInventory() {
    const items = [];
    const colors = ['Parlak', 'Antrasit'];

    const profiles = [
        { name: 'Süperlüx Ray', cat: 'aluminyum' },
        { name: 'Süperlüx Duvar Dikmesi', cat: 'aluminyum' },
        { name: 'Liverno Ray', cat: 'aluminyum' },
        { name: 'Pratiko Ray', cat: 'aluminyum' },
        { name: 'Pratiko Dikme', cat: 'aluminyum' },
        { name: 'Bella Dikme', cat: 'pleksi' },
        { name: 'Dişi Profil', cat: 'pleksi' },
        { name: 'Duvar Dikmesi (U)', cat: 'pleksi' }
    ];

    profiles.forEach(p => {
        colors.forEach(c => {
            items.push({ name: `${p.name} (${c})`, category: p.cat, quantity: 50, unit: 'boy' });
        });
    });

    for (let i = 10; i <= 85; i += 5) {
        items.push({ name: `Sabit Cam ${i}cm`, category: 'cam', quantity: 10, unit: 'adet' });
    }

    ['Rulman Seti', 'Kulp Takımı', 'Mıknatıs Suluk'].forEach(acc => {
        items.push({ name: acc, category: 'aksesuar', quantity: 100, unit: 'adet' });
    });

    for (const item of items) {
        await prisma.inventoryItem.create({ data: item });
    }
}



// --- PRODUCTION RULES ---

export async function getProductionRules(series?: string) {
    // If we have no rules at all, seed them
    const count = await prisma.productionRule.count();
    if (count === 0) {
        await seedProductionRules();
    }

    if (series) {
        return await prisma.productionRule.findMany({
            where: { series },
            orderBy: { displayOrder: 'asc' }
        });
    }
    return await prisma.productionRule.findMany({ orderBy: { series: 'asc' } });
}

export async function createProductionRule(data: any) {
    try {
        await prisma.productionRule.create({ data });
        revalidatePath('/admin/settings');
        revalidatePath('/orders/new');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateProductionRule(id: string, data: any) {
    try {
        await prisma.productionRule.update({ where: { id }, data });
        revalidatePath('/admin/settings');
        revalidatePath('/orders/new');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteProductionRule(id: string) {
    await prisma.productionRule.delete({ where: { id } });
    revalidatePath('/admin/settings');
    revalidatePath('/orders/new');
}

async function seedProductionRules() {
    const rules = [
        // BELLA SERIES
        { series: 'bella', componentName: 'Erkek Ray (Alt/Üst)', type: 'profile', formula: 'W - 9', quantity: 2, displayOrder: 1, stockName: 'Erkek Ray' },
        { series: 'bella', componentName: 'Dar U', type: 'profile', formula: 'H', quantity: 2, displayOrder: 2, stockName: 'Dar U' },
        { series: 'bella', componentName: 'Arka Panel', type: 'profile', formula: 'H', quantity: 2, displayOrder: 3, stockName: 'Arka Panel' },
        { series: 'bella', componentName: 'Mıknatıs', type: 'profile', formula: 'H - 5.8', quantity: 2, displayOrder: 4, stockName: 'Mıknatıs' },
        { series: 'bella', componentName: 'Arka Kanat', type: 'profile', formula: 'H - 5.8', quantity: 2, displayOrder: 5, stockName: 'Arka Kanat' },
        { series: 'bella', componentName: 'Ön Panel', type: 'profile', formula: 'H - 12.5', quantity: 2, displayOrder: 6, stockName: 'Ön Panel' },
        { series: 'bella', componentName: 'Dişi Profil', type: 'profile', formula: '(W / 2) - 5', quantity: 2, displayOrder: 7, stockName: 'Dişi Profil' },
        { series: 'bella', componentName: 'Etek', type: 'profile', formula: '(W / 2) - 5', quantity: 2, displayOrder: 8, stockName: 'Etek' },

        // SUPERLUX (Standard)
        { series: 'superlux', componentName: 'Süperlüx Ray (Alt/Üst)', type: 'profile', formula: 'W - 6', quantity: 2, displayOrder: 1, stockName: 'Süperlüx Ray' }, // W-6 is standard, though latest check said W-9? Sticking to standard unless specified. Actually user said W-9 for SuperLux too in Round 3?
        // User said: "Süperlüx Ray: En - 9 cm formülü sabitlendi." in Round 3 confirmation.
        // Let's us W-9 for SuperLux Ray too then.
        // Wait, verify. Round 3 code: `(seriesId === 'superlux' || isPleksi) ? 9 : series.deduction`. Yes.
        // Wait, `series.deduction` comes from constants. Standard SuperLux constant is 6?
        // Round 3 code forced 9.
        // So I will seed 9.
        { series: 'superlux', componentName: 'Süperlüx Ray (Alt/Üst)', type: 'profile', formula: 'W - 9', quantity: 2, displayOrder: 1, stockName: 'Süperlüx Ray' },

        { series: 'superlux', componentName: 'Duvar Dikmesi', type: 'profile', formula: 'H', quantity: 2, displayOrder: 2, stockName: 'Duvar Dikmesi' },
        { series: 'superlux', componentName: 'Cam Dikmesi', type: 'profile', formula: 'H - 10', quantity: 2, displayOrder: 3, stockName: 'Cam Dikmesi' },

        // Glass for SuperLux
        // Logic: (W / 2) - 2 -> Round to 5
        // Hard to represent "Round to 5" in simple formula string "W - 2".
        // I might need to enable JS functions or special syntax like "ROUND5((W/2)-2)".
        // Let's implement `ROUND5` and `ROUND` as available functions in evaluator.
        { series: 'superlux', componentName: 'Sabit Cam', type: 'glass', formula: 'ROUND5((W / 2) - 2)', quantity: 2, displayOrder: 4 },
        { series: 'superlux', componentName: 'Çalışır Cam', type: 'glass', formula: 'ROUND5((W / 2) - 2)', quantity: 2, displayOrder: 5 },

        // Accessories for All (Generic or Series Specific?)
        // Currently accessories are hardcoded. Can be moved here too.
        { series: 'all', componentName: 'Rulman Seti', type: 'accessory', formula: '0', quantity: 4, displayOrder: 10, stockName: 'Rulman Seti' },
        { series: 'all', componentName: 'Kulp Takımı', type: 'accessory', formula: '0', quantity: 1, displayOrder: 11, stockName: 'Kulp Takımı' },
        { series: 'all', componentName: 'Mıknatıs Suluk', type: 'accessory', formula: 'H', quantity: 1, displayOrder: 12, stockName: 'Mıknatıs Suluk' }
    ];

    for (const rule of rules) {
        await prisma.productionRule.create({ data: rule });
    }
}

// --- ORDERS ---

export async function getOrders() {
    return await prisma.order.findMany({
        include: { items: true, assignedTo: true },
        orderBy: { createdAt: 'desc' }
    });
}

export async function getOrder(id: string) {
    return await prisma.order.findUnique({
        where: { id },
        include: { items: true, assignedTo: true }
    });
}

export async function createOrder(data: any, items: any[]) {
    try {
        await prisma.order.create({
            data: {
                ...data,
                // Ensure proper types
                width: Number(data.width),
                height: Number(data.height),
                depth: data.depth ? Number(data.depth) : null,
                items: {
                    create: items.map(item => ({
                        ...item,
                        val: item.val !== undefined && item.val !== null ? String(item.val) : null,
                        w: item.w || null,
                        h: item.h || null
                    }))
                }
            }
        });
        revalidatePath('/orders');
        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        console.error("Create Order Error:", e);
        return { success: false, error: e.message };
    }
}

export async function deleteOrder(id: string) {
    await prisma.order.delete({ where: { id } });
    revalidatePath('/orders');
}

export async function updateOrderStatus(id: string, status: string) {
    try {
        const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
        if (!order) return { success: false, error: 'Sipariş bulunamadı' };

        // Stock Deduction Logic
        if (order.status === 'pending' && status === 'manufacturing') {
            await deductStock(order.items);
        }

        await prisma.order.update({
            where: { id },
            data: { status }
        });
        revalidatePath('/production');
        revalidatePath('/orders/' + id); // Also revalidate detail page
        return { success: true };
    } catch (e: any) {
        console.error("Update Status Error:", e);
        return { success: false, error: e.message || "Bir hata oluştu" };
    }
}

async function deductStock(items: any[]) {
    const inventory = await prisma.inventoryItem.findMany();

    for (const item of items) {
        let stockItem = null;

        // Try to match by stockName
        if (item.stockName) {
            stockItem = inventory.find(i => i.name === item.stockName);
        }

        // Try to match Glass by Name regex
        if (!stockItem && item.type === 'glass') {
            const match = item.name.match(/Stok:\s*(\d+cm)/);
            if (match) {
                stockItem = inventory.find(i => i.name === `Sabit Cam ${match[1]}`);
            }
        }

        if (stockItem) {
            await prisma.inventoryItem.update({
                where: { id: stockItem.id },
                data: { quantity: { decrement: item.qty } }
            });
        }
    }
}
