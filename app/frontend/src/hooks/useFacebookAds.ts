import { useQuery } from "@tanstack/react-query";
import { getAPIBaseURL } from "@/lib/config";
import type { FacebookAd } from "@/data/adspy";

async function fetchFacebookAds(keyword: string): Promise<FacebookAd[]> {
  const base = getAPIBaseURL();
  const res = await fetch(`${base}/api/v1/ads/facebook?keyword=${encodeURIComponent(keyword)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.ads ?? []) as FacebookAd[];
}

export function useFacebookAds(productName: string, enabled = true) {
  return useQuery({
    queryKey: ["fb-ads", productName],
    queryFn: () => fetchFacebookAds(productName),
    staleTime: 2 * 60 * 60 * 1000,
    gcTime: 3 * 60 * 60 * 1000,
    retry: 1,
    enabled: enabled && !!productName,
  });
}
