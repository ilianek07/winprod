import { X, TrendingUp, Trophy, Sparkles, ArrowUp } from "lucide-react";

export interface NotificationEvent {
  id: string;
  type: "trend_surge" | "top10_entry" | "new_pepite" | "rank_up";
  message: string;
  timestamp: Date;
}

const TYPE_CONFIG = {
  trend_surge: {
    icon: TrendingUp,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    label: "Tendance",
  },
  top10_entry: {
    icon: Trophy,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    label: "Top 10",
  },
  new_pepite: {
    icon: Sparkles,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    label: "Pépite",
  },
  rank_up: {
    icon: ArrowUp,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    label: "Montée",
  },
};

function formatRelativeTime(date: Date): string {
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  const diffH = Math.floor(diffMin / 60);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} minute${diffMin > 1 ? "s" : ""}`;
  if (diffH < 24) return `Il y a ${diffH} heure${diffH > 1 ? "s" : ""}`;
  return `Il y a ${Math.floor(diffH / 24)} jour${Math.floor(diffH / 24) > 1 ? "s" : ""}`;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationEvent[];
}

export function NotificationPanel({ isOpen, onClose, notifications }: NotificationPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed top-[60px] right-4 sm:right-6 z-50 w-80">
        <div className="rounded-xl border border-[#1e1e2e] bg-[#0f0f17] shadow-2xl shadow-black/60 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e2e]">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-white">Notifications Live</span>
              {notifications.length > 0 && (
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  {notifications.length}
                </span>
              )}
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Events list */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10">
                <Sparkles className="h-6 w-6 text-gray-600" />
                <p className="text-xs text-gray-500">Aucun événement récent</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1e1e2e]/60">
                {notifications.map((notif) => {
                  const { icon: Icon, color, bg, label } = TYPE_CONFIG[notif.type];
                  return (
                    <div key={notif.id} className="flex gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-200 leading-snug">{notif.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-semibold ${color}`}>{label}</span>
                          <span className="text-[10px] text-gray-600">{formatRelativeTime(notif.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#1e1e2e] px-4 py-2 bg-[#0a0a0f]/60">
            <p className="text-[10px] text-gray-600 text-center">
              Mis à jour en temps réel · Exclusif VIP
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
