import React from 'react';
import { B2BShopInfo } from '../types';
import { Phone, MessageCircle, MapPin, Clock, Server } from 'lucide-react';

interface B2BFooterProps {
  shopInfo: B2BShopInfo;
}

export const B2BFooter: React.FC<B2BFooterProps> = ({ shopInfo }) => {
  return (
    <footer className="bg-[#121110] text-neutral-400 py-12 pb-24 md:pb-12 border-t border-neutral-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-neutral-800">
          
          {/* Brand info */}
          <div className="md:col-span-5 space-y-3">
            <div className="font-serif-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{shopInfo.name}</span>
              <span className="text-[10px] font-mono text-[#E7C184] bg-neutral-800 px-2 py-0.5 rounded">
                B2B STUDIO LAB
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Xưởng in chuyên sâu phục vụ thợ ảnh tự do, studio cưới và phòng tranh nghệ thuật. Hệ thống máy in Pigment UltraChrome 12 màu chuẩn Lab, profile cân màu X-Rite i1Pro.
            </p>
            <div className="text-[11px] font-mono text-neutral-500 pt-1">
              Dung sai kích thước &lt; 0.5mm · Kiểm định màu Delta E &lt; 1.5
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 space-y-2">
            <div className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Dòng Sản Phẩm B2B
            </div>
            <ul className="space-y-1.5 text-xs text-neutral-300">
              <li><a href="#catalogue" className="hover:text-white transition-colors">Ảnh Ép Gỗ MDF Tráng Gương & Laminate</a></li>
              <li><a href="#catalogue" className="hover:text-white transition-colors">Album Cưới Photobook Mở Phẳng 180°</a></li>
              <li><a href="#catalogue" className="hover:text-white transition-colors">Ảnh Khung Phào Mạ Vàng & Scandinavian</a></li>
              <li><a href="#catalogue" className="hover:text-white transition-colors">Ảnh Mica Pha Lê Acrylic HD</a></li>
              <li><a href="#catalogue" className="hover:text-white transition-colors">In UV Phẳng Khổ Lớn Cổng Cưới</a></li>
            </ul>
          </div>

          {/* Contact details */}
          <div className="md:col-span-4 space-y-2">
            <div className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Kênh Tiếp Nhận File Studio
            </div>
            <div className="space-y-2 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E7C184] shrink-0" />
                <span>Hotline Kỹ Thuật: <strong className="text-white font-mono">{shopInfo.hotlineTech}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-[#E7C184] shrink-0" />
                <span>Zalo Thợ Nhận File: <strong className="text-white font-mono">{shopInfo.zaloTho}</strong></span>
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

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-2">
          <div>
            © {new Date().getFullYear()} {shopInfo.name} - Xưởng In & Gia Công B2B Dành Cho Thợ Ảnh & Studio.
          </div>
          <div className="font-mono">
            Hệ màu sRGB / Adobe RGB · 300 DPI 1:1
          </div>
        </div>
      </div>
    </footer>
  );
};
