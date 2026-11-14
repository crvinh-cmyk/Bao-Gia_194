import React from 'react';
import { Calculator, ArrowDown, Ruler } from 'lucide-react';

export const B2BHeroBar: React.FC = () => {
  return (
    <>
      {/* Scroll Indicator Bar */}
      <div className="bg-[#1E2A78]/95 border-b border-blue-800/50 py-2 px-3 flex items-center justify-center text-center shadow-xs">
        <a
          href="#bang-gia-chi-tiet"
          className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer group select-none"
        >
          <span className="text-sm animate-bounce inline-block">👇</span>
          <span className="font-extrabold tracking-tight">Cuộn xuống để xem chi tiết các chất liệu & mẫu khung</span>
          <span className="text-xs group-hover:translate-y-0.5 transition-transform font-bold">↓</span>
        </a>
      </div>

      <section className="bg-[#F8FAFC] pt-3 pb-4 md:pt-8 md:pb-10 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full max-w-full">
          <div className="bg-gradient-to-br from-[#1E2A78] via-[#1E3A8A] to-[#0F172A] text-white rounded-3xl p-6 md:p-10 shadow-lg border border-blue-800/40 w-full max-w-full">
            <div className="max-w-4xl space-y-3 md:space-y-4 w-full max-w-full">
              
              {/* Technical Kicker */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold tracking-wider text-xs uppercase font-mono tabular-nums">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <span className="truncate">TIỆM IN <span className="text-amber-400 font-black">194</span> · BIỂU GIÁ IN ẢNH & KHUNG NĂM 2026</span>
                </div>
              </div>

              {/* Main Title */}
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Biểu Giá & Quy Cách Khung — In Ấn & Hoàn Thiện Chuẩn Màu Lab
              </h1>

              {/* Core Technical Description */}
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-3xl">
                Biểu giá chuẩn năm 2026: Đầy đủ các dòng <strong className="text-white">Gỗ Lụa Đóng Khung</strong>, <strong className="text-white">HD Gương Siêu Bóng</strong>, <strong className="text-white">Mika Phổ Thông</strong>, <strong className="text-white">In Ép Mika</strong>, <strong className="text-white">Ảnh Cao Cấp 4K Fomex</strong> và <strong className="text-white">Album Mở Phẳng</strong>. Tra cứu tự động theo từng khổ ảnh và mã khung.
              </p>

              {/* Quick Action Navigation Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 md:gap-3 pt-1 md:pt-2">
                <a
                  href="#bang-tinh-gia"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl px-5 py-3 text-xs sm:text-sm transition-all shadow-md active:scale-95"
                >
                  <Calculator className="w-4 h-4 text-slate-950" />
                  <span>Dùng Bảng Tính Giá Tự Động</span>
                </a>

                <a
                  href="#bang-gia-chi-tiet"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold rounded-xl px-5 py-3 text-xs sm:text-sm transition-all active:scale-95"
                >
                  <span>Xem Bảng Giá Chi Tiết ↓</span>
                </a>

                <a
                  href="#tra-cuu-khung"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-semibold text-blue-100 hover:text-white rounded-xl transition-colors"
                >
                  <Ruler className="w-4 h-4 text-amber-300" />
                  <span>Quy cách khung K0 - K11</span>
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
};
