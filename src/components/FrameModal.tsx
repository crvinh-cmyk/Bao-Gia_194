import React, { useState, useEffect } from 'react';
import { X, Camera, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { FrameConstantItem, EXACT_FRAME_PATHS } from '../constants/frames';
import { FrameSpecItem } from '../types';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

interface FrameModalProps {
  frame: FrameConstantItem | FrameSpecItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  initialVariantIndex?: number;
}

export const FrameModal: React.FC<FrameModalProps> = ({
  frame,
  isOpen,
  onClose,
  onNext,
  onPrev,
  initialVariantIndex = 0
}) => {
  const [variantIndex, setVariantIndex] = useState(initialVariantIndex);
  const { handleClose } = useModalBackHandler(isOpen, onClose);

  useEffect(() => {
    setVariantIndex(initialVariantIndex);
  }, [frame, initialVariantIndex]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, onNext, onPrev]);

  if (!isOpen || !frame) return null;

  // Resolve active image - enforce exact path for K0, K1, K2, K3, K7, K8, K9, K11
  const exactPath = EXACT_FRAME_PATHS[frame.code] || EXACT_FRAME_PATHS[frame.code?.toUpperCase()];
  const images = frame.images && frame.images.length > 0 
    ? frame.images 
    : [
        {
          name: frame.name,
          url: exactPath || (frame as FrameConstantItem).imageUrl || (frame as FrameConstantItem).image || ''
        }
      ];

  const currentImage = images[variantIndex] || images[0];
  const rawUrl = currentImage?.url || exactPath || (frame as FrameConstantItem).imageUrl || '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto w-full max-w-full"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#1C1917] text-white rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky with Prominent Back/Close Button */}
        <div className="sticky top-0 z-30 flex items-center justify-between p-3.5 sm:p-4 border-b border-neutral-800 bg-[#161514] shrink-0 gap-2">
          <div className="flex items-center gap-2 overflow-hidden min-w-0">
            <span className="font-mono text-xs font-bold bg-[#E7C184] text-[#1C1917] px-2.5 py-0.5 rounded shrink-0">
              {frame.code}
            </span>
            <span className="text-xs sm:text-sm font-bold text-white truncate">
              {frame.name}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full shrink-0 hidden sm:flex items-center gap-1">
              <Camera className="w-3 h-3 text-emerald-400" />
              <span>Ảnh Chụp Thực Tế</span>
            </span>
          </div>

          {/* Prominent Quay lại / Đóng [✕] button on mobile & desktop */}
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white border border-neutral-700 hover:border-neutral-500 font-semibold text-xs shadow-md transition-all cursor-pointer shrink-0"
            aria-label="Quay lại / Đóng"
          >
            <ChevronLeft className="w-4 h-4 text-[#E7C184]" />
            <span className="text-[11px] sm:text-xs">Quay lại / Đóng</span>
            <X className="w-3.5 h-3.5 text-neutral-300" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 select-none overflow-y-auto">
          {/* Variant Selector if multi-image */}
          {images.length > 1 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-neutral-300 font-semibold uppercase tracking-wider flex items-center justify-between">
                <span>Chọn màu chụp thật:</span>
                <span className="text-[10px] text-neutral-400 font-normal">
                  {variantIndex + 1}/{images.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {images.map((img, vIdx) => (
                  <button
                    key={img.url}
                    onClick={() => setVariantIndex(vIdx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                      variantIndex === vIdx
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
                    {variantIndex === vIdx && (
                      <Check className="w-3.5 h-3.5 text-[#1C1917]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Direct <img> Display - Completely Replaces Any SVG */}
          <div className="w-full max-h-[58vh] sm:max-h-[62vh] bg-black/90 rounded-2xl border border-neutral-800 flex items-center justify-center relative overflow-hidden group p-2">
            <img
              src={encodeURI(rawUrl)}
              alt={`${frame.name} - ${currentImage?.name || ''}`}
              className="max-h-[54vh] sm:max-h-[58vh] w-auto max-w-full object-contain mx-auto rounded-lg shadow-2xl transition-opacity duration-200"
              loading="eager"
            />


            {/* Previous Frame Navigation Button */}
            {onPrev && (
              <button
                onClick={onPrev}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 hover:bg-black text-white cursor-pointer active:scale-95 transition-all shadow-md border border-white/10"
                aria-label="Khung trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Next Frame Navigation Button */}
            {onNext && (
              <button
                onClick={onNext}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 hover:bg-black text-white cursor-pointer active:scale-95 transition-all shadow-md border border-white/10"
                aria-label="Khung tiếp"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
            <span>✓ Ảnh chụp thật góc cạnh và mặt trước tại <strong>Tiệm In 194</strong></span>
            <span className="font-mono text-[#E7C184]">{frame.dimensions}</span>
          </div>

          <div className="bg-neutral-900/80 rounded-xl p-3 border border-neutral-800 text-xs text-neutral-300 space-y-1.5">
            <div><strong>Quy cách:</strong> {frame.dimensions}</div>
            <div><strong>Màu sắc có sẵn:</strong> {frame.variants}</div>
            {frame.description && <div><strong>Mô tả:</strong> {frame.description}</div>}
            {frame.suitableFor && <div><strong>Phù hợp:</strong> {frame.suitableFor}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrameModal;
