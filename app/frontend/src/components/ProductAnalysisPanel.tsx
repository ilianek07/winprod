import { Product } from "@/data/products";
import { X, ExternalLink, TrendingUp, Play, Award, Truck, Eye, Clock, Calculator } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnalysisPaywall } from "./AnalysisPaywall";
import { getAdsForNiche, formatImpressions, type FacebookAd } from "@/data/adspy";
import { useCJPrice } from "@/hooks/useCJPrice";
import { useFacebookAds } from "@/hooks/useFacebookAds";

interface ProductAnalysisPanelProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isPremium?: boolean;
  onPayment?: () => void;
}

function MiniChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 280;
  const height = 80;
  const padding = 4;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg width={width} height={height} className="w-full h-20">
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#chartGradient)" />
      <polyline
        points={points}
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SaturationGauge({ value, label }: { value: number; label: string }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const getColor = (val: number) => {
    if (val <= 25) return "#10b981";
    if (val <= 45) return "#22d3ee";
    if (val <= 65) return "#f59e0b";
    if (val <= 80) return "#f97316";
    return "#ef4444";
  };

  const getGradientColors = () => {
    return "from-emerald-500 via-yellow-500 to-red-500";
  };

  const color = getColor(animatedValue);
  const rotation = (animatedValue / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-24 overflow-hidden">
        <div className={`absolute inset-0 rounded-t-full bg-gradient-to-r ${getGradientColors()} opacity-20`} />
        <div className="absolute inset-[6px] rounded-t-full bg-[#12121a]" />

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
          <path
            d="M 20 95 A 80 80 0 0 1 180 95"
            fill="none"
            stroke="#1e1e2e"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 20 95 A 80 80 0 0 1 180 95"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(animatedValue / 100) * 251.2} 251.2`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div
          className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-1000 ease-out"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div className="w-0.5 h-16 bg-white rounded-full shadow-lg" />
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg" />
      </div>

      <div className="mt-3 text-center">
        <span className="text-2xl font-bold" style={{ color }}>{animatedValue}%</span>
        <p className="text-xs text-gray-400 mt-1 max-w-[200px]">{label}</p>
      </div>
    </div>
  );
}

// ─── Ad Spy panel ─────────────────────────────────────────────────────────────

function AdCard({ ad }: { ad: FacebookAd }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] p-3.5 hover:border-[#2a2a3e] transition-all space-y-2.5">
      {/* Page name badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 border border-blue-500/25 px-2.5 py-1 text-[10px] font-semibold text-blue-400">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
          {ad.pageName || "Facebook Ads"}
        </span>
        <div className="flex items-center gap-1 text-[10px] text-gray-500">
          <Clock className="h-3 w-3 shrink-0" />
          <span>
            {t("analysis.adspy.activeSince")}{" "}
            <span className="text-gray-300 font-medium">{ad.runningDays}</span>{" "}
            {t("analysis.adspy.days")}
          </span>
        </div>
      </div>

      {/* Body text */}
      {ad.body && (
        <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">{ad.body}</p>
      )}

      {/* Footer: impressions + CTA */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Eye className="h-3 w-3 text-gray-500 shrink-0" />
          <span className="text-xs font-bold text-gray-200">{formatImpressions(ad.impressionsLower)}</span>
          <span className="text-[10px] text-gray-600">{t("analysis.adspy.impressions")}</span>
        </div>
        {ad.snapshotUrl && (
          <a
            href={ad.snapshotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 rounded-lg border border-[#2a2a3e] bg-[#12121e] px-2.5 py-1.5 text-[10px] font-semibold text-gray-300 hover:text-white hover:border-gray-500 transition-all"
          >
            <ExternalLink className="h-3 w-3" />
            {t("analysis.viewAd")}
          </a>
        )}
      </div>
    </div>
  );
}

function AdCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] p-3.5 space-y-2.5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 w-32 rounded-full bg-[#1e1e2e]" />
        <div className="h-4 w-20 rounded bg-[#1e1e2e]" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-[#1e1e2e]" />
        <div className="h-3 w-4/5 rounded bg-[#1e1e2e]" />
        <div className="h-3 w-2/3 rounded bg-[#1e1e2e]" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-4 w-16 rounded bg-[#1e1e2e]" />
        <div className="h-6 w-20 rounded-lg bg-[#1e1e2e]" />
      </div>
    </div>
  );
}

function AdSpyPanel({ product }: { product: Product }) {
  const { t } = useTranslation();
  const { data: liveAds, isLoading } = useFacebookAds(product.name);
  const mockAds = getAdsForNiche(product.niche);

  const ads: FacebookAd[] = liveAds && liveAds.length > 0 ? liveAds : mockAds;
  const isLive = liveAds && liveAds.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-white">{t("analysis.adspy.title")}</h4>
            {isLive && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wide">
                <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">{t("analysis.adspy.subtitle")}</p>
        </div>
        <span className="rounded-full bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 text-[9px] font-bold text-amber-400 uppercase tracking-wide">
          VIP
        </span>
      </div>

      {/* Ad cards */}
      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <AdCardSkeleton key={i} />)
          : ads.map((ad) => <AdCard key={ad.id} ad={ad} />)
        }
      </div>

      {/* Search button */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{t("analysis.adspy.searchLive")}</p>
        <a
          href={`https://www.facebook.com/ads/library/?q=${encodeURIComponent(product.name)}&active_status=active`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          {t("analysis.adspy.searchFacebook")}
        </a>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-[10px] text-gray-600">{t("analysis.adspy.disclaimer")}</p>
    </div>
  );
}

// ─── Supplier recommendation logic ──────────────────────────────────────────

interface SupplierRec {
  id: string;
  name: string;
  initial: string;
  gradient: string;
  estimatedBuyPrice: number;
  estimatedMargin: number;
  shipping: string;
  reason: string;
  highlight: string;
  searchUrl: string;
}

function buildRec(
  id: string,
  name: string,
  initial: string,
  gradient: string,
  priceMultiplier: number,
  shipping: string,
  highlight: string,
  reason: string,
  searchUrl: string,
  product: Product
): SupplierRec {
  const buyPrice = Math.round(product.buyPrice * priceMultiplier * 100) / 100;
  const margin = Math.round(((product.sellPrice - buyPrice) / product.sellPrice) * 100);
  return { id, name, initial, gradient, estimatedBuyPrice: buyPrice, estimatedMargin: margin, shipping, highlight, reason, searchUrl };
}

function getSupplierRecommendation(product: Product): { primary: SupplierRec; alternatives: SupplierRec[] } {
  const encoded = encodeURIComponent(product.name);

  const all: SupplierRec[] = [
    buildRec(
      "aliexpress", "AliExpress", "AE", "from-orange-500 to-red-500",
      1.0, "15–45 jours", "Prix le plus bas",
      "Prix d'achat minimal pour maximiser la marge brute.",
      `https://www.aliexpress.com/wholesale?SearchText=${encoded}`,
      product
    ),
    buildRec(
      "cjdropshipping", "CJDropshipping", "CJ", "from-blue-500 to-indigo-600",
      1.12, "7–15 jours", "Meilleur équilibre",
      "Entrepôts EU/USA, branding personnalisé et automatisation complète.",
      `https://www.cjdropshipping.com/list?keyword=${encoded}`,
      product
    ),
    buildRec(
      "zendrop", "Zendrop", "Z", "from-emerald-500 to-teal-600",
      1.18, "3–7 jours (USA)", "Livraison rapide",
      "Idéal si ton audience cible est majoritairement aux États-Unis.",
      `https://www.zendrop.com/search?q=${encoded}`,
      product
    ),
    buildRec(
      "spocket", "Spocket", "Sp", "from-violet-500 to-purple-600",
      1.25, "2–5 jours (EU/USA)", "Qualité premium",
      "Fournisseurs vérifiés EU/USA — parfait pour un positionnement premium.",
      `https://www.spocket.co/products?search=${encoded}`,
      product
    ),
  ];

  const scores: Record<string, number> = { aliexpress: 0, cjdropshipping: 10, zendrop: 0, spocket: 0 };

  if (product.buyPrice < 5)  scores.aliexpress  += 30;
  if (product.buyPrice < 10) scores.aliexpress  += 15;
  if (product.buyPrice >= 5 && product.buyPrice <= 15) scores.cjdropshipping += 20;
  if (product.buyPrice > 12) scores.spocket     += 20;
  if (product.saturation < 35) scores.cjdropshipping += 25;
  if (product.margin > 80)   { scores.cjdropshipping += 15; scores.zendrop += 10; }
  if (product.trend > 40)    scores.zendrop     += 20;
  if (["Tech", "Beaute"].includes(product.niche)) scores.cjdropshipping += 15;
  if (product.sellPrice > 45) scores.spocket    += 15;

  const sorted = all.sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));
  return { primary: sorted[0], alternatives: sorted.slice(1) };
}

// ─── Supplier recommendation card ────────────────────────────────────────────

function SupplierRecommendation({ product }: { product: Product }) {
  const { t } = useTranslation();
  const { primary: rawPrimary, alternatives: rawAlternatives } = getSupplierRecommendation(product);
  const { data: cjPrice, isLoading: isLoadingCJ } = useCJPrice(product.name);

  const patchCJ = (s: SupplierRec): { rec: SupplierRec; isLive: boolean } => {
    if (s.id !== "cjdropshipping" || cjPrice == null) return { rec: s, isLive: false };
    const margin = Math.round(((product.sellPrice - cjPrice) / product.sellPrice) * 100);
    return { rec: { ...s, estimatedBuyPrice: cjPrice, estimatedMargin: margin }, isLive: true };
  };

  const { rec: primary, isLive: primaryIsLive } = patchCJ(rawPrimary);
  const patchedAlts = rawAlternatives.map((a) => patchCJ(a));

  const marginColor = (m: number) =>
    m >= 65 ? "text-emerald-400" : m >= 45 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="rounded-xl border border-amber-500/20 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-amber-900/20 to-orange-900/10 border-b border-amber-500/15">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">{t("analysis.supplierRec.title")}</span>
        </div>
        <span className="rounded-full bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 text-[9px] font-bold text-amber-400 uppercase tracking-wide">
          VIP
        </span>
      </div>

      <div className="bg-[#0f0f1a] p-4 space-y-3">
        <div className="rounded-xl border border-[#252535] bg-[#12121e] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${primary.gradient} shadow-lg`}>
              <span className="text-xs font-black text-white">{primary.initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white">{primary.name}</span>
                <span className={`rounded-full bg-gradient-to-r ${primary.gradient} px-2 py-0.5 text-[9px] font-bold text-white opacity-90`}>
                  ★ {primary.highlight}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{primary.reason}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-lg bg-[#0a0a12] border border-[#1e1e2e] p-2.5 text-center">
              <p className="text-[9px] text-gray-500 uppercase tracking-wider leading-none mb-1">
                {t("analysis.supplierRec.priceLbl")}
              </p>
              {primary.id === "cjdropshipping" && isLoadingCJ ? (
                <div className="h-4 w-12 mx-auto rounded bg-[#1e1e2e] animate-pulse" />
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <p className="text-xs font-bold leading-tight text-white">
                    {primary.estimatedBuyPrice.toFixed(2)}€
                  </p>
                  {primaryIsLive && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1 py-0.5 text-[8px] font-bold text-emerald-400 uppercase tracking-wide">
                      <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="rounded-lg bg-[#0a0a12] border border-[#1e1e2e] p-2.5 text-center">
              <p className="text-[9px] text-gray-500 uppercase tracking-wider leading-none mb-1">
                {t("analysis.supplierRec.marginLbl")}
              </p>
              <p className={`text-xs font-bold leading-tight ${marginColor(primary.estimatedMargin)}`}>
                {primary.estimatedMargin}%
              </p>
            </div>
            <div className="rounded-lg bg-[#0a0a12] border border-[#1e1e2e] p-2.5 text-center">
              <p className="text-[9px] text-gray-500 uppercase tracking-wider leading-none mb-1">
                {t("analysis.supplierRec.shippingLbl")}
              </p>
              <p className="text-xs font-bold leading-tight text-blue-400">{primary.shipping}</p>
            </div>
          </div>

          <a
            href={primary.searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${primary.gradient} py-2.5 text-xs font-bold text-white hover:opacity-90 active:scale-[0.98] transition-all shadow-md`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t("analysis.supplierRec.searchCta", { name: primary.name })}
          </a>
        </div>

        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Truck className="h-3 w-3" />
            {t("analysis.supplierRec.alternativesLbl")}
          </p>
          <div className="space-y-1.5">
            {patchedAlts.map(({ rec: alt, isLive: altIsLive }) => (
              <a
                key={alt.id}
                href={alt.searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] px-3 py-2.5 hover:border-[#2e2e4e] hover:bg-[#0f0f17] transition-all group/alt"
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${alt.gradient}`}>
                  <span className="text-[9px] font-black text-white">{alt.initial}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-gray-300 group-hover/alt:text-white transition-colors">{alt.name}</span>
                  <p className="text-[10px] text-gray-600 leading-none mt-0.5">{alt.shipping}</p>
                </div>
                <div className="text-right shrink-0">
                  {alt.id === "cjdropshipping" && isLoadingCJ ? (
                    <div className="h-3.5 w-10 rounded bg-[#1e1e2e] animate-pulse mb-1" />
                  ) : (
                    <div className="flex items-center justify-end gap-1">
                      <p className="text-xs font-bold text-white">{alt.estimatedBuyPrice.toFixed(2)}€</p>
                      {altIsLive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Prix réel CJ" />
                      )}
                    </div>
                  )}
                  <p className={`text-[10px] font-semibold ${marginColor(alt.estimatedMargin)}`}>{alt.estimatedMargin}%</p>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-600 group-hover/alt:text-gray-400 shrink-0 transition-colors" />
              </a>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-gray-600 text-center">{t("analysis.supplierRec.disclaimer")}</p>
      </div>
    </div>
  );
}

// ─── Profit Simulator ────────────────────────────────────────────────────────

function ProfitSimulator({ product }: { product: Product }) {
  const { t } = useTranslation();
  const [sellPrice, setSellPrice] = useState(product.sellPrice);
  const [buyPrice, setBuyPrice] = useState(product.buyPrice);
  const [shipping, setShipping] = useState(4.5);
  const [cpa, setCpa] = useState(product.cpa > 0 ? product.cpa : 12);
  const [gatewayRate, setGatewayRate] = useState(3);
  const [vat, setVat] = useState<0 | 20>(0);

  useEffect(() => {
    setSellPrice(product.sellPrice);
    setBuyPrice(product.buyPrice);
    setCpa(product.cpa > 0 ? product.cpa : 12);
  }, [product.id]);

  const gatewayFees = (sellPrice * gatewayRate) / 100;
  const vatAmount = vat === 20 ? sellPrice * (20 / 120) : 0;
  const netProfit = sellPrice - buyPrice - shipping - cpa - gatewayFees - vatAmount;
  const netMarginPct = sellPrice > 0 ? (netProfit / sellPrice) * 100 : 0;
  const isPositive = netProfit >= 0;

  const numInput = (
    value: number,
    onChange: (v: number) => void,
    suffix: "€" | "%"
  ) => (
    <div className="relative">
      <input
        type="number"
        min={0}
        step={suffix === "€" ? 0.01 : 0.1}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full rounded-lg border border-[#2a2a3e] bg-[#0a0a12] py-2 pl-3 pr-6 text-sm font-semibold text-white focus:border-blue-500/50 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-500">
        {suffix}
      </span>
    </div>
  );

  const labelCls = "text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1 block";

  return (
    <div className="rounded-xl border border-blue-500/20 bg-[#12121a] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-900/20 to-indigo-900/10 border-b border-blue-500/15">
        <Calculator className="h-4 w-4 text-blue-400" />
        <span className="text-sm font-semibold text-white">{t("analysis.simulator.title")}</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Inputs — 2-column grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className={labelCls}>{t("analysis.simulator.sellPrice")}</label>
            {numInput(sellPrice, setSellPrice, "€")}
          </div>
          <div>
            <label className={labelCls}>{t("analysis.simulator.buyPrice")}</label>
            {numInput(buyPrice, setBuyPrice, "€")}
          </div>
          <div>
            <label className={labelCls}>{t("analysis.simulator.shipping")}</label>
            {numInput(shipping, setShipping, "€")}
          </div>
          <div>
            <label className={labelCls}>{t("analysis.simulator.cpa")}</label>
            {numInput(cpa, setCpa, "€")}
          </div>
          <div>
            <label className={labelCls}>{t("analysis.simulator.gateway")}</label>
            {numInput(gatewayRate, setGatewayRate, "%")}
          </div>
          <div>
            <label className={labelCls}>{t("analysis.simulator.vat")}</label>
            <div className="flex rounded-lg border border-[#2a2a3e] bg-[#0a0a12] p-0.5 gap-0.5 h-[38px]">
              <button
                onClick={() => setVat(0)}
                className={`flex-1 rounded-md text-xs font-semibold transition-all ${
                  vat === 0 ? "bg-[#1e1e2e] text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                0%
              </button>
              <button
                onClick={() => setVat(20)}
                className={`flex-1 rounded-md text-xs font-semibold transition-all ${
                  vat === 20 ? "bg-blue-500/20 text-blue-400" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                20%
              </button>
            </div>
          </div>
        </div>

        {/* Computed deductions */}
        <div className="rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] px-3 py-2.5 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">{t("analysis.simulator.gatewayBreakdown")} ({gatewayRate}%)</span>
            <span className="text-red-400/80">−{gatewayFees.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">{t("analysis.simulator.vatBreakdown")} ({vat}%)</span>
            <span className={vat > 0 ? "text-red-400/80" : "text-gray-600"}>
              {vat > 0 ? `−${vatAmount.toFixed(2)}€` : "—"}
            </span>
          </div>
        </div>

        {/* Result */}
        <div
          className={`rounded-xl border p-4 text-center ${
            isPositive ? "border-emerald-500/25 bg-emerald-500/5" : "border-red-500/25 bg-red-500/5"
          }`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
            {t("analysis.simulator.netProfit")}
          </p>
          <p className={`text-2xl font-black ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {isPositive ? "+" : ""}
            {netProfit.toFixed(2)}€
          </p>
          <p className={`mt-1 text-xs font-medium ${isPositive ? "text-emerald-500/70" : "text-red-500/70"}`}>
            {netMarginPct.toFixed(1)}% {t("analysis.simulator.netMargin")}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function ProductAnalysisPanel({ product, isOpen, onClose, isPremium = false, onPayment }: ProductAnalysisPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"analyse" | "ads">("analyse");

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    setActiveTab("analyse");
  }, [product?.id]);

  if (!product) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[#0f0f17] border-l border-[#1e1e2e] shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1e1e2e] bg-[#0f0f17]/95 backdrop-blur-sm px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="text-lg font-bold text-white">{t("analysis.title")}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e1e2e] text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* VIP Paywall for non-premium users */}
          {!isPremium && onPayment && (
            <AnalysisPaywall onPayment={onPayment} />
          )}

          {/* Product content — only visible for premium users */}
          {!isPremium && onPayment ? null : (
          <>
            {/* Product Image */}
            <div className="relative overflow-hidden rounded-xl border border-[#1e1e2e] bg-[#12121a]">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">+{product.trend}%</span>
                {product.trendBreakdown && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
            </div>

            {/* Product Name & Niche */}
            <div>
              <h3 className="text-xl font-bold text-white">{product.name}</h3>
              <span className="inline-block mt-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400">
                {product.niche}
              </span>
            </div>

            {/* Tab bar */}
            <div className="flex rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] p-1 gap-1">
              <button
                onClick={() => setActiveTab("analyse")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                  activeTab === "analyse"
                    ? "bg-[#1e1e2e] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {t("analysis.analyseTab")}
              </button>
              <button
                onClick={() => setActiveTab("ads")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                  activeTab === "ads"
                    ? "bg-[#1e1e2e] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Play className="h-3.5 w-3.5" />
                {t("analysis.adsTab")}
              </button>
            </div>

            {/* ── Analyse tab ── */}
            {activeTab === "analyse" && (
            <>
              {/* Real Trend Score Breakdown */}
              {product.trendBreakdown ? (
                <div className="rounded-xl border border-emerald-500/20 bg-[#12121a] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-300">{t("analysis.trendScore")}</h4>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">Live</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10 px-3 py-2.5">
                    <span className="text-xs font-medium text-emerald-300">{t("analysis.globalScore")}</span>
                    <span className="text-xl font-bold text-emerald-400">{product.trendBreakdown.score}%</span>
                  </div>

                  <div className="space-y-3">
                    {([
                      { label: "Google Trends", value: product.trendBreakdown.google, weight: "40%", textColor: "text-blue-400", barColor: "bg-blue-500", bgColor: "bg-blue-500/10" },
                      { label: "TikTok Creative Center", value: product.trendBreakdown.tiktok, weight: "35%", textColor: "text-pink-400", barColor: "bg-pink-500", bgColor: "bg-pink-500/10" },
                      { label: t("analysis.aliexpressOrders"), value: product.trendBreakdown.aliexpress, weight: "25%", textColor: "text-orange-400", barColor: "bg-orange-500", bgColor: "bg-orange-500/10" },
                    ] as const).map(({ label, value, weight, textColor, barColor, bgColor }) => (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-400">{label}</span>
                            <span className="text-[9px] text-gray-600 bg-[#1e1e2e] rounded px-1 py-0.5">{weight}</span>
                          </div>
                          <span className={`text-xs font-bold ${textColor}`}>{value}%</span>
                        </div>
                        <div className={`h-1.5 w-full rounded-full ${bgColor}`}>
                          <div
                            className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Trend Chart */}
              <div className="rounded-xl border border-[#1e1e2e] bg-[#12121a] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-300">{t("analysis.trendChart")}</h4>
                  <span className="text-xs text-emerald-400 font-medium">{t("analysis.goingUp")}</span>
                </div>
                <MiniChart data={product.trendData} />
                <p className="text-[10px] text-gray-500 mt-2">{t("analysis.demandEvolution")}</p>
              </div>

              {/* Market Saturation Gauge */}
              <div className="rounded-xl border border-[#1e1e2e] bg-[#12121a] p-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-4">{t("analysis.saturationScore")}</h4>
                <SaturationGauge value={product.saturation} label={product.saturationLabel} />
                <div className="flex items-center justify-between mt-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-gray-500">{t("analysis.blueOcean")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-[10px] text-gray-500">{t("analysis.moderate")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[10px] text-gray-500">{t("analysis.saturated")}</span>
                  </div>
                </div>
              </div>

              {/* Financial Analysis */}
              <div className="rounded-xl border border-[#1e1e2e] bg-[#12121a] p-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">{t("analysis.financial")}</h4>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between py-2 border-b border-[#1e1e2e]">
                    <span className="text-xs text-gray-400">{t("analysis.productCost")}</span>
                    <span className="text-sm font-semibold text-white">{product.buyPrice.toFixed(2)}&#8364;</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#1e1e2e]">
                    <span className="text-xs text-gray-400">{t("analysis.sellingPrice")}</span>
                    <span className="text-sm font-semibold text-emerald-400">{product.sellPrice.toFixed(2)}&#8364;</span>
                  </div>
                  <div className="flex items-center justify-between py-2 bg-emerald-500/5 rounded-lg px-3 -mx-1">
                    <span className="text-xs font-medium text-emerald-300">{t("analysis.profitMargin")}</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-bold text-emerald-400">{product.margin}%</span>
                      <span className="text-[9px] text-gray-500 uppercase tracking-wide">brute</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profit Simulator */}
              <ProfitSimulator product={product} />

              {/* Supplier Recommendation */}
              <SupplierRecommendation product={product} />

              {/* Target Audience */}
              <div className="rounded-xl border border-[#1e1e2e] bg-[#12121a] p-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">{t("analysis.targeting")}</h4>
                <div className="flex flex-wrap gap-2">
                  {product.targetAudience.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 text-xs font-medium text-purple-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <a
                  href={`https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t("analysis.searchAliexpress")}
                </a>
              </div>
            </>
            )}

            {/* ── Ads tab ── */}
            {activeTab === "ads" && <AdSpyPanel product={product} />}
          </>
          )}
        </div>
      </div>
    </>
  );
}
