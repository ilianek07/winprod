import { useState, useCallback, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Leaderboard } from "@/components/Leaderboard";
import { ProductAnalysisPanel } from "@/components/ProductAnalysisPanel";
import { LoginModal } from "@/components/LoginModal";
import { WelcomeVipModal } from "@/components/WelcomeVipModal";
import { OnboardingModal } from "@/components/OnboardingModal";
import { productsByCategory, CategoryKey, Product } from "@/data/products";
import { getCurrentUser, setUserPremium, syncSubscriptionStatus, User as AuthUser } from "@/lib/auth";
import {
  type OnboardingPrefs,
  type OnboardingNiche,
  getOnboardingPrefs,
  saveOnboardingPrefs,
  hasCompletedOnboarding,
} from "@/lib/onboarding";
import { useTrendScores } from "@/hooks/useTrendScores";
import { PepitesSection } from "@/components/PepitesSection";
import { AICoach } from "@/components/AICoach";
import { BeginnerGuide } from "@/components/BeginnerGuide";
import { NotificationPanel, NotificationEvent } from "@/components/NotificationPanel";

const NICHE_TO_CATEGORY: Record<OnboardingNiche, CategoryKey> = {
  tech: "global",
  beaute: "beauty",
  maison: "maison",
  sport: "sport",
  autre: "global",
};

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("global");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isWelcomeVipOpen, setIsWelcomeVipOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [onboardingPrefs, setOnboardingPrefs] = useState<OnboardingPrefs | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('checkout_success');
    const cancel = params.get('checkout_cancel');

    // Clean the URL regardless
    if (success || cancel) {
      const clean = window.location.pathname;
      window.history.replaceState({}, '', clean);
    }

    if (success) {
      // Stripe webhook may take a few seconds — poll subscription status
      let attempts = 0;
      const poll = async () => {
        attempts++;
        const isPremium = await syncSubscriptionStatus();
        if (isPremium) {
          setCurrentUser(getCurrentUser());
          setCheckoutMessage('Abonnement VIP activé ! Bienvenue.');
          setTimeout(() => setCheckoutMessage(null), 5000);
        } else if (attempts < 5) {
          setTimeout(poll, 2000);
        } else {
          // Webhook not yet processed — optimistically grant access and re-sync later
          setUserPremium(true);
          setCurrentUser(getCurrentUser());
          setCheckoutMessage('Paiement reçu. Activation en cours...');
          setTimeout(() => setCheckoutMessage(null), 5000);
        }
      };
      poll();
    } else if (cancel) {
      setCheckoutMessage('Paiement annulé.');
      setTimeout(() => setCheckoutMessage(null), 4000);
    } else {
      // Normal load — sync subscription status silently
      syncSubscriptionStatus().then(() => setCurrentUser(getCurrentUser()));
    }

    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
      const prefs = getOnboardingPrefs(user.email);
      if (prefs) {
        setOnboardingPrefs(prefs);
        // Auto-ouvrir le guide pour les nouveaux débutants
        if (prefs.level === "debutant") {
          setActiveCategory("beginners");
        }
      }
    }
  }, []);

  const currentProducts = activeCategory === "beginners" ? [] : (productsByCategory[activeCategory] || []);

  const { data: trendScores, isLoading: isLoadingTrends } = useTrendScores(currentProducts);

  // Merge real trend scores and re-rank products by actual trend score
  const enrichedProducts = useMemo<Product[]>(() => {
    const withScores = currentProducts.map((p) => {
      const breakdown = trendScores?.[p.id];
      // Only apply real score if at least one source returned data (score > 0)
      // If all sources failed, breakdown.score === 0 — keep static value instead
      if (!breakdown || breakdown.sources_hit === 0) return p;
      return { ...p, trend: Math.round(breakdown.score), trendBreakdown: breakdown };
    });

    // Only re-rank if at least one product has real data
    const hasRealData = withScores.some((p) => p.trendBreakdown !== undefined);
    if (!hasRealData) return withScores;

    const sorted = [...withScores].sort((a, b) => b.trend - a.trend);
    return sorted.map((p, idx) => ({
      ...p,
      rank: idx + 1,
      rankMovement: (idx + 1 < p.rank ? "up" : idx + 1 > p.rank ? "down" : "stable") as "up" | "down" | "stable",
    }));
  }, [currentProducts, trendScores]);

  const notifications = useMemo<NotificationEvent[]>(() => {
    const source = productsByCategory.global;
    if (!source.length) return [];
    const now = Date.now();
    const offsets = [2, 7, 14, 23, 38, 55, 82, 120, 195, 260];
    let slot = 0;
    const nextTs = () => new Date(now - offsets[Math.min(slot++, offsets.length - 1)] * 60000);
    const events: NotificationEvent[] = [];

    source
      .filter(p => p.rank <= 10 && p.rankMovement === "up")
      .slice(0, 3)
      .forEach(p => events.push({ id: `top10_${p.id}`, type: "top10_entry", message: `${p.name} entre dans le Top ${p.rank}`, timestamp: nextTs() }));

    source
      .filter(p => p.trend >= 60)
      .slice(0, 2)
      .forEach(p => events.push({ id: `trend_${p.id}`, type: "trend_surge", message: `${p.name} explose — score tendance ${p.trend}`, timestamp: nextTs() }));

    const captured = new Set(events.map(e => e.id));
    source
      .filter(p => p.rankMovement === "up" && !captured.has(`top10_${p.id}`) && !captured.has(`trend_${p.id}`))
      .slice(0, 3)
      .forEach(p => events.push({ id: `rank_${p.id}`, type: "rank_up", message: `${p.name} monte dans le classement (Position #${p.rank})`, timestamp: nextTs() }));

    source
      .filter(p => p.margin >= 85 && p.saturation < 30)
      .slice(0, 2)
      .forEach(p => events.push({ id: `pepite_${p.id}`, type: "new_pepite", message: `Nouvelle pépite détectée : ${p.name} (${p.margin}% de marge)`, timestamp: nextTs() }));

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, []);

  const handleBellClick = useCallback(() => {
    if (currentUser?.isPremium) {
      setIsNotificationOpen(prev => !prev);
    } else {
      setIsNotificationOpen(false);
      setIsWelcomeVipOpen(true);
    }
  }, [currentUser]);

  const handleAnalyse = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  }, []);

  const handleOpenLogin = useCallback(() => {
    setIsLoginOpen(true);
  }, []);

  const handleCloseLogin = useCallback(() => {
    setIsLoginOpen(false);
  }, []);

  const handleAuthChange = useCallback((user: AuthUser | null) => {
    setCurrentUser(user);
    if (user) {
      setTimeout(() => {
        setIsLoginOpen(false);
        if (!hasCompletedOnboarding(user.email)) {
          // New user — show onboarding first
          setIsOnboardingOpen(true);
        } else if (!user.isPremium) {
          // Returning non-VIP — upsell modal
          setIsWelcomeVipOpen(true);
        }
      }, 300);
    }
  }, []);

  const handleVipPayment = useCallback(() => {
    const updatedUser = getCurrentUser();
    setCurrentUser(updatedUser);
    setIsWelcomeVipOpen(false);
  }, []);

  const handleOnboardingComplete = useCallback(
    (prefs: { level: OnboardingPrefs["level"]; niche: OnboardingPrefs["niche"]; budget: OnboardingPrefs["budget"] }) => {
      const user = getCurrentUser();
      if (user) {
        const saved = saveOnboardingPrefs(user.email, prefs);
        setOnboardingPrefs(saved);
        setActiveCategory(NICHE_TO_CATEGORY[prefs.niche]);
      }
      setIsOnboardingOpen(false);
      // Show VIP upsell after a brief pause for non-premium users
      const u = getCurrentUser();
      if (u && !u.isPremium) {
        setTimeout(() => setIsWelcomeVipOpen(true), 400);
      }
    },
    []
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Header onLoginClick={handleOpenLogin} onBellClick={handleBellClick} user={currentUser} />

      {checkoutMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-[#0f1a12] px-4 py-2.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-sm text-emerald-400 font-medium">{checkoutMessage}</span>
        </div>
      )}

      <main className="flex gap-0 lg:gap-6 px-4 lg:px-6 pb-8 pt-4 max-w-[1600px] mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          isPremium={currentUser?.isPremium}
          isDebutant={onboardingPrefs?.level === "debutant"}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {activeCategory === "beginners" ? (
            <BeginnerGuide
              isPremium={currentUser?.isPremium}
              onPayment={handleVipPayment}
            />
          ) : activeCategory === "pepites" ? (
            <PepitesSection
              isPremium={currentUser?.isPremium}
              onAnalyse={handleAnalyse}
              onPayment={handleVipPayment}
            />
          ) : (
            <Leaderboard products={enrichedProducts} onAnalyse={handleAnalyse} isLoadingTrends={isLoadingTrends} preferredNiche={onboardingPrefs?.niche} />
          )}
        </div>
      </main>

      {/* Analysis Slide-over Panel (VIP locked for non-premium) */}
      <ProductAnalysisPanel
        product={selectedProduct}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        isPremium={currentUser?.isPremium}
        onPayment={handleVipPayment}
      />

      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={handleCloseLogin} onAuthChange={handleAuthChange} />

      {/* Welcome VIP Upsell Modal (shows after login) */}
      <WelcomeVipModal
        isOpen={isWelcomeVipOpen}
        onClose={() => setIsWelcomeVipOpen(false)}
        onPayment={handleVipPayment}
      />

      {/* Notification Panel (VIP only) */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
      />

      {/* Onboarding Modal (shows once after first registration) */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
      />

      {/* AI Business Coach — floating chat widget */}
      <AICoach
        isPremium={currentUser?.isPremium}
        onVipClick={() => setIsWelcomeVipOpen(true)}
      />
    </div>
  );
};

export default Index;