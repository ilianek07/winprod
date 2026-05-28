import axios, { AxiosInstance } from 'axios';
import { getAPIBaseURL } from './config';

class RPApi {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private getBaseURL() {
    return getAPIBaseURL();
  }

  async getCurrentUser() {
    try {
      const response = await this.client.get(
        `${this.getBaseURL()}/api/v1/auth/me`
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        return null;
      }
      throw new Error(
        error.response?.data?.detail || 'Failed to get user info'
      );
    }
  }

  async login() {
    try {
      const response = await this.client.get(
        `${this.getBaseURL()}/api/v1/auth/login`
      );
      window.location.href = response.data.redirect_url;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || 'Failed to initiate login'
      );
    }
  }

  async logout() {
    try {
      const response = await this.client.get(
        `${this.getBaseURL()}/api/v1/auth/logout`
      );
      window.location.href = response.data.redirect_url;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to logout');
    }
  }
}

export const authApi = new RPApi();

export interface User {
  id: string;
  email: string;
  isPremium: boolean;
}

const STORAGE_KEY = 'auth_user';

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function signIn(email: string, _password: string): Promise<{ user: User | null; error: string | null }> {
  const existing = getCurrentUser();
  // Preserve isPremium if signing in with the same email
  const isPremium = existing?.email === email ? existing.isPremium : false;
  const user: User = { id: crypto.randomUUID(), email, isPremium };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return { user, error: null };
}

export async function signUp(email: string, _password: string): Promise<{ user: User | null; error: string | null }> {
  const user: User = { id: crypto.randomUUID(), email, isPremium: false };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return { user, error: null };
}

export function signOut(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function setUserPremium(value: boolean): void {
  const user = getCurrentUser();
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...user, isPremium: value }));
  }
}

/** @deprecated Use setUserPremium(true) */
export function upgradeToPremium(): void {
  setUserPremium(true);
}

// ---------------------------------------------------------------------------
// Dev-only console helpers (only injected outside production builds)
// Usage from the browser console:
//   __devSetVip()                  — grants VIP to the currently logged-in user
//   __devSetVip("other@email.com") — grants VIP to a specific email
//   __devRevokeVip()               — removes VIP from the current user
// ---------------------------------------------------------------------------
if (typeof window !== "undefined" && import.meta.env.DEV) {
  (window as Record<string, unknown>).__devSetVip = async (email?: string) => {
    const user = getCurrentUser();
    const target = (email ?? user?.email ?? "").trim().toLowerCase();
    if (!target) {
      console.warn("[DEV] Fournissez un email ou connectez-vous d'abord.");
      return;
    }
    const { getAPIBaseURL } = await import("./config");
    const res = await fetch(
      `${getAPIBaseURL()}/api/v1/dev/set-vip?email=${encodeURIComponent(target)}`
    );
    const data = await res.json();
    console.log("[DEV] set-vip →", data);
    if (data.ok) {
      await syncSubscriptionStatus();
      console.log("[DEV] VIP accorde ✓ — rechargement...");
      setTimeout(() => window.location.reload(), 300);
    }
  };

  (window as Record<string, unknown>).__devRevokeVip = async (email?: string) => {
    const user = getCurrentUser();
    const target = (email ?? user?.email ?? "").trim().toLowerCase();
    if (!target) {
      console.warn("[DEV] Fournissez un email ou connectez-vous d'abord.");
      return;
    }
    const { getAPIBaseURL } = await import("./config");
    const res = await fetch(
      `${getAPIBaseURL()}/api/v1/dev/revoke-vip?email=${encodeURIComponent(target)}`
    );
    const data = await res.json();
    console.log("[DEV] revoke-vip →", data);
    if (data.ok) {
      setUserPremium(false);
      console.log("[DEV] VIP retire ✓ — rechargement...");
      setTimeout(() => window.location.reload(), 300);
    }
  };
}

export async function checkSubscriptionStatus(email: string): Promise<{
  status: string;
  is_active: boolean;
  current_period_end: string | null;
} | null> {
  try {
    const res = await fetch(
      `${getAPIBaseURL()}/api/v1/payment/subscription-status?email=${encodeURIComponent(email)}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Sync subscription status from backend and update localStorage.
 * Returns the updated isPremium value.
 */
export async function syncSubscriptionStatus(): Promise<boolean> {
  const user = getCurrentUser();
  if (!user?.email) return false;

  const data = await checkSubscriptionStatus(user.email);
  if (!data) return user.isPremium;

  const isPremium = data.is_active;
  if (isPremium !== user.isPremium) {
    setUserPremium(isPremium);
  }
  return isPremium;
}
