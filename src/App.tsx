import React, { useState, useEffect } from 'react';
import { b2bShopInfo2026 } from './data/tiemIn194Pricing2026';
import { B2BHeader } from './components/B2BHeader';
import { MobileQuickQuoter } from './components/MobileQuickQuoter';
import { OfficialPricingTables } from './components/OfficialPricingTables';
import { FrameReferenceGuide } from './components/FrameReferenceGuide';
import { B2BGuidelinesSection } from './components/B2BGuidelinesSection';
import { B2BFooter } from './components/B2BFooter';
import { B2BStickyMobileBar } from './components/B2BStickyMobileBar';
import { AdminPricingManager } from './views/AdminPricingManager';
import { AudienceTierId } from './types/admin';
import { ShieldAlert, MessageCircle, Phone, MapPin, Clock } from 'lucide-react';

export const PRODUCTION_URL = "https://bao-gia194.vercel.app";

export const TIER_TOKEN_MAP: Record<AudienceTierId, string> = {
  studio: 'b2b_st99x',
  freelance: 'pro_f88y',
  retail: 'rt_k77z'
};

export function getShareUrlByTier(tier: AudienceTierId): string {
  const token = TIER_TOKEN_MAP[tier];
  return `${PRODUCTION_URL}/?token=${token}`;
}

export function getAudienceTierFromUrl(): AudienceTierId | null {
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash || '';
  const hashQueryIdx = hash.indexOf('?');
  const hashParams = hashQueryIdx >= 0 ? new URLSearchParams(hash.slice(hashQueryIdx)) : null;

  const tokenParam = (
    searchParams.get('token') ||
    hashParams?.get('token') ||
    ''
  ).trim();

  if (tokenParam === 'b2b_st99x') {
    return 'studio';
  }
  if (tokenParam === 'pro_f88y') {
    return 'freelance';
  }
  if (tokenParam === 'rt_k77z') {
    return 'retail';
  }

  // Tuyệt đối không fallback về bất kỳ bảng giá nào nếu thiếu hoặc sai token
  return null;
}

export default function App() {
  const [isAdminView, setIsAdminView] = useState(false);
  const [lockedTier, setLockedTier] = useState<AudienceTierId | null>(getAudienceTierFromUrl);

  // Check URL parameters for admin access: ?admin=true or #/admin
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hasAdminQuery = searchParams.get('admin') === 'true';
    const hasAdminHash = window.location.hash.includes('admin');

    if (hasAdminQuery || hasAdminHash) {
      setIsAdminView(true);
    }

    const handleUrlChange = () => {
      setLockedTier(getAudienceTierFromUrl());
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || window.location.hash.includes('admin')) {
        setIsAdminView(true);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleScrollToGuidelines = () => {
    const el = document.getElementById('quy-chuan');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAdminDirectly = () => {
    setIsAdminView(true);
  };

  const handleExitAdmin = (previewTier?: AudienceTierId) => {
    if (previewTier) {
      const token = TIER_TOKEN_MAP[previewTier];
      try {
        const newUrl = `${window.location.pathname}?token=${token}`;
        window.history.replaceState({}, '', newUrl);
      } catch (e) {
        // Ignore history error in restricted iframe contexts
      }
      setLockedTier(previewTier);
    } else {
      setLockedTier(getAudienceTierFromUrl());
    }
    setIsAdminView(false);
  };

  // Render Admin View if unlocked
  if (isAdminView) {
    return (
      <AdminPricingManager 
        onExitAdmin={handleExitAdmin} 
      />
    );
  }

  // MÀN HÌNH "TỪ CHỐI TRUY CẬP" (ACCESS DENIED) NẾU SAI HOẶC THIẾU TOKEN
  if (!lockedTier) {
    return (
      <div className="min-h-screen w-full bg-[#f5f5f7] text-[#1d1d1f] flex items-center justify-center px-5 py-12 antialiased selection:bg-[#0066cc]/15 selection:text-[#0066cc]">
        <div className="max-w-lg w-full bg-[#ffffff] border border-[#e0e0e0] rounded-[18px] p-8 sm:p-10 text-center space-y-6">
          <div
            onDoubleClick={handleOpenAdminDirectly}
            className="w-14 h-14 rounded-full bg-[#f5f5f7] border border-[#e0e0e0] flex items-center justify-center mx-auto text-[#1d1d1f] select-none cursor-default"
          >
            <ShieldAlert className="w-6 h-6 pointer-events-none text-[#0066cc]" />
          </div>

          <div className="space-y-3 select-none cursor-default">
            <h1 className="font-display text-[28px] sm:text-[34px] font-semibold text-[#1d1d1f] leading-[1.14] tracking-[-0.374px] text-balance">
              Đường Dẫn Báo Giá Không Hợp Lệ
            </h1>
            <p className="text-[17px] font-normal text-[#333333] leading-[1.47] tracking-[-0.374px]">
              Đường link bạn truy cập không đúng hoặc đã hết hạn. Vui lòng sử dụng đúng đường link nội bộ do xưởng cấp hoặc liên hệ Zalo{' '}
              <span className="font-semibold text-[#1d1d1f] tabular-nums">
                0967827194
              </span>{' '}
              để được hỗ trợ.
            </p>
          </div>

          <div className="pt-2">
            <a
              href="https://zalo.me/0967827194"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-[22px] py-[11px] bg-[#0066cc] hover:bg-[#0071e3] active:scale-95 text-[#ffffff] font-normal text-[17px] leading-none rounded-full transition-transform duration-150"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Liên hệ Zalo 0967827194</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const isRetail = lockedTier === 'retail';

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[#ffffff] text-[#1d1d1f] antialiased selection:bg-[#0066cc]/15 selection:text-[#0066cc] relative">
      {/* 1. Header (Global Nav + Frosted Sub-Nav — Double click "194" to open Admin directly) */}
      <B2BHeader 
        lockedTier={lockedTier}
        onOpenAdminDirectly={handleOpenAdminDirectly}
      />

      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {/* 2. LIGHT TILE: HERO & BẢNG TÍNH NHANH GIÁ SẢN PHẨM */}
        <MobileQuickQuoter 
          lockedTier={lockedTier} 
          zaloTho={b2bShopInfo2026.zaloTho} 
        />

        {/* 3. PARCHMENT TILE: TOÀN BỘ BẢNG GIÁ THEO CHẤT LIỆU (KHÓA THEO TIER URL) */}
        <OfficialPricingTables 
          lockedTier={lockedTier} 
          zaloTho={b2bShopInfo2026.zaloTho} 
        />

        {/* 4. LIGHT TILE: TRA CỨU MÃ KHUNG VÀ THÔNG SỐ KỸ THUẬT */}
        <FrameReferenceGuide lockedTier={lockedTier} />

        {/* 5. DARK TILES: QUY CHUẨN ĐẶT FILE & CHÍNH SÁCH GIAO HÀNG CHO THỢ (Ẩn ở link Khách Lẻ) */}
        {!isRetail && <B2BGuidelinesSection shopInfo={b2bShopInfo2026} />}
      </main>

      {/* 6. PARCHMENT FOOTER (Ẩn B2BFooter ở link Khách Lẻ, giữ thông tin liên hệ Zalo xưởng gọn gàng) */}
      {isRetail ? (
        <footer className="bg-[#f5f5f7] text-[#333333] py-[64px] pb-[96px] md:pb-[64px] border-t border-[#e0e0e0] w-full max-w-full overflow-hidden">
          <div className="max-w-[980px] mx-auto px-5 sm:px-6 w-full max-w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-[#e0e0e0]">
              <div className="space-y-3">
                <div className="font-display text-[21px] font-semibold text-[#1d1d1f] tracking-[0.231px]">
                  Tiệm In 194
                </div>
                <div className="flex flex-col gap-1.5 text-[14px] font-normal text-[#333333] leading-[1.43] tracking-[-0.224px]">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#7a7a7a] shrink-0" />
                    <span>{b2bShopInfo2026.address}</span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#7a7a7a] shrink-0" />
                    <span>{b2bShopInfo2026.workingHours}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`tel:${b2bShopInfo2026.hotlineTech.replace(/\D/g, '')}`}
                  className="inline-flex items-center gap-2 px-[22px] py-[11px] rounded-full border border-[#0066cc] text-[#0066cc] hover:bg-[#0066cc]/5 active:scale-95 text-[14px] font-normal leading-none transition-all tabular-nums whitespace-nowrap"
                >
                  <Phone className="w-4 h-4" />
                  <span>{b2bShopInfo2026.hotlineTech}</span>
                </a>
                <a
                  href={`https://zalo.me/${b2bShopInfo2026.zaloTho.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-[22px] py-[11px] rounded-full bg-[#0066cc] hover:bg-[#0071e3] active:scale-95 text-[#ffffff] text-[14px] font-normal leading-none transition-all whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Liên Hệ Đặt In Zalo (<span className="tabular-nums">{b2bShopInfo2026.zaloTho}</span>)</span>
                </a>
              </div>
            </div>

            <div className="pt-6 text-[12px] font-normal text-[#7a7a7a] leading-[1.3] tracking-[-0.12px]">
              © {new Date().getFullYear()} Tiệm In 194. In Ảnh & Đóng Khung Cao Cấp Chuẩn Màu Lab.
            </div>
          </div>
        </footer>
      ) : (
        <B2BFooter 
          shopInfo={b2bShopInfo2026} 
          onOpenAdminDirectly={handleOpenAdminDirectly}
        />
      )}

      {/* 7. Floating Frosted Mobile Sticky Bar */}
      <B2BStickyMobileBar
        lockedTier={lockedTier}
        shopInfo={b2bShopInfo2026}
        onScrollToGuidelines={handleScrollToGuidelines}
      />
    </div>
  );
}
