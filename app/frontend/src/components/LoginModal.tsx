import { X, Mail, Lock, User, Crown, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { signIn, signUp, signOut, getCurrentUser, setUserPremium, User as AuthUser } from "@/lib/auth";
import { getAPIBaseURL } from '@/lib/config';
import { AlertsSettings } from "./AlertsSettings";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthChange?: (user: AuthUser | null) => void;
}

async function apiPost(path: string, body: object) {
  const res = await fetch(`${getAPIBaseURL()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail ?? "Une erreur est survenue");
  return data;
}


export function LoginModal({ isOpen, onClose, onAuthChange }: LoginModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // "check your email" state
  const [pendingEmail, setPendingEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  const verifyRedirectUrl = `${window.location.origin}/auth/verify-email`;

  useEffect(() => {
    if (isOpen) {
      setCurrentUser(getCurrentUser());
      setPendingEmail("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (isSignUp) {
        // ── Inscription ──────────────────────────────────────────────────────
        // Send verification email; only sign in immediately if already verified
        const data = await apiPost("/api/v1/email-verification/register", {
          email: normalizedEmail,
          redirect_url: verifyRedirectUrl,
        });
        if (data.already_verified) {
          const { user } = await signIn(normalizedEmail, password);
          setCurrentUser(user);
          onAuthChange?.(user);
        } else {
          setPendingEmail(normalizedEmail);
        }
      } else {
        // ── Connexion ────────────────────────────────────────────────────────
        // Block sign-in until email is verified
        const checkRes = await fetch(
          `${getAPIBaseURL()}/api/v1/email-verification/check?email=${encodeURIComponent(normalizedEmail)}`
        );
        const checkData = await checkRes.json().catch(() => ({ verified: false }));

        if (!checkData.verified) {
          // Resend a fresh verification link then show the check-email screen
          await apiPost("/api/v1/email-verification/resend", {
            email: normalizedEmail,
            redirect_url: verifyRedirectUrl,
          }).catch(() => {});
          setPendingEmail(normalizedEmail);
          return;
        }

        const { user, error: signInError } = await signIn(normalizedEmail, password);
        if (signInError) {
          setError(signInError);
        } else if (user) {
          setCurrentUser(user);
          onAuthChange?.(user);
          setEmail("");
          setPassword("");
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('login.genericError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    try {
      await apiPost("/api/v1/email-verification/resend", {
        email: pendingEmail,
        redirect_url: verifyRedirectUrl,
      });
      setResendDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('login.genericError'));
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogout = () => {
    signOut();
    setCurrentUser(null);
    onAuthChange?.(null);
    onClose();
  };

  const handleStripePayment = () => {
    setUserPremium(true);
    const updatedUser = getCurrentUser();
    setCurrentUser(updatedUser);
    onAuthChange?.(updatedUser);
  };

  // ── "Check your email" screen ─────────────────────────────────────────────
  if (pendingEmail) {
    return (
      <>
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="relative w-full max-w-sm rounded-2xl border border-[#1e1e2e] bg-[#0f0f17] p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e1e2e] text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-blue-500/20">
              <Mail className="h-7 w-7 text-blue-400" />
            </div>

            <h2 className="text-lg font-bold text-white mb-2">{t('login.checkEmail')}</h2>
            <p className="text-sm text-gray-400 mb-1">
              {t('login.confirmSentTo')}
            </p>
            <p className="text-sm font-semibold text-white mb-5">{pendingEmail}</p>

            <div className="rounded-xl border border-[#1e1e2e] bg-[#12121a] p-3 text-left mb-5 space-y-1.5">
              {[t('login.step1'), t('login.step2'), t('login.step3')].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-400">{i + 1}</span>
                  <span className="text-xs text-gray-300">{step}</span>
                </div>
              ))}
            </div>

            {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

            {resendDone ? (
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 mb-3">
                <CheckCircle className="h-3.5 w-3.5" />
                {t('login.resent')}
              </div>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="flex w-full items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50 mb-3"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${resendLoading ? "animate-spin" : ""}`} />
                {resendLoading ? t('login.sending') : t('login.resend')}
              </button>
            )}

            <button
              onClick={() => { setPendingEmail(""); setIsSignUp(false); }}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              {t('login.backToLogin')}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-sm rounded-2xl border border-[#1e1e2e] bg-[#0f0f17] p-6 shadow-2xl animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e1e2e] text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {currentUser ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500">
                <User className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                {currentUser.isPremium ? t('login.vipMember') : t('login.connectedTitle')}
              </h2>
              <p className="text-sm text-gray-400 mb-4">{currentUser.email}</p>

              {currentUser.isPremium ? (
                <>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 mb-0">
                    <p className="text-xs font-medium text-emerald-400 mb-1">{t('login.vipActiveLabel')}</p>
                    <p className="text-[10px] text-gray-400">
                      {t('login.vipActiveDesc')}
                    </p>
                  </div>
                  <AlertsSettings email={currentUser.email} />
                </>
              ) : (
                <StripePaymentModule onPayment={handleStripePayment} />
              )}

              <button
                onClick={handleLogout}
                className="mt-4 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {t('login.logout')}
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  {isSignUp ? t('login.createAccount') : t('login.signIn')}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  {t('login.accessDesc')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('login.emailPlaceholder')}
                    required
                    className="h-11 w-full rounded-lg border border-[#1e1e2e] bg-[#12121a] pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-colors"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('login.passwordPlaceholder')}
                    required
                    minLength={6}
                    className="h-11 w-full rounded-lg border border-[#1e1e2e] bg-[#12121a] pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-colors"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-2.5">
                    <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 text-sm font-semibold text-white hover:from-emerald-600 hover:to-blue-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {loading ? t('login.loading') : isSignUp ? t('login.createMyAccount') : t('login.signIn')}
                </button>

                <p className="text-center text-xs text-gray-500">
                  {isSignUp ? t('login.alreadyHaveAccount') : t('login.noAccount')}{" "}
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
                    className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  >
                    {isSignUp ? t('login.signIn') : t('login.createAccount')}
                  </button>
                </p>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#1e1e2e]" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#0f0f17] px-2 text-gray-500">{t('login.or')}</span>
                  </div>
                </div>

                <StripePaymentModule onPayment={handleStripePayment} />
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export function StripePaymentModule({ onPayment }: { onPayment: () => void }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);

  const user = getCurrentUser();
  const isVip = user?.isPremium === true;

  const handleSubscribe = async () => {
    if (!user?.email) {
      setError(t('login.loginFirstError'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const origin = window.location.origin;
      const res = await fetch(`${getAPIBaseURL()}/api/v1/payment/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          success_url: `${origin}/?checkout_success=1`,
          cancel_url: `${origin}/?checkout_cancel=1`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || t('login.sessionError'));
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('login.genericError'));
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!user?.email) return;
    setCancelLoading(true);
    setError('');
    try {
      const res = await fetch(`${getAPIBaseURL()}/api/v1/payment/cancel-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || t('login.cancelError'));
      }
      setUserPremium(false);
      setCancelDone(true);
      onPayment();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('login.genericError'));
    } finally {
      setCancelLoading(false);
    }
  };

  if (isVip) {
    return (
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="h-4 w-4 text-yellow-400" />
          <p className="text-xs font-semibold text-yellow-300">{t('login.vipActiveManage')}</p>
        </div>
        <p className="text-[11px] text-gray-400 mb-3">
          {t('login.vipBillingDesc')}
        </p>
        {cancelDone ? (
          <p className="text-xs text-emerald-400 text-center">{t('login.cancelled')}</p>
        ) : (
          <button
            onClick={handleCancel}
            disabled={cancelLoading}
            className="text-[11px] text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50"
          >
            {cancelLoading ? t('login.cancelling') : t('login.cancelSubscription')}
          </button>
        )}
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-white">{t('login.stripeTitle')}</p>
        <span className="rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 text-[9px] font-bold text-yellow-400">
          5 €/mois
        </span>
      </div>

      {!user?.email && (
        <div className="flex items-center gap-1.5 mb-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <p className="text-[11px] text-amber-300">{t('login.loginFirst')}</p>
        </div>
      )}

      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

      <button
        onClick={handleSubscribe}
        disabled={loading || !user?.email}
        className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 text-xs font-semibold text-black hover:from-yellow-400 hover:to-amber-400 transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Crown className="h-3.5 w-3.5" />
        {loading ? t('login.redirecting') : t('login.subscribe')}
      </button>

      <div className="flex items-center justify-center gap-1 mt-2">
        <svg className="h-3 w-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span className="text-[9px] text-gray-500">{t('login.monthlyPayment')}</span>
      </div>
    </div>
  );
}
