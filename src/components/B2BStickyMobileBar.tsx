import React from 'react';
import { MessageCircle, Phone, FileText } from 'lucide-react';
import { B2BShopInfo } from '../types';

interface B2BStickyMobileBarProps {
  shopInfo: B2BShopInfo;
  onScrollToGuidelines: () => void;
}

export const B2BStickyMobileBar: React.FC<B2BStickyMobileBarProps> = ({
  shopInfo,
  onScrollToGuidelines
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-3 pointer-events-none md:hidden">
      <div className="max-w-md mx-auto bg-[#1C1917]/95 backdrop-blur-md rounded-2xl border border-white/15 px-3 py-1.5 shadow-2xl pointer-events-auto flex items-center justify-between gap-1.5">
        
        {/* Hotline Kỹ Thuật */}
        <a
          href={`tel:${shopInfo.hotlineTech.replace(/\D/g, '')}`}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Gọi hotline kỹ thuật"
        >
          <Phone className="w-4 h-4 text-[#E7C184] mb-0.5" />
          <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">Hotline Kỹ Thuật</span>
        </a>

        {/* Gửi File Zalo Thợ (Center primary) */}
        <a
          href={`https://zalo.me/${shopInfo.zaloTho.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-[1.4] flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-[#E7C184] text-[#1C1917] hover:bg-[#D4AF37] transition-colors shadow-xs"
          aria-label="Gửi File Zalo Thợ"
        >
          <MessageCircle className="w-4 h-4 text-[#1C1917] mb-0.5" />
          <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">Gửi File Zalo Thợ</span>
        </a>

        {/* Quy Chuẩn File */}
        <button
          onClick={onScrollToGuidelines}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Quy chuẩn gửi file"
        >
          <FileText className="w-4 h-4 text-[#E7C184] mb-0.5" />
          <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">Quy Chuẩn File</span>
        </button>

      </div>
    </div>
  );
};
