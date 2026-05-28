import { TrendingUp, Flame, ShieldCheck, DollarSign, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PepiteProduct } from "@/hooks/usePepites";
import { Product } from "@/data/products";

interface PepiteCardProps {
  pepite: PepiteProduct;
  rank: number;
  onAnalyse: (product: Product) => void;
}

function ScoreBar({
  label,
  value,
  icon: Icon,
  barColor,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  barColor: string;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Icon className="h-2.5 w-2.5 text-gray-500" />
          <span className="text-[9px] text-gray-500 truncate max-w-[60px]">{label}</span>
        </div>
        <span className="text-[9px] font-bold text-gray-400">{Math.round(value)}%</span>
      </div>
      <div className="h-1 w-full rounded-full bg-[#1e1e2e]">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

export function PepiteCard({ pepite, rank, onAnalyse }: PepiteCardProps) {
  const { t } = useTranslation();
  const { googleMomentum, saturationScore, tiktokScore, marginScore } = pepite.pepiteCriteria;

  const scoreColor =
    pepite.pepiteScore >= 65
      ? "text-yellow-400"
      : pepite.pepiteScore >= 45
      ? "text-emerald-400"
      : "text-blue-400";

  const borderColor =
    pepite.pepiteScore >= 65
      ? "border-yellow-500/30 hover:border-yellow-500/60"
      : "border-emerald-500/20 hover:border-emerald-500/40";

  return (
    <div
      className={`group relative flex items-center gap-3 rounded-xl border ${borderColor} bg-gradient-to-r from-[#12121a] to-[#111118] p-4 transition-all duration-300 cursor-pointer`}
      onClick={() => onAnalyse(pepite)}
    >
      {/* Live indicator */}
      {pepite.pepiteIsReal && (
        <div className="absolute top-2 right-16 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-[8px] text-yellow-500 font-semibold uppercase tracking-wide">Live</span>
        </div>
      )}

      {/* Rank badge */}
      <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-yellow-400/20 to-amber-600/20 border border-yellow-500/30 shrink-0">
        <span className="text-xs font-bold text-yellow-400">#{rank}</span>
      </div>

      {/* Image */}
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#1e1e2e]">
        <img
          src={pepite.image}
          alt={pepite.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Info + score bars */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-white truncate">{pepite.name}</h3>
        <span className="inline-block mt-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 text-[9px] font-medium text-yellow-400">
          {pepite.niche}
        </span>

        <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
          <ScoreBar label={t('pepiteCard.googleLabel')} value={googleMomentum} icon={TrendingUp} barColor="bg-blue-500" />
          <ScoreBar label="TikTok" value={tiktokScore} icon={Flame} barColor="bg-pink-500" />
          <ScoreBar label={t('pepiteCard.saturationLabel')} value={saturationScore} icon={ShieldCheck} barColor="bg-emerald-500" />
          <ScoreBar label={t('pepiteCard.marginLabel')} value={marginScore} icon={DollarSign} barColor="bg-amber-500" />
        </div>
      </div>

      {/* Viral score + CTA */}
      <div className="flex flex-col items-center gap-2 shrink-0 pl-2">
        <div className="text-center">
          <div className={`text-2xl font-black leading-none ${scoreColor}`}>{pepite.pepiteScore}</div>
          <div className="text-[8px] text-gray-600 uppercase tracking-wider mt-0.5">{t('pepiteCard.viral')}</div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAnalyse(pepite);
          }}
          className="flex items-center gap-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1.5 text-[10px] font-semibold text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-500/40 transition-colors"
        >
          <ArrowUpRight className="h-3 w-3" />
          {t('pepiteCard.view')}
        </button>
      </div>
    </div>
  );
}
