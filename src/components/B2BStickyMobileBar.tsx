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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-3 pointer-events-none md:hidden">
      <div className="max-w-md mx-auto bg-[#1E2A78]/95 backdrop-blur-md rounded-2xl border border-white/15 px-3 py-1.5 shadow-2xl pointer-events-auto flex items-center justify-between gap-1.5">
        
        {/* Hotline */}
        <a
          href={`tel:${shopInfo.hotlineTech.replace(/\D/g, '')}`}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={isRetail ? 'Gọi tư vấn' : 'Gọi hotline kỹ thuật'}
        >
          <Phone className="w-4 h-4 text-amber-300 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">
            {isRetail ? 'Gọi Tư Vấn' : 'Hotline Kỹ Thuật'}
          </span>
        </a>

        {/* Zalo (Center primary) */}
        <a
          href={`https://zalo.me/${shopInfo.zaloTho.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-[1.4] flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-[#2563EB] text-white hover:bg-blue-500 transition-colors shadow-md"
          aria-label={isRetail ? 'Liên hệ Zalo đặt in' : 'Gửi File Zalo Thợ'}
        >
          <MessageCircle className="w-4 h-4 text-white mb-0.5" />
          <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">
            {isRetail ? 'Đặt In Qua Zalo' : 'Gửi File Zalo Thợ'}
          </span>
        </a>

        {/* Quy Chuẩn File (B2B) hoặc Mẫu Khung (Retail) */}
        {isRetail ? (
          <a
            href="#tra-cuu-khung"
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Mẫu khung tra cứu"
          >
            <Ruler className="w-4 h-4 text-amber-300 mb-0.5" />
            <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">Mẫu Khung</span>
          </a>
        ) : (
          <button
            onClick={onScrollToGuidelines}
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Quy chuẩn gửi file"
          >
            <FileText className="w-4 h-4 text-amber-300 mb-0.5" />
            <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">Quy Chuẩn File</span>
          </button>
        )}

      </div>
    </div>
  );
};
