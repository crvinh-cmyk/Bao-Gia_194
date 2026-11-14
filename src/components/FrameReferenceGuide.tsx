import React, { useState, useEffect, useMemo } from 'react';
import { FrameSpecItem } from '../types';
import { AudienceTierId } from '../types/admin';
import { Eye, X, ChevronLeft, ChevronRight, Ruler, Camera, Check } from 'lucide-react';
import { useModalBackHandler } from '../hooks/useModalBackHandler';
import { getFrameImageUrl, handleFrameImageError } from '../utils/frameImageResolver';
import { useMasterCatalog, getVisibleFramesForTier } from '../services/adminStore';

interface FrameReferenceGuideProps {
  lockedTier?: AudienceTierId | null;
}

export const FrameReferenceGuide: React.FC<FrameReferenceGuideProps> = ({ lockedTier }) => {
  const catalog = useMasterCatalog();
  const framesList = useMemo(() => {
    return getVisibleFramesForTier(catalog, lockedTier);
  }, [catalog, lockedTier]);

  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);
  const [activeImageVariantIndex, setActiveImageVariantIndex] = useState<number>(0);
  const [filterType, setFilterType] = useState<'all' | 'real_only'>('all');
  const [cardVariantMap, setCardVariantMap] = useState<Record<string, number>>({});

  const isModalOpen = activeModalIndex !== null;
  const { handleClose: handleCloseModal } = useModalBackHandler(
    isModalOpen,
    () => setActiveModalIndex(null)
  );

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isModalOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      if (e.key === 'Escape') handleCloseModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, handleCloseModal]);

  // Reset active image variant whenever a new frame modal opens
  useEffect(() => {
    if (activeModalIndex !== null) {
      const activeItem = framesList[activeModalIndex];
      // Sync with card variant if set
      if (activeItem && cardVariantMap[activeItem.code] !== undefined) {
        setActiveImageVariantIndex(cardVariantMap[activeItem.code]);
      } else {
        setActiveImageVariantIndex(0);
      }
    }
  }, [activeModalIndex, cardVariantMap, framesList]);

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
    if (activeModalIndex === null || framesList.length === 0) return;
    setActiveModalIndex((activeModalIndex + 1) % framesList.length);
  };

  const handlePrev = () => {
    if (activeModalIndex === null || framesList.length === 0) return;
    setActiveModalIndex((activeModalIndex - 1 + framesList.length) % framesList.length);
  };

  const activeItem: FrameSpecItem | null = activeModalIndex !== null ? framesList[activeModalIndex] || null : null;

  const currentVariant = activeItem?.images && activeItem.images.length > 0 
    ? activeItem.images[activeImageVariantIndex] || activeItem.images[0]
    : null;

  const displayedFrames = filterType === 'real_only'
    ? framesList.filter(f => f.hasRealPhotos)
    : framesList;

  const handleSelectCardVariant = (code: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCardVariantMap(prev => ({ ...prev, [code]: idx }));
  };

  // Quick jump in modal to real photo frames
  const realPhotoFrames = framesList.filter(f => f.hasRealPhotos);

  return (
    <section id="tra-cuu-khung" className="py-6 md:py-12 bg-[#F8FAFC] border-t border-slate-200/80 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-5 md:space-y-8 w-full max-w-full">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-2 w-full max-w-full">
          <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#2563EB] tabular-nums">
            Quy Chuẩn Kỹ Thuật Xưởng In <span className="text-amber-500 font-black">194</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E2A78] tracking-tight">
            Tra Cứu Mã Khung & Ảnh Mẫu Thực Tế
          </h2>
          <p className="text-xs sm:text-sm text-amber-600 font-bold">
            Lưu ý: Màu ảnh khung có thể khác khung thật ở ngoài do sai lệch màu sắc hiển thị màn hình
          </p>
          <p className="text-xs sm:text-sm text-slate-600">
            Ảnh chụp thực tế 100% tại xưởng Tiệm In 194 cho tất cả {framesList.length} dòng sản phẩm & mẫu khung ({framesList.map(f => f.code).join(', ')}). Bấm vào từng mẫu để xem chi tiết ảnh chụp thật chất lượng cao.
          </p>

          {/* Filter Pills */}
          <div className="pt-3 flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'bg-white text-[#1E2A78] border border-blue-200 hover:bg-blue-50'
              }`}
            >
              Tất Cả Mẫu Khung ({framesList.length})
            </button>
            <button
              onClick={() => setFilterType('real_only')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                filterType === 'real_only'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'bg-white text-[#1E2A78] border border-blue-200 hover:bg-blue-50'
              }`}
            >
              <Camera className={`w-3.5 h-3.5 ${filterType === 'real_only' ? 'text-amber-300' : 'text-emerald-600'}`} />
              <span>Chỉ Xem Mẫu Có Ảnh Chụp Thật ({realPhotoFrames.length})</span>
            </button>
          </div>
        </div>

        {/* Frame Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-full">
          {displayedFrames.map((item) => {
            const originalIndex = framesList.findIndex(f => f.code === item.code);
            const hasReal = item.hasRealPhotos && item.images && item.images.length > 0;
            const activeCardVariantIdx = cardVariantMap[item.code] || 0;
            const previewImg = hasReal ? (item.images![activeCardVariantIdx] || item.images![0]) : null;

            return (
              <div
                key={item.code}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 flex flex-col justify-between hover:border-[#2563EB] transition-all space-y-3 shadow-xs overflow-hidden group w-full max-w-full cursor-pointer"
                onClick={() => {
                  setCardVariantMap(prev => ({ ...prev, [item.code]: activeCardVariantIdx }));
                  setActiveModalIndex(originalIndex);
                }}
              >
                <div>
                  {/* Card Header Badges */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 gap-1.5 flex-wrap">
                    <span className="font-mono text-xs sm:text-sm font-bold bg-[#1E2A78] text-amber-300 px-2.5 py-1 rounded-lg shadow-xs shrink-0 tabular-nums">
                      {item.code}
                    </span>
                    
                    {hasReal ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-500 px-2.5 py-1 rounded-lg shrink-0 shadow-xs">
                        <Camera className="w-3 h-3 text-white" />
                        <span>Ảnh Thật {item.images!.length > 1 ? `(${item.images!.length} màu)` : ''}</span>
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-[#2563EB] shrink-0 tabular-nums">
                        {item.dimensions}
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Preview */}
                  {hasReal && previewImg ? (
                    <div className="mt-3 space-y-2">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img
                          key={`${item.code}-${activeCardVariantIdx}-${previewImg.url}`}
                          src={getFrameImageUrl(previewImg.url)}
                          onError={(e) => handleFrameImageError(e, previewImg.url)}
                          alt={`${item.name} - ${previewImg.name}`}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          loading="eager"
                        />
                      </div>

                      {/* Interactive Color Swatch Selector on Card for multiple photos */}
                      {item.images!.length > 1 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[10px] font-mono text-slate-500 mr-0.5">Màu:</span>
                          {item.images!.map((img, vIdx) => (
                            <button
                              key={img.url}
                              onClick={(e) => handleSelectCardVariant(item.code, vIdx, e)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                                activeCardVariantIdx === vIdx
                                  ? 'bg-[#2563EB] text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-[#2563EB]'
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
                    <div className="mt-3 relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-3">
                      <Ruler className="w-7 h-7 text-[#2563EB]/70 mb-1" />
                      <span className="text-xs font-bold text-[#1E2A78] font-mono tabular-nums">{item.dimensions}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">Mô phỏng 3D kỹ thuật</span>
                    </div>
                  )}

                  {/* Text Description */}
                  <div className="pt-2.5 space-y-1.5">
                    <h3 className="font-extrabold text-sm sm:text-base text-[#1E2A78] group-hover:text-[#2563EB] transition-colors">
                      {item.name}
                    </h3>
                    <div className="text-[11px] font-mono font-bold text-[#2563EB] tabular-nums">
                      {item.dimensions}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 w-full max-w-full">
                  <div className="text-xs text-slate-500">
                    <div>
                      Màu sắc:{' '}
                      <strong className="text-slate-800 font-semibold">
                        {(item.variants || '').replace(/^(màu sắc\s*:\s*)+/i, '').trim()}
                      </strong>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModalIndex(originalIndex);
                    }}
                    className="w-full h-11 px-3 text-xs font-semibold rounded-xl bg-blue-50 hover:bg-[#2563EB] text-[#2563EB] hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 group/btn"
                  >
                    {hasReal ? (
                      <Camera className="w-4 h-4 text-[#2563EB] group-hover/btn:text-white transition-colors" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#2563EB] group-hover/btn:text-white transition-colors" />
                    )}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto w-full max-w-full"
            onClick={handleCloseModal}
          >
            <div
              className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Header - Sticky with Prominent Back/Close Button */}
              <div className="sticky top-0 z-30 flex items-center justify-between p-3.5 sm:p-4 border-b border-white/10 bg-[#1E2A78] text-white shrink-0 gap-2">
                <div className="flex items-center gap-2 overflow-hidden min-w-0">
                  <span className="font-mono text-xs font-bold bg-amber-400 text-[#1E2A78] px-2.5 py-0.5 rounded-lg shrink-0 tabular-nums">
                    {activeItem.code}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-white truncate">
                    {activeItem.name}
                  </span>
                  {activeItem.hasRealPhotos && (
                    <span className="text-[10px] font-mono font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-md shrink-0 hidden sm:flex items-center gap-1">
                      <Camera className="w-3 h-3 text-white" />
                      <span>Ảnh Thật Tại Xưởng</span>
                    </span>
                  )}
                </div>

                {/* Prominent Quay lại / Đóng [✕] button on mobile & desktop */}
                <button
                  onClick={handleCloseModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/20 font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
                  aria-label="Quay lại / Đóng"
                >
                  <ChevronLeft className="w-4 h-4 text-amber-300" />
                  <span className="text-[11px] sm:text-xs">Quay lại / Đóng</span>
                  <X className="w-3.5 h-3.5 text-blue-100" />
                </button>
              </div>

              {/* Center Stage: Scrollable Body */}
              <div className="p-4 sm:p-5 space-y-4 select-none overflow-y-auto bg-[#F8FAFC]">
                
                {/* 1. DIRECT REAL PHOTO DISPLAY */}
                {activeItem.hasRealPhotos && currentVariant ? (
                  <div className="space-y-3">
                    
                    {/* Variant Switcher Pills for models with multiple photos */}
                    {activeItem.images && activeItem.images.length > 1 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-mono text-slate-600 font-bold uppercase tracking-wider flex items-center justify-between">
                          <span>Chọn màu chụp thật:</span>
                          <span className="text-[10px] text-slate-500 font-mono tabular-nums">
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
                                  ? 'bg-[#2563EB] text-white shadow-sm font-bold'
                                  : 'bg-white text-[#1E2A78] border border-blue-200 hover:bg-blue-50'
                              }`}
                            >
                              {img.colorHex && (
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 inline-block"
                                  style={{ backgroundColor: img.colorHex }}
                                />
                              )}
                              <span>{img.name}</span>
                              {activeImageVariantIndex === vIdx && (
                                <Check className="w-3.5 h-3.5 text-amber-300" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Image Stage: Direct .jpg Photo Display via <img> */}
                    <div className="w-full max-h-[58vh] sm:max-h-[62vh] bg-slate-950 rounded-2xl border border-slate-200 flex items-center justify-center relative overflow-hidden group p-2">
                      <img
                        key={`${activeItem.code}-${activeImageVariantIndex}-${currentVariant.url}`}
                        src={getFrameImageUrl(currentVariant.url)}
                        onError={(e) => handleFrameImageError(e, currentVariant.url)}
                        alt={`${activeItem.name} - ${currentVariant.name}`}
                        className="max-h-[54vh] sm:max-h-[58vh] w-auto max-w-full object-contain mx-auto rounded-lg shadow-2xl transition-opacity duration-200"
                        loading="eager"
                      />

                      {/* Left / Right Arrow buttons for Frame browsing */}
                      <button
                        onClick={handlePrev}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-[#1E2A78]/85 hover:bg-[#2563EB] text-white cursor-pointer active:scale-95 transition-all shadow-md border border-white/20"
                        aria-label="Khung trước"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-[#1E2A78]/85 hover:bg-[#2563EB] text-white cursor-pointer active:scale-95 transition-all shadow-md border border-white/20"
                        aria-label="Khung tiếp"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quick real photo frames navigation bar */}
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                      <span className="text-[10px] font-mono text-slate-500 shrink-0 font-bold uppercase">Xem mẫu khác:</span>
                      {realPhotoFrames.map((rf) => {
                        const targetIdx = framesList.findIndex(f => f.code === rf.code);
                        const isCurrent = activeItem.code === rf.code;
                        return (
                          <button
                            key={rf.code}
                            onClick={() => {
                              setActiveModalIndex(targetIdx);
                              setActiveImageVariantIndex(0);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap cursor-pointer transition-all tabular-nums ${
                              isCurrent
                                ? 'bg-[#2563EB] text-white font-bold shadow-xs'
                                : 'bg-slate-100 text-[#1E2A78] hover:bg-blue-50 font-semibold'
                            }`}
                          >
                            {rf.code}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
                      <span>✓ Ảnh chụp thật góc cạnh và mặt trước tại <strong className="text-[#1E2A78]">Tiệm In 194</strong></span>
                      <span className="font-mono font-bold text-[#2563EB] tabular-nums">{activeItem.dimensions}</span>
                    </div>
                  </div>
                ) : (
                  /* Fallback placeholder if no image */
                  <div className="w-full aspect-[16/10] bg-slate-900 rounded-xl border border-slate-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                    <div className="text-[10px] font-mono text-slate-400 absolute top-2.5 left-3">
                      MÔ PHỎNG 3D KỸ THUẬT (ĐANG CẬP NHẬT ẢNH THẬT)
                    </div>

                    <div className="my-auto text-center space-y-2">
                      <div className="w-16 h-16 rounded-full border border-amber-400/40 flex items-center justify-center mx-auto bg-white/10">
                        <Ruler className="w-8 h-8 text-amber-300" />
                      </div>
                      <div className="text-lg font-bold text-white font-mono tabular-nums">
                        {activeItem.dimensions}
                      </div>
                      <div className="text-xs text-slate-300 max-w-xs mx-auto">
                        {activeItem.variants}
                      </div>
                    </div>

                    {/* Left / Right Arrow buttons */}
                    <button
                      onClick={handlePrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-[#1E2A78]/85 hover:bg-[#2563EB] text-white cursor-pointer active:scale-95"
                      aria-label="Khung trước"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-[#1E2A78]/85 hover:bg-[#2563EB] text-white cursor-pointer active:scale-95"
                      aria-label="Khung tiếp"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Technical Details */}
                <div className="space-y-2.5 text-xs">
                  <p className="text-slate-700 leading-relaxed">
                    {activeItem.description}
                  </p>
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                    <div className="text-[#1E2A78] font-bold">Phù hợp ứng dụng:</div>
                    <div className="text-slate-600">{activeItem.suitableFor}</div>
                  </div>
                </div>

                <div className="text-center text-[11px] text-slate-500 font-mono tabular-nums pt-1">
                  Mã {activeModalIndex! + 1} / {framesList.length} (Vuốt ngón tay sang trái/phải để chuyển mẫu)
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
