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
    name: 'Khung Cổ Điển K0',
    imageUrl: '/images/frames/khung-k0.jpg',
    image: '/images/frames/khung-k0.jpg',
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
    id: 'k1',
    code: 'K1',
    name: 'Khung Úp K1 (Gỗ Sồi Sáng)',
    imageUrl: '/images/frames/khung-k1.jpg',
    image: '/images/frames/khung-k1.jpg',
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
    id: 'k2',
    code: 'K2',
    name: 'Khung Úp K2 (Đen Nhung Mờ)',
    imageUrl: '/images/frames/khung-k2.jpg',
    image: '/images/frames/khung-k2.jpg',
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
    id: 'k3',
    code: 'K3',
    name: 'Khung Úp K3 (Trắng Sứ)',
    imageUrl: '/images/frames/khung-k3.jpg',
    image: '/images/frames/khung-k3.jpg',
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
    id: 'k4',
    code: 'K4',
    name: 'Khung Hộp K4 (Trắng)',
    imageUrl: '/images/frames/khung k4 màu trắng.jpg',
    image: '/images/frames/khung k4 màu trắng.jpg',
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
    id: 'k5',
    code: 'K5',
    name: 'Khung Hộp K5 (Đen Mờ)',
    imageUrl: '/images/frames/khung k5 đen mờ.jpg',
    image: '/images/frames/khung k5 đen mờ.jpg',
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
    id: 'k6',
    code: 'K6',
    name: 'Khung Hộp K6 (Caffe & Gỗ Nhạt)',
    imageUrl: '/images/frames/khung k6 màu cafe.jpg',
    image: '/images/frames/khung k6 màu cafe.jpg',
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
    id: 'k7_k8_k9',
    code: 'K7, K8, K9',
    name: 'Khung Hộp Vừa K7, K8, K9',
    imageUrl: '/images/frames/khung-k7-k8-k9.jpg',
    image: '/images/frames/khung-k7-k8-k9.jpg',
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
    id: 'k10',
    code: 'K10',
    name: 'Khung Bản Rộng K10',
    imageUrl: '/images/frames/khung k10 bản 5 cm màu nâu đậm.jpg',
    image: '/images/frames/khung k10 bản 5 cm màu nâu đậm.jpg',
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
    id: 'k11',
    code: 'K11',
    name: 'Khung Bản Đại K11 (Bản 8cm)',
    imageUrl: '/images/frames/khung-k11.jpg',
    image: '/images/frames/khung-k11.jpg',
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
    id: 'titan1',
    code: 'Titan 1',
    name: 'Khung Hợp Kim Titan 1',
    imageUrl: '/images/frames/khung titan 1 màu đen.jpg',
    image: '/images/frames/khung titan 1 màu đen.jpg',
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
    id: 'titan2',
    code: 'Titan 2',
    name: 'Khung Hợp Kim Titan 2',
    imageUrl: '/images/frames/khung titan 2 màu xanh.jpg',
    image: '/images/frames/khung titan 2 màu xanh.jpg',
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
  'K7': '/images/frames/khung-k7-k8-k9.jpg',
  'k7': '/images/frames/khung-k7-k8-k9.jpg',
  'K8': '/images/frames/khung-k7-k8-k9.jpg',
  'k8': '/images/frames/khung-k7-k8-k9.jpg',
  'K9': '/images/frames/khung-k7-k8-k9.jpg',
  'k9': '/images/frames/khung-k7-k8-k9.jpg',
  'K7, K8, K9': '/images/frames/khung-k7-k8-k9.jpg',
  'K7-K9': '/images/frames/khung-k7-k8-k9.jpg',
  'K11': '/images/frames/khung-k11.jpg',
  'k11': '/images/frames/khung-k11.jpg'
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
