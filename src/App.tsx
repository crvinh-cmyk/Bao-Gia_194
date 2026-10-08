/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { b2bShopInfo2026 } from './data/tiemIn194Pricing2026';
import { B2BHeader } from './components/B2BHeader';
import { MobileQuickQuoter } from './components/MobileQuickQuoter';
import { B2BHeroBar } from './components/B2BHeroBar';
import { OfficialPricingTables } from './components/OfficialPricingTables';
import { FrameReferenceGuide } from './components/FrameReferenceGuide';
import { B2BGuidelinesSection } from './components/B2BGuidelinesSection';
import { B2BFooter } from './components/B2BFooter';
import { B2BStickyMobileBar } from './components/B2BStickyMobileBar';

export default function App() {
  const handleScrollToGuidelines = () => {
    const el = document.getElementById('quy-chuan');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#1C1917] antialiased selection:bg-[#E2D4C0] selection:text-[#1C1917]">
      {/* 1. Header (Sticky Top Bar) */}
      <B2BHeader />

      {/* 2. BỘ TÍNH GIÁ NHANH TRÊN MOBILE (ĐẶT TRÊN CÙNG - Yêu cầu 1) */}
      <MobileQuickQuoter zaloTho={b2bShopInfo2026.zaloTho} />

      <main className="flex-1">
        {/* 3. Hero Overview Bar */}
        <B2BHeroBar />

        {/* 4. TOÀN BỘ BẢNG GIÁ THEO CHẤT LIỆU (Yêu cầu 2: Dạng Thẻ & Dạng Bảng Sticky Cột Cỡ Ảnh) */}
        <OfficialPricingTables zaloTho={b2bShopInfo2026.zaloTho} />

        {/* 5. TRA CỨU MÃ KHUNG VÀ THÔNG SỐ KỸ THUẬT (Yêu cầu 3: K0 - K11 & Titan có vuốt chạm) */}
        <FrameReferenceGuide />

        {/* 6. QUY CHUẨN ĐẶT FILE & CHÍNH SÁCH GIAO HÀNG CHO THỢ */}
        <B2BGuidelinesSection shopInfo={b2bShopInfo2026} />
      </main>

      {/* 7. Footer */}
      <B2BFooter shopInfo={b2bShopInfo2026} />

      {/* 8. Sticky Mobile Thumb Bar */}
      <B2BStickyMobileBar
        shopInfo={b2bShopInfo2026}
        onScrollToGuidelines={handleScrollToGuidelines}
      />
    </div>
  );
}
