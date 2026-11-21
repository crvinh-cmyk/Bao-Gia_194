import React, { useState, useMemo } from 'react';
import { useMasterCatalog, DEFAULT_RETAIL_COLUMNS, DEFAULT_DONG_KHUNG_COLUMNS, getDefaultColumnsForTable } from '../services/adminStore';
import { defaultRetailPricingData } from '../data/initialData';
import { usePriceMultiplier, applyMultiplier } from '../hooks/usePriceMultiplier';
import { AudienceTierId } from '../types/admin';
import { Search } from 'lucide-react';

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
        label: `${7 + idx}. ${cm.name}`
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
      inAnh: applyMultiplier(r.inAnh, multiplier) ?? null,
      inEpMika: applyMultiplier(r.inEpMika, multiplier) ?? null,
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

  const albumMoPhangDataTransformed = useMemo(() => 
    (activeTables.albumMoPhang || []).map(r => ({
      ...r,
      price: applyMultiplier(r.price, multiplier),
    })),
  [activeTables.albumMoPhang, multiplier]);

  const formatPrice = (val: number | null) => {
    if (val === null || val === undefined) return <span className="text-slate-300 font-mono font-normal">—</span>;
    return <span className="font-mono tabular-nums">{val.toLocaleString('vi-VN')} đ</span>;
  };

  const matchesSearch = (size: string) => {
    if (!searchSize.trim()) return true;
    const normQuery = searchSize.toLowerCase().trim().replace(/x/g, '*');
    const normSize = size.toLowerCase().replace(/x/g, '*');
    return normSize.includes(normQuery);
  };

  // Consistent dark charcoal tabular prices for razor-sharp readability
  const priceCellClass =
    'py-3 px-3.5 text-center whitespace-nowrap font-mono tabular-nums font-bold text-[#0F172A] hover:bg-amber-100/70 transition-colors';

  const rowBaseClass =
    'group odd:bg-white even:bg-slate-50/70 hover:bg-amber-50/60 transition-colors';

  const stickySizeCellClass =
    'py-3 px-4 font-mono font-extrabold text-[#0F172A] tabular-nums text-center sticky left-0 z-10 bg-white group-even:bg-slate-50 group-hover:bg-amber-50 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.08)] border-r border-slate-200 whitespace-nowrap transition-colors';

  const stickyHeaderClass =
    'py-3.5 px-4 font-extrabold text-[#0F172A] text-center sticky left-0 bg-slate-100 z-20 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.08)] border-r border-slate-200 whitespace-nowrap min-w-[100px]';

  const tableHeadRowClass =
    'bg-slate-100 border-b border-slate-200 text-[#0F172A] text-[11px] font-extrabold uppercase tracking-wider';

  return (
    <section id="bang-gia-chi-tiet" className="py-6 md:py-10 bg-[#F8FAFC] w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-5 sm:space-y-6 w-full max-w-full">
        
        {/* If activeTier === 'retail', display Single Retail Table view */}
        {activeTier === 'retail' ? (
          <div className="space-y-6">
            
            {/* BẢNG GIÁ KHÁCH LẺ DUY NHẤT 1 BẢNG */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-5 py-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-mono font-bold uppercase text-[#D97706] tracking-[0.12em]">
                    Biểu Giá Niêm Yết Trọn Gói
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight mt-0.5">
                    Biểu Giá In Ảnh & Đóng Khung Hoàn Thiện
                  </h2>
                </div>

                {/* Search size filter */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Lọc kích thước (40x60, 60x90)..."
                    value={searchSize}
                    onChange={(e) => setSearchSize(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 focus:bg-white border border-slate-300 hover:border-slate-400 focus:border-[#D97706] focus:ring-2 focus:ring-[#F59E0B]/20 rounded-xl focus:outline-none text-[#0F172A] font-medium transition-colors"
                  />
                </div>
              </div>

              {/* Mobile Swipe Guide Banner */}
              <div className="md:hidden bg-[#0F172A] text-[#FBBF24] py-2 px-3 flex items-center justify-center gap-2 select-none border-b border-slate-800">
                <span className="text-sm animate-slide-finger">👈</span>
                <span className="font-bold uppercase text-[11px] tracking-wide">
                  Vuốt sang trái để xem thêm mẫu khung
                </span>
              </div>

              <div className="overflow-x-auto">
                {(() => {
                  const retailCols =
                    activeTables.columnConfigs?.retail && activeTables.columnConfigs.retail.length > 0
                      ? activeTables.columnConfigs.retail
                      : catalog.columnConfigs?.retail && catalog.columnConfigs.retail.length > 0
                      ? catalog.columnConfigs.retail
                      : DEFAULT_RETAIL_COLUMNS;
                  const displayRows = (catalog.retailTable && catalog.retailTable.length > 0 
                    ? catalog.retailTable 
                    : defaultRetailPricingData).filter(r => matchesSearch(r.size));

                  return (
                    <table className="w-full text-center text-xs border-collapse min-w-[700px]">
                      <thead>
                        <tr className={tableHeadRowClass}>
                          <th className={stickyHeaderClass}>
                            Cỡ Ảnh
                          </th>
                          {retailCols.map((col) => (
                            <th 
                              key={col.key} 
                              className="py-3.5 px-3.5 text-center whitespace-nowrap font-extrabold text-[#0F172A]"
                            >
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/80">
                        {displayRows.map((row) => (
                          <tr key={row.size} className={rowBaseClass}>
                            <td className={stickySizeCellClass}>
                              {row.size}
                            </td>
                            {retailCols.map((col) => {
                              const cellPrice = row[col.key] !== undefined && row[col.key] !== null && row[col.key] > 0 ? row[col.key] : null;
                              return (
                                <td key={col.key} className={priceCellClass}>
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

            {/* CÁC BẢNG CHẤT LIỆU TÙY CHỈNH DÀNH CHO KHÁCH LẺ (NẾU ADMIN THÊM MỚI) */}
            {customMaterials.map((customDef) => {
              const customRows = ((activeTables.customTables?.[customDef.id] || []) as any[]).filter(r => matchesSearch(r.size));
              if (customRows.length === 0) return null;
              const customCols = activeTables.columnConfigs?.[customDef.id] || catalog.columnConfigs?.[customDef.id] || DEFAULT_DONG_KHUNG_COLUMNS;
              const isFewCols = customDef.type !== 'dong-khung' || customCols.length <= 3;

              return (
                <div key={customDef.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-5 py-4 bg-white border-b border-slate-200">
                    <div className="text-[11px] font-mono font-bold uppercase text-[#D97706] tracking-[0.12em]">
                      Chất Liệu Bổ Sung
                    </div>
                    <h3 className="text-lg font-extrabold text-[#0F172A] mt-0.5">
                      {customDef.name}
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <div className={isFewCols ? "max-w-3xl mx-auto" : ""}>
                      {customDef.type === 'dong-khung' ? (
                        <table className="w-full text-center text-xs border-collapse min-w-[700px]">
                          <thead>
                            <tr className={tableHeadRowClass}>
                              <th className={stickyHeaderClass}>Cỡ Ảnh</th>
                              {customCols.map(col => (
                                <th key={col.key} className="py-3.5 px-3.5 text-center whitespace-nowrap font-extrabold text-[#0F172A]">
                                  {col.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/80">
                            {customRows.map((row) => (
                              <tr key={row.size} className={rowBaseClass}>
                                <td className={stickySizeCellClass}>{row.size}</td>
                                {customCols.map(col => (
                                  <td key={col.key} className={priceCellClass}>
                                    {formatPrice(row[col.key] > 0 ? row[col.key] : null)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <table className="w-full text-center text-xs border-collapse">
                          <thead>
                            <tr className={tableHeadRowClass}>
                              <th className={stickyHeaderClass}>Cỡ Ảnh</th>
                              <th className="py-3.5 px-4 text-center font-extrabold text-[#0F172A] whitespace-nowrap">
                                Đơn Giá Hoàn Thiện
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/80">
                            {customRows.map((row) => {
                              const p = row.boVien ?? row.price ?? row.inEpMika;
                              return (
                                <tr key={row.size} className={rowBaseClass}>
                                  <td className={stickySizeCellClass}>{row.size}</td>
                                  <td className={priceCellClass}>
                                    {formatPrice(p > 0 ? p : null)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        ) : (
          /* STANDARD B2B MULTI-MATERIAL TABLES (FOR STUDIO & FREELANCE) */
          <>
            {/* Header & Controls */}
            <div className="space-y-4 w-full max-w-full">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 w-full max-w-full">
                <div className="space-y-1">
                  <div className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#D97706] tabular-nums">
                    Biểu Giá Niêm Yết 2026 · Tiệm In 194
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                    Biểu Giá Chi Tiết Theo Chất Liệu
                  </h2>
                  <p className="text-xs text-slate-600">
                    Đầy đủ các dòng in ấn & gia công khung chuyên nghiệp — Đơn vị tính: VNĐ
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64 max-w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Lọc cỡ ảnh (60x90, 20x30)..."
                    value={searchSize}
                    onChange={(e) => setSearchSize(e.target.value)}
                    className="w-full max-w-full h-10 pl-9 pr-3 text-xs bg-white border border-slate-300 hover:border-slate-400 focus:border-[#D97706] focus:ring-2 focus:ring-[#F59E0B]/20 rounded-xl focus:outline-none shadow-2xs text-[#0F172A] font-medium transition-colors"
                  />
                </div>
              </div>

              {/* Segmented Pill Material Tabs */}
              <div className="bg-slate-200/70 border border-slate-200 p-1.5 rounded-xl flex flex-wrap gap-1.5 w-full max-w-full">
                {allMaterialTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`cursor-pointer transition-all flex items-center justify-center text-center leading-tight whitespace-nowrap shrink-0 rounded-lg px-3.5 py-2 text-xs sm:text-[13px] ${
                        isActive
                          ? 'bg-[#0F172A] text-white font-bold shadow-sm ring-1 ring-[#F59E0B]/60'
                          : 'bg-white text-slate-700 border border-slate-200/80 hover:border-slate-300 hover:text-[#0F172A] font-semibold'
                      }`}
                    >
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mr-2 shrink-0" aria-hidden="true" />
                      )}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BẢNG HIỂN THỊ CHI TIẾT */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm w-full max-w-full">
              
              {/* Desktop info bar */}
              <div className="hidden md:flex bg-slate-50/90 border-b border-slate-200 px-5 py-2.5 items-center justify-between text-xs text-slate-600 max-w-full">
                <span>
                  Đang xem:{' '}
                  <strong className="text-[#0F172A] font-bold">
                    {activeTier === 'studio' ? 'Biểu giá Sỉ Studio (Gốc)' : 'Biểu giá Thợ Chụp Freelance (+10%)'}
                  </strong>
                </span>
                <span className="font-mono font-semibold text-slate-500 shrink-0 ml-2 tabular-nums">
                  Di chuột vào từng dòng để đối chiếu chuẩn xác · VNĐ
                </span>
              </div>

              {/* Mobile Swipe Guide Banner */}
              <div className="md:hidden bg-[#0F172A] text-[#FBBF24] py-2 px-3 flex items-center justify-center gap-2 select-none border-b border-slate-800">
                <span className="text-sm animate-slide-finger">👈</span>
                <span className="font-bold uppercase text-[11px] tracking-wide">
                  Vuốt sang trái để xem thêm mẫu khung
                </span>
              </div>

              <div className="overflow-x-auto max-w-full relative">
                
                {/* Table for Gỗ Lụa */}
                {activeTab === 'go-lua' && (() => {
                  const cols = activeTables.columnConfigs?.['go-lua'] || catalog.columnConfigs?.['go-lua'] || DEFAULT_DONG_KHUNG_COLUMNS;
                  return (
                    <table className="w-full text-center text-xs border-collapse">
                      <thead>
                        <tr className={tableHeadRowClass}>
                          <th className={stickyHeaderClass}>Cỡ Ảnh</th>
                          {cols.map((col) => (
                            <th key={col.key} className="py-3.5 px-3.5 text-center whitespace-nowrap font-extrabold text-[#0F172A]">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/80">
                        {goLuaDataTransformed.filter(r => matchesSearch(r.size)).map((row: any) => (
                          <tr key={row.size} className={rowBaseClass}>
                            <td className={stickySizeCellClass}>{row.size}</td>
                            {cols.map((col) => (
                              <td key={col.key} className={priceCellClass}>
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
                    <table className="w-full text-center text-xs border-collapse">
                      <thead>
                        <tr className={tableHeadRowClass}>
                          <th className={stickyHeaderClass}>Cỡ Ảnh</th>
                          {cols.map((col) => (
                            <th key={col.key} className="py-3.5 px-3.5 text-center whitespace-nowrap font-extrabold text-[#0F172A]">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/80">
                        {hdGuongDataTransformed.filter(r => matchesSearch(r.size)).map((row: any) => (
                          <tr key={row.size} className={rowBaseClass}>
                            <td className={stickySizeCellClass}>{row.size}</td>
                            {cols.map((col) => (
                              <td key={col.key} className={priceCellClass}>
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
                    <table className="w-full text-center text-xs border-collapse">
                      <thead>
                        <tr className={tableHeadRowClass}>
                          <th className={stickyHeaderClass}>Cỡ Ảnh</th>
                          {cols.map((col) => (
                            <th key={col.key} className="py-3.5 px-3.5 text-center whitespace-nowrap font-extrabold text-[#0F172A]">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/80">
                        {mikaPhoThongDataTransformed.filter(r => matchesSearch(r.size)).map((row: any) => (
                          <tr key={row.size} className={rowBaseClass}>
                            <td className={stickySizeCellClass}>{row.size}</td>
                            {cols.map((col) => (
                              <td key={col.key} className={priceCellClass}>
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
                    <div className="max-w-4xl mx-auto">
                      <table className="w-full text-center text-xs border-collapse">
                        <thead>
                          <tr className={tableHeadRowClass}>
                            <th className={`${stickyHeaderClass} min-w-[125px]`}>
                              STT / Cỡ Ảnh
                            </th>
                            {cols.map((col: any) => (
                              <th
                                key={col.key}
                                className={`py-3.5 px-4 text-center font-extrabold whitespace-nowrap ${
                                  col.key === 'khungXuongGiaCo' ? 'text-[#B45309]' : 'text-[#0F172A]'
                                }`}
                              >
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/80">
                          {inEpMikaDataTransformed.filter(r => matchesSearch(r.size)).map((row: any) => (
                            <tr key={row.size} className={rowBaseClass}>
                              <td className={stickySizeCellClass}>
                                <span className="text-slate-400 text-[10px] mr-1.5 font-mono tabular-nums font-normal">#{row.stt}</span>
                                {row.size}
                              </td>
                              {cols.map((col: any) => (
                                <td
                                  key={col.key}
                                  className={`py-3 px-4 text-center whitespace-nowrap font-mono tabular-nums hover:bg-amber-100/70 transition-colors ${
                                    col.key === 'khungXuongGiaCo'
                                      ? 'text-[#B45309] font-bold'
                                      : 'font-bold text-[#0F172A]'
                                  }`}
                                >
                                  {col.key === 'khungXuongGiaCo' ? (
                                    row.khungXuongGiaCo ? (
                                      <span className="font-mono tabular-nums text-[#B45309] font-bold">
                                        +{row.khungXuongGiaCo.toLocaleString('vi-VN')} đ
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 text-[11px] font-sans font-normal">Không yêu cầu</span>
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
                    </div>
                  );
                })()}

                {/* Table for Cao Cấp 4K */}
                {activeTab === 'anh-4k' && (() => {
                  const cols = activeTables.columnConfigs?.['anh-4k'] || catalog.columnConfigs?.['anh-4k'] || getDefaultColumnsForTable('anh-4k');
                  return (
                    <div className="max-w-3xl mx-auto">
                      <table className="w-full text-center text-xs border-collapse">
                        <thead>
                          <tr className={tableHeadRowClass}>
                            <th className={`${stickyHeaderClass} min-w-[120px]`}>Cỡ Ảnh</th>
                            {cols.map((col: any) => (
                              <th key={col.key} className="py-3.5 px-4 text-center font-extrabold whitespace-nowrap text-[#0F172A]">
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/80">
                          {anh4KDataTransformed.filter(r => matchesSearch(r.size)).map((row: any) => (
                            <tr key={row.size} className={rowBaseClass}>
                              <td className={stickySizeCellClass}>{row.size}</td>
                              {cols.map((col: any) => (
                                <td key={col.key} className={priceCellClass}>
                                  {formatPrice(row[col.key] !== undefined ? applyMultiplier(row[col.key], multiplier) : null)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}

                {/* Table for Album Mở Phẳng */}
                {activeTab === 'album-mo-phang' && (
                  <div className="max-w-3xl mx-auto">
                    <table className="w-full text-center text-xs border-collapse">
                      <thead>
                        <tr className={tableHeadRowClass}>
                          <th className={`${stickyHeaderClass} min-w-[140px]`}>
                            Kích Thước Album
                          </th>
                          <th className="py-3.5 px-4 text-center font-extrabold text-[#0F172A] whitespace-nowrap">
                            Số Tờ Tiêu Chuẩn
                          </th>
                          <th className="py-3.5 px-4 text-center font-extrabold text-[#0F172A] whitespace-nowrap">
                            Đơn Giá Hoàn Thiện
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/80">
                        {albumMoPhangDataTransformed.filter(r => matchesSearch(r.size)).map((row, idx) => (
                          <tr key={`${row.size}-${row.sheets}-${idx}`} className={rowBaseClass}>
                            <td className={stickySizeCellClass}>
                              {row.size}
                            </td>
                            <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-600 text-center whitespace-nowrap">
                              {row.sheets} tờ ({row.sheets * 2} trang)
                            </td>
                            <td className={priceCellClass}>
                              {formatPrice(row.price && row.price > 0 ? row.price : null)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Dynamic Table for Custom Material */}
                {customMaterials.some(m => m.id === activeTab) && (() => {
                  const customDef = customMaterials.find(m => m.id === activeTab)!;
                  const customRows = ((activeTables.customTables?.[customDef.id] || []) as any[]).filter(r => matchesSearch(r.size));
                  const customCols = activeTables.columnConfigs?.[customDef.id] || catalog.columnConfigs?.[customDef.id] || DEFAULT_DONG_KHUNG_COLUMNS;
                  const isFewCols = customCols.length <= 3;

                  if (customDef.type === 'dong-khung') {
                    return (
                      <div className={isFewCols ? "max-w-3xl mx-auto" : ""}>
                        <table className="w-full text-center text-xs border-collapse min-w-[700px]">
                          <thead>
                            <tr className={tableHeadRowClass}>
                              <th className={stickyHeaderClass}>Cỡ Ảnh</th>
                              {customCols.map(col => (
                                <th key={col.key} className="py-3.5 px-3.5 text-center whitespace-nowrap font-extrabold text-[#0F172A]">
                                  {col.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/80">
                            {customRows.map((row) => (
                              <tr key={row.size} className={rowBaseClass}>
                                <td className={stickySizeCellClass}>{row.size}</td>
                                {customCols.map(col => (
                                  <td key={col.key} className={priceCellClass}>
                                    {formatPrice(applyMultiplier(row[col.key], multiplier))}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  } else {
                    return (
                      <div className="max-w-3xl mx-auto">
                        <table className="w-full text-center text-xs border-collapse">
                          <thead>
                            <tr className={tableHeadRowClass}>
                              <th className={stickyHeaderClass}>Cỡ Ảnh</th>
                              <th className="py-3.5 px-4 text-center font-extrabold text-[#0F172A] whitespace-nowrap">
                                Đơn Giá Hoàn Thiện
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/80">
                            {customRows.map((row) => (
                              <tr key={row.size} className={rowBaseClass}>
                                <td className={stickySizeCellClass}>{row.size}</td>
                                <td className={priceCellClass}>
                                  {formatPrice(applyMultiplier(row.boVien ?? row.price ?? row.inEpMika, multiplier))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
