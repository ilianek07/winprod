import { useQuery } from "@tanstack/react-query";
import { getAPIBaseURL } from "@/lib/config";

async function fetchCJPrice(keyword: string): Promise<number | null> {
  const resp = await fetch(
    `${getAPIBaseURL()}/api/v1/cj/price?keyword=${encodeURIComponent(keyword)}`
  );
  if (!resp.ok) return null;
  const data = await resp.json();
  return typeof data.price === "number" ? data.price : null;
}

export function useCJPrice(productName: string, enabled = true) {
  return useQuery({
    queryKey: ["cj-price", productName],
    queryFn: () => fetchCJPrice(productName),
    staleTime: 4 * 60 * 60 * 1000,
    gcTime: 6 * 60 * 60 * 1000,
    retry: 1,
    enabled: enabled && !!productName,
  });
}
