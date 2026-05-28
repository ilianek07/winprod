import type React from "react";
import { X, Crown, BarChart3, Sparkles, Award, Play, Bot, Bell, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StripePaymentModule } from "./LoginModal";

interface WelcomeVipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: () => void;
}

const FEATURES = [
  {
    icon: BarChart3,
    color: "text-blue-400",
    bg: "border-blue-500/20 bg-blue-500/8",
    dot: "bg-blue-400",
    titleKey: "vipModal.feat1title",
    descKey: "vipModal.feat1desc",
  },
  {
    icon: Sparkles,
    color: "text-yellow-400",
    bg: "border-yellow-500/20 bg-yellow-500/8",
    dot: "bg-yellow-400",
    titleKey: "vipModal.feat2title",
    descKey: "vipModal.feat2desc",
  },
  {
    icon: Award,
    color: "text-emerald-400",
    bg: "border-emerald-500/20 bg-emerald-500/8",
    dot: "bg-emerald-400",
    titleKey: "vipModal.feat3title",
    descKey: "vipModal.feat3desc",
  },
  {
    icon: Play,
    color: "text-pink-400",
    bg: "border-pink-500/20 bg-pink-500/8",
    dot: "bg-pink-400",
    titleKey: "vipModal.feat4title",
    descKey: "vipModal.feat4desc",
  },
  {
    icon: Bot,
    color: "text-violet-400",
    bg: "border-violet-500/20 bg-violet-500/8",
    dot: "bg-violet-400",
    titleKey: "vipModal.feat5title",
    descKey: "vipModal.feat5desc",
    badgeKey: "vipModal.feat5badge",
  },
  {
    icon: Bell,
    color: "text-orange-400",
    bg: "border-orange-500/20 bg-orange-500/8",
    dot: "bg-orange-400",
    titleKey: "vipModal.feat6title",
    descKey: "vipModal.feat6desc",
  },
] as const;

const TESTIMONIALS = [
  {
    initials: "TM",
    name: "Thomas M.",
    age: 27,
    color: "from-blue-500 to-blue-700",
    stars: 5,
    text: "J'ai repéré le projecteur mini-LED 2 semaines avant qu'il explose sur TikTok. 340 commandes en 3 semaines — avec Minea j'avais rien vu venir.",
  },
  {
    initials: "LD",
    name: "Léa D.",
    age: 23,
    color: "from-pink-500 to-rose-600",
    stars: 5,
    text: "La section Pépites fait vraiment la diff. J'aurais loupé le pet groomer portable. 580 € de marge nette le mois dernier.",
  },
  {
    initials: "KB",
    name: "Karim B.",
    age: 31,
    color: "from-emerald-500 to-teal-600",
    stars: 5,
    text: "Le score de saturation m'a évité de lancer sur un produit déjà cramé. Facilement 800 € de pub épargnée ce mois.",
  },
  {
    initials: "SV",
    name: "Sarah V.",
    age: 25,
    color: "from-violet-500 to-purple-700",
    stars: 4,
    text: "Avant je passais 2h/jour sur AliExpress. Maintenant 15 min et j'ai ma liste. Le fournisseur recommandé m'économise 2-3 € l'unité.",
  },
  {
    initials: "MT",
    name: "Maxime T.",
    age: 29,
    color: "from-amber-500 to-orange-600",
    stars: 5,
    text: "Sceptique au départ. J'ai testé 3 produits du top — 2 ont cartonné. ROI ×4 sur le deuxième. Je renouvelle sans hésiter.",
  },
  {
    initials: "JR",
    name: "Julie R.",
    age: 26,
    color: "from-cyan-500 to-blue-600",
    stars: 5,
    text: "J'avais essayé Dropispy avant. WinProd c'est plus ciblé marché FR. Le score tendance m'a fait lancer sur une lampe UV — 1 200 € de CA en 2 semaines.",
  },
] as const;

export function WelcomeVipModal({ isOpen, onClose, onPayment }: WelcomeVipModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="relative w-full max-w-lg rounded-2xl border border-[#1e1e2e] bg-[#0f0f17] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 my-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e1e2e] text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* ── Hero ── */}
          <div className="px-6 pt-7 pb-5 text-center border-b border-[#1e1e2e]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg shadow-yellow-500/25">
              <Crown className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-xl font-black text-white leading-tight">
              {t("vipModal.headline")}
            </h2>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
              {t("vipModal.hook")}
            </p>

            {/* Free tier callout */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#2e2e3e] bg-[#1a1a24] px-3 py-1.5">
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-xs text-gray-400">{t("vipModal.freeIncluded")}</span>
            </div>
          </div>

          {/* ── Feature grid ── */}
          <div className="px-5 py-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-500 mb-3 text-center">
              {t("vipModal.featuresLabel")}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {FEATURES.map((feat) => (
                <div
                  key={feat.titleKey}
                  className={`relative rounded-xl border ${feat.bg} p-3`}
                >
                  {feat.badgeKey && (
                    <span className="absolute top-2 right-2 rounded-full bg-violet-500/20 border border-violet-500/30 px-1.5 py-0.5 text-[8px] font-bold text-violet-400 uppercase tracking-wide">
                      {t(feat.badgeKey)}
                    </span>
                  )}
                  <feat.icon className={`h-4 w-4 ${feat.color} mb-2`} />
                  <p className="text-xs font-bold text-white leading-tight">{t(feat.titleKey)}</p>
                  <p className="mt-0.5 text-[10px] text-gray-400 leading-snug">{t(feat.descKey)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Testimonials ── */}
          <div className="pb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 text-center px-5">
              {t("vipModal.testimonialsLabel")}
            </p>
            <div
              className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory px-5"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
            >
              {TESTIMONIALS.map((item) => (
                <div
                  key={item.name}
                  className="flex-none w-44 snap-start rounded-xl border border-[#1e1e2e] bg-[#12121a] p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`h-7 w-7 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0`}
                    >
                      <span className="text-[9px] font-bold text-white leading-none">{item.initials}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-white leading-none">{item.name}</p>
                      <p className="text-[9px] text-gray-500 leading-none mt-0.5">{item.age} ans</p>
                    </div>
                  </div>
                  <div className="flex gap-px mb-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-[10px] leading-none ${i < item.stars ? "text-yellow-400" : "text-gray-700"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 leading-snug italic">"{item.text}"</p>
                </div>
              ))}
              <div className="flex-none w-3 shrink-0" />
            </div>
          </div>

          {/* ── Social proof strip ── */}
          <div className="mx-5 mb-5 rounded-xl border border-yellow-500/15 bg-gradient-to-r from-yellow-900/15 to-amber-900/10 px-4 py-3 flex items-center gap-3">
            <div className="flex -space-x-2 shrink-0">
              {["#f59e0b","#10b981","#6366f1","#ec4899"].map((c) => (
                <div key={c} className="h-7 w-7 rounded-full border-2 border-[#0f0f17]" style={{ background: `${c}33`, borderColor: `${c}55` }}>
                  <div className="h-full w-full rounded-full flex items-center justify-center">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-300 leading-snug">
              <span className="font-semibold text-yellow-400">{t("vipModal.socialProofCount")}</span>
              {" "}{t("vipModal.socialProofText")}
            </p>
          </div>

          {/* ── CTA ── */}
          <div className="px-5 pb-5 space-y-3">
            <StripePaymentModule onPayment={onPayment} />
            <p className="text-center text-[10px] text-gray-600">{t("vipModal.noCommitment")}</p>
            <button
              onClick={onClose}
              className="flex w-full items-center justify-center text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              {t("vipModal.later")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
