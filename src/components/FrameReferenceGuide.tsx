import React, { useState, useEffect } from 'react';
import { frameReferenceGuide } from '../data/tiemIn194Pricing2026';
import { FrameSpecItem } from '../types';
import { Eye, X, ChevronLeft, ChevronRight, Ruler, Camera, Box, Check, Sparkles } from 'lucide-react';

export const FrameReferenceGuide: React.FC = () => {
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);
  const [activeImageVariantIndex, setActiveImageVariantIndex] = useState<number>(0);
  const [filterType, setFilterType] = useState<'all' | 'real_only'>('all');
  const [cardVariantMap, setCardVariantMap] = useState<Record<string, number>>({});

  // Reset active image variant whenever a new frame modal opens
  useEffect(() => {
    if (activeModalIndex !== null) {
      const activeItem = frameReferenceGuide[activeModalIndex];
      // Sync with card variant if set
      if (activeItem && cardVariantMap[activeItem.code] !== undefined) {
        setActiveImageVariantIndex(cardVariantMap[activeItem.code]);
      } else {
        setActiveImageVariantIndex(0);
      }
    }
  }, [activeModalIndex, cardVariantMap]);

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

  const currentVariant = activeItem?.images && activeItem.images.length > 0 
    ? activeItem.images[activeImageVariantIndex] || activeItem.images[0]
    : null;

  const displayedFrames = filterType === 'real_only'
    ? frameReferenceGuide.filter(f => f.hasRealPhotos)
    : frameReferenceGuide;

  const handleSelectCardVariant = (code: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCardVariantMap(prev => ({ ...prev, [code]: idx }));
  };

  // Quick jump in modal to real photo frames
  const realPhotoFrames = frameReferenceGuide.filter(f => f.hasRealPhotos);

  return (
    <section id="tra-cuu-khung" className="py-6 md:py-12 bg-white border-t border-[#E7E2DA] w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-5 md:space-y-8 w-full max-w-full">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-2 w-full max-w-full">
          <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#936B34]">
            Quy Chuẩn Kỹ Thuật Xưởng In <span className="text-[#FF0000] font-black">194</span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1917] tracking-tight">
            Tra Cứu Mã Khung & Ảnh Mẫu Thực Tế
          </h2>
          <p className="text-xs sm:text-sm text-[#FF0000] font-bold italic">
            màu ảnh khung có thể khác khung thật ở ngoài do sai lệch màu sắc hiển thị
          </p>
          <p className="text-xs sm:text-sm text-[#57534E]">
            Ảnh chụp thực tế 100% tại xưởng Tiệm In 194 cho tất cả các dòng khung: K0, K1, K2, K3, K4, K5, K6, K7-K9, K10, K11 và Titan 1, Titan 2. Bấm vào từng mẫu để xem chi tiết ảnh chụp thật chất lượng cao.
          </p>

          {/* Filter Pills */}
          <div className="pt-3 flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#1C1917] text-[#E7C184] shadow-xs'
                  : 'bg-[#F5EFEB] text-[#57534E] hover:bg-[#EFEAE2]'
              }`}
            >
              Tất Cả Mẫu Khung ({frameReferenceGuide.length})
            </button>
            <button
              onClick={() => setFilterType('real_only')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                filterType === 'real_only'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chỉ Xem Mẫu Có Ảnh Chụp Thật ({frameReferenceGuide.filter(f => f.hasRealPhotos).length})</span>
            </button>
          </div>
        </div>

        {/* Frame Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-full">
          {displayedFrames.map((item) => {
            const originalIndex = frameReferenceGuide.findIndex(f => f.code === item.code);
            const hasReal = item.hasRealPhotos && item.images && item.images.length > 0;
            const activeCardVariantIdx = cardVariantMap[item.code] || 0;
            const previewImg = hasReal ? (item.images![activeCardVariantIdx] || item.images![0]) : null;

            return (
              <div
                key={item.code}
                className="bg-[#FAF9F5] rounded-2xl border border-[#E7E2DA] p-4 sm:p-5 flex flex-col justify-between hover:border-[#936B34] transition-all space-y-3 shadow-xs group w-full max-w-full cursor-pointer"
                onClick={() => {
                  setCardVariantMap(prev => ({ ...prev, [item.code]: activeCardVariantIdx }));
                  setActiveModalIndex(originalIndex);
                }}
              >
                <div>
                  {/* Card Header Badges */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#EFEAE2] gap-1.5 flex-wrap">
                    <span className="font-mono text-xs sm:text-sm font-bold bg-[#1C1917] text-[#E7C184] px-2.5 py-1 rounded shadow-xs shrink-0">
                      {item.code}
                    </span>
                    
                    {hasReal ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                        <Camera className="w-3 h-3 text-emerald-700" />
                        <span>Ảnh Thật {item.images!.length > 1 ? `(${item.images!.length} màu)` : ''}</span>
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-[#936B34] shrink-0">
                        {item.dimensions}
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Preview: DIRECT REAL PHOTO FOR REAL PHOTO FRAMES (TITAN 1, TITAN 2, K4, K5, K6) */}
                  {hasReal && previewImg ? (
                    <div className="mt-3 space-y-2">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-[#EFEAE2]">
                        <img
                          src={encodeURI(previewImg.url)}
                          alt={`${item.name} - ${previewImg.name}`}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          loading="eager"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-2.5 pointer-events-none">
                          <span className="text-[10px] font-medium text-white font-mono bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded flex items-center gap-1">
                            <Camera className="w-3 h-3 text-[#E7C184]" />
                            <span>{previewImg.name}</span>
                          </span>
                        </div>
                      </div>

                      {/* Interactive Color Swatch Selector on Card for multiple photos (Titan 1, Titan 2, K6) */}
                      {item.images!.length > 1 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[10px] font-mono text-[#78716C] mr-0.5">Màu:</span>
                          {item.images!.map((img, vIdx) => (
                            <button
                              key={img.url}
                              onClick={(e) => handleSelectCardVariant(item.code, vIdx, e)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                                activeCardVariantIdx === vIdx
                                  ? 'bg-[#1C1917] text-[#E7C184] ring-1 ring-[#936B34]'
                                  : 'bg-[#EFEAE2] text-[#57534E] hover:bg-[#E5DDCF]'
                              }`}
                            >
                              {img.colorHex && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 inline-block"
                                  style={{ backgroundColor: img.colorHex }}
                                />
                              )}
                              <span>{img.name.split(': ')[1] || img.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* 3D Placeholder for frames without uploaded photos */
                    <div className="mt-3 relative aspect-[4/3] rounded-xl overflow-hidden bg-[#EFEAE2]/60 border border-dashed border-[#D5CDBD] flex flex-col items-center justify-center text-center p-3">
                      <Ruler className="w-7 h-7 text-[#936B34]/70 mb-1" />
                      <span className="text-xs font-bold text-[#1C1917] font-mono">{item.dimensions}</span>
                      <span className="text-[10px] text-[#78716C] mt-0.5">Mô phỏng 3D kỹ thuật</span>
                    </div>
                  )}

                  {/* Text Description */}
                  <div className="pt-2.5 space-y-1.5">
                    <h3 className="font-serif-display font-bold text-sm sm:text-base text-[#1C1917] group-hover:text-[#936B34] transition-colors">
                      {item.name}
                    </h3>
                    <div className="text-[11px] font-mono font-semibold text-[#936B34]">
                      {item.dimensions}
                    </div>
                    <p className="text-xs text-[#57534E] leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#EFEAE2] w-full max-w-full">
                  <div className="text-xs text-[#78716C]">
                    <div>Màu sắc: <strong className="text-[#1C1917] font-normal">{item.variants}</strong></div>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModalIndex(originalIndex);
                    }}
                    className={`w-full h-11 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                      hasReal
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : 'bg-[#EFEAE2] hover:bg-[#E2D9CC] text-[#1C1917]'
                    }`}
                  >
                    {hasReal ? <Camera className="w-4 h-4 text-emerald-200" /> : <Eye className="w-4 h-4 text-[#936B34]" />}
                    <span>{hasReal ? 'Xem Ảnh Chụp Thật Tại Xưởng' : 'Xem Quy Cách Kỹ Thuật'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lightbox Modal with Direct Real Photo View */}
        {activeItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto w-full max-w-full"
            onClick={() => setActiveModalIndex(null)}
          >
            <div
              className="relative w-full max-w-2xl bg-[#1C1917] text-white rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-neutral-800 bg-[#161514] shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="font-mono text-xs font-bold bg-[#E7C184] text-[#1C1917] px-2.5 py-0.5 rounded shrink-0">
                    {activeItem.code}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white truncate">
                    {activeItem.name}
                  </span>
                  {activeItem.hasRealPhotos && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                      <Camera className="w-3 h-3 text-emerald-400" />
                      <span>Ảnh Thật Tại Xưởng</span>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setActiveModalIndex(null)}
                  className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 cursor-pointer shrink-0"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Center Stage: Scrollable Body */}
              <div className="p-4 sm:p-5 space-y-4 select-none overflow-y-auto">
                
                {/* 1. DIRECT REAL PHOTO DISPLAY (NO SVG, NO 3D DIAGRAM FOR REAL PHOTO FRAMES) */}
                {activeItem.hasRealPhotos && currentVariant ? (
                  <div className="space-y-3">
                    
                    {/* Variant Switcher Pills for models with multiple photos (Titan 1, Titan 2, K6, etc.) */}
                    {activeItem.images && activeItem.images.length > 1 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-mono text-neutral-300 font-semibold uppercase tracking-wider flex items-center justify-between">
                          <span>Chọn màu chụp thật:</span>
                          <span className="text-[10px] text-neutral-400 font-normal">
                            {activeImageVariantIndex + 1}/{activeItem.images.length}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {activeItem.images.map((img, vIdx) => (
                            <button
                              key={img.url}
                              onClick={() => {
                                setActiveImageVariantIndex(vIdx);
                                if (activeItem) {
                                  setCardVariantMap(prev => ({ ...prev, [activeItem.code]: vIdx }));
                                }
                              }}
                              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                                activeImageVariantIndex === vIdx
                                  ? 'bg-[#E7C184] text-[#1C1917] ring-2 ring-white shadow-md font-bold'
                                  : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                              }`}
                            >
                              {img.colorHex && (
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-neutral-400 shrink-0 inline-block"
                                  style={{ backgroundColor: img.colorHex }}
                                />
                              )}
                              <span>{img.name}</span>
                              {activeImageVariantIndex === vIdx && (
                                <Check className="w-3.5 h-3.5 text-[#1C1917]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Image Stage: Direct .jpg Photo Display via <img> */}
                    <div className="w-full max-h-[58vh] sm:max-h-[62vh] bg-black/90 rounded-2xl border border-neutral-800 flex items-center justify-center relative overflow-hidden group p-2">
                      <img
                        src={encodeURI(currentVariant.url)}
                        alt={`${activeItem.name} - ${currentVariant.name}`}
                        className="max-h-[54vh] sm:max-h-[58vh] w-auto max-w-full object-contain mx-auto rounded-lg shadow-2xl transition-opacity duration-200"
                        loading="eager"
                      />

                      {/* Tag Overlay */}
                      <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-mono text-white flex items-center gap-1.5 border border-white/10">
                        <Camera className="w-3.5 h-3.5 text-[#E7C184]" />
                        <span className="font-semibold">{currentVariant.name}</span>
                      </div>

                      {/* Left / Right Arrow buttons for Frame browsing */}
                      <button
                        onClick={handlePrev}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 hover:bg-black text-white cursor-pointer active:scale-95 transition-all shadow-md border border-white/10"
                        aria-label="Khung trước"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 hover:bg-black text-white cursor-pointer active:scale-95 transition-all shadow-md border border-white/10"
                        aria-label="Khung tiếp"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quick real photo frames navigation bar */}
                    <div className="p-2.5 bg-neutral-900/90 rounded-xl border border-neutral-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                      <span className="text-[10px] font-mono text-neutral-400 shrink-0 font-semibold uppercase">Xem mẫu khác:</span>
                      {realPhotoFrames.map((rf) => {
                        const targetIdx = frameReferenceGuide.findIndex(f => f.code === rf.code);
                        const isCurrent = activeItem.code === rf.code;
                        return (
                          <button
                            key={rf.code}
                            onClick={() => {
                              setActiveModalIndex(targetIdx);
                              setActiveImageVariantIndex(0);
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap cursor-pointer transition-all ${
                              isCurrent
                                ? 'bg-[#E7C184] text-[#1C1917] font-bold'
                                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                            }`}
                          >
                            {rf.code}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
                      <span>✓ Ảnh chụp thật góc cạnh và mặt trước tại <strong>Tiệm In 194</strong></span>
                      <span className="font-mono text-[#E7C184]">{activeItem.dimensions}</span>
                    </div>
                  </div>
                ) : (
                  /* Fallback placeholder if no image */
                  <div className="w-full aspect-[16/10] bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                    <div className="text-[10px] font-mono text-neutral-400 absolute top-2.5 left-3">
                      MÔ PHỎNG 3D KỸ THUẬT (ĐANG CẬP NHẬT ẢNH THẬT)
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

                    {/* Left / Right Arrow buttons */}
                    <button
                      onClick={handlePrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black text-white cursor-pointer active:scale-95"
                      aria-label="Khung trước"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black text-white cursor-pointer active:scale-95"
                      aria-label="Khung tiếp"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Technical Details */}
                <div className="space-y-2.5 text-xs">
                  <p className="text-neutral-300 leading-relaxed">
                    {activeItem.description}
                  </p>
                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-1">
                    <div className="text-[#E7C184] font-semibold">Phù hợp ứng dụng:</div>
                    <div className="text-neutral-200">{activeItem.suitableFor}</div>
                  </div>
                </div>

                <div className="text-center text-[11px] text-neutral-500 font-mono pt-1">
                  Mã {activeModalIndex! + 1} / {frameReferenceGuide.length} (Vuốt ngón tay sang trái/phải để chuyển mẫu)
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
