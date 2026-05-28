export type SupplierCategory = "general" | "pod" | "us-eu" | "wholesale";

export interface Supplier {
  id: string;
  name: string;
  tagline: string;
  initial: string;
  gradient: string;
  bgLight: string;
  category: SupplierCategory;
  pros: string[];
  cons: string[];
  url: string;
  shipsFrom: string;
  integrations: string;
  recommended?: boolean;
}

export const suppliers: Supplier[] = [
  {
    id: "aliexpress",
    name: "AliExpress",
    tagline: "Le géant chinois du dropshipping",
    initial: "AE",
    gradient: "from-orange-500 to-red-500",
    bgLight: "bg-orange-500/10 border-orange-500/20",
    category: "general",
    pros: [
      "Prix ultra-bas, marges 70–90%",
      "Catalogue de +100 millions de produits",
      "Livraison ePacket vers 200+ pays",
      "Aucun minimum de commande",
      "Idéal pour tester rapidement",
    ],
    cons: [
      "Délais longs : 15 à 45 jours",
      "Qualité produit très variable",
      "Pas de branding personnalisé",
      "SAV difficile en cas de litige",
    ],
    url: "https://www.aliexpress.com",
    shipsFrom: "Chine",
    integrations: "DSers, AutoDS, Oberlo",
  },
  {
    id: "cjdropshipping",
    name: "CJDropshipping",
    tagline: "L'agent sourcing tout-en-un",
    initial: "CJ",
    gradient: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-500/10 border-blue-500/20",
    category: "general",
    pros: [
      "Entrepôts en Chine, USA et Europe",
      "Photos et vidéos produit incluses",
      "Branding et packaging personnalisé",
      "Traitement des commandes automatisé",
      "Support réactif en anglais",
    ],
    cons: [
      "Interface parfois complexe",
      "Prix légèrement plus élevés qu'AliExpress",
      "Délais variables selon entrepôt",
    ],
    url: "https://cjdropshipping.com",
    shipsFrom: "Chine · USA · EU",
    integrations: "Shopify, WooCommerce, TikTok Shop",
    recommended: true,
  },
  {
    id: "zendrop",
    name: "Zendrop",
    tagline: "Automatisation et rapidité",
    initial: "Z",
    gradient: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-500/10 border-emerald-500/20",
    category: "general",
    pros: [
      "Automatisation complète des commandes",
      "Expédition depuis les USA (3–5 jours)",
      "Branding & emballage personnalisé",
      "Interface intuitive pour débutants",
      "Plan gratuit disponible",
    ],
    cons: [
      "Catalogue plus restreint qu'AliExpress",
      "Fonctions avancées réservées au plan payant",
      "Prix plus élevés sur les produits US",
    ],
    url: "https://zendrop.com",
    shipsFrom: "USA · Chine",
    integrations: "Shopify",
  },
  {
    id: "spocket",
    name: "Spocket",
    tagline: "Fournisseurs USA & Europe premium",
    initial: "Sp",
    gradient: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-500/10 border-violet-500/20",
    category: "us-eu",
    pros: [
      "Fournisseurs 100% USA et Europe",
      "Livraison 2 à 5 jours ouvrés",
      "Qualité produit vérifiée et premium",
      "Réductions d'achat jusqu'à 60%",
      "Intégration native Shopify & WooCommerce",
    ],
    cons: [
      "Pas de plan entièrement gratuit",
      "Prix d'achat plus élevés qu'en Chine",
      "Catalogue moins large",
    ],
    url: "https://spocket.co",
    shipsFrom: "USA · Europe",
    integrations: "Shopify, WooCommerce, Wix",
  },
  {
    id: "printful",
    name: "Printful",
    tagline: "Print-on-demand haute qualité",
    initial: "Pf",
    gradient: "from-slate-500 to-slate-700",
    bgLight: "bg-slate-500/10 border-slate-500/20",
    category: "pod",
    pros: [
      "Qualité d'impression professionnelle",
      "Expédition depuis USA, Europe et Mexique",
      "Branding complet : étiquettes, packaging",
      "Pas de stock ni de commande minimum",
      "Large gamme : vêtements, accessoires, déco",
    ],
    cons: [
      "Marges plus faibles (30–50% en moyenne)",
      "Prix d'achat plus élevés",
      "Non adapté aux produits non-imprimés",
    ],
    url: "https://printful.com",
    shipsFrom: "USA · Europe · Mexique",
    integrations: "Shopify, Etsy, WooCommerce, Amazon",
  },
  {
    id: "printify",
    name: "Printify",
    tagline: "POD avec réseau mondial d'imprimeurs",
    initial: "Py",
    gradient: "from-cyan-500 to-blue-600",
    bgLight: "bg-cyan-500/10 border-cyan-500/20",
    category: "pod",
    pros: [
      "Réseau de +90 imprimeurs dans le monde",
      "Prix parmi les plus bas du POD",
      "Plan gratuit disponible",
      "Grande variété de produits imprimables",
      "Idéal pour réduire les coûts POD",
    ],
    cons: [
      "Qualité variable selon l'imprimeur choisi",
      "Moins de contrôle sur la logistique",
      "Support client moins réactif que Printful",
    ],
    url: "https://printify.com",
    shipsFrom: "Mondial (selon imprimeur)",
    integrations: "Shopify, Etsy, WooCommerce, eBay",
  },
  {
    id: "modalyst",
    name: "Modalyst",
    tagline: "Marques et produits tendance",
    initial: "Mo",
    gradient: "from-pink-500 to-rose-600",
    bgLight: "bg-pink-500/10 border-pink-500/20",
    category: "us-eu",
    pros: [
      "Accès à des marques reconnues (luxe & lifestyle)",
      "Livraison rapide USA (2–5 jours)",
      "Produits de niche haut de gamme",
      "Intégration Shopify fluide",
    ],
    cons: [
      "Prix d'achat élevés = marges réduites",
      "Catalogue limité vs AliExpress",
      "Abonnement payant pour les meilleures offres",
    ],
    url: "https://modalyst.com",
    shipsFrom: "USA · Europe",
    integrations: "Shopify, BigCommerce, Wix",
  },
  {
    id: "wholesale2b",
    name: "Wholesale2B",
    tagline: "Grossiste multi-plateformes",
    initial: "W2B",
    gradient: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-500/10 border-amber-500/20",
    category: "wholesale",
    pros: [
      "Plus d'1 million de produits disponibles",
      "Compatible avec 100+ plateformes e-commerce",
      "Prix grossiste très compétitifs",
      "Synchronisation automatique des stocks",
    ],
    cons: [
      "Interface vieillissante et peu ergonomique",
      "Frais mensuels par plateforme utilisée",
      "Support client limité",
      "Délais de livraison variables",
    ],
    url: "https://wholesale2b.com",
    shipsFrom: "USA",
    integrations: "Shopify, Amazon, eBay, WooCommerce",
  },
];

export const categoryMeta: Record<SupplierCategory, { label: string; color: string }> = {
  general: { label: "Général", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  pod: { label: "Print-on-Demand", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  "us-eu": { label: "USA / EU", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  wholesale: { label: "Wholesale", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
};
