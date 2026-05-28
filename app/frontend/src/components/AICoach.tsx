import { useState } from "react";
import { MessageSquare, X, ChevronDown, Sparkles, Bell, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const WAITLIST_KEY = "winprod_coach_waitlist_email";

interface AICoachProps {
  isPremium?: boolean;
  onVipClick?: () => void;
}

export function AICoach({ isPremium: _isPremium, onVipClick: _onVipClick }: AICoachProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(() => !!localStorage.getItem(WAITLIST_KEY));
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t("coach.emailError"));
      return;
    }
    localStorage.setItem(WAITLIST_KEY, trimmed);
    setSubmitted(true);
    setError("");
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 ${
          isOpen
            ? "bg-[#1a1a28] border border-[#2a2a3e] hover:border-[#3a3a5e]"
            : "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/30 hover:scale-105 hover:shadow-violet-500/50"
        }`}
        title={t("coach.toggle")}
      >
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-gray-300" />
        ) : (
          <>
            <MessageSquare className="h-6 w-6 text-white" />
            {!submitted && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-violet-300 border-2 border-[#0a0a0f] animate-pulse" />
            )}
          </>
        )}
      </button>

      {/* Coming soon panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl border border-[#1e1e30] bg-[#0d0d16] shadow-2xl shadow-black/70 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e30] bg-gradient-to-r from-violet-900/20 to-indigo-900/20">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 flex-shrink-0">
                <Sparkles className="h-[18px] w-[18px] text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">{t("coach.headerTitle")}</p>
                <p className="text-[10px] text-violet-400 leading-tight">{t("coach.subtitle")}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-600 hover:text-gray-300 transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-6 space-y-5">
            {/* Coming soon badge + title */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="relative flex items-center justify-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center">
                  <span className="text-3xl">🤖</span>
                </div>
                <div className="absolute -top-1.5 -right-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 px-2 py-0.5">
                  <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide">{t("coach.comingSoonBadge")}</span>
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">{t("coach.comingSoonTitle")}</h3>
                <p className="mt-1.5 text-xs text-gray-400 leading-relaxed max-w-[260px] mx-auto">
                  {t("coach.comingSoonDesc")}
                </p>
              </div>
            </div>

            {/* Feature list */}
            <ul className="space-y-2 rounded-xl border border-[#1e1e30] bg-[#0a0a12] px-4 py-3">
              {[
                t("coach.feat1"),
                t("coach.feat2"),
                t("coach.feat3"),
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-2.5 text-xs text-gray-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>

            {/* Waitlist form / success */}
            {submitted ? (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-400">{t("coach.successTitle")}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t("coach.successDesc")}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div className="space-y-1.5">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder={t("coach.emailPlaceholder")}
                    className="w-full rounded-xl border border-[#2a2a3e] bg-[#14141f] px-3.5 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors"
                  />
                  {error && <p className="text-[11px] text-red-400 pl-1">{error}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-semibold text-white hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-violet-500/20"
                >
                  <Bell className="h-3.5 w-3.5" />
                  {t("coach.ctaLabel")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
