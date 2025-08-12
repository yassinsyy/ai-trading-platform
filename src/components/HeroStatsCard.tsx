// src/components/HeroStatsCard.tsx
import React from "react";
import { Shield } from "lucide-react";

/**
 * HeroStatsCard — Мини-карточка преимуществ (статистика, подтверждение экспертизы).
 * Desktop: стандартная карточка с иконкой
 * Mobile: адаптированная под мобильные требования с правильными размерами
 */
export function HeroStatsCard() {
  return (
    <div className="bg-[#182426cc] border border-[#00F5D4]/20 rounded-xl px-6 py-4 max-w-xs text-[#00F5D4] text-base shadow-lg flex flex-col gap-1">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#00F5D4] rounded-full flex items-center justify-center">
          <Shield className="w-5 h-5 text-black" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[#00F5D4] text-base">50+ проектов</span>
          <span className="text-[#c6faf0] text-sm">в ритейле, производстве и услугах</span>
        </div>
      </div>
    </div>
  );
} 