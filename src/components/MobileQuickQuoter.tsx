import React, { useState, useMemo } from 'react';
import { 
  inEpMikaPricingData, 
  goLuaDongKhungData, 
  mikaPhoThongData, 
  hdGuongSieuBongKhungData, 
  anh4KPricingData 
} from '../data/tiemIn194Pricing2026';
import { Calculator, Copy, Check, MessageCircle, ChevronDown } from 'lucide-react';

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
  { id: 'in-ep-mika', name: 'In Ép Mika' },
  { id: 'anh-4k', name: 'Ảnh 4K Fomex' }
];

export const MobileQuickQuoter: React.FC<MobileQuickQuoterProps> = ({ zaloTho }) => {
  // Step 1: Kích thước - Mặc định 60x90
  const [selectedSize, setSelectedSize] = useState<string>('60x90');

  // Step 2: Chất liệu - Mặc định HD gương siêu bóng
  const [selectedMaterial, setSelectedMaterial] = useState<string>('hd-guong-sieu-bong');

  // Step 3: Loại khung - Mặc định Chỉ bo viền (Không Khung)
  const [selectedFrame, setSelectedFrame] = useState<string>('boVien');

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

  // Calculate Base Price
  const basePrice = useMemo<number | null>(() => {
    if (selectedMaterial === 'in-ep-mika') {
      const row = inEpMikaPricingData.find(r => r.size.replace('*', 'x') === selectedSize.replace('*', 'x'));
      return row?.inEpMika ?? null;
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
  }, [selectedMaterial, selectedSize, selectedFrame]);

  const totalPrice = basePrice;

  const currentMaterialObj = materialOptions.find(m => m.id === selectedMaterial);
  const currentFrameObj = frameOptions.find(f => f.id === selectedFrame);

  // Copy customer-facing quote
  const handleCopyCustomerQuote = () => {
    if (totalPrice === null) return;
    const frameLabel = selectedMaterial === 'in-ep-mika' ? '' : ` - ${currentFrameObj?.label}`;
    const text = `Báo giá ảnh ${selectedSize}cm: ${currentMaterialObj?.name}${frameLabel}: ${totalPrice.toLocaleString('vi-VN')} đ`;
    navigator.clipboard.writeText(text);
    setCopiedCustomer(true);
    setTimeout(() => setCopiedCustomer(false), 2000);
  };

  const generateZaloUrl = () => {
    const frameLabel = selectedMaterial === 'in-ep-mika' ? '' : `\n- Khung: ${currentFrameObj?.label}`;
    const text = `Tiệm In 194 ơi, mình đặt file:\n- Size: ${selectedSize}\n- Loại: ${currentMaterialObj?.name}${frameLabel}\n- Giá sỉ: ${totalPrice?.toLocaleString('vi-VN')} đ\nNhờ xưởng duyệt file nhé!`;
    return `https://zalo.me/${zaloTho.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="bang-tinh-gia" className="bg-white border-b border-[#E7E2DA] py-5 px-3 sm:px-6 shadow-sm relative z-20">
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] border border-[#E7E2DA] flex items-center justify-center text-[#936B34]">
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

          <span className="text-[10px] font-mono font-bold text-[#936B34] bg-[#FDF8EE] border border-[#F5EFEB] px-2 py-1 rounded-md">
            Gốc Xưởng 2026
          </span>
        </div>

        {/* 3 Step Selectors: Min 44px touch targets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* BƯỚC 1: Chọn Kích Thước (Sắp xếp từ nhỏ đến lớn) */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-[#78716C] mb-1 uppercase tracking-wider">
              1. Cỡ Ảnh:
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
          </div>

        </div>

        {/* Quick Size Chips: Sắp xếp từ nhỏ đến lớn */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] text-[#A8A29E] shrink-0 font-medium">Bấm nhanh:</span>
          {['13x18', '15x21', '20x30', '30x45', '40x60', '50x75', '60x90', '80x120'].map((sz) => (
            <button
              key={sz}
              onClick={() => setSelectedSize(sz)}
              className={`h-7 px-2.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedSize === sz
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-[#F5EFEB] text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>

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
