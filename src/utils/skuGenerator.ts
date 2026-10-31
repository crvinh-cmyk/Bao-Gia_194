import { AudienceTierId, PricingMaterialType, TierPricingTables, CustomMaterialDef } from '../types/admin';

/**
 * Normalizes any size string to standardized '*' format without spaces.
 * Examples: '45x60', '45 X 60', '45*60', '45 * 60' -> '45*60'
 */
export function normalizeSize(size: string): string {
  if (!size) return '';
  return size
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/x/g, '*');
}

/**
 * Alias for normalizeSize for backward compatibility
 */
export function formatSkuSize(size: string): string {
  return normalizeSize(size);
}

/**
 * Returns the Tier code ('ST', 'FL', or 'KL')
 */
export function getTierCode(tier: AudienceTierId): 'ST' | 'FL' | 'KL' {
  if (tier === 'studio') return 'ST';
  if (tier === 'freelance') return 'FL';
  return 'KL';
}

/**
 * Frame field to SKU suffix mapping
 */
export const FRAME_SUFFIX_MAP: Record<string, string> = {
  boVien: '',
  inEpMika: '',
  price: '',
  k0_k3: 'K0123',
  k4_k6: 'K456',
  k7_k9: 'K789',
  k10: 'K10',
  k11: 'K11',
  titan1: 'TT1',
  titan2: 'TT2'
};

/**
 * Generates exact cell SKU based on material definition (or dynamic custom material), tier, size, and column field.
 * Standard Formula: [MaterialPrefix] + [TierCode] + [NormalizedSize] + [Suffix]
 */
export function generateCellSku(
  material: PricingMaterialType,
  tier: AudienceTierId,
  size: string,
  fieldKey: string,
  customMaterialsDef?: CustomMaterialDef[],
  customSkuPrefix?: string
): string {
  const tierCode = getTierCode(tier);
  const starSize = normalizeSize(size);
  const suffix = customSkuPrefix !== undefined ? customSkuPrefix : (FRAME_SUFFIX_MAP[fieldKey] ?? '');

  // Check if material is a custom dynamic material
  const customDef = customMaterialsDef?.find(m => m.id === material);
  if (customDef) {
    if (customDef.type === 'dong-khung') {
      const prefix = fieldKey === 'boVien' ? customDef.boVienPrefix : (customDef.khungPrefix || customDef.boVienPrefix);
      return `${prefix}${tierCode}${starSize}${suffix}`;
    }
    if (customDef.type === 'in-ep') {
      if (fieldKey === 'khungXuongGiaCo') {
        const prefix = customDef.khungPrefix || 'NEP';
        return `${prefix}${tierCode}_${starSize}`;
      }
      return `${customDef.boVienPrefix}${tierCode}${starSize}${suffix}`;
    }
    if (customDef.type === 'album') {
      return `${customDef.boVienPrefix}${starSize}${tierCode}${suffix}`;
    }
    return `${customDef.boVienPrefix}${tierCode}${starSize}${suffix}`;
  }

  // 1. In Ép Mika & Khung Xương Gia Cố
  if (material === 'in-ep-mika') {
    if (fieldKey === 'khungXuongGiaCo') {
      if (starSize === '80*120') return `NEP${tierCode}1`;
      if (starSize === '100*150') return `NEP${tierCode}2`;
      if (starSize === '110*180') return `NEP${tierCode}3`;
      return `NEP${tierCode}_${starSize}`;
    }
    if (customSkuPrefix) {
      return `inep${tierCode}${starSize}${customSkuPrefix}`;
    }
    return `inep${tierCode}${starSize}`;
  }

  // 2. Gỗ Lụa
  if (material === 'go-lua') {
    if (fieldKey === 'boVien') {
      return `LV${tierCode}${starSize}`;
    }
    return `LK${tierCode}${starSize}${suffix}`;
  }

  // 3. Mika Phổ Thông
  if (material === 'mika-pho-thong') {
    return `MK${tierCode}${starSize}${suffix}`;
  }

  // 4. HD Gương Siêu Bóng
  if (material === 'hd-guong-sieu-bong') {
    return `HD${tierCode}${starSize}${suffix}`;
  }

  // 5. Ảnh 4K Cao Cấp
  if (material === 'anh-4k') {
    return `4K${tierCode}${starSize}${suffix}`;
  }

  // 6. HD PRO Khung Cao Cấp
  if (material === 'hd-pro') {
    return `HDPRO${tierCode}${starSize}${suffix}`;
  }

  // 7. Album Mở Phẳng
  if (material === 'album-mo-phang') {
    const cleanSize = starSize.replace(/\*/g, 'x');
    if (cleanSize === '20x20') {
      return `ABMP20${tierCode}`;
    }
    if (cleanSize === '20x30') {
      return `ABMP20x30${tierCode}`;
    }
    if (cleanSize === '30x30') {
      return `ABMP30x30${tierCode}`;
    }
    return `ABMP${cleanSize}${tierCode}`;
  }

  return `${String(material).toUpperCase()}${tierCode}${starSize}${suffix}`;
}

export interface FlattenedSkuItem {
  sku: string;
  name?: string;
  category?: string;
  material: PricingMaterialType;
  tier: AudienceTierId;
  size: string;
  variantKey: string;
  variantLabel?: string;
  price: number | null;
}

export function generateRetailCellSku(size: string, colKey: string, customPrefix?: string): string {
  const starSize = normalizeSize(size);
  if (colKey === 'inEpMika') return `inepKL${starSize}`;
  if (colKey === 'hdBoVien') return `HDKL${starSize}`;
  if (colKey === 'hdTitan1') return `HDKL${starSize}TT1`;
  if (colKey === 'hdTitan2') return `HDKL${starSize}TT2`;
  if (colKey === 'hdK10') return `HDKL${starSize}K10`;
  if (colKey === 'passport') return `ATKL${starSize}`;
  if (customPrefix) return `HDKL${starSize}${customPrefix}`;
  return `KL${starSize}_${colKey}`;
}

/**
 * Enriches a TierPricingTables object by attaching `skus` / `sku` to every row,
 * including dynamic custom materials and tables, and returns a flat array of all SKU records.
 */
export function buildEnrichedTierData(
  tables: TierPricingTables, 
  tier: AudienceTierId,
  customMaterialsDef: CustomMaterialDef[] = []
) {
  const flatItems: FlattenedSkuItem[] = [];
  const retailProducts: FlattenedSkuItem[] = [];
  const isRetailTier = tier === 'retail';

  const inEpMika = (tables.inEpMika || []).map(row => {
    const skuInEp = generateCellSku('in-ep-mika', tier, row.size, 'inEpMika', customMaterialsDef);
    const hasGiaCo = row.size.includes('80') || row.size.includes('100') || row.size.includes('110') || row.khungXuongGiaCo !== undefined;
    const skuGiaCo = hasGiaCo ? generateCellSku('in-ep-mika', tier, row.size, 'khungXuongGiaCo', customMaterialsDef) : undefined;

    if (!isRetailTier) {
      flatItems.push({
        sku: skuInEp,
        name: `In Ép Mika ${row.size}`,
        material: 'in-ep-mika',
        tier,
        size: normalizeSize(row.size),
        variantKey: 'inEpMika',
        price: row.inEpMika ?? null
      });

      if (skuGiaCo) {
        flatItems.push({
          sku: skuGiaCo,
          name: `Khung Xương Gia Cố ${row.size}`,
          material: 'in-ep-mika',
          tier,
          size: normalizeSize(row.size),
          variantKey: 'khungXuongGiaCo',
          price: row.khungXuongGiaCo ?? null
        });
      }
    }

    return {
      ...row,
      sku: skuInEp,
      skus: {
        inEpMika: skuInEp,
        ...(skuGiaCo ? { khungXuongGiaCo: skuGiaCo } : {})
      }
    };
  });

  const enrichDongKhung = (rows: typeof tables.goLua = [], material: PricingMaterialType, pushToFlat: boolean = !isRetailTier) => {
    const configuredCols = tables.columnConfigs?.[material];
    const fields = configuredCols && configuredCols.length > 0
      ? configuredCols
      : [
          { key: 'boVien', label: 'Chỉ Bo Viền' },
          { key: 'k0_k3', label: 'Khung K0 - K3' },
          { key: 'k4_k6', label: 'Khung K4 - K6' },
          { key: 'k7_k9', label: 'Khung K7 - K9' },
          { key: 'k10', label: 'Khung K10' },
          { key: 'k11', label: 'Khung K11' },
          { key: 'titan1', label: 'Khung Titan 1' },
          { key: 'titan2', label: 'Khung Titan 2' },
        ];
    return rows.map(row => {
      const skus: Record<string, string> = {};
      fields.forEach(col => {
        const f = col.key;
        const cellSku = generateCellSku(material, tier, row.size, f, customMaterialsDef, col.isCustom ? col.skuPrefix : undefined);
        skus[f] = cellSku;
        if (pushToFlat) {
          flatItems.push({
            sku: cellSku,
            material,
            tier,
            size: normalizeSize(row.size),
            variantKey: f,
            variantLabel: col.label,
            price: (row as any)[f] ?? null
          });
        }
      });
      return {
        ...row,
        sku: skus.boVien || Object.values(skus)[0] || '',
        skus
      };
    });
  };

  const goLua = enrichDongKhung(tables.goLua || [], 'go-lua');
  const mikaPhoThong = enrichDongKhung(tables.mikaPhoThong || [], 'mika-pho-thong');
  const hdGuongSieuBong = enrichDongKhung(tables.hdGuongSieuBong || [], 'hd-guong-sieu-bong');

  const anh4K = (tables.anh4K || []).map(row => {
    const skuK456 = generateCellSku('anh-4k', tier, row.size, 'k4_k6', customMaterialsDef);
    const skuTT2 = generateCellSku('anh-4k', tier, row.size, 'titan2', customMaterialsDef);
    if (!isRetailTier) {
      flatItems.push(
        { sku: skuK456, material: 'anh-4k', tier, size: normalizeSize(row.size), variantKey: 'k4_k6', price: row.k4_k6 ?? null },
        { sku: skuTT2, material: 'anh-4k', tier, size: normalizeSize(row.size), variantKey: 'titan2', price: row.titan2 ?? null }
      );
    }
    return {
      ...row,
      sku: skuK456,
      skus: {
        k4_k6: skuK456,
        titan2: skuTT2
      }
    };
  });

  const hdPro = (tables.hdPro || []).map(row => {
    const skuK456 = generateCellSku('hd-pro', tier, row.size, 'k4_k6', customMaterialsDef);
    const skuTT1 = generateCellSku('hd-pro', tier, row.size, 'titan1', customMaterialsDef);
    const skuTT2 = generateCellSku('hd-pro', tier, row.size, 'titan2', customMaterialsDef);
    if (!isRetailTier) {
      flatItems.push(
        { sku: skuK456, material: 'hd-pro', tier, size: normalizeSize(row.size), variantKey: 'k4_k6', price: row.k4_k6 ?? null },
        { sku: skuTT1, material: 'hd-pro', tier, size: normalizeSize(row.size), variantKey: 'titan1', price: row.titan1 ?? null },
        { sku: skuTT2, material: 'hd-pro', tier, size: normalizeSize(row.size), variantKey: 'titan2', price: row.titan2 ?? null }
      );
    }
    return {
      ...row,
      sku: skuK456,
      skus: {
        k4_k6: skuK456,
        titan1: skuTT1,
        titan2: skuTT2
      }
    };
  });

  const albumMoPhang = (tables.albumMoPhang || []).map(row => {
    const skuAlbum = generateCellSku('album-mo-phang', tier, row.size, 'price', customMaterialsDef);
    if (!isRetailTier) {
      flatItems.push({
        sku: skuAlbum,
        material: 'album-mo-phang',
        tier,
        size: row.size,
        variantKey: 'price',
        price: row.price ?? null
      });
    }
    return {
      ...row,
      sku: skuAlbum,
      skus: {
        price: skuAlbum
      }
    };
  });

  // Enrich custom material tables if present
  const enrichedCustomTables: Record<string, any[]> = {};
  if (tables.customTables) {
    Object.keys(tables.customTables).forEach(materialId => {
      const rows = tables.customTables?.[materialId] || [];
      const customDef = customMaterialsDef.find(m => m.id === materialId);
      if (customDef) {
        if (customDef.type === 'dong-khung') {
          enrichedCustomTables[materialId] = enrichDongKhung(rows, materialId, true);
        } else {
          enrichedCustomTables[materialId] = rows.map(r => {
            const cellSku = generateCellSku(materialId, tier, r.size, 'boVien', customMaterialsDef);
            flatItems.push({
              sku: cellSku,
              material: materialId,
              tier,
              size: normalizeSize(r.size),
              variantKey: 'boVien',
              price: r.boVien ?? r.price ?? null
            });
            return {
              ...r,
              sku: cellSku,
              skus: { boVien: cellSku }
            };
          });
        }
      }
    });
  }

  // 1. Dịch Vụ Ảnh Thẻ (ATKL*)
  const retailPassports = (tables.retailPassports || []).map(row => {
    const sizeKey = row.code || row.size;
    const normSize = normalizeSize(sizeKey);
    const skuPassport = generateRetailCellSku(sizeKey, 'passport');
    const item: FlattenedSkuItem = {
      sku: skuPassport,
      name: `Ảnh Thẻ Dịch Vụ ${row.size}`,
      category: 'Ảnh Thẻ Dịch Vụ',
      material: 'anh-the-dich-vu',
      tier: 'retail',
      size: normSize,
      variantKey: 'passport',
      variantLabel: (row as any).note || 'Lấy ngay (File + In)',
      price: row.price ?? null
    };
    if (isRetailTier) {
      retailProducts.push(item);
      flatItems.push(item);
    }
    return {
      ...row,
      sku: skuPassport
    };
  });

  // 2. Bảng Giá Khách Lẻ Tinh Gọn (inepKL*, HDKL*, HDKL*TT1, HDKL*TT2, HDKL*K10)
  const retailTable = (tables.retailTable || []).map(row => {
    const normSize = normalizeSize(row.size);
    const skus = {
      inEpMika: generateRetailCellSku(row.size, 'inEpMika'),
      hdBoVien: generateRetailCellSku(row.size, 'hdBoVien'),
      hdTitan1: generateRetailCellSku(row.size, 'hdTitan1'),
      hdTitan2: generateRetailCellSku(row.size, 'hdTitan2'),
      hdK10: generateRetailCellSku(row.size, 'hdK10'),
    };
    const rowItems: FlattenedSkuItem[] = [
      {
        sku: skus.inEpMika,
        name: `In Ép Mika ${row.size}`,
        category: 'In Ép Mika',
        material: 'in-ep-mika',
        tier: 'retail',
        size: normSize,
        variantKey: 'inEpMika',
        variantLabel: 'In Ép Mika (Không khung)',
        price: row.inEpMika ?? null
      },
      {
        sku: skus.hdBoVien,
        name: `HD Siêu Bóng Bo Viền ${row.size}`,
        category: 'HD Gương Siêu Bóng',
        material: 'hd-guong-sieu-bong',
        tier: 'retail',
        size: normSize,
        variantKey: 'hdBoVien',
        variantLabel: 'HD Siêu Bóng Bo Viền',
        price: row.hdBoVien ?? null
      },
      {
        sku: skus.hdTitan1,
        name: `HD Siêu Bóng Khung Titan 1 ${row.size}`,
        category: 'HD Gương Siêu Bóng',
        material: 'hd-guong-sieu-bong',
        tier: 'retail',
        size: normSize,
        variantKey: 'hdTitan1',
        variantLabel: 'HD Siêu Bóng Khung Titan 1',
        price: row.hdTitan1 ?? null
      },
      {
        sku: skus.hdTitan2,
        name: `HD Siêu Bóng Khung Titan 2 ${row.size}`,
        category: 'HD Gương Siêu Bóng',
        material: 'hd-guong-sieu-bong',
        tier: 'retail',
        size: normSize,
        variantKey: 'hdTitan2',
        variantLabel: 'HD Siêu Bóng Khung Titan 2',
        price: row.hdTitan2 ?? null
      },
      {
        sku: skus.hdK10,
        name: `HD Siêu Bóng Khung K10 ${row.size}`,
        category: 'HD Gương Siêu Bóng',
        material: 'hd-guong-sieu-bong',
        tier: 'retail',
        size: normSize,
        variantKey: 'hdK10',
        variantLabel: 'HD Siêu Bóng Khung K10',
        price: row.hdK10 ?? null
      }
    ];

    const customCols = (tables.columnConfigs?.['retail'] || []).filter(c => c.isCustom);
    customCols.forEach(col => {
      const sku = generateRetailCellSku(row.size, col.key, col.skuPrefix);
      (skus as any)[col.key] = sku;
      const customItem: FlattenedSkuItem = {
        sku,
        name: `${col.label} ${row.size}`,
        category: 'Khách Lẻ',
        material: 'hd-guong-sieu-bong',
        tier: 'retail',
        size: normSize,
        variantKey: col.key,
        variantLabel: col.label,
        price: (row as any)[col.key] ?? null
      };
      rowItems.push(customItem);
    });

    if (isRetailTier) {
      retailProducts.push(...rowItems);
      flatItems.push(...rowItems);
    }

    return {
      ...row,
      skus
    };
  });

  return {
    tables: {
      inEpMika,
      goLua,
      mikaPhoThong,
      hdGuongSieuBong,
      anh4K,
      hdPro,
      albumMoPhang,
      retailTable,
      retailPassports,
      customTables: enrichedCustomTables
    },
    flatItems,
    retailProducts
  };
}

