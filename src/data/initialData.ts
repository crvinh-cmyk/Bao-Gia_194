import { RetailPriceRow, RetailPassportRow, TableColumnConfig } from '../types/admin';

/**
 * DANH SÁCH 44 MÃ SKU KHÓA CỨNG CHÍNH XÁC DUY NHẤT CHO PHÂN HỆ KHÁCH LẺ (TIỆM IN 194)
 * Tuyệt đối không sinh thêm bất kỳ mã ảo nào.
 *
 * 1. Ảnh thẻ (2 mã): ATKL3*4, ATKL4*6
 * 2. In ép Mika (10 mã): inepKL6*9, inepKL10*15, inepKL13*18, inepKL15*21, inepKL20*30, inepKL25*38, inepKL30*45, inepKL40*60, inepKL50*75, inepKL60*90
 * 3. HD Bo Viền (7 mã): HDKL20*30, HDKL30*45, HDKL40*60, HDKL50*75, HDKL60*90, HDKL70*110, HDKL80*120
 * 4. HD Titan 1 (9 mã): HDKL15*21TT1, HDKL20*30TT1, HDKL30*45TT1, HDKL40*60TT1, HDKL50*75TT1, HDKL60*90TT1, HDKL70*110TT1, HDKL80*120TT1, HDKL100*150TT1
 * 5. HD Titan 2 (9 mã): HDKL15*21TT2, HDKL20*30TT2, HDKL30*45TT2, HDKL40*60TT2, HDKL50*75TT2, HDKL60*90TT2, HDKL70*110TT2, HDKL80*120TT2, HDKL100*150TT2
 * 6. HD Khung K10 (7 mã): HDKL30*45K10, HDKL40*60K10, HDKL50*75K10, HDKL60*90K10, HDKL70*110K10, HDKL80*120K10, HDKL100*150K10
 *
 * Tổng cộng: 2 + 10 + 7 + 9 + 9 + 7 = 44 mã SKU.
 */
export const EXACT_44_RETAIL_SKUS = [
  // Ảnh thẻ (2 mã)
  'ATKL3*4',
  'ATKL4*6',

  // In ép Mika (10 mã)
  'inepKL6*9',
  'inepKL10*15',
  'inepKL13*18',
  'inepKL15*21',
  'inepKL20*30',
  'inepKL25*38',
  'inepKL30*45',
  'inepKL40*60',
  'inepKL50*75',
  'inepKL60*90',

  // HD Bo Viền (7 mã)
  'HDKL20*30',
  'HDKL30*45',
  'HDKL40*60',
  'HDKL50*75',
  'HDKL60*90',
  'HDKL70*110',
  'HDKL80*120',

  // HD Titan 1 (9 mã)
  'HDKL15*21TT1',
  'HDKL20*30TT1',
  'HDKL30*45TT1',
  'HDKL40*60TT1',
  'HDKL50*75TT1',
  'HDKL60*90TT1',
  'HDKL70*110TT1',
  'HDKL80*120TT1',
  'HDKL100*150TT1',

  // HD Titan 2 (9 mã)
  'HDKL15*21TT2',
  'HDKL20*30TT2',
  'HDKL30*45TT2',
  'HDKL40*60TT2',
  'HDKL50*75TT2',
  'HDKL60*90TT2',
  'HDKL70*110TT2',
  'HDKL80*120TT2',
  'HDKL100*150TT2',

  // HD Khung K10 (7 mã)
  'HDKL30*45K10',
  'HDKL40*60K10',
  'HDKL50*75K10',
  'HDKL60*90K10',
  'HDKL70*110K10',
  'HDKL80*120K10',
  'HDKL100*150K10'
] as const;

export const EXACT_RETAIL_SKU_SET = new Set<string>(EXACT_44_RETAIL_SKUS);

/**
 * 5 Cột chuẩn tương ứng trực tiếp với 44 mã SKU thật của bảng giá Khách Lẻ.
 * Tuyệt đối không ép hiển thị hoặc tự sinh các cột ảo như K4, K5, K6, K0-K3, K7-K9, K11...
 */
export const DEFAULT_RETAIL_COLUMNS: TableColumnConfig[] = [
  { key: 'inEpMika', label: 'In Ép Mika', skuPrefix: 'inepKL', defaultColor: 'text-emerald-400 font-bold' },
  { key: 'hdBoVien', label: 'HD Siêu Bóng Bo Viền', skuPrefix: 'HDKL', defaultColor: 'text-[#E7C184] font-bold' },
  { key: 'hdTitan1', label: 'HD Khung Titan 1', skuPrefix: 'TT1', defaultColor: 'text-neutral-200' },
  { key: 'hdTitan2', label: 'HD Khung Titan 2', skuPrefix: 'TT2', defaultColor: 'text-amber-300 font-bold' },
  { key: 'hdK10', label: 'HD Khung K10', skuPrefix: 'K10', defaultColor: 'text-neutral-200' },
];

/**
 * Dữ liệu dịch vụ ảnh thẻ (2 mã: ATKL3*4, ATKL4*6)
 */
export const defaultRetailPassportData: RetailPassportRow[] = [
  { size: '3x4', code: '3*4', name: 'Chụp & In Ảnh Thẻ 3x4 (Bộ 8 tấm)', price: 50000 },
  { size: '4x6', code: '4*6', name: 'Chụp & In Ảnh Thẻ 4x6 (Bộ 4 tấm)', price: 50000 }
];

/**
 * Dữ liệu chuẩn gốc biểu giá Khách Lẻ (42 ô giá khớp với 42 mã sản phẩm in & khung)
 * Sắp xếp diện tích từ nhỏ đến lớn:
 * 6x9, 10x15, 13x18, 15x21, 20x30, 25x38, 30x45, 40x60, 50x75, 60x90, 70x110, 80x120, 100x150.
 *
 * Ô nào không nằm trong danh mục 44 mã SKU thì để null (hiển thị dấu gạch ngang '-' trên giao diện).
 */
export const defaultRetailPricingData: RetailPriceRow[] = [
  { size: '6x9', inEpMika: 5000, hdBoVien: null, hdTitan1: null, hdTitan2: null, hdK10: null },
  { size: '10x15', inEpMika: 10000, hdBoVien: null, hdTitan1: null, hdTitan2: null, hdK10: null },
  { size: '13x18', inEpMika: 15000, hdBoVien: null, hdTitan1: null, hdTitan2: null, hdK10: null },
  { size: '15x21', inEpMika: 20000, hdBoVien: null, hdTitan1: 80000, hdTitan2: 110000, hdK10: null },
  { size: '20x30', inEpMika: 35000, hdBoVien: 60000, hdTitan1: 100000, hdTitan2: 130000, hdK10: null },
  { size: '25x38', inEpMika: 50000, hdBoVien: null, hdTitan1: null, hdTitan2: null, hdK10: null },
  { size: '30x45', inEpMika: 70000, hdBoVien: 140000, hdTitan1: 210000, hdTitan2: 255000, hdK10: 250000 },
  { size: '40x60', inEpMika: 120000, hdBoVien: 190000, hdTitan1: 280000, hdTitan2: 340000, hdK10: 320000 },
  { size: '50x75', inEpMika: 160000, hdBoVien: 255000, hdTitan1: 370000, hdTitan2: 440000, hdK10: 430000 },
  { size: '60x90', inEpMika: 200000, hdBoVien: 285000, hdTitan1: 430000, hdTitan2: 510000, hdK10: 490000 },
  { size: '70x110', inEpMika: null, hdBoVien: 525000, hdTitan1: 760000, hdTitan2: 820000, hdK10: 800000 },
  { size: '80x120', inEpMika: null, hdBoVien: 640000, hdTitan1: 880000, hdTitan2: 1000000, hdK10: 940000 },
  { size: '100x150', inEpMika: null, hdBoVien: null, hdTitan1: 1455000, hdTitan2: 1600000, hdK10: 1530000 }
];

/**
 * Cho phép nhập giá ở mọi ô kích thước và cột trên bảng giá Khách Lẻ.
 * Nguyên tắc đồng bộ: Chỉ những ô có giá > 0 mới được sinh mã SKU đẩy sang quan-ly-194.
 */
export function isAllowedRetailCell(_size: string, _colKey: string): boolean {
  return true;
}

/**
 * Hàm chuẩn hóa dữ liệu Khách Lẻ.
 * Bảo toàn mọi kích thước mới và cột chất liệu/khung mới do Admin thêm vào,
 * đồng thời giữ nguyên nguyên tắc: ô nào giá <= 0 hoặc rỗng thì lưu null (chỉ đồng bộ giá > 0).
 */
export function sanitizeAndLockRetailData(
  rawRows?: any[],
  rawPassports?: any[]
): { retailTable: RetailPriceRow[]; retailPassports: RetailPassportRow[] } {
  // 1. Chuẩn hóa Ảnh thẻ
  const retailPassports: RetailPassportRow[] =
    Array.isArray(rawPassports) && rawPassports.length > 0
      ? rawPassports.map((p, idx) => {
          const defPass = defaultRetailPassportData[idx];
          return {
            size: p.size || defPass?.size || '3x4',
            code: p.code || defPass?.code || p.size || '3*4',
            name: p.name || defPass?.name || `Chụp & In Ảnh Thẻ ${p.size || ''}`,
            price: typeof p.price === 'number' && p.price > 0 ? p.price : null
          };
        })
      : JSON.parse(JSON.stringify(defaultRetailPassportData));

  // 2. Chuẩn hóa Bảng Giá Khách Lẻ (Hỗ trợ đầy đủ kích thước mới & cột mới)
  const sourceRows =
    Array.isArray(rawRows) && rawRows.length > 0
      ? rawRows
      : defaultRetailPricingData;

  const retailTable: RetailPriceRow[] = sourceRows.map((r) => {
    const cleanSize = String(r.size || '').trim().toLowerCase().replace(/\s+/g, '').replace(/\*/g, 'x');
    const row: RetailPriceRow = {
      size: cleanSize || r.size,
      inEpMika: null,
      hdBoVien: null,
      hdTitan1: null,
      hdTitan2: null,
      hdK10: null
    };

    Object.keys(r).forEach((key) => {
      if (key === 'size' || key === 'skus' || key === 'sku') return;
      const val = r[key];
      row[key] = typeof val === 'number' && val > 0 ? val : null;
    });

    return row;
  });

  return { retailTable, retailPassports };
}
