import React, { useState, useEffect, useMemo } from 'react';
import { FrameSpecItem } from '../types';
import { AudienceTierId } from '../types/admin';
import { X, ChevronLeft, ChevronRight, Ruler, Camera, Check } from 'lucide-react';
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
    <section
      id="tra-cuu-khung"
      className="py-[48px] sm:py-[64px] md:py-[80px] bg-[#ffffff] text-[#1d1d1f] rounded-none w-full max-w-full overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-6 lg:px-8 space-y-10 md:space-y-12 w-full max-w-full">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 w-full max-w-full">
          <div className="text-[14px] font-semibold text-[#0066cc] tracking-[-0.224px] leading-[1.29]">
            Catalogue Mẫu Khung · Tiệm In 194
          </div>
          <h2 className="font-display text-[28px] sm:text-[34px] md:text-[40px] font-semibold text-[#1d1d1f] leading-[1.1] tracking-[-0.28px] text-balance">
            Tra Cứu Mã Khung & Ảnh Mẫu Thực Tế
          </h2>
          <p className="text-[17px] font-normal text-[#333333] max-w-2xl mx-auto leading-[1.47] tracking-[-0.374px]">
            Ảnh chụp thực tế 100% tại xưởng cho toàn bộ {framesList.length} mẫu khung. Bấm vào từng thẻ để phóng to góc cạnh và xem đầy đủ thông số kỹ thuật.
          </p>
          <p className="text-[12px] font-normal text-[#7a7a7a] tracking-[-0.12px]">
            Lưu ý: Màu sắc thực tế có thể chênh lệch nhẹ tùy thiết bị hiển thị màn hình.
          </p>

          {/* Configurator Pill Filter */}
          <div className="pt-3 flex items-center justify-center gap-2.5 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-[18px] py-[10px] rounded-full text-[14px] leading-[1.29] tracking-[-0.224px] transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-[#ffffff] text-[#0066cc] font-semibold ring-2 ring-[#0071e3] border border-transparent'
                  : 'bg-[#ffffff] text-[#1d1d1f] border border-[#e0e0e0] hover:border-[#7a7a7a] font-normal'
              }`}
            >
              Tất Cả ({framesList.length})
            </button>
            <button
              onClick={() => setFilterType('real_only')}
              className={`px-[18px] py-[10px] rounded-full text-[14px] leading-[1.29] tracking-[-0.224px] inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                filterType === 'real_only'
                  ? 'bg-[#ffffff] text-[#0066cc] font-semibold ring-2 ring-[#0071e3] border border-transparent'
                  : 'bg-[#ffffff] text-[#1d1d1f] border border-[#e0e0e0] hover:border-[#7a7a7a] font-normal'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Ảnh Chụp Thật ({realPhotoFrames.length})</span>
            </button>
          </div>
        </div>

        {/* Store Utility Card Grid (18px radius, 1px #e0e0e0 hairline, 24px padding, zero card shadow; product shadow on imagery only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 w-full max-w-full">
          {displayedFrames.map((item) => {
            const originalIndex = framesList.findIndex(f => f.code === item.code);
            const hasReal = item.hasRealPhotos && item.images && item.images.length > 0;
            const activeCardVariantIdx = cardVariantMap[item.code] || 0;
            const previewImg = hasReal ? (item.images![activeCardVariantIdx] || item.images![0]) : null;
            const cleanColors = cleanVariantsText(item.variants);

            return (
              <div
                key={item.code}
                className="bg-[#ffffff] rounded-[18px] border border-[#e0e0e0] hover:border-[#7a7a7a] p-6 transition-colors duration-150 flex flex-col h-full group cursor-pointer"
                onClick={() => {
                  setCardVariantMap(prev => ({ ...prev, [item.code]: activeCardVariantIdx }));
                  setActiveModalIndex(originalIndex);
                }}
              >
                {/* Inline Card Imagery (8px radius, light neutral backdrop, single Apple product-shadow on photograph) */}
                <div className="relative aspect-[4/3] bg-[#f5f5f7] rounded-[8px] overflow-hidden shrink-0 mb-5 flex items-center justify-center">
                  {hasReal && previewImg ? (
                    <img
                      key={`${item.code}-${activeCardVariantIdx}-${previewImg.url}`}
                      src={getFrameImageUrl(previewImg.url)}
                      onError={(e) => handleFrameImageError(e, previewImg.url)}
                      alt={`${item.name} - ${previewImg.name}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-300 apple-product-shadow"
                      loading="eager"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#f5f5f7] flex flex-col items-center justify-center text-center p-4">
                      <Ruler className="w-7 h-7 text-[#7a7a7a] mb-2" />
                      <span className="text-[14px] font-semibold text-[#1d1d1f] tabular-nums">{item.dimensions}</span>
                      <span className="text-[12px] text-[#7a7a7a] mt-0.5">Quy cách kỹ thuật</span>
                    </div>
                  )}

                  {/* Minimal Top-Left Code Label */}
                  <span className="absolute top-2.5 left-2.5 text-[12px] font-semibold bg-[#1d1d1f]/85 backdrop-blur-sm text-[#ffffff] px-2.5 py-1 rounded-[8px] tabular-nums">
                    {item.code}
                  </span>

                  {/* Subtle Photo Count on Top-Right when multi-variant */}
                  {hasReal && item.images!.length > 1 && (
                    <span className="absolute top-2.5 right-2.5 text-[11px] font-normal bg-[#ffffff]/90 backdrop-blur-sm text-[#1d1d1f] px-2 py-0.5 rounded-[5px] tabular-nums">
                      {item.images!.length} màu
                    </span>
                  )}
                </div>

                {/* Uniform-Height Card Body */}
                <div className="flex flex-col flex-1 gap-3.5">
                  <div className="space-y-2">
                    <h3
                      className="text-[17px] font-semibold text-[#1d1d1f] group-hover:text-[#0066cc] leading-[1.24] tracking-[-0.374px] transition-colors truncate"
                      title={item.name}
                    >
                      {item.name}
                    </h3>

                    {/* Single-Row Color Swatch Slot (Fixed Height for Uniform Cards) */}
                    <div className="h-7 flex items-center gap-1.5 overflow-x-auto scrollbar-none" onClick={(e) => e.stopPropagation()}>
                      {hasReal && item.images!.length > 1 ? (
                        item.images!.map((img, vIdx) => (
                          <button
                            key={img.url}
                            type="button"
                            onClick={(e) => handleSelectCardVariant(item.code, vIdx, e)}
                            className={`px-2.5 py-1 rounded-full text-[11px] transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                              activeCardVariantIdx === vIdx
                                ? 'bg-[#ffffff] text-[#0066cc] font-semibold ring-2 ring-[#0071e3]'
                                : 'bg-[#f5f5f7] text-[#333333] hover:bg-[#e0e0e0]/60 font-normal'
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
                        ))
                      ) : (
                        <span className="text-[12px] text-[#7a7a7a] truncate">
                          Ảnh chụp mẫu tại xưởng 194
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3 Core Spec Rows (Strict Single-Line Truncation) */}
                  <dl className="space-y-1.5 pt-3 border-t border-[#f0f0f0] text-[13px] leading-[1.4]">
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="text-[#7a7a7a] shrink-0">Quy cách</dt>
                      <dd className="font-semibold text-[#1d1d1f] tabular-nums truncate text-right" title={item.dimensions}>
                        {item.dimensions}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="text-[#7a7a7a] shrink-0">Màu sắc</dt>
                      <dd className="font-normal text-[#333333] truncate text-right" title={cleanColors}>
                        {cleanColors}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="text-[#7a7a7a] shrink-0">Khuyến nghị</dt>
                      <dd className="font-normal text-[#333333] truncate text-right" title={item.suitableFor}>
                        {item.suitableFor || 'Tất cả khổ ảnh tiêu chuẩn'}
                      </dd>
                    </div>
                  </dl>

                  {/* Apple Pearl Button Capsule (11px radius, #fafafc fill, 3px #f0f0f0 ring, active:scale-95) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModalIndex(originalIndex);
                    }}
                    className="mt-auto w-full py-[9px] px-[14px] text-[14px] font-normal leading-[1.29] tracking-[-0.224px] rounded-[11px] bg-[#fafafc] text-[#0066cc] border-[3px] border-[#f0f0f0] hover:bg-[#f5f5f7] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Xem ảnh lớn & thông số</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lightbox Modal — Pure Black / Surface Tile 3 Media Stage + Circular Translucent Controls */}
        {activeItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#000000]/80 backdrop-blur-md overflow-y-auto w-full max-w-full"
            onClick={handleCloseModal}
          >
            <div
              className="relative w-full max-w-2xl bg-[#f5f5f7] text-[#1d1d1f] rounded-[18px] border border-[#e0e0e0] overflow-hidden flex flex-col my-auto max-h-[94vh]"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Modal Sticky Header */}
              <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 border-b border-[#e0e0e0] bg-[#ffffff] shrink-0 gap-3">
                <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                  <span className="text-[12px] font-semibold bg-[#1d1d1f] text-[#ffffff] px-2.5 py-1 rounded-[8px] shrink-0 tabular-nums">
                    {activeItem.code}
                  </span>
                  <span className="font-display text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.374px] truncate">
                    {activeItem.name}
                  </span>
                </div>

                <button
                  onClick={handleCloseModal}
                  className="w-[36px] h-[36px] flex items-center justify-center rounded-full bg-[#f5f5f7] hover:bg-[#e0e0e0] text-[#1d1d1f] active:scale-95 transition-all cursor-pointer shrink-0"
                  aria-label="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 space-y-5 select-none overflow-y-auto bg-[#f5f5f7]">
                
                {/* Real Photo Viewer */}
                {activeItem.hasRealPhotos && currentVariant ? (
                  <div className="space-y-4">
                    {activeItem.images && activeItem.images.length > 1 && (
                      <div className="space-y-2">
                        <div className="text-[12px] text-[#7a7a7a] font-semibold flex items-center justify-between">
                          <span>Chọn màu mẫu chụp thật</span>
                          <span className="tabular-nums">
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
                              className={`px-3.5 py-2 rounded-full text-[13px] transition-all active:scale-95 cursor-pointer flex items-center gap-2 ${
                                activeImageVariantIndex === vIdx
                                  ? 'bg-[#ffffff] text-[#0066cc] font-semibold ring-2 ring-[#0071e3]'
                                  : 'bg-[#ffffff] text-[#1d1d1f] border border-[#e0e0e0] hover:border-[#7a7a7a] font-normal'
                              }`}
                            >
                              {img.colorHex && (
                                <span
                                  className="w-3 h-3 rounded-full border border-black/20 shrink-0 inline-block"
                                  style={{ backgroundColor: img.colorHex }}
                                />
                              )}
                              <span>{img.name}</span>
                              {activeImageVariantIndex === vIdx && (
                                <Check className="w-3.5 h-3.5 text-[#0066cc]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pure Black / Tile 3 Stage with 44x44 Circular Translucent Controls */}
                    <div className="w-full max-h-[56vh] sm:max-h-[60vh] bg-[#252527] rounded-[12px] flex items-center justify-center relative overflow-hidden p-3">
                      <img
                        key={`${activeItem.code}-${activeImageVariantIndex}-${currentVariant.url}`}
                        src={getFrameImageUrl(currentVariant.url)}
                        onError={(e) => handleFrameImageError(e, currentVariant.url)}
                        alt={`${activeItem.name} - ${currentVariant.name}`}
                        referrerPolicy="no-referrer"
                        className="max-h-[52vh] sm:max-h-[56vh] w-auto max-w-full object-contain mx-auto rounded-[8px] apple-product-shadow"
                        loading="eager"
                      />

                      <button
                        onClick={handlePrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-[44px] h-[44px] flex items-center justify-center rounded-full bg-[#d2d2d7]/65 hover:bg-[#d2d2d7]/85 backdrop-blur-md text-[#1d1d1f] active:scale-95 cursor-pointer transition-all"
                        aria-label="Khung trước"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-[44px] h-[44px] flex items-center justify-center rounded-full bg-[#d2d2d7]/65 hover:bg-[#d2d2d7]/85 backdrop-blur-md text-[#1d1d1f] active:scale-95 cursor-pointer transition-all"
                        aria-label="Khung tiếp"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quick Frame Switcher Bar */}
                    <div className="p-2.5 bg-[#ffffff] rounded-[12px] border border-[#e0e0e0] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                      <span className="text-[12px] text-[#7a7a7a] shrink-0 font-semibold px-1.5">
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
                            className={`px-3 py-1.5 rounded-full text-[12px] whitespace-nowrap cursor-pointer active:scale-95 transition-all tabular-nums ${
                              isCurrent
                                ? 'bg-[#0066cc] text-[#ffffff] font-semibold'
                                : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e0e0e0] font-normal'
                            }`}
                          >
                            {rf.code}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-[16/10] bg-[#252527] rounded-[12px] flex flex-col items-center justify-center p-5 relative overflow-hidden">
                    <div className="my-auto text-center space-y-2">
                      <div className="w-14 h-14 rounded-full border border-white/15 flex items-center justify-center mx-auto bg-white/5">
                        <Ruler className="w-6 h-6 text-[#2997ff]" />
                      </div>
                      <div className="text-[21px] font-semibold text-[#ffffff] tabular-nums">
                        {activeItem.dimensions}
                      </div>
                      <div className="text-[14px] text-[#cccccc] max-w-xs mx-auto">
                        {cleanVariantsText(activeItem.variants)}
                      </div>
                    </div>

                    <button
                      onClick={handlePrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-[44px] h-[44px] flex items-center justify-center rounded-full bg-[#d2d2d7]/65 hover:bg-[#d2d2d7]/85 backdrop-blur-md text-[#1d1d1f] active:scale-95 cursor-pointer transition-all"
                      aria-label="Khung trước"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-[44px] h-[44px] flex items-center justify-center rounded-full bg-[#d2d2d7]/65 hover:bg-[#d2d2d7]/85 backdrop-blur-md text-[#1d1d1f] active:scale-95 cursor-pointer transition-all"
                      aria-label="Khung tiếp"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Complete Technical Specifications & Usage Notes */}
                <div className="bg-[#ffffff] rounded-[18px] border border-[#e0e0e0] p-5 space-y-4 text-[14px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#f0f0f0]">
                    <div>
                      <div className="text-[12px] text-[#7a7a7a] font-semibold">
                        Thông số bản rộng / độ sâu
                      </div>
                      <div className="font-semibold text-[#1d1d1f] mt-1 tabular-nums">
                        {activeItem.dimensions}
                      </div>
                    </div>
                    <div>
                      <div className="text-[12px] text-[#7a7a7a] font-semibold">
                        Biến thể màu sắc
                      </div>
                      <div className="font-semibold text-[#1d1d1f] mt-1">
                        {cleanVariantsText(activeItem.variants)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[12px] text-[#0066cc] font-semibold">
                      Chi tiết & Lưu ý kỹ thuật
                    </div>
                    <p className="text-[#333333] leading-[1.47]">
                      {activeItem.description}
                    </p>
                  </div>

                  {activeItem.suitableFor && (
                    <div className="pt-3 border-t border-[#f0f0f0] space-y-1">
                      <div className="text-[12px] text-[#7a7a7a] font-semibold">
                        Khổ ảnh & Ứng dụng khuyến nghị
                      </div>
                      <div className="text-[#1d1d1f] font-normal">
                        {activeItem.suitableFor}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center text-[12px] text-[#7a7a7a] tabular-nums">
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
