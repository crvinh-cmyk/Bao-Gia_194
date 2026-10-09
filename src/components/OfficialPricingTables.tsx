import React, { useState } from 'react';
import { 
  inEpMikaPricingData, 
  goLuaDongKhungData, 
  mikaPhoThongData, 
  hdGuongSieuBongKhungData, 
  anh4KPricingData 
} from '../data/tiemIn194Pricing2026';
import { MaterialTabId } from '../types';
import { Search } from 'lucide-react';

interface OfficialPricingTablesProps {
  onSelectSizeForCalculator?: (productLine: string, size: string) => void;
  zaloTho: string;
}

const materialTabs: { id: MaterialTabId; label: string }[] = [
  { id: 'go-lua', label: '1. Gỗ Lụa Đóng Khung' },
  { id: 'hd-guong-sieu-bong', label: '2. HD Gương Siêu Bóng (Khuyên Dùng)' },
  { id: 'mika-pho-thong', label: '3. Mika Phổ Thông' },
  { id: 'in-ep-mika', label: '4. In Ép Mika' },
  { id: 'anh-4k', label: '5. Cao Cấp 4K' }
];

export const OfficialPricingTables: React.FC<OfficialPricingTablesProps> = ({
  zaloTho
}) => {
  const [activeTab, setActiveTab] = useState<MaterialTabId>('go-lua');
  const [searchSize, setSearchSize] = useState<string>('');

  const formatPrice = (val: number | null) => {
    if (val === null || val === undefined) return <span className="text-neutral-300">-</span>;
    return <span className="font-mono tabular-nums">{val.toLocaleString('vi-VN')} đ</span>;
  };

  const isHighlighted = (size: string) => {
    return size.includes('60x90') || size.includes('60*90') || size.includes('20x30') || size.includes('20*30') || size.includes('40x60') || size.includes('40*60');
  };

  const matchesSearch = (size: string) => {
    if (!searchSize.trim()) return true;
    return size.toLowerCase().includes(searchSize.toLowerCase().trim());
  };

  return (
    <section id="bang-gia-chi-tiet" className="py-10 sm:py-16 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header & Controls */}
        <div className="space-y-4 pb-4 border-b border-[#E7E2DA]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#936B34]">
                Bảng Giá Chi Tiết 2026
              </div>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
                Toàn Bộ Bảng Giá Sỉ Theo Chất Liệu
              </h2>
              <p className="text-xs text-[#57534E] mt-0.5">
                Dữ liệu gốc từ tài liệu chính thức của Tiệm In 194
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Lọc cỡ ảnh (60x90, 20x30)..."
                value={searchSize}
                onChange={(e) => setSearchSize(e.target.value)}
                className="w-full h-11 pl-9 pr-3 text-xs bg-white border border-[#E7E2DA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#936B34] shadow-xs"
              />
            </div>
          </div>

          {/* 5 Material Tabs: Grid layout hiển thị trọn vẹn 5 chất liệu trên mobile mà không cần cuộn ngang */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
            {materialTabs.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center text-center leading-snug ${
                  idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                } ${
                  activeTab === tab.id
                    ? 'bg-[#1C1917] text-white shadow-xs'
                    : 'bg-[#EFEAE2] text-[#57534E] hover:text-[#1C1917] hover:bg-[#E5DDCF]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* DẠNG BẢNG DUY NHẤT (STICKY CỘT CỠ ẢNH BÊN TRÁI)               */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl border border-[#E7E2DA] overflow-hidden shadow-xs">
          
          <div className="p-3 bg-[#FAF9F5] border-b border-[#E7E2DA] flex items-center justify-between text-xs text-[#78716C]">
            <span>💡 Cột <strong>CỠ ẢNH</strong> được cố định bên trái khi bạn vuốt ngang</span>
            <span className="font-mono font-bold text-[#1C1917]">Đơn vị: VNĐ</span>
          </div>

          <div className="overflow-x-auto relative">
            
            {/* Table for Gỗ Lụa */}
            {activeTab === 'go-lua' && (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#E7E2DA] text-[#57534E]">
                    {/* STICKY COLUMN */}
                    <th className="py-3 px-3.5 font-bold text-[#1C1917] sticky left-0 bg-[#FAF9F5] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap min-w-[90px]">
                      Cỡ Ảnh
                    </th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">Bo Viền</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">K0, K1, K2, K3</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">K4, K5, K6</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">K7, K8, K9</th>
                    <th className="py-3 px-3 text-right text-[#936B34] whitespace-nowrap">K10 (5.5cm)</th>
                    <th className="py-3 px-3 text-right text-[#936B34] whitespace-nowrap">K11 (8cm)</th>
                    <th className="py-3 px-3 text-right text-emerald-800 whitespace-nowrap">Titan 1</th>
                    <th className="py-3 px-3 text-right text-emerald-800 whitespace-nowrap">Titan 2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE3]">
                  {goLuaDongKhungData.filter(r => matchesSearch(r.size)).map((row) => (
                    <tr key={row.size} className={`hover:bg-[#FCFBF8] ${isHighlighted(row.size) ? 'bg-[#FFFDF9]' : ''}`}>
                      <td className="py-2.5 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap">
                        {row.size}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(row.boVien)}</td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(row.k0_k3)}</td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(row.k4_k6)}</td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(row.k7_k9)}</td>
                      <td className="py-2.5 px-3 text-right text-[#936B34] whitespace-nowrap">{formatPrice(row.k10)}</td>
                      <td className="py-2.5 px-3 text-right text-[#936B34] whitespace-nowrap">{formatPrice(row.k11)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-800 whitespace-nowrap">{formatPrice(row.titan1)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-800 whitespace-nowrap">{formatPrice(row.titan2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Table for HD Gương Siêu Bóng */}
            {activeTab === 'hd-guong-sieu-bong' && (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#E7E2DA] text-[#57534E]">
                    <th className="py-3 px-3.5 font-bold text-[#1C1917] sticky left-0 bg-[#FAF9F5] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap min-w-[90px]">
                      Cỡ Ảnh
                    </th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">Bo Viền</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">K0, K1, K2, K3</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">K4, K5, K6</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">K7, K8, K9</th>
                    <th className="py-3 px-3 text-right text-[#936B34] whitespace-nowrap">K10</th>
                    <th className="py-3 px-3 text-right text-[#936B34] whitespace-nowrap">K11</th>
                    <th className="py-3 px-3 text-right text-emerald-800 whitespace-nowrap">Titan 1</th>
                    <th className="py-3 px-3 text-right text-emerald-800 whitespace-nowrap">Titan 2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE3]">
                  {hdGuongSieuBongKhungData.filter(r => matchesSearch(r.size)).map((row) => (
                    <tr key={row.size} className={`hover:bg-[#FCFBF8] ${isHighlighted(row.size) ? 'bg-[#FFFDF9]' : ''}`}>
                      <td className="py-2.5 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap">
                        {row.size}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(row.boVien)}</td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(row.k0_k3)}</td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(row.k4_k6)}</td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(row.k7_k9)}</td>
                      <td className="py-2.5 px-3 text-right text-[#936B34] whitespace-nowrap">{formatPrice(row.k10)}</td>
                      <td className="py-2.5 px-3 text-right text-[#936B34] whitespace-nowrap">{formatPrice(row.k11)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-800 whitespace-nowrap">{formatPrice(row.titan1)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-800 whitespace-nowrap">{formatPrice(row.titan2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Table for Mika Phổ Thông */}
            {activeTab === 'mika-pho-thong' && (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#E7E2DA] text-[#57534E]">
                    <th className="py-3 px-3.5 font-bold text-[#1C1917] sticky left-0 bg-[#FAF9F5] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap min-w-[90px]">
                      Cỡ Ảnh
                    </th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">Bo Viền</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">K0, K1, K2, K3</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">K4, K5, K6</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">K7, K8, K9</th>
                    <th className="py-3 px-3 text-right text-[#936B34] whitespace-nowrap">K10</th>
                    <th className="py-3 px-3 text-right text-[#936B34] whitespace-nowrap">K11</th>
                    <th className="py-3 px-3 text-right text-emerald-800 whitespace-nowrap">Titan 1</th>
                    <th className="py-3 px-3 text-right text-emerald-800 whitespace-nowrap">Titan 2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE3]">
                  {mikaPhoThongData.filter(r => matchesSearch(r.size)).map((row) => (
                    <tr key={row.size} className={`hover:bg-[#FCFBF8] ${isHighlighted(row.size) ? 'bg-[#FFFDF9]' : ''}`}>
                      <td className="py-2.5 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap">
                        {row.size}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(row.boVien)}</td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(row.k0_k3)}</td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(row.k4_k6)}</td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(row.k7_k9)}</td>
                      <td className="py-2.5 px-3 text-right text-[#936B34] whitespace-nowrap">{formatPrice(row.k10)}</td>
                      <td className="py-2.5 px-3 text-right text-[#936B34] whitespace-nowrap">{formatPrice(row.k11)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-800 whitespace-nowrap">{formatPrice(row.titan1)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-800 whitespace-nowrap">{formatPrice(row.titan2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Table for In Ép Mika (Chỉ để lại giá Mika in ép) */}
            {activeTab === 'in-ep-mika' && (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#E7E2DA] text-[#57534E]">
                    <th className="py-3 px-3.5 font-bold text-[#1C1917] sticky left-0 bg-[#FAF9F5] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap min-w-[90px]">
                      Cỡ Ảnh
                    </th>
                    <th className="py-3 px-3 text-right font-bold text-[#1C1917] whitespace-nowrap">
                      In Ép Mika
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE3]">
                  {inEpMikaPricingData.filter(r => matchesSearch(r.size)).map((row) => (
                    <tr key={row.stt} className={`hover:bg-[#FCFBF8] ${isHighlighted(row.size) ? 'bg-[#FFFDF9]' : ''}`}>
                      <td className="py-2.5 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap">
                        {row.size}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono text-[#1C1917] whitespace-nowrap">
                        {formatPrice(row.inEpMika)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Table for Cao Cấp 4K */}
            {activeTab === 'anh-4k' && (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#E7E2DA] text-[#57534E]">
                    <th className="py-3 px-3.5 font-bold text-[#1C1917] sticky left-0 bg-[#FAF9F5] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap min-w-[90px]">
                      Cỡ Ảnh
                    </th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">K4, K5, K6</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap text-emerald-800">Titan 2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE3]">
                  {anh4KPricingData.filter(r => matchesSearch(r.size)).map((row) => (
                    <tr key={row.size} className={`hover:bg-[#FCFBF8] ${isHighlighted(row.size) ? 'bg-[#FFFDF9]' : ''}`}>
                      <td className="py-2.5 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap">
                        {row.size}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(row.k4_k6)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-800 whitespace-nowrap">{formatPrice(row.titan2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        </div>

      </div>
    </section>
  );
};
