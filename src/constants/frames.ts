import { FrameSpecItem } from '../types';

export interface FrameConstantItem {
  id: string;
  code: string;
  name: string;
  imageUrl: string;
  image: string; // alias for image / imageUrl
  dimensions: string;
  description: string;
  suitableFor: string;
  variants: string;
  hasRealPhotos: boolean;
  images: Array<{
    name: string;
    url: string;
    colorHex?: string;
    tag?: string;
  }>;
}

export const FRAMES: FrameConstantItem[] = [
  {
    id: 'k0',
    code: 'K0',
    name: 'Khung Truyền Thống K0',
    imageUrl: '/images/frames/khung-k0.jpg',
    image: '/images/frames/khung-k0.jpg',
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
    id: 'k1',
    code: 'K1',
    name: 'Khung Úp K1 (Vân Gỗ Đậm)',
    imageUrl: '/images/frames/khung-k1.jpg',
    image: '/images/frames/khung-k1.jpg',
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
    id: 'k2',
    code: 'K2',
    name: 'Khung Úp K2 (Đen Trơn)',
    imageUrl: '/images/frames/khung-k2.jpg',
    image: '/images/frames/khung-k2.jpg',
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
    id: 'k3',
    code: 'K3',
    name: 'Khung Úp K3 (Trắng)',
    imageUrl: '/images/frames/khung-k3.jpg',
    image: '/images/frames/khung-k3.jpg',
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
    id: 'k4',
    code: 'K4',
    name: 'Khung Nổi K4 (Trắng - Kiểu Hàn Quốc)',
    imageUrl: '/images/frames/khung-k4.JPG',
    image: '/images/frames/khung-k4.JPG',
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
    id: 'k5',
    code: 'K5',
    name: 'Khung Nổi K5 (Đen - Kiểu Hàn Quốc)',
    imageUrl: '/images/frames/khung-k5.JPG',
    image: '/images/frames/khung-k5.JPG',
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
    id: 'k6',
    code: 'K6',
    name: 'Khung Nổi K6 (Caffe & Gỗ Nhạt - Kiểu Hàn Quốc)',
    imageUrl: '/images/frames/khung-k6-caffe.JPG',
    image: '/images/frames/khung-k6-caffe.JPG',
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
    id: 'k7_k8_k9',
    code: 'K7, K8, K9',
    name: 'Khung Nổi K7, K8, K9 (Mặt 1.5cm - Liền Khối)',
    imageUrl: '/images/frames/khung-k7-k8-k9.jpg',
    image: '/images/frames/khung-k7-k8-k9.jpg',
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
    id: 'k10',
    code: 'K10',
    name: 'Khung Truyền Thống K10 (Bản 5cm - Cánh Gián Chỉ Đen)',
    imageUrl: '/images/frames/khung-k10.JPG',
    image: '/images/frames/khung-k10.JPG',
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
    id: 'k11',
    code: 'K11',
    name: 'Khung Bản Đại K11 (Bản 8cm - Cánh Gián Chỉ Đen)',
    imageUrl: '/images/frames/khung-k11.jpg',
    image: '/images/frames/khung-k11.jpg',
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
    id: 'titan1',
    code: 'Titan 1',
    name: 'Khung Hợp Kim Titan 1 (Nhôm Siêu Mỏng - Đen & Bạc Mate)',
    imageUrl: '/images/frames/khung-titan1-den.JPG',
    image: '/images/frames/khung-titan1-den.JPG',
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
    id: 'titan2',
    code: 'Titan 2',
    name: 'Khung Hợp Kim Titan 2 (Bản 2cm - Vàng Hồng & Xanh Rêu Bóng)',
    imageUrl: '/images/frames/khung-titan2-hong.jpg',
    image: '/images/frames/khung-titan2-hong.jpg',
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

// Mapping for exact frame paths requested by specification
export const EXACT_FRAME_PATHS: Record<string, string> = {
  'K0': '/images/frames/khung-k0.jpg',
  'k0': '/images/frames/khung-k0.jpg',
  'K1': '/images/frames/khung-k1.jpg',
  'k1': '/images/frames/khung-k1.jpg',
  'K2': '/images/frames/khung-k2.jpg',
  'k2': '/images/frames/khung-k2.jpg',
  'K3': '/images/frames/khung-k3.jpg',
  'k3': '/images/frames/khung-k3.jpg',
  'K4': '/images/frames/khung-k4.JPG',
  'k4': '/images/frames/khung-k4.JPG',
  'K5': '/images/frames/khung-k5.JPG',
  'k5': '/images/frames/khung-k5.JPG',
  'K6': '/images/frames/khung-k6-caffe.JPG',
  'k6': '/images/frames/khung-k6-caffe.JPG',
  'K6 Caffe': '/images/frames/khung-k6-caffe.JPG',
  'K6 Gỗ nhạt': '/images/frames/khung-k6-nhat1.jpg',
  'K6_CAFFE': '/images/frames/khung-k6-caffe.JPG',
  'K6_NHAT': '/images/frames/khung-k6-nhat1.jpg',
  'K7': '/images/frames/khung-k7-k8-k9.jpg',
  'k7': '/images/frames/khung-k7-k8-k9.jpg',
  'K8': '/images/frames/khung-k7-k8-k9.jpg',
  'k8': '/images/frames/khung-k7-k8-k9.jpg',
  'K9': '/images/frames/khung-k7-k8-k9.jpg',
  'k9': '/images/frames/khung-k7-k8-k9.jpg',
  'K7, K8, K9': '/images/frames/khung-k7-k8-k9.jpg',
  'K7-K9': '/images/frames/khung-k7-k8-k9.jpg',
  'K10': '/images/frames/khung-k10.JPG',
  'k10': '/images/frames/khung-k10.JPG',
  'K11': '/images/frames/khung-k11.jpg',
  'k11': '/images/frames/khung-k11.jpg',
  'Titan 1': '/images/frames/khung-titan1-den.JPG',
  'titan 1': '/images/frames/khung-titan1-den.JPG',
  'Titan 1 Đen': '/images/frames/khung-titan1-den.JPG',
  'Titan 1 Bạc': '/images/frames/khung-titan1-bac.JPG',
  'TITAN1': '/images/frames/khung-titan1-den.JPG',
  'Titan 2': '/images/frames/khung-titan2-hong.jpg',
  'titan 2': '/images/frames/khung-titan2-hong.jpg',
  'Titan 2 Hồng': '/images/frames/khung-titan2-hong.jpg',
  'Titan 2 Xanh': '/images/frames/khung-titan2-xanh.JPG',
  'TITAN2': '/images/frames/khung-titan2-hong.jpg'
};

// Helper function to safely get encoded image URL to avoid 404s on Vercel
export function getFrameImageSrc(urlOrCode: string): string {
  if (!urlOrCode) return '';
  // Check if it's a known frame code
  const trimmed = urlOrCode.trim();
  if (EXACT_FRAME_PATHS[trimmed]) {
    return encodeURI(EXACT_FRAME_PATHS[trimmed]);
  }
  const upper = trimmed.toUpperCase();
  if (EXACT_FRAME_PATHS[upper]) {
    return encodeURI(EXACT_FRAME_PATHS[upper]);
  }
  return encodeURI(urlOrCode);
}

export function getExactFrameSrc(code: string, fallbackUrl?: string): string {
  if (code && EXACT_FRAME_PATHS[code.trim()]) {
    return encodeURI(EXACT_FRAME_PATHS[code.trim()]);
  }
  if (code && EXACT_FRAME_PATHS[code.trim().toUpperCase()]) {
    return encodeURI(EXACT_FRAME_PATHS[code.trim().toUpperCase()]);
  }
  if (fallbackUrl) {
    return encodeURI(fallbackUrl);
  }
  return '';
}

export default FRAMES;
