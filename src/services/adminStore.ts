import { useState, useEffect } from 'react';
import { 
  MasterCatalogData, 
  PricingMaterialType, 
  AudienceTierId, 
  TierPricingTables,
  CustomMaterialDef,
  RetailPriceRow,
  RetailPassportRow,
  TableColumnConfig
} from '../types/admin';
import { 
  inEpMikaPricingData, 
  goLuaDongKhungData, 
  mikaPhoThongData, 
  hdGuongSieuBongKhungData, 
  anh4KPricingData, 
  hdProPricingData, 
  albumMoPhangPricingData, 
  b2bShopInfo2026 
} from '../data/tiemIn194Pricing2026';
import { FRAMES } from '../constants/frames';
import { normalizeSize } from '../utils/skuGenerator';
import { sanitizeFramesForFirestore } from '../utils/frameImageResolver';
import { syncCatalogToFirestore } from './catalogSync';

const LOCAL_STORAGE_KEY = 'tiem194_master_catalog_v2';

/**
 * Tách chuỗi kích thước (W*H hoặc WxH), tính diện tích W x H phục vụ tự động sắp xếp
 */
export function parseSizeDimensions(sizeStr: string): { w: number; h: number; area: number } {
  if (!sizeStr) return { w: 0, h: 0, area: 0 };
  const cleaned = sizeStr.toLowerCase().replace(/\s+/g, '');
  const parts = cleaned.split(/[*x]/).filter(Boolean);
  if (parts.length >= 2) {
    const w = parseFloat(parts[0]) || 0;
    const h = parseFloat(parts[1]) || 0;
    return { w, h, area: w * h };
  }
  const single = parseFloat(cleaned.replace(/[^0-9.]/g, '')) || 0;
  return { w: single, h: single, area: single * single };
}

/**
 * Sắp xếp toàn bộ mảng dữ liệu kích thước từ nhỏ đến lớn theo diện tích (W x H)
 * Ví dụ: 13*18 (234) < 15*21 (315); 100*180 (18000) nằm giữa 100*150 (15000) và 110*180 (19800)
 */
export function sortRowsBySizeArea<T extends { size: string }>(rows: T[]): T[] {
  if (!Array.isArray(rows)) return [];
  return [...rows].sort((a, b) => {
    const dimA = parseSizeDimensions(a.size);
    const dimB = parseSizeDimensions(b.size);
    if (dimA.area !== dimB.area) {
      return dimA.area - dimB.area;
    }
    if (dimA.w !== dimB.w) return dimA.w - dimB.w;
    return dimA.h - dimB.h;
  });
}

export const DEFAULT_RETAIL_COLUMNS: TableColumnConfig[] = [
  { key: 'inEpMika', label: 'In Ép Mika', skuPrefix: 'inepKL', defaultColor: 'text-emerald-400 font-bold' },
  { key: 'hdBoVien', label: 'HD Siêu Bóng Bo Viền', skuPrefix: 'HDKL', defaultColor: 'text-[#E7C184] font-bold' },
  { key: 'hdTitan1', label: 'HD Khung Titan 1', skuPrefix: 'TT1', defaultColor: 'text-neutral-200' },
  { key: 'hdTitan2', label: 'HD Khung Titan 2', skuPrefix: 'TT2', defaultColor: 'text-amber-300 font-bold' },
  { key: 'hdK10', label: 'HD Khung K10', skuPrefix: 'K10', defaultColor: 'text-neutral-200' },
];

export const DEFAULT_DONG_KHUNG_COLUMNS: TableColumnConfig[] = [
  { key: 'boVien', label: 'Chỉ Bo Viền', skuPrefix: 'BV', defaultColor: 'text-emerald-400 font-bold' },
  { key: 'k0_k3', label: 'Khung K0 - K3', skuPrefix: 'K0', defaultColor: 'text-neutral-200' },
  { key: 'k4_k6', label: 'Khung K4 - K6', skuPrefix: 'K4', defaultColor: 'text-neutral-200' },
  { key: 'k7_k9', label: 'Khung K7 - K9', skuPrefix: 'K7', defaultColor: 'text-neutral-200' },
  { key: 'k10', label: 'Khung K10 (Bản 5)', skuPrefix: 'K10', defaultColor: 'text-neutral-200' },
  { key: 'k11', label: 'Khung K11 (Bản 8)', skuPrefix: 'K11', defaultColor: 'text-neutral-200' },
  { key: 'titan1', label: 'Khung Titan 1', skuPrefix: 'TT1', defaultColor: 'text-[#E7C184]' },
  { key: 'titan2', label: 'Khung Titan 2', skuPrefix: 'TT2', defaultColor: 'text-[#E7C184] font-bold' },
];

export function getDefaultColumnsForTable(tableKey: string): TableColumnConfig[] {
  if (tableKey === 'retail') {
    return JSON.parse(JSON.stringify(DEFAULT_RETAIL_COLUMNS));
  }
  if (['go-lua', 'mika-pho-thong', 'hd-guong-sieu-bong'].includes(tableKey)) {
    return JSON.parse(JSON.stringify(DEFAULT_DONG_KHUNG_COLUMNS));
  }
  if (tableKey === 'anh-4k') {
    return [
      { key: 'k4_k6', label: 'Khung Hộp K4, K5, K6', skuPrefix: 'K456', defaultColor: 'text-emerald-400 font-bold' },
      { key: 'titan2', label: 'Khung Titan T2', skuPrefix: 'TT2', defaultColor: 'text-[#E7C184] font-bold' }
    ];
  }
  if (tableKey === 'hd-pro') {
    return [
      { key: 'k4_k6', label: 'Khung K4, K5, K6', skuPrefix: 'K456', defaultColor: 'text-emerald-400 font-bold' },
      { key: 'titan1', label: 'Khung Titan 1', skuPrefix: 'TT1', defaultColor: 'text-neutral-200' },
      { key: 'titan2', label: 'Khung Titan 2', skuPrefix: 'TT2', defaultColor: 'text-[#E7C184] font-bold' }
    ];
  }
  if (tableKey === 'in-ep-mika') {
    return [
      { key: 'inEpMika', label: 'Giá In Ép Mika', skuPrefix: 'inep', defaultColor: 'text-emerald-400 font-bold' },
      { key: 'khungXuongGiaCo', label: 'Khung Xương Gia Cố', skuPrefix: 'NEP', defaultColor: 'text-amber-300' }
    ];
  }
  return JSON.parse(JSON.stringify(DEFAULT_DONG_KHUNG_COLUMNS));
}

export const defaultRetailPricingData: RetailPriceRow[] = [
  { size: '15x21', inEpMika: 20000, hdBoVien: 50000, hdTitan1: 80000, hdTitan2: 110000, hdK10: 90000 },
  { size: '20x30', inEpMika: 35000, hdBoVien: 60000, hdTitan1: 100000, hdTitan2: 130000, hdK10: 110000 },
  { size: '25x38', inEpMika: 50000, hdBoVien: 100000, hdTitan1: 160000, hdTitan2: 195000, hdK10: 170000 },
  { size: '30x45', inEpMika: 70000, hdBoVien: 140000, hdTitan1: 210000, hdTitan2: 255000, hdK10: 250000 },
  { size: '40x60', inEpMika: 120000, hdBoVien: 190000, hdTitan1: 280000, hdTitan2: 340000, hdK10: 320000 },
  { size: '50x75', inEpMika: 160000, hdBoVien: 255000, hdTitan1: 370000, hdTitan2: 440000, hdK10: 430000 },
  { size: '60x90', inEpMika: 200000, hdBoVien: 285000, hdTitan1: 430000, hdTitan2: 510000, hdK10: 490000 },
  { size: '70x110', inEpMika: 350000, hdBoVien: 525000, hdTitan1: 760000, hdTitan2: 820000, hdK10: 800000 },
  { size: '80x120', inEpMika: 400000, hdBoVien: 640000, hdTitan1: 880000, hdTitan2: 1000000, hdK10: 940000 },
  { size: '100x150', inEpMika: 650000, hdBoVien: 1155000, hdTitan1: 1455000, hdTitan2: 1600000, hdK10: 1530000 }
];

export const defaultRetailPassportData: RetailPassportRow[] = [
  { size: '3x4', code: '3*4', name: 'Chụp & In Ảnh Thẻ 3x4 (Bộ 8 tấm)', price: 50000 },
  { size: '4x6', code: '4*6', name: 'Chụp & In Ảnh Thẻ 4x6 (Bộ 4 tấm)', price: 50000 }
];

function multiplyObjPrices<T>(dataArray: T[], factor: number): T[] {
  if (!Array.isArray(dataArray)) return [];
  return dataArray.map(item => {
    const newItem = { ...item } as any;
    for (const key of Object.keys(newItem)) {
      if (typeof newItem[key] === 'number' && newItem[key] > 0 && key !== 'stt' && key !== 'sheets') {
        newItem[key] = Math.round((newItem[key] * factor) / 1000) * 1000;
      }
    }
    return newItem;
  });
}

function multiplyCustomTables(customTables: Record<string, any[]> | undefined, factor: number): Record<string, any[]> {
  if (!customTables) return {};
  const result: Record<string, any[]> = {};
  Object.keys(customTables).forEach(key => {
    result[key] = multiplyObjPrices(customTables[key] || [], factor);
  });
  return result;
}

export function generateTierTablesFromStudio(studioTables: TierPricingTables, factor: number): TierPricingTables {
  return {
    inEpMika: multiplyObjPrices(studioTables.inEpMika, factor),
    goLua: multiplyObjPrices(studioTables.goLua, factor),
    mikaPhoThong: multiplyObjPrices(studioTables.mikaPhoThong, factor),
    hdGuongSieuBong: multiplyObjPrices(studioTables.hdGuongSieuBong, factor),
    anh4K: multiplyObjPrices(studioTables.anh4K, factor),
    hdPro: multiplyObjPrices(studioTables.hdPro, factor),
    albumMoPhang: multiplyObjPrices(studioTables.albumMoPhang, factor),
    customTables: multiplyCustomTables(studioTables.customTables, factor),
  };
}

export function getDefaultStudioTables(): TierPricingTables {
  return {
    inEpMika: JSON.parse(JSON.stringify(inEpMikaPricingData)),
    goLua: JSON.parse(JSON.stringify(goLuaDongKhungData)),
    mikaPhoThong: JSON.parse(JSON.stringify(mikaPhoThongData)),
    hdGuongSieuBong: JSON.parse(JSON.stringify(hdGuongSieuBongKhungData)),
    anh4K: JSON.parse(JSON.stringify(anh4KPricingData)),
    hdPro: JSON.parse(JSON.stringify(hdProPricingData)),
    albumMoPhang: JSON.parse(JSON.stringify(albumMoPhangPricingData)),
    customTables: {}
  };
}

export function getInitialColumnConfigsMap(): Record<string, TableColumnConfig[]> {
  return {
    retail: getDefaultColumnsForTable('retail'),
    'go-lua': getDefaultColumnsForTable('go-lua'),
    'hd-guong-sieu-bong': getDefaultColumnsForTable('hd-guong-sieu-bong'),
    'mika-pho-thong': getDefaultColumnsForTable('mika-pho-thong'),
    'anh-4k': getDefaultColumnsForTable('anh-4k'),
    'hd-pro': getDefaultColumnsForTable('hd-pro'),
    'in-ep-mika': getDefaultColumnsForTable('in-ep-mika'),
  };
}

export function getDefaultCatalog(): MasterCatalogData {
  const studioTables = getDefaultStudioTables();
  const freelanceTables = generateTierTablesFromStudio(studioTables, 1.1);
  const retailTables = generateTierTablesFromStudio(studioTables, 1.5);
  retailTables.retailTable = JSON.parse(JSON.stringify(defaultRetailPricingData));
  retailTables.retailPassports = JSON.parse(JSON.stringify(defaultRetailPassportData));

  studioTables.columnConfigs = getInitialColumnConfigsMap();
  freelanceTables.columnConfigs = getInitialColumnConfigsMap();
  retailTables.columnConfigs = getInitialColumnConfigsMap();

  const defaultColConfigs = getInitialColumnConfigsMap();

  return {
    version: '2026.2',
    lastUpdated: new Date().toISOString(),
    activeTier: 'studio',
    inEpMika: studioTables.inEpMika,
    goLua: studioTables.goLua,
    mikaPhoThong: studioTables.mikaPhoThong,
    hdGuongSieuBong: studioTables.hdGuongSieuBong,
    anh4K: studioTables.anh4K,
    hdPro: studioTables.hdPro,
    albumMoPhang: studioTables.albumMoPhang,
    retailTable: defaultRetailPricingData,
    retailPassports: defaultRetailPassportData,
    customTables: studioTables.customTables,
    customMaterials: [],
    columnConfigs: defaultColConfigs,
    tiers: {
      studio: studioTables,
      freelance: freelanceTables,
      retail: retailTables
    },
    frames: JSON.parse(JSON.stringify(FRAMES)),
    shopInfo: JSON.parse(JSON.stringify(b2bShopInfo2026))
  };
}

export function loadStoredCatalog(): MasterCatalogData {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return getDefaultCatalog();
    const parsed = JSON.parse(raw);
    const defaults = getDefaultCatalog();

    const activeTier: AudienceTierId = parsed.activeTier || 'studio';
    const studioTier = parsed.tiers?.studio || defaults.tiers.studio;
    let freelanceTier = parsed.tiers?.freelance || defaults.tiers.freelance;
    const retailTier = parsed.tiers?.retail || defaults.tiers.retail;

    // Safeguard: if legacy localStorage saved freelance identical to studio, recalculate +10%
    if (
      freelanceTier?.goLua?.[0]?.boVien &&
      studioTier?.goLua?.[0]?.boVien &&
      freelanceTier.goLua[0].boVien === studioTier.goLua[0].boVien
    ) {
      const prevColConfigs = freelanceTier.columnConfigs;
      freelanceTier = generateTierTablesFromStudio(studioTier, 1.1);
      if (prevColConfigs) freelanceTier.columnConfigs = prevColConfigs;
    }

    const tiers = {
      studio: studioTier,
      freelance: freelanceTier,
      retail: retailTier,
    };

    // Ensure hdPro, albumMoPhang, customTables exist in each tier
    if (!tiers.studio.hdPro) tiers.studio.hdPro = JSON.parse(JSON.stringify(hdProPricingData));
    if (!tiers.studio.albumMoPhang) tiers.studio.albumMoPhang = JSON.parse(JSON.stringify(albumMoPhangPricingData));
    if (!tiers.studio.customTables) tiers.studio.customTables = {};

    if (!tiers.freelance.hdPro) tiers.freelance.hdPro = multiplyObjPrices(tiers.studio.hdPro, 1.1);
    if (!tiers.freelance.albumMoPhang) tiers.freelance.albumMoPhang = multiplyObjPrices(tiers.studio.albumMoPhang, 1.1);
    if (!tiers.freelance.customTables) tiers.freelance.customTables = multiplyCustomTables(tiers.studio.customTables, 1.1);

    if (!tiers.retail.hdPro) tiers.retail.hdPro = multiplyObjPrices(tiers.studio.hdPro, 1.5);
    if (!tiers.retail.albumMoPhang) tiers.retail.albumMoPhang = multiplyObjPrices(tiers.studio.albumMoPhang, 1.5);
    if (!tiers.retail.customTables) tiers.retail.customTables = multiplyCustomTables(tiers.studio.customTables, 1.5);

    if (!tiers.retail.retailTable || tiers.retail.retailTable.length === 0) {
      tiers.retail.retailTable = JSON.parse(JSON.stringify(defaultRetailPricingData));
    }
    if (!tiers.retail.retailPassports || tiers.retail.retailPassports.length === 0) {
      tiers.retail.retailPassports = JSON.parse(JSON.stringify(defaultRetailPassportData));
    }

    // Tự động sắp xếp mọi bảng theo diện tích (W x H) từ nhỏ đến lớn
    if (tiers.retail.retailTable) {
      tiers.retail.retailTable = sortRowsBySizeArea(tiers.retail.retailTable);
    }

    // Load or initialize column configs
    const fallbackGlobalCols: Record<string, TableColumnConfig[]> = parsed.columnConfigs || defaults.columnConfigs || getInitialColumnConfigsMap();
    const standardTableKeys = ['retail', 'go-lua', 'hd-guong-sieu-bong', 'mika-pho-thong', 'anh-4k', 'hd-pro', 'in-ep-mika'];
    standardTableKeys.forEach(k => {
      if (!fallbackGlobalCols[k]) {
        fallbackGlobalCols[k] = getDefaultColumnsForTable(k);
      }
    });

    (['studio', 'freelance', 'retail'] as const).forEach(tierKey => {
      const t = tiers[tierKey];
      if (!t.columnConfigs) {
        t.columnConfigs = JSON.parse(JSON.stringify(fallbackGlobalCols));
      } else {
        standardTableKeys.forEach(k => {
          if (!t.columnConfigs![k]) {
            t.columnConfigs![k] = JSON.parse(JSON.stringify(fallbackGlobalCols[k] || getDefaultColumnsForTable(k)));
          }
        });
      }
      if (t.goLua) t.goLua = sortRowsBySizeArea(t.goLua);
      if (t.mikaPhoThong) t.mikaPhoThong = sortRowsBySizeArea(t.mikaPhoThong);
      if (t.hdGuongSieuBong) t.hdGuongSieuBong = sortRowsBySizeArea(t.hdGuongSieuBong);
      if (t.anh4K) t.anh4K = sortRowsBySizeArea(t.anh4K);
      if (t.hdPro) t.hdPro = sortRowsBySizeArea(t.hdPro);
      if (t.inEpMika) {
        t.inEpMika = sortRowsBySizeArea(t.inEpMika);
        t.inEpMika.forEach((row: any, i: number) => { row.stt = i + 1; });
      }
      if (t.albumMoPhang) {
        t.albumMoPhang.forEach((row: any, i: number) => { row.stt = i + 1; });
      }
      if (t.customTables) {
        Object.keys(t.customTables).forEach(k => {
          t.customTables![k] = sortRowsBySizeArea(t.customTables![k]);
        });
      }
    });

    const activeTables = tiers[activeTier] || tiers.studio;
    const columnConfigs: Record<string, TableColumnConfig[]> = {
      ...(activeTables.columnConfigs || fallbackGlobalCols),
      retail: tiers.retail.columnConfigs?.retail || fallbackGlobalCols.retail || getDefaultColumnsForTable('retail')
    };

    return {
      version: parsed.version || defaults.version,
      lastUpdated: parsed.lastUpdated || defaults.lastUpdated,
      activeTier: activeTier,
      inEpMika: activeTables.inEpMika,
      goLua: activeTables.goLua,
      mikaPhoThong: activeTables.mikaPhoThong,
      hdGuongSieuBong: activeTables.hdGuongSieuBong,
      anh4K: activeTables.anh4K,
      hdPro: activeTables.hdPro,
      albumMoPhang: activeTables.albumMoPhang,
      retailTable: tiers.retail.retailTable,
      retailPassports: tiers.retail.retailPassports,
      customTables: activeTables.customTables || {},
      customMaterials: parsed.customMaterials || [],
      columnConfigs: columnConfigs,
      tiers: tiers,
      frames: sanitizeFramesForFirestore(
        (parsed.frames || defaults.frames).map((f: any) => {
          const canonical = FRAMES.find(
            (cf) => cf.code.toLowerCase() === (f.code || '').trim().toLowerCase()
          );
          if (canonical && (!f.images || f.images.length < canonical.images.length)) {
            return { ...f, images: JSON.parse(JSON.stringify(canonical.images)) };
          }
          return f;
        })
      ),
      shopInfo: parsed.shopInfo || defaults.shopInfo
    };
  } catch (e) {
    console.error("Error reading stored catalog from localStorage:", e);
    return getDefaultCatalog();
  }
}

// Global subscribers for reactive UI re-renders across the app
type Subscriber = (catalog: MasterCatalogData) => void;
const subscribers: Set<Subscriber> = new Set();

let currentCatalogState: MasterCatalogData = loadStoredCatalog();
let autoSyncTimeout: ReturnType<typeof setTimeout> | null = null;

function scheduleAutoSyncToFirestore() {
  if (autoSyncTimeout) {
    clearTimeout(autoSyncTimeout);
  }
  autoSyncTimeout = setTimeout(() => {
    syncCatalogToFirestore().catch((err) => {
      console.error("Auto-sync to Firestore failed:", err);
    });
  }, 1000);
}

export function saveCatalog(newCatalog: MasterCatalogData, shouldAutoSync: boolean = true) {
  newCatalog.lastUpdated = new Date().toISOString();
  if (newCatalog.frames) {
    newCatalog.frames = sanitizeFramesForFirestore(newCatalog.frames);
  }
  
  // Sync active top-level tables from current activeTier
  const activeTables = newCatalog.tiers[newCatalog.activeTier || 'studio'];
  if (activeTables) {
    newCatalog.inEpMika = activeTables.inEpMika;
    newCatalog.goLua = activeTables.goLua;
    newCatalog.mikaPhoThong = activeTables.mikaPhoThong;
    newCatalog.hdGuongSieuBong = activeTables.hdGuongSieuBong;
    newCatalog.anh4K = activeTables.anh4K;
    newCatalog.hdPro = activeTables.hdPro;
    newCatalog.albumMoPhang = activeTables.albumMoPhang;
    newCatalog.customTables = activeTables.customTables || {};
    if (activeTables.columnConfigs) {
      newCatalog.columnConfigs = {
        ...newCatalog.columnConfigs,
        ...activeTables.columnConfigs,
        retail: newCatalog.tiers.retail?.columnConfigs?.retail || newCatalog.columnConfigs?.retail || getDefaultColumnsForTable('retail')
      };
    }
  }

  newCatalog.retailTable = newCatalog.tiers.retail?.retailTable || newCatalog.retailTable;
  newCatalog.retailPassports = newCatalog.tiers.retail?.retailPassports || newCatalog.retailPassports;

  currentCatalogState = newCatalog;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCatalog));
  } catch (e) {
    console.error("Failed to write to localStorage:", e);
  }
  subscribers.forEach(cb => cb(newCatalog));

  if (shouldAutoSync) {
    scheduleAutoSyncToFirestore();
  }
}

export function switchActiveTier(tierId: AudienceTierId) {
  const updated = { ...currentCatalogState, activeTier: tierId };
  saveCatalog(updated, false);
}

export function syncFreelanceTierFromStudio() {
  const updated = { ...currentCatalogState };
  const prevCols = updated.tiers.freelance.columnConfigs;
  updated.tiers.freelance = generateTierTablesFromStudio(updated.tiers.studio, 1.1);
  updated.tiers.freelance.columnConfigs = prevCols || JSON.parse(JSON.stringify(updated.tiers.studio.columnConfigs || getInitialColumnConfigsMap()));
  saveCatalog(updated);
}

export function syncRetailTierFromStudio(factor: number = 1.5) {
  const updated = { ...currentCatalogState };
  const prevRetailTable = updated.tiers.retail.retailTable;
  const prevRetailPassports = updated.tiers.retail.retailPassports;
  const prevCols = updated.tiers.retail.columnConfigs;
  updated.tiers.retail = generateTierTablesFromStudio(updated.tiers.studio, factor);
  updated.tiers.retail.retailTable = prevRetailTable;
  updated.tiers.retail.retailPassports = prevRetailPassports;
  updated.tiers.retail.columnConfigs = prevCols || getInitialColumnConfigsMap();
  saveCatalog(updated);
}

export function resetCatalogToDefault() {
  const defaults = getDefaultCatalog();
  saveCatalog(defaults);
}

export function addCustomMaterial(
  materialDef: CustomMaterialDef, 
  targetTiers: AudienceTierId[] = ['studio', 'freelance', 'retail']
) {
  const updated = { ...currentCatalogState };
  if (!updated.customMaterials) updated.customMaterials = [];
  
  const existingIdx = updated.customMaterials.findIndex(m => m.id === materialDef.id);
  const defWithTiers: CustomMaterialDef = {
    ...materialDef,
    targetTiers: targetTiers.length > 0 ? targetTiers : ['studio', 'freelance', 'retail']
  };

  if (existingIdx >= 0) {
    updated.customMaterials[existingIdx] = defWithTiers;
  } else {
    updated.customMaterials.push(defWithTiers);
  }

  // Initialize empty tables for the selected targetTiers
  targetTiers.forEach(tierKey => {
    if (!updated.tiers[tierKey].customTables) {
      updated.tiers[tierKey].customTables = {};
    }
    if (!updated.tiers[tierKey].customTables![materialDef.id]) {
      updated.tiers[tierKey].customTables![materialDef.id] = [];
    }
  });

  saveCatalog(updated);
}

export function deleteCustomMaterial(materialId: string, fromTierOnly?: AudienceTierId) {
  const updated = { ...currentCatalogState };

  if (fromTierOnly) {
    if (updated.tiers[fromTierOnly].customTables) {
      delete updated.tiers[fromTierOnly].customTables![materialId];
    }
    const mat = updated.customMaterials?.find(m => m.id === materialId);
    if (mat) {
      mat.targetTiers = (mat.targetTiers || ['studio', 'freelance', 'retail']).filter(t => t !== fromTierOnly);
      if (mat.targetTiers.length === 0) {
        updated.customMaterials = (updated.customMaterials || []).filter(m => m.id !== materialId);
      }
    }
  } else {
    updated.customMaterials = (updated.customMaterials || []).filter(m => m.id !== materialId);
    (['studio', 'freelance', 'retail'] as const).forEach(tierKey => {
      if (updated.tiers[tierKey].customTables) {
        delete updated.tiers[tierKey].customTables![materialId];
      }
    });
  }

  saveCatalog(updated);
}

export function addSizeToMaterial(
  materialId: PricingMaterialType, 
  rawSize: string, 
  targetTiers: AudienceTierId[] = ['studio', 'freelance', 'retail']
) {
  const normalized = normalizeSize(rawSize);
  if (!normalized) return;

  const updated = { ...currentCatalogState };
  const customCols = updated.columnConfigs?.[materialId] || [];

  const isBuiltInMaterial = [
    'in-ep-mika', 'go-lua', 'mika-pho-thong', 'hd-guong-sieu-bong', 'anh-4k', 'hd-pro', 'album-mo-phang'
  ].includes(materialId);

  targetTiers.forEach(tierKey => {
    const tier = updated.tiers[tierKey];
    if (!tier) return;

    if (materialId === 'in-ep-mika') {
      const existing = tier.inEpMika || [];
      if (!existing.some(r => normalizeSize(r.size) === normalized)) {
        const newRow: any = { stt: existing.length + 1, size: normalized, inEpMika: 0 };
        customCols.forEach(c => { if (c.isCustom) newRow[c.key] = 0; });
        tier.inEpMika = sortRowsBySizeArea([...existing, newRow]);
        tier.inEpMika.forEach((r, i) => { r.stt = i + 1; });
      }
    } else if (['go-lua', 'mika-pho-thong', 'hd-guong-sieu-bong'].includes(materialId)) {
      const key = materialId === 'go-lua' ? 'goLua' : materialId === 'mika-pho-thong' ? 'mikaPhoThong' : 'hdGuongSieuBong';
      const existing = tier[key] || [];
      if (!existing.some(r => normalizeSize(r.size) === normalized)) {
        const newRow: any = {
          size: normalized, boVien: 0, k0_k3: 0, k4_k6: 0, k7_k9: 0, k10: 0, k11: 0, titan1: 0, titan2: 0
        };
        customCols.forEach(c => { if (c.isCustom) newRow[c.key] = 0; });
        tier[key] = sortRowsBySizeArea([...existing, newRow]) as any;
      }
    } else if (materialId === 'anh-4k') {
      const existing = tier.anh4K || [];
      if (!existing.some(r => normalizeSize(r.size) === normalized)) {
        const newRow: any = { size: normalized, k4_k6: 0, titan2: 0 };
        customCols.forEach(c => { if (c.isCustom) newRow[c.key] = 0; });
        tier.anh4K = sortRowsBySizeArea([...existing, newRow]);
      }
    } else if (materialId === 'hd-pro') {
      const existing = tier.hdPro || [];
      if (!existing.some(r => normalizeSize(r.size) === normalized)) {
        const newRow: any = { size: normalized, k4_k6: 0, titan1: 0, titan2: 0 };
        customCols.forEach(c => { if (c.isCustom) newRow[c.key] = 0; });
        tier.hdPro = sortRowsBySizeArea([...existing, newRow]);
      }
    } else if (materialId === 'album-mo-phang') {
      const existing = tier.albumMoPhang || [];
      if (!existing.some(r => normalizeSize(r.size) === normalized)) {
        const newRow: any = { stt: existing.length + 1, size: normalized, sheets: 10, price: 0 };
        tier.albumMoPhang = sortRowsBySizeArea([...existing, newRow]);
        tier.albumMoPhang.forEach((r, i) => { r.stt = i + 1; });
      }
    } else if (!isBuiltInMaterial) {
      if (!tier.customTables) tier.customTables = {};
      const customDef = (updated.customMaterials || []).find(m => m.id === materialId);
      const existing = tier.customTables[materialId] || [];

      if (!existing.some(r => normalizeSize(r.size) === normalized)) {
        let newRow: any = { size: normalized };
        if (customDef && customDef.type === 'dong-khung') {
          newRow = { size: normalized, boVien: 0, k0_k3: 0, k4_k6: 0, k7_k9: 0, k10: 0, k11: 0, titan1: 0, titan2: 0 };
        } else if (customDef && customDef.type === 'in-ep') {
          newRow = { stt: existing.length + 1, size: normalized, inEpMika: 0, khungXuongGiaCo: 0 };
        } else {
          newRow = { stt: existing.length + 1, size: normalized, price: 0 };
        }
        customCols.forEach(c => { if (c.isCustom) newRow[c.key] = 0; });
        tier.customTables[materialId] = sortRowsBySizeArea([...existing, newRow]);
        if (newRow.stt !== undefined) {
          tier.customTables[materialId].forEach((r: any, i: number) => { r.stt = i + 1; });
        }
      }
    }
  });

  saveCatalog(updated);
}

export function deleteSizeFromMaterial(
  materialId: PricingMaterialType, 
  rowIndex: number, 
  targetTier: AudienceTierId
) {
  const updated = { ...currentCatalogState };
  const tier = updated.tiers[targetTier];
  if (!tier) return;

  if (materialId === 'in-ep-mika') {
    tier.inEpMika = (tier.inEpMika || []).filter((_, idx) => idx !== rowIndex);
    tier.inEpMika.forEach((r, i) => { r.stt = i + 1; });
  } else if (materialId === 'go-lua') {
    tier.goLua = (tier.goLua || []).filter((_, idx) => idx !== rowIndex);
  } else if (materialId === 'mika-pho-thong') {
    tier.mikaPhoThong = (tier.mikaPhoThong || []).filter((_, idx) => idx !== rowIndex);
  } else if (materialId === 'hd-guong-sieu-bong') {
    tier.hdGuongSieuBong = (tier.hdGuongSieuBong || []).filter((_, idx) => idx !== rowIndex);
  } else if (materialId === 'anh-4k') {
    tier.anh4K = (tier.anh4K || []).filter((_, idx) => idx !== rowIndex);
  } else if (materialId === 'hd-pro') {
    tier.hdPro = (tier.hdPro || []).filter((_, idx) => idx !== rowIndex);
  } else if (materialId === 'album-mo-phang') {
    tier.albumMoPhang = (tier.albumMoPhang || []).filter((_, idx) => idx !== rowIndex);
    tier.albumMoPhang.forEach((r, i) => { r.stt = i + 1; });
  } else {
    if (tier.customTables && tier.customTables[materialId]) {
      tier.customTables[materialId] = tier.customTables[materialId].filter((_, idx) => idx !== rowIndex);
    }
  }

  saveCatalog(updated);
}

export function updateRetailPriceCell(rowIndex: number, field: string, value: number | null) {
  const updated = { ...currentCatalogState };
  const table: RetailPriceRow[] = updated.tiers.retail.retailTable || JSON.parse(JSON.stringify(defaultRetailPricingData));
  updated.tiers.retail.retailTable = table;
  if (table[rowIndex]) {
    (table[rowIndex] as any)[field] = value;
    updated.retailTable = table;
    saveCatalog(updated);
  }
}

export function updateRetailPassportPrice(rowIndex: number, price: number | null) {
  const updated = { ...currentCatalogState };
  const passports: RetailPassportRow[] = updated.tiers.retail.retailPassports || JSON.parse(JSON.stringify(defaultRetailPassportData));
  updated.tiers.retail.retailPassports = passports;
  if (passports[rowIndex]) {
    passports[rowIndex].price = price;
    updated.retailPassports = passports;
    saveCatalog(updated);
  }
}

export function addRetailSizeRow(sizeStr: string) {
  const updated = { ...currentCatalogState };
  let table: RetailPriceRow[] = updated.tiers.retail.retailTable || JSON.parse(JSON.stringify(defaultRetailPricingData));
  const norm = normalizeSize(sizeStr).replace('*', 'x');
  const exists = table.some(r => normalizeSize(r.size) === normalizeSize(sizeStr));
  if (!exists && norm) {
    const cols = getTableColumnConfigs('retail');
    const newRow: any = {
      size: norm,
      inEpMika: null,
      hdBoVien: null,
      hdTitan1: null,
      hdTitan2: null,
      hdK10: null
    };
    cols.forEach(c => {
      if (c.isCustom) {
        newRow[c.key] = 0;
      }
    });
    table.push(newRow);
    // Tự động sắp xếp lại toàn bộ mảng dữ liệu kích thước từ nhỏ đến lớn theo diện tích
    table = sortRowsBySizeArea(table);
    updated.tiers.retail.retailTable = table;
    updated.retailTable = table;
    saveCatalog(updated);
  }
}

export function deleteRetailSizeRow(rowIndex: number) {
  const updated = { ...currentCatalogState };
  if (updated.tiers.retail.retailTable && updated.tiers.retail.retailTable[rowIndex]) {
    updated.tiers.retail.retailTable.splice(rowIndex, 1);
    updated.retailTable = updated.tiers.retail.retailTable;
    saveCatalog(updated);
  }
}

/**
 * Quản lý Cột Động & Kéo Thả (Dynamic Columns & Drag-and-Drop) theo từng phân hệ & từng bảng giá chất liệu
 */
export function getTableColumnConfigs(tableKey: string, tierId?: AudienceTierId): TableColumnConfig[] {
  const targetTier: AudienceTierId = tierId || (tableKey === 'retail' ? 'retail' : (currentCatalogState.activeTier || 'studio'));
  const tierCols = currentCatalogState.tiers?.[targetTier]?.columnConfigs?.[tableKey];
  if (tierCols && tierCols.length > 0) {
    return tierCols;
  }
  if (currentCatalogState.columnConfigs && currentCatalogState.columnConfigs[tableKey]) {
    return currentCatalogState.columnConfigs[tableKey];
  }
  return getDefaultColumnsForTable(tableKey);
}

function getTierMaterialRows(tier: TierPricingTables, tableKey: string): any[] | null {
  if (tableKey === 'go-lua') return tier.goLua;
  if (tableKey === 'mika-pho-thong') return tier.mikaPhoThong;
  if (tableKey === 'hd-guong-sieu-bong') return tier.hdGuongSieuBong;
  if (tableKey === 'anh-4k') return tier.anh4K;
  if (tableKey === 'hd-pro') return tier.hdPro;
  if (tableKey === 'in-ep-mika') return tier.inEpMika;
  if (tier.customTables && tier.customTables[tableKey]) return tier.customTables[tableKey];
  return null;
}

export function addColumnToTable(
  tableKey: string,
  label: string,
  skuPrefix: string,
  targetTiers?: AudienceTierId[],
  targetMaterialTables?: string[]
) {
  const updated = { ...currentCatalogState };
  if (!updated.columnConfigs) {
    updated.columnConfigs = getInitialColumnConfigsMap();
  }

  const cleanPrefix = skuPrefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || 'COL';
  const newKey = `col_${cleanPrefix.toLowerCase()}_${Date.now()}`;

  const newCol: TableColumnConfig = {
    key: newKey,
    label: label.trim(),
    skuPrefix: cleanPrefix,
    isCustom: true,
    defaultColor: 'text-amber-300 font-bold'
  };

  const tiersToApply: AudienceTierId[] =
    targetTiers && targetTiers.length > 0
      ? targetTiers
      : [tableKey === 'retail' ? 'retail' : (updated.activeTier || 'studio')];

  const materialsToApply: string[] =
    targetMaterialTables && targetMaterialTables.length > 0
      ? targetMaterialTables
      : [tableKey];

  tiersToApply.forEach(tierKey => {
    const tier = updated.tiers[tierKey];
    if (!tier) return;
    if (!tier.columnConfigs) {
      tier.columnConfigs = getInitialColumnConfigsMap();
    }

    // 1. Nếu áp dụng cho phân hệ Khách Lẻ (Retail)
    if (tierKey === 'retail') {
      const currentRetailCols = tier.columnConfigs['retail']
        ? [...tier.columnConfigs['retail']]
        : getDefaultColumnsForTable('retail');
      if (!currentRetailCols.some(c => c.key === newKey || (c.isCustom && c.skuPrefix === cleanPrefix && c.label === newCol.label))) {
        currentRetailCols.push({ ...newCol });
      }
      tier.columnConfigs['retail'] = currentRetailCols;
      updated.columnConfigs!['retail'] = currentRetailCols;

      const retailRows = tier.retailTable || [];
      retailRows.forEach(row => {
        if (row[newKey] === undefined) {
          row[newKey] = 0;
        }
      });
      updated.retailTable = retailRows;
    }

    // 2. Áp dụng cho các bảng chất liệu được chọn (Gỗ lụa, HD gương, Mika, 4K, HD Pro, Custom...)
    materialsToApply.forEach(matTableKey => {
      if (matTableKey === 'retail') return;
      const currentMatCols = tier.columnConfigs![matTableKey]
        ? [...tier.columnConfigs![matTableKey]]
        : getDefaultColumnsForTable(matTableKey);

      if (!currentMatCols.some(c => c.key === newKey || (c.isCustom && c.skuPrefix === cleanPrefix && c.label === newCol.label))) {
        currentMatCols.push({ ...newCol });
      }
      tier.columnConfigs![matTableKey] = currentMatCols;
      if (tierKey === (updated.activeTier || 'studio')) {
        updated.columnConfigs![matTableKey] = currentMatCols;
      }

      const rows = getTierMaterialRows(tier, matTableKey);
      if (rows) {
        rows.forEach(row => {
          if (row[newKey] === undefined) {
            row[newKey] = 0;
          }
        });
      }
    });
  });

  saveCatalog(updated);
}

export function reorderTableColumns(
  tableKey: string,
  newColumns: TableColumnConfig[],
  tierId?: AudienceTierId
) {
  const updated = { ...currentCatalogState };
  const targetTier: AudienceTierId = tierId || (tableKey === 'retail' ? 'retail' : (updated.activeTier || 'studio'));
  if (!updated.columnConfigs) {
    updated.columnConfigs = getInitialColumnConfigsMap();
  }
  if (!updated.tiers[targetTier].columnConfigs) {
    updated.tiers[targetTier].columnConfigs = getInitialColumnConfigsMap();
  }
  updated.tiers[targetTier].columnConfigs![tableKey] = newColumns;
  updated.columnConfigs[tableKey] = newColumns;
  saveCatalog(updated);
}

export function deleteColumnFromTable(
  tableKey: string,
  columnKey: string,
  targetTiers?: AudienceTierId[],
  targetMaterialTables?: string[],
  columnSkuPrefix?: string,
  columnLabel?: string
) {
  const updated = { ...currentCatalogState };
  if (!updated.columnConfigs) {
    updated.columnConfigs = getInitialColumnConfigsMap();
  }

  const tiersToApply: AudienceTierId[] =
    targetTiers && targetTiers.length > 0
      ? targetTiers
      : [tableKey === 'retail' ? 'retail' : (updated.activeTier || 'studio')];

  const materialsToApply: string[] =
    targetMaterialTables && targetMaterialTables.length > 0
      ? targetMaterialTables
      : [tableKey];

  const shouldRemoveCol = (c: TableColumnConfig) => {
    if (c.key === columnKey) return true;
    if (columnSkuPrefix && c.skuPrefix && c.skuPrefix.toUpperCase() === columnSkuPrefix.toUpperCase()) return true;
    if (columnLabel && c.isCustom && c.label.trim().toLowerCase() === columnLabel.trim().toLowerCase()) return true;
    // Match cross-tier equivalent standard keys between B2B and Retail if both selected
    if (columnKey === 'boVien' && c.key === 'hdBoVien') return true;
    if (columnKey === 'hdBoVien' && c.key === 'boVien') return true;
    if (columnKey === 'titan1' && c.key === 'hdTitan1') return true;
    if (columnKey === 'hdTitan1' && c.key === 'titan1') return true;
    if (columnKey === 'titan2' && c.key === 'hdTitan2') return true;
    if (columnKey === 'hdTitan2' && c.key === 'titan2') return true;
    if (columnKey === 'k10' && c.key === 'hdK10') return true;
    if (columnKey === 'hdK10' && c.key === 'k10') return true;
    return false;
  };

  tiersToApply.forEach(tierKey => {
    const tier = updated.tiers[tierKey];
    if (!tier) return;
    if (!tier.columnConfigs) {
      tier.columnConfigs = getInitialColumnConfigsMap();
    }

    if (tierKey === 'retail') {
      const currentRetailCols = tier.columnConfigs['retail']
        ? [...tier.columnConfigs['retail']]
        : getDefaultColumnsForTable('retail');
      const filteredRetail = currentRetailCols.filter(c => !shouldRemoveCol(c));
      tier.columnConfigs['retail'] = filteredRetail;
      updated.columnConfigs!['retail'] = filteredRetail;
    }

    materialsToApply.forEach(matTableKey => {
      if (matTableKey === 'retail') return;
      const currentMatCols = tier.columnConfigs![matTableKey]
        ? [...tier.columnConfigs![matTableKey]]
        : getDefaultColumnsForTable(matTableKey);
      const filteredMat = currentMatCols.filter(c => !shouldRemoveCol(c));
      tier.columnConfigs![matTableKey] = filteredMat;
      if (tierKey === (updated.activeTier || 'studio')) {
        updated.columnConfigs![matTableKey] = filteredMat;
      }
    });
  });

  saveCatalog(updated);
}

export function getMasterCatalog(): MasterCatalogData {
  return currentCatalogState;
}

/**
 * Custom React hook for subscribing to Master Catalog state
 */
export function useMasterCatalog(): MasterCatalogData {
  const [catalog, setCatalog] = useState<MasterCatalogData>(currentCatalogState);

  useEffect(() => {
    const handler = (updated: MasterCatalogData) => setCatalog({ ...updated });
    subscribers.add(handler);
    return () => {
      subscribers.delete(handler);
    };
  }, []);

  return catalog;
}
