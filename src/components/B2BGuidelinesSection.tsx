import React from 'react';
import { B2BShopInfo } from '../types';
import { Phone, MessageCircle, Copy, Check } from 'lucide-react';

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
    desc: 'Bọc màng PE chống xước → Nẹp 4 góc bằng mút xốp EVA định hình → Bọc mút xốp hơi bóng khí → Thùng carton 5 lớp cứng cáp.'
  },
  {
    title: 'Giao Nhận Chành Xe & Bưu Điện',
    desc: 'Hỗ trợ gửi qua tất cả các chành xe, nhà xe tuyến tỉnh uy tín hoặc bưu điện/GHTK tận studio.'
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
    <div className="w-full max-w-full overflow-hidden">
      {/* FULL-BLEED DARK TILE 1 (#272729): Technical Standards & Shipping Policies */}
      <section
        id="quy-chuan"
        className="py-[48px] sm:py-[64px] md:py-[80px] bg-[#272729] text-[#ffffff] rounded-none w-full max-w-full overflow-hidden"
      >
        <div className="max-w-[980px] mx-auto px-5 sm:px-6 space-y-12 md:space-y-16 w-full max-w-full">
          
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center space-y-3 w-full max-w-full">
            <div className="text-[14px] font-semibold text-[#2997ff] tracking-[-0.224px] leading-[1.29]">
              Kỹ Thuật In Lab & Vận Chuyển B2B
            </div>
            <h2 className="font-display text-[28px] sm:text-[34px] md:text-[40px] font-semibold text-[#ffffff] leading-[1.1] tracking-[-0.28px] text-balance">
              Quy Chuẩn Đặt File & Chính Sách Giao Hàng Cho Thợ
            </h2>
            <p className="text-[17px] sm:text-[21px] font-light text-[#cccccc] leading-[1.47] text-balance">
              Quy chuẩn kỹ thuật kiểm định file ảnh và vận chuyển an toàn cho Studio cưới và Nhiếp ảnh gia đối tác.
            </p>
          </div>

          {/* 1. Technical File Submission Standards */}
          <div className="space-y-8 pt-8 border-t border-white/10 w-full max-w-full">
            <div className="space-y-1">
              <h3 className="font-display text-[21px] sm:text-[24px] font-semibold text-[#ffffff] tracking-[-0.28px]">
                01. Quy Chuẩn Xuất File In Lab (Photoshop / Lightroom)
              </h3>
              <p className="text-[14px] text-[#cccccc] leading-[1.43]">
                Áp dụng cho toàn bộ file ảnh cổng cưới, ảnh ép gỗ, mika và tranh khổ lớn.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-full">
              <div className="space-y-2">
                <div className="text-[12px] font-semibold text-[#2997ff]">
                  Định Dạng File
                </div>
                <div className="text-[17px] font-semibold text-[#ffffff] tracking-[-0.374px]">
                  JPEG Baseline
                </div>
                <p className="text-[14px] text-[#cccccc] leading-[1.47]">
                  {fileSubmissionGuidelines.format}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-[12px] font-semibold text-[#2997ff]">
                  Hệ Màu (Color Space)
                </div>
                <div className="text-[17px] font-semibold text-[#ffffff] tracking-[-0.374px]">
                  sRGB / Adobe RGB
                </div>
                <p className="text-[14px] text-[#cccccc] leading-[1.47]">
                  {fileSubmissionGuidelines.colorSpace}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-[12px] font-semibold text-[#2997ff]">
                  Độ Phân Giải
                </div>
                <div className="text-[17px] font-semibold text-[#ffffff] tracking-[-0.374px] tabular-nums">
                  300 DPI Thực Tế
                </div>
                <p className="text-[14px] text-[#cccccc] leading-[1.47]">
                  {fileSubmissionGuidelines.resolution}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-[12px] font-semibold text-[#2997ff]">
                  Lề Xén An Toàn
                </div>
                <div className="text-[17px] font-semibold text-[#ffffff] tracking-[-0.374px] tabular-nums">
                  5mm – 10mm
                </div>
                <p className="text-[14px] text-[#cccccc] leading-[1.47]">
                  {fileSubmissionGuidelines.bleedMargin}
                </p>
              </div>
            </div>

            {/* Naming Convention Row */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full max-w-full">
              <div className="space-y-2 w-full max-w-full overflow-hidden">
                <div className="text-[14px] font-semibold text-[#ffffff]">
                  Cú Pháp Đặt Tên File Để Tránh Nhầm Lẫn Kích Thước
                </div>
                <code className="text-[13px] font-mono text-[#cccccc] bg-[#252527] px-3.5 py-2 rounded-[8px] border border-white/10 inline-block break-all max-w-full">
                  [TênStudio]_[LoạiSảnPhẩm]_[KíchThước]_[SốLượng].jpg
                </code>
              </div>
              <button
                onClick={handleCopyNaming}
                className="inline-flex items-center gap-2 px-[20px] py-[10px] text-[14px] font-normal text-[#2997ff] border border-[#2997ff] hover:bg-[#2997ff]/10 active:scale-95 rounded-full transition-all cursor-pointer shrink-0 whitespace-nowrap"
              >
                {copiedNaming ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedNaming ? 'Đã sao chép' : 'Sao chép cú pháp'}</span>
              </button>
            </div>
          </div>

          {/* 2. Studio Shipping & Delivery Policies */}
          <div id="chinh-sach" className="space-y-8 pt-8 border-t border-white/10 w-full max-w-full">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div className="space-y-1">
                <h3 className="font-display text-[21px] sm:text-[24px] font-semibold text-[#ffffff] tracking-[-0.28px]">
                  02. Chính Sách Giao Nhận Cho Thợ Tỉnh & Studio Ở Xa
                </h3>
                <p className="text-[14px] text-[#cccccc] leading-[1.43]">
                  Quy trình đóng kiện công nghiệp 4 lớp chống bể vỡ và liên kết chành xe liên tỉnh.
                </p>
              </div>
              <span className="text-[14px] font-semibold text-[#2997ff] tabular-nums">
                Xuất bến 17:00 mỗi ngày
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-full">
              {studioShippingPolicies.map((pol, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-[12px] font-semibold text-[#2997ff] tabular-nums">
                    0{i + 1}
                  </div>
                  <div className="text-[17px] font-semibold text-[#ffffff] leading-[1.24] tracking-[-0.374px]">
                    {pol.title}
                  </div>
                  <p className="text-[14px] text-[#cccccc] leading-[1.47]">
                    {pol.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* FULL-BLEED DARK TILE 2 (#2a2a2c — micro-step lighter separation): Contact CTA */}
      <section
        id="lien-he"
        className="py-[48px] sm:py-[64px] md:py-[80px] bg-[#2a2a2c] text-[#ffffff] rounded-none text-center w-full max-w-full overflow-hidden"
      >
        <div className="max-w-[980px] mx-auto px-5 sm:px-6 space-y-6 w-full max-w-full">
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="font-display text-[28px] sm:text-[34px] md:text-[40px] font-semibold leading-[1.1] tracking-[-0.28px] text-[#ffffff] text-balance">
              Sẵn Sàng Hợp Tác In Ấn Cho Studio Của Bạn?
            </h3>
            <p className="text-[17px] sm:text-[21px] font-light text-[#cccccc] leading-[1.47] text-balance">
              Gửi file trực tiếp qua Zalo Kỹ Thuật để nhận test màu miễn phí hoặc gọi hotline trao đổi trực tiếp với thợ máy xưởng.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <a
              href={`https://zalo.me/${shopInfo.zaloTho.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-[26px] py-[13px] text-[17px] font-normal leading-none text-[#ffffff] bg-[#0066cc] hover:bg-[#0071e3] active:scale-95 rounded-full transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Gửi File Zalo Thợ (<span className="tabular-nums">{shopInfo.zaloTho}</span>)</span>
            </a>

            <a
              href={`tel:${shopInfo.hotlineTech.replace(/\D/g, '')}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-[26px] py-[13px] text-[17px] font-normal leading-none text-[#2997ff] border border-[#2997ff] hover:bg-[#2997ff]/10 active:scale-95 rounded-full transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Hotline Kỹ Thuật (<span className="tabular-nums">{shopInfo.hotlineTech}</span>)</span>
            </a>
          </div>

          <div className="pt-6 text-[12px] text-[#cccccc] flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            <span>Địa chỉ Lab: {shopInfo.address}</span>
            <span aria-hidden="true">·</span>
            <span>Giờ tiếp nhận: {shopInfo.workingHours}</span>
          </div>
        </div>
      </section>
    </div>
  );
};
