import React from 'react';
import { Calculator, ArrowDown, ShieldCheck, Ruler, Sparkles } from 'lucide-react';

export const B2BHeroBar: React.FC = () => {
  return (
    <section className="bg-[#1C1917] text-white pt-8 pb-10 sm:pt-12 sm:pb-14 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl space-y-4">
          
          {/* Technical Kicker */}
          <div className="flex items-center gap-2 text-xs font-mono text-[#E7C184]">
            <span className="w-2 h-2 rounded-full bg-[#E7C184] animate-pulse" />
            <span>TIỆM IN 194 · BẢNG GIÁ SỈ GỐC TẠI XƯỞNG NĂM 2026</span>
          </div>

          {/* Main Title */}
          <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Bảng Giá Sỉ & Quy Cách Khung <br />
            <span className="text-[#E7C184] font-normal italic">Chuyên Nghiệp Cho Thợ Ảnh & Studio</span>
          </h1>

          {/* Core Technical Description */}
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
            Bộ bảng giá chuẩn năm 2026: Đầy đủ các dòng <strong>Gỗ Lụa Đóng Khung</strong>, <strong>HD Gương Siêu Bóng</strong>, <strong>Mika Phổ Thông</strong>, <strong>In Ép Mika</strong>, và dòng cao cấp <strong>Ảnh Cao Cấp 4K Fomex</strong>. Tra cứu giá tự động theo từng mã khung K0 - K11 và Titan T1, T2.
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#bang-tinh-gia"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#1C1917] bg-[#E7C184] hover:bg-[#D4AF37] rounded-xl transition-all shadow-md"
            >
              <Calculator className="w-4 h-4 text-[#1C1917]" />
              <span>Dùng Bảng Tính Giá Tự Động</span>
            </a>

            <a
              href="#bang-gia-chi-tiet"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 rounded-xl transition-all border border-white/10"
            >
              <span>Xem Toàn Bộ Bảng Giá 5 Chất Liệu</span>
              <ArrowDown className="w-3.5 h-3.5 text-[#E7C184]" />
            </a>

            <a
              href="#tra-cuu-khung"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white rounded-xl transition-colors"
            >
              <Ruler className="w-3.5 h-3.5 text-[#E7C184]" />
              <span>Quy cách khung K0 - K11</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};
