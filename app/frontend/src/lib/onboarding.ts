export type OnboardingLevel = "debutant" | "intermediaire" | "avance";
export type OnboardingNiche = "tech" | "beaute" | "maison" | "sport" | "autre";
export type OnboardingBudget = "low" | "medium" | "high";

export interface OnboardingPrefs {
  level: OnboardingLevel;
  niche: OnboardingNiche;
  budget: OnboardingBudget;
  completedAt: string;
}

function storageKey(email: string) {
  return `winprod_onboarding_${email.toLowerCase().trim()}`;
}

export function getOnboardingPrefs(email: string): OnboardingPrefs | null {
  try {
    const raw = localStorage.getItem(storageKey(email));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveOnboardingPrefs(
  email: string,
  prefs: Omit<OnboardingPrefs, "completedAt">
): OnboardingPrefs {
  const full: OnboardingPrefs = { ...prefs, completedAt: new Date().toISOString() };
  localStorage.setItem(storageKey(email), JSON.stringify(full));
  return full;
}

export function hasCompletedOnboarding(email: string): boolean {
  return getOnboardingPrefs(email) !== null;
}

// Normalised product-niche strings that belong to each onboarding niche
const NICHE_PRODUCT_MAP: Record<OnboardingNiche, string[]> = {
  tech: ["tech", "gaming", "gadgets", "electronique", "beaute tech"],
  beaute: ["beaute", "beaute tech", "skincare", "coiffure", "maquillage", "soin", "bien-etre"],
  maison: ["maison", "cuisine", "rangement", "bureau", "deco", "salle de bain"],
  sport: ["sport", "outdoor", "fitness"],
  autre: [],
};

export function nicheMatchesProduct(
  pref: OnboardingNiche,
  productNiche: string
): boolean {
  if (pref === "autre") return false;
  const normalised = productNiche
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return NICHE_PRODUCT_MAP[pref].some((k) => normalised.includes(k));
}
