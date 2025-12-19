import { Order, ProductionItem } from './types';
import { SERIES } from './constants';

export const calculateProductionDetails = (order: Order): ProductionItem[] => {
    const w = Number(order.width) || 0;
    const h = Number(order.height) || 0;
    const d = Number(order.depth) || w; // Default to square if no depth
    const model = order.model;
    const seriesId = order.series;
    const series = SERIES.find(s => s.id === seriesId) || SERIES[0];
    const isPleksi = order.material === 'pleksi';
    const color = order.profileColor || 'Parlak';

    const getProfileName = (baseName: string) => `${baseName} (${color})`;

    // Round to nearest 5
    const roundToFive = (num: number) => {
        return Math.round(num / 5) * 5;
    };

    let items: ProductionItem[] = [];

    // Determine Base Profile Name
    let rayBaseName = 'Ray Profili';
    if (seriesId === 'superlux') rayBaseName = 'Süperlüx Ray';
    else if (seriesId === 'liverno') rayBaseName = 'Liverno Ray';
    else if (seriesId === 'pratiko') rayBaseName = 'Pratiko Ray';
    else if (seriesId === 'bella') rayBaseName = 'Bella Ray';

    // --- LOGIC ---
    if (model === 'kose' || model === 'oval') {
        // Kose/Oval Logic
        // Excel Logic for Pleksi: Width - 9

        let deduction = isPleksi ? 9 : series.deduction;
        const rayW = w - deduction;
        const rayD = d - deduction;

        items.push({ name: getProfileName(rayBaseName + ' Alt/Üst'), val: rayW, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName(rayBaseName) });
        items.push({ name: getProfileName(rayBaseName + ' Alt/Üst'), val: rayD, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName(rayBaseName) });

        // Vertical Profiles
        // For Pleksi: "Dişi" and "Etek" (?) - Usually Bella series uses "Bella Dikme".
        // Assuming standard logic for now, but adding specific request if Pleksi
        if (isPleksi) {
            // Based on Excel "Dişi", "Etek" columns
            items.push({ name: getProfileName('Duvar Dikmesi (U)'), val: h, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Duvar Dikmesi') });
            items.push({ name: getProfileName('Dişi Profil'), val: h, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Dişi') });
            // items.push({ name: getProfileName('Etek'), val: h, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Etek') }); // Typically for bottom? Or magnet side?
            // Standard Pleksi usually has 2 Wall + 2 Glass profiles.
            // Let's stick to standard vertical profiles but rename if needed.
            // Excel had "Dişi", "Etek", "Mıknatıslı", "Arka Kanat" headers.
        } else {
            items.push({ name: getProfileName('Duvar Dikmesi'), val: h, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Duvar Dikmesi') });
            if (series.hasCamDikmesi) {
                items.push({ name: getProfileName('Cam Dikmesi'), val: h - 10, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Cam Dikmesi') });
            }
        }

        // Glass
        const rawCamW = (w / 2) - 2;
        const stockCamW = roundToFive(rawCamW);

        if (model === 'oval') {
            const hGlass = isPleksi ? 180 : 182.5;
            items.push({ name: `Oval Cam (R55)`, w: stockCamW, h: hGlass, unit: 'adet', qty: 2, type: 'glass' });
            items.push({ name: `Düz Cam`, w: stockCamW, h: hGlass, unit: 'adet', qty: 2, type: 'glass' });
        } else {
            // Kose
            if (isPleksi) {
                const hGlass = 180;
                items.push({ name: `Ön Panel (Pleksi)`, w: stockCamW, h: hGlass, unit: 'adet', qty: 2, type: 'glass' });
                items.push({ name: `Arka Panel (Pleksi)`, w: stockCamW, h: hGlass, unit: 'adet', qty: 2, type: 'glass' });
            } else {
                items.push({ name: `Sabit Cam (Stok: ${stockCamW}cm)`, w: stockCamW, h: 182.5, unit: 'cm', qty: 2, type: 'glass' });
                items.push({ name: `Çalışır Cam (Stok: ${stockCamW}cm)`, w: stockCamW, h: 187.5, unit: 'cm', qty: 2, type: 'glass' });
            }
        }

    } else if (model === 'duz_1s1c') {
        let deduction = isPleksi ? 6 : (series.deduction + 4);
        const rayLen = w - deduction;

        items.push({ name: getProfileName(rayBaseName), val: rayLen, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName(rayBaseName) });
        items.push({ name: getProfileName('Duvar Dikmesi'), val: h, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Duvar Dikmesi') });

        const rawCamW = (w / 2) - 2;
        const stockCamW = roundToFive(rawCamW);

        items.push({ name: `Sabit Cam`, w: stockCamW, h: 182.5, unit: 'cm', qty: 1, type: 'glass' });
        items.push({ name: `Çalışır Cam`, w: stockCamW, h: 187.5, unit: 'cm', qty: 1, type: 'glass' });

    } else if (model === 'duz_2s2c') {
        let deduction = isPleksi ? 6 : (series.deduction + 4);
        const rayLen = w - deduction;

        items.push({ name: getProfileName(rayBaseName), val: rayLen, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName(rayBaseName) });
        items.push({ name: getProfileName('Duvar Dikmesi'), val: h, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Duvar Dikmesi') });

        const rawCamW = (w / 4) - 2;
        const stockCamW = roundToFive(rawCamW);

        items.push({ name: `Sabit Cam`, w: stockCamW, h: 182.5, unit: 'cm', qty: 2, type: 'glass' });
        items.push({ name: `Çalışır Cam`, w: stockCamW, h: 187.5, unit: 'cm', qty: 2, type: 'glass' });
    }

    // Accessories
    // "Count profiles (excluding rails) and glass as pieces" -> Handled in 'items' list with quantity.

    items.push({
        name: 'Rulman Seti',
        val: '-',
        unit: 'takım',
        qty: (model === 'oval' || model === 'kose' || model === 'duz_2s2c') ? 4 : 2,
        type: 'accessory',
        stockName: 'Rulman Seti'
    });

    items.push({ name: 'Kulp Takımı', val: '-', unit: 'takım', qty: 1, type: 'accessory', stockName: 'Kulp Takımı' });
    items.push({ name: 'Mıknatıs Suluk', val: h, unit: 'boy', qty: 1, type: 'accessory', stockName: 'Mıknatıs Suluk' });

    return items;
};
