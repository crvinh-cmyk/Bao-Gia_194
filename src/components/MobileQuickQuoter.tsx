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
        name: c.key === 'hdBoVien' ? `${c.label} (Khuyến Nghị Dùng)` : c.label,
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
      return currentInEpMikaRow?.inEpMika ?? null;
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
      ? (hasKhungXuongGiaCo && currentReinforcedFrameCostFormatted ? ' (Có Khung xương gia cố)' : '') 
      : activeTier === 'retail' ? '' : ` - ${currentFrameObj?.label}`;
    const text = `Báo giá ${selectedMaterial === 'album-mo-phang' ? 'Album' : 'ảnh'} ${selectedSize}cm: ${currentMaterialObj?.name}${frameLabel}: ${totalPrice.toLocaleString('vi-VN')} đ\nLink bảng giá: ${shareLink}`;
    navigator.clipboard.writeText(text);
    setCopiedCustomer(true);
    setTimeout(() => setCopiedCustomer(false), 2000);
  };

  const generateZaloUrl = () => {
    const shareLink = TIER_TOKEN_URLS[activeTier] || TIER_TOKEN_URLS.retail;
    const frameLabel = selectedMaterial === 'in-ep-mika' 
      ? (hasKhungXuongGiaCo && currentReinforcedFrameCostFormatted ? '\n- Tùy chọn: Khung xương gia cố phía sau (+ ' + currentReinforcedFrameCostFormatted.toLocaleString('vi-VN') + ' đ)' : '') 
      : activeTier === 'retail' ? '' : `\n- Quy cách: ${currentFrameObj?.label}`;
    const text = `Tiệm In 194 ơi, mình đặt file:\n- Size: ${selectedSize}\n- Loại: ${currentMaterialObj?.name}${frameLabel}\n- Giá: ${totalPrice?.toLocaleString('vi-VN')} đ\n- Bảng giá: ${shareLink}\nNhờ xưởng duyệt file nhé!`;
    return `https://zalo.me/${zaloTho.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="bang-tinh-gia" className="bg-[#F8FAFC] pt-4 pb-2 px-3 sm:px-6 lg:px-8 relative z-20 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto w-full max-w-full">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4 w-full max-w-full">
          
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="border-l-4 border-[#2563EB] pl-3">
              <h2 className="text-lg font-extrabold text-[#1E2A78] tracking-tight flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#2563EB] shrink-0" />
                <span>Bảng Tính Nhanh Giá Sản Phẩm</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Biểu giá tra cứu tự động theo kích thước & chất liệu
              </p>
            </div>

            <span className="text-[11px] font-mono font-bold bg-blue-50 text-[#2563EB] px-2.5 py-1 rounded-lg border border-blue-200/80 tabular-nums">
              XƯỞNG IN 194
            </span>
          </div>

          {/* Form Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            
            {/* Step 1: Select Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono block">
                1. Kích thước
              </label>
              <div className="relative">
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full h-11 pl-3.5 pr-9 bg-white border border-slate-300 hover:border-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-800 tabular-nums appearance-none focus:outline-none transition-all"
                >
                  {sizeOptions.map(s => (
                    <option key={s.size} value={s.size}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Step 2: Select Material */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono block">
                2. Chất liệu
              </label>
              <div className="relative">
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full h-11 pl-3.5 pr-9 bg-white border border-slate-300 hover:border-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 appearance-none focus:outline-none transition-all"
                >
                  {materialOptions.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Step 3: Select Frame */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono block">
                3. Loại khung / Quy cách
              </label>
              <div className="relative">
                <select
                  value={selectedFrame}
                  onChange={(e) => setSelectedFrame(e.target.value)}
                  disabled={frameOptions.length <= 1}
                  className="w-full h-11 pl-3.5 pr-9 bg-white border border-slate-300 hover:border-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 appearance-none focus:outline-none transition-all disabled:opacity-75"
                >
                  {frameOptions.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Option for In Ép Mika */}
          {selectedMaterial === 'in-ep-mika' && currentInEpMikaRow?.khungXuongGiaCo && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 font-semibold text-amber-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasKhungXuongGiaCo}
                  onChange={(e) => setHasKhungXuongGiaCo(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                />
                <span>Cần gắn thêm Khung Xương Gia Cố phía sau</span>
              </label>
              <span className="font-mono font-bold text-amber-700 tabular-nums">
                +{currentReinforcedFrameCostFormatted?.toLocaleString('vi-VN')} đ
              </span>
            </div>
          )}

          {/* Price Output Display */}
          <div className="bg-gradient-to-r from-[#1E2A78] via-[#1E3A8A] to-[#2563EB] text-white rounded-2xl p-5 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <div className="text-xs font-mono text-blue-100 font-semibold tabular-nums">
                {selectedSize}cm · {currentMaterialObj?.name}
                {activeTier !== 'retail' && currentFrameObj ? ` · ${currentFrameObj.label}` : ''}
              </div>
              <div className="text-3xl font-extrabold text-amber-300 font-mono tabular-nums">
                {totalPrice !== null ? `${totalPrice.toLocaleString('vi-VN')} đ` : 'Chưa có giá'}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
