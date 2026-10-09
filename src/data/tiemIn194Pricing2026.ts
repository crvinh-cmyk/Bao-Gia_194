import { InEpMikaPriceRow, DongKhungPriceRow, Anh4KPriceRow, FrameSpecItem } from '../types';

// 1. BẢNG GIÁ IN ÉP MIKA (Trang 1 PDF - Chỉ giữ giá In Ép Mika)
export const inEpMikaPricingData: InEpMikaPriceRow[] = [
  { stt: 1, size: '13x18', inEpMika: 4500 },
  { stt: 2, size: '15x21', inEpMika: 7000 },
  { stt: 3, size: '20x30', inEpMika: 15000 },
  { stt: 4, size: '25x38', inEpMika: 25000 },
  { stt: 5, size: '30x45', inEpMika: 35000 },
  { stt: 6, size: '35x50', inEpMika: 55000 },
  { stt: 7, size: '40x60', inEpMika: 60000 },
  { stt: 8, size: '50x75', inEpMika: 80000 },
  { stt: 9, size: '60x90', inEpMika: 95000 },
  { stt: 10, size: '60x120', inEpMika: 185000 },
  { stt: 11, size: '70x110', inEpMika: 185000 },
  { stt: 12, size: '80x120', inEpMika: 195000 },
  { stt: 13, size: '100x150', inEpMika: 330000 },
  { stt: 14, size: '110x180', inEpMika: 450000 }
];
// Backwards compatibility alias
export const boVienPricingData = inEpMikaPricingData;

// 2. GỖ LỤA ĐÓNG KHUNG (Trang 2 PDF)
export const goLuaDongKhungData: DongKhungPriceRow[] = [
  { size: '13x18', boVien: 22000, k0_k3: null, k4_k6: null, k7_k9: null, k10: null, k11: null, titan1: null, titan2: null },
  { size: '15x21', boVien: 22000, k0_k3: 32000, k4_k6: 48000, k7_k9: 48000, k10: null, k11: null, titan1: 42000, titan2: 62000 },
  { size: '20x30', boVien: 28000, k0_k3: 43000, k4_k6: 63000, k7_k9: 63000, k10: null, k11: null, titan1: 58000, titan2: 78000 },
  { size: '25x38', boVien: 55000, k0_k3: 75000, k4_k6: 100000, k7_k9: 100000, k10: null, k11: null, titan1: 95000, titan2: 120000 },
  { size: '30x45', boVien: 77000, k0_k3: 100000, k4_k6: 130000, k7_k9: 130000, k10: 145000, k11: null, titan1: 125000, titan2: 150000 },
  { size: '35x50', boVien: 93000, k0_k3: 118000, k4_k6: 150000, k7_k9: 150000, k10: 170000, k11: null, titan1: 145000, titan2: 175000 },
  { size: '40x60', boVien: 110000, k0_k3: 140000, k4_k6: 180000, k7_k9: 180000, k10: 200000, k11: 240000, titan1: 170000, titan2: 210000 },
  { size: '50x75', boVien: 145000, k0_k3: 180000, k4_k6: 235000, k7_k9: 235000, k10: 255000, k11: 310000, titan1: 220000, titan2: 270000 },
  { size: '60x90', boVien: 155000, k0_k3: 200000, k4_k6: 260000, k7_k9: 260000, k10: 290000, k11: 350000, titan1: 245000, titan2: 305000 },
  { size: '60x120', boVien: 310000, k0_k3: 365000, k4_k6: 436000, k7_k9: 436000, k10: 470000, k11: 544000, titan1: 420000, titan2: 490000 },
  { size: '70x110', boVien: 290000, k0_k3: 345000, k4_k6: 450000, k7_k9: 450000, k10: 470000, k11: 524000, titan1: 435000, titan2: 485000 },
  { size: '80x120', boVien: 340000, k0_k3: 400000, k4_k6: 520000, k7_k9: 520000, k10: 540000, k11: 600000, titan1: 500000, titan2: 580000 },
  { size: '100x150', boVien: 670000, k0_k3: 745000, k4_k6: 895000, k7_k9: 895000, k10: 920000, k11: 995000, titan1: 870000, titan2: 970000 }
];

// 3. MIKA PHỔ THÔNG ĐÓNG KHUNG (Trang 3 PDF)
export const mikaPhoThongData: DongKhungPriceRow[] = [
  { size: '13x18', boVien: 22000, k0_k3: null, k4_k6: null, k7_k9: null, k10: null, k11: null, titan1: null, titan2: null },
  { size: '15x21', boVien: 28000, k0_k3: 38000, k4_k6: 55000, k7_k9: 55000, k10: null, k11: null, titan1: 48000, titan2: 68000 },
  { size: '20x30', boVien: 33000, k0_k3: 48000, k4_k6: 70000, k7_k9: 70000, k10: null, k11: null, titan1: 65000, titan2: 85000 },
  { size: '25x38', boVien: 60000, k0_k3: 80000, k4_k6: 105000, k7_k9: 105000, k10: null, k11: null, titan1: 100000, titan2: 125000 },
  { size: '30x45', boVien: 88000, k0_k3: 110000, k4_k6: 140000, k7_k9: 140000, k10: 155000, k11: 185000, titan1: 135000, titan2: 165000 },
  { size: '35x50', boVien: 100000, k0_k3: 125000, k4_k6: 160000, k7_k9: 160000, k10: 176000, k11: 210000, titan1: 150000, titan2: 185000 },
  { size: '40x60', boVien: 115000, k0_k3: 145000, k4_k6: 185000, k7_k9: 185000, k10: 205000, k11: 245000, titan1: 175000, titan2: 215000 },
  { size: '50x75', boVien: 155000, k0_k3: 190000, k4_k6: 245000, k7_k9: 245000, k10: 265000, k11: 315000, titan1: 230000, titan2: 280000 },
  { size: '60x90', boVien: 175000, k0_k3: 220000, k4_k6: 280000, k7_k9: 280000, k10: 310000, k11: 370000, titan1: 265000, titan2: 325000 },
  { size: '60x120', boVien: 335000, k0_k3: 390000, k4_k6: 460000, k7_k9: 460000, k10: 495000, k11: 570000, titan1: 445000, titan2: 515000 },
  { size: '70x110', boVien: 320000, k0_k3: 375000, k4_k6: 480000, k7_k9: 480000, k10: 500000, k11: 555000, titan1: 465000, titan2: 515000 },
  { size: '80x120', boVien: 375000, k0_k3: 435000, k4_k6: 555000, k7_k9: 555000, k10: 575000, k11: 635000, titan1: 535000, titan2: 615000 },
  { size: '100x150', boVien: 695000, k0_k3: 770000, k4_k6: 920000, k7_k9: 920000, k10: 945000, k11: 1020000, titan1: 895000, titan2: 995000 },
  { size: '110x180', boVien: 880000, k0_k3: 970000, k4_k6: 1140000, k7_k9: 1140000, k10: 1170000, k11: 1257000, titan1: 1115000, titan2: 1225000 }
];
// Backwards compatibility alias
export const micaPhoThongData = mikaPhoThongData;

// 4. HD GƯƠNG SIÊU BÓNG KHUNG (Trang 4 PDF)
export const hdGuongSieuBongKhungData: DongKhungPriceRow[] = [
  { size: '13x18', boVien: 27000, k0_k3: null, k4_k6: null, k7_k9: null, k10: null, k11: null, titan1: null, titan2: null },
  { size: '15x21', boVien: 33000, k0_k3: 43000, k4_k6: 58200, k7_k9: 58200, k10: null, k11: null, titan1: 53000, titan2: 73000 },
  { size: '20x30', boVien: 38000, k0_k3: 53000, k4_k6: 73000, k7_k9: 73000, k10: null, k11: null, titan1: 68000, titan2: 88000 },
  { size: '25x38', boVien: 65000, k0_k3: 85000, k4_k6: 110000, k7_k9: 110000, k10: null, k11: null, titan1: 105000, titan2: 130000 },
  { size: '30x45', boVien: 95000, k0_k3: 118000, k4_k6: 145000, k7_k9: 145000, k10: 165000, k11: 195000, titan1: 140000, titan2: 170000 },
  { size: '35x50', boVien: 105000, k0_k3: 130000, k4_k6: 165000, k7_k9: 165000, k10: 180000, k11: 215000, titan1: 155000, titan2: 190000 },
  { size: '40x60', boVien: 125000, k0_k3: 155000, k4_k6: 195000, k7_k9: 195000, k10: 215000, k11: 255000, titan1: 185000, titan2: 225000 },
  { size: '50x75', boVien: 170000, k0_k3: 205000, k4_k6: 255000, k7_k9: 255000, k10: 285000, k11: 335000, titan1: 245000, titan2: 295000 },
  { size: '60x90', boVien: 190000, k0_k3: 235000, k4_k6: 295000, k7_k9: 295000, k10: 325000, k11: 385000, titan1: 280000, titan2: 340000 },
  { size: '60x120', boVien: 350000, k0_k3: 405000, k4_k6: 475000, k7_k9: 475000, k10: 515000, k11: 585000, titan1: 460000, titan2: 530000 },
  { size: '70x110', boVien: 350000, k0_k3: 405000, k4_k6: 515000, k7_k9: 515000, k10: 530000, k11: 585000, titan1: 505000, titan2: 545000 },
  { size: '80x120', boVien: 425000, k0_k3: 485000, k4_k6: 605000, k7_k9: 605000, k10: 625000, k11: 685000, titan1: 585000, titan2: 665000 },
  { size: '100x150', boVien: 770000, k0_k3: 845000, k4_k6: 995000, k7_k9: 995000, k10: 1020000, k11: 1095000, titan1: 970000, titan2: 1070000 },
  { size: '110x180', boVien: 975000, k0_k3: 1059000, k4_k6: 1235000, k7_k9: 1235000, k10: 1265000, k11: 1350000, titan1: 1210000, titan2: 1320000 }
];
// Backwards compatibility alias
export const micaGuongHDKhungData = hdGuongSieuBongKhungData;

// 5. ẢNH 4K (Trang 5 PDF)
export const anh4KPricingData: Anh4KPriceRow[] = [
  { size: '15x21', k4_k6: 58000, titan2: 70000 },
  { size: '20x30', k4_k6: 80000, titan2: 90000 },
  { size: '25x38', k4_k6: 110000, titan2: 120000 },
  { size: '30x45', k4_k6: 170000, titan2: 190000 },
  { size: '35x50', k4_k6: 220000, titan2: 240000 },
  { size: '40x60', k4_k6: 355000, titan2: 375000 },
  { size: '50x75', k4_k6: 430000, titan2: 465000 },
  { size: '60x90', k4_k6: 470000, titan2: 515000 },
  { size: '60x120', k4_k6: 850000, titan2: 915000 },
  { size: '70x110', k4_k6: 820000, titan2: 870000 },
  { size: '80x120', k4_k6: 925000, titan2: 975000 },
  { size: '90x130', k4_k6: 1260000, titan2: 1365000 },
  { size: '100x150', k4_k6: 1580000, titan2: 1680000 }
];

// Chú thích quy cách khung (Trang 7 PDF)
export const frameReferenceGuide: FrameSpecItem[] = [
  {
    code: 'K0',
    name: 'Khung Cổ Điển K0',
    dimensions: 'Bản khung rộng 3.0 cm',
    description: 'Họa tiết phào chỉ viền cổ điển mạ ánh kim hoặc nâu cánh gián, tôn vinh ảnh chân dung & ảnh cưới truyền thống.',
    suitableFor: 'Ảnh cổng cưới, ảnh gia đình cổ điển',
    variants: 'Màu nâu viền vàng, đen viền vàng, vàng đồng',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K0: Cổ điển (3cm)', url: '/images/frames/khung-k0.jpg', colorHex: '#4A2A16', tag: 'K0 Cổ điển' }
    ]
  },
  {
    code: 'K1',
    name: 'Khung Úp K1 (Gỗ Sồi Sáng)',
    dimensions: 'Khung úp bản 2.0 cm',
    description: 'Bản viền mỏng thanh thoát, mép khung úp nhẹ vào mặt ảnh tạo cảm giác phẳng mịn và hiện đại, tông gỗ sồi sáng ấm cúng.',
    suitableFor: 'Ảnh phong cách Hàn Quốc, tối giản, decor phòng ngủ',
    variants: 'Gỗ sồi sáng Hàn Quốc',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K1: Gỗ sồi sáng', url: '/images/frames/khung-k1.jpg', colorHex: '#C49A6C', tag: 'K1 Gỗ sồi' }
    ]
  },
  {
    code: 'K2',
    name: 'Khung Úp K2 (Đen Nhung Mờ)',
    dimensions: 'Khung úp bản 2.0 cm',
    description: 'Bản viền mỏng phẳng mép, bề mặt đen nhung mờ tinh tế sang trọng, chống bám vân tay.',
    suitableFor: 'Ảnh đơn sắc, chân dung Studio, ảnh cưới hiện đại',
    variants: 'Đen nhung mờ cao cấp',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K2: Đen nhung mờ', url: '/images/frames/khung-k2.jpg', colorHex: '#1F1D1B', tag: 'K2 Đen mờ' }
    ]
  },
  {
    code: 'K3',
    name: 'Khung Úp K3 (Trắng Sứ)',
    dimensions: 'Khung úp bản 2.0 cm',
    description: 'Bản viền mỏng thanh khiết màu trắng sứ, phong cách tối giản Scandinavian nhẹ nhàng.',
    suitableFor: 'Ảnh em bé, gia đình, ảnh cưới nhẹ nhàng lãng mạn',
    variants: 'Trắng sứ Scandinavian',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K3: Trắng sứ', url: '/images/frames/khung-k3.jpg', colorHex: '#FFFFFF', tag: 'K3 Trắng sứ' }
    ]
  },
  {
    code: 'K4',
    name: 'Khung Hộp K4 (Trắng)',
    dimensions: 'Khung hộp cao 3.5 cm (bản mặt 1.5 - 2.0cm)',
    description: 'Thành khung cao tạo chiều sâu 3D hút mắt (Shadow Box), sơn trắng sứ tinh khôi, bảo vệ mép ảnh tối đa.',
    suitableFor: 'Ảnh 4K trên Fomex, ảnh cưới Hàn Quốc, phong cách tối giản',
    variants: 'Trắng sứ thanh lịch',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K4: Trắng', url: '/images/frames/khung k4 màu trắng.jpg', colorHex: '#FFFFFF', tag: 'K4 Trắng' }
    ]
  },
  {
    code: 'K5',
    name: 'Khung Hộp K5 (Đen Mờ)',
    dimensions: 'Khung hộp cao 3.5 cm (bản mặt 1.5 - 2.0cm)',
    description: 'Thành khung cao tạo chiều sâu 3D sang trọng, bề mặt đen mờ chống bám vân tay, tôn ảnh có độ tương phản cao.',
    suitableFor: 'Ảnh 4K Fomex, ảnh cưới nghệ thuật, chân dung studio',
    variants: 'Đen mờ hiện đại',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K5: Đen mờ', url: '/images/frames/khung k5 đen mờ.jpg', colorHex: '#1F1E1D', tag: 'K5 Đen mờ' }
    ]
  },
  {
    code: 'K6',
    name: 'Khung Hộp K6 (Caffe & Gỗ Nhạt)',
    dimensions: 'Khung hộp cao 3.5 cm (bản mặt 1.5 - 2.0cm)',
    description: 'Thành khung cao vân gỗ tự nhiên ấm cúng với 2 tông màu thời thượng: Nâu Caffe trầm ấm và Gỗ nhạt phong cách Bắc Âu.',
    suitableFor: 'Ảnh gia đình, decor phong cách Scandinavian, ảnh cưới ngoại cảnh',
    variants: 'K6 Caffe, K6 Gỗ nhạt',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K6: Caffe', url: '/images/frames/khung k6 màu cafe.jpg', colorHex: '#3F281D', tag: 'K6 Caffe' },
      { name: 'Khung K6: Gỗ nhạt', url: '/images/frames/khung k6 màu gỗ nhạt.jpg', colorHex: '#A8815F', tag: 'K6 Gỗ nhạt' }
    ]
  },
  {
    code: 'K7, K8, K9',
    name: 'Khung Hộp Vừa K7, K8, K9',
    dimensions: 'Khung hộp bản 2.5 cm (chiều sâu 2.0cm)',
    description: 'Tỷ lệ cân đối giữa độ rộng bản mặt và chiều sâu hộp, rất được ưa chuộng tại các Studio cưới. Đủ bộ 3 màu cơ bản: Đen (K7), Gỗ (K8), Trắng (K9).',
    suitableFor: 'Ảnh cưới phóng lớn 60x90, bộ ảnh gia đình',
    variants: 'K7 (Đen), K8 (Gỗ tự nhiên), K9 (Trắng)',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K7, K8, K9', url: '/images/frames/khung-k7-k8-k9.jpg', colorHex: '#533725', tag: 'K7, K8, K9' }
    ]
  },
  {
    code: 'K10',
    name: 'Khung Bản Rộng K10',
    dimensions: 'Bản khung rộng 5.0 - 5.5 cm',
    description: 'Khung bản lớn tạo sự bề thế, vững chãi và quyền quý cho các bức ảnh chụp đại lễ, hội nghị hoặc đại gia đình.',
    suitableFor: 'Ảnh gia đình 3 thế hệ, ảnh cổng cưới nhà hàng',
    variants: 'Màu nâu đậm cổ điển bản 5cm',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K10: Nâu đậm (5cm)', url: '/images/frames/khung k10 bản 5 cm màu nâu đậm.jpg', colorHex: '#4A2A1A', tag: 'K10 Nâu đậm' }
    ]
  },
  {
    code: 'K11',
    name: 'Khung Bản Đại K11 (Bản 8cm)',
    dimensions: 'Bản khung rộng 8.0 cm (Khổ đại)',
    description: 'Bản viền cực đại chạm chỉ nổi hoàng gia, dành riêng cho các bức tranh khổ lớn từ 60x90 đến 1m x 1m5.',
    suitableFor: 'Tranh đại sảnh tiệc, ảnh cưới biệt thự cổ điển',
    variants: 'Màu vàng hoàng kim, nâu gỗ cổ điển (Bản 8cm)',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K11: Bản 8cm', url: '/images/frames/khung-k11.jpg', colorHex: '#4E2712', tag: 'K11 Bản 8cm' }
    ]
  },
  {
    code: 'Titan 1',
    name: 'Khung Hợp Kim Titan 1',
    dimensions: 'Viền kim loại thanh mảnh siêu cứng 0.8 - 1.2cm',
    description: 'Chất liệu kim loại Titan nguyên khối không gỉ sét, mạ PVD ánh kim sang trọng. Rất mỏng nhẹ, sắc sảo và hiện đại.',
    suitableFor: 'Ảnh HD gương siêu bóng, ảnh cao cấp',
    variants: 'Titan 1 Đen (Black Matte), Titan 1 Bạc (Silver Brush)',
    hasRealPhotos: true,
    images: [
      { name: 'Titan 1: Đen', url: '/images/frames/khung titan 1 màu đen.jpg', colorHex: '#181716', tag: 'Titan 1 Đen' },
      { name: 'Titan 1: Bạc', url: '/images/frames/khung titan 1 màu bạc.jpg', colorHex: '#DCDDE1', tag: 'Titan 1 Bạc' }
    ]
  },
  {
    code: 'Titan 2',
    name: 'Khung Hợp Kim Titan 2',
    dimensions: 'Viền kim loại cao cấp mạ màu thời trang',
    description: 'Dòng khung kim loại Titan thế hệ mới với các màu sắc độc quyền hiện đại, cực kỳ hút khách chụp ảnh cưới thời trang.',
    suitableFor: 'Ảnh cưới thời trang, ảnh 4K Fomex',
    variants: 'Titan 2 Xanh (Xanh rêu titan), Titan 2 Hồng (Rose gold / Vàng hồng)',
    hasRealPhotos: true,
    images: [
      { name: 'Titan 2: Xanh', url: '/images/frames/khung titan 2 màu xanh.jpg', colorHex: '#3B5245', tag: 'Titan 2 Xanh' },
      { name: 'Titan 2: Hồng', url: '/images/frames/khung titan 2 hồng.jpg', colorHex: '#B87D72', tag: 'Titan 2 Hồng' }
    ]
  }
];

export const b2bShopInfo2026 = {
  name: 'Tiệm In 194',
  subTitle: 'Xưởng In Lab & Gia Công Khung Ảnh B2B Cho Studio & Thợ Ảnh',
  hotlineTech: '0967827194',
  zaloTho: '0967827194',
  address: 'Ql1a, Quỳnh Lưu, Nghệ An',
  workingHours: '08:00 - 21:00 (Nhận file & duyệt file 24/7 qua Zalo)',
};
