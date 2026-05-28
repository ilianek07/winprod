import { TrendingUp, Flame, ShieldCheck, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePepites } from "@/hooks/usePepites";
import { PepiteCard } from "./PepiteCard";
import { StripePaymentModule } from "./LoginModal";
import { Product } from "@/data/products";

interface PepitesSectionProps {
  isPremium?: boolean;
  onAnalyse: (product: Product) => void;
  onPayment?: () => void;
}

function PepitesPaywall({ onPayment }: { onPayment?: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#12121a]">
      {/* Blurred skeleton preview */}
      <div className="blur-sm opacity-25 p-4 space-y-3 pointer-events-none select-none" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-yellow-500/20 bg-[#111118] p-4"
          >
            <div className="h-9 w-9 rounded-xl bg-yellow-500/20 shrink-0" />
            <div className="h-14 w-14 rounded-lg bg-yellow-500/10 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-yellow-500/10" />
              <div className="h-3 w-20 rounded bg-yellow-500/5" />
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="h-2 rounded bg-blue-500/15" />
                <div className="h-2 rounded bg-pink-500/15" />
                <div className="h-2 rounded bg-emerald-500/15" />
                <div className="h-2 rounded bg-amber-500/15" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 pl-2 shrink-0">
              <div className="h-7 w-10 rounded bg-yellow-500/20" />
              <div className="h-6 w-14 rounded bg-yellow-500/10" />
            </div>
          </div>
        ))}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#0a0a0f]/50 to-[#0a0a0f]/95">
        <div className="max-w-sm w-full text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400/20 to-amber-600/20 border border-yellow-500/30 shadow-xl shadow-yellow-500/10">
            <span className="text-4xl">✨</span>
          </div>

          <h2 className="text-2xl font-black text-white mb-1">{t('pepites.title')}</h2>
          <p className="text-xs text-yellow-500 font-semibold uppercase tracking-widest mb-4">
            {t('pepites.vipAccess')}
          </p>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            {t('pepites.desc')}
          </p>

          <div className="space-y-2.5 mb-7 text-left">
            {[
              { icon: TrendingUp, text: t('pepites.criteriaGoogle'), color: "text-blue-400", bg: "border-blue-500/10 bg-blue-500/5" },
              { icon: Flame, text: t('pepites.criteriaTiktok'), color: "text-pink-400", bg: "border-pink-500/10 bg-pink-500/5" },
              { icon: ShieldCheck, text: t('pepites.criteriaSaturation'), color: "text-emerald-400", bg: "border-emerald-500/10 bg-emerald-500/5" },
              { icon: Star, text: t('pepites.criteriaMargin'), color: "text-amber-400", bg: "border-amber-500/10 bg-amber-500/5" },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg border ${item.bg} p-3`}
              >
                <item.icon className={`h-4 w-4 ${item.color} shrink-0`} />
                <span className="text-xs text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>

          {onPayment && <StripePaymentModule onPayment={onPayment} />}
        </div>
      </div>
    </div>
  );
}

export function PepitesSection({ isPremium = false, onAnalyse, onPayment }: PepitesSectionProps) {
  const { pepites, isLoading, totalCandidates } = usePepites();
  const { t } = useTranslation();

  return (
    <div className="flex-1 space-y-4">
      {/* Section header */}
      <div className="flex items-start justify-between px-1">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>✨</span> {t('pepites.title')}
            </h2>
            <span className="rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-0.5 text-[10px] font-bold text-yellow-400 uppercase tracking-wider">
              VIP
            </span>
            {isPremium && !isLoading && (
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-[10px] text-yellow-500 font-semibold uppercase tracking-wide">
                  Live
                </span>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {isPremium
              ? t('pepites.productsAnalyzed', { count: totalCandidates })
              : t('pepites.lockedDesc')}
          </p>
        </div>
      </div>

      {/* Content */}
      {!isPremium ? (
        <PepitesPaywall onPayment={onPayment} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-[110px] rounded-xl border border-yellow-500/10 bg-[#12121a] animate-pulse"
            />
          ))}
          <p className="text-center text-xs text-gray-600 pt-2">
            {t('pepites.analyzing')}
          </p>
        </div>
      ) : pepites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-[#1e1e2e] bg-[#12121a]">
          <span className="text-4xl mb-3">🔍</span>
          <p className="text-gray-400 text-sm font-medium">{t('pepites.noResults')}</p>
          <p className="text-gray-600 text-xs mt-1">
            {t('pepites.noResultsDesc')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {pepites.map((pepite, idx) => (
            <PepiteCard
              key={pepite.id}
              pepite={pepite}
              rank={idx + 1}
              onAnalyse={onAnalyse}
            />
          ))}
        </div>
      )}
    </div>
  );
}
