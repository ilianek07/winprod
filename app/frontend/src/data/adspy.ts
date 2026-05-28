export interface FacebookAd {
  id: string;
  pageName: string;
  body: string;
  snapshotUrl: string;
  runningDays: number;
  impressionsLower: number;
}

const FB_LIBRARY = (q: string) =>
  `https://www.facebook.com/ads/library/?q=${encodeURIComponent(q)}&active_status=active`;

const TECH: FacebookAd[] = [
  { id: "t1", pageName: "TechGadgets FR", body: "Découvrez notre gadget révolutionnaire qui va changer votre quotidien. Livraison offerte en France !", snapshotUrl: FB_LIBRARY("gadget tech"), runningDays: 47, impressionsLower: 150000 },
  { id: "t2", pageName: "InnoShop", body: "⚡ Nouveau ! Le produit tech dont tout le monde parle. -30% aujourd'hui seulement.", snapshotUrl: FB_LIBRARY("inno tech shop"), runningDays: 23, impressionsLower: 89000 },
  { id: "t3", pageName: "SmartLife Store", body: "Simplifiez votre vie avec cette technologie incontournable. 4.8/5 ⭐ — Plus de 10 000 clients satisfaits.", snapshotUrl: FB_LIBRARY("smartlife gadget"), runningDays: 61, impressionsLower: 210000 },
  { id: "t4", pageName: "ElecPro", body: "Le meilleur rapport qualité/prix du marché. Profitez de la livraison express 48h.", snapshotUrl: FB_LIBRARY("elecpro"), runningDays: 18, impressionsLower: 64000 },
  { id: "t5", pageName: "ModernTech", body: "🔥 Rupture de stock imminente ! Commandez maintenant et recevez un cadeau surprise.", snapshotUrl: FB_LIBRARY("modern tech gadget"), runningDays: 89, impressionsLower: 320000 },
];

const BEAUTE: FacebookAd[] = [
  { id: "b1", pageName: "GlowBeauté", body: "Votre routine beauté en 2 minutes. Ce sérum a changé la peau de 50 000 Françaises ✨", snapshotUrl: FB_LIBRARY("serum beaute glow"), runningDays: 34, impressionsLower: 180000 },
  { id: "b2", pageName: "SkinLab Paris", body: "La formule dermatologique qui efface les imperfections en 14 jours. Résultats garantis.", snapshotUrl: FB_LIBRARY("skinlab paris beaute"), runningDays: 52, impressionsLower: 250000 },
  { id: "b3", pageName: "BeautyDrop", body: "🌸 Nouveau drop beauté ! Le produit star des influenceuses TikTok est enfin disponible.", snapshotUrl: FB_LIBRARY("beautydrop soin"), runningDays: 21, impressionsLower: 95000 },
  { id: "b4", pageName: "Naturelle & Moi", body: "100% naturel, 0% compromis. Prenez soin de votre peau comme jamais avant.", snapshotUrl: FB_LIBRARY("naturelle cosmetique"), runningDays: 14, impressionsLower: 42000 },
  { id: "b5", pageName: "Éclat Studio", body: "Le secret de beauté des professionnels enfin accessible. Offre de lancement -40%.", snapshotUrl: FB_LIBRARY("eclat studio beaute"), runningDays: 67, impressionsLower: 195000 },
];

const MAISON: FacebookAd[] = [
  { id: "m1", pageName: "MaisonSmart", body: "Transformez votre intérieur avec ce produit tendance ! Livraison offerte dès 30€.", snapshotUrl: FB_LIBRARY("maison smart deco"), runningDays: 38, impressionsLower: 110000 },
  { id: "m2", pageName: "CasaDecoFR", body: "L'accessoire déco qui fait sensation sur Pinterest. +2000 avis 5 étoiles ⭐", snapshotUrl: FB_LIBRARY("casadeco maison"), runningDays: 15, impressionsLower: 72000 },
  { id: "m3", pageName: "Côté Maison", body: "🏠 Organisez enfin votre maison avec style. Nos clientes adorent — voyez pourquoi.", snapshotUrl: FB_LIBRARY("cote maison organisation"), runningDays: 52, impressionsLower: 145000 },
  { id: "m4", pageName: "HomeTrend", body: "Coup de cœur garanti ! Ce produit polyvalent change la vie à la maison.", snapshotUrl: FB_LIBRARY("hometrend maison"), runningDays: 28, impressionsLower: 58000 },
  { id: "m5", pageName: "DécoEssence", body: "La tendance déco 2025 est là. Commandez avant rupture de stock 🎯", snapshotUrl: FB_LIBRARY("decoessence tendance"), runningDays: 73, impressionsLower: 280000 },
];

const SPORT: FacebookAd[] = [
  { id: "s1", pageName: "FitLife FR", body: "Atteignez vos objectifs fitness en 30 jours. Utilisé par + de 20 000 sportifs.", snapshotUrl: FB_LIBRARY("fitlife sport fitness"), runningDays: 42, impressionsLower: 175000 },
  { id: "s2", pageName: "SportPerf", body: "⚡ Boostez vos performances ! La solution que les coachs ne veulent pas que vous connaissiez.", snapshotUrl: FB_LIBRARY("sportperf coaching"), runningDays: 19, impressionsLower: 88000 },
  { id: "s3", pageName: "ActiveZone", body: "L'équipement sport qui a révolutionné les entraînements à domicile. Essayez-le 30 jours.", snapshotUrl: FB_LIBRARY("activezone sport home"), runningDays: 88, impressionsLower: 340000 },
  { id: "s4", pageName: "ProFit Store", body: "🏋️ Entraînez-vous comme un pro depuis chez vous. Livraison en 48h, retours gratuits.", snapshotUrl: FB_LIBRARY("profit store sport"), runningDays: 31, impressionsLower: 62000 },
  { id: "s5", pageName: "RunShape", body: "Le must-have des runners français. Léger, performant, pas cher. Vite, stock limité !", snapshotUrl: FB_LIBRARY("runshape running"), runningDays: 56, impressionsLower: 130000 },
];

const DEFAULT: FacebookAd[] = [
  { id: "d1", pageName: "TrendShop FR", body: "Le produit dont tout le monde parle en ce moment 🔥 Commandez avant la rupture !", snapshotUrl: FB_LIBRARY("trendshop produit"), runningDays: 35, impressionsLower: 155000 },
  { id: "d2", pageName: "ShopWin", body: "4.9/5 sur plus de 5 000 avis. Découvrez pourquoi nos clients nous recommandent.", snapshotUrl: FB_LIBRARY("shopwin winner"), runningDays: 26, impressionsLower: 98000 },
  { id: "d3", pageName: "WinProducts", body: "🎯 Produit viral de la semaine ! Rejoignez les 30 000 clients déjà conquis.", snapshotUrl: FB_LIBRARY("winproducts viral"), runningDays: 71, impressionsLower: 290000 },
  { id: "d4", pageName: "TopDeal Store", body: "La meilleure affaire du moment. Qualité premium, prix imbattable. Expédition rapide.", snapshotUrl: FB_LIBRARY("topdeal store"), runningDays: 22, impressionsLower: 67000 },
  { id: "d5", pageName: "MegaShop24", body: "✅ Certifié, testé, approuvé ! Votre satisfaction est notre priorité. -35% ce week-end.", snapshotUrl: FB_LIBRARY("megashop24"), runningDays: 48, impressionsLower: 210000 },
];

export function getAdsForNiche(niche: string): FacebookAd[] {
  const n = niche.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (n.includes("tech") || n.includes("gaming") || n.includes("gadget") || n.includes("electronique")) return TECH;
  if (n.includes("beaute") || n.includes("skincare") || n.includes("maquillage") || n.includes("coiffure") || n.includes("soin")) return BEAUTE;
  if (n.includes("maison") || n.includes("cuisine") || n.includes("deco") || n.includes("rangement") || n.includes("bureau")) return MAISON;
  if (n.includes("sport") || n.includes("fitness") || n.includes("outdoor") || n.includes("yoga")) return SPORT;
  return DEFAULT;
}

export function formatImpressions(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K+`;
  return String(n);
}
