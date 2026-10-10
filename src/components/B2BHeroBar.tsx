import React from 'react';
import { Calculator, ArrowDown, ShieldCheck, Ruler, Sparkles } from 'lucide-react';

export const B2BHeroBar: React.FC = () => {
  return (
    <>
      {/* Scroll Indicator Bar - Di chuyển lên sát cạnh trên cùng của Bảng Giá Sỉ & Quy Cách Khung Chuyên Nghiệp */}
      <div className="bg-[#191615] border-b border-[#38332E] py-2 px-3 flex items-center justify-center text-center shadow-inner">
        <a
          href="#bang-gia-chi-tiet"
          className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#FF0000] hover:text-red-400 transition-colors cursor-pointer group select-none"
        >
          <span className="text-sm animate-bounce inline-block">👇</span>
          <span className="text-[#FF0000] font-extrabold tracking-tight">Cuộn xuống để xem chi tiết 5 chất liệu & mẫu khung</span>
          <span className="text-xs text-[#FF0000] group-hover:translate-y-0.5 transition-transform font-bold">↓</span>
        </a>
      </div>

      <section className="bg-[#1C1917] text-white pt-2.5 pb-3.5 md:pt-10 md:pb-12 border-b border-neutral-800 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full max-w-full">
          <div className="max-w-4xl space-y-2 md:space-y-4 w-full max-w-full">
            
            {/* Technical Kicker */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] md:text-xs font-mono text-[#E7C184]">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#E7C184] animate-pulse shrink-0" />
              <span className="truncate">TIỆM IN <span className="text-[#FF0000] font-black">194</span> · BẢNG GIÁ SỈ GỐC TẠI XƯỞNG NĂM 2026</span>
            </div>

            {/* Main Title - Compact on mobile */}
            <h1 className="font-serif-display text-lg sm:text-3xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Bảng Giá Sỉ & Quy Cách Khung <br className="hidden sm:inline" />
              <span className="text-[#E7C184] font-normal italic">Chuyên Nghiệp Cho Thợ Ảnh & Studio</span>
            </h1>

            {/* Core Technical Description - Compact on mobile */}
            <p className="text-[11px] sm:text-xs md:text-sm text-neutral-300 leading-tight md:leading-relaxed max-w-2xl line-clamp-2 sm:line-clamp-none">
              Bộ bảng giá chuẩn năm 2026: Đầy đủ các dòng <strong>Gỗ Lụa Đóng Khung</strong>, <strong>HD Gương Siêu Bóng</strong>, <strong>Mika Phổ Thông</strong>, <strong>In Ép Mika</strong>, và dòng cao cấp <strong>Ảnh Cao Cấp 4K Fomex</strong>. Tra cứu giá tự động theo từng mã khung K0 - K11 và Titan T1, T2.
            </p>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3 pt-0.5 md:pt-2">
              <a
                href="#bang-tinh-gia"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-5 md:py-2.5 text-[11px] md:text-xs font-bold text-[#1C1917] bg-[#E7C184] hover:bg-[#D4AF37] rounded-xl transition-all shadow-md active:scale-95"
              >
                <Calculator className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#1C1917]" />
                <span>Dùng Bảng Tính Giá Tự Động</span>
              </a>

              <a
                href="#bang-gia-chi-tiet"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2.5 text-[11px] md:text-xs font-semibold text-white bg-white/10 hover:bg-white/15 rounded-xl transition-all border border-white/10 active:scale-95"
              >
                <span>Xem Bảng Giá 5 Chất Liệu</span>
                <ArrowDown className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#E7C184]" />
              </a>

              <a
                href="#tra-cuu-khung"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2.5 text-[11px] md:text-xs font-semibold text-neutral-300 hover:text-white rounded-xl transition-colors"
              >
                <Ruler className="w-3.5 h-3.5 text-[#E7C184]" />
                <span>Quy cách khung K0 - K11</span>
              </a>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};
