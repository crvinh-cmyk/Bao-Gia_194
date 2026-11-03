import React, { useState, useMemo } from 'react';
import { useMasterCatalog, DEFAULT_RETAIL_COLUMNS, getDefaultColumnsForTable } from '../services/adminStore';
import { isAllowedRetailCell, defaultRetailPricingData } from '../data/initialData';
import { usePriceMultiplier, applyMultiplier } from '../hooks/usePriceMultiplier';
import { Calculator, Copy, Check, MessageCircle, ChevronDown, Camera } from 'lucide-react';

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
  { id: 'hd-guong-sieu-bong', name: 'HD Gương Siêu Bóng (Khuyến Nghị Dùng)', badge: 'Khuyên Dùng' },
  { id: 'mika-pho-thong', name: 'Mika Phổ Thông' },
  { id: 'in-ep-mika', name: 'In ép Mika & Khung xương Gia Cố' },
  { id: 'anh-4k', name: 'Ảnh 4K Fomex' },
  { id: 'album-mo-phang', name: 'Album Mở Phẳng' }
];

export const MobileQuickQuoter: React.FC<MobileQuickQuoterProps> = ({ zaloTho, lockedTier }) => {
  const catalog = useMasterCatalog();
  const activeTier: AudienceTierId = lockedTier || 'retail';
  const activeTables = catalog.tiers?.[activeTier] || catalog.tiers?.retail || catalog;

  const materialOptions = useMemo(() => {
    if (activeTier === 'retail') {
      const retailCols = DEFAULT_RETAIL_COLUMNS;
      return retailCols.map(c => ({
        id: c.key,
        name: c.key === 'hdBoVien' ? `${c.label} (Khuyến Nghị Dùng)` : c.label,
        badge: c.key === 'hdBoVien' ? 'Khuyên Dùng' : undefined
      }));
    }
    return defaultMaterialOptions;
  }, [activeTier]);

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
      return [{ id: 'price', label: 'Album 10 tờ (20 trang) Mở Phẳng' }];
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
  }, [selectedMaterial, activeTier, activeTables.columnConfigs, catalog.columnConfigs]);

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
      if (!isAllowedRetailCell(normSel, selectedMaterial)) {
        return null;
      }
      const row = (catalog.retailTable && catalog.retailTable.length > 0 ? catalog.retailTable : defaultRetailPricingData)
        .find(r => r.size.replace('x', '*') === normSel);
      if (!row) return null;
      return (row as any)[selectedMaterial] ?? null;
    }

    if (selectedMaterial === 'in-ep-mika') {
      return currentInEpMikaRow?.inEpMika ?? null;
    }

    if (selectedMaterial === 'album-mo-phang') {
      const row = (activeTables.albumMoPhang || []).find(r => r.size.replace('*', 'x') === selectedSize.replace('*', 'x'));
      return row?.price ?? null;
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
      ? (hasKhungXuongGiaCo && currentReinforcedFrameCostFormatted ? ' (Có Khung xương gia cố)' : '') 
      : selectedMaterial === 'album-mo-phang' || activeTier === 'retail' ? '' : ` - ${currentFrameObj?.label}`;
    const text = `Báo giá ${selectedMaterial === 'album-mo-phang' ? 'Album' : 'ảnh'} ${selectedSize}cm: ${currentMaterialObj?.name}${frameLabel}: ${totalPrice.toLocaleString('vi-VN')} đ\nLink bảng giá: ${shareLink}`;
    navigator.clipboard.writeText(text);
    setCopiedCustomer(true);
    setTimeout(() => setCopiedCustomer(false), 2000);
  };

  const generateZaloUrl = () => {
    const shareLink = TIER_TOKEN_URLS[activeTier] || TIER_TOKEN_URLS.retail;
    const frameLabel = selectedMaterial === 'in-ep-mika' 
      ? (hasKhungXuongGiaCo && currentReinforcedFrameCostFormatted ? '\n- Tùy chọn: Khung xương gia cố phía sau (+ ' + currentReinforcedFrameCostFormatted.toLocaleString('vi-VN') + ' đ)' : '') 
      : selectedMaterial === 'album-mo-phang' || activeTier === 'retail' ? '' : `\n- Khung: ${currentFrameObj?.label}`;
    const text = `Tiệm In 194 ơi, mình đặt file:\n- Size: ${selectedSize}\n- Loại: ${currentMaterialObj?.name}${frameLabel}\n- Giá: ${totalPrice?.toLocaleString('vi-VN')} đ\n- Bảng giá: ${shareLink}\nNhờ xưởng duyệt file nhé!`;
    return `https://zalo.me/${zaloTho.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="bang-tinh-gia" className="bg-white border-b border-[#E7E2DA] py-3.5 sm:py-5 px-3 sm:px-6 shadow-sm relative z-20 w-full max-w-full overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 w-full max-w-full">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#1C1917] text-[#E7C184] rounded-lg">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-[#1C1917] tracking-tight">
                Bảng Tính Nhanh Giá Sản Phẩm
              </h2>
              <p className="text-[11px] text-[#78716C]">
                Biểu giá tra cứu tự động theo kích thước & chất liệu
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold bg-[#EFEAE2] text-[#936B34] px-2 py-0.5 rounded border border-[#E7E2DA]">
            XƯỞNG IN 194
          </span>
        </div>

        {/* Form Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          
          {/* Step 1: Select Size */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#57534E] uppercase tracking-wider font-mono">
              1. Kích thước
            </label>
            <div className="relative">
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full h-11 pl-3 pr-8 bg-[#FAF9F5] border border-[#E7E2DA] rounded-xl text-xs font-mono font-bold text-[#1C1917] appearance-none focus:outline-none focus:ring-2 focus:ring-[#936B34]"
              >
                {allAvailableSizes.map(s => (
                  <option key={s.size} value={s.size}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#78716C] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Step 2: Select Material (7 Lines) */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#57534E] uppercase tracking-wider font-mono">
              2. Chất liệu
            </label>
            <div className="relative">
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full h-11 pl-3 pr-8 bg-[#FAF9F5] border border-[#E7E2DA] rounded-xl text-xs font-bold text-[#1C1917] appearance-none focus:outline-none focus:ring-2 focus:ring-[#936B34]"
              >
                {materialOptions.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#78716C] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Step 3: Select Frame */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#57534E] uppercase tracking-wider font-mono">
              3. Loại khung / Quy cách
            </label>
            <div className="relative">
              <select
                value={selectedFrame}
                onChange={(e) => setSelectedFrame(e.target.value)}
                disabled={frameOptions.length <= 1}
                className="w-full h-11 pl-3 pr-8 bg-[#FAF9F5] border border-[#E7E2DA] rounded-xl text-xs font-bold text-[#1C1917] appearance-none focus:outline-none focus:ring-2 focus:ring-[#936B34] disabled:opacity-75"
              >
                {frameOptions.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#78716C] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Option for In Ép Mika */}
        {selectedMaterial === 'in-ep-mika' && currentInEpMikaRow?.khungXuongGiaCo && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 font-semibold text-amber-900 cursor-pointer">
              <input
                type="checkbox"
                checked={hasKhungXuongGiaCo}
                onChange={(e) => setHasKhungXuongGiaCo(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
              />
              <span>Cần gắn thêm Khung Xương Gia Cố phía sau</span>
            </label>
            <span className="font-mono font-bold text-amber-700">
              +{currentReinforcedFrameCostFormatted?.toLocaleString('vi-VN')} đ
            </span>
          </div>
        )}

        {/* Price Output Display */}
        <div className="p-3.5 sm:p-4 bg-[#1C1917] text-white rounded-2xl flex items-center justify-between gap-3 shadow-md">
          <div className="space-y-0.5 text-left">
            <div className="text-[11px] font-mono text-[#E7C184]">
              {selectedSize}cm · {currentMaterialObj?.name}
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              {totalPrice !== null ? `${totalPrice.toLocaleString('vi-VN')} đ` : 'Chưa có giá'}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
