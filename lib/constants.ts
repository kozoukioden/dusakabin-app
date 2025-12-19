import { ProfileSeries, ModelType } from './types';

export const SERIES: { id: ProfileSeries; label: string; deduction: number; hasCamDikmesi: boolean }[] = [
    { id: 'superlux', label: 'Süperlüx (Kalın)', deduction: 9, hasCamDikmesi: true },
    { id: 'liverno', label: 'Liverno (İnce)', deduction: 2, hasCamDikmesi: true },
    { id: 'pratiko', label: 'Pratiko (Eko)', deduction: 2, hasCamDikmesi: false },
    { id: 'bella', label: 'Bella (Pleksi)', deduction: 6, hasCamDikmesi: false },
];

export const MODELS: { id: ModelType; label: string; icon: string }[] = [
    { id: 'kose', label: 'Köşe Kabin (2S2Ç)', icon: 'Box' },
    { id: 'oval', label: 'Oval Kabin', icon: 'Circle' },
    { id: 'duz_1s1c', label: 'Düz - 1 Sabit 1 Çalışır', icon: 'LayoutTemplate' },
    { id: 'duz_2s2c', label: 'Düz - 2 Sabit 2 Çalışır', icon: 'Grid' },
    { id: 'katlanir', label: 'Katlanır Kabin', icon: 'FoldHorizontal' },
];

export const PROFILE_COLORS = ['Parlak', 'Antrasit', 'Siyah', 'Gold', 'Beyaz'];
