export type MaterialTabId = 
  | 'bo-vien-meka'
  | 'go-lua'
  | 'mica-pho-thong'
  | 'mica-guong-hd'
  | 'anh-4k';

export interface BoVienPriceRow {
  stt: number;
  size: string;
  luaVien: number | null;
  mekaVien: number | null;
  mekaGuongHdVien: number | null;
  inEpMeka: number | null;
}

export interface DongKhungPriceRow {
  size: string;
  boVien: number | null;
  k0_k3: number | null;
  k4_k6: number | null;
  k7_k9: number | null;
  k10: number | null;
  k11: number | null;
  titan1: number | null; // Titan 1 (đen, bạc)
  titan2: number | null; // Titan 2 (xanh, hồng)
}

export interface Anh4KPriceRow {
  size: string;
  k4_k6: number | null;
  titan2: number | null;
}

export interface FrameSpecItem {
  code: string;
  name: string;
  dimensions: string;
  description: string;
  suitableFor: string;
  variants: string;
}

export interface B2BShopInfo {
  name: string;
  subTitle: string;
  hotlineTech: string;
  zaloTho: string;
  address: string;
  workingHours: string;
}
