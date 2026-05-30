import { useState } from "react";
import { ExternalLink, Check, X, MapPin, Puzzle, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { LoginModal } from "@/components/LoginModal";
import { AICoach } from "@/components/AICoach";
import { WelcomeVipModal } from "@/components/WelcomeVipModal";
import { suppliers, categoryMeta, Supplier } from "@/data/suppliers";
import { getCurrentUser, User as AuthUser } from "@/lib/auth";

export default function SuppliersPage() {
  const { t } = useTranslation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isVipOpen, setIsVipOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentUser());

  const handleAuthChange = (user: AuthUser | null) => {
    setCurrentUser(user);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Header
        onLoginClick={() => setIsLoginOpen(true)}
        user={currentUser}
      />

      <main className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-black text-white">{t("suppliers.title")}</h1>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              {suppliers.length} {t("suppliers.count")}
            </span>
          </div>
          <p className="text-sm text-gray-400 max-w-2xl">{t("suppliers.desc")}</p>

          {/* Category legend */}
          <div className="mt-4 flex flex-wrap gap-2">
            {(Object.entries(categoryMeta) as [keyof typeof categoryMeta, typeof categoryMeta[keyof typeof categoryMeta]][]).map(
              ([, meta]) => (
                <span
                  key={meta.label}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${meta.color}`}
                >
                  {meta.label}
                </span>
              )
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} t={t} />
          ))}
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-center text-xs text-gray-600">
          {t("suppliers.disclaimer")}
        </p>
      </main>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onAuthChange={handleAuthChange}
      />
      <WelcomeVipModal
        isOpen={isVipOpen}
        onClose={() => setIsVipOpen(false)}
        onPayment={() => {
          setCurrentUser(getCurrentUser());
          setIsVipOpen(false);
        }}
      />
      <AICoach isPremium={currentUser?.isPremium} onVipClick={() => setIsVipOpen(true)} />
    </div>
  );
}

function SupplierCard({ supplier, t }: { supplier: Supplier; t: (key: string) => string }) {
  const meta = categoryMeta[supplier.category];

  return (
    <div className="group flex flex-col rounded-2xl border border-[#1e1e2e] bg-[#12121a] hover:border-[#2e2e4e] transition-all duration-300 overflow-hidden">
      {/* Card top: logo + name + badges */}
      <div className="flex items-start gap-4 p-5 pb-4">
        {/* Logo */}
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${supplier.gradient} shadow-lg`}
        >
          <span className="text-sm font-black text-white tracking-tight">{supplier.initial}</span>
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-white leading-tight">{supplier.name}</h2>
            {supplier.recommended && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                <Star className="h-2.5 w-2.5 fill-amber-400" />
                {t("suppliers.recommended")}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-gray-400">{supplier.tagline}</p>
          <span className={`mt-1.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.color}`}>
            {meta.label}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-[#1e1e2e]" />

      {/* Pros + Cons */}
      <div className="grid grid-cols-2 gap-3 p-5 pt-4 flex-1">
        {/* Pros */}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
            {t("suppliers.pros")}
          </p>
          <ul className="space-y-1.5">
            {supplier.pros.map((pro, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                <span className="text-[11px] leading-snug text-gray-300">{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-red-400">
            {t("suppliers.cons")}
          </p>
          <ul className="space-y-1.5">
            {supplier.cons.map((con, i) => (
              <li key={i} className="flex items-start gap-2">
                <X className="mt-0.5 h-3 w-3 shrink-0 text-red-400" />
                <span className="text-[11px] leading-snug text-gray-300">{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer: ships from + integrations + CTA */}
      <div className="border-t border-[#1e1e2e] px-5 py-3.5 flex items-center justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{supplier.shipsFrom}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Puzzle className="h-3 w-3 shrink-0" />
            <span className="truncate">{supplier.integrations}</span>
          </div>
        </div>

        <a
          href={supplier.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`shrink-0 flex items-center gap-1.5 rounded-xl bg-gradient-to-br ${supplier.gradient} px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-90 active:scale-95 transition-all`}
        >
          {t("suppliers.visit")}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
