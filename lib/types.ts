export type ProfileSeries = 'superlux' | 'liverno' | 'pratiko' | 'bella';
export type ModelType = 'kose' | 'oval' | 'duz_1s1c' | 'duz_2s2c' | 'katlanir';
export type MaterialType = 'mica' | 'pleksi' | 'cam';

export interface Order {
  id: string;
  customerName: string;
  phone?: string;
  address?: string;

  width: number;
  height: number;
  depth?: number;

  model: ModelType;
  series: ProfileSeries;
  material: 'cam' | 'pleksi';
  profileColor: 'Parlak' | 'Antrasit' | 'Siyah' | 'Gold';
  glassType?: 'Seffaf' | 'Kumlu' | 'Cizgili';

  status: 'pending' | 'manufacturing' | 'ready' | 'installed';
  createdAt: string;
  notes?: string;

  items?: ProductionItem[];
  totalPrice?: number;
}

export interface ProductionItem {
  name: string;
  val?: number | string;
  unit: string;
  qty: number;
  type: 'profile' | 'glass' | 'accessory';
  stockName?: string;
  w?: number;
  h?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'aluminyum' | 'cam' | 'aksesuar' | 'pleksi';
  quantity: number;
  unit: string;
  minWarning?: number;
}
