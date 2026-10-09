import React from 'react';
import { B2BShopInfo } from '../types';
import { Phone, MessageCircle, MapPin, Clock } from 'lucide-react';

interface B2BFooterProps {
  shopInfo: B2BShopInfo;
}

export const B2BFooter: React.FC<B2BFooterProps> = ({ shopInfo }) => {
  return (
    <footer className="bg-[#121110] text-neutral-400 py-12 pb-24 md:pb-12 border-t border-neutral-800 text-xs w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-neutral-800 w-full max-w-full">
          
          {/* Brand info */}
          <div className="md:col-span-7 space-y-3">
            <div className="font-serif-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Tiệm In <span className="text-[#FF0000] font-black">194</span></span>
              <span className="text-[10px] font-mono text-[#E7C184] bg-neutral-800 px-2 py-0.5 rounded">
                B2B STUDIO LAB
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-md">
              Xưởng in chuyên sâu phục vụ thợ ảnh tự do, studio cưới và phòng tranh nghệ thuật. Hệ thống máy in Pigment UltraChrome 12 màu chuẩn Lab, profile cân màu X-Rite i1Pro.
            </p>
            <div className="text-[11px] font-mono text-neutral-500 pt-1">
              Dung sai kích thước &lt; 0.5mm · Kiểm định màu Delta E &lt; 1.5
            </div>
          </div>

          {/* Contact details */}
          <div className="md:col-span-5 space-y-2">
            <div className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Kênh Tiếp Nhận File Studio
            </div>
            <div className="space-y-2 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E7C184] shrink-0" />
                <span>Hotline Kỹ Thuật: <strong className="text-white font-mono">{shopInfo.hotlineTech}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-[#0068FF] shrink-0" />
                <a
                  href={`https://zalo.me/${shopInfo.zaloTho.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-[#0068FF]"
                >
                  Zalo Thợ Nhận File: <strong className="text-[#0068FF] font-mono font-bold">{shopInfo.zaloTho}</strong>
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#E7C184] shrink-0 mt-0.5" />
                <span>{shopInfo.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#E7C184] shrink-0" />
                <span>Giờ làm việc: {shopInfo.workingHours}</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-2 w-full max-w-full">
          <div>
            © {new Date().getFullYear()} Tiệm In <span className="text-[#FF0000] font-black">194</span> - Xưởng In & Gia Công B2B Dành Cho Thợ Ảnh & Studio.
          </div>
          <div className="font-mono">
            Hệ màu sRGB / Adobe RGB · 300 DPI 1:1
          </div>
        </div>
      </div>
    </footer>
  );
};
