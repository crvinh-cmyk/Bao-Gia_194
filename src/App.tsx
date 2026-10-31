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

export const PRODUCTION_URL = "https://bao-gia194.vercel.app";

export const TIER_TOKEN_MAP: Record<AudienceTierId, string> = {
  studio: 'b2b_st99x',
  freelance: 'pro_f88y',
  retail: 'rt_k77z'
};

export function getShareUrlByTier(tier: AudienceTierId): string {
  const token = TIER_TOKEN_MAP[tier] || TIER_TOKEN_MAP.retail;
  return `${PRODUCTION_URL}/?token=${token}`;
}

export function getAudienceTierFromUrl(): AudienceTierId {
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash || '';
  const hashQueryIdx = hash.indexOf('?');
  const hashParams = hashQueryIdx >= 0 ? new URLSearchParams(hash.slice(hashQueryIdx)) : null;

  const tokenParam = (
    searchParams.get('token') ||
    hashParams?.get('token') ||
    ''
  ).trim().toLowerCase();

  if (tokenParam === 'b2b_st99x') {
    return 'studio';
  }
  if (tokenParam === 'pro_f88y') {
    return 'freelance';
  }
  if (tokenParam === 'rt_k77z') {
    return 'retail';
  }

  // Hỗ trợ thêm đọc từ hash hoặc tham số tier cũ nếu có
  const cleanHash = hash.replace(/^#\/?/, '').split('?')[0].trim().toLowerCase();
  if (cleanHash === 'b2b_st99x' || cleanHash === 'studio') return 'studio';
  if (cleanHash === 'pro_f88y' || cleanHash === 'freelance') return 'freelance';
  if (cleanHash === 'rt_k77z' || cleanHash === 'retail' || cleanHash === 'khach-le') return 'retail';

  const legacyTier = (searchParams.get('tier') || hashParams?.get('tier') || '').trim().toLowerCase();
  if (legacyTier === 'studio') return 'studio';
  if (legacyTier === 'freelance') return 'freelance';
  if (legacyTier === 'retail' || legacyTier === 'khach-le') return 'retail';

  // Fallback bắt buộc về Khách Lẻ ('retail') nếu truy cập link gốc hoặc token không hợp lệ để bảo vệ giá gốc Studio
  return 'retail';
}

export default function App() {
  const [isAdminView, setIsAdminView] = useState(false);
  const [lockedTier, setLockedTier] = useState<AudienceTierId>(getAudienceTierFromUrl);

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
      const token = TIER_TOKEN_MAP[previewTier] || TIER_TOKEN_MAP.retail;
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
        <FrameReferenceGuide />

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
