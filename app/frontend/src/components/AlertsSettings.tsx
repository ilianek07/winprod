import { useState, useEffect } from "react";
import { Bell, TrendingUp, Trophy, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getAlertPreferences, updateAlertPreferences } from "@/lib/alerts-api";

interface AlertsSettingsProps {
  email: string;
}

interface Prefs {
  alert_trend_surge: boolean;
  alert_top10_entry: boolean;
  alert_new_pepite: boolean;
}

export function AlertsSettings({ email }: AlertsSettingsProps) {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<Prefs>({
    alert_trend_surge: false,
    alert_top10_entry: false,
    alert_new_pepite: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAlertPreferences(email).then((p) => {
      if (p) {
        setPrefs({
          alert_trend_surge: p.alert_trend_surge,
          alert_top10_entry: p.alert_top10_entry,
          alert_new_pepite: p.alert_new_pepite,
        });
      }
      setLoading(false);
    });
  }, [email]);

  const toggle = async (key: keyof Prefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSaving(true);
    await updateAlertPreferences(email, next);
    setSaving(false);
  };

  if (loading) return null;

  const rows = [
    {
      icon: TrendingUp,
      color: "text-orange-400",
      label: t("alerts.trendSurge"),
      desc: t("alerts.trendSurgeDesc"),
      key: "alert_trend_surge" as keyof Prefs,
    },
    {
      icon: Trophy,
      color: "text-yellow-400",
      label: t("alerts.top10Entry"),
      desc: t("alerts.top10EntryDesc"),
      key: "alert_top10_entry" as keyof Prefs,
    },
    {
      icon: Sparkles,
      color: "text-violet-400",
      label: t("alerts.newPepite"),
      desc: t("alerts.newPepiteDesc"),
      key: "alert_new_pepite" as keyof Prefs,
    },
  ];

  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] p-3 mt-3">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Bell className="h-3.5 w-3.5 text-gray-400" />
        <p className="text-xs font-semibold text-gray-300">{t("alerts.title")}</p>
        {saving && (
          <span className="ml-auto text-[9px] text-gray-500">{t("alerts.saving")}</span>
        )}
      </div>
      <div className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.key} className="flex items-start gap-2.5">
            <row.icon className={`h-3.5 w-3.5 ${row.color} mt-0.5 shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-gray-200 leading-none">{row.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{row.desc}</p>
            </div>
            <button
              onClick={() => toggle(row.key)}
              aria-pressed={prefs[row.key]}
              className={`relative shrink-0 h-5 w-9 rounded-full transition-colors duration-200 focus:outline-none ${
                prefs[row.key] ? "bg-emerald-500" : "bg-[#2a2a3a]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  prefs[row.key] ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
