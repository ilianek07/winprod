import { Target, Package, ShoppingBag, Megaphone, BarChart2, ChevronRight, Crown, Sparkles, TrendingUp, Zap } from "lucide-react";
import { StripePaymentModule } from "./LoginModal";

interface BeginnerGuideProps {
  isPremium?: boolean;
  onPayment: () => void;
}

const TIPS = [
  {
    number: "01",
    icon: Target,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    accent: "from-blue-500/20 to-transparent",
    title: "Choisis ta niche",
    body: "Concentre-toi sur un seul domaine que tu comprends ou qui te passionne : sport, beauté, tech, maison. Une niche ciblée = moins de concurrence, un message plus fort, et des clients qui convertissent mieux.",
    tip: "💡 Astuce : commence par analyser ce qui cartonne sur TikTok dans ta niche avant d'acheter quoi que ce soit.",
  },
  {
    number: "02",
    icon: Package,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    accent: "from-emerald-500/20 to-transparent",
    title: "Trouve un fournisseur fiable",
    body: "AliExpress pour démarrer sans frais, CJDropshipping pour des délais plus courts (7-15 jours EU/USA). Commande toujours un échantillon avant de mettre le produit en vente — la qualité est ta réputation.",
    tip: "💡 Astuce : vérifie les avis du fournisseur et son taux de litige avant de te lancer.",
  },
  {
    number: "03",
    icon: ShoppingBag,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    accent: "from-violet-500/20 to-transparent",
    title: "Crée ta boutique Shopify",
    body: "3 jours d'essai gratuit, puis 1€/mois pendant 3 mois. Choisis un thème simple (Dawn ou Refresh), installe DSers pour automatiser les commandes, configure Stripe ou PayPal comme moyen de paiement.",
    tip: "💡 Astuce : inutile d'avoir 50 produits au départ. Lance avec 3-5 produits bien présentés.",
  },
  {
    number: "04",
    icon: Megaphone,
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
    accent: "from-pink-500/20 to-transparent",
    title: "Lance ta première pub",
    body: "Commence avec TikTok Ads ou Meta Ads à 5-10€/jour. Teste 3 à 5 visuels différents (vidéo UGC > image). Après 3-4 jours, coupe ce qui ne convertit pas et double la mise sur le meilleur.",
    tip: "💡 Astuce : une vidéo filmée de façon naturelle (\"comme un vrai utilisateur\") performe souvent mieux qu'une pub trop léchée.",
  },
  {
    number: "05",
    icon: BarChart2,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    accent: "from-orange-500/20 to-transparent",
    title: "Analyse et ajuste",
    body: "Les deux métriques clés : ton CPA (coût par vente) et ta marge produit. Si CPA > marge, tu perds de l'argent — coupe et teste un autre produit. Si CPA < marge, scale progressivement en augmentant le budget de 20% tous les 2 jours.",
    tip: "💡 Astuce : un seul produit winner peut changer complètement tes résultats. La persévérance est clé.",
  },
] as const;

const VIP_FEATURES = [
  { icon: TrendingUp, text: "Produits winners analysés en temps réel", color: "text-emerald-400" },
  { icon: Sparkles,  text: "Pépites virales avant tout le monde",     color: "text-yellow-400" },
  { icon: Zap,       text: "Score de saturation & CPA estimé",        color: "text-blue-400"   },
];

export function BeginnerGuide({ isPremium, onPayment }: BeginnerGuideProps) {
  return (
    <div className="flex-1 min-w-0 space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-[#1e1e2e] bg-[#12121a] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20">
            <span className="text-2xl">🚀</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-black text-white">Conseils pour débutants</h1>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Guide Gratuit
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xl">
              Tu démarres en dropshipping ? Pas de panique. Voici les 5 étapes essentielles pour
              lancer ton premier produit sans se perdre — et sans brûler ton budget.
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="space-y-4">
        {TIPS.map((tip) => (
          <div
            key={tip.number}
            className="group rounded-xl border border-[#1e1e2e] bg-[#12121a] overflow-hidden hover:border-[#2a2a3e] transition-colors duration-200"
          >
            <div className={`h-0.5 w-full bg-gradient-to-r ${tip.accent}`} />
            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* Step number + icon */}
                <div className="shrink-0 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-black text-gray-600 tracking-widest">
                    {tip.number}
                  </span>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${tip.bg}`}>
                    <tip.icon className={`h-5 w-5 ${tip.color}`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="text-base font-bold text-white mb-2">{tip.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-3">{tip.body}</p>
                  <div className="rounded-lg bg-[#0a0a0f] border border-[#1e1e2e] px-3.5 py-2.5">
                    <p className="text-xs text-gray-300 leading-relaxed">{tip.tip}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress encouragement */}
      <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/15 to-teal-900/10 p-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="text-sm font-bold text-white">Tu as maintenant les bases.</p>
            <p className="text-sm text-gray-400 mt-0.5">
              La prochaine étape, c'est de trouver <span className="text-emerald-400 font-semibold">le bon produit</span> — celui qui va vraiment cartonner. C'est là que WinProd devient ton meilleur allié.
            </p>
          </div>
        </div>
      </div>

      {/* VIP upsell */}
      {!isPremium && (
        <div className="rounded-xl border border-yellow-500/25 bg-gradient-to-br from-yellow-900/15 via-[#0f0f17] to-amber-900/10 overflow-hidden">
          {/* Top banner */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-yellow-500/15 bg-yellow-500/5">
            <Crown className="h-4 w-4 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
              Tu veux aller plus loin ?
            </span>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <h2 className="text-lg font-black text-white leading-tight mb-1.5">
                Accède aux produits gagnants analysés en temps réel
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Arrête de chercher le bon produit pendant des heures. WinProd VIP te donne directement
                le Top 20 des winners du moment — avec les données qui comptent vraiment.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-2.5">
              {VIP_FEATURES.map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#12121a] border border-[#1e1e2e]">
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                  <span className="text-sm text-gray-300">{text}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-600 ml-auto shrink-0" />
                </div>
              ))}
            </div>

            {/* Testimonial mini */}
            <div className="rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-black text-white">AM</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white">Alexandre M. — débutant il y a 2 mois</p>
                  <div className="flex gap-px mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-[9px] text-yellow-400">★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 leading-snug italic">
                "J'avais peur de choisir le mauvais produit. WinProd m'a montré exactement quoi vendre et à qui.
                Mon premier mois : 1 400 € de CA, 380 € de marge nette. Je recommence ce mois avec un 2ème produit."
              </p>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <StripePaymentModule onPayment={onPayment} />
              <p className="text-center text-[10px] text-gray-600">
                Sans engagement · 5€/mois · Annulez à tout moment
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Already premium */}
      {isPremium && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-center gap-4">
          <Crown className="h-8 w-8 text-yellow-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-white">Tu es membre VIP — tu as déjà tout !</p>
            <p className="text-sm text-gray-400 mt-0.5">
              Consulte le classement, les Pépites et les analyses produit pour trouver ton prochain winner.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
