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
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
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

  const realPhotoFrames = framesList.filter(f => f.hasRealPhotos);

  const cleanVariantsText = (raw?: string) =>
    (raw || '').replace(/^(màu sắc\s*:\s*)+/i, '').trim() || 'Đa dạng màu chuẩn xưởng';

  return (
    <section id="tra-cuu-khung" className="py-10 md:py-14 bg-[#F8FAFC] border-t border-slate-200 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 md:space-y-8 w-full max-w-full">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-2 w-full max-w-full">
          <div className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#D97706] tabular-nums">
            Catalogue Mẫu Khung · Tiệm In 194
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight text-balance">
            Tra Cứu Mã Khung & Ảnh Mẫu Thực Tế
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Ảnh chụp thực tế 100% tại xưởng cho toàn bộ {framesList.length} mẫu khung. Bấm vào từng thẻ để phóng to góc cạnh và xem đầy đủ thông số kỹ thuật.
          </p>
          <p className="text-[11px] text-[#B45309] font-medium">
            Lưu ý: Màu sắc thực tế có thể chênh lệch nhẹ tùy thiết bị hiển thị màn hình.
          </p>

          {/* Segmented Filter Control */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 border border-slate-200 rounded-xl">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterType === 'all'
                    ? 'bg-[#0F172A] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                Tất Cả ({framesList.length})
              </button>
              <button
                onClick={() => setFilterType('real_only')}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  filterType === 'real_only'
                    ? 'bg-[#0F172A] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                <Camera className={`w-3.5 h-3.5 ${filterType === 'real_only' ? 'text-[#FBBF24]' : 'text-slate-500'}`} />
                <span>Ảnh Chụp Thật ({realPhotoFrames.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Luxury Uniform-Height Frame Catalogue Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full max-w-full">
          {displayedFrames.map((item) => {
            const originalIndex = framesList.findIndex(f => f.code === item.code);
            const hasReal = item.hasRealPhotos && item.images && item.images.length > 0;
            const activeCardVariantIdx = cardVariantMap[item.code] || 0;
            const previewImg = hasReal ? (item.images![activeCardVariantIdx] || item.images![0]) : null;
            const cleanColors = cleanVariantsText(item.variants);

            return (
              <div
                key={item.code}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden group cursor-pointer"
                onClick={() => {
                  setCardVariantMap(prev => ({ ...prev, [item.code]: activeCardVariantIdx }));
                  setActiveModalIndex(originalIndex);
                }}
              >
                {/* Top Full-Bleed 4:3 Image Frame with Minimal Dark Code Label */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-100 shrink-0">
                  {hasReal && previewImg ? (
                    <img
                      key={`${item.code}-${activeCardVariantIdx}-${previewImg.url}`}
                      src={getFrameImageUrl(previewImg.url)}
                      onError={(e) => handleFrameImageError(e, previewImg.url)}
                      alt={`${item.name} - ${previewImg.name}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-300"
                      loading="eager"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center text-center p-4">
                      <Ruler className="w-7 h-7 text-slate-400 mb-1.5" />
                      <span className="text-xs font-bold text-[#0F172A] font-mono tabular-nums">{item.dimensions}</span>
                      <span className="text-[11px] text-slate-500 mt-0.5">Quy cách kỹ thuật</span>
                    </div>
                  )}

                  {/* Single Clean Top-Left Code Badge */}
                  <span className="absolute top-3 left-3 font-mono text-xs font-bold bg-[#0F172A]/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-md tracking-wide tabular-nums shadow-xs">
                    {item.code}
                  </span>

                  {/* Subtle Photo Count on Top-Right when multi-variant */}
                  {hasReal && item.images!.length > 1 && (
                    <span className="absolute top-3 right-3 font-mono text-[10px] font-semibold bg-white/90 backdrop-blur-xs text-[#0F172A] px-2 py-0.5 rounded-md tabular-nums shadow-xs">
                      {item.images!.length} màu
                    </span>
                  )}
                </div>

                {/* Compact Uniform-Height Card Body (Max 3 Spec Lines) */}
                <div className="p-4 flex flex-col flex-1 gap-3">
                  {/* Title + Inline Swatch Dots */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#D97706] transition-colors truncate" title={item.name}>
                      {item.name}
                    </h3>

                    {/* Compact Single-Row Swatch Bar (Fixed height slot for alignment) */}
                    <div className="h-6 flex items-center gap-1.5 overflow-x-auto scrollbar-none" onClick={(e) => e.stopPropagation()}>
                      {hasReal && item.images!.length > 1 ? (
                        item.images!.map((img, vIdx) => (
                          <button
                            key={img.url}
                            type="button"
                            onClick={(e) => handleSelectCardVariant(item.code, vIdx, e)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap ${
                              activeCardVariantIdx === vIdx
                                ? 'bg-[#0F172A] text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {img.colorHex && (
                              <span
                                className="w-2 h-2 rounded-full border border-black/20 shrink-0 inline-block"
                                style={{ backgroundColor: img.colorHex }}
                              />
                            )}
                            <span>{img.name.split(': ')[1] || img.name}</span>
                          </button>
                        ))
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400 truncate">
                          Ảnh chụp mẫu tại xưởng 194
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3 Core Spec Rows (Strict Single-Line Truncation for Identical Row Heights) */}
                  <dl className="space-y-1.5 pt-2.5 border-t border-slate-100 text-[11px]">
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="text-slate-400 shrink-0">Quy cách</dt>
                      <dd className="font-mono font-semibold text-[#0F172A] tabular-nums truncate text-right" title={item.dimensions}>
                        {item.dimensions}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="text-slate-400 shrink-0">Màu sắc</dt>
                      <dd className="font-medium text-slate-700 truncate text-right" title={cleanColors}>
                        {cleanColors}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="text-slate-400 shrink-0">Khuyến nghị</dt>
                      <dd className="font-medium text-slate-600 truncate text-right" title={item.suitableFor}>
                        {item.suitableFor || 'Tất cả khổ ảnh tiêu chuẩn'}
                      </dd>
                    </div>
                  </dl>

                  {/* Bottom Uniform Action Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModalIndex(originalIndex);
                    }}
                    className="mt-auto w-full h-10 px-3 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-[#0F172A] text-[#0F172A] hover:text-white border border-slate-200 hover:border-[#0F172A] transition-colors flex items-center justify-center gap-1.5 cursor-pointer group/btn"
                  >
                    {hasReal ? (
                      <Camera className="w-3.5 h-3.5 text-[#D97706] group-hover/btn:text-[#FBBF24] transition-colors" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-[#D97706] group-hover/btn:text-[#FBBF24] transition-colors" />
                    )}
                    <span>Xem ảnh lớn & thông số</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lightbox Modal — Full Technical Specs & High-Res Studio Photo */}
        {activeItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto w-full max-w-full"
            onClick={handleCloseModal}
          >
            <div
              className="relative w-full max-w-2xl bg-white text-[#0F172A] rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Modal Sticky Header */}
              <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-[#0F172A] text-white shrink-0 gap-2">
                <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                  <span className="font-mono text-xs font-bold bg-[#F59E0B] text-[#0F172A] px-2.5 py-0.5 rounded-md shrink-0 tabular-nums">
                    {activeItem.code}
                  </span>
                  <span className="text-sm font-bold text-white truncate">
                    {activeItem.name}
                  </span>
                </div>

                <button
                  onClick={handleCloseModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 font-semibold text-xs transition-colors cursor-pointer shrink-0"
                  aria-label="Đóng"
                >
                  <span className="hidden sm:inline">Đóng</span>
                  <X className="w-4 h-4 text-[#FBBF24]" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 space-y-4 select-none overflow-y-auto bg-[#F8FAFC]">
                
                {/* Real Photo Viewer */}
                {activeItem.hasRealPhotos && currentVariant ? (
                  <div className="space-y-3">
                    {activeItem.images && activeItem.images.length > 1 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
                          <span>Chọn màu mẫu chụp thật</span>
                          <span className="tabular-nums">
                            {activeImageVariantIndex + 1}/{activeItem.images.length}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {activeItem.images.map((img, vIdx) => (
                            <button
                              key={img.url}
                              onClick={() => {
                                setActiveImageVariantIndex(vIdx);
                                if (activeItem) {
                                  setCardVariantMap(prev => ({ ...prev, [activeItem.code]: vIdx }));
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
                                activeImageVariantIndex === vIdx
                                  ? 'bg-[#0F172A] text-white shadow-xs'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {img.colorHex && (
                                <span
                                  className="w-3 h-3 rounded-full border border-slate-300 shrink-0 inline-block"
                                  style={{ backgroundColor: img.colorHex }}
                                />
                              )}
                              <span>{img.name}</span>
                              {activeImageVariantIndex === vIdx && (
                                <Check className="w-3.5 h-3.5 text-[#FBBF24]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* High-Contrast Dark Stage for True Frame Colors */}
                    <div className="w-full max-h-[56vh] sm:max-h-[60vh] bg-[#0B0F19] rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden p-2">
                      <img
                        key={`${activeItem.code}-${activeImageVariantIndex}-${currentVariant.url}`}
                        src={getFrameImageUrl(currentVariant.url)}
                        onError={(e) => handleFrameImageError(e, currentVariant.url)}
                        alt={`${activeItem.name} - ${currentVariant.name}`}
                        referrerPolicy="no-referrer"
                        className="max-h-[52vh] sm:max-h-[56vh] w-auto max-w-full object-contain mx-auto rounded-lg"
                        loading="eager"
                      />

                      <button
                        onClick={handlePrev}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-[#0F172A]/85 hover:bg-[#F59E0B] text-white hover:text-[#0F172A] cursor-pointer transition-colors shadow-md border border-white/15"
                        aria-label="Khung trước"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-[#0F172A]/85 hover:bg-[#F59E0B] text-white hover:text-[#0F172A] cursor-pointer transition-colors shadow-md border border-white/15"
                        aria-label="Khung tiếp"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quick Frame Switcher Bar */}
                    <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                      <span className="text-[10px] font-mono text-slate-400 shrink-0 font-bold uppercase px-1">
                        Mẫu khác:
                      </span>
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
                            className={`px-2.5 py-1 rounded-md text-[11px] font-mono whitespace-nowrap cursor-pointer transition-colors tabular-nums ${
                              isCurrent
                                ? 'bg-[#0F172A] text-[#FBBF24] font-bold'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium'
                            }`}
                          >
                            {rf.code}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-[16/10] bg-[#0F172A] rounded-xl border border-slate-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                    <div className="my-auto text-center space-y-2">
                      <div className="w-14 h-14 rounded-full border border-[#F59E0B]/40 flex items-center justify-center mx-auto bg-white/5">
                        <Ruler className="w-7 h-7 text-[#FBBF24]" />
                      </div>
                      <div className="text-lg font-bold text-white font-mono tabular-nums">
                        {activeItem.dimensions}
                      </div>
                      <div className="text-xs text-slate-300 max-w-xs mx-auto">
                        {cleanVariantsText(activeItem.variants)}
                      </div>
                    </div>

                    <button
                      onClick={handlePrev}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#F59E0B] text-white hover:text-[#0F172A] cursor-pointer transition-colors"
                      aria-label="Khung trước"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#F59E0B] text-white hover:text-[#0F172A] cursor-pointer transition-colors"
                      aria-label="Khung tiếp"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Complete Technical Specifications & Usage Notes */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                        Thông số bản rộng / độ sâu
                      </div>
                      <div className="font-mono font-bold text-[#0F172A] mt-0.5 tabular-nums">
                        {activeItem.dimensions}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                        Biến thể màu sắc
                      </div>
                      <div className="font-semibold text-[#0F172A] mt-0.5">
                        {cleanVariantsText(activeItem.variants)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-mono text-[#D97706] uppercase font-bold">
                      Chi tiết & Lưu ý kỹ thuật
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {activeItem.description}
                    </p>
                  </div>

                  {activeItem.suitableFor && (
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                        Khổ ảnh & Ứng dụng khuyến nghị
                      </div>
                      <div className="text-slate-700 font-medium">
                        {activeItem.suitableFor}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center text-[11px] text-slate-500 font-mono tabular-nums">
                  Mẫu {activeModalIndex! + 1} / {framesList.length} · Vuốt trái/phải để xem tiếp
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
