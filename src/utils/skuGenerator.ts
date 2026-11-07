import { AudienceTierId, PricingMaterialType, TierPricingTables, CustomMaterialDef } from '../types/admin';
import { DEFAULT_RETAIL_COLUMNS } from '../data/initialData';

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
  customSkuPrefix?: string,
  sheets?: number
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
    if (fieldKey === 'inAnh') {
      return `IN${tierCode}${starSize}`;
    }
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

  // 7. Album Mở Phẳng (Giữ chuẩn dấu '*' và hậu tố -15T cho loại 15 tờ, gắn đuôi ST/FL)
  if (material === 'album-mo-phang') {
    const rawTrimmed = (size || '').trim();
    const lowerNoSpace = rawTrimmed.toLowerCase().replace(/\s+/g, '');

    // Dòng "Thêm tờ | 1 tờ (2 trang)"
    if (
      sheets === 1 ||
      lowerNoSpace.includes('thêmtờ') ||
      lowerNoSpace.includes('themto') ||
      lowerNoSpace.includes('thêm') ||
      lowerNoSpace.includes('them') ||
      lowerNoSpace === '1t' ||
      lowerNoSpace === '1tờ'
    ) {
      return `ABMPTHEMTO${tierCode}`;
    }

    // Chuẩn hóa kích thước có dấu '*' (VD: 20*20, 20*30, 30*30)
    const baseStarSize = starSize.replace(/-15t$/i, '').replace(/15t$/i, '');
    const is15Sheets = sheets === 15 || /-?15t$/i.test(starSize);

    if (is15Sheets) {
      return `ABMP${baseStarSize}-15T${tierCode}`;
    }
    if (sheets && sheets !== 10 && sheets !== 1) {
      return `ABMP${baseStarSize}-${sheets}T${tierCode}`;
    }
    return `ABMP${baseStarSize}${tierCode}`;
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
 * including dynamic custom materials and tables, and returns a flat array of all SKU records with price > 0.
 */
export function buildEnrichedTierData(
  tables: TierPricingTables, 
  tier: AudienceTierId,
  customMaterialsDef: CustomMaterialDef[] = []
) {
  const flatItems: FlattenedSkuItem[] = [];
  const retailProducts: FlattenedSkuItem[] = [];
  const isRetailTier = tier === 'retail';

  const inEpMikaCols = tables.columnConfigs?.['in-ep-mika'] && tables.columnConfigs['in-ep-mika'].length > 0
    ? tables.columnConfigs['in-ep-mika']
    : [
        { key: 'inAnh', label: 'Giá In Ảnh', skuPrefix: 'IN' },
        { key: 'inEpMika', label: 'Giá In Ép Mika', skuPrefix: 'inep' },
        { key: 'khungXuongGiaCo', label: 'Khung Xương Gia Cố', skuPrefix: 'NEP' }
      ];

  const inEpMika = (tables.inEpMika || []).map(row => {
    const skus: Record<string, string> = {};
    inEpMikaCols.forEach(col => {
      const f = col.key;
      if (f === 'khungXuongGiaCo') {
        const hasGiaCo = row.size.includes('80') || row.size.includes('100') || row.size.includes('110') || row.khungXuongGiaCo !== undefined;
        if (!hasGiaCo) return;
      }
      const cellSku = generateCellSku('in-ep-mika', tier, row.size, f, customMaterialsDef, col.isCustom ? col.skuPrefix : undefined);
      skus[f] = cellSku;
      const cellPrice = (row as any)[f] ?? null;
      if (!isRetailTier && typeof cellPrice === 'number' && cellPrice > 0) {
        flatItems.push({
          sku: cellSku,
          name: `${col.label} ${row.size}`,
          material: 'in-ep-mika',
          tier,
          size: normalizeSize(row.size),
          variantKey: f,
          variantLabel: col.label,
          price: cellPrice
        });
      }
    });

    return {
      ...row,
      sku: skus.inEpMika || skus.inAnh || Object.values(skus)[0] || '',
      skus
    };
  });

  const enrichDongKhung = (
    rows: typeof tables.goLua = [],
    material: PricingMaterialType,
    pushToFlat: boolean = !isRetailTier,
    alsoPushToRetail: boolean = false
  ) => {
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
    const customDef = customMaterialsDef.find(m => m.id === material);
    return rows.map(row => {
      const skus: Record<string, string> = {};
      fields.forEach(col => {
        const f = col.key;
        const cellSku = generateCellSku(material, tier, row.size, f, customMaterialsDef, col.isCustom ? col.skuPrefix : undefined);
        skus[f] = cellSku;
        const cellPrice = (row as any)[f] ?? null;
        if (pushToFlat && typeof cellPrice === 'number' && cellPrice > 0) {
          const item: FlattenedSkuItem = {
            sku: cellSku,
            name: customDef ? `${customDef.name} - ${col.label} ${row.size}` : `${col.label} ${row.size}`,
            category: customDef ? customDef.name : String(material),
            material,
            tier,
            size: normalizeSize(row.size),
            variantKey: f,
            variantLabel: col.label,
            price: cellPrice
          };
          flatItems.push(item);
          if (alsoPushToRetail) {
            retailProducts.push(item);
          }
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

  const anh4KCols = tables.columnConfigs?.['anh-4k'] && tables.columnConfigs['anh-4k'].length > 0
    ? tables.columnConfigs['anh-4k']
    : [
        { key: 'k4_k6', label: 'Khung Hộp K4, K5, K6', skuPrefix: 'K456' },
        { key: 'titan2', label: 'Khung Titan T2', skuPrefix: 'TT2' }
      ];

  const anh4K = (tables.anh4K || []).map(row => {
    const skus: Record<string, string> = {};
    anh4KCols.forEach(col => {
      const f = col.key;
      const cellSku = generateCellSku('anh-4k', tier, row.size, f, customMaterialsDef, col.isCustom ? col.skuPrefix : undefined);
      skus[f] = cellSku;
      const cellPrice = (row as any)[f] ?? null;
      if (!isRetailTier && typeof cellPrice === 'number' && cellPrice > 0) {
        flatItems.push({
          sku: cellSku,
          material: 'anh-4k',
          tier,
          size: normalizeSize(row.size),
          variantKey: f,
          variantLabel: col.label,
          price: cellPrice
        });
      }
    });
    return {
      ...row,
      sku: skus.k4_k6 || Object.values(skus)[0] || '',
      skus
    };
  });

  const hdProCols = tables.columnConfigs?.['hd-pro'] && tables.columnConfigs['hd-pro'].length > 0
    ? tables.columnConfigs['hd-pro']
    : [
        { key: 'k4_k6', label: 'Khung K4, K5, K6', skuPrefix: 'K456' },
        { key: 'titan1', label: 'Khung Titan 1', skuPrefix: 'TT1' },
        { key: 'titan2', label: 'Khung Titan 2', skuPrefix: 'TT2' }
      ];

  const hdPro = (tables.hdPro || []).map(row => {
    const skus: Record<string, string> = {};
    hdProCols.forEach(col => {
      const f = col.key;
      const cellSku = generateCellSku('hd-pro', tier, row.size, f, customMaterialsDef, col.isCustom ? col.skuPrefix : undefined);
      skus[f] = cellSku;
      const cellPrice = (row as any)[f] ?? null;
      if (!isRetailTier && typeof cellPrice === 'number' && cellPrice > 0) {
        flatItems.push({
          sku: cellSku,
          material: 'hd-pro',
          tier,
          size: normalizeSize(row.size),
          variantKey: f,
          variantLabel: col.label,
          price: cellPrice
        });
      }
    });
    return {
      ...row,
      sku: skus.k4_k6 || Object.values(skus)[0] || '',
      skus
    };
  });

  // Bảng giá Khách Lẻ không có Album nên sẽ bỏ qua khi isRetailTier === true
  const albumMoPhang = isRetailTier
    ? []
    : (tables.albumMoPhang || []).map(row => {
        const skuAlbum = generateCellSku('album-mo-phang', tier, row.size, 'price', customMaterialsDef, undefined, row.sheets);
        if (typeof row.price === 'number' && row.price > 0) {
          flatItems.push({
            sku: skuAlbum,
            name: row.sheets === 1
              ? `Album Mở Phẳng - Thêm tờ (1 tờ / 2 trang)`
              : `Album Mở Phẳng ${row.size} (${row.sheets} tờ / ${row.sheets * 2} trang)`,
            category: 'Album Mở Phẳng',
            material: 'album-mo-phang',
            tier,
            size: row.size,
            variantKey: row.sheets === 15 ? 'price_15t' : row.sheets === 1 ? 'price_1t' : 'price',
            variantLabel: `${row.sheets} tờ (${row.sheets * 2} trang)`,
            price: row.price
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
        const isAllowedInTier = !customDef.targetTiers || customDef.targetTiers.includes(tier);
        if (!isAllowedInTier) return;

        if (customDef.type === 'dong-khung') {
          enrichedCustomTables[materialId] = enrichDongKhung(rows, materialId, true, isRetailTier);
        } else {
          enrichedCustomTables[materialId] = rows.map(r => {
            const cellSku = generateCellSku(materialId, tier, r.size, 'boVien', customMaterialsDef);
            const cellPrice = r.boVien ?? r.price ?? r.inEpMika ?? null;
            if (typeof cellPrice === 'number' && cellPrice > 0) {
              const item: FlattenedSkuItem = {
                sku: cellSku,
                name: `${customDef.name} ${r.size}`,
                category: customDef.name,
                material: materialId,
                tier,
                size: normalizeSize(r.size),
                variantKey: 'boVien',
                variantLabel: customDef.name,
                price: cellPrice
              };
              flatItems.push(item);
              if (isRetailTier) {
                retailProducts.push(item);
              }
            }
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

  // 1. Dịch Vụ Ảnh Thẻ (ATKL*) - Chỉ đồng bộ mã có giá > 0 sang quan-ly-194
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
    if (isRetailTier && typeof row.price === 'number' && row.price > 0) {
      retailProducts.push(item);
      flatItems.push(item);
    }
    return {
      ...row,
      sku: skuPassport
    };
  });

  // 2. Bảng Giá Khách Lẻ Linh Hoạt (Hỗ trợ đầy đủ các cột và kích thước mới thêm, chỉ đồng bộ các ô có giá > 0)
  const retailCols = tables.columnConfigs?.retail && tables.columnConfigs.retail.length > 0
    ? tables.columnConfigs.retail
    : DEFAULT_RETAIL_COLUMNS;

  const retailTable = (tables.retailTable || []).map(row => {
    const normSize = normalizeSize(row.size);
    const skus: Record<string, string | undefined> = {};
    const rowItems: FlattenedSkuItem[] = [];

    retailCols.forEach(col => {
      const colKey = col.key;
      const sku = generateRetailCellSku(normSize, colKey, col.skuPrefix);
      skus[colKey] = sku;

      const cellPrice = (row as any)[colKey];
      // NGUYÊN TẮC CỐT LÕI: Chỉ đồng bộ những mã SKU có giá > 0 sang quan-ly-194
      if (typeof cellPrice === 'number' && cellPrice > 0) {
        const isInEp = colKey === 'inEpMika';
        rowItems.push({
          sku,
          name: `${col.label} ${row.size}`,
          category: isInEp ? 'In Ép Mika' : 'HD Gương Siêu Bóng',
          material: (isInEp ? 'in-ep-mika' : 'hd-guong-sieu-bong') as PricingMaterialType,
          tier: 'retail',
          size: normSize,
          variantKey: colKey,
          variantLabel: col.label,
          price: cellPrice
        });
      }
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
      customTables: enrichedCustomTables,
      columnConfigs: tables.columnConfigs
    },
    flatItems: flatItems.filter(item => typeof item.price === 'number' && item.price > 0),
    retailProducts: retailProducts.filter(item => typeof item.price === 'number' && item.price > 0)
  };
}

