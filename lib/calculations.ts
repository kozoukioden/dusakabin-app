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
    const isBella = seriesId === 'bella';
    const color = order.profileColor || 'Parlak';

    const getProfileName = (baseName: string) => `${baseName} (${color})`;

    // Round to integer (User Request: "Küsüratlı olmasın")
    const r = (num: number) => Math.round(num);

    let items: ProductionItem[] = [];

    // Determine Base Profile Name
    let rayBaseName = 'Ray Profili';
    if (seriesId === 'superlux') rayBaseName = 'Süperlüx Ray';
    else if (seriesId === 'liverno') rayBaseName = 'Liverno Ray';
    else if (seriesId === 'pratiko') rayBaseName = 'Pratiko Ray';
    else if (seriesId === 'bella') rayBaseName = 'Erkek Ray'; // Bella specific name from SS6

    // --- LOGIC ---
    if (model === 'kose' || model === 'oval') {

        // BELLA SERIES SPECIFIC LOGIC (Image ss6.jpeg)
        if (isBella && isPleksi) {
            // Horizontal
            // Erkek Ray: W - 9 (from 78 -> 69)
            items.push({ name: getProfileName('Erkek Ray (Alt/Üst)'), val: r(w - 9), unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Erkek Ray') });
            if (d !== w) {
                items.push({ name: getProfileName('Erkek Ray (Alt/Üst)'), val: r(d - 9), unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Erkek Ray') });
            } else {
                items.push({ name: getProfileName('Erkek Ray (Alt/Üst)'), val: r(w - 9), unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Erkek Ray') });
            }

            // Dişi / Etek: (W / 2) - 5 (Approx from 78 -> 34)
            const horizontalShort = r((w / 2) - 5);
            items.push({ name: getProfileName('Dişi Profil'), val: horizontalShort, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Dişi Profil') });
            items.push({ name: getProfileName('Etek'), val: horizontalShort, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Etek') });

            if (d !== w) {
                const horizontalShortD = r((d / 2) - 5);
                items.push({ name: getProfileName('Dişi Profil'), val: horizontalShortD, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Dişi Profil') });
                items.push({ name: getProfileName('Etek'), val: horizontalShortD, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Etek') });
            } else {
                items.push({ name: getProfileName('Dişi Profil'), val: horizontalShort, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Dişi Profil') });
                items.push({ name: getProfileName('Etek'), val: horizontalShort, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Etek') });
            }

            // Vertical
            items.push({ name: getProfileName('Dar U'), val: r(h), unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Dar U') });
            items.push({ name: getProfileName('Arka Panel'), val: r(h), unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Arka Panel') });
            items.push({ name: getProfileName('Mıknatıs'), val: r(h - 5.8), unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Mıknatıs') });
            items.push({ name: getProfileName('Arka Kanat'), val: r(h - 5.8), unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Arka Kanat') });
            items.push({ name: getProfileName('Ön Panel'), val: r(h - 12.5), unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Ön Panel') });

            // Specs say: "No glass/pleksi dimensions needed" for Bella
            // We do NOT add any 'glass' items here.

        } else {
            // STANDARD LOGIC (SuperLux, Liverno, etc.)
            let deduction = (seriesId === 'superlux' || isPleksi) ? 9 : series.deduction;

            const rayW = r(w - deduction);
            const rayD = r(d - deduction);

            items.push({ name: getProfileName(rayBaseName + ' Alt/Üst'), val: rayW, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName(rayBaseName) });
            items.push({ name: getProfileName(rayBaseName + ' Alt/Üst'), val: rayD, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName(rayBaseName) });

            // Vertical Profiles
            items.push({ name: getProfileName('Duvar Dikmesi'), val: r(h), unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Duvar Dikmesi') });

            if (isPleksi) {
                // Generic Pleksi (Non-Bella) - simplified fallback
                items.push({ name: getProfileName('Dişi Profil'), val: r(h), unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Dişi') });
            } else {
                if (series.hasCamDikmesi) {
                    items.push({ name: getProfileName('Cam Dikmesi'), val: r(h - 10), unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Cam Dikmesi') });
                }
            }

            // Glass
            const rawCamW = (w / 2) - 2;
            const stockCamW = Math.round(rawCamW / 5) * 5; // Keep stock logic for glass width as "nearest 5" or "exact"? User said "no decimals". Stock is usually 5cm steps. Let's keep stock steps for glass name, but dimensions integer.

            if (model === 'oval') {
                const hGlass = isPleksi ? 180 : 182.5;
                items.push({ name: `Oval Cam (R55)`, w: stockCamW, h: r(hGlass), unit: 'adet', qty: 2, type: 'glass' });
                items.push({ name: `Düz Cam`, w: stockCamW, h: r(hGlass), unit: 'adet', qty: 2, type: 'glass' });
            } else {
                // Kose
                if (isPleksi) {
                    const hGlass = 180;
                    items.push({ name: `Ön Panel (Pleksi)`, w: stockCamW, h: r(hGlass), unit: 'adet', qty: 2, type: 'glass' });
                    items.push({ name: `Arka Panel (Pleksi)`, w: stockCamW, h: r(hGlass), unit: 'adet', qty: 2, type: 'glass' });
                } else {
                    items.push({ name: `Sabit Cam (Stok: ${stockCamW}cm)`, w: stockCamW, h: 182.5, unit: 'cm', qty: 2, type: 'glass' });
                    items.push({ name: `Çalışır Cam (Stok: ${stockCamW}cm)`, w: stockCamW, h: 187.5, unit: 'cm', qty: 2, type: 'glass' });
                }
            }
        }

    } else if (model === 'duz_1s1c') {
        let deduction = isPleksi ? 6 : (series.deduction + 4);
        const rayLen = r(w - deduction);

        items.push({ name: getProfileName(rayBaseName), val: rayLen, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName(rayBaseName) });
        items.push({ name: getProfileName('Duvar Dikmesi'), val: r(h), unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Duvar Dikmesi') });

        const rawCamW = (w / 2) - 2;
        const stockCamW = Math.round(rawCamW / 5) * 5;

        items.push({ name: `Sabit Cam`, w: stockCamW, h: 182.5, unit: 'cm', qty: 1, type: 'glass' });
        items.push({ name: `Çalışır Cam`, w: stockCamW, h: 187.5, unit: 'cm', qty: 1, type: 'glass' });

    } else if (model === 'duz_2s2c') {
        let deduction = isPleksi ? 6 : (series.deduction + 4);
        const rayLen = r(w - deduction);

        items.push({ name: getProfileName(rayBaseName), val: rayLen, unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName(rayBaseName) });
        items.push({ name: getProfileName('Duvar Dikmesi'), val: r(h), unit: 'cm', qty: 2, type: 'profile', stockName: getProfileName('Duvar Dikmesi') });

        const rawCamW = (w / 4) - 2;
        const stockCamW = Math.round(rawCamW / 5) * 5;

        items.push({ name: `Sabit Cam`, w: stockCamW, h: 182.5, unit: 'cm', qty: 2, type: 'glass' });
        items.push({ name: `Çalışır Cam`, w: stockCamW, h: 187.5, unit: 'cm', qty: 2, type: 'glass' });
    }

    // Accessories
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
