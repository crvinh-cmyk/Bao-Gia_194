import React from 'react';
import { MessageCircle, Phone, FileText, Ruler } from 'lucide-react';
import { B2BShopInfo } from '../types';
import { AudienceTierId } from '../types/admin';

interface B2BStickyMobileBarProps {
  lockedTier?: AudienceTierId | null;
  shopInfo: B2BShopInfo;
  onScrollToGuidelines: () => void;
}

export const B2BStickyMobileBar: React.FC<B2BStickyMobileBarProps> = ({
  lockedTier,
  shopInfo,
  onScrollToGuidelines
}) => {
  const isRetail = lockedTier === 'retail';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden apple-frosted border-t border-black/[0.08] h-[64px] px-4 flex items-center justify-between gap-2.5">
      {/* Hotline */}
      <a
        href={`tel:${shopInfo.hotlineTech.replace(/\D/g, '')}`}
        className="inline-flex items-center justify-center gap-1.5 h-[44px] px-3 rounded-[8px] text-[#1d1d1f] active:scale-95 transition-transform text-[14px] font-normal tracking-[-0.224px] whitespace-nowrap"
        aria-label={isRetail ? 'Gọi tư vấn' : 'Gọi hotline kỹ thuật'}
      >
        <Phone className="w-4 h-4 text-[#0066cc] shrink-0" />
        <span>{isRetail ? 'Gọi' : 'Hotline'}</span>
      </a>

      {/* Quy Chuẩn File (B2B) hoặc Mẫu Khung (Retail) */}
      {isRetail ? (
        <a
          href="#tra-cuu-khung"
          className="inline-flex items-center justify-center gap-1.5 h-[44px] px-3 rounded-[8px] text-[#1d1d1f] active:scale-95 transition-transform text-[14px] font-normal tracking-[-0.224px] whitespace-nowrap"
          aria-label="Mẫu khung tra cứu"
        >
          <Ruler className="w-4 h-4 text-[#0066cc] shrink-0" />
          <span>Mẫu Khung</span>
        </a>
      ) : (
        <button
          onClick={onScrollToGuidelines}
          className="inline-flex items-center justify-center gap-1.5 h-[44px] px-3 rounded-[8px] text-[#1d1d1f] active:scale-95 transition-transform text-[14px] font-normal tracking-[-0.224px] cursor-pointer whitespace-nowrap"
          aria-label="Quy chuẩn gửi file"
        >
          <FileText className="w-4 h-4 text-[#0066cc] shrink-0" />
          <span>Quy Chuẩn</span>
        </button>
      )}

      {/* Primary Action Blue Pill CTA */}
      <a
        href={`https://zalo.me/${shopInfo.zaloTho.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 max-w-[180px] inline-flex items-center justify-center gap-1.5 h-[44px] px-5 rounded-full bg-[#0066cc] hover:bg-[#0071e3] active:scale-95 text-[#ffffff] text-[14px] font-normal tracking-[-0.224px] transition-all whitespace-nowrap"
        aria-label={isRetail ? 'Liên hệ Zalo đặt in' : 'Gửi File Zalo Thợ'}
      >
        <MessageCircle className="w-4 h-4 shrink-0" />
        <span>{isRetail ? 'Đặt In Zalo' : 'Gửi File Zalo'}</span>
      </a>
    </div>
  );
};
