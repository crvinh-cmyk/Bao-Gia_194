import React, { useState, useMemo } from 'react';
import { useMasterCatalog, DEFAULT_RETAIL_COLUMNS, getDefaultColumnsForTable } from '../services/adminStore';
import { defaultRetailPricingData } from '../data/initialData';
import { usePriceMultiplier, applyMultiplier } from '../hooks/usePriceMultiplier';
import { Copy, Check, MessageCircle, ChevronDown } from 'lucide-react';
import { AudienceTierId } from '../types/admin';

const PRODUCTION_URL = "https://bao-gia194.vercel.app";

const TIER_TOKEN_URLS: Record<AudienceTierId, string> = {
  studio: `${PRODUCTION_URL}/?token=b2b_st99x`,
  freelance: `${PRODUCTION_URL}/?token=pro_f88y`,
  retail: `${PRODUCTION_URL}/?token=rt_k77z`,
};

interface MobileQuickQuoterProps {
  zaloTho: string;
  lockedTier?: AudienceTierId;
}

const allAvailableSizes = [
  { size: '13x18', label: '13x18' },
  { size: '15x21', label: '15x21' },
  { size: '20x20', label: '20x20 (Album)' },
  { size: '20x30', label: '20x30' },
  { size: '25x38', label: '25x38' },
  { size: '30x30', label: '30x30 (Album)' },
  { size: '30x45', label: '30x45' },
  { size: '35x50', label: '35x50' },
  { size: '40x60', label: '40x60' },
  { size: '50x75', label: '50x75' },
  { size: '60x90', label: '60x90' },
  { size: '60x120', label: '60x120' },
  { size: '70x110', label: '70x110' },
  { size: '80x120', label: '80x120' },
  { size: '90x130', label: '90x130' },
  { size: '100x150', label: '100x150' },
  { size: '110x180', label: '110x180' }
];

const defaultMaterialOptions = [
  { id: 'go-lua', name: 'Gỗ Lụa Đóng Khung' },
  { id: 'hd-guong-sieu-bong', name: 'HD Gương Siêu Bóng (Khuyến Nghị)', badge: 'Khuyên Dùng' },
  { id: 'mika-pho-thong', name: 'Mika Phổ Thông' },
  { id: 'in-ep-mika', name: 'In ép Mika & Khung xương Gia Cố' },
  { id: 'anh-4k', name: 'Ảnh 4K Fomex' },
  { id: 'album-mo-phang', name: 'Album Mở Phẳng' }
];

export const MobileQuickQuoter: React.FC<MobileQuickQuoterProps> = ({ zaloTho, lockedTier }) => {
  const catalog = useMasterCatalog();
  const activeTier: AudienceTierId = lockedTier || 'retail';
  const activeTables = catalog.tiers?.[activeTier] || catalog.tiers?.retail || catalog;
  const isRetail = activeTier === 'retail';

  const sizeOptions = useMemo(() => {
    if (activeTier === 'retail') {
      const rows = catalog.retailTable && catalog.retailTable.length > 0 ? catalog.retailTable : defaultRetailPricingData;
      return rows.map(r => {
        const clean = r.size.replace(/\*/g, 'x');
        return { size: clean, label: clean };
      });
    }
    return allAvailableSizes;
  }, [activeTier, catalog.retailTable]);

  const materialOptions = useMemo(() => {
    if (activeTier === 'retail') {
      const retailCols =
        activeTables.columnConfigs?.retail && activeTables.columnConfigs.retail.length > 0
          ? activeTables.columnConfigs.retail
          : catalog.columnConfigs?.retail && catalog.columnConfigs.retail.length > 0
          ? catalog.columnConfigs.retail
          : DEFAULT_RETAIL_COLUMNS;
      return retailCols.map(c => ({
        id: c.key,
        name: c.key === 'hdBoVien' ? `${c.label} (Khuyến Nghị)` : c.label,
        badge: c.key === 'hdBoVien' ? 'Khuyên Dùng' : undefined
      }));
    }
    return defaultMaterialOptions;
  }, [activeTier, activeTables.columnConfigs, catalog.columnConfigs]);

  // Step 1: Kích thước - Mặc định 60x90
  const [selectedSize, setSelectedSize] = useState<string>('60x90');

  // Step 2: Chất liệu - Mặc định HD gương siêu bóng
  const [selectedMaterial, setSelectedMaterial] = useState<string>('hd-guong-sieu-bong');

  // Sync selectedMaterial on activeTier change
  React.useEffect(() => {
    if (activeTier === 'retail') {
      setSelectedMaterial('hdBoVien');
    } else {
      setSelectedMaterial('hd-guong-sieu-bong');
    }
  }, [activeTier]);

  // Step 3: Loại khung
  const [selectedFrame, setSelectedFrame] = useState<string>('boVien');

  // Option for In Ép Mika
  const [hasKhungXuongGiaCo, setHasKhungXuongGiaCo] = useState<boolean>(false);

  // Copy status
  const [copiedCustomer, setCopiedCustomer] = useState<boolean>(false);

  // Available frame options based on selected material
  const frameOptions = useMemo(() => {
    if (activeTier === 'retail') {
      return [{ id: 'standard', label: 'Quy Cách Hoàn Thiện Niêm Yết' }];
    }

    if (selectedMaterial === 'album-mo-phang') {
      const normSel = selectedSize.replace(/x/gi, '*');
      const rows = activeTables.albumMoPhang || [];
      const dynamicSheets = new Set<number>([10, 15, 1]);
      rows.forEach((r) => {
        const s = Number(r.sheets);
        if (s > 0 && r.size.replace(/x/gi, '*').includes(normSel)) {
          dynamicSheets.add(s);
        }
      });
      const ordered = Array.from(dynamicSheets).sort((a, b) => {
        if (a === 1) return 1;
        if (b === 1) return -1;
        return a - b;
      });
      return ordered.map((s) =>
        s === 1
          ? { id: 'sheets_1', label: `Thêm tờ ${normSel} | 1 tờ (2 trang)` }
          : { id: `sheets_${s}`, label: `Album ${s} tờ (${s * 2} trang) Mở Phẳng` }
      );
    }

    const configuredCols =
      activeTables.columnConfigs?.[selectedMaterial] ||
      catalog.columnConfigs?.[selectedMaterial] ||
      getDefaultColumnsForTable(selectedMaterial);

    if (selectedMaterial === 'in-ep-mika') {
      const mainCols = configuredCols.filter(c => c.key !== 'khungXuongGiaCo');
      if (mainCols.length > 0) {
        return mainCols.map(c => ({ id: c.key, label: c.label }));
      }
      return [{ id: 'inEpMika', label: 'In Ép Mika' }];
    }

    if (configuredCols && configuredCols.length > 0) {
      return configuredCols.map(c => ({
        id: c.key,
        label: c.label
      }));
    }

    return [
      { id: 'boVien', label: 'Chỉ Bo Viền (Không Khung)' },
      { id: 'k0_k3', label: 'Khung K0, K1, K2, K3 (Bản 2-3cm)' },
      { id: 'k4_k6', label: 'Khung Hộp K4, K5, K6 (Cao 3.5cm)' },
      { id: 'k7_k9', label: 'Khung Nổi K7, K8, K9 (Bản mặt 1.5cm)' },
      { id: 'k10', label: 'Khung K10 (Bản Rộng 5.5cm)' },
      { id: 'k11', label: 'Khung K11 (Bản Đại 8cm)' },
      { id: 'titan1', label: 'Khung Titan T1 (Đen, Bạc)' },
      { id: 'titan2', label: 'Khung Titan T2 (Xanh, Hồng)' }
    ];
  }, [selectedMaterial, selectedSize, activeTier, activeTables.albumMoPhang, activeTables.columnConfigs, catalog.columnConfigs]);

  // Adjust selected frame if not valid for selected material
  React.useEffect(() => {
    const validIds = frameOptions.map(f => f.id);
    if (!validIds.includes(selectedFrame)) {
      setSelectedFrame(validIds[0]);
    }
  }, [frameOptions, selectedFrame]);

  const multiplier = usePriceMultiplier();

  // Current In Ép Mika row if applicable
  const currentInEpMikaRow = useMemo(() => {
    if (selectedMaterial !== 'in-ep-mika') return null;
    return (activeTables.inEpMika || []).find(r => r.size.replace('*', 'x') === selectedSize.replace('*', 'x'));
  }, [selectedMaterial, selectedSize, activeTables.inEpMika]);

  const currentReinforcedFrameCostFormatted = useMemo(() => {
    if (!currentInEpMikaRow?.khungXuongGiaCo) return null;
    return applyMultiplier(currentInEpMikaRow.khungXuongGiaCo, multiplier);
  }, [currentInEpMikaRow, multiplier]);

  // Calculate Base Price
  const rawBasePrice = useMemo<number | null>(() => {
    if (activeTier === 'retail') {
      if (selectedMaterial === 'passport-3x4') {
        const pass = (catalog.retailPassports || []).find(p => (p.code || p.size).replace('x', '*') === '3*4');
        return pass?.price ?? 50000;
      }
      if (selectedMaterial === 'passport-4x6') {
        const pass = (catalog.retailPassports || []).find(p => (p.code || p.size).replace('x', '*') === '4*6');
        return pass?.price ?? 50000;
      }
      const normSel = selectedSize.replace('x', '*');
      const row = (catalog.retailTable && catalog.retailTable.length > 0 ? catalog.retailTable : defaultRetailPricingData)
        .find(r => r.size.replace('x', '*') === normSel);
      if (!row) return null;
      const val = (row as any)[selectedMaterial];
      return typeof val === 'number' && val > 0 ? val : null;
    }

    if (selectedMaterial === 'in-ep-mika') {
      const val = (currentInEpMikaRow as any)?.[selectedFrame] ?? currentInEpMikaRow?.inEpMika ?? null;
      return typeof val === 'number' && val > 0 ? val : null;
    }

    if (selectedMaterial === 'album-mo-phang') {
      const normSel = selectedSize.replace(/x/gi, '*');
      const rows = activeTables.albumMoPhang || [];
      const sheetsMatch = selectedFrame.match(/^sheets_(\d+)$/);
      const targetSheets = sheetsMatch ? Number(sheetsMatch[1]) : 10;

      if (targetSheets === 1) {
        const isExtraRow = (r: any) => r.sheets === 1 || /th[eê]m\s*t[oơờ]/i.test(r.size || '');
        const sizeSpecificRow = rows.find(
          (r) => isExtraRow(r) && (r.size || '').replace(/x/gi, '*').includes(normSel)
        );
        const fallbackGenericRow = rows.find(
          (r) => isExtraRow(r) && !/\d+\s*[*xX]\s*\d+/.test(r.size || '')
        );
        const row = sizeSpecificRow || fallbackGenericRow;
        return row?.price && row.price > 0 ? row.price : null;
      }

      const row = rows.find(
        (r) =>
          (r.size || '').replace(/x/gi, '*') === normSel &&
          (r.sheets || 10) === targetSheets
      );
      return row?.price && row.price > 0 ? row.price : null;
    }

    if (selectedMaterial === 'hd-pro') {
      const row = (activeTables.hdPro || []).find(r => r.size.replace('*', 'x') === selectedSize.replace('*', 'x'));
      if (!row) return null;
      return (row as any)[selectedFrame] ?? null;
    }

    if (selectedMaterial === 'go-lua') {
      const row = (activeTables.goLua || []).find(r => r.size.replace('*', 'x') === selectedSize.replace('*', 'x'));
      if (!row) return null;
      return (row as any)[selectedFrame] ?? null;
    }

    if (selectedMaterial === 'mika-pho-thong') {
      const row = (activeTables.mikaPhoThong || []).find(r => r.size.replace('*', 'x') === selectedSize.replace('*', 'x'));
      if (!row) return null;
      return (row as any)[selectedFrame] ?? null;
    }

    if (selectedMaterial === 'hd-guong-sieu-bong') {
      const row = (activeTables.hdGuongSieuBong || []).find(r => r.size.replace('*', 'x') === selectedSize.replace('*', 'x'));
      if (!row) return null;
      return (row as any)[selectedFrame] ?? null;
    }

    if (selectedMaterial === 'anh-4k') {
      const row = (activeTables.anh4K || []).find(r => r.size.replace('*', 'x') === selectedSize.replace('*', 'x'));
      if (!row) return null;
      return (row as any)[selectedFrame] ?? null;
    }

    return null;
  }, [activeTier, selectedMaterial, selectedSize, selectedFrame, currentInEpMikaRow, activeTables, catalog.retailTable, catalog.retailPassports]);

  const basePrice = useMemo<number | null>(() => {
    return applyMultiplier(rawBasePrice, multiplier);
  }, [rawBasePrice, multiplier]);

  const rawReinforcedFrameCost = useMemo(() => {
    if (selectedMaterial === 'in-ep-mika' && hasKhungXuongGiaCo && currentInEpMikaRow?.khungXuongGiaCo) {
      return currentInEpMikaRow.khungXuongGiaCo;
    }
    return 0;
  }, [selectedMaterial, hasKhungXuongGiaCo, currentInEpMikaRow]);

  const reinforcedFrameCost = useMemo(() => {
    return applyMultiplier(rawReinforcedFrameCost, multiplier) || 0;
  }, [rawReinforcedFrameCost, multiplier]);

  const totalPrice = basePrice !== null ? basePrice + reinforcedFrameCost : null;

  const currentMaterialObj = materialOptions.find(m => m.id === selectedMaterial);
  const currentFrameObj = frameOptions.find(f => f.id === selectedFrame);

  // Copy customer-facing quote
  const handleCopyCustomerQuote = () => {
    if (totalPrice === null) return;
    const shareLink = TIER_TOKEN_URLS[activeTier] || TIER_TOKEN_URLS.retail;
    const frameLabel = selectedMaterial === 'in-ep-mika'
      ? (hasKhungXuongGiaCo && currentReinforcedFrameCostFormatted ? ` - ${currentFrameObj?.label} (Có Khung xương gia cố)` : ` - ${currentFrameObj?.label}`)
      : activeTier === 'retail' ? '' : ` - ${currentFrameObj?.label}`;
    const text = `Báo giá ${selectedMaterial === 'album-mo-phang' ? 'Album' : 'ảnh'} ${selectedSize}cm: ${currentMaterialObj?.name}${frameLabel}: ${totalPrice.toLocaleString('vi-VN')} đ\nLink bảng giá: ${shareLink}`;
    navigator.clipboard.writeText(text);
    setCopiedCustomer(true);
    setTimeout(() => setCopiedCustomer(false), 2000);
  };

  const generateZaloUrl = () => {
    const shareLink = TIER_TOKEN_URLS[activeTier] || TIER_TOKEN_URLS.retail;
    const frameLabel = selectedMaterial === 'in-ep-mika'
      ? `\n- Quy cách: ${currentFrameObj?.label}` + (hasKhungXuongGiaCo && currentReinforcedFrameCostFormatted ? `\n- Tùy chọn: Khung xương gia cố phía sau (+${currentReinforcedFrameCostFormatted.toLocaleString('vi-VN')} đ)` : '')
      : activeTier === 'retail' ? '' : `\n- Quy cách: ${currentFrameObj?.label}`;
    const text = `Tiệm In 194 ơi, mình đặt file:\n- Size: ${selectedSize}\n- Loại: ${currentMaterialObj?.name}${frameLabel}\n- Giá: ${totalPrice?.toLocaleString('vi-VN')} đ\n- Bảng giá: ${shareLink}\nNhờ xưởng duyệt file nhé!`;
    return `https://zalo.me/${zaloTho.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section
      id="bang-tinh-gia"
      className="bg-[#ffffff] text-[#1d1d1f] py-[48px] sm:py-[64px] md:py-[80px] rounded-none w-full max-w-full overflow-hidden"
    >
      <div className="max-w-[980px] mx-auto px-5 sm:px-6 w-full max-w-full">
        {/* Centered Museum-Gallery Hero Header */}
        <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
          <div className="text-[14px] font-semibold tracking-[-0.224px] leading-[1.29] text-[#0066cc]">
            Tiệm In 194 · Biểu giá 2026
          </div>
          <h1 className="font-display text-[28px] sm:text-[34px] md:text-[48px] lg:text-[56px] font-semibold leading-[1.07] tracking-[-0.28px] text-[#1d1d1f] text-balance">
            {isRetail
              ? 'In Ảnh & Đóng Khung Chuẩn Màu Lab.'
              : 'Biểu Giá In Lab & Gia Công Khung.'}
          </h1>
          <p className="text-[17px] sm:text-[21px] md:text-[24px] font-light leading-[1.4] text-[#333333] max-w-2xl mx-auto text-balance">
            Chọn kích thước, chất liệu và quy cách khung để xem ngay đơn giá hoàn thiện.
          </p>
        </div>

        {/* Store Utility Configurator Card (18px radius, 1px #e0e0e0 border, 24px padding, zero card shadow) */}
        <div className="mt-[32px] sm:mt-[48px] bg-[#ffffff] border border-[#e0e0e0] rounded-[18px] p-6 sm:p-8 space-y-6 w-full max-w-full">
          {/* Card Header */}
          <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-[#e0e0e0]">
            <h2 className="font-display text-[21px] font-semibold leading-[1.19] tracking-[0.231px] text-[#1d1d1f]">
              Bảng Tính Nhanh Giá Sản Phẩm
            </h2>
            <span className="text-[14px] font-normal text-[#7a7a7a] leading-[1.43] tracking-[-0.224px] tabular-nums">
              Đơn vị: VNĐ · Tra cứu tức thì
            </span>
          </div>

          {/* 3-Column Configurator Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {/* Step 1: Select Size */}
            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-[#1d1d1f] leading-[1.29] tracking-[-0.224px] block">
                1. Kích thước (cm)
              </label>
              <div className="relative">
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full h-[48px] pl-4 pr-10 bg-[#ffffff] border border-[#e0e0e0] hover:border-[#7a7a7a] focus:border-[#0071e3] rounded-[11px] text-[17px] font-normal text-[#1d1d1f] tabular-nums appearance-none transition-colors cursor-pointer"
                >
                  {sizeOptions.map(s => (
                    <option key={s.size} value={s.size}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#7a7a7a] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Step 2: Select Material */}
            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-[#1d1d1f] leading-[1.29] tracking-[-0.224px] block">
                2. Chất liệu in
              </label>
              <div className="relative">
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full h-[48px] pl-4 pr-10 bg-[#ffffff] border border-[#e0e0e0] hover:border-[#7a7a7a] focus:border-[#0071e3] rounded-[11px] text-[17px] font-normal text-[#1d1d1f] appearance-none transition-colors cursor-pointer"
                >
                  {materialOptions.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#7a7a7a] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Step 3: Select Frame */}
            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-[#1d1d1f] leading-[1.29] tracking-[-0.224px] block">
                3. Loại khung / Quy cách
              </label>
              <div className="relative">
                <select
                  value={selectedFrame}
                  onChange={(e) => setSelectedFrame(e.target.value)}
                  disabled={frameOptions.length <= 1}
                  className="w-full h-[48px] pl-4 pr-10 bg-[#ffffff] border border-[#e0e0e0] hover:border-[#7a7a7a] focus:border-[#0071e3] rounded-[11px] text-[17px] font-normal text-[#1d1d1f] appearance-none transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-default"
                >
                  {frameOptions.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#7a7a7a] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Option for In Ép Mika */}
          {selectedMaterial === 'in-ep-mika' && currentInEpMikaRow?.khungXuongGiaCo && (
            <div className="px-4 py-3.5 bg-[#f5f5f7] border border-[#e0e0e0] rounded-[11px] flex items-center justify-between gap-3">
              <label className="flex items-center gap-3 text-[14px] font-semibold text-[#1d1d1f] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasKhungXuongGiaCo}
                  onChange={(e) => setHasKhungXuongGiaCo(e.target.checked)}
                  className="w-4 h-4 accent-[#0066cc] rounded cursor-pointer"
                />
                <span>Gắn thêm Khung Xương Gia Cố phía sau</span>
              </label>
              <span className="text-[14px] font-semibold text-[#0066cc] tabular-nums shrink-0">
                +{currentReinforcedFrameCostFormatted?.toLocaleString('vi-VN')} đ
              </span>
            </div>
          )}

          {/* Near-Black Tile 1 (#272729) Result Panel with Crisp White Figure & Action Blue Pill CTAs */}
          <div className="bg-[#272729] text-[#ffffff] rounded-[14px] p-6 sm:px-7 sm:py-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 text-left min-w-0">
              <div className="text-[14px] font-normal text-[#cccccc] leading-[1.43] tracking-[-0.224px] tabular-nums truncate">
                {selectedSize}cm · {currentMaterialObj?.name}
                {activeTier !== 'retail' && currentFrameObj ? ` · ${currentFrameObj.label}` : ''}
              </div>
              <div className="font-display text-[34px] sm:text-[40px] font-semibold text-[#ffffff] leading-[1.1] tracking-[-0.28px] tabular-nums">
                {totalPrice !== null ? `${totalPrice.toLocaleString('vi-VN')} đ` : 'Chưa có giá'}
              </div>
            </div>

            {totalPrice !== null && (
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyCustomerQuote}
                  className="inline-flex items-center justify-center gap-2 px-[22px] py-[11px] rounded-full border border-[#2997ff] text-[#2997ff] hover:bg-[#2997ff]/10 active:scale-95 text-[14px] sm:text-[17px] font-normal leading-none transition-all cursor-pointer whitespace-nowrap"
                >
                  {copiedCustomer ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Sao chép giá</span>
                    </>
                  )}
                </button>

                <a
                  href={generateZaloUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-[22px] py-[11px] rounded-full bg-[#0066cc] hover:bg-[#0071e3] active:scale-95 text-[#ffffff] text-[14px] sm:text-[17px] font-normal leading-none transition-all cursor-pointer whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isRetail ? 'Đặt In Qua Zalo' : 'Gửi File Zalo'}</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
