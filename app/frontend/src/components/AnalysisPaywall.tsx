import { Lock, BarChart3, Sparkles, Award, Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StripePaymentModule } from "./LoginModal";

interface AnalysisPaywallProps {
  onPayment: () => void;
}

export function AnalysisPaywall({ onPayment }: AnalysisPaywallProps) {
  const { t } = useTranslation();

  const features = [
    { icon: BarChart3, color: "text-blue-400",    bg: "border-blue-500/15   bg-blue-500/5",    text: t("paywall.feature1") },
    { icon: Sparkles,  color: "text-yellow-400",  bg: "border-yellow-500/15 bg-yellow-500/5",  text: t("paywall.feature2") },
    { icon: Award,     color: "text-emerald-400", bg: "border-emerald-500/15 bg-emerald-500/5", text: t("paywall.feature3") },
    { icon: Bell,      color: "text-orange-400",  bg: "border-orange-500/15 bg-orange-500/5",  text: t("paywall.feature4") },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center py-10 px-6">
      {/* Blurred skeleton */}
      <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none select-none" aria-hidden>
        <div className="blur-lg opacity-25 p-6 space-y-4">
          <div className="h-8 w-48 bg-emerald-500/20 rounded-lg" />
          <div className="h-32 w-full bg-blue-500/10 rounded-lg" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-20 bg-emerald-500/10 rounded-lg" />
            <div className="h-20 bg-yellow-500/10 rounded-lg" />
            <div className="h-20 bg-purple-500/10 rounded-lg" />
          </div>
          <div className="h-24 w-full bg-amber-500/10 rounded-lg" />
          <div className="h-16 w-full bg-violet-500/10 rounded-lg" />
        </div>
      </div>

      {/* Overlay content */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-sm">
        {/* Lock icon */}
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400/20 to-amber-600/20 border border-yellow-500/30 shadow-lg shadow-yellow-500/10">
          <Lock className="h-7 w-7 text-yellow-400" />
        </div>

        <h3 className="text-lg font-black text-white mb-1">{t("paywall.title")}</h3>
        <p className="text-sm text-gray-400 mb-5 leading-relaxed">{t("paywall.hook")}</p>

        {/* Feature list */}
        <div className="w-full space-y-2 mb-6">
          {features.map((f, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-xl border ${f.bg} px-3 py-2.5`}
            >
              <f.icon className={`h-4 w-4 ${f.color} shrink-0`} />
              <span className="text-xs text-gray-300 text-left">{f.text}</span>
            </div>
          ))}
        </div>

        <div className="w-full">
          <StripePaymentModule onPayment={onPayment} />
        </div>
        <p className="mt-2 text-[10px] text-gray-600">{t("paywall.noCommitment")}</p>
      </div>
    </div>
  );
}
