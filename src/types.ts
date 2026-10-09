export type MaterialTabId = 
  | 'go-lua'
  | 'hd-guong-sieu-bong'
  | 'mika-pho-thong'
  | 'in-ep-mika'
  | 'anh-4k';

export interface InEpMikaPriceRow {
  stt: number;
  size: string;
  inEpMika: number | null;
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

export interface FrameImageVariant {
  name: string;
  url: string;
  colorHex?: string;
  tag?: string;
}

export interface FrameSpecItem {
  code: string;
  name: string;
  dimensions: string;
  description: string;
  suitableFor: string;
  variants: string;
  hasRealPhotos?: boolean;
  images?: FrameImageVariant[];
}

export interface B2BShopInfo {
  name: string;
  subTitle: string;
  hotlineTech: string;
  zaloTho: string;
  address: string;
  workingHours: string;
}
