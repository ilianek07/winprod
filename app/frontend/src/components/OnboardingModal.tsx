import { useState } from "react";
import {
  X, Sprout, Rocket, Trophy,
  Monitor, Sparkles, Home, Dumbbell, CircleDashed,
  Wallet, TrendingUp, Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { OnboardingLevel, OnboardingNiche, OnboardingBudget } from "@/lib/onboarding";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (prefs: {
    level: OnboardingLevel;
    niche: OnboardingNiche;
    budget: OnboardingBudget;
  }) => void;
}

const LEVEL_OPTS = [
  {
    value: "debutant" as OnboardingLevel,
    icon: Sprout,
    iconColor: "text-emerald-400",
    sel: "border-emerald-500/40 bg-emerald-500/8",
    selIcon: "bg-emerald-500/15",
  },
  {
    value: "intermediaire" as OnboardingLevel,
    icon: Rocket,
    iconColor: "text-blue-400",
    sel: "border-blue-500/40 bg-blue-500/8",
    selIcon: "bg-blue-500/15",
  },
  {
    value: "avance" as OnboardingLevel,
    icon: Trophy,
    iconColor: "text-yellow-400",
    sel: "border-yellow-500/40 bg-yellow-500/8",
    selIcon: "bg-yellow-500/15",
  },
];

const NICHE_OPTS = [
  {
    value: "tech" as OnboardingNiche,
    icon: Monitor,
    iconColor: "text-blue-400",
    sel: "border-blue-500/40 bg-blue-500/8",
    selIcon: "bg-blue-500/15",
  },
  {
    value: "beaute" as OnboardingNiche,
    icon: Sparkles,
    iconColor: "text-pink-400",
    sel: "border-pink-500/40 bg-pink-500/8",
    selIcon: "bg-pink-500/15",
  },
  {
    value: "maison" as OnboardingNiche,
    icon: Home,
    iconColor: "text-amber-400",
    sel: "border-amber-500/40 bg-amber-500/8",
    selIcon: "bg-amber-500/15",
  },
  {
    value: "sport" as OnboardingNiche,
    icon: Dumbbell,
    iconColor: "text-emerald-400",
    sel: "border-emerald-500/40 bg-emerald-500/8",
    selIcon: "bg-emerald-500/15",
  },
  {
    value: "autre" as OnboardingNiche,
    icon: CircleDashed,
    iconColor: "text-gray-400",
    sel: "border-gray-500/40 bg-gray-500/8",
    selIcon: "bg-gray-500/15",
  },
];

const BUDGET_OPTS = [
  {
    value: "low" as OnboardingBudget,
    icon: Wallet,
    iconColor: "text-emerald-400",
    sel: "border-emerald-500/40 bg-emerald-500/8",
    selIcon: "bg-emerald-500/15",
  },
  {
    value: "medium" as OnboardingBudget,
    icon: TrendingUp,
    iconColor: "text-blue-400",
    sel: "border-blue-500/40 bg-blue-500/8",
    selIcon: "bg-blue-500/15",
  },
  {
    value: "high" as OnboardingBudget,
    icon: Zap,
    iconColor: "text-yellow-400",
    sel: "border-yellow-500/40 bg-yellow-500/8",
    selIcon: "bg-yellow-500/15",
  },
];

function Check() {
  return (
    <div className="h-4 w-4 shrink-0 rounded-full bg-emerald-500 flex items-center justify-center">
      <svg viewBox="0 0 10 8" className="h-2 w-2 fill-white">
        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState<OnboardingLevel | null>(null);
  const [niche, setNiche] = useState<OnboardingNiche | null>(null);
  const [budget, setBudget] = useState<OnboardingBudget | null>(null);

  if (!isOpen) return null;

  const canNext = step === 1 ? !!level : step === 2 ? !!niche : !!budget;

  const handleNext = () => {
    if (step < 3) {
      setStep((s) => s + 1);
    } else if (level && niche && budget) {
      onComplete({ level, niche, budget });
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-sm rounded-2xl border border-[#1e1e2e] bg-[#0f0f17] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e1e2e] text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="mb-4">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">
                {t("onboarding.step")} {step} {t("onboarding.of")} 3
              </p>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      s <= step ? "bg-emerald-500" : "bg-[#2a2a3a]"
                    }`}
                  />
                ))}
              </div>
            </div>

            <h2 className="text-lg font-black text-white leading-tight">
              {step === 1
                ? t("onboarding.levelTitle")
                : step === 2
                ? t("onboarding.nicheTitle")
                : t("onboarding.budgetTitle")}
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              {step === 1
                ? t("onboarding.levelSubtitle")
                : step === 2
                ? t("onboarding.nicheSubtitle")
                : t("onboarding.budgetSubtitle")}
            </p>
          </div>

          {/* Step content */}
          <div className="px-6 pb-4">
            {/* Step 1 – Level */}
            {step === 1 && (
              <div className="space-y-2">
                {LEVEL_OPTS.map((opt) => {
                  const Icon = opt.icon;
                  const selected = level === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setLevel(opt.value)}
                      className={`w-full flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-150 ${
                        selected ? opt.sel : "border-[#1e1e2e] bg-[#12121a] hover:border-[#2e2e3e]"
                      }`}
                    >
                      <div
                        className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center transition-colors ${
                          selected ? opt.selIcon : "bg-[#1e1e2e]"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            selected ? opt.iconColor : "text-gray-500"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${selected ? "text-white" : "text-gray-300"}`}>
                          {t(`onboarding.${opt.value}`)}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {t(`onboarding.${opt.value}Desc`)}
                        </p>
                      </div>
                      {selected && <Check />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 2 – Niche */}
            {step === 2 && (
              <div className="grid grid-cols-2 gap-2">
                {NICHE_OPTS.map((opt) => {
                  const Icon = opt.icon;
                  const selected = niche === opt.value;
                  const isFullWidth = opt.value === "autre";
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setNiche(opt.value)}
                      className={`${isFullWidth ? "col-span-2" : ""} flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all duration-150 ${
                        selected ? opt.sel : "border-[#1e1e2e] bg-[#12121a] hover:border-[#2e2e3e]"
                      }`}
                    >
                      <div
                        className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center transition-colors ${
                          selected ? opt.selIcon : "bg-[#1e1e2e]"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            selected ? opt.iconColor : "text-gray-500"
                          }`}
                        />
                      </div>
                      <p className={`flex-1 text-sm font-semibold ${selected ? "text-white" : "text-gray-300"}`}>
                        {t(`onboarding.${opt.value}`)}
                      </p>
                      {selected && <Check />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 3 – Budget */}
            {step === 3 && (
              <div className="space-y-2">
                {BUDGET_OPTS.map((opt) => {
                  const Icon = opt.icon;
                  const selected = budget === opt.value;
                  const labelKey = `onboarding.budget${opt.value.charAt(0).toUpperCase()}${opt.value.slice(1)}` as const;
                  const descKey = `${labelKey}Desc` as const;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setBudget(opt.value)}
                      className={`w-full flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-150 ${
                        selected ? opt.sel : "border-[#1e1e2e] bg-[#12121a] hover:border-[#2e2e3e]"
                      }`}
                    >
                      <div
                        className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center transition-colors ${
                          selected ? opt.selIcon : "bg-[#1e1e2e]"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            selected ? opt.iconColor : "text-gray-500"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${selected ? "text-white" : "text-gray-300"}`}>
                          {t(labelKey)}
                        </p>
                        <p className="text-[10px] text-gray-500">{t(descKey)}</p>
                      </div>
                      {selected && <Check />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="px-6 pb-6 space-y-2">
            <button
              onClick={handleNext}
              disabled={!canNext}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-sm font-bold text-white hover:from-emerald-400 hover:to-blue-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step === 3 ? t("onboarding.finish") : t("onboarding.next")}
            </button>
            {step === 1 && (
              <button
                onClick={onClose}
                className="flex w-full items-center justify-center text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                {t("onboarding.skip")}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
