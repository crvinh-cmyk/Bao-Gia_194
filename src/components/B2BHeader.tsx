import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { b2bShopInfo2026 } from '../data/tiemIn194Pricing2026';
import { AudienceTierId } from '../types/admin';

interface B2BHeaderProps {
  lockedTier?: AudienceTierId | null;
  onOpenCloudSync?: () => void;
  onOpenAdminDirectly?: () => void;
}

export const B2BHeader: React.FC<B2BHeaderProps> = ({ lockedTier, onOpenAdminDirectly }) => {
  const isRetail = lockedTier === 'retail';
  const [clickCount, setClickCount] = useState(0);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 2) {
      setClickCount(0);
      if (onOpenAdminDirectly) onOpenAdminDirectly();
    }
    setTimeout(() => setClickCount(0), 1000);
  };

  const handleDoubleClick194 = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenAdminDirectly) onOpenAdminDirectly();
  };

  return (
    <>
      {/* Row 1: Ultra-thin True Black Global Nav (44px) — scrolls away so mobile sticky stays slim */}
      <div className="relative z-40 bg-[#000000] text-[#ffffff] w-full max-w-full overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 lg:px-8 h-[44px] flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark (double-click "194" opens Admin directly) */}
          <a
            href="#"
            onClick={handleLogoClick}
            onDoubleClick={handleDoubleClick194}
            className="inline-flex items-center gap-1 text-[12px] font-semibold tracking-[-0.12px] leading-none text-[#ffffff] whitespace-nowrap shrink-0 select-none cursor-pointer"
            title="Click đúp vào 194 để mở Quản Trị Admin"
          >
            <span>Tiệm In</span>
            <span
              onDoubleClick={handleDoubleClick194}
              className="text-[#2997ff] tabular-nums"
            >
              194
            </span>
          </a>

          {/* Zone 2: Quiet Global Links */}
          <nav className="hidden md:flex items-center gap-7 text-[12px] font-normal tracking-[-0.12px] leading-none text-[#cccccc]">
            <a
              href="#bang-tinh-gia"
              className="hover:text-[#ffffff] transition-colors whitespace-nowrap shrink-0"
            >
              {isRetail ? 'Bảng tính giá' : 'Bảng tính nhanh'}
            </a>
            <a
              href="#bang-gia-chi-tiet"
              className="hover:text-[#ffffff] transition-colors whitespace-nowrap shrink-0"
            >
              Biểu giá chi tiết
            </a>
            <a
              href="#tra-cuu-khung"
              className="hover:text-[#ffffff] transition-colors whitespace-nowrap shrink-0"
            >
              {isRetail ? 'Mẫu khung ảnh' : 'Mẫu khung K0–K11'}
            </a>
            {!isRetail && (
              <a
                href="#quy-chuan"
                className="hover:text-[#ffffff] transition-colors whitespace-nowrap shrink-0"
              >
                Quy chuẩn file
              </a>
            )}
          </nav>

          {/* Zone 3: Quiet Hotline Utility */}
          <a
            href={`tel:${b2bShopInfo2026.hotlineTech.replace(/\D/g, '')}`}
            className="inline-flex items-center gap-1.5 text-[12px] font-normal tracking-[-0.12px] leading-none text-[#cccccc] hover:text-[#ffffff] transition-colors tabular-nums whitespace-nowrap shrink-0"
          >
            <Phone className="w-3.5 h-3.5 text-[#cccccc]" />
            <span>{b2bShopInfo2026.hotlineTech}</span>
          </a>
        </div>
      </div>

      {/* Row 2: Frosted Parchment Sub-Nav (52px) — sticks cleanly to top */}
      <header className="sticky top-0 z-40 apple-frosted border-b border-black/[0.08] w-full max-w-full overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 lg:px-8 h-[52px] flex items-center justify-between gap-6">
          {/* Category Title (21px / 600 / 0.231px tracking) */}
          <a
            href="#bang-tinh-gia"
            className="font-display text-[19px] sm:text-[21px] font-semibold leading-[1.19] tracking-[0.231px] text-[#1d1d1f] whitespace-nowrap shrink-0"
          >
            {isRetail ? 'Biểu Giá 2026' : 'Tiệm In 194 Lab'}
          </a>

          {/* Right Inline Links + Persistent Action Blue Pill CTA */}
          <div className="flex items-center gap-6 shrink-0">
            <nav className="hidden lg:flex items-center gap-6 text-[14px] font-normal leading-[1.29] tracking-[-0.224px] text-[#1d1d1f]">
              <a
                href="#bang-tinh-gia"
                className="hover:text-[#0066cc] transition-colors whitespace-nowrap shrink-0"
              >
                {isRetail ? 'Tính giá' : 'Tính nhanh'}
              </a>
              <a
                href="#bang-gia-chi-tiet"
                className="hover:text-[#0066cc] transition-colors whitespace-nowrap shrink-0"
              >
                Bảng giá
              </a>
              <a
                href="#tra-cuu-khung"
                className="hover:text-[#0066cc] transition-colors whitespace-nowrap shrink-0"
              >
                Mẫu khung
              </a>
              {!isRetail && (
                <a
                  href="#quy-chuan"
                  className="hover:text-[#0066cc] transition-colors whitespace-nowrap shrink-0"
                >
                  Quy chuẩn
                </a>
              )}
            </nav>

            <a
              href={`https://zalo.me/${b2bShopInfo2026.zaloTho.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-[#0066cc] hover:bg-[#0071e3] active:scale-95 text-[#ffffff] font-normal rounded-full px-[16px] sm:px-[18px] py-[7px] text-[14px] leading-[1.29] tracking-[-0.224px] transition-all whitespace-nowrap shrink-0"
            >
              {isRetail ? 'Liên Hệ Zalo' : 'Gửi File Zalo'}
            </a>
          </div>
        </div>
      </header>
    </>
  );
};
