import React, { useState, useMemo } from 'react';
import { 
  inEpMikaPricingData, 
  goLuaDongKhungData, 
  mikaPhoThongData, 
  hdGuongSieuBongKhungData, 
  anh4KPricingData 
} from '../data/tiemIn194Pricing2026';
import { usePriceMultiplier, applyMultiplier } from '../hooks/usePriceMultiplier';
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
  { id: 'in-ep-mika', label: '4. In ép Mika & Giá Khung xương Gia Cố' },
  { id: 'anh-4k', label: '5. Cao Cấp 4K' }
];

export const OfficialPricingTables: React.FC<OfficialPricingTablesProps> = ({
  zaloTho
}) => {
  const [activeTab, setActiveTab] = useState<MaterialTabId>('go-lua');
  const [searchSize, setSearchSize] = useState<string>('');
  const multiplier = usePriceMultiplier();

  const goLuaDataTransformed = useMemo(() => 
    goLuaDongKhungData.map(r => ({
      ...r,
      boVien: applyMultiplier(r.boVien, multiplier),
      k0_k3: applyMultiplier(r.k0_k3, multiplier),
      k4_k6: applyMultiplier(r.k4_k6, multiplier),
      k7_k9: applyMultiplier(r.k7_k9, multiplier),
      k10: applyMultiplier(r.k10, multiplier),
      k11: applyMultiplier(r.k11, multiplier),
      titan1: applyMultiplier(r.titan1, multiplier),
      titan2: applyMultiplier(r.titan2, multiplier),
    })),
  [multiplier]);

  const hdGuongDataTransformed = useMemo(() => 
    hdGuongSieuBongKhungData.map(r => ({
      ...r,
      boVien: applyMultiplier(r.boVien, multiplier),
      k0_k3: applyMultiplier(r.k0_k3, multiplier),
      k4_k6: applyMultiplier(r.k4_k6, multiplier),
      k7_k9: applyMultiplier(r.k7_k9, multiplier),
      k10: applyMultiplier(r.k10, multiplier),
      k11: applyMultiplier(r.k11, multiplier),
      titan1: applyMultiplier(r.titan1, multiplier),
      titan2: applyMultiplier(r.titan2, multiplier),
    })),
  [multiplier]);

  const mikaPhoThongDataTransformed = useMemo(() => 
    mikaPhoThongData.map(r => ({
      ...r,
      boVien: applyMultiplier(r.boVien, multiplier),
      k0_k3: applyMultiplier(r.k0_k3, multiplier),
      k4_k6: applyMultiplier(r.k4_k6, multiplier),
      k7_k9: applyMultiplier(r.k7_k9, multiplier),
      k10: applyMultiplier(r.k10, multiplier),
      k11: applyMultiplier(r.k11, multiplier),
      titan1: applyMultiplier(r.titan1, multiplier),
      titan2: applyMultiplier(r.titan2, multiplier),
    })),
  [multiplier]);

  const inEpMikaDataTransformed = useMemo(() => 
    inEpMikaPricingData.map(r => ({
      ...r,
      inEpMika: applyMultiplier(r.inEpMika, multiplier)!,
      khungXuongGiaCo: applyMultiplier(r.khungXuongGiaCo, multiplier) || undefined,
    })),
  [multiplier]);

  const anh4KDataTransformed = useMemo(() => 
    anh4KPricingData.map(r => ({
      ...r,
      k4_k6: applyMultiplier(r.k4_k6, multiplier),
      titan2: applyMultiplier(r.titan2, multiplier),
    })),
  [multiplier]);

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
    <section id="bang-gia-chi-tiet" className="py-6 md:py-12 bg-[#FAF9F5] w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 w-full max-w-full">
        
        {/* Header & Controls */}
        <div className="space-y-4 pb-4 border-b border-[#E7E2DA] w-full max-w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 w-full max-w-full">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#936B34]">
                Bảng Giá Chi Tiết 2026
              </div>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
                Toàn Bộ Bảng Giá Sỉ Theo Chất Liệu
              </h2>
              <p className="text-xs text-[#57534E] mt-0.5">
                Dữ liệu gốc từ tài liệu chính thức của Tiệm In <span className="text-[#FF0000] font-bold">194</span>
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64 max-w-full">
              <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Lọc cỡ ảnh (60x90, 20x30)..."
                value={searchSize}
                onChange={(e) => setSearchSize(e.target.value)}
                className="w-full max-w-full h-11 pl-9 pr-3 text-xs bg-white border border-[#E7E2DA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#936B34] shadow-xs"
              />
            </div>
          </div>

          {/* 5 Material Tabs: Grid layout hiển thị trọn vẹn 5 chất liệu trên mobile mà không cần cuộn ngang */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full max-w-full">
            {materialTabs.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center text-center leading-snug max-w-full ${
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
        <div className="bg-white rounded-2xl border border-[#E7E2DA] overflow-hidden shadow-xs w-full max-w-full">
          
          <div className="p-3 bg-[#FAF9F5] border-b border-[#E7E2DA] flex items-center justify-between text-xs text-[#78716C] max-w-full">
            <span>💡 Cột <strong>CỠ ẢNH</strong> được cố định bên trái khi bạn vuốt ngang</span>
            <span className="font-mono font-bold text-[#1C1917] shrink-0 ml-2">Đơn vị: VNĐ</span>
          </div>

          <div className="overflow-x-auto max-w-full relative">
            
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
                  {goLuaDataTransformed.filter(r => matchesSearch(r.size)).map((row) => (
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
                  {hdGuongDataTransformed.filter(r => matchesSearch(r.size)).map((row) => (
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
                  {mikaPhoThongDataTransformed.filter(r => matchesSearch(r.size)).map((row) => (
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

            {/* Table for In Ép Mika (Bổ sung Khung xương gia cố cho khổ lớn) */}
            {activeTab === 'in-ep-mika' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#FFFDF9] border-b border-[#E7E2DA] flex items-center gap-2 text-xs text-[#57534E]">
                  <span className="text-[#936B34] font-bold text-sm shrink-0">💡</span>
                  <span>
                    <strong>Dành cho khổ lớn (80x120, 100x150, 110x180):</strong> Có thêm tùy chọn <strong>Khung xương gia cố phía sau</strong> giúp chống cong vênh và tăng độ vững chãi tuyệt đối.
                  </span>
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF9F5] border-b border-[#E7E2DA] text-[#57534E]">
                      <th className="py-3 px-3.5 font-bold text-[#1C1917] sticky left-0 bg-[#FAF9F5] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap min-w-[90px]">
                        Cỡ Ảnh
                      </th>
                      <th className="py-3 px-3 text-right font-bold text-[#1C1917] whitespace-nowrap">
                        In Ép Mika
                      </th>
                      <th className="py-3 px-3 text-right font-bold text-[#936B34] whitespace-nowrap">
                        Giá Khung Xương Gia Cố
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE3]">
                    {inEpMikaDataTransformed.filter(r => matchesSearch(r.size)).map((row) => (
                      <tr key={row.stt} className={`hover:bg-[#FCFBF8] ${isHighlighted(row.size) ? 'bg-[#FFFDF9]' : ''}`}>
                        <td className="py-2.5 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap">
                          {row.size}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold font-mono text-[#1C1917] whitespace-nowrap">
                          {formatPrice(row.inEpMika)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#936B34] whitespace-nowrap">
                          {row.khungXuongGiaCo ? (
                            <span className="font-bold text-[#936B34]">+{row.khungXuongGiaCo.toLocaleString('vi-VN')} đ</span>
                          ) : (
                            <span className="text-neutral-400 font-normal italic text-[11px]">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                  {anh4KDataTransformed.filter(r => matchesSearch(r.size)).map((row) => (
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
