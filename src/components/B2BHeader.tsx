import React, { useState } from 'react';
import { Phone, MessageCircle, Calculator, Ruler } from 'lucide-react';
import { b2bShopInfo2026 } from '../data/tiemIn194Pricing2026';

interface B2BHeaderProps {
  onOpenCloudSync?: () => void;
  onOpenAdminDirectly?: () => void;
}

export const B2BHeader: React.FC<B2BHeaderProps> = ({ onOpenAdminDirectly }) => {
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
    <header className="sticky top-0 z-40 bg-[#1E2A78] text-white shadow-md border-b border-white/10 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full max-w-full">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 w-full max-w-full">
          
          {/* Zone 1: Wordmark with double-click secret admin trigger */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a 
              href="#" 
              onClick={handleLogoClick}
              onDoubleClick={handleDoubleClick194}
              className="flex items-center gap-2 group cursor-pointer select-none"
              title="Click đúp vào 194 để mở Quản Trị Admin"
            >
              <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>Tiệm In</span>
                <span 
                  onDoubleClick={handleDoubleClick194}
                  className="bg-amber-400 text-[#1E2A78] font-black rounded-lg px-2 py-0.5 font-mono tabular-nums shadow-xs hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  194
                </span>
              </span>
              <span className="bg-white/15 text-amber-300 font-mono text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded-md tabular-nums">
                LAB 2026
              </span>
            </a>
          </div>

          {/* Zone 2: Clean Nav Links */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold">
            <a href="#bang-tinh-gia" className="text-blue-100 hover:text-white hover:bg-white/10 rounded-xl px-3 py-1.5 transition-all flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-amber-300" />
              <span>Bảng Tính Giá Nhanh</span>
            </a>
            <a href="#bang-gia-chi-tiet" className="text-blue-100 hover:text-white hover:bg-white/10 rounded-xl px-3 py-1.5 transition-all">
              Biểu Giá Chi Tiết
            </a>
            <a href="#tra-cuu-khung" className="text-blue-100 hover:text-white hover:bg-white/10 rounded-xl px-3 py-1.5 transition-all flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-amber-300" />
              <span>Tra Cứu Khung K0-K11</span>
            </a>
            <a href="#quy-chuan" className="text-blue-100 hover:text-white hover:bg-white/10 rounded-xl px-3 py-1.5 transition-all">
              Quy Chuẩn Gửi File
            </a>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <a
              href={`tel:${b2bShopInfo2026.hotlineTech.replace(/\D/g, '')}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-amber-300 hover:text-amber-200 bg-white/10 hover:bg-white/15 rounded-xl transition-colors tabular-nums"
            >
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>{b2bShopInfo2026.hotlineTech}</span>
            </a>

            <a
              href={`https://zalo.me/${b2bShopInfo2026.zaloTho.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-500 text-white font-bold rounded-xl px-4 py-2 text-xs transition-all whitespace-nowrap shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-white" />
              <span>Gửi File Qua Zalo</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
