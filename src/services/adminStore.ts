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
import { FRAMES, FrameConstantItem } from '../constants/frames';
import { normalizeSize } from '../utils/skuGenerator';
import { sanitizeFramesForFirestore, sanitizeFramePathForFirestore } from '../utils/frameImageResolver';
import { syncCatalogToFirestore, MASTER_FRAMES_DOC_ID } from './catalogSync';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebase';

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

export {
  EXACT_44_RETAIL_SKUS,
  EXACT_RETAIL_SKU_SET,
  DEFAULT_RETAIL_COLUMNS,
  defaultRetailPricingData,
  defaultRetailPassportData,
  isAllowedRetailCell,
  sanitizeAndLockRetailData
} from '../data/initialData';

import {
  EXACT_RETAIL_SKU_SET,
  DEFAULT_RETAIL_COLUMNS,
  defaultRetailPricingData,
  defaultRetailPassportData,
  isAllowedRetailCell,
  sanitizeAndLockRetailData
} from '../data/initialData';

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
      { key: 'inAnh', label: 'Giá In Ảnh', skuPrefix: 'IN', defaultColor: 'text-sky-400 font-bold' },
      { key: 'inEpMika', label: 'Giá In Ép Mika', skuPrefix: 'inep', defaultColor: 'text-emerald-400 font-bold' },
      { key: 'khungXuongGiaCo', label: 'Khung Xương Gia Cố', skuPrefix: 'NEP', defaultColor: 'text-amber-300' }
    ];
  }
  return JSON.parse(JSON.stringify(DEFAULT_DONG_KHUNG_COLUMNS));
}

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
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return getDefaultCatalog();
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

    const sanitizedRetail = sanitizeAndLockRetailData(tiers.retail.retailTable, tiers.retail.retailPassports);
    tiers.retail.retailTable = sortRowsBySizeArea(sanitizedRetail.retailTable);
    tiers.retail.retailPassports = sanitizedRetail.retailPassports;
    if (!tiers.retail.columnConfigs) {
      tiers.retail.columnConfigs = getInitialColumnConfigsMap();
    }
    if (!tiers.retail.columnConfigs.retail || tiers.retail.columnConfigs.retail.length === 0) {
      tiers.retail.columnConfigs.retail = JSON.parse(JSON.stringify(DEFAULT_RETAIL_COLUMNS));
    }

    // Load or initialize column configs
    const fallbackGlobalCols: Record<string, TableColumnConfig[]> = parsed.columnConfigs || defaults.columnConfigs || getInitialColumnConfigsMap();
    if (!fallbackGlobalCols.retail || fallbackGlobalCols.retail.length === 0) {
      fallbackGlobalCols.retail = JSON.parse(JSON.stringify(DEFAULT_RETAIL_COLUMNS));
    }
    const standardTableKeys = ['retail', 'go-lua', 'hd-guong-sieu-bong', 'mika-pho-thong', 'anh-4k', 'hd-pro', 'in-ep-mika'];
    standardTableKeys.forEach(k => {
      if (!fallbackGlobalCols[k] || (k === 'in-ep-mika' && !fallbackGlobalCols[k].some((c: TableColumnConfig) => c.key === 'inAnh'))) {
        fallbackGlobalCols[k] = getDefaultColumnsForTable(k);
      }
    });

    (['studio', 'freelance', 'retail'] as const).forEach(tierKey => {
      const t = tiers[tierKey];
      if (!t.columnConfigs) {
        t.columnConfigs = JSON.parse(JSON.stringify(fallbackGlobalCols));
      } else {
        standardTableKeys.forEach(k => {
          if (!t.columnConfigs![k] || (k === 'in-ep-mika' && !t.columnConfigs![k].some((c: TableColumnConfig) => c.key === 'inAnh'))) {
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
      frames: normalizeCatalogFrames(parsed.frames || defaults.frames),
      shopInfo: parsed.shopInfo || defaults.shopInfo
    };
  } catch (e) {
    console.error("Error reading stored catalog from localStorage:", e);
    return getDefaultCatalog();
  }
}

/**
 * Chuẩn hóa danh sách mẫu khung để mọi mẫu khung (bao gồm mẫu thứ 15, 16... được Admin thêm mới)
 * luôn có đầy đủ `imageUrl`, `image`, `hasRealPhotos: true` và mảng `images` hợp lệ.
 */
export function normalizeCatalogFrames(rawFrames: any[]): FrameConstantItem[] {
  if (!Array.isArray(rawFrames) || rawFrames.length === 0) {
    return JSON.parse(JSON.stringify(FRAMES));
  }

  const mapped = rawFrames.map((f: any, idx: number) => {
    const code = (f.code || `K${idx}`).trim();
    const canonical = FRAMES.find(
      (cf) => cf.code.toLowerCase() === code.toLowerCase()
    );

    const primaryImg = sanitizeFramePathForFirestore(
      f.imageUrl || f.image || f.images?.[0]?.url || canonical?.imageUrl || '/images/frames/khung-k0.jpg'
    );

    let images = Array.isArray(f.images) && f.images.length > 0 ? f.images : [];
    if (canonical && canonical.images.length > 1 && images.length < canonical.images.length) {
      images = JSON.parse(JSON.stringify(canonical.images));
    } else if (images.length === 0) {
      images = [
        {
          name: `${code}: ${f.variants || f.name || code}`,
          url: primaryImg,
        },
      ];
    } else if (images.length === 1 && (f.imageUrl || f.image)) {
      images = [
        {
          ...images[0],
          name: images[0].name || `${code}: ${f.variants || f.name || code}`,
          url: primaryImg,
        },
      ];
    }

    return {
      id: f.id || canonical?.id || `frame_${code.toLowerCase().replace(/\s+/g, '_')}_${idx}`,
      code,
      name: f.name || canonical?.name || `Mẫu Khung ${code}`,
      imageUrl: primaryImg,
      image: primaryImg,
      dimensions: f.dimensions || canonical?.dimensions || 'Quy chuẩn xưởng 194',
      description: f.description || canonical?.description || '',
      suitableFor: f.suitableFor || canonical?.suitableFor || '',
      variants: f.variants || canonical?.variants || 'Màu tiêu chuẩn',
      hasRealPhotos: f.hasRealPhotos !== undefined ? Boolean(f.hasRealPhotos) : true,
      images,
    } as FrameConstantItem;
  });

  return sanitizeFramesForFirestore(mapped);
}

/**
 * Danh sách khung hợp lệ hiển thị theo từng phân hệ.
 * Với Khách Lẻ (retail): Chỉ hiển thị các mẫu khung nằm trong 44 mã SKU thật (Titan 1, Titan 2, K10).
 * Tuyệt đối không hiển thị các mẫu khung không có trong 44 SKU như K4, K5, K6...
 * Với Thợ / Studio: Hiển thị toàn bộ mẫu khung xưởng sản xuất (K0 đến K11, Titan 1, Titan 2, v.v.).
 */
export function getVisibleFramesForTier(
  catalog: MasterCatalogData,
  _tier?: AudienceTierId | null
): FrameConstantItem[] {
  const allFrames = normalizeCatalogFrames(
    catalog?.frames && catalog.frames.length > 0 ? catalog.frames : FRAMES
  );

  return allFrames;
}

// Global subscribers for reactive UI re-renders across the app
type Subscriber = (catalog: MasterCatalogData) => void;
const subscribers: Set<Subscriber> = new Set();

let currentCatalogState: MasterCatalogData = loadStoredCatalog();
let autoSyncTimeout: ReturnType<typeof setTimeout> | null = null;
let isPendingLocalSync = false;

function scheduleAutoSyncToFirestore() {
  isPendingLocalSync = true;
  if (autoSyncTimeout) {
    clearTimeout(autoSyncTimeout);
  }
  autoSyncTimeout = setTimeout(() => {
    syncCatalogToFirestore(undefined, { isBackgroundAutoSync: true })
      .catch(() => {
        // Handled gracefully in syncCatalogToFirestore
      })
      .finally(() => {
        isPendingLocalSync = false;
      });
  }, 800);
}

export function saveCatalog(newCatalog: MasterCatalogData, shouldAutoSync: boolean = true) {
  newCatalog.lastUpdated = new Date().toISOString();
  if (newCatalog.frames) {
    newCatalog.frames = normalizeCatalogFrames(newCatalog.frames);
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
        retail: newCatalog.tiers?.retail?.columnConfigs?.retail && newCatalog.tiers.retail.columnConfigs.retail.length > 0
          ? newCatalog.tiers.retail.columnConfigs.retail
          : JSON.parse(JSON.stringify(DEFAULT_RETAIL_COLUMNS))
      };
    }
  }

  // Làm sạch dữ liệu Khách Lẻ (lưu các ô có giá > 0, giữ nguyên toàn bộ kích thước và cột mới thêm)
  if (newCatalog.tiers?.retail) {
    const sanitizedRetail = sanitizeAndLockRetailData(
      newCatalog.tiers.retail.retailTable,
      newCatalog.tiers.retail.retailPassports
    );
    newCatalog.tiers.retail.retailTable = sortRowsBySizeArea(sanitizedRetail.retailTable);
    newCatalog.tiers.retail.retailPassports = sanitizedRetail.retailPassports;
    if (!newCatalog.tiers.retail.columnConfigs) {
      newCatalog.tiers.retail.columnConfigs = getInitialColumnConfigsMap();
    }
    if (!newCatalog.tiers.retail.columnConfigs.retail || newCatalog.tiers.retail.columnConfigs.retail.length === 0) {
      newCatalog.tiers.retail.columnConfigs.retail = JSON.parse(JSON.stringify(DEFAULT_RETAIL_COLUMNS));
    }
    newCatalog.retailTable = newCatalog.tiers.retail.retailTable;
    newCatalog.retailPassports = newCatalog.tiers.retail.retailPassports;
  }

  currentCatalogState = newCatalog;
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCatalog));
    }
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
  const prevRetailColConfigs = updated.tiers.retail.columnConfigs;
  updated.tiers.retail = generateTierTablesFromStudio(updated.tiers.studio, factor);
  const sanitized = sanitizeAndLockRetailData(prevRetailTable, prevRetailPassports);
  updated.tiers.retail.retailTable = sortRowsBySizeArea(sanitized.retailTable);
  updated.tiers.retail.retailPassports = sanitized.retailPassports;
  updated.tiers.retail.columnConfigs = prevRetailColConfigs || getInitialColumnConfigsMap();
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
    (table[rowIndex] as any)[field] = value !== null && value > 0 ? value : null;
    const sanitized = sanitizeAndLockRetailData(table, updated.tiers.retail.retailPassports);
    updated.tiers.retail.retailTable = sanitized.retailTable;
    updated.retailTable = sanitized.retailTable;
    saveCatalog(updated);
  }
}

export function updateRetailPassportPrice(rowIndex: number, price: number | null) {
  const updated = { ...currentCatalogState };
  const passports: RetailPassportRow[] = updated.tiers.retail.retailPassports || JSON.parse(JSON.stringify(defaultRetailPassportData));
  updated.tiers.retail.retailPassports = passports;
  if (passports[rowIndex]) {
    passports[rowIndex].price = price !== null && price > 0 ? price : null;
    const sanitized = sanitizeAndLockRetailData(updated.tiers.retail.retailTable, passports);
    updated.tiers.retail.retailPassports = sanitized.retailPassports;
    updated.retailPassports = sanitized.retailPassports;
    saveCatalog(updated);
  }
}

export function addRetailSizeRow(sizeStr: string) {
  const normStar = normalizeSize(sizeStr);
  if (!normStar) return;
  const displaySize = normStar.replace(/\*/g, 'x');

  const updated = { ...currentCatalogState };
  let table: RetailPriceRow[] = updated.tiers.retail.retailTable || JSON.parse(JSON.stringify(defaultRetailPricingData));
  const exists = table.some(r => normalizeSize(r.size) === normStar);
  if (!exists) {
    const defRow = defaultRetailPricingData.find(d => normalizeSize(d.size) === normStar);
    const retailCols = getTableColumnConfigs('retail', 'retail');
    const newRow: RetailPriceRow = defRow
      ? { ...defRow, size: displaySize }
      : {
          size: displaySize,
          inEpMika: null,
          hdBoVien: null,
          hdTitan1: null,
          hdTitan2: null,
          hdK10: null,
        };
    retailCols.forEach(c => {
      if (newRow[c.key] === undefined) {
        newRow[c.key] = null;
      }
    });
    table.push(newRow);
    table = sortRowsBySizeArea(table);
    const sanitized = sanitizeAndLockRetailData(table, updated.tiers.retail.retailPassports);
    updated.tiers.retail.retailTable = sortRowsBySizeArea(sanitized.retailTable);
    updated.retailTable = updated.tiers.retail.retailTable;
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
 * Quản lý Cột Động & Kéo Thả (Dynamic Columns & Drag-and-Drop) theo từng phân hệ & từng bảng giá chất liệu.
 */
export function getTableColumnConfigs(tableKey: string, tierId?: AudienceTierId): TableColumnConfig[] {
  const targetTier: AudienceTierId = tierId || (tableKey === 'retail' ? 'retail' : (currentCatalogState.activeTier || 'studio'));
  const tierCols = currentCatalogState.tiers?.[targetTier]?.columnConfigs?.[tableKey];
  if (tierCols && tierCols.length > 0) {
    return tierCols;
  }
  if (currentCatalogState.columnConfigs && currentCatalogState.columnConfigs[tableKey] && currentCatalogState.columnConfigs[tableKey].length > 0) {
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

    // 1. Khi áp dụng cho phân hệ Khách Lẻ (Retail)
    if (tierKey === 'retail') {
      if (tableKey === 'retail' || !tableKey.startsWith('custom-')) {
        const currentRetailCols = tier.columnConfigs['retail'] && tier.columnConfigs['retail'].length > 0
          ? [...tier.columnConfigs['retail']]
          : getDefaultColumnsForTable('retail');
        if (!currentRetailCols.some(c => c.key === newKey || (c.isCustom && c.skuPrefix === cleanPrefix && c.label === newCol.label))) {
          currentRetailCols.push({ ...newCol });
        }
        tier.columnConfigs['retail'] = currentRetailCols;
        updated.columnConfigs!['retail'] = currentRetailCols;

        if (tier.retailTable) {
          tier.retailTable.forEach(row => {
            if (row[newKey] === undefined) {
              row[newKey] = null;
            }
          });
        }
      }
      // Hỗ trợ thêm cột cho bảng chất liệu tùy chỉnh trong Khách Lẻ
      materialsToApply.forEach(matTableKey => {
        if (!matTableKey.startsWith('custom-')) return;
        const currentMatCols = tier.columnConfigs![matTableKey]
          ? [...tier.columnConfigs![matTableKey]]
          : getDefaultColumnsForTable(matTableKey);
        if (!currentMatCols.some(c => c.key === newKey || (c.isCustom && c.skuPrefix === cleanPrefix && c.label === newCol.label))) {
          currentMatCols.push({ ...newCol });
        }
        tier.columnConfigs![matTableKey] = currentMatCols;
        const rows = getTierMaterialRows(tier, matTableKey);
        if (rows) {
          rows.forEach(row => {
            if (row[newKey] === undefined) {
              row[newKey] = null;
            }
          });
        }
      });
      return;
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

let remoteListenersInitialized = false;
let framesUnsubscribe: Unsubscribe | null = null;
let pricingUnsubscribe: Unsubscribe | null = null;

function attachFirestoreListeners() {
  if (framesUnsubscribe) {
    framesUnsubscribe();
    framesUnsubscribe = null;
  }
  if (pricingUnsubscribe) {
    pricingUnsubscribe();
    pricingUnsubscribe = null;
  }

  try {
    // 1. Lắng nghe trực tiếp danh mục mẫu khung từ master_catalog/frames2026_master
    const framesDocRef = doc(db, 'master_catalog', MASTER_FRAMES_DOC_ID);
    framesUnsubscribe = onSnapshot(
      framesDocRef,
      (docSnap) => {
        if (isPendingLocalSync || !docSnap.exists()) return;
        const data = docSnap.data();
        if (Array.isArray(data?.frames) && data.frames.length > 0) {
          const remoteFrames = normalizeCatalogFrames(data.frames);
          const updated: MasterCatalogData = {
            ...currentCatalogState,
            frames: remoteFrames,
            lastUpdated: data.updatedAt || currentCatalogState.lastUpdated,
          };
          saveCatalog(updated, false);
        }
      },
      () => {
        // Fallback sang dữ liệu lưu cục bộ khi Firestore chưa mở quyền đọc
      }
    );

    // 2. Lắng nghe cấu hình tổng thể (bảng giá + mẫu khung + chất liệu tùy chỉnh) từ system_config/master_pricing
    const masterPricingRef = doc(db, 'system_config', 'master_pricing');
    pricingUnsubscribe = onSnapshot(
      masterPricingRef,
      (docSnap) => {
        if (isPendingLocalSync || !docSnap.exists()) return;
        const data = docSnap.data();
        if (!data) return;

        const nextCatalog: MasterCatalogData = { ...currentCatalogState };
        let hasChanges = false;

        const remoteFramesRaw =
          Array.isArray(data.frames) && data.frames.length > 0
            ? data.frames
            : Array.isArray(data.frameReferenceGuide) && data.frameReferenceGuide.length > 0
            ? data.frameReferenceGuide
            : null;

        if (remoteFramesRaw) {
          nextCatalog.frames = normalizeCatalogFrames(remoteFramesRaw);
          hasChanges = true;
        }

        if (data.tiers && data.tiers.studio) {
          const rawRemoteRetail = data.tiers.retail || {};
          const sanitizedRetail = sanitizeAndLockRetailData(rawRemoteRetail.retailTable, rawRemoteRetail.retailPassports);
          nextCatalog.tiers = {
            studio: { ...nextCatalog.tiers.studio, ...data.tiers.studio },
            freelance: { ...nextCatalog.tiers.freelance, ...(data.tiers.freelance || {}) },
            retail: {
              ...nextCatalog.tiers.retail,
              ...rawRemoteRetail,
              retailTable: sortRowsBySizeArea(sanitizedRetail.retailTable),
              retailPassports: sanitizedRetail.retailPassports,
              columnConfigs: {
                ...(nextCatalog.tiers.retail.columnConfigs || {}),
                ...(rawRemoteRetail.columnConfigs || {}),
                retail: rawRemoteRetail.columnConfigs?.retail && rawRemoteRetail.columnConfigs.retail.length > 0
                  ? rawRemoteRetail.columnConfigs.retail
                  : (nextCatalog.tiers.retail.columnConfigs?.retail || JSON.parse(JSON.stringify(DEFAULT_RETAIL_COLUMNS)))
              }
            },
          };
          hasChanges = true;
        }

        if (Array.isArray(data.customMaterials)) {
          nextCatalog.customMaterials = data.customMaterials;
          hasChanges = true;
        }

        if (data.shopInfo) {
          nextCatalog.shopInfo = { ...nextCatalog.shopInfo, ...data.shopInfo };
          hasChanges = true;
        }

        if (hasChanges) {
          saveCatalog(nextCatalog, false);
        }
      },
      () => {
        // Fallback sang dữ liệu lưu cục bộ khi Firestore chưa mở quyền đọc
      }
    );
  } catch {
    // Ignore listener initialization error
  }
}

/**
 * Tự động lắng nghe dữ liệu mới nhất từ Cloud Firestore (cả danh mục khung `master_catalog/frames2026_master`
 * và bảng giá `system_config/master_pricing`) khi khách truy cập.
 */
export function ensureRemoteCatalogSubscription() {
  if (remoteListenersInitialized || typeof window === 'undefined') return;
  remoteListenersInitialized = true;

  attachFirestoreListeners();

  try {
    onAuthStateChanged(auth, () => {
      attachFirestoreListeners();
    });
  } catch {
    // Ignore auth listener error
  }
}

/**
 * Custom React hook for subscribing to Master Catalog state (and auto-pulling from Firestore)
 */
export function useMasterCatalog(): MasterCatalogData {
  const [catalog, setCatalog] = useState<MasterCatalogData>(currentCatalogState);

  useEffect(() => {
    ensureRemoteCatalogSubscription();
    const handler = (updated: MasterCatalogData) => setCatalog({ ...updated });
    subscribers.add(handler);
    return () => {
      subscribers.delete(handler);
    };
  }, []);

  return catalog;
}

export const useAdminStore = useMasterCatalog;

