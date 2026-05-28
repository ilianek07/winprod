import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAPIBaseURL } from "@/lib/config";
import { productsByCategory, Product, TrendBreakdown } from "@/data/products";

// All static-category products
const ALL_PRODUCTS = [
  ...productsByCategory.global,
  ...productsByCategory.budget,
  ...productsByCategory.tiktok,
  ...productsByCategory.highMargin,
  ...productsByCategory.problemSolving,
  ...productsByCategory.beauty,
];

// Pre-filter candidates by static criteria: low saturation + good margin
const CANDIDATES = ALL_PRODUCTS.filter(
  (p) => p.saturation <= 40 && p.margin >= 78
);

export interface PepiteProduct extends Product {
  pepiteScore: number;
  pepiteIsReal: boolean;
  pepiteCriteria: {
    googleMomentum: number;
    saturationScore: number;
    tiktokScore: number;
    marginScore: number;
  };
}

function computePepiteScore(
  product: Product,
  breakdown?: TrendBreakdown
): { score: number; isReal: boolean; criteria: PepiteProduct["pepiteCriteria"] } {
  const saturationScore = Math.max(0, 100 - product.saturation);
  const marginScore = Math.max(0, Math.min(100, ((product.margin - 65) / 30) * 100));

  if (!breakdown || breakdown.sources_hit === 0) {
    // Fallback on static data: saturation + margin + static trend
    const score = Math.round(
      saturationScore * 0.40 + marginScore * 0.30 + product.trend * 0.30
    );
    return {
      score,
      isReal: false,
      criteria: {
        googleMomentum: product.trend,
        saturationScore,
        tiktokScore: 0,
        marginScore,
      },
    };
  }

  const googleMomentum = breakdown.google_7d > 0 ? breakdown.google_7d : breakdown.google;
  const tiktokScore = breakdown.tiktok;

  const score = Math.round(
    googleMomentum * 0.30 +
    saturationScore * 0.25 +
    tiktokScore * 0.25 +
    marginScore * 0.20
  );

  return {
    score,
    isReal: true,
    criteria: { googleMomentum, saturationScore, tiktokScore, marginScore },
  };
}

async function fetchCandidateScores(): Promise<Record<number, TrendBreakdown>> {
  const base = getAPIBaseURL();
  const response = await fetch(`${base}/api/v1/trends/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keywords: CANDIDATES.map((p) => p.name) }),
  });

  if (!response.ok) throw new Error(`Pepites API ${response.status}`);

  const data = await response.json();
  const result: Record<number, TrendBreakdown> = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (data.scores as any[]).forEach((s: any, idx: number) => {
    if (CANDIDATES[idx]) {
      result[CANDIDATES[idx].id] = {
        google: s.google ?? 0,
        google_7d: s.google_7d ?? 0,
        tiktok: s.tiktok ?? 0,
        aliexpress: s.aliexpress ?? 0,
        score: s.score ?? 0,
        sources_hit: s.sources_hit ?? 0,
      };
    }
  });

  return result;
}

export function usePepites() {
  const { data: scores, isLoading } = useQuery({
    queryKey: ["pepites-scores"],
    queryFn: fetchCandidateScores,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });

  const pepites = useMemo<PepiteProduct[]>(() => {
    return CANDIDATES.map((p) => {
      const breakdown = scores?.[p.id];
      const { score, isReal, criteria } = computePepiteScore(p, breakdown);
      return {
        ...p,
        trendBreakdown: breakdown,
        pepiteScore: score,
        pepiteIsReal: isReal,
        pepiteCriteria: criteria,
      };
    })
      .sort((a, b) => b.pepiteScore - a.pepiteScore)
      .slice(0, 10);
  }, [scores]);

  return { pepites, isLoading, totalCandidates: CANDIDATES.length };
}
