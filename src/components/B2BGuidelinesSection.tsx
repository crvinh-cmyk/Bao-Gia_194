import React from 'react';
import { B2BShopInfo } from '../types';
import { FileCheck, Truck, Phone, MessageCircle, Copy, Check } from 'lucide-react';

export const fileSubmissionGuidelines = {
  format: 'JPEG chuẩn (Baseline Standard, Quality 10 - 12 trong Photoshop) hoặc TIFF / PSD đã merge layer.',
  colorSpace: 'sRGB IEC61966-2.1 hoặc Adobe RGB (1998) - Không để Profile ProPhoto hoặc CMYK để tránh lệch màu.',
  resolution: '300 DPI đúng kích thước in thực tế tỉ lệ 1:1 (Ví dụ ảnh in 60x90cm đặt kích thước 60x90cm ở 300 DPI).',
  bleedMargin: 'Trừ lề an toàn: Với ảnh ép gỗ và khung phào chừa biên 5mm mỗi cạnh (không đặt mắt/chữ sát mép). Với Album mở phẳng chừa lề cắt xén 7mm và gáy an toàn 10mm.',
  namingConvention: 'Đặt tên file theo cú pháp: [TênStudio]_[LoạiSảnPhẩm]_[KíchThước]_[SốLượng].jpg'
};

export const studioShippingPolicies = [
  {
    title: 'Xuất Xưởng Siêu Tốc 24H',
    desc: 'File gửi trước 11h sáng sẽ xuất xưởng trong chiều ngày hôm sau. Hỗ trợ in hỏa tốc 6h - 12h cho các đơn hàng cưới gấp.'
  },
  {
    title: 'Đóng Gói Chuyên Nghiệp 4 Lớp',
    desc: 'Bọc màng PE chống xước -> Nẹp 4 góc bằng mút xốp EVA định hình -> Bọc mút xốp hơi bóng khí -> Thùng carton 5 lớp cứng cáp.'
  },
  {
    title: 'Giao Nhận Chành Xe & Bưu Điện',
    desc: 'Hỗ trợ giao ra tất cả các chành xe tại TP. HCM (Phương Trang, Tô Châu, Hoa Mai, Thành Bưởi...) hoặc Viettel Post / GHTK tận studio.'
  },
  {
    title: 'Chính Sách Bù Hàng Lỗi Kỹ Thuật',
    desc: 'Kiểm tra màu chuẩn Lab. Nếu sai lệch màu do xưởng, hỏng hóc do vận chuyển hoặc cong vênh, xưởng in lại 100% miễn phí trong 24h.'
  }
];

interface B2BGuidelinesSectionProps {
  shopInfo: B2BShopInfo;
}

export const B2BGuidelinesSection: React.FC<B2BGuidelinesSectionProps> = ({ shopInfo }) => {
  const [copiedNaming, setCopiedNaming] = React.useState(false);

  const handleCopyNaming = () => {
    navigator.clipboard.writeText(fileSubmissionGuidelines.namingConvention);
    setCopiedNaming(true);
    setTimeout(() => setCopiedNaming(false), 2000);
  };

  return (
    <section id="quy-chuan" className="py-6 md:py-12 bg-[#F5EFEB]/70 border-t border-[#E7E2DA] w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 md:space-y-12 w-full max-w-full">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-2 w-full max-w-full">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#936B34]">
            Kỹ Thuật In Lab & Vận Chuyển B2B
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1917] tracking-tight">
            Quy Chuẩn Đặt File & Chính Sách Giao Hàng Cho Thợ
          </h2>
          <p className="text-xs sm:text-sm text-[#57534E]">
            Quy chuẩn kỹ thuật kiểm định file ảnh và vận chuyển an toàn cho Studio cưới và Nhiếp ảnh gia đối tác.
          </p>
        </div>

        {/* 1. Technical File Submission Standards Grid */}
        <div className="bg-white rounded-2xl border border-[#E7E2DA] p-4 sm:p-8 shadow-xs w-full max-w-full">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-[#F0EBE3] w-full max-w-full">
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] border border-[#E7E2DA] flex items-center justify-center text-[#936B34] shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C1917]">
                1. Quy Chuẩn Xuất File In Lab (Photoshop / Lightroom)
              </h3>
              <p className="text-xs text-[#78716C]">
                Áp dụng cho toàn bộ file ảnh cổng cưới, ảnh ép gỗ, mika và tranh khổ lớn
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-full">
            <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#EFEAE2] space-y-1.5 w-full max-w-full">
              <div className="text-xs font-bold text-[#936B34] font-mono uppercase tracking-wide">
                Định Dạng File
              </div>
              <div className="text-sm font-bold text-[#1C1917]">
                JPEG Baseline
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">
                {fileSubmissionGuidelines.format}
              </p>
            </div>

            <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#EFEAE2] space-y-1.5 w-full max-w-full">
              <div className="text-xs font-bold text-[#936B34] font-mono uppercase tracking-wide">
                Hệ Màu (Color Space)
              </div>
              <div className="text-sm font-bold text-[#1C1917]">
                sRGB / Adobe RGB
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">
                {fileSubmissionGuidelines.colorSpace}
              </p>
            </div>

            <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#EFEAE2] space-y-1.5 w-full max-w-full">
              <div className="text-xs font-bold text-[#936B34] font-mono uppercase tracking-wide">
                Độ Phân Giải Tối Thiểu
              </div>
              <div className="text-sm font-bold text-[#1C1917]">
                300 DPI Thực Tế
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">
                {fileSubmissionGuidelines.resolution}
              </p>
            </div>

            <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#EFEAE2] space-y-1.5 w-full max-w-full">
              <div className="text-xs font-bold text-[#936B34] font-mono uppercase tracking-wide">
                Trừ Lề Xén An Toàn (Bleed)
              </div>
              <div className="text-sm font-bold text-[#1C1917]">
                5mm - 10mm
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">
                {fileSubmissionGuidelines.bleedMargin}
              </p>
            </div>
          </div>

          {/* Naming Convention Box */}
          <div className="mt-5 p-3.5 bg-[#FDFBF7] rounded-xl border border-[#EFEAE2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full max-w-full">
            <div className="space-y-1 w-full max-w-full overflow-hidden">
              <div className="text-xs font-bold text-[#1C1917]">
                Cú Pháp Đặt Tên File Để Tránh Nhầm Lẫn Kích Thước:
              </div>
              <code className="text-xs font-mono text-[#936B34] bg-white px-2 py-0.5 rounded border border-[#E7E2DA] inline-block break-all max-w-full">
                [TênStudio]_[LoạiSảnPhẩm]_[KíchThước]_[SốLượng].jpg
              </code>
            </div>
            <button
              onClick={handleCopyNaming}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1C1917] bg-[#EFEAE2] hover:bg-[#E5DDCF] rounded-lg transition-colors cursor-pointer shrink-0"
            >
              {copiedNaming ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNaming ? 'Đã sao chép' : 'Sao chép cú pháp'}</span>
            </button>
          </div>
        </div>

        {/* 2. Studio Shipping & Delivery Policies */}
        <div id="chinh-sach" className="bg-white rounded-2xl border border-[#E7E2DA] p-4 sm:p-8 shadow-xs w-full max-w-full">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-[#F0EBE3] w-full max-w-full">
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] border border-[#E7E2DA] flex items-center justify-center text-[#936B34] shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C1917]">
                2. Chính Sách Giao Nhận Cho Thợ Tỉnh & Studio Ở Xa
              </h3>
              <p className="text-xs text-[#78716C]">
                Quy trình đóng kiện công nghiệp 4 lớp chống bể vỡ, chống xước và liên kết chành xe liên tỉnh
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-full">
            {studioShippingPolicies.map((pol, i) => (
              <div key={i} className="p-4 bg-[#FAF9F5] rounded-xl border border-[#EFEAE2] space-y-1.5 w-full max-w-full">
                <div className="text-xs font-mono text-[#936B34] font-bold">
                  0{i + 1}. {pol.title}
                </div>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  {pol.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-3 border-t border-[#F0EBE3] flex items-center justify-between flex-wrap gap-2 text-xs text-[#78716C] w-full max-w-full">
            <div>
              <strong>Các nhà xe hỗ trợ gửi hàng hằng ngày:</strong> Xe Phương Trang, Tô Châu, Hoa Mai, Thành Bưởi, Kumho, Hoàng Long, Kim Mã...
            </div>
            <div className="font-mono text-[#1C1917]">
              Xuất bến 17:00 mỗi ngày
            </div>
          </div>
        </div>

        {/* 3. Primary Contact Action Buttons */}
        <div id="lien-he" className="bg-[#1C1917] rounded-2xl p-5 sm:p-10 text-white text-center space-y-6 w-full max-w-full">
          <div className="max-w-2xl mx-auto space-y-2 w-full max-w-full">
            <h3 className="font-serif-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Sẵn Sàng Hợp Tác In Ấn Cho Studio Của Bạn?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Gửi file trực tiếp qua Zalo Kỹ Thuật để nhận test màu miễn phí hoặc gọi hotline để trao đổi trực tiếp với thợ máy xưởng.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-full">
            <a
              href={`https://zalo.me/${shopInfo.zaloTho.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-semibold text-white bg-[#0068FF] hover:bg-[#0052cc] rounded-xl transition-all shadow-md cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>Gửi File Zalo Thợ ({shopInfo.zaloTho})</span>
            </a>

            <a
              href={`tel:${shopInfo.hotlineTech.replace(/\D/g, '')}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20"
            >
              <Phone className="w-4 h-4 text-[#E7C184]" />
              <span>Hotline Hỗ Trợ Kỹ Thuật ({shopInfo.hotlineTech})</span>
            </a>
          </div>

          <div className="pt-4 text-xs text-neutral-400 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/10 w-full max-w-full">
            <span>Địa chỉ Lab: {shopInfo.address}</span>
            <span>·</span>
            <span>Giờ tiếp nhận: {shopInfo.workingHours}</span>
          </div>
        </div>

      </div>
    </section>
  );
};
