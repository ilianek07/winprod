import { getAPIBaseURL } from './config';

export interface AlertPreferences {
  email: string;
  alert_trend_surge: boolean;
  alert_top10_entry: boolean;
  alert_new_pepite: boolean;
}

export type AlertPrefsUpdate = Omit<AlertPreferences, 'email'>;

export async function getAlertPreferences(email: string): Promise<AlertPreferences | null> {
  try {
    const res = await fetch(
      `${getAPIBaseURL()}/api/v1/alerts/preferences?email=${encodeURIComponent(email)}`
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function updateAlertPreferences(
  email: string,
  prefs: AlertPrefsUpdate
): Promise<AlertPreferences | null> {
  try {
    const res = await fetch(
      `${getAPIBaseURL()}/api/v1/alerts/preferences?email=${encodeURIComponent(email)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
