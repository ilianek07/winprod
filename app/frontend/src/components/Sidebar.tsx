import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";
import { categories, CategoryKey, productsByCategory } from "@/data/products";

interface SidebarProps {
  activeCategory: CategoryKey;
  onCategoryChange: (category: CategoryKey) => void;
  isPremium?: boolean;
  isDebutant?: boolean;
}

export function Sidebar({ activeCategory, onCategoryChange, isPremium, isDebutant }: SidebarProps) {
  const { t } = useTranslation();
  const weeklyProduct = productsByCategory["global"][0];

  return (
    <aside className="w-full lg:w-64 lg:shrink-0 space-y-3 lg:space-y-4">
      {/* Category Filters */}
      <div className="rounded-xl border border-[#1e1e2e] bg-[#12121a] p-3 lg:p-4">
        <h3 className="mb-2 lg:mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {t('sidebar.categories')}
        </h3>
        {/* Horizontal scroll on mobile, vertical list on lg */}
        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-0.5 lg:flex-col lg:overflow-x-visible lg:gap-0 lg:space-y-1.5 lg:pb-0">
          {/* Guide débutant — visible uniquement pour les débutants */}
          {isDebutant && (
            <button
              onClick={() => onCategoryChange("beginners")}
              className={`flex shrink-0 lg:w-full items-center gap-2 lg:gap-2.5 rounded-lg px-3 py-2 lg:py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                activeCategory === "beginners"
                  ? "bg-teal-500/10 border border-teal-500/30 text-teal-400"
                  : "border border-teal-500/15 text-teal-500/70 hover:bg-teal-500/5 hover:text-teal-400 hover:border-teal-500/25"
              }`}
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap lg:truncate lg:flex-1">Guide Débutant</span>
              <span className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-teal-500/15 text-teal-400">
                Nouveau
              </span>
            </button>
          )}

          {categories.map((cat) => {
            const isVipCat = cat.isVip === true;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => onCategoryChange(cat.key)}
                className={`flex shrink-0 lg:w-full items-center gap-2 lg:gap-2.5 rounded-lg px-3 py-2 lg:py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                  isActive && isVipCat
                    ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                    : isActive
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : isVipCat
                    ? "border border-yellow-500/10 text-yellow-500/70 hover:bg-yellow-500/5 hover:text-yellow-400 hover:border-yellow-500/20"
                    : "border border-transparent text-gray-400 hover:bg-[#1e1e2e] hover:text-white"
                }`}
              >
                <span className="text-base">{cat.emoji}</span>
                <span className="whitespace-nowrap lg:truncate lg:flex-1">{t(`sidebar.cat.${cat.key}`)}</span>
                {isVipCat && (
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                      isPremium
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-yellow-500/10 text-yellow-600"
                    }`}
                  >
                    VIP
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Weekly Product — desktop only */}
      <div className="hidden lg:block rounded-xl border border-[#1e1e2e] bg-[#12121a] p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {t('sidebar.weeklyProduct')}
        </h3>
        <div className="overflow-hidden rounded-lg border border-[#1e1e2e]">
          <img
            src={weeklyProduct.image}
            alt={weeklyProduct.name}
            className="h-32 w-full object-cover"
          />
        </div>
        <h4 className="mt-3 text-sm font-semibold text-white">{weeklyProduct.name}</h4>
        <p className="mt-1 text-xs text-gray-400">{weeklyProduct.niche}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
            +{weeklyProduct.trend}%
          </span>
          <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400">
            {weeklyProduct.margin}% {t('sidebar.margin')}
          </span>
        </div>
      </div>
    </aside>
  );
}
