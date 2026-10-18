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
  { stt: 12, size: '80x120', inEpMika: 195000, khungXuongGiaCo: 180000 },
  { stt: 13, size: '100x150', inEpMika: 330000, khungXuongGiaCo: 220000 },
  { stt: 14, size: '110x180', inEpMika: 450000, khungXuongGiaCo: 310000 }
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
  { size: '110x180', boVien: null, k0_k3: 970000, k4_k6: 1140000, k7_k9: 1140000, k10: 1170000, k11: 1257000, titan1: 1115000, titan2: 1225000 }
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
  { size: '60x90', boVien: 190000, k0_k3: 235000, k4_k6: 295000, k7_k9: 295000, k10: 325000, k11: 385000, titan1: 285000, titan2: 340000 },
  { size: '60x120', boVien: 350000, k0_k3: 405000, k4_k6: 475000, k7_k9: 475000, k10: 515000, k11: 585000, titan1: 460000, titan2: 530000 },
  { size: '70x110', boVien: 350000, k0_k3: 405000, k4_k6: 515000, k7_k9: 515000, k10: 530000, k11: 585000, titan1: 505000, titan2: 545000 },
  { size: '80x120', boVien: 425000, k0_k3: 485000, k4_k6: 605000, k7_k9: 605000, k10: 625000, k11: 685000, titan1: 585000, titan2: 665000 },
  { size: '100x150', boVien: 770000, k0_k3: 845000, k4_k6: 995000, k7_k9: 995000, k10: 1020000, k11: 1095000, titan1: 970000, titan2: 1070000 },
  { size: '110x180', boVien: null, k0_k3: 1059000, k4_k6: 1235000, k7_k9: 1235000, k10: 1265000, k11: 1350000, titan1: 1210000, titan2: 1320000 }
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
    name: 'Khung Truyền Thống K0',
    dimensions: 'Bản rộng 3.0 cm',
    description: 'Khung truyền thống màu cánh gián vân gỗ chạy viền chỉ vàng. Bản rộng 3cm cứng cáp, phù hợp từ ảnh để bàn đến kích thước 40x60. Nếu làm ảnh lớn hơn, thợ nên cân nhắc chuyển sang khung bản 5 (mã K10) hoặc bản 8 (mã K11) để đảm bảo độ chắc chắn và bề thế.',
    suitableFor: 'Chuyên dùng cho ảnh cụ ông cụ bà, ảnh phục chế truyền thống. Không phù hợp làm ảnh cưới hay ảnh sinh nhật.',
    variants: 'Nâu cánh gián viền chỉ vàng',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K0: Cánh gián viền vàng (3cm)', url: '/images/frames/khung-k0.jpg', colorHex: '#4A2A16', tag: 'K0 Cánh gián' }
    ]
  },
  {
    code: 'K1',
    name: 'Khung Úp K1 (Vân Gỗ Đậm)',
    dimensions: 'Bản rộng 2.0 cm (nhìn chính diện)',
    description: 'Dạng khung úp mặt phẳng, nhìn từ chính diện bản rộng 2cm, màu vân gỗ đậm mộc mạc. Phù hợp cho ảnh để bàn đến kích thước vừa 40x60. Lưu ý không chọn mẫu này cho ảnh khổ lớn vì xương khung mỏng không chịu được lực, rất dễ bị cong vênh sau một thời gian sử dụng.',
    suitableFor: 'Ảnh ông bà, ảnh phục chế, ảnh sinh nhật hoặc ảnh kỷ niệm gia đình cỡ vừa và nhỏ.',
    variants: 'Màu vân gỗ đậm',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K1: Vân gỗ đậm (2cm)', url: '/images/frames/khung-k1.jpg', colorHex: '#5C381E', tag: 'K1 Vân gỗ' }
    ]
  },
  {
    code: 'K2',
    name: 'Khung Úp K2 (Đen Trơn)',
    dimensions: 'Bản rộng 2.0 cm (nhìn chính diện)',
    description: 'Cùng kiểu dáng khung úp phẳng bản 2cm như K1 nhưng phủ tông màu đen trơn hiện đại. Thích hợp cho ảnh để bàn đến cỡ 40x60. Tuyệt đối không chọn cho ảnh phóng lớn vì bản khung mỏng manh, không đủ độ đầm chắc và dễ bị cong vênh theo thời gian.',
    suitableFor: 'Ảnh chân dung, ảnh sinh nhật, ảnh kỷ niệm, ảnh gia đình hiện đại khổ vừa và nhỏ.',
    variants: 'Màu đen trơn',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K2: Đen trơn (2cm)', url: '/images/frames/khung-k2.jpg', colorHex: '#1F1D1B', tag: 'K2 Đen trơn' }
    ]
  },
  {
    code: 'K3',
    name: 'Khung Úp K3 (Trắng)',
    dimensions: 'Bản rộng 2.0 cm (nhìn chính diện)',
    description: 'Cùng kiểu dáng phẳng bản 2cm như K1 và K2 nhưng mang màu trắng sáng tinh tế, sạch sẽ. Phù hợp cho ảnh để bàn đến kích thước 40x60. Không làm cho ảnh cỡ lớn vì bản khung nhỏ không đảm bảo độ phẳng và rất dễ cong vênh khi treo lâu ngày.',
    suitableFor: 'Ảnh em bé, tiệc thôi nôi, sinh nhật, ảnh gia đình trẻ trung từ cỡ để bàn đến 40x60.',
    variants: 'Màu trắng sáng',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K3: Trắng (2cm)', url: '/images/frames/khung-k3.jpg', colorHex: '#FFFFFF', tag: 'K3 Trắng' }
    ]
  },
  {
    code: 'K4',
    name: 'Khung Nổi K4 (Trắng - Kiểu Hàn Quốc)',
    dimensions: 'Thành cao 3.5 cm • Bản mặt chính diện 1.0 cm',
    description: 'Còn được gọi là khung hộp, khung nổi hay khung Hàn Quốc. Khung màu trắng bóng nhẹ, thành cao 3.5cm tạo độ sâu nổi bật nhưng bản mặt nhìn chính diện chỉ 1cm thanh mảnh, hiện đại mà cực kỳ cứng cáp. Phù hợp cho mọi kích cỡ từ ảnh để bàn đến 70x110. Riêng từ khổ 80x120 trở lên đến cỡ đại, khách nên đặt thêm tùy chọn khung xương gia cố phía sau (tính phí thêm) để chống nguy cơ cong vênh, đảm bảo độ phẳng và độ chắc chắn tối ưu.',
    suitableFor: 'Dành cho ảnh cưới hiện đại, ảnh thời trang, ảnh gia đình và ảnh bé. Là lựa chọn hoàn hảo nhất khi phối cùng dòng Ảnh 4K Cao Cấp.',
    variants: 'Trắng (độ bóng vừa phải)',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K4: Trắng (Thành 3.5cm, bản 1cm)', url: '/images/frames/khung-k4.JPG', colorHex: '#FFFFFF', tag: 'K4 Trắng' }
    ]
  },
  {
    code: 'K5',
    name: 'Khung Nổi K5 (Đen - Kiểu Hàn Quốc)',
    dimensions: 'Thành cao 3.5 cm • Bản mặt chính diện 1.0 cm',
    description: 'Cùng hệ khung nổi / khung hộp Hàn Quốc như K4 nhưng mang tông màu đen sang trọng, độ bóng vừa phải. Thành khung cao 3.5cm tạo độ đầm chắc, mặt chính diện 1cm gọn gàng, sắc sảo. Ứng dụng tốt từ ảnh để bàn đến cỡ 70x110. Với khổ lớn từ 80x120 đến cỡ đại, khách nên đặt thêm tùy chọn khung xương gia cố phía sau (tính phí thêm) để chống cong vênh, giữ ảnh luôn phẳng phiu và vững chãi.',
    suitableFor: 'Rất hợp với ảnh cưới nghệ thuật, chân dung studio, ảnh thời trang tone cá tính và ảnh 4K cao cấp.',
    variants: 'Đen (độ bóng vừa phải)',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K5: Đen (Thành 3.5cm, bản 1cm)', url: '/images/frames/khung-k5.JPG', colorHex: '#1F1E1D', tag: 'K5 Đen' }
    ]
  },
  {
    code: 'K6',
    name: 'Khung Nổi K6 (Caffe & Gỗ Nhạt - Kiểu Hàn Quốc)',
    dimensions: 'Thành cao 3.5 cm • Bản mặt chính diện 1.0 cm',
    description: 'Cùng cấu trúc khung nổi Hàn Quốc cao 3.5cm, bản mặt chính diện 1cm như K4 và K5 nhưng khoác lên 2 tông màu vân gỗ mộc mạc: Nâu Caffe trầm và Gỗ nhạt tự nhiên. Khung đáp ứng độ chắc khỏe từ ảnh để bàn đến khổ 70x110. Riêng với các khổ lớn từ 80x120 trở lên đến cỡ đại, khách nên đặt thêm tùy chọn khung xương gia cố phía sau (sản phẩm tùy chọn, tính phí thêm) để triệt tiêu nguy cơ cong vênh, giữ ảnh luôn phẳng phiu và cứng cáp khi sử dụng lâu dài.',
    suitableFor: 'Rất chuộng làm ảnh cưới phong cách Hàn Quốc/ngoại cảnh, ảnh gia đình ấm cúng, ảnh em bé và dòng Ảnh 4K Fomex cao cấp.',
    variants: 'K6 Caffe (Nâu trầm), K6 Gỗ nhạt (Tự nhiên)',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K6: Caffe (Thành 3.5cm, bản 1cm)', url: '/images/frames/khung-k6-caffe.JPG', colorHex: '#3F281D', tag: 'K6 Caffe' },
      { name: 'Khung K6: Gỗ nhạt (Thành 3.5cm, bản 1cm)', url: '/images/frames/khung-k6-nhat1.jpg', colorHex: '#A8815F', tag: 'K6 Gỗ nhạt' }
    ]
  },
  {
    code: 'K7, K8, K9',
    name: 'Khung Nổi K7, K8, K9 (Mặt 1.5cm - Liền Khối)',
    dimensions: 'Bản mặt chính diện 1.5 cm • Độ sâu nông (ảnh phẳng bằng mép khung)',
    description: 'Cùng hệ khung nổi và đồng mức giá với K4, K5, K6 nhưng có nét riêng: bản mặt nhìn chính diện rộng 1.5cm (đầy đặn hơn so với 1.0cm của K4-K6), đồng thời độ sâu khung nông hơn giúp bề mặt ảnh hoàn thiện nằm phẳng bằng mép khung, tạo cảm giác liền khối tinh tế. Khung hiện có 3 màu: Trắng trơn, Đen bóng nhẹ và Gỗ nhạt. Vững chãi từ cỡ ảnh để bàn đến khổ 70x110; từ khổ 80x120 trở lên đến cỡ đại, khách cũng nên làm thêm tùy chọn khung xương gia cố phía sau (sản phẩm tùy chọn, tính phí thêm) để chống nguy cơ cong vênh.',
    suitableFor: 'Rất linh hoạt, phù hợp từ ảnh cưới, ảnh thời trang, ảnh kỷ niệm gia đình đến tiệc sinh nhật, thôi nôi cho bé.',
    variants: 'Trắng trơn, Đen bóng nhẹ, Gỗ nhạt',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K7, K8, K9: Bản mặt 1.5cm (Trắng trơn, Đen bóng nhẹ, Gỗ nhạt)', url: '/images/frames/khung-k7-k8-k9.jpg', colorHex: '#533725', tag: 'K7, K8, K9' }
    ]
  },
  {
    code: 'K10',
    name: 'Khung Truyền Thống K10 (Bản 5cm - Cánh Gián Chỉ Đen)',
    dimensions: 'Bản rộng 5.0 cm • Tăng ~10cm phủ bì mỗi chiều',
    description: 'Khung truyền thống tông màu vân gỗ cánh gián, điểm xuyết viền đen cùng các đường rãnh chìm tinh tế. Độ rộng bản khung 5cm tạo độ đầm và chắc khỏe vượt trội, giúp ảnh sau khi vào khung trông bề thế hơn hẳn (phủ bì tổng thể tăng gần 10cm mỗi chiều so với kích thước ảnh ban đầu). Thích hợp từ kích cỡ 35x50 đến full size khổ lớn. Riêng từ khổ 100x150 trở lên, khách nên đặt thêm tùy chọn khung xương gia cố phía sau (sản phẩm tùy chọn, tính phí thêm) để triệt tiêu nguy cơ cong vênh.',
    suitableFor: 'Đặc biệt phù hợp cho ảnh đại gia đình nhiều thế hệ, ảnh chân dung truyền thống, tranh nghệ thuật hoặc ảnh kỷ niệm trang trọng.',
    variants: 'Màu cánh gián vân gỗ điểm viền đen (Bản rộng 5cm)',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K10: Cánh gián chỉ đen (Bản 5cm)', url: '/images/frames/khung-k10.JPG', colorHex: '#4A2A1A', tag: 'K10 Cánh gián' }
    ]
  },
  {
    code: 'K11',
    name: 'Khung Bản Đại K11 (Bản 8cm - Cánh Gián Chỉ Đen)',
    dimensions: 'Bản rộng 8.0 cm • Tăng ~15cm phủ bì mỗi chiều',
    description: 'Khung bản đại rộng 8cm bề thế tông màu gỗ cánh gián cổ điển, chạy đường chỉ đen và rãnh khuyết chìm tinh tế. Họa tiết trang nhã giúp bề mặt ít bám bụi, rất dễ lau chùi trong quá trình sử dụng mà vẫn toát lên vẻ trang trọng, uy nghi. Bản rộng 8cm khiến kích thước phủ bì thực tế của ảnh rộng thêm gần 15cm mỗi chiều so với cỡ ảnh ban đầu. Phù hợp cho ảnh từ 60x90 đến full size; riêng khổ từ 100x150 trở lên, xưởng khuyến nghị nên đặt thêm tùy chọn khung xương gia cố phía sau (sản phẩm tùy chọn, tính phí thêm) để triệt tiêu nguy cơ cong vênh.',
    suitableFor: 'Rất phù hợp cho ảnh đại gia đình nhiều thế hệ, khung tranh treo phòng khách, tranh phong cảnh lớn và ảnh truyền thống trang trọng.',
    variants: 'Màu gỗ cánh gián điểm chỉ đen & rãnh khuyết chìm (Bản đại 8cm)',
    hasRealPhotos: true,
    images: [
      { name: 'Khung K11: Cánh gián chỉ đen (Bản đại 8cm)', url: '/images/frames/khung-k11.jpg', colorHex: '#4E2712', tag: 'K11 Bản 8cm' }
    ]
  },
  {
    code: 'Titan 1',
    name: 'Khung Hợp Kim Titan 1 (Nhôm Siêu Mỏng - Đen & Bạc Mate)',
    dimensions: 'Viền nhôm siêu mỏng • Bản mặt thanh mảnh vuông vức',
    description: 'Chất liệu hợp kim nhôm nguyên khối với viền cực mỏng, tạo cảm giác trẻ trung, vuông vức và thanh thoát. Tuy viền mỏng nhưng nhờ cấu tạo kim loại nên khung rất cứng cáp, chắc khỏe. Hiện có 2 màu: Bạc Mate và Đen Mate. Phù hợp cho mọi kích cỡ ảnh ép gỗ (từ khổ 70x110 trở lên nên đặt thêm tùy chọn nẹp khung xương gia cố phía sau để chống cong vênh). Lưu ý: Xưởng không khuyến nghị dùng khung Titan 1 cho ảnh 4K vì cấu trúc bắt buộc làm thêm xương gia cố khiến giá thành bị đội lên; nếu muốn kết hợp ảnh 4K với khung kim loại, khách nên chuyển sang chọn khung Titan 2.',
    suitableFor: 'Rất hợp cho ảnh thời trang, ảnh cưới, ảnh sinh nhật hay ảnh gia đình nhờ phong cách trẻ trung, hiện đại mà thanh lịch.',
    variants: 'Titan 1 Đen Mate, Titan 1 Bạc Mate',
    hasRealPhotos: true,
    images: [
      { name: 'Titan 1: Đen Mate', url: '/images/frames/khung-titan1-den.JPG', colorHex: '#181716', tag: 'Titan 1 Đen' },
      { name: 'Titan 1: Bạc Mate', url: '/images/frames/khung-titan1-bac.JPG', colorHex: '#DCDDE1', tag: 'Titan 1 Bạc' }
    ]
  },
  {
    code: 'Titan 2',
    name: 'Khung Hợp Kim Titan 2 (Bản 2cm - Vàng Hồng & Xanh Rêu Bóng)',
    dimensions: 'Bản mặt chính diện 2.0 cm • Cấu trúc đầm chắc',
    description: 'Dòng khung hợp kim kim loại cao cấp với 2 gam màu thời thượng phủ bóng: Vàng hồng bóng (Rose Gold) và Xanh rêu nhẹ bóng. Chi tiết tối giản, sang trọng cùng kết cấu dày dặn, cứng cáp. Độ rộng khung nhìn chính diện là 2.0cm tạo cảm giác đầm chắc, vững vàng. Phù hợp từ ảnh để bàn đến full size khổ lớn. Về gia cố khung xương: với ảnh ép gỗ, khách nên đặt thêm tùy chọn khung xương gia cố phía sau (sản phẩm tùy chọn, tính phí thêm) cho cỡ từ 100x150 trở lên; riêng dòng Ảnh 4K Cao Cấp, từ kích thước 80x120 trở lên mới cần gia cố xương sau để chống cong vênh.',
    suitableFor: 'Đặc biệt hoàn hảo cho ảnh cưới sang trọng, ảnh kỷ niệm gia đình và các bộ ảnh nghệ thuật cao cấp.',
    variants: 'Titan 2 Vàng hồng bóng, Titan 2 Xanh rêu bóng',
    hasRealPhotos: true,
    images: [
      { name: 'Titan 2: Vàng hồng bóng', url: '/images/frames/khung-titan2-hong.jpg', colorHex: '#B87D72', tag: 'Titan 2 Hồng' },
      { name: 'Titan 2: Xanh rêu bóng', url: '/images/frames/khung-titan2-xanh.JPG', colorHex: '#3B5245', tag: 'Titan 2 Xanh' }
    ]
  }
];

export const b2bShopInfo2026 = {
  name: 'Tiệm In 194',
  subTitle: 'Xưởng In Lab & Gia Công Khung Ảnh B2B Cho Studio & Thợ Ảnh',
  hotlineTech: '0967827194',
  zaloTho: '0967827194',
  address: 'Ql1a, Quỳnh Lưu, Nghệ An',
  workingHours: '08:00 - 20:00 từ thứ 2 đến thứ 7 hàng tuần',
};
