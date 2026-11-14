import React from 'react';
import { FrameConstantItem } from '../constants/frames';
import { FrameSpecItem } from '../types';

export const GITHUB_RAW_BASE_URL =
  'https://raw.githubusercontent.com/crvinh-cmyk/Bao-Gia_194/main/public';

/**
 * Bản đồ các biến thể tên file có dấu chấm thừa (...jpg, ..jpg, .jpg.jpg) hoặc khác hoa/thường (.JPG vs .jpg)
 * để tự động fallback khi gặp lỗi 404 trên cả GitHub Raw, AI Studio Preview và Vercel Production.
 */
const FILENAME_FALLBACK_VARIANTS: Record<string, string[]> = {
  '/images/frames/khung-titan2-hong.jpg': [
    '/images/frames/khung-titan2-hong.jpg',
    '/images/frames/khung-titan2-hong.JPG',
    '/images/frames/khung-titan2-hong...jpg',
  ],
  '/images/frames/khung-titan2-hong...jpg': [
    '/images/frames/khung-titan2-hong.jpg',
    '/images/frames/khung-titan2-hong.JPG',
    '/images/frames/khung-titan2-hong...jpg',
  ],
  '/images/frames/khung-titan2-xanh.JPG': [
    '/images/frames/khung-titan2-xanh.JPG',
    '/images/frames/khung-titan2-xanh..jpg',
    '/images/frames/khung-titan2-xanh.jpg',
  ],
  '/images/frames/khung-titan2-xanh..jpg': [
    '/images/frames/khung-titan2-xanh.JPG',
    '/images/frames/khung-titan2-xanh..jpg',
    '/images/frames/khung-titan2-xanh.jpg',
  ],
  '/images/frames/khung-titan2-xanh.jpg': [
    '/images/frames/khung-titan2-xanh.JPG',
    '/images/frames/khung-titan2-xanh..jpg',
    '/images/frames/khung-titan2-xanh.jpg',
  ],
  '/images/frames/anh-bo-vien.jpg': [
    '/images/frames/anh-bo-vien.jpg',
    '/images/frames/anh-bo-vien.jpg.jpg',
  ],
  '/images/frames/anh-bo-vien.jpg.jpg': [
    '/images/frames/anh-bo-vien.jpg',
    '/images/frames/anh-bo-vien.jpg.jpg',
  ],
  '/images/frames/khung-k4.JPG': [
    '/images/frames/khung-k4.JPG',
    '/images/frames/khung-k4.jpg',
  ],
  '/images/frames/khung-k5.JPG': [
    '/images/frames/khung-k5.JPG',
    '/images/frames/khung-k5.jpg',
  ],
  '/images/frames/khung-k6-caffe.JPG': [
    '/images/frames/khung-k6-caffe.JPG',
    '/images/frames/khung-k6-caffe.jpg',
  ],
  '/images/frames/khung-k10.JPG': [
    '/images/frames/khung-k10.JPG',
    '/images/frames/khung-k10.jpg',
  ],
  '/images/frames/khung-titan1-den.JPG': [
    '/images/frames/khung-titan1-den.JPG',
    '/images/frames/khung-titan1-den.jpg',
  ],
  '/images/frames/khung-titan1-bac.JPG': [
    '/images/frames/khung-titan1-bac.JPG',
    '/images/frames/khung-titan1-bac.jpg',
  ],
};

/**
 * Kiểm tra xem ứng dụng có đang chạy trên môi trường Preview AI Studio hay không.
 * Khi chạy trên Vercel production (*.vercel.app hoặc tên miền riêng), giữ nguyên đường dẫn `/images/frames/...`.
 */
export function isAiStudioPreviewEnv(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return (
    host.includes('run.app') ||
    host.includes('googleusercontent.com') ||
    host.includes('aistudio.google.com')
  );
}

/**
 * Tự động tạo danh sách các biến thể tên file (xử lý dấu chấm thừa `...jpg`, `..jpg`, `.jpg.jpg` và `.JPG`/`.jpg`)
 */
export function getPathVariantsWithDotFallback(rawPath: string): string[] {
  if (!rawPath) return [];
  const trimmed = rawPath.trim();

  // Nếu là đường dẫn GitHub Raw sẵn, tách phần `/images/frames/...` để tạo biến thể
  let cleanLocalPath = trimmed;
  if (trimmed.startsWith(GITHUB_RAW_BASE_URL)) {
    cleanLocalPath = trimmed.slice(GITHUB_RAW_BASE_URL.length);
  }

  const variants = new Set<string>();

  if (FILENAME_FALLBACK_VARIANTS[cleanLocalPath]) {
    FILENAME_FALLBACK_VARIANTS[cleanLocalPath].forEach((v) => variants.add(v));
  } else {
    variants.add(cleanLocalPath);
  }

  // Xử lý tự động nếu đường dẫn có hoặc chưa có dấu chấm thừa (...jpg, ..jpg)
  if (cleanLocalPath.startsWith('/images/frames/')) {
    // Chuẩn hóa nhiều dấu chấm liên tiếp thành 1 dấu chấm: khung-titan2-hong...jpg -> khung-titan2-hong.jpg
    const normalizedSingleDot = cleanLocalPath
      .replace(/\.{2,}(jpg|jpeg|png)$/i, '.$1')
      .replace(/\.jpg\.jpg$/i, '.jpg');
    variants.add(normalizedSingleDot);

    // Đổi hoa/thường phần mở rộng (.jpg <-> .JPG)
    if (normalizedSingleDot.endsWith('.jpg')) {
      variants.add(normalizedSingleDot.slice(0, -4) + '.JPG');
    } else if (normalizedSingleDot.endsWith('.JPG')) {
      variants.add(normalizedSingleDot.slice(0, -4) + '.jpg');
    }

    // Tạo thêm phương án fallback dấu chấm thừa nếu file gốc trên repo có `..jpg` hoặc `...jpg`
    const doubleDot = normalizedSingleDot.replace(/\.(jpg|jpeg)$/i, '..$1');
    const tripleDot = normalizedSingleDot.replace(/\.(jpg|jpeg)$/i, '...$1');
    variants.add(doubleDot);
    variants.add(tripleDot);
  }

  return Array.from(variants);
}

/**
 * Hàm Resolve Image URL thông minh cho cả Local, Preview AI Studio và Vercel Production:
 * - Luôn ưu tiên tải ảnh trực tiếp từ `/images/frames/...` có sẵn trong thư mục `public/images/frames/`.
 * - Nếu đường dẫn bắt đầu bằng GitHub Raw URL của chính dự án, rút gọn về đường dẫn chuẩn `/images/frames/...`.
 */
export function getFrameImageUrl(path: string): string {
  if (!path) return '';
  let trimmed = path.trim();

  // Không bao giờ dùng chuỗi Base64
  if (trimmed.startsWith('data:image/')) {
    return '/images/frames/khung-k0.jpg';
  }

  if (trimmed.startsWith(GITHUB_RAW_BASE_URL)) {
    trimmed = decodeURI(trimmed.slice(GITHUB_RAW_BASE_URL.length));
  }

  // Nếu là URL bên ngoài khác, trả về nguyên bản
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Nếu path bắt đầu bằng "/images/frames/"
  if (trimmed.startsWith('/images/frames/')) {
    const normalizedPath = decodeURI(trimmed)
      .replace(/\.{2,}(jpg|jpeg|png)$/i, '.$1')
      .replace(/\.jpg\.jpg$/i, '.jpg');

    return encodeURI(normalizedPath);
  }

  return encodeURI(trimmed);
}

/**
 * Tạo danh sách toàn bộ các URL dự phòng (Local + GitHub Raw + biến thể dấu chấm thừa `..jpg`/`...jpg`)
 * để khi thẻ <img> gặp lỗi 404 sẽ tự động chuyển đổi sang URL hợp lệ tiếp theo.
 */
export function getFrameImageFallbackChain(rawPath: string): string[] {
  if (!rawPath) return [];
  const trimmed = rawPath.trim();

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (!trimmed.startsWith(GITHUB_RAW_BASE_URL)) {
      return [trimmed];
    }
  }

  const localVariants = getPathVariantsWithDotFallback(trimmed);
  const chain: string[] = [];

  const addUnique = (url: string) => {
    if (url && !chain.includes(url)) {
      chain.push(url);
    }
  };

  for (const v of localVariants) {
    addUnique(encodeURI(v));
  }
  for (const v of localVariants) {
    addUnique(`${GITHUB_RAW_BASE_URL}${encodeURI(v)}`);
  }

  return chain;
}

/**
 * Trình xử lý sự kiện onError cho thẻ <img>:
 * Tự động thử lần lượt các đường dẫn fallback, bỏ qua URL đang lỗi để không bao giờ bị kẹt.
 */
export function handleFrameImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  rawPath: string
): void {
  const imgEl = e.currentTarget;
  const fallbacks = getFrameImageFallbackChain(rawPath);
  if (fallbacks.length === 0) return;

  let nextIdx =
    imgEl.dataset.fallbackIdx !== undefined
      ? parseInt(imgEl.dataset.fallbackIdx, 10) + 1
      : 0;

  while (nextIdx < fallbacks.length) {
    const candidate = fallbacks[nextIdx];
    let resolvedCandidate = candidate;
    try {
      if (typeof window !== 'undefined') {
        resolvedCandidate = new URL(candidate, window.location.origin).href;
      }
    } catch {
      // Ignore URL parse error
    }

    if (imgEl.src !== candidate && imgEl.src !== resolvedCandidate) {
      imgEl.dataset.fallbackIdx = String(nextIdx);
      imgEl.src = candidate;
      return;
    }
    nextIdx += 1;
  }

  imgEl.dataset.fallbackIdx = String(fallbacks.length);
}

/**
 * Làm sạch đường dẫn ảnh trước khi lưu vào localStorage hoặc đồng bộ lên Cloud Firestore:
 * - Loại bỏ hoàn toàn chuỗi Base64 (không bao giờ lưu Base64 vào Firestore).
 * - Chuyển đổi mọi đường dẫn GitHub Raw hoặc đường dẫn có dấu chấm thừa (...jpg) về đường dẫn tệp ngắn gọn
 *   (ví dụ: "/images/frames/khung-titan2-hong.jpg").
 */
export function sanitizeFramePathForFirestore(path: string | undefined, defaultFallback = '/images/frames/khung-k0.jpg'): string {
  if (!path) return defaultFallback;
  const trimmed = path.trim();

  // Loại bỏ hoàn toàn chuỗi Base64
  if (trimmed.startsWith('data:image/')) {
    return defaultFallback;
  }

  // Nếu là link GitHub Raw của dự án, rút gọn về `/images/frames/...`
  let clean = trimmed;
  if (clean.startsWith(GITHUB_RAW_BASE_URL)) {
    clean = clean.slice(GITHUB_RAW_BASE_URL.length);
  }

  if (clean.startsWith('/images/frames/')) {
    clean = decodeURI(clean)
      .replace(/\.{2,}(jpg|jpeg|png)$/i, '.$1')
      .replace(/\.jpg\.jpg$/i, '.jpg');
  }

  return clean;
}

/**
 * Làm sạch toàn bộ danh sách mẫu khung trước khi lưu vào Firestore (Không lưu Base64, chỉ lưu đường dẫn ngắn gọn)
 */
export function sanitizeFramesForFirestore<T extends FrameConstantItem | FrameSpecItem>(frames: T[]): T[] {
  if (!Array.isArray(frames)) return [];
  return frames.map((frame) => {
    const cleanImages = Array.isArray(frame.images)
      ? frame.images.map((img) => ({
          ...img,
          url: sanitizeFramePathForFirestore(img.url),
        }))
      : [];

    const primaryPath =
      cleanImages[0]?.url ||
      sanitizeFramePathForFirestore((frame as FrameConstantItem).imageUrl || (frame as FrameConstantItem).image);

    const sanitized: any = {
      ...frame,
      images: cleanImages,
    };

    if ('imageUrl' in frame || 'image' in frame) {
      sanitized.imageUrl = primaryPath;
      sanitized.image = primaryPath;
    }

    return sanitized as T;
  });
}
