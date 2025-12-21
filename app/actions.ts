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
        await prisma.user.update({ where: { id }, data });
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
