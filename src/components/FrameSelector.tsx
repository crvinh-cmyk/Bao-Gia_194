import React, { useState } from 'react';
import { Camera, Eye } from 'lucide-react';
import { FRAMES, FrameConstantItem } from '../constants/frames';
import { FrameModal } from './FrameModal';

interface FrameSelectorProps {
  onSelectFrame?: (frame: FrameConstantItem) => void;
  selectedFrameCode?: string;
  className?: string;
}

export const FrameSelector: React.FC<FrameSelectorProps> = ({
  onSelectFrame,
  selectedFrameCode,
  className = ''
}) => {
  const [activeModalFrame, setActiveModalFrame] = useState<FrameConstantItem | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});

  const handleVariantChange = (frameCode: string, variantIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVariants(prev => ({ ...prev, [frameCode]: variantIdx }));
  };

  const handleNextFrame = () => {
    if (!activeModalFrame) return;
    const currentIdx = FRAMES.findIndex(f => f.code === activeModalFrame.code);
    const nextIdx = (currentIdx + 1) % FRAMES.length;
    setActiveModalFrame(FRAMES[nextIdx]);
  };

  const handlePrevFrame = () => {
    if (!activeModalFrame) return;
    const currentIdx = FRAMES.findIndex(f => f.code === activeModalFrame.code);
    const prevIdx = (currentIdx - 1 + FRAMES.length) % FRAMES.length;
    setActiveModalFrame(FRAMES[prevIdx]);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {FRAMES.map((item) => {
          const activeVariantIdx = selectedVariants[item.code] || 0;
          const currentImage = item.images[activeVariantIdx] || item.images[0];
          const rawUrl = currentImage?.url || item.imageUrl;
          const isSelected = selectedFrameCode === item.code;

          return (
            <div
              key={item.code}
              className={`bg-[#FAF9F5] rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all space-y-3 shadow-xs group cursor-pointer ${
                isSelected ? 'border-[#936B34] ring-2 ring-[#936B34]' : 'border-[#E7E2DA] hover:border-[#936B34]'
              }`}
              onClick={() => {
                if (onSelectFrame) onSelectFrame(item);
                setActiveModalFrame(item);
              }}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#EFEAE2] gap-1.5 flex-wrap">
                  <span className="font-mono text-xs sm:text-sm font-bold bg-[#1C1917] text-[#E7C184] px-2.5 py-1 rounded shadow-xs shrink-0">
                    {item.code}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                    <Camera className="w-3 h-3 text-emerald-700" />
                    <span>Ảnh Thật {item.images.length > 1 ? `(${item.images.length} màu)` : ''}</span>
                  </span>
                </div>

                {/* Direct <img> Rendering with encodeURI - NO SVG MOCKUP */}
                <div className="mt-3 space-y-2">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-[#EFEAE2]">
                    <img
                      src={encodeURI(rawUrl)}
                      alt={`${item.name} - ${currentImage?.name || ''}`}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-2.5 pointer-events-none">
                      <span className="text-[10px] font-medium text-white font-mono bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded flex items-center gap-1">
                        <Camera className="w-3 h-3 text-[#E7C184]" />
                        <span>{currentImage?.name || item.name}</span>
                      </span>
                    </div>
                  </div>

                  {/* Multi-color Selector */}
                  {item.images.length > 1 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] font-mono text-[#78716C] mr-0.5">Màu:</span>
                      {item.images.map((img, vIdx) => (
                        <button
                          key={img.url}
                          onClick={(e) => handleVariantChange(item.code, vIdx, e)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                            activeVariantIdx === vIdx
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

                {/* Details */}
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

              <div className="space-y-3 pt-2 border-t border-[#EFEAE2] w-full">
                <div className="text-xs text-[#78716C]">
                  <div>Màu sắc: <strong className="text-[#1C1917] font-normal">{item.variants}</strong></div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectFrame) onSelectFrame(item);
                    setActiveModalFrame(item);
                  }}
                  className="w-full h-11 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  <Eye className="w-4 h-4 text-emerald-200" />
                  <span>Xem Chi Tiết Ảnh Chụp Thật</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <FrameModal
        frame={activeModalFrame}
        isOpen={!!activeModalFrame}
        onClose={() => setActiveModalFrame(null)}
        onNext={handleNextFrame}
        onPrev={handlePrevFrame}
        initialVariantIndex={activeModalFrame ? selectedVariants[activeModalFrame.code] || 0 : 0}
      />
    </div>
  );
};

export default FrameSelector;
