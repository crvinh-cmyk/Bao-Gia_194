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
    if (val === null || val === undefined) return <span className="text-[#7a7a7a]/50 font-normal">—</span>;
    return <span className="tabular-nums">{val.toLocaleString('vi-VN')} đ</span>;
  };

  const matchesSearch = (size: string) => {
    if (!searchSize.trim()) return true;
    const normQuery = searchSize.toLowerCase().trim().replace(/x/g, '*');
    const normSize = size.toLowerCase().replace(/x/g, '*');
    return normSize.includes(normQuery);
  };

  const priceCellClass =
    'py-3.5 px-4 text-center whitespace-nowrap tabular-nums text-[14px] font-semibold text-[#1d1d1f] hover:bg-[#0066cc]/[0.08] transition-colors';

  const rowBaseClass =
    'group odd:bg-[#ffffff] even:bg-[#f5f5f7]/65 hover:bg-[#0066cc]/[0.05] transition-colors';

  const stickySizeCellClass =
    'py-3.5 px-4 font-semibold text-[14px] text-[#1d1d1f] tabular-nums text-center sticky left-0 z-10 bg-[#ffffff] group-even:bg-[#f5f5f7] group-hover:bg-[#eef5fc] border-r border-[#e0e0e0] whitespace-nowrap transition-colors';

  const stickyHeaderClass =
    'py-4 px-4 font-semibold text-[#1d1d1f] text-center sticky left-0 bg-[#f5f5f7] z-20 border-r border-[#e0e0e0] whitespace-nowrap min-w-[104px]';

  const tableHeadRowClass =
    'bg-[#f5f5f7] border-b border-[#e0e0e0] text-[#1d1d1f] text-[12px] sm:text-[13px] font-semibold tracking-[-0.12px]';

  return (
    <section
      id="bang-gia-chi-tiet"
      className="py-[48px] sm:py-[64px] md:py-[80px] bg-[#f5f5f7] text-[#1d1d1f] rounded-none w-full max-w-full overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-6 lg:px-8 space-y-8 w-full max-w-full">
        
        {/* If activeTier === 'retail', display Single Retail Table view */}
        {activeTier === 'retail' ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full max-w-full">
              <div className="space-y-2">
                <div className="text-[14px] font-semibold text-[#0066cc] tracking-[-0.224px] leading-[1.29]">
                  Biểu Giá Niêm Yết Trọn Gói
                </div>
                <h2 className="font-display text-[28px] sm:text-[34px] md:text-[40px] font-semibold text-[#1d1d1f] leading-[1.1] tracking-[-0.28px] text-balance">
                  Biểu Giá In Ảnh & Đóng Khung Hoàn Thiện
                </h2>
              </div>

              {/* Apple Pill Search Input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#7a7a7a] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Lọc kích thước (40x60, 60x90)..."
                  value={searchSize}
                  onChange={(e) => setSearchSize(e.target.value)}
                  className="w-full h-[44px] pl-11 pr-5 text-[14px] bg-[#ffffff] border border-black/[0.08] focus:border-[#0071e3] rounded-full text-[#1d1d1f] placeholder:text-[#7a7a7a] font-normal transition-colors"
                />
              </div>
            </div>

            {/* BẢNG GIÁ KHÁCH LẺ DUY NHẤT 1 BẢNG */}
            <div className="bg-[#ffffff] rounded-[18px] border border-[#e0e0e0] overflow-hidden">
              {/* Mobile Swipe Guide Banner */}
              <div className="md:hidden bg-[#272729] text-[#ffffff] py-2.5 px-4 flex items-center justify-center gap-2 select-none">
                <span className="text-sm animate-slide-finger">👈</span>
                <span className="font-normal text-[12px] tracking-[-0.12px] text-[#cccccc]">
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
                    <table className="w-full text-center border-collapse min-w-[700px]">
                      <thead>
                        <tr className={tableHeadRowClass}>
                          <th className={stickyHeaderClass}>Cỡ Ảnh</th>
                          {retailCols.map((col) => (
                            <th 
                              key={col.key} 
                              className="py-4 px-4 text-center whitespace-nowrap font-semibold text-[#1d1d1f]"
                            >
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e0e0e0]/70">
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
                <div key={customDef.id} className="bg-[#ffffff] rounded-[18px] border border-[#e0e0e0] overflow-hidden">
                  <div className="px-6 py-5 bg-[#ffffff] border-b border-[#e0e0e0]">
                    <div className="text-[12px] font-semibold text-[#0066cc] tracking-[-0.12px]">
                      Chất Liệu Bổ Sung
                    </div>
                    <h3 className="font-display text-[21px] font-semibold text-[#1d1d1f] tracking-[0.231px] mt-0.5">
                      {customDef.name}
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <div className={isFewCols ? "max-w-3xl mx-auto" : ""}>
                      {customDef.type === 'dong-khung' ? (
                        <table className="w-full text-center border-collapse min-w-[700px]">
                          <thead>
                            <tr className={tableHeadRowClass}>
                              <th className={stickyHeaderClass}>Cỡ Ảnh</th>
                              {customCols.map(col => (
                                <th key={col.key} className="py-4 px-4 text-center whitespace-nowrap font-semibold text-[#1d1d1f]">
                                  {col.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e0e0e0]/70">
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
                        <table className="w-full text-center border-collapse">
                          <thead>
                            <tr className={tableHeadRowClass}>
                              <th className={stickyHeaderClass}>Cỡ Ảnh</th>
                              <th className="py-4 px-4 text-center font-semibold text-[#1d1d1f] whitespace-nowrap">
                                Đơn Giá Hoàn Thiện
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e0e0e0]/70">
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
            {/* Header & Search */}
            <div className="space-y-6 w-full max-w-full">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full max-w-full">
                <div className="space-y-2">
                  <div className="text-[14px] font-semibold text-[#0066cc] tracking-[-0.224px] leading-[1.29] tabular-nums">
                    Biểu Giá Niêm Yết 2026 · Tiệm In 194
                  </div>
                  <h2 className="font-display text-[28px] sm:text-[34px] md:text-[40px] font-semibold text-[#1d1d1f] leading-[1.1] tracking-[-0.28px] text-balance">
                    Biểu Giá Chi Tiết Theo Chất Liệu
                  </h2>
                  <p className="text-[17px] font-normal text-[#333333] leading-[1.47] tracking-[-0.374px]">
                    Đầy đủ các dòng in ấn và gia công khung chuyên nghiệp — Đơn vị tính: VNĐ.
                  </p>
                </div>

                {/* Apple Pill Search Input */}
                <div className="relative w-full sm:w-72 max-w-full">
                  <Search className="w-4 h-4 text-[#7a7a7a] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Lọc cỡ ảnh (60x90, 20x30)..."
                    value={searchSize}
                    onChange={(e) => setSearchSize(e.target.value)}
                    className="w-full max-w-full h-[44px] pl-11 pr-5 text-[14px] bg-[#ffffff] border border-black/[0.08] focus:border-[#0071e3] rounded-full text-[#1d1d1f] placeholder:text-[#7a7a7a] font-normal transition-colors"
                  />
                </div>
              </div>

              {/* Apple Configurator Option Chips (rounded-full, 2px #0071e3 selected state) */}
              <div className="flex flex-wrap gap-2.5 w-full max-w-full">
                {allMaterialTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`cursor-pointer active:scale-95 transition-all inline-flex items-center justify-center text-center whitespace-nowrap shrink-0 rounded-full px-[18px] py-[10px] text-[14px] leading-[1.29] tracking-[-0.224px] ${
                        isActive
                          ? 'bg-[#ffffff] text-[#0066cc] font-semibold ring-2 ring-[#0071e3] border border-transparent'
                          : 'bg-[#ffffff] text-[#1d1d1f] border border-[#e0e0e0] hover:border-[#7a7a7a] font-normal'
                      }`}
                    >
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BẢNG HIỂN THỊ CHI TIẾT (18px radius, 1px #e0e0e0 hairline, zero shadow) */}
            <div className="bg-[#ffffff] rounded-[18px] border border-[#e0e0e0] overflow-hidden w-full max-w-full">
              
              {/* Desktop info bar */}
              <div className="hidden md:flex bg-[#ffffff] border-b border-[#e0e0e0] px-6 py-3.5 items-center justify-between text-[14px] text-[#333333] max-w-full">
                <span>
                  Đang xem:{' '}
                  <strong className="text-[#1d1d1f] font-semibold">
                    {activeTier === 'studio' ? 'Biểu giá Sỉ Studio (Gốc)' : 'Biểu giá Thợ Chụp Freelance (+10%)'}
                  </strong>
                </span>
                <span className="text-[12px] text-[#7a7a7a] shrink-0 ml-2 tabular-nums">
                  Di chuột vào từng dòng để đối chiếu chuẩn xác · VNĐ
                </span>
              </div>

              {/* Mobile Swipe Guide Banner */}
              <div className="md:hidden bg-[#272729] text-[#ffffff] py-2.5 px-4 flex items-center justify-center gap-2 select-none">
                <span className="text-sm animate-slide-finger">👈</span>
                <span className="font-normal text-[12px] tracking-[-0.12px] text-[#cccccc]">
                  Vuốt sang trái để xem thêm mẫu khung
                </span>
              </div>

              <div key={activeTab} className="overflow-x-auto max-w-full relative animate-tab-panel">
                
                {/* Table for Gỗ Lụa */}
                {activeTab === 'go-lua' && (() => {
                  const cols = activeTables.columnConfigs?.['go-lua'] || catalog.columnConfigs?.['go-lua'] || DEFAULT_DONG_KHUNG_COLUMNS;
                  return (
                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr className={tableHeadRowClass}>
                          <th className={stickyHeaderClass}>Cỡ Ảnh</th>
                          {cols.map((col) => (
                            <th key={col.key} className="py-4 px-4 text-center whitespace-nowrap font-semibold text-[#1d1d1f]">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e0e0e0]/70">
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
                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr className={tableHeadRowClass}>
                          <th className={stickyHeaderClass}>Cỡ Ảnh</th>
                          {cols.map((col) => (
                            <th key={col.key} className="py-4 px-4 text-center whitespace-nowrap font-semibold text-[#1d1d1f]">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e0e0e0]/70">
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
                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr className={tableHeadRowClass}>
                          <th className={stickyHeaderClass}>Cỡ Ảnh</th>
                          {cols.map((col) => (
                            <th key={col.key} className="py-4 px-4 text-center whitespace-nowrap font-semibold text-[#1d1d1f]">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e0e0e0]/70">
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
                      <table className="w-full text-center border-collapse">
                        <thead>
                          <tr className={tableHeadRowClass}>
                            <th className={`${stickyHeaderClass} min-w-[130px]`}>
                              STT / Cỡ Ảnh
                            </th>
                            {cols.map((col: any) => (
                              <th
                                key={col.key}
                                className={`py-4 px-4 text-center font-semibold whitespace-nowrap ${
                                  col.key === 'khungXuongGiaCo' ? 'text-[#0066cc]' : 'text-[#1d1d1f]'
                                }`}
                              >
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e0e0e0]/70">
                          {inEpMikaDataTransformed.filter(r => matchesSearch(r.size)).map((row: any) => (
                            <tr key={row.size} className={rowBaseClass}>
                              <td className={stickySizeCellClass}>
                                <span className="text-[#7a7a7a] text-[12px] mr-1.5 tabular-nums font-normal">#{row.stt}</span>
                                {row.size}
                              </td>
                              {cols.map((col: any) => (
                                <td
                                  key={col.key}
                                  className={`py-3.5 px-4 text-center whitespace-nowrap tabular-nums text-[14px] hover:bg-[#0066cc]/[0.08] transition-colors ${
                                    col.key === 'khungXuongGiaCo'
                                      ? 'text-[#0066cc] font-semibold'
                                      : 'font-semibold text-[#1d1d1f]'
                                  }`}
                                >
                                  {col.key === 'khungXuongGiaCo' ? (
                                    row.khungXuongGiaCo ? (
                                      <span className="tabular-nums text-[#0066cc] font-semibold">
                                        +{row.khungXuongGiaCo.toLocaleString('vi-VN')} đ
                                      </span>
                                    ) : (
                                      <span className="text-[#7a7a7a] text-[12px] font-normal">Không yêu cầu</span>
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
                      <table className="w-full text-center border-collapse">
                        <thead>
                          <tr className={tableHeadRowClass}>
                            <th className={`${stickyHeaderClass} min-w-[120px]`}>Cỡ Ảnh</th>
                            {cols.map((col: any) => (
                              <th key={col.key} className="py-4 px-4 text-center font-semibold whitespace-nowrap text-[#1d1d1f]">
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e0e0e0]/70">
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
                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr className={tableHeadRowClass}>
                          <th className={`${stickyHeaderClass} min-w-[140px]`}>
                            Kích Thước Album
                          </th>
                          <th className="py-4 px-4 text-center font-semibold text-[#1d1d1f] whitespace-nowrap">
                            Số Tờ Tiêu Chuẩn
                          </th>
                          <th className="py-4 px-4 text-center font-semibold text-[#1d1d1f] whitespace-nowrap">
                            Đơn Giá Hoàn Thiện
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e0e0e0]/70">
                        {albumMoPhangDataTransformed.filter(r => matchesSearch(r.size)).map((row, idx) => (
                          <tr key={`${row.size}-${row.sheets}-${idx}`} className={rowBaseClass}>
                            <td className={stickySizeCellClass}>
                              {row.size}
                            </td>
                            <td className="py-3.5 px-4 tabular-nums text-[14px] font-normal text-[#333333] text-center whitespace-nowrap">
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
                        <table className="w-full text-center border-collapse min-w-[700px]">
                          <thead>
                            <tr className={tableHeadRowClass}>
                              <th className={stickyHeaderClass}>Cỡ Ảnh</th>
                              {customCols.map(col => (
                                <th key={col.key} className="py-4 px-4 text-center whitespace-nowrap font-semibold text-[#1d1d1f]">
                                  {col.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e0e0e0]/70">
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
                        <table className="w-full text-center border-collapse">
                          <thead>
                            <tr className={tableHeadRowClass}>
                              <th className={stickyHeaderClass}>Cỡ Ảnh</th>
                              <th className="py-4 px-4 text-center font-semibold text-[#1d1d1f] whitespace-nowrap">
                                Đơn Giá Hoàn Thiện
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e0e0e0]/70">
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
