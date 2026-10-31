import React, { useState, useMemo } from 'react';
import { useMasterCatalog } from '../services/adminStore';
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

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                  <thead>
                    <tr className="bg-[#FAF9F5] border-b border-[#E7E2DA] text-[#57534E]">
                      <th className="py-3 px-3.5 font-bold text-[#1C1917] sticky left-0 bg-[#FAF9F5] z-10 border-r border-[#E7E2DA] whitespace-nowrap min-w-[90px]">
                        KÍCH THƯỚC
                      </th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">In Ép Mika</th>
                      <th className="py-3 px-3 text-right font-bold text-[#936B34] whitespace-nowrap">HD Bo Viền</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">HD Khung Titan 1</th>
                      <th className="py-3 px-3 text-right font-bold text-emerald-800 whitespace-nowrap">HD Khung Titan 2</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">HD Khung K10</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE3]">
                    {(catalog.retailTable || []).filter(r => matchesSearch(r.size)).map((row) => (
                      <tr key={row.size} className={`hover:bg-[#FCFBF8] ${isHighlighted(row.size) ? 'bg-[#FFFDF9]' : ''}`}>
                        <td className="py-3 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 border-r border-[#E7E2DA] whitespace-nowrap">
                          {row.size}
                        </td>
                        <td className="py-3 px-3 text-right font-medium whitespace-nowrap">{formatPrice(row.inEpMika)}</td>
                        <td className="py-3 px-3 text-right font-bold text-[#936B34] whitespace-nowrap">{formatPrice(row.hdBoVien)}</td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">{formatPrice(row.hdTitan1)}</td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-800 whitespace-nowrap">{formatPrice(row.hdTitan2)}</td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">{formatPrice(row.hdK10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              
              <div className="p-3 bg-[#FAF9F5] border-b border-[#E7E2DA] flex items-center justify-between text-xs text-[#78716C] max-w-full">
                <span>
                  Đang xem: <strong className="text-[#1C1917]">
                    {activeTier === 'studio' ? 'Biểu giá Sỉ Studio (Gốc)' : 'Biểu giá Thợ Chụp Freelance (+10%)'}
                  </strong>
                </span>
                <span className="font-mono font-bold text-[#1C1917] shrink-0 ml-2">Đơn vị: VNĐ</span>
              </div>

              <div className="overflow-x-auto max-w-full relative">
                
                {/* Table for Gỗ Lụa */}
                {activeTab === 'go-lua' && (
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

                {/* Table for In Ép Mika */}
                {activeTab === 'in-ep-mika' && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAF9F5] border-b border-[#E7E2DA] text-[#57534E]">
                        <th className="py-3 px-3.5 font-bold text-[#1C1917] sticky left-0 bg-[#FAF9F5] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap min-w-[90px]">
                          STT / Cỡ Ảnh
                        </th>
                        <th className="py-3 px-4 text-right font-bold text-[#1C1917] whitespace-nowrap">Giá In Ép Mika</th>
                        <th className="py-3 px-4 text-right text-[#936B34] font-bold whitespace-nowrap">Tùy Chọn Khung Xương Gia Cố</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBE3]">
                      {inEpMikaDataTransformed.filter(r => matchesSearch(r.size)).map((row) => (
                        <tr key={row.size} className={`hover:bg-[#FCFBF8] ${isHighlighted(row.size) ? 'bg-[#FFFDF9]' : ''}`}>
                          <td className="py-2.5 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap">
                            <span className="text-[#936B34] text-[10px] mr-1.5 font-mono">#{row.stt}</span>
                            {row.size}
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold text-[#1C1917] whitespace-nowrap">
                            {formatPrice(row.inEpMika)}
                          </td>
                          <td className="py-2.5 px-4 text-right text-[#936B34] font-medium whitespace-nowrap">
                            {row.khungXuongGiaCo ? (
                              <span className="font-mono text-[#936B34]">+{row.khungXuongGiaCo.toLocaleString('vi-VN')} đ</span>
                            ) : (
                              <span className="text-neutral-400 text-[11px]">Không yêu cầu</span>
                            )}
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
                        <th className="py-3 px-4 text-right font-bold text-[#1C1917] whitespace-nowrap">Khung Hộp K4, K5, K6</th>
                        <th className="py-3 px-4 text-right font-bold text-emerald-800 whitespace-nowrap">Khung Titan 2 (Vàng Hồng / Xanh Rêu)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBE3]">
                      {anh4KDataTransformed.filter(r => matchesSearch(r.size)).map((row) => (
                        <tr key={row.size} className={`hover:bg-[#FCFBF8] ${isHighlighted(row.size) ? 'bg-[#FFFDF9]' : ''}`}>
                          <td className="py-2.5 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap">
                            {row.size}
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold text-[#1C1917] whitespace-nowrap">
                            {formatPrice(row.k4_k6)}
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold text-emerald-800 whitespace-nowrap">
                            {formatPrice(row.titan2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Table for Album Mở Phẳng */}
                {activeTab === 'album-mo-phang' && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAF9F5] border-b border-[#E7E2DA] text-[#57534E]">
                        <th className="py-3 px-3.5 font-bold text-[#1C1917] sticky left-0 bg-[#FAF9F5] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-[#E7E2DA] whitespace-nowrap min-w-[90px]">
                          Kích Thước Album
                        </th>
                        <th className="py-3 px-4 text-left font-bold text-[#936B34] whitespace-nowrap">Số Tờ Tiêu Chuẩn</th>
                        <th className="py-3 px-4 text-right font-bold text-[#1C1917] whitespace-nowrap">Đơn Giá Hoàn Thiện</th>
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

                  if (customDef.type === 'dong-khung') {
                    return (
                      <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                        <thead>
                          <tr className="bg-[#FAF9F5] border-b border-[#E7E2DA] text-[#57534E]">
                            <th className="py-3 px-3.5 font-bold text-[#1C1917] sticky left-0 bg-[#FAF9F5] z-10 border-r border-[#E7E2DA] whitespace-nowrap min-w-[90px]">Cỡ Ảnh</th>
                            <th className="py-3 px-3 text-right whitespace-nowrap">Bo Viền</th>
                            <th className="py-3 px-3 text-right whitespace-nowrap">K0-K3</th>
                            <th className="py-3 px-3 text-right whitespace-nowrap">K4-K6</th>
                            <th className="py-3 px-3 text-right whitespace-nowrap">K7-K9</th>
                            <th className="py-3 px-3 text-right whitespace-nowrap">K10</th>
                            <th className="py-3 px-3 text-right whitespace-nowrap">K11</th>
                            <th className="py-3 px-3 text-right whitespace-nowrap">Titan 1</th>
                            <th className="py-3 px-3 text-right whitespace-nowrap">Titan 2</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0EBE3]">
                          {customRows.map((row) => (
                            <tr key={row.size} className="hover:bg-[#FCFBF8]">
                              <td className="py-2.5 px-3.5 font-bold font-mono text-[#1C1917] sticky left-0 bg-white z-10 border-r border-[#E7E2DA] whitespace-nowrap">{row.size}</td>
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(applyMultiplier(row.boVien, multiplier))}</td>
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(applyMultiplier(row.k0_k3, multiplier))}</td>
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(applyMultiplier(row.k4_k6, multiplier))}</td>
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(applyMultiplier(row.k7_k9, multiplier))}</td>
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(applyMultiplier(row.k10, multiplier))}</td>
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(applyMultiplier(row.k11, multiplier))}</td>
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatPrice(applyMultiplier(row.titan1, multiplier))}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-emerald-800 whitespace-nowrap">{formatPrice(applyMultiplier(row.titan2, multiplier))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  } else {
                    return (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#FAF9F5] border-b border-[#E7E2DA] text-[#57534E]">
                            <th className="py-3 px-3.5 font-bold text-[#1C1917] sticky left-0 bg-[#FAF9F5] z-10 border-r border-[#E7E2DA] whitespace-nowrap min-w-[90px]">Cỡ Ảnh</th>
                            <th className="py-3 px-4 text-right font-bold text-[#1C1917] whitespace-nowrap">Đơn Giá Hoàn Thiện</th>
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
