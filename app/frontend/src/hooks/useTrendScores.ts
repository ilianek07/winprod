import { useQuery } from "@tanstack/react-query";
import { getAPIBaseURL } from "@/lib/config";
import { Product, TrendBreakdown } from "@/data/products";

interface BatchResponse {
  scores: Array<{
    keyword: string;
    google: number;
    google_7d: number;
    tiktok: number;
    aliexpress: number;
    score: number;
    sources_hit: number;
    cached: boolean;
  }>;
}

async function fetchBatchScores(products: Product[]): Promise<Record<number, TrendBreakdown>> {
  const base = getAPIBaseURL();
  const response = await fetch(`${base}/api/v1/trends/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keywords: products.map((p) => p.name) }),
  });

  if (!response.ok) throw new Error(`Trend API ${response.status}`);

  const data: BatchResponse = await response.json();
  const result: Record<number, TrendBreakdown> = {};

  data.scores.forEach((s, idx) => {
    if (products[idx]) {
      result[products[idx].id] = {
        google: s.google,
        google_7d: s.google_7d ?? 0,
        tiktok: s.tiktok,
        aliexpress: s.aliexpress,
        score: s.score,
        sources_hit: s.sources_hit ?? 0,
      };
    }
  });

  return result;
}

export function useTrendScores(products: Product[]) {
  const cacheKey = products.map((p) => p.id).join(",");

  return useQuery({
    queryKey: ["trend-scores", cacheKey],
    queryFn: () => fetchBatchScores(products),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    enabled: products.length > 0,
  });
}
