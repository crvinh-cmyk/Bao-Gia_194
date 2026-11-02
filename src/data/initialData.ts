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
 * Kiểm tra xem một cell (size + colKey) có thuộc 44 mã SKU hợp lệ hay không.
 */
export function isAllowedRetailCell(size: string, colKey: string): boolean {
  const normSize = size.trim().toLowerCase().replace(/\s+/g, '').replace(/x/g, '*');
  let sku = '';
  if (colKey === 'inEpMika') sku = `inepKL${normSize}`;
  else if (colKey === 'hdBoVien') sku = `HDKL${normSize}`;
  else if (colKey === 'hdTitan1') sku = `HDKL${normSize}TT1`;
  else if (colKey === 'hdTitan2') sku = `HDKL${normSize}TT2`;
  else if (colKey === 'hdK10') sku = `HDKL${normSize}K10`;
  else if (colKey === 'passport') sku = `ATKL${normSize}`;
  else return false;

  return EXACT_RETAIL_SKU_SET.has(sku);
}

/**
 * Hàm làm sạch và khóa cứng dữ liệu Khách Lẻ.
 * Ngăn chặn tuyệt đối tình trạng nhảy dữ liệu khi deploy Vercel hoặc do localStorage/Firestore cũ.
 */
export function sanitizeAndLockRetailData(
  rawRows?: any[],
  rawPassports?: any[]
): { retailTable: RetailPriceRow[]; retailPassports: RetailPassportRow[] } {
  // 1. Chuẩn hóa Ảnh thẻ (chỉ cho phép 3x4 và 4x6)
  const retailPassports: RetailPassportRow[] = defaultRetailPassportData.map(defPass => {
    const found = Array.isArray(rawPassports) 
      ? rawPassports.find(p => (p.code || p.size || '').replace('x', '*') === (defPass.code || defPass.size).replace('x', '*'))
      : null;
    return {
      size: defPass.size,
      code: defPass.code,
      name: defPass.name,
      price: found && typeof found.price === 'number' && found.price > 0 ? found.price : defPass.price
    };
  });

  // 2. Chuẩn hóa Bảng Giá Khách Lẻ (đúng 13 kích thước chuẩn, khóa cứng chỉ lưu giá tại các cell trong 44 mã SKU)
  const canonicalSizes = [
    '6x9', '10x15', '13x18', '15x21', '20x30', '25x38', 
    '30x45', '40x60', '50x75', '60x90', '70x110', '80x120', '100x150'
  ];

  const retailTable: RetailPriceRow[] = canonicalSizes.map(sizeStr => {
    const defRow = defaultRetailPricingData.find(d => d.size.replace('*', 'x') === sizeStr)!;
    const foundRow = Array.isArray(rawRows)
      ? rawRows.find(r => (r.size || '').trim().toLowerCase().replace('*', 'x') === sizeStr)
      : null;

    const row: RetailPriceRow = {
      size: sizeStr,
      inEpMika: null,
      hdBoVien: null,
      hdTitan1: null,
      hdTitan2: null,
      hdK10: null
    };

    (['inEpMika', 'hdBoVien', 'hdTitan1', 'hdTitan2', 'hdK10'] as const).forEach(colKey => {
      if (isAllowedRetailCell(sizeStr, colKey)) {
        if (foundRow && typeof foundRow[colKey] === 'number' && foundRow[colKey] > 0) {
          row[colKey] = foundRow[colKey];
        } else {
          row[colKey] = defRow[colKey];
        }
      } else {
        // Cố định null nếu cell không nằm trong danh mục 44 SKU thật
        row[colKey] = null;
      }
    });

    return row;
  });

  return { retailTable, retailPassports };
}
