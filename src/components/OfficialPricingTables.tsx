import React, { useState } from 'react';
import { 
  boVienPricingData, 
  goLuaDongKhungData, 
  micaPhoThongData, 
  micaGuongHDKhungData, 
  anh4KPricingData, 
  anhHDPlusPricingData,
  nepKimLoaiSurcharges
} from '../data/tiemIn194Pricing2026';
import { MaterialTabId } from '../types';
import { Search, LayoutGrid, Table as TableIcon, AlertTriangle, ArrowRight, Check, Sparkles } from 'lucide-react';

interface OfficialPricingTablesProps {
  onSelectSizeForCalculator?: (productLine: string, size: string) => void;
  zaloTho: string;
}

export const OfficialPricingTables: React.FC<OfficialPricingTablesProps> = ({
  zaloTho
}) => {
  const [activeTab, setActiveTab] = useState<MaterialTabId>('go-lua');
  const [searchSize, setSearchSize] = useState<string>('');
  // Mode: 'table' (with sticky first column) or 'card' (optimized for mobile touch)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

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
                Dữ liệu gốc từ 6 trang tài liệu chính thức của Tiệm In 194
              </p>
            </div>

            {/* View Mode Switcher + Search Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Toggle: Thẻ Mobile vs Bảng Cuộn Ngang */}
              <div className="inline-flex p-1 bg-[#EAE2D5] rounded-xl h-11 items-center shadow-inner">
                <button
                  onClick={() => setViewMode('card')}
                  className={`h-9 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'card'
                      ? 'bg-[#1C1917] text-white shadow-xs'
                      : 'text-[#57534E] hover:text-[#1C1917]'
                  }`}
                  aria-label="Xem dạng thẻ"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Dạng Thẻ</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`h-9 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-[#1C1917] text-white shadow-xs'
                      : 'text-[#57534E] hover:text-[#1C1917]'
                  }`}
                  aria-label="Xem dạng bảng"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Dạng Bảng</span>
                </button>
              </div>

              {/* Search input with 44px height */}
              <div className="relative flex-1 sm:w-60">
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
          </div>

          {/* Material Tabs (Horizontal scroll with min 44px tap targets) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'go-lua', label: '1. Gỗ Lụa Đóng Khung' },
              { id: 'mica-guong-hd', label: '2. Mica Gương Siêu Bóng HD' },
              { id: 'mica-pho-thong', label: '3. Mica Phổ Thông' },
              { id: 'bo-vien-meka', label: '4. Bo Viền & In Ép Meka' },
              { id: 'anh-4k-hd-plus', label: '5. Cao Cấp 4K & HD+ (Fomex)' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MaterialTabId)}
                className={`h-11 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 flex items-center ${
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
        {/* RENDER MODE A: DẠNG THẺ (CARD VIEW - SIÊU GỌN CHO MOBILE)     */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'card' && (
          <div className="space-y-4">
            
            {/* Notice if HD+ */}
            {activeTab === 'anh-4k-hd-plus' && (
              <div className="p-3 bg-[#FEF3C7]/60 border border-[#F59E0B]/50 rounded-xl text-xs space-y-1">
                <div className="font-bold text-[#92400E] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                  <span>Phụ phí nẹp kim loại dòng HD+:</span>
                </div>
                <div className="text-[#78350F]">
                  80x120 (+170.000đ) · 90x130 (+190.000đ) · 100x150 (+210.000đ)
                </div>
              </div>
            )}

            {/* 1. Gỗ Lụa Cards */}
            {activeTab === 'go-lua' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {goLuaDongKhungData.filter(r => matchesSearch(r.size)).map((item) => (
                  <div key={item.size} className={`bg-white rounded-2xl border p-4 shadow-xs space-y-3 ${isHighlighted(item.size) ? 'border-[#936B34] ring-1 ring-[#936B34]/20' : 'border-[#E7E2DA]'}`}>
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE3]">
                      <span className="font-mono text-base font-bold text-[#1C1917]">{item.size}</span>
                      {isHighlighted(item.size) && (
                        <span className="text-[10px] font-bold text-[#936B34] bg-[#FDF8EE] px-2 py-0.5 rounded">Khuyên dùng</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {item.boVien && <div className="p-2 bg-[#FAF9F5] rounded-lg">Bo viền: <strong>{item.boVien.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.k0_k3 && <div className="p-2 bg-[#FAF9F5] rounded-lg">K0 - K3: <strong>{item.k0_k3.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.k4_k6 && <div className="p-2 bg-[#FAF9F5] rounded-lg">K4 - K6: <strong>{item.k4_k6.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.k7_k9 && <div className="p-2 bg-[#FAF9F5] rounded-lg">K7 - K9: <strong>{item.k7_k9.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.k10 && <div className="p-2 bg-[#FAF9F5] rounded-lg text-[#936B34]">K10 (5.5cm): <strong>{item.k10.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.k11 && <div className="p-2 bg-[#FAF9F5] rounded-lg text-[#936B34]">K11 (8cm): <strong>{item.k11.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.titan1 && <div className="p-2 bg-emerald-50 rounded-lg text-emerald-900">Titan T1: <strong>{item.titan1.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.titan2 && <div className="p-2 bg-emerald-50 rounded-lg text-emerald-900">Titan T2: <strong>{item.titan2.toLocaleString('vi-VN')} đ</strong></div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. Mica Gương HD Cards */}
            {activeTab === 'mica-guong-hd' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {micaGuongHDKhungData.filter(r => matchesSearch(r.size)).map((item) => (
                  <div key={item.size} className={`bg-white rounded-2xl border p-4 shadow-xs space-y-3 ${isHighlighted(item.size) ? 'border-[#936B34] ring-1 ring-[#936B34]/20' : 'border-[#E7E2DA]'}`}>
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE3]">
                      <span className="font-mono text-base font-bold text-[#1C1917]">{item.size}</span>
                      <span className="text-[10px] text-sky-800 bg-sky-50 px-2 py-0.5 rounded font-semibold">Mica Gương HD</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {item.boVien && <div className="p-2 bg-[#FAF9F5] rounded-lg">Bo viền: <strong>{item.boVien.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.k0_k3 && <div className="p-2 bg-[#FAF9F5] rounded-lg">K0 - K3: <strong>{item.k0_k3.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.k4_k6 && <div className="p-2 bg-[#FAF9F5] rounded-lg">K4 - K6: <strong>{item.k4_k6.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.k7_k9 && <div className="p-2 bg-[#FAF9F5] rounded-lg">K7 - K9: <strong>{item.k7_k9.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.k10 && <div className="p-2 bg-[#FAF9F5] rounded-lg text-[#936B34]">K10: <strong>{item.k10.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.k11 && <div className="p-2 bg-[#FAF9F5] rounded-lg text-[#936B34]">K11: <strong>{item.k11.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.titan1 && <div className="p-2 bg-emerald-50 rounded-lg text-emerald-900">Titan T1: <strong>{item.titan1.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.titan2 && <div className="p-2 bg-emerald-50 rounded-lg text-emerald-900">Titan T2: <strong>{item.titan2.toLocaleString('vi-VN')} đ</strong></div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. Mica Phổ Thông Cards */}
            {activeTab === 'mica-pho-thong' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {micaPhoThongData.filter(r => matchesSearch(r.size)).map((item) => (
                  <div key={item.size} className="bg-white rounded-2xl border border-[#E7E2DA] p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE3]">
                      <span className="font-mono text-base font-bold text-[#1C1917]">{item.size}</span>
                      <span className="text-[10px] text-[#78716C]">Mica bóng chuẩn</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {item.boVien && <div className="p-2 bg-[#FAF9F5] rounded-lg">Bo viền: <strong>{item.boVien.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.k0_k3 && <div className="p-2 bg-[#FAF9F5] rounded-lg">K0 - K3: <strong>{item.k0_k3.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.k4_k6 && <div className="p-2 bg-[#FAF9F5] rounded-lg">K4 - K6: <strong>{item.k4_k6.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.k7_k9 && <div className="p-2 bg-[#FAF9F5] rounded-lg">K7 - K9: <strong>{item.k7_k9.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.k10 && <div className="p-2 bg-[#FAF9F5] rounded-lg text-[#936B34]">K10: <strong>{item.k10.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.k11 && <div className="p-2 bg-[#FAF9F5] rounded-lg text-[#936B34]">K11: <strong>{item.k11.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.titan1 && <div className="p-2 bg-emerald-50 rounded-lg text-emerald-900">Titan T1: <strong>{item.titan1.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.titan2 && <div className="p-2 bg-emerald-50 rounded-lg text-emerald-900">Titan T2: <strong>{item.titan2.toLocaleString('vi-VN')} đ</strong></div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Bo Viền Cards */}
            {activeTab === 'bo-vien-meka' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {boVienPricingData.filter(r => matchesSearch(r.size)).map((item) => (
                  <div key={item.stt} className="bg-white rounded-2xl border border-[#E7E2DA] p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE3]">
                      <span className="font-mono text-base font-bold text-[#1C1917]">{item.size}</span>
                      <span className="text-[10px] text-[#78716C] font-mono">#{item.stt}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {item.luaVien && <div className="p-2 bg-[#FAF9F5] rounded-lg">Lụa Viền: <strong>{item.luaVien.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.mekaVien && <div className="p-2 bg-[#FAF9F5] rounded-lg">Meka Viền: <strong>{item.mekaVien.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.mekaGuongHdVien && <div className="p-2 bg-amber-50 rounded-lg text-amber-900">Meka Gương HD: <strong>{item.mekaGuongHdVien.toLocaleString('vi-VN')} đ</strong></div>}
                      {item.inEpMeka && <div className="p-2 bg-emerald-50 rounded-lg text-emerald-900">In Ép Meka Rời: <strong>{item.inEpMeka.toLocaleString('vi-VN')} đ</strong></div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5. 4K & HD+ Cards */}
            {activeTab === 'anh-4k-hd-plus' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[#1C1917] uppercase tracking-wider mb-3">
                    Bảng ẢNH 4K (Ép Fomex)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {anh4KPricingData.filter(r => matchesSearch(r.size)).map((item) => (
                      <div key={item.size} className="bg-white rounded-xl border border-[#E7E2DA] p-3.5 shadow-xs space-y-2">
                        <div className="font-mono font-bold text-sm text-[#1C1917]">{item.size}</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-[#FAF9F5] rounded">K4 - K6: <strong>{item.k4_k6?.toLocaleString('vi-VN')} đ</strong></div>
                          <div className="p-2 bg-emerald-50 rounded text-emerald-900">Titan T2: <strong>{item.titan2?.toLocaleString('vi-VN')} đ</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#1C1917] uppercase tracking-wider mb-3">
                    Bảng ẢNH HD+ (Mica Gương HD Ép Fomex - Đã Gồm Khung)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {anhHDPlusPricingData.filter(r => matchesSearch(r.size)).map((item) => (
                      <div key={item.size} className="bg-white rounded-xl border border-[#E7E2DA] p-3.5 shadow-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-sm text-[#1C1917]">{item.size}</span>
                          {item.hasNepSurchargeEligible && (
                            <span className="text-[10px] text-[#92400E] bg-amber-50 px-1.5 py-0.5 rounded font-mono">
                              Nẹp +{item.nepSurchargeAmount?.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-[#FAF9F5] rounded">K4 - K6: <strong>{item.k4_k6?.toLocaleString('vi-VN')} đ</strong></div>
                          <div className="p-2 bg-emerald-50 rounded text-emerald-900">Titan T2: <strong>{item.titanT2?.toLocaleString('vi-VN')} đ</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* RENDER MODE B: DẠNG BẢNG (STICKY CỘT CỠ ẢNH BÊN TRÁI)         */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-2xl border border-[#E7E2DA] overflow-hidden shadow-xs">
            
            <div className="p-3 bg-[#FAF9F5] border-b border-[#E7E2DA] flex items-center justify-between text-xs text-[#78716C]">
              <span>💡 Mẹo: Cột <strong>CỠ ẢNH</strong> được cố định bên trái khi bạn vuốt ngang</span>
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
                      <th className="py-3 px-3 text-right whitespace-nowrap">K0-K3</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">K4-K6</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">K7-K9</th>
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

              {/* Table for Mica Gương HD */}
              {activeTab === 'mica-guong-hd' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF9F5] border-b border-[#E7E2DA] text-[#57534E]">
                      <th className="py-3 px-3.5 font-bold text-[#1C1917] sticky left-0 bg-[#FAF9F5] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap min-w-[90px]">
                        Cỡ Ảnh
                      </th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">Bo Viền</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">K0-K3</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">K4-K6</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">K7-K9</th>
                      <th className="py-3 px-3 text-right text-[#936B34] whitespace-nowrap">K10</th>
                      <th className="py-3 px-3 text-right text-[#936B34] whitespace-nowrap">K11</th>
                      <th className="py-3 px-3 text-right text-emerald-800 whitespace-nowrap">Titan 1</th>
                      <th className="py-3 px-3 text-right text-emerald-800 whitespace-nowrap">Titan 2</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE3]">
                    {micaGuongHDKhungData.filter(r => matchesSearch(r.size)).map((row) => (
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

              {/* Table for Mica Phổ Thông */}
              {activeTab === 'mica-pho-thong' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF9F5] border-b border-[#E7E2DA] text-[#57534E]">
                      <th className="py-3 px-3.5 font-bold text-[#1C1917] sticky left-0 bg-[#FAF9F5] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap min-w-[90px]">
                        Cỡ Ảnh
                      </th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">Bo Viền</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">K0-K3</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">K4-K6</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">K7-K9</th>
                      <th className="py-3 px-3 text-right text-[#936B34] whitespace-nowrap">K10</th>
                      <th className="py-3 px-3 text-right text-[#936B34] whitespace-nowrap">K11</th>
                      <th className="py-3 px-3 text-right text-emerald-800 whitespace-nowrap">Titan 1</th>
                      <th className="py-3 px-3 text-right text-emerald-800 whitespace-nowrap">Titan 2</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE3]">
                    {micaPhoThongData.filter(r => matchesSearch(r.size)).map((row) => (
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

              {/* Table for Bo Viền */}
              {activeTab === 'bo-vien-meka' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF9F5] border-b border-[#E7E2DA] text-[#57534E]">
                      <th className="py-3 px-3.5 font-bold text-[#1C1917] sticky left-0 bg-[#FAF9F5] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap min-w-[90px]">
                        Cỡ Ảnh
                      </th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">Lụa Viền</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">Meka Viền</th>
                      <th className="py-3 px-3 text-right text-[#936B34] whitespace-nowrap">Meka Gương HD Viền</th>
                      <th className="py-3 px-3 text-right text-emerald-800 whitespace-nowrap">In Ép Meka Rời</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE3]">
                    {boVienPricingData.filter(r => matchesSearch(r.size)).map((row) => (
                      <tr key={row.stt} className="hover:bg-[#FCFBF8]">
                        <td className="py-2.5 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap">
                          {row.size}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(row.luaVien)}</td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(row.mekaVien)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#936B34] whitespace-nowrap">{formatPrice(row.mekaGuongHdVien)}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-emerald-800 whitespace-nowrap">{formatPrice(row.inEpMeka)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Table for 4K & HD+ */}
              {activeTab === 'anh-4k-hd-plus' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF9F5] border-b border-[#E7E2DA] text-[#57534E]">
                      <th className="py-3 px-3.5 font-bold text-[#1C1917] sticky left-0 bg-[#FAF9F5] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap min-w-[90px]">
                        Cỡ Ảnh
                      </th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">Ảnh 4K (K4-K6)</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap text-emerald-800">Ảnh 4K (Titan 2)</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">Ảnh HD+ (K4-K6)</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap text-emerald-800">Ảnh HD+ (Titan T2)</th>
                      <th className="py-3 px-3 text-right text-[#92400E] whitespace-nowrap">Phụ Phí Nẹp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE3]">
                    {anhHDPlusPricingData.filter(r => matchesSearch(r.size)).map((hdRow) => {
                      const fourK = anh4KPricingData.find(f => f.size === hdRow.size);
                      return (
                        <tr key={hdRow.size} className="hover:bg-[#FCFBF8]">
                          <td className="py-2.5 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap">
                            {hdRow.size}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(fourK?.k4_k6 ?? null)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-800 whitespace-nowrap">{formatPrice(fourK?.titan2 ?? null)}</td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(hdRow.k4_k6)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-800 whitespace-nowrap">{formatPrice(hdRow.titanT2)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-[#92400E] whitespace-nowrap">
                            {hdRow.hasNepSurchargeEligible ? `+${hdRow.nepSurchargeAmount?.toLocaleString('vi-VN')} đ` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
