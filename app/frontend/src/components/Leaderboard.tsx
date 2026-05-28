import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Product } from "@/data/products";
import { LeaderboardRow } from "./LeaderboardRow";
import type { OnboardingNiche } from "@/lib/onboarding";

interface LeaderboardProps {
  products: Product[];
  onAnalyse: (product: Product) => void;
  isLoadingTrends?: boolean;
  preferredNiche?: OnboardingNiche;
}

export function Leaderboard({ products, onAnalyse, isLoadingTrends, preferredNiche }: LeaderboardProps) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 space-y-2">
      {/* Personalisation banner */}
      {preferredNiche && preferredNiche !== "autre" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
          <Sparkles className="h-3 w-3 text-emerald-400 shrink-0" />
          <span className="text-xs text-gray-400">
            {t("onboarding.nicheActive")}{" "}
            <span className="text-emerald-400 font-semibold">{t(`onboarding.${preferredNiche}`)}</span>
          </span>
        </div>
      )}

      {/* Column Headers */}
      <div className="flex items-center gap-4 px-4 py-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
        <div className="w-10 text-center">{t('leaderboard.rank')}</div>
        <div className="w-12"></div>
        <div className="flex-1">{t('leaderboard.product')}</div>
        <div className="hidden sm:flex items-center gap-1 w-20 justify-center">
          <span>{t('leaderboard.trend')}</span>
          {isLoadingTrends ? (
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title={t('leaderboard.realTimeData')} />
          )}
        </div>
        <div className="hidden md:block w-24 text-center">{t('leaderboard.buy')}</div>
        <div className="hidden md:block w-24 text-center">{t('leaderboard.sell')}</div>
        <div className="hidden lg:block w-16 text-center">{t('leaderboard.margin')}</div>
        <div className="w-24"></div>
      </div>

      {/* Product Rows */}
      <div className="space-y-2">
        {products.map((product) => (
          <LeaderboardRow key={product.id} product={product} onAnalyse={onAnalyse} isLoadingTrends={isLoadingTrends} preferredNiche={preferredNiche} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <p>{t('leaderboard.noProducts')}</p>
        </div>
      )}
    </div>
  );
}
