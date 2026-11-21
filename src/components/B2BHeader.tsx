import React, { useState } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-md text-white border-b border-slate-800/90 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full">
        <div className="flex items-center justify-between h-15 sm:h-16 gap-6 w-full max-w-full">
          
          {/* Zone 1: Clean single-line Brand Wordmark (double click "194" opens Admin) */}
          <a
            href="#"
            onClick={handleLogoClick}
            onDoubleClick={handleDoubleClick194}
            className="flex items-center gap-1.5 shrink-0 whitespace-nowrap select-none cursor-pointer group"
            title="Click đúp vào 194 để mở Quản Trị Admin"
          >
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
              Tiệm In
            </span>
            <span
              onDoubleClick={handleDoubleClick194}
              className="bg-[#F59E0B] group-hover:bg-[#FBBF24] text-[#0F172A] font-black rounded-md px-2 py-0.5 font-mono tabular-nums text-sm sm:text-base transition-colors"
            >
              194
            </span>
          </a>

          {/* Zone 2: Minimal Single-Line Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-slate-300">
            <a
              href="#bang-tinh-gia"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#F59E0B]"
            >
              {isRetail ? 'Bảng tính giá' : 'Bảng tính nhanh'}
            </a>
            <a
              href="#bang-gia-chi-tiet"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#F59E0B]"
            >
              Biểu giá chi tiết
            </a>
            <a
              href="#tra-cuu-khung"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#F59E0B]"
            >
              {isRetail ? 'Mẫu khung ảnh' : 'Mẫu khung K0-K11'}
            </a>
            {!isRetail && (
              <a
                href="#quy-chuan"
                className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#F59E0B]"
              >
                Quy chuẩn file
              </a>
            )}
          </nav>

          {/* Zone 3: Contact Hotline + Amber Zalo CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`tel:${b2bShopInfo2026.hotlineTech.replace(/\D/g, '')}`}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-300 hover:text-[#FBBF24] transition-colors tabular-nums whitespace-nowrap shrink-0"
            >
              <Phone className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{b2bShopInfo2026.hotlineTech}</span>
            </a>

            <a
              href={`https://zalo.me/${b2bShopInfo2026.zaloTho.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] font-bold rounded-lg px-3.5 sm:px-4 py-2 text-xs transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#0F172A]" />
              <span>{isRetail ? 'Liên Hệ Zalo' : 'Gửi File Zalo'}</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
