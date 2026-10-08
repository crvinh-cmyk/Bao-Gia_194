import React, { useState } from 'react';
import { frameReferenceGuide } from '../data/tiemIn194Pricing2026';
import { FrameSpecItem } from '../types';
import { Eye, X, ChevronLeft, ChevronRight, CheckCircle2, Ruler, Sparkles } from 'lucide-react';

export const FrameReferenceGuide: React.FC = () => {
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);

  // Touch Swipe Gesture State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  const handleNext = () => {
    if (activeModalIndex === null) return;
    setActiveModalIndex((activeModalIndex + 1) % frameReferenceGuide.length);
  };

  const handlePrev = () => {
    if (activeModalIndex === null) return;
    setActiveModalIndex((activeModalIndex - 1 + frameReferenceGuide.length) % frameReferenceGuide.length);
  };

  const activeItem: FrameSpecItem | null = activeModalIndex !== null ? frameReferenceGuide[activeModalIndex] : null;

  return (
    <section id="tra-cuu-khung" className="py-12 sm:py-16 bg-white border-t border-[#E7E2DA]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-2">
          <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#936B34]">
            Quy Chuẩn Kỹ Thuật Xưởng In 194
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1917] tracking-tight">
            Tra Cứu Mã Khung & Thông Số Bản Rộng
          </h2>
          <p className="text-xs sm:text-sm text-[#57534E]">
            Bấm vào bất kỳ mã khung nào để xem phóng to mặt cắt và hình ảnh thực tế (có hỗ trợ vuốt lướt trên điện thoại).
          </p>
        </div>

        {/* Frame Cards Grid: Min 44px touch targets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {frameReferenceGuide.map((item, idx) => (
            <div
              key={item.code}
              className="bg-[#FAF9F5] rounded-2xl border border-[#E7E2DA] p-4 sm:p-5 flex flex-col justify-between hover:border-[#936B34] transition-all space-y-3 shadow-xs group"
            >
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-[#EFEAE2]">
                  <span className="font-mono text-xs sm:text-sm font-bold bg-[#1C1917] text-[#E7C184] px-2.5 py-1 rounded shadow-xs">
                    {item.code}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#936B34]">
                    {item.dimensions}
                  </span>
                </div>

                <div className="pt-2.5 space-y-1.5">
                  <h3 className="font-serif-display font-bold text-sm sm:text-base text-[#1C1917]">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#57534E] leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#EFEAE2]">
                <div className="text-xs text-[#78716C]">
                  <div>Màu sắc: <strong className="text-[#1C1917] font-normal">{item.variants}</strong></div>
                </div>

                {/* Min 44px touch target button to view closeup */}
                <button
                  onClick={() => setActiveModalIndex(idx)}
                  className="w-full h-11 px-3 text-xs font-bold text-[#1C1917] bg-[#EFEAE2] hover:bg-[#E2D9CC] active:scale-95 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Eye className="w-4 h-4 text-[#936B34]" />
                  <span>Xem Chi Tiết Mẫu Khung</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal with Swipe Gesture Support for Mobile */}
        {activeItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
            onClick={() => setActiveModalIndex(null)}
          >
            <div
              className="relative w-full max-w-lg bg-[#1C1917] text-white rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#161514]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-[#E7C184] text-[#1C1917] px-2.5 py-0.5 rounded">
                    {activeItem.code}
                  </span>
                  <span className="text-sm font-bold text-white">
                    {activeItem.name}
                  </span>
                </div>
                <button
                  onClick={() => setActiveModalIndex(null)}
                  className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 cursor-pointer"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Center Swipe Stage */}
              <div className="p-6 space-y-5 select-none">
                
                {/* Visual Representation of Frame Cross-Section */}
                <div className="w-full aspect-[16/10] bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                  <div className="text-[10px] font-mono text-neutral-400 absolute top-2.5 left-3">
                    MÔ TẢ KỸ THUẬT & MẶT CẮT (VUỐT TRÁI/PHẢI ĐỔI MÃ)
                  </div>

                  <div className="my-auto text-center space-y-2">
                    <div className="w-16 h-16 rounded-full border border-[#E7C184]/40 flex items-center justify-center mx-auto bg-black/40">
                      <Ruler className="w-8 h-8 text-[#E7C184]" />
                    </div>
                    <div className="text-lg font-bold text-white font-mono">
                      {activeItem.dimensions}
                    </div>
                    <div className="text-xs text-neutral-300 max-w-xs mx-auto">
                      {activeItem.variants}
                    </div>
                  </div>

                  {/* Left / Right Arrow buttons (44px target) */}
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-black/60 hover:bg-black text-white cursor-pointer active:scale-95"
                    aria-label="Khung trước"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-black/60 hover:bg-black text-white cursor-pointer active:scale-95"
                    aria-label="Khung tiếp"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-2.5 text-xs">
                  <p className="text-neutral-300 leading-relaxed">
                    {activeItem.description}
                  </p>
                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-1">
                    <div className="text-[#E7C184] font-semibold">Phù hợp ứng dụng:</div>
                    <div className="text-neutral-200">{activeItem.suitableFor}</div>
                  </div>
                </div>

                <div className="text-center text-[11px] text-neutral-500 font-mono">
                  Mã {activeModalIndex! + 1} / {frameReferenceGuide.length} (Hỗ trợ lướt ngón tay sang trái/phải)
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
