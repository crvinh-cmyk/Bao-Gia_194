import { 
  InEpMikaPriceRow, 
  DongKhungPriceRow, 
  Anh4KPriceRow, 
  HdProPriceRow, 
  AlbumMoPhangPriceRow, 
  B2BShopInfo 
} from '../types';
import { FrameConstantItem } from '../constants/frames';

export type PricingMaterialType = 
  | 'go-lua'
  | 'hd-guong-sieu-bong'
  | 'mika-pho-thong'
  | 'in-ep-mika'
  | 'anh-4k'
  | 'hd-pro'
  | 'album-mo-phang'
  | string; // Allows dynamic custom materials

export type AudienceTierId = 'studio' | 'freelance' | 'retail';

export interface CustomMaterialDef {
  id: string; // e.g. "trang-guong-pha-le"
  name: string; // e.g. "Tráng Gương Pha Lê"
  boVienPrefix: string; // e.g. "TG"
  khungPrefix: string; // e.g. "TGK"
  type: 'dong-khung' | 'in-ep' | 'album';
  isCustom: boolean;
  targetTiers?: AudienceTierId[]; // Tiers where this material is active
}

export interface TableColumnConfig {
  key: string;            // unique property key in row object (e.g. 'inEpMika', 'hdBoVien', 'col_khung_go')
  label: string;          // Header display name (e.g. 'HD Khung Gỗ')
  skuPrefix?: string;     // Prefix for SKU generation (e.g. 'KGO')
  isCustom?: boolean;     // whether column was dynamically added
  defaultColor?: string;  // display styling
}

export interface RetailPriceRow {
  size: string; // e.g., '15x21', '20x30', '25x38', '30x45', '40x60', '50x75', '60x90', '70x110', '80x120', '100x150'
  inEpMika: number | null; // Cột "In Ép Mika" (không khung ngoài)
  hdBoVien: number | null; // Cột "HD Siêu Bóng Bo Viền"
  hdK4_k6?: number | null; // Cột "HD Khung K4, K5, K6"
  hdK7_k9?: number | null; // Cột "HD Khung K7, K8, K9"
  hdK11?: number | null;   // Cột "HD Khung K11 (Bản 8)"
  hdTitan1?: number | null; // Cột "HD Siêu Bóng Khung Titan 1"
  hdTitan2?: number | null; // Cột "HD Siêu Bóng Khung Titan 2"
  hdK10?: number | null;    // Cột "HD Siêu Bóng Khung K10" (legacy)
  [key: string]: any;      // Allows dynamic custom columns
}

export interface RetailPassportRow {
  size: string; // '3x4', '4x6'
  code?: string; // '3*4', '4*6'
  name?: string; // Display name
  price: number | null; // 50000
}

export interface TierPricingTables {
  inEpMika: InEpMikaPriceRow[];
  goLua: DongKhungPriceRow[];
  mikaPhoThong: DongKhungPriceRow[];
  hdGuongSieuBong: DongKhungPriceRow[];
  anh4K: Anh4KPriceRow[];
  hdPro: HdProPriceRow[];
  albumMoPhang: AlbumMoPhangPriceRow[];
  retailTable?: RetailPriceRow[];
  retailPassports?: RetailPassportRow[];
  // Dynamic custom material tables mapped by material id
  customTables?: Record<string, any[]>;
  columnConfigs?: Record<string, TableColumnConfig[]>;
}

export interface MasterCatalogData {
  version: string;
  lastUpdated: string;
  activeTier: AudienceTierId;
  inEpMika: InEpMikaPriceRow[];
  goLua: DongKhungPriceRow[];
  mikaPhoThong: DongKhungPriceRow[];
  hdGuongSieuBong: DongKhungPriceRow[];
  anh4K: Anh4KPriceRow[];
  hdPro: HdProPriceRow[];
  albumMoPhang: AlbumMoPhangPriceRow[];
  retailTable?: RetailPriceRow[];
  retailPassports?: RetailPassportRow[];
  customTables?: Record<string, any[]>;
  customMaterials: CustomMaterialDef[];
  columnConfigs?: Record<string, TableColumnConfig[]>;

  tiers: {
    studio: TierPricingTables;
    freelance: TierPricingTables;
    retail: TierPricingTables;
  };

  frames: FrameConstantItem[];
  shopInfo: B2BShopInfo;
}

