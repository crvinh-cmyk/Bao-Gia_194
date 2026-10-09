import React from 'react';
import { Phone, MessageCircle, Calculator, Ruler, FileText } from 'lucide-react';
import { b2bShopInfo2026 } from '../data/tiemIn194Pricing2026';

export const B2BHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-[#1C1917]/95 backdrop-blur-md border-b border-white/10 text-white w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full max-w-full">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 w-full max-w-full">
          
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a href="#" className="flex items-baseline gap-1.5 sm:gap-2 group">
              <span className="font-serif-display text-lg sm:text-2xl font-bold tracking-tight text-white group-hover:text-[#E7C184] transition-colors">
                Tiệm In <span className="text-[#FF0000] font-black drop-shadow-xs">194</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono text-[#E7C184] font-semibold tracking-wider uppercase bg-white/10 px-1.5 sm:px-2 py-0.5 rounded">
                B2B 2026
              </span>
            </a>
          </div>

          {/* Zone 2: Clean Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-neutral-300">
            <a href="#bang-tinh-gia" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-[#E7C184]" />
              <span>Bảng Tính Giá Thợ</span>
            </a>
            <a href="#bang-gia-chi-tiet" className="hover:text-white transition-colors">
              Bảng Giá 5 Chất Liệu
            </a>
            <a href="#tra-cuu-khung" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-[#E7C184]" />
              <span>Tra Cứu Khung K0-K11</span>
            </a>
            <a href="#quy-chuan" className="hover:text-white transition-colors">
              Quy Chuẩn Gửi File
            </a>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <a
              href={`tel:${b2bShopInfo2026.hotlineTech.replace(/\D/g, '')}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#E7C184]" />
              <span>{b2bShopInfo2026.hotlineTech}</span>
            </a>

            <a
              href={`https://zalo.me/${b2bShopInfo2026.zaloTho.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0068FF] hover:bg-[#0052cc] rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-white" />
              <span>Gửi File Zalo Thợ</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
