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
      <div className="min-h-screen w-full bg-[#F8FAFC] text-[#0F172A] flex items-center justify-center px-4 py-12 antialiased selection:bg-amber-100 selection:text-[#0F172A]">
        <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 text-center space-y-5 shadow-sm">
          <div
            onDoubleClick={handleOpenAdminDirectly}
            className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-[#0F172A] select-none cursor-default"
          >
            <ShieldAlert className="w-7 h-7 pointer-events-none text-[#D97706]" />
          </div>

          <div className="space-y-2.5 select-none cursor-default">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight select-none cursor-default">
              Đường Dẫn Báo Giá Không Hợp Lệ
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Đường link bạn truy cập không đúng hoặc đã hết hạn. Vui lòng sử dụng đúng đường link nội bộ do xưởng cấp hoặc liên hệ Zalo{' '}
              <span className="font-mono font-bold text-[#0F172A] tabular-nums">
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
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-sm"
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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-amber-100 selection:text-[#0F172A] relative">
      {/* 1. Header (Sticky Top Bar - Double click on "194" to open Admin directly) */}
      <B2BHeader 
        lockedTier={lockedTier}
        onOpenAdminDirectly={handleOpenAdminDirectly}
      />

      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {/* 2. PHẦN MỞ ĐẦU THANH THOÁT + BẢNG TÍNH NHANH GIÁ SẢN PHẨM */}
        <MobileQuickQuoter 
          lockedTier={lockedTier} 
          zaloTho={b2bShopInfo2026.zaloTho} 
        />

        {/* 3. TOÀN BỘ BẢNG GIÁ THEO CHẤT LIỆU (KHÓA THEO TIER URL) */}
        <OfficialPricingTables 
          lockedTier={lockedTier} 
          zaloTho={b2bShopInfo2026.zaloTho} 
        />

        {/* 4. TRA CỨU MÃ KHUNG VÀ THÔNG SỐ KỸ THUẬT */}
        <FrameReferenceGuide lockedTier={lockedTier} />

        {/* 5. QUY CHUẨN ĐẶT FILE & CHÍNH SÁCH GIAO HÀNG CHO THỢ (Ẩn ở link Khách Lẻ) */}
        {!isRetail && <B2BGuidelinesSection shopInfo={b2bShopInfo2026} />}
      </main>

      {/* 6. Footer (Ẩn B2BFooter ở link Khách Lẻ, chỉ giữ thông tin liên hệ Zalo xưởng gọn gàng) */}
      {isRetail ? (
        <footer className="bg-[#0F172A] text-slate-300 py-9 pb-24 md:pb-9 border-t border-slate-800 text-xs w-full max-w-full overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="space-y-2.5">
                <div className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>Tiệm In</span>
                  <span className="bg-[#F59E0B] text-[#0F172A] font-black rounded-md px-2 py-0.5 font-mono tabular-nums text-sm">
                    194
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                    <span>{b2bShopInfo2026.address}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                    <span>{b2bShopInfo2026.workingHours}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={`tel:${b2bShopInfo2026.hotlineTech.replace(/\D/g, '')}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-mono font-bold text-xs transition-colors tabular-nums border border-white/10"
                >
                  <Phone className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>{b2bShopInfo2026.hotlineTech}</span>
                </a>
                <a
                  href={`https://zalo.me/${b2bShopInfo2026.zaloTho.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] font-bold text-xs transition-colors shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#0F172A]" />
                  <span>Liên Hệ Đặt In Zalo (<span className="font-mono tabular-nums">{b2bShopInfo2026.zaloTho}</span>)</span>
                </a>
              </div>
            </div>

            <div className="pt-4 text-[11px] text-slate-400 text-center sm:text-left">
              © {new Date().getFullYear()} Tiệm In <span className="text-[#F59E0B] font-black font-mono">194</span> — In Ảnh & Đóng Khung Cao Cấp Chuẩn Màu Lab.
            </div>
          </div>
        </footer>
      ) : (
        <B2BFooter 
          shopInfo={b2bShopInfo2026} 
          onOpenAdminDirectly={handleOpenAdminDirectly}
        />
      )}

      {/* 7. Sticky Mobile Thumb Bar */}
      <B2BStickyMobileBar
        lockedTier={lockedTier}
        shopInfo={b2bShopInfo2026}
        onScrollToGuidelines={handleScrollToGuidelines}
      />
    </div>
  );
}
