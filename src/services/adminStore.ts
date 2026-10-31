import { useState, useEffect } from 'react';
import { 
  MasterCatalogData, 
  PricingMaterialType, 
  AudienceTierId, 
  TierPricingTables,
  CustomMaterialDef,
  RetailPriceRow,
  RetailPassportRow
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
import { syncCatalogToFirestore } from './catalogSync';

const LOCAL_STORAGE_KEY = 'tiem194_master_catalog_v2';

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

export function getDefaultCatalog(): MasterCatalogData {
  const studioTables = getDefaultStudioTables();
  const freelanceTables = generateTierTablesFromStudio(studioTables, 1.1);
  const retailTables = generateTierTablesFromStudio(studioTables, 1.5);
  retailTables.retailTable = JSON.parse(JSON.stringify(defaultRetailPricingData));
  retailTables.retailPassports = JSON.parse(JSON.stringify(defaultRetailPassportData));

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
      freelanceTier = generateTierTablesFromStudio(studioTier, 1.1);
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

    const activeTables = tiers[activeTier] || tiers.studio;

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
      tiers: tiers,
      frames: parsed.frames || defaults.frames,
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
  updated.tiers.freelance = generateTierTablesFromStudio(updated.tiers.studio, 1.1);
  saveCatalog(updated);
}

export function syncRetailTierFromStudio(factor: number = 1.5) {
  const updated = { ...currentCatalogState };
  updated.tiers.retail = generateTierTablesFromStudio(updated.tiers.studio, factor);
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

  const isBuiltInMaterial = [
    'in-ep-mika', 'go-lua', 'mika-pho-thong', 'hd-guong-sieu-bong', 'anh-4k', 'hd-pro', 'album-mo-phang'
  ].includes(materialId);

  targetTiers.forEach(tierKey => {
    const tier = updated.tiers[tierKey];
    if (!tier) return;

    if (materialId === 'in-ep-mika') {
      const existing = tier.inEpMika || [];
      if (!existing.some(r => normalizeSize(r.size) === normalized)) {
        tier.inEpMika = [...existing, { stt: existing.length + 1, size: normalized, inEpMika: 0 }];
      }
    } else if (['go-lua', 'mika-pho-thong', 'hd-guong-sieu-bong'].includes(materialId)) {
      const key = materialId === 'go-lua' ? 'goLua' : materialId === 'mika-pho-thong' ? 'mikaPhoThong' : 'hdGuongSieuBong';
      const existing = tier[key] || [];
      if (!existing.some(r => normalizeSize(r.size) === normalized)) {
        tier[key] = [...existing, {
          size: normalized, boVien: 0, k0_k3: 0, k4_k6: 0, k7_k9: 0, k10: 0, k11: 0, titan1: 0, titan2: 0
        }] as any;
      }
    } else if (materialId === 'anh-4k') {
      const existing = tier.anh4K || [];
      if (!existing.some(r => normalizeSize(r.size) === normalized)) {
        tier.anh4K = [...existing, { size: normalized, k4_k6: 0, titan2: 0 }];
      }
    } else if (materialId === 'hd-pro') {
      const existing = tier.hdPro || [];
      if (!existing.some(r => normalizeSize(r.size) === normalized)) {
        tier.hdPro = [...existing, { size: normalized, k4_k6: 0, titan1: 0, titan2: 0 }];
      }
    } else if (materialId === 'album-mo-phang') {
      const existing = tier.albumMoPhang || [];
      if (!existing.some(r => normalizeSize(r.size) === normalized)) {
        tier.albumMoPhang = [...existing, { stt: existing.length + 1, size: normalized, sheets: 10, price: 0 }];
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
        tier.customTables[materialId] = [...existing, newRow];
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
  } else {
    if (tier.customTables && tier.customTables[materialId]) {
      tier.customTables[materialId] = tier.customTables[materialId].filter((_, idx) => idx !== rowIndex);
    }
  }

  saveCatalog(updated);
}

export function updateRetailPriceCell(rowIndex: number, field: keyof RetailPriceRow, value: number | null) {
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
  const table: RetailPriceRow[] = updated.tiers.retail.retailTable || JSON.parse(JSON.stringify(defaultRetailPricingData));
  updated.tiers.retail.retailTable = table;
  const norm = normalizeSize(sizeStr).replace('*', 'x');
  const exists = table.some(r => normalizeSize(r.size) === normalizeSize(sizeStr));
  if (!exists && norm) {
    table.push({
      size: norm,
      inEpMika: null,
      hdBoVien: null,
      hdTitan1: null,
      hdTitan2: null,
      hdK10: null
    });
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
