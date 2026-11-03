import React, { useState, useMemo } from 'react';
import { useMasterCatalog, DEFAULT_RETAIL_COLUMNS, DEFAULT_DONG_KHUNG_COLUMNS, getDefaultColumnsForTable } from '../services/adminStore';
import { isAllowedRetailCell, defaultRetailPricingData } from '../data/initialData';
import { usePriceMultiplier, applyMultiplier } from '../hooks/usePriceMultiplier';
import { MaterialTabId } from '../types';
import { AudienceTierId } from '../types/admin';
import { Search, Users, Building2, UserCheck, ShoppingBag } from 'lucide-react';

interface OfficialPricingTablesProps {
  onSelectSizeForCalculator?: (productLine: string, size: string) => void;
  zaloTho: string;
  lockedTier?: AudienceTierId;
}

const baseMaterialTabs: { id: string; label: string }[] = [
  { id: 'go-lua', label: '1. Gỗ Lụa Đóng Khung' },
  { id: 'hd-guong-sieu-bong', label: '2. HD Gương Siêu Bóng' },
  { id: 'mika-pho-thong', label: '3. Mika Phổ Thông' },
  { id: 'in-ep-mika', label: '4. In Ép Mika' },
  { id: 'anh-4k', label: '5. Cao Cấp 4K' },
  { id: 'album-mo-phang', label: '6. Album Mở Phẳng' }
];

export const OfficialPricingTables: React.FC<OfficialPricingTablesProps> = ({
  zaloTho,
  lockedTier
}) => {
  const catalog = useMasterCatalog();
  const [activeTab, setActiveTab] = useState<string>('go-lua');
  const activeTier: AudienceTierId = lockedTier || 'retail';
  const [searchSize, setSearchSize] = useState<string>('');
  const multiplier = usePriceMultiplier();

  // Ensure customer cannot access hd-pro if requested by link
  React.useEffect(() => {
    if (activeTab === 'hd-pro') {
      setActiveTab('go-lua');
    }
  }, [activeTab]);

  // Custom materials that are active for current activeTier
  const customMaterials = useMemo(() => {
    return (catalog.customMaterials || []).filter(m => !m.targetTiers || m.targetTiers.includes(activeTier));
  }, [catalog.customMaterials, activeTier]);

  const allMaterialTabs = useMemo(() => {
    return [
      ...baseMaterialTabs,
      ...customMaterials.map((cm, idx) => ({
        id: cm.id,
        label: `${8 + idx}. ${cm.name}`
      }))
    ];
  }, [customMaterials]);

  // Get active tier datasets
  const activeTables = catalog.tiers?.[activeTier] || catalog.tiers?.retail || catalog;

  const goLuaDataTransformed = useMemo(() => 
    (activeTables.goLua || []).map(r => ({
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
  [activeTables.goLua, multiplier]);

  const hdGuongDataTransformed = useMemo(() => 
    (activeTables.hdGuongSieuBong || []).map(r => ({
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
  [activeTables.hdGuongSieuBong, multiplier]);

  const mikaPhoThongDataTransformed = useMemo(() => 
    (activeTables.mikaPhoThong || []).map(r => ({
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
  [activeTables.mikaPhoThong, multiplier]);

  const inEpMikaDataTransformed = useMemo(() => 
    (activeTables.inEpMika || []).map(r => ({
      ...r,
      inEpMika: applyMultiplier(r.inEpMika, multiplier)!,
      khungXuongGiaCo: applyMultiplier(r.khungXuongGiaCo, multiplier) || undefined,
    })),
  [activeTables.inEpMika, multiplier]);

  const anh4KDataTransformed = useMemo(() => 
    (activeTables.anh4K || []).map(r => ({
      ...r,
      k4_k6: applyMultiplier(r.k4_k6, multiplier),
      titan2: applyMultiplier(r.titan2, multiplier),
    })),
  [activeTables.anh4K, multiplier]);

  const hdProDataTransformed = useMemo(() => 
    (activeTables.hdPro || []).map(r => ({
      ...r,
      k4_k6: applyMultiplier(r.k4_k6, multiplier),
      titan1: applyMultiplier(r.titan1, multiplier),
      titan2: applyMultiplier(r.titan2, multiplier),
    })),
  [activeTables.hdPro, multiplier]);

  const albumMoPhangDataTransformed = useMemo(() => 
    (activeTables.albumMoPhang || []).map(r => ({
      ...r,
      price: applyMultiplier(r.price, multiplier),
    })),
  [activeTables.albumMoPhang, multiplier]);

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
        
        {/* If activeTier === 'retail', display Single Retail Table + Passport Photos view */}
        {activeTier === 'retail' ? (
          <div className="space-y-6">
            
            {/* 1. DỊCH VỤ ẢNH THẺ */}
            <div className="bg-white rounded-2xl border border-[#E7E2DA] p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7E2DA] pb-3">
                <div>
                  <div className="text-[11px] font-mono font-bold uppercase text-[#936B34]">DỊCH VỤ NHANH TRỌN GÓI</div>
                  <h3 className="font-serif-display text-lg sm:text-xl font-bold text-[#1C1917]">
                    📸 DỊCH VỤ CHỤP & IN ẢNH THẺ (3x4 & 4x6)
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 self-start sm:self-auto">
                  LẤY NGAY SAU 10 PHÚT
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(catalog.retailPassports || [
                  { size: '3x4', code: '3*4', name: 'Chụp & In Ảnh Thẻ 3x4 (Bộ 8 tấm)', price: 50000 },
                  { size: '4x6', code: '4*6', name: 'Chụp & In Ảnh Thẻ 4x6 (Bộ 4 tấm)', price: 50000 }
                ]).map((pass) => {
                  const keyStr = pass.code || pass.size;
                  const labelStr = pass.name || `Chụp & In Ảnh Thẻ ${pass.size}`;
                  return (
                    <div key={keyStr} className="bg-[#FAF9F5] border border-[#E7E2DA] rounded-xl p-4 flex items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <div className="font-bold text-sm text-[#1C1917]">{labelStr}</div>
                        <div className="text-xs text-[#78716C] mt-0.5">Bao gồm chụp ảnh + cắt phông + chỉnh sửa thần thái</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-bold font-mono text-[#936B34]">
                          {pass.price ? pass.price.toLocaleString('vi-VN') : '50.000'} đ
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. BẢNG GIÁ KHÁCH LẺ DUY NHẤT 1 BẢNG */}
            <div className="bg-white rounded-2xl border border-[#E7E2DA] overflow-hidden shadow-xs">
              <div className="p-4 bg-[#FAF9F5] border-b border-[#E7E2DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-mono font-bold uppercase text-[#936B34]">BIỂU GIÁ NIÊM YẾT TRỌN GÓI</div>
                  <h3 className="font-serif-display text-lg sm:text-xl font-bold text-[#1C1917]">
                    🖼️ BIỂU GIÁ IN ẢNH & ĐÓNG KHUNG HOÀN THIỆN
                  </h3>
                </div>

                {/* Search size filter */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Lọc kích thước (40x60, 60x90)..."
                    value={searchSize}
                    onChange={(e) => setSearchSize(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-[#E7E2DA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#936B34]"
                  />
                </div>
              </div>

              {/* Mobile Swipe Guide Banner */}
              <div className="md:hidden bg-[#E61E25] text-white py-2.5 px-3 flex items-center justify-center gap-2 select-none shadow-xs border-b border-red-700">
                <span className="text-base animate-slide-finger">👈</span>
                <span className="font-extrabold uppercase text-[12px] sm:text-[13px] tracking-wide">
                  VUỐT SANG TRÁI ĐỂ XEM THÊM CÁC MẪU KHUNG
                </span>
              </div>

              <div className="overflow-x-auto">
                {(() => {
                  // Khóa cứng duy nhất 5 cột tương ứng với 44 mã SKU thật của bảng giá Khách Lẻ.
                  // Tuyệt đối không sinh thêm cột ảo hay ép hiển thị K4, K5, K6...
                  const retailCols = DEFAULT_RETAIL_COLUMNS;
                  const displayRows = (catalog.retailTable && catalog.retailTable.length > 0 
                    ? catalog.retailTable 
                    : defaultRetailPricingData).filter(r => matchesSearch(r.size));

                  return (
                    <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                      <thead>
                        <tr className="bg-[#FFF4EB] border-b border-[#FED7AA] text-[#7C2D12] text-[13px] sm:text-sm italic font-bold">
                          <th className="py-3 px-3.5 font-bold italic text-[#7C2D12] sticky left-0 bg-[#FFF4EB] z-10 border-r border-[#FED7AA] whitespace-nowrap min-w-[90px]">
                            KÍCH THƯỚC
                          </th>
                          {retailCols.map((col) => {
                            const isGold = col.key === 'hdBoVien';
                            const isGreen = col.key === 'hdTitan2';
                            return (
                              <th 
                                key={col.key} 
                                className={`py-3 px-3 text-right whitespace-nowrap font-bold italic ${
                                  isGold ? 'text-[#B45309]' : isGreen ? 'text-emerald-900' : 'text-[#7C2D12]'
                                }`}
                              >
                                {col.label}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EBE3]">
                        {displayRows.map((row) => (
                          <tr key={row.size} className={`hover:bg-[#FCFBF8] ${isHighlighted(row.size) ? 'bg-[#FFFDF9]' : ''}`}>
                            <td className="py-3 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 border-r border-[#E7E2DA] whitespace-nowrap">
                              {row.size}
                            </td>
                            {retailCols.map((col) => {
                              const isGold = col.key === 'hdBoVien';
                              const isGreen = col.key === 'hdTitan2';
                              // Chỉ cho phép hiển thị giá nếu cell nằm trong danh mục 44 SKU thật
                              const isAllowed = isAllowedRetailCell(row.size, col.key);
                              const cellPrice = isAllowed ? row[col.key] : null;

                              return (
                                <td 
                                  key={col.key} 
                                  className={`py-3 px-3 text-right whitespace-nowrap ${
                                    isGold ? 'font-bold text-[#936B34]' : isGreen ? 'font-bold text-emerald-800' : ''
                                  }`}
                                >
                                  {formatPrice(cellPrice)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>

          </div>
        ) : (
          /* STANDARD B2B MULTI-MATERIAL TABLES (FOR STUDIO & FREELANCE) */
          <>
            {/* Header & Controls */}
            <div className="space-y-4 pb-4 border-b border-[#E7E2DA] w-full max-w-full">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 w-full max-w-full">
                <div>
                  <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#936B34]">
                    Biểu Giá Niêm Yết 2026 · Tiệm In 194
                  </div>
                  <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
                    Biểu Giá Theo Chất Liệu
                  </h2>
                  <p className="text-xs text-[#57534E] mt-0.5">
                    Đầy đủ các dòng in ấn & gia công khung chuyên nghiệp của Tiệm In <span className="text-[#FF0000] font-bold">194</span>
                  </p>
                </div>

                {/* Neutral Badge */}
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border shrink-0 bg-[#F5F2EB] border-[#E2DBD0] text-[#1C1917] shadow-xs">
                  <Building2 className="w-4 h-4 text-[#936B34]" />
                  <span className="text-xs font-bold text-[#1C1917]">Biểu Giá</span>
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

              {/* Material Tabs */}
              <div className="flex flex-wrap items-center gap-2 w-full max-w-full">
                {allMaterialTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`min-h-[42px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center text-center leading-tight ${
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

            {/* BẢNG HIỂN THỊ CHI TIẾT */}
            <div className="bg-white rounded-2xl border border-[#E7E2DA] overflow-hidden shadow-xs w-full max-w-full">
              
              {/* Desktop info bar */}
              <div className="hidden md:flex p-3 bg-[#FAF9F5] border-b border-[#E7E2DA] items-center justify-between text-xs text-[#78716C] max-w-full">
                <span>
                  Đang xem: <strong className="text-[#1C1917]">
                    {activeTier === 'studio' ? 'Biểu giá Sỉ Studio (Gốc)' : 'Biểu giá Thợ Chụp Freelance (+10%)'}
                  </strong>
                </span>
                <span className="font-mono font-bold text-[#1C1917] shrink-0 ml-2">Đơn vị: VNĐ</span>
              </div>

              {/* Mobile Swipe Guide Banner - Replaces the info bar on mobile as requested */}
              <div className="md:hidden bg-[#E61E25] text-white py-2.5 px-3 flex items-center justify-center gap-2 select-none shadow-xs border-b border-red-700">
                <span className="text-base animate-slide-finger">👈</span>
                <span className="font-extrabold uppercase text-[12px] sm:text-[13px] tracking-wide">
                  VUỐT SANG TRÁI ĐỂ XEM THÊM CÁC MẪU KHUNG
                </span>
              </div>

              <div className="overflow-x-auto max-w-full relative">
                
                {/* Table for Gỗ Lụa */}
                {activeTab === 'go-lua' && (() => {
                  const cols = activeTables.columnConfigs?.['go-lua'] || catalog.columnConfigs?.['go-lua'] || DEFAULT_DONG_KHUNG_COLUMNS;
                  return (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#FFF4EB] border-b border-[#FED7AA] text-[#7C2D12] text-[13px] sm:text-sm italic font-bold">
                          <th className="py-3 px-3.5 font-bold italic text-[#7C2D12] sticky left-0 bg-[#FFF4EB] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] border-r border-[#FED7AA] whitespace-nowrap min-w-[90px]">
                            Cỡ Ảnh
                          </th>
                          {cols.map((col) => (
                            <th key={col.key} className="py-3 px-3 text-right whitespace-nowrap font-bold italic text-[#7C2D12]">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EBE3]">
                        {goLuaDataTransformed.filter(r => matchesSearch(r.size)).map((row: any) => (
                          <tr key={row.size} className={`hover:bg-[#FCFBF8] ${isHighlighted(row.size) ? 'bg-[#FFFDF9]' : ''}`}>
                            <td className="py-2.5 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap">
                              {row.size}
                            </td>
                            {cols.map((col) => (
                              <td key={col.key} className={`py-2.5 px-3 text-right whitespace-nowrap ${col.key === 'titan2' ? 'font-bold text-emerald-800' : ''}`}>
                                {formatPrice(row[col.key] !== undefined ? applyMultiplier(row[col.key], multiplier) : null)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}

                {/* Table for HD Gương Siêu Bóng */}
                {activeTab === 'hd-guong-sieu-bong' && (() => {
                  const cols = activeTables.columnConfigs?.['hd-guong-sieu-bong'] || catalog.columnConfigs?.['hd-guong-sieu-bong'] || DEFAULT_DONG_KHUNG_COLUMNS;
                  return (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#FFF4EB] border-b border-[#FED7AA] text-[#7C2D12] text-[13px] sm:text-sm italic font-bold">
                          <th className="py-3 px-3.5 font-bold italic text-[#7C2D12] sticky left-0 bg-[#FFF4EB] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] border-r border-[#FED7AA] whitespace-nowrap min-w-[90px]">
                            Cỡ Ảnh
                          </th>
                          {cols.map((col) => (
                            <th key={col.key} className="py-3 px-3 text-right whitespace-nowrap font-bold italic text-[#7C2D12]">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EBE3]">
                        {hdGuongDataTransformed.filter(r => matchesSearch(r.size)).map((row: any) => (
                          <tr key={row.size} className={`hover:bg-[#FCFBF8] ${isHighlighted(row.size) ? 'bg-[#FFFDF9]' : ''}`}>
                            <td className="py-2.5 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap">
                              {row.size}
                            </td>
                            {cols.map((col) => (
                              <td key={col.key} className={`py-2.5 px-3 text-right whitespace-nowrap ${col.key === 'titan2' ? 'font-bold text-emerald-800' : ''}`}>
                                {formatPrice(row[col.key] !== undefined ? applyMultiplier(row[col.key], multiplier) : null)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}

                {/* Table for Mika Phổ Thông */}
                {activeTab === 'mika-pho-thong' && (() => {
                  const cols = activeTables.columnConfigs?.['mika-pho-thong'] || catalog.columnConfigs?.['mika-pho-thong'] || DEFAULT_DONG_KHUNG_COLUMNS;
                  return (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#FFF4EB] border-b border-[#FED7AA] text-[#7C2D12] text-[13px] sm:text-sm italic font-bold">
                          <th className="py-3 px-3.5 font-bold italic text-[#7C2D12] sticky left-0 bg-[#FFF4EB] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] border-r border-[#FED7AA] whitespace-nowrap min-w-[90px]">
                            Cỡ Ảnh
                          </th>
                          {cols.map((col) => (
                            <th key={col.key} className="py-3 px-3 text-right whitespace-nowrap font-bold italic text-[#7C2D12]">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EBE3]">
                        {mikaPhoThongDataTransformed.filter(r => matchesSearch(r.size)).map((row: any) => (
                          <tr key={row.size} className={`hover:bg-[#FCFBF8] ${isHighlighted(row.size) ? 'bg-[#FFFDF9]' : ''}`}>
                            <td className="py-2.5 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap">
                              {row.size}
                            </td>
                            {cols.map((col) => (
                              <td key={col.key} className={`py-2.5 px-3 text-right whitespace-nowrap ${col.key === 'titan2' ? 'font-bold text-emerald-800' : ''}`}>
                                {formatPrice(row[col.key] !== undefined ? applyMultiplier(row[col.key], multiplier) : null)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}

                {/* Table for In Ép Mika */}
                {activeTab === 'in-ep-mika' && (() => {
                  const cols = activeTables.columnConfigs?.['in-ep-mika'] || catalog.columnConfigs?.['in-ep-mika'] || getDefaultColumnsForTable('in-ep-mika');
                  return (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#FFF4EB] border-b border-[#FED7AA] text-[#7C2D12] text-[13px] sm:text-sm italic font-bold">
                          <th className="py-3 px-3.5 font-bold italic text-[#7C2D12] sticky left-0 bg-[#FFF4EB] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] border-r border-[#FED7AA] whitespace-nowrap min-w-[90px]">
                            STT / Cỡ Ảnh
                          </th>
                          {cols.map((col: any) => (
                            <th key={col.key} className={`py-3 px-4 text-right font-bold italic whitespace-nowrap ${col.key === 'khungXuongGiaCo' ? 'text-[#B45309]' : 'text-[#7C2D12]'}`}>
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EBE3]">
                        {inEpMikaDataTransformed.filter(r => matchesSearch(r.size)).map((row: any) => (
                          <tr key={row.size} className={`hover:bg-[#FCFBF8] ${isHighlighted(row.size) ? 'bg-[#FFFDF9]' : ''}`}>
                            <td className="py-2.5 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap">
                              <span className="text-[#936B34] text-[10px] mr-1.5 font-mono">#{row.stt}</span>
                              {row.size}
                            </td>
                            {cols.map((col: any) => (
                              <td key={col.key} className={`py-2.5 px-4 text-right whitespace-nowrap ${col.key === 'khungXuongGiaCo' ? 'text-[#936B34] font-medium' : 'font-bold text-[#1C1917]'}`}>
                                {col.key === 'khungXuongGiaCo' ? (
                                  row.khungXuongGiaCo ? (
                                    <span className="font-mono text-[#936B34]">+{row.khungXuongGiaCo.toLocaleString('vi-VN')} đ</span>
                                  ) : (
                                    <span className="text-neutral-400 text-[11px]">Không yêu cầu</span>
                                  )
                                ) : (
                                  formatPrice(row[col.key] !== undefined ? applyMultiplier(row[col.key], multiplier) : null)
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}

                {/* Table for Cao Cấp 4K */}
                {activeTab === 'anh-4k' && (() => {
                  const cols = activeTables.columnConfigs?.['anh-4k'] || catalog.columnConfigs?.['anh-4k'] || getDefaultColumnsForTable('anh-4k');
                  return (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#FFF4EB] border-b border-[#FED7AA] text-[#7C2D12] text-[13px] sm:text-sm italic font-bold">
                          <th className="py-3 px-3.5 font-bold italic text-[#7C2D12] sticky left-0 bg-[#FFF4EB] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] border-r border-[#FED7AA] whitespace-nowrap min-w-[90px]">
                            Cỡ Ảnh
                          </th>
                          {cols.map((col: any) => (
                            <th key={col.key} className={`py-3 px-4 text-right font-bold italic whitespace-nowrap ${col.key === 'titan2' ? 'text-emerald-900' : 'text-[#7C2D12]'}`}>
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EBE3]">
                        {anh4KDataTransformed.filter(r => matchesSearch(r.size)).map((row: any) => (
                          <tr key={row.size} className={`hover:bg-[#FCFBF8] ${isHighlighted(row.size) ? 'bg-[#FFFDF9]' : ''}`}>
                            <td className="py-2.5 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap">
                              {row.size}
                            </td>
                            {cols.map((col: any) => (
                              <td key={col.key} className={`py-2.5 px-4 text-right font-bold whitespace-nowrap ${col.key === 'titan2' ? 'text-emerald-800' : 'text-[#1C1917]'}`}>
                                {formatPrice(row[col.key] !== undefined ? applyMultiplier(row[col.key], multiplier) : null)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}

                {/* Table for Album Mở Phẳng */}
                {activeTab === 'album-mo-phang' && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FFF4EB] border-b border-[#FED7AA] text-[#7C2D12] text-[13px] sm:text-sm italic font-bold">
                        <th className="py-3 px-3.5 font-bold italic text-[#7C2D12] sticky left-0 bg-[#FFF4EB] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] border-r border-[#FED7AA] whitespace-nowrap min-w-[90px]">
                          Kích Thước Album
                        </th>
                        <th className="py-3 px-4 text-left font-bold italic text-[#B45309] whitespace-nowrap">Số Tờ Tiêu Chuẩn</th>
                        <th className="py-3 px-4 text-right font-bold italic text-[#7C2D12] whitespace-nowrap">Đơn Giá Hoàn Thiện</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBE3]">
                      {albumMoPhangDataTransformed.filter(r => matchesSearch(r.size)).map((row) => (
                        <tr key={row.size} className="hover:bg-[#FCFBF8]">
                          <td className="py-3 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap">
                            {row.size}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-[#936B34] whitespace-nowrap">
                            {row.sheets} tờ (20 trang)
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-[#1C1917] whitespace-nowrap">
                            {formatPrice(row.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Dynamic Table for Custom Material */}
                {customMaterials.some(m => m.id === activeTab) && (() => {
                  const customDef = customMaterials.find(m => m.id === activeTab)!;
                  const customRows = ((activeTables.customTables?.[customDef.id] || []) as any[]).filter(r => matchesSearch(r.size));
                  const customCols = activeTables.columnConfigs?.[customDef.id] || catalog.columnConfigs?.[customDef.id] || DEFAULT_DONG_KHUNG_COLUMNS;

                  if (customDef.type === 'dong-khung') {
                    return (
                      <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                        <thead>
                          <tr className="bg-[#FFF4EB] border-b border-[#FED7AA] text-[#7C2D12] text-[13px] sm:text-sm italic font-bold">
                            <th className="py-3 px-3.5 font-bold italic text-[#7C2D12] sticky left-0 bg-[#FFF4EB] z-10 border-r border-[#FED7AA] whitespace-nowrap min-w-[90px]">Cỡ Ảnh</th>
                            {customCols.map(col => (
                              <th key={col.key} className="py-3 px-3 text-right whitespace-nowrap font-bold italic text-[#7C2D12]">{col.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0EBE3]">
                          {customRows.map((row) => (
                            <tr key={row.size} className="hover:bg-[#FCFBF8]">
                              <td className="py-2.5 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 border-r border-[#E7E2DA] whitespace-nowrap">{row.size}</td>
                              {customCols.map(col => (
                                <td key={col.key} className={`py-2.5 px-3 text-right whitespace-nowrap ${col.key === 'titan2' ? 'font-bold text-emerald-800' : ''}`}>
                                  {formatPrice(applyMultiplier(row[col.key], multiplier))}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  } else {
                    return (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#FFF4EB] border-b border-[#FED7AA] text-[#7C2D12] text-[13px] sm:text-sm italic font-bold">
                            <th className="py-3 px-3.5 font-bold italic text-[#7C2D12] sticky left-0 bg-[#FFF4EB] z-10 border-r border-[#FED7AA] whitespace-nowrap min-w-[90px]">Cỡ Ảnh</th>
                            <th className="py-3 px-4 text-right font-bold italic text-[#7C2D12] whitespace-nowrap">Đơn Giá Hoàn Thiện</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0EBE3]">
                          {customRows.map((row) => (
                            <tr key={row.size} className="hover:bg-[#FCFBF8]">
                              <td className="py-2.5 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 border-r border-[#E7E2DA] whitespace-nowrap">{row.size}</td>
                              <td className="py-2.5 px-4 text-right font-bold text-[#1C1917] whitespace-nowrap">
                                {formatPrice(applyMultiplier(row.boVien ?? row.price ?? row.inEpMika, multiplier))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  }
                })()}

              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
