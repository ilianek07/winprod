import { useTranslation } from "react-i18next";
import { Product } from "@/data/products";
import { Crown, Trophy, Medal, TrendingUp, ArrowUpRight } from "lucide-react";
import { type OnboardingNiche, nicheMatchesProduct } from "@/lib/onboarding";

interface LeaderboardRowProps {
  product: Product;
  onAnalyse: (product: Product) => void;
  isLoadingTrends?: boolean;
  preferredNiche?: OnboardingNiche;
}

function RankMovementIndicator({ movement }: { movement: "up" | "down" | "stable" }) {
  if (movement === "up") {
    return <span className="text-[10px] font-bold text-emerald-400 ml-1">▲</span>;
  }
  if (movement === "down") {
    return <span className="text-[10px] font-bold text-red-400 ml-1">▼</span>;
  }
  return <span className="text-[10px] text-gray-500 ml-1">•</span>;
}

function RankBadge({ rank, movement }: { rank: number; movement: "up" | "down" | "stable" }) {
  if (rank === 1) {
    return (
      <div className="flex items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg shadow-yellow-500/20">
          <Crown className="h-5 w-5 text-white" />
        </div>
        <RankMovementIndicator movement={movement} />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-300 to-gray-500 shadow-lg shadow-gray-400/20">
          <Trophy className="h-5 w-5 text-white" />
        </div>
        <RankMovementIndicator movement={movement} />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 shadow-lg shadow-amber-600/20">
          <Medal className="h-5 w-5 text-white" />
        </div>
        <RankMovementIndicator movement={movement} />
      </div>
    );
  }
  return (
    <div className="flex items-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e1e2e]">
        <span className="text-lg font-bold text-gray-400">{rank}</span>
      </div>
      <RankMovementIndicator movement={movement} />
    </div>
  );
}

function getNicheColor(niche: string) {
  const colors: Record<string, string> = {
    "Tech": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Beauté": "bg-pink-500/10 text-pink-400 border-pink-500/20",
    "Maison": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "Sport": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "Mode": "bg-violet-500/10 text-violet-400 border-violet-500/20",
    "Déco": "bg-orange-500/10 text-orange-400 border-orange-500/20",
    "Santé": "bg-red-500/10 text-red-400 border-red-500/20",
    "Gaming": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "Gadgets": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    "Accessoires": "bg-teal-500/10 text-teal-400 border-teal-500/20",
    "Skincare": "bg-rose-500/10 text-rose-400 border-rose-500/20",
    "Coiffure": "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
    "Maquillage": "bg-pink-500/10 text-pink-400 border-pink-500/20",
    "Soin": "bg-lime-500/10 text-lime-400 border-lime-500/20",
    "Beauté Tech": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    "Bien-être": "bg-teal-500/10 text-teal-400 border-teal-500/20",
    "Rangement": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    "Bureau": "bg-slate-500/10 text-slate-400 border-slate-500/20",
    "Sécurité": "bg-red-500/10 text-red-400 border-red-500/20",
    "Loisirs": "bg-sky-500/10 text-sky-400 border-sky-500/20",
    "Cuisine": "bg-orange-500/10 text-orange-400 border-orange-500/20",
    "Outdoor": "bg-green-500/10 text-green-400 border-green-500/20",
    "Créativité": "bg-violet-500/10 text-violet-400 border-violet-500/20",
    "Animaux": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "Bébé": "bg-pink-500/10 text-pink-300 border-pink-500/20",
    "Salle de bain": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    "Exclusif": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };
  return colors[niche] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
}

export function LeaderboardRow({ product, onAnalyse, isLoadingTrends, preferredNiche }: LeaderboardRowProps) {
  const { t } = useTranslation();
  const isForMe = !!preferredNiche && nicheMatchesProduct(preferredNiche, product.niche);

  return (
    <div className={`group flex items-center gap-4 rounded-xl border bg-[#12121a] p-3 sm:p-4 hover:border-emerald-500/30 hover:bg-[#161620] transition-all duration-200 cursor-pointer ${isForMe ? "border-emerald-500/25" : "border-[#1e1e2e]"}`}>
      {/* Rank */}
      <RankBadge rank={product.rank} movement={product.rankMovement} />

      {/* Product Image */}
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#1e1e2e]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-white truncate">{product.name}</h3>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${getNicheColor(product.niche)}`}>
            {product.niche}
          </span>
          {isForMe && (
            <span className="inline-flex items-center gap-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
              ★ {t("onboarding.forYou")}
            </span>
          )}
        </div>
      </div>

      {/* Trend */}
      <div className="hidden sm:flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 min-w-[72px] justify-center">
        {isLoadingTrends ? (
          <div className="h-3 w-14 rounded-full bg-emerald-500/20 animate-pulse" />
        ) : (
          <>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-emerald-400">+{product.trend}%</span>
            {product.trendBreakdown && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" title={t('leaderboard.realTimeScore')} />
            )}
          </>
        )}
      </div>

      {/* Pricing */}
      <div className="hidden md:flex items-center gap-4">
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">{t('leaderboard.buy')}</p>
          <p className="text-sm font-semibold text-gray-400">{product.buyPrice.toFixed(2)}€</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">{t('leaderboard.sell')}</p>
          <p className="text-sm font-semibold text-white">{product.sellPrice.toFixed(2)}€</p>
        </div>
      </div>

      {/* Margin Badge */}
      <div className="hidden lg:flex items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5">
        <span className="text-xs font-bold text-emerald-400">{product.margin}%</span>
      </div>

      {/* CTA */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAnalyse(product);
        }}
        className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-xs font-medium text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500"
      >
        <ArrowUpRight className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t('leaderboard.analyse')}</span>
      </button>
    </div>
  );
}
