import React, { useState, useMemo } from 'react';
import { 
  inEpMikaPricingData, 
  goLuaDongKhungData, 
  mikaPhoThongData, 
  hdGuongSieuBongKhungData, 
  anh4KPricingData 
} from '../data/tiemIn194Pricing2026';
import { Calculator, Copy, Check, MessageCircle, ChevronDown, Camera } from 'lucide-react';

interface MobileQuickQuoterProps {
  zaloTho: string;
}

// All standard sizes sorted from smallest to largest, without trailing annotations
const allAvailableSizes = [
  { size: '13x18', label: '13x18' },
  { size: '15x21', label: '15x21' },
  { size: '20x30', label: '20x30' },
  { size: '25x38', label: '25x38' },
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

const materialOptions = [
  { id: 'go-lua', name: 'Gỗ Lụa Đóng Khung' },
  { id: 'hd-guong-sieu-bong', name: 'HD Gương Siêu Bóng', badge: 'Khuyên Dùng' },
  { id: 'mika-pho-thong', name: 'Mika Phổ Thông' },
  { id: 'in-ep-mika', name: 'In ép Mika & Khung xương Gia Cố' },
  { id: 'anh-4k', name: 'Ảnh 4K Fomex' }
];

export const MobileQuickQuoter: React.FC<MobileQuickQuoterProps> = ({ zaloTho }) => {
  // Step 1: Kích thước - Mặc định 60x90
  const [selectedSize, setSelectedSize] = useState<string>('60x90');

  // Step 2: Chất liệu - Mặc định HD gương siêu bóng
  const [selectedMaterial, setSelectedMaterial] = useState<string>('hd-guong-sieu-bong');

  // Step 3: Loại khung - Mặc định Chỉ bo viền (Không Khung)
  const [selectedFrame, setSelectedFrame] = useState<string>('boVien');

  // Option for In Ép Mika large sizes: Khung xương gia cố phía sau
  const [hasKhungXuongGiaCo, setHasKhungXuongGiaCo] = useState<boolean>(false);

  // Copy status
  const [copiedCustomer, setCopiedCustomer] = useState<boolean>(false);

  // Available frame options based on selected material
  const frameOptions = useMemo(() => {
    if (selectedMaterial === 'in-ep-mika') {
      return [
        { id: 'inEpMika', label: 'In Ép Mika' }
      ];
    }

    if (selectedMaterial === 'anh-4k') {
      return [
        { id: 'k4_k6', label: 'Khung Hộp K4, K5, K6' },
        { id: 'titan2', label: 'Khung Titan T2 (Xanh, Hồng)' }
      ];
    }

    // Default for Gỗ Lụa, Mika Phổ Thông, HD Gương Siêu Bóng (Chỉ Bo Viền đặt lên đầu làm mặc định)
    return [
      { id: 'boVien', label: 'Chỉ Bo Viền (Không Khung)' },
      { id: 'k4_k6', label: 'Khung Hộp K4, K5, K6 (Cao 3.5cm)' },
      { id: 'k0_k3', label: 'Khung K0, K1, K2, K3 (Bản 2-3cm)' },
      { id: 'k7_k9', label: 'Khung Hộp K7, K8, K9 (Bản 2.5cm)' },
      { id: 'k10', label: 'Khung K10 (Bản Rộng 5.5cm)' },
      { id: 'k11', label: 'Khung K11 (Bản Đại 8cm)' },
      { id: 'titan1', label: 'Khung Titan T1 (Đen, Bạc)' },
      { id: 'titan2', label: 'Khung Titan T2 (Xanh, Hồng)' }
    ];
  }, [selectedMaterial]);

  // Adjust selected frame if not valid for selected material
  React.useEffect(() => {
    const validIds = frameOptions.map(f => f.id);
    if (!validIds.includes(selectedFrame)) {
      setSelectedFrame(validIds[0]);
    }
  }, [frameOptions, selectedFrame]);

  // Current In Ép Mika row if applicable
  const currentInEpMikaRow = useMemo(() => {
    if (selectedMaterial !== 'in-ep-mika') return null;
    return inEpMikaPricingData.find(r => r.size.replace('*', 'x') === selectedSize.replace('*', 'x'));
  }, [selectedMaterial, selectedSize]);

  // Calculate Base Price
  const basePrice = useMemo<number | null>(() => {
    if (selectedMaterial === 'in-ep-mika') {
      return currentInEpMikaRow?.inEpMika ?? null;
    }

    if (selectedMaterial === 'go-lua') {
      const row = goLuaDongKhungData.find(r => r.size.replace('*', 'x') === selectedSize.replace('*', 'x'));
      if (!row) return null;
      return (row as any)[selectedFrame] ?? null;
    }

    if (selectedMaterial === 'mika-pho-thong') {
      const row = mikaPhoThongData.find(r => r.size.replace('*', 'x') === selectedSize.replace('*', 'x'));
      if (!row) return null;
      return (row as any)[selectedFrame] ?? null;
    }

    if (selectedMaterial === 'hd-guong-sieu-bong') {
      const row = hdGuongSieuBongKhungData.find(r => r.size.replace('*', 'x') === selectedSize.replace('*', 'x'));
      if (!row) return null;
      return (row as any)[selectedFrame] ?? null;
    }

    if (selectedMaterial === 'anh-4k') {
      const row = anh4KPricingData.find(r => r.size.replace('*', 'x') === selectedSize.replace('*', 'x'));
      if (!row) return null;
      return (row as any)[selectedFrame] ?? null;
    }

    return null;
  }, [selectedMaterial, selectedSize, selectedFrame, currentInEpMikaRow]);

  const reinforcedFrameCost = useMemo(() => {
    if (selectedMaterial === 'in-ep-mika' && hasKhungXuongGiaCo && currentInEpMikaRow?.khungXuongGiaCo) {
      return currentInEpMikaRow.khungXuongGiaCo;
    }
    return 0;
  }, [selectedMaterial, hasKhungXuongGiaCo, currentInEpMikaRow]);

  const totalPrice = basePrice !== null ? basePrice + reinforcedFrameCost : null;

  const currentMaterialObj = materialOptions.find(m => m.id === selectedMaterial);
  const currentFrameObj = frameOptions.find(f => f.id === selectedFrame);

  // Copy customer-facing quote
  const handleCopyCustomerQuote = () => {
    if (totalPrice === null) return;
    const frameLabel = selectedMaterial === 'in-ep-mika' 
      ? (hasKhungXuongGiaCo && currentInEpMikaRow?.khungXuongGiaCo ? ' (Có Khung xương gia cố)' : '') 
      : ` - ${currentFrameObj?.label}`;
    const text = `Báo giá ảnh ${selectedSize}cm: ${currentMaterialObj?.name}${frameLabel}: ${totalPrice.toLocaleString('vi-VN')} đ`;
    navigator.clipboard.writeText(text);
    setCopiedCustomer(true);
    setTimeout(() => setCopiedCustomer(false), 2000);
  };

  const generateZaloUrl = () => {
    const frameLabel = selectedMaterial === 'in-ep-mika' 
      ? (hasKhungXuongGiaCo && currentInEpMikaRow?.khungXuongGiaCo ? '\n- Tùy chọn: Khung xương gia cố phía sau (+ ' + currentInEpMikaRow.khungXuongGiaCo.toLocaleString('vi-VN') + ' đ)' : '') 
      : `\n- Khung: ${currentFrameObj?.label}`;
    const text = `Tiệm In 194 ơi, mình đặt file:\n- Size: ${selectedSize}\n- Loại: ${currentMaterialObj?.name}${frameLabel}\n- Giá sỉ: ${totalPrice?.toLocaleString('vi-VN')} đ\nNhờ xưởng duyệt file nhé!`;
    return `https://zalo.me/${zaloTho.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="bang-tinh-gia" className="bg-white border-b border-[#E7E2DA] py-3.5 sm:py-5 px-3 sm:px-6 shadow-sm relative z-20 w-full max-w-full overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 w-full max-w-full">
        
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between w-full max-w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] border border-[#E7E2DA] flex items-center justify-center text-[#936B34] shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#1C1917] tracking-tight">
                Tính Giá Nhanh Cho Thợ
              </h2>
              <p className="text-[11px] text-[#78716C]">
                3 bước chọn &rarr; Có ngay giá sỉ chính xác
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold text-[#936B34] bg-[#FDF8EE] border border-[#F5EFEB] px-2 py-1 rounded-md shrink-0">
            Gốc Xưởng 2026
          </span>
        </div>

        {/* Horizontal Scrollable Size Track - Vuốt ngang thấy ngay 13x18, 15x21 đến khổ lớn */}
        <div className="space-y-1 w-full max-w-full">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#78716C] px-0.5">
            <span className="uppercase tracking-wider flex items-center gap-1">
              <span>👉 Thanh Vuốt Chọn Cỡ Ảnh (từ 13x18 đến 110x180):</span>
            </span>
            <span className="text-[10px] text-[#936B34] font-bold italic shrink-0">Vuốt ngang &rarr;</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 px-2 bg-[#FAF9F5] border border-[#E7E2DA] rounded-xl scrollbar-none touch-pan-x w-full shadow-inner">
            {allAvailableSizes.map((sz) => (
              <button
                key={sz.size}
                onClick={() => setSelectedSize(sz.size)}
                className={`h-9 px-3 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center ${
                  selectedSize === sz.size
                    ? 'bg-[#1C1917] text-[#E7C184] shadow-sm border border-[#1C1917] ring-1 ring-[#936B34]'
                    : 'bg-white text-[#57534E] hover:text-[#1C1917] border border-[#EFEAE2] hover:border-[#D8D1C7]'
                }`}
              >
                {sz.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Step Selectors: Min 44px touch targets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-full">
          
          {/* BƯỚC 1: Chọn Kích Thước (Sắp xếp từ nhỏ đến lớn) */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-[#78716C] mb-1 uppercase tracking-wider">
              1. Danh Sách Cỡ Ảnh:
            </label>
            <div className="relative">
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full h-11 px-3 pr-8 text-xs font-bold text-[#1C1917] bg-[#FAF9F5] border border-[#E7E2DA] rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#936B34] focus:bg-white cursor-pointer shadow-xs"
              >
                {allAvailableSizes.map((sz) => (
                  <option key={sz.size} value={sz.size}>
                    {sz.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#78716C] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* BƯỚC 2: Chọn Chất Liệu */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-[#78716C] mb-1 uppercase tracking-wider">
              2. Chất Liệu:
            </label>
            <div className="relative">
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full h-11 px-3 pr-8 text-xs font-bold text-[#1C1917] bg-[#FAF9F5] border border-[#E7E2DA] rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#936B34] focus:bg-white cursor-pointer shadow-xs"
              >
                {materialOptions.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name}{mat.badge ? ` (${mat.badge})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#78716C] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* BƯỚC 3: Chọn Mã Khung */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-[#78716C] mb-1 uppercase tracking-wider">
              3. Mã Khung / Viền:
            </label>
            <div className="relative">
              <select
                value={selectedFrame}
                onChange={(e) => setSelectedFrame(e.target.value)}
                className="w-full h-11 px-3 pr-8 text-xs font-bold text-[#1C1917] bg-[#FAF9F5] border border-[#E7E2DA] rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#936B34] focus:bg-white cursor-pointer shadow-xs"
              >
                {frameOptions.map((fr) => (
                  <option key={fr.id} value={fr.id}>
                    {fr.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#78716C] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {['k4_k6', 'k10', 'titan1', 'titan2'].includes(selectedFrame) && (
              <a
                href="#tra-cuu-khung"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 mt-1 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Xem ảnh chụp thật mẫu này tại xưởng</span>
              </a>
            )}
          </div>

        </div>

        {/* Khung Xương Gia Cố Option for In Ép Mika large sizes (80x120, 100x150, 110x180) */}
        {selectedMaterial === 'in-ep-mika' && currentInEpMikaRow?.khungXuongGiaCo && (
          <div className="bg-[#FFFDF9] border border-[#E7C184] rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1C1917] select-none">
              <input
                type="checkbox"
                checked={hasKhungXuongGiaCo}
                onChange={(e) => setHasKhungXuongGiaCo(e.target.checked)}
                className="w-4 h-4 rounded border-[#936B34] text-[#936B34] focus:ring-[#936B34] cursor-pointer shrink-0"
              />
              <span>Thêm Khung xương gia cố phía sau (+{currentInEpMikaRow.khungXuongGiaCo.toLocaleString('vi-VN')} đ)</span>
            </label>
            <span className="text-[10px] font-mono font-bold text-[#936B34] bg-[#FDF8EE] px-2 py-0.5 rounded border border-[#E7C184] shrink-0">
              Khổ lớn
            </span>
          </div>
        )}

        {/* Result & Actions Bar */}
        <div className="bg-[#FAF9F5] border border-[#E7E2DA] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Price display */}
          <div className="flex items-baseline justify-between sm:justify-start sm:gap-4">
            <div>
              <span className="text-[11px] text-[#78716C] uppercase font-bold block">
                Giá Sỉ Thợ:
              </span>
              {totalPrice !== null ? (
                <div className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1C1917] font-mono tabular-nums leading-none mt-0.5">
                  {totalPrice.toLocaleString('vi-VN')} <span className="text-sm font-normal text-[#78716C]">đ</span>
                </div>
              ) : (
                <div className="text-xs text-red-600 font-bold mt-0.5">
                  Chưa hỗ trợ cỡ này
                </div>
              )}
            </div>
          </div>

          {/* Touch-Friendly Action Buttons (Min height 44px) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCustomerQuote}
              disabled={totalPrice === null}
              className="flex-1 sm:flex-initial h-11 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#1C1917] bg-[#EFEAE2] hover:bg-[#E2D9CC] active:scale-95 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {copiedCustomer ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4 text-[#936B34]" />}
              <span>{copiedCustomer ? 'Đã Chép Giá!' : 'Copy Báo Khách'}</span>
            </button>

            <a
              href={generateZaloUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial h-11 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#0068FF] hover:bg-[#0052cc] active:scale-95 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>Đặt File Zalo</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};
