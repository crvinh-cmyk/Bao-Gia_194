import React from 'react';
import { B2BShopInfo } from '../types';

interface B2BFooterProps {
  shopInfo: B2BShopInfo;
  onOpenAdminDirectly?: () => void;
}

export const B2BFooter: React.FC<B2BFooterProps> = ({ shopInfo }) => {
  return (
    <footer className="bg-[#f5f5f7] text-[#333333] py-[64px] pb-[96px] md:pb-[64px] border-t border-[#e0e0e0] w-full max-w-full overflow-hidden">
      <div className="max-w-[980px] mx-auto px-5 sm:px-6 w-full max-w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[#e0e0e0] w-full max-w-full">
          
          {/* Brand info */}
          <div className="md:col-span-7 space-y-3">
            <div className="text-[14px] font-semibold text-[#1d1d1f] leading-[1.29] tracking-[-0.224px]">
              Tiệm In 194 · B2B Studio Lab
            </div>
            <p className="text-[14px] font-normal text-[#333333] leading-[1.47] tracking-[-0.224px] max-w-md">
              Xưởng in chuyên sâu phục vụ thợ ảnh tự do, studio cưới và phòng tranh nghệ thuật. Hệ thống máy in Pigment UltraChrome 12 màu chuẩn Lab, profile cân màu X-Rite i1Pro.
            </p>
            <div className="text-[12px] font-normal text-[#7a7a7a] leading-[1.4] tracking-[-0.12px] pt-1 tabular-nums">
              Dung sai kích thước &lt; 0.5mm · Kiểm định màu Delta E &lt; 1.5
            </div>
          </div>

          {/* Contact details — Apple dense-link vertical rhythm (17px / 400 / 2.41 leading) */}
          <div className="md:col-span-5 space-y-2">
            <div className="text-[14px] font-semibold text-[#1d1d1f] leading-[1.29] tracking-[-0.224px]">
              Kênh Tiếp Nhận File Studio
            </div>
            <ul className="text-[17px] font-normal leading-[2.1] sm:leading-[2.41] text-[#333333]">
              <li>
                Hotline Kỹ Thuật:{' '}
                <a
                  href={`tel:${shopInfo.hotlineTech.replace(/\D/g, '')}`}
                  className="text-[#0066cc] hover:underline tabular-nums"
                >
                  {shopInfo.hotlineTech}
                </a>
              </li>
              <li>
                Zalo Thợ Nhận File:{' '}
                <a
                  href={`https://zalo.me/${shopInfo.zaloTho.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0066cc] hover:underline tabular-nums"
                >
                  {shopInfo.zaloTho}
                </a>
              </li>
              <li className="text-[14px] leading-[1.6] text-[#333333] pt-1">
                {shopInfo.address}
              </li>
              <li className="text-[14px] leading-[1.6] text-[#7a7a7a]">
                Giờ làm việc: {shopInfo.workingHours}
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[12px] font-normal text-[#7a7a7a] leading-[1.3] tracking-[-0.12px] gap-2 w-full max-w-full">
          <div>
            © {new Date().getFullYear()} Tiệm In 194 — Xưởng In & Gia Công B2B Dành Cho Thợ Ảnh & Studio.
          </div>
          <div className="tabular-nums">
            Hệ màu sRGB / Adobe RGB · 300 DPI 1:1
          </div>
        </div>
      </div>
    </footer>
  );
};
