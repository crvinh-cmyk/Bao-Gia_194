import React, { useState, useEffect } from 'react';
import { b2bShopInfo2026 } from './data/tiemIn194Pricing2026';
import { B2BHeader } from './components/B2BHeader';
import { MobileQuickQuoter } from './components/MobileQuickQuoter';
import { B2BHeroBar } from './components/B2BHeroBar';
import { OfficialPricingTables } from './components/OfficialPricingTables';
import { FrameReferenceGuide } from './components/FrameReferenceGuide';
import { B2BGuidelinesSection } from './components/B2BGuidelinesSection';
import { B2BFooter } from './components/B2BFooter';
import { B2BStickyMobileBar } from './components/B2BStickyMobileBar';
import { AdminPricingManager } from './views/AdminPricingManager';
import { AudienceTierId } from './types/admin';
import { ShieldAlert, MessageCircle } from 'lucide-react';

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
      <div className="min-h-screen w-full bg-[#141211] text-white flex items-center justify-center px-4 py-12 antialiased selection:bg-[#E7C184] selection:text-[#1C1917]">
        <div className="max-w-lg w-full bg-[#1C1917] border border-neutral-800 rounded-2xl p-6 sm:p-10 text-center space-y-5 shadow-2xl">
          <div
            onDoubleClick={handleOpenAdminDirectly}
            className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 select-none cursor-default"
          >
            <ShieldAlert className="w-7 h-7 pointer-events-none" />
          </div>

          <div className="space-y-2.5 select-none cursor-default">
            <h1 className="font-serif-display text-xl sm:text-2xl font-bold text-white tracking-tight select-none cursor-default">
              Đường Dẫn Báo Giá Không Hợp Lệ
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Đường link bạn truy cập không đúng hoặc đã hết hạn. Vui lòng sử dụng đúng đường link nội bộ do xưởng cấp hoặc liên hệ Zalo{' '}
              <span className="font-mono font-bold text-[#E7C184]">
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
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0068FF] hover:bg-[#0052cc] text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Liên hệ Zalo 0967827194</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[#FAF9F5] text-[#1C1917] antialiased selection:bg-[#E2D4C0] selection:text-[#1C1917] relative">
      {/* 1. Header (Sticky Top Bar - Double click on "194" to open Admin directly) */}
      <B2BHeader 
        onOpenAdminDirectly={handleOpenAdminDirectly}
      />

      {/* 2. BỘ TÍNH GIÁ NHANH TRÊN MOBILE (ĐẶT TRÊN CÙNG - KHÓA THEO TIER URL) */}
      <MobileQuickQuoter 
        lockedTier={lockedTier} 
        zaloTho={b2bShopInfo2026.zaloTho} 
      />

      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {/* 3. Hero Overview Bar (Sạch sẽ, không nút admin/cloud) */}
        <B2BHeroBar />

        {/* 4. TOÀN BỘ BẢNG GIÁ THEO CHẤT LIỆU (KHÓA THEO TIER URL) */}
        <OfficialPricingTables 
          lockedTier={lockedTier} 
          zaloTho={b2bShopInfo2026.zaloTho} 
        />

        {/* 5. TRA CỨU MÃ KHUNG VÀ THÔNG SỐ KỸ THUẬT */}
        <FrameReferenceGuide lockedTier={lockedTier} />

        {/* 6. QUY CHUẨN ĐẶT FILE & CHÍNH SÁCH GIAO HÀNG CHO THỢ */}
        <B2BGuidelinesSection shopInfo={b2bShopInfo2026} />
      </main>

      {/* 7. Footer */}
      <B2BFooter 
        shopInfo={b2bShopInfo2026} 
        onOpenAdminDirectly={handleOpenAdminDirectly}
      />

      {/* 8. Sticky Mobile Thumb Bar */}
      <B2BStickyMobileBar
        shopInfo={b2bShopInfo2026}
        onScrollToGuidelines={handleScrollToGuidelines}
      />
    </div>
  );
}
