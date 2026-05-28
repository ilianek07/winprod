import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { getAPIBaseURL } from "@/lib/config";

type State = "loading" | "success" | "already_done" | "error" | "expired" | "no_token";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<State>(token ? "loading" : "no_token");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) return;

    fetch(`${getAPIBaseURL()}/api/v1/email-verification/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setVerifiedEmail(data.email ?? "");
          setState(data.already_done ? "already_done" : "success");
        } else {
          const data = await res.json().catch(() => ({}));
          if (res.status === 410) {
            setState("expired");
          } else {
            setErrorMsg(data.detail ?? "Une erreur est survenue.");
            setState("error");
          }
        }
      })
      .catch(() => {
        setErrorMsg("Impossible de contacter le serveur.");
        setState("error");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#1e1e2e] bg-[#0f0f17] p-8 text-center shadow-2xl">
        {state === "loading" && (
          <>
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Vérification en cours…</h2>
          </>
        )}

        {(state === "success" || state === "already_done") && (
          <>
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
            <h2 className="text-lg font-bold text-white mb-2">
              {state === "already_done" ? "Déjà vérifié !" : "Email vérifié !"}
            </h2>
            {verifiedEmail && (
              <p className="text-sm text-gray-400 mb-6">
                <span className="text-white font-medium">{verifiedEmail}</span> est confirmé.
              </p>
            )}
            <p className="text-sm text-gray-400 mb-6">
              Vous pouvez maintenant vous connecter et accéder au site.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center h-10 w-full rounded-lg
                         bg-gradient-to-r from-emerald-500 to-blue-500
                         text-sm font-semibold text-white
                         hover:from-emerald-600 hover:to-blue-600 transition-all"
            >
              Accéder au site
            </Link>
          </>
        )}

        {state === "expired" && (
          <>
            <XCircle className="mx-auto mb-4 h-12 w-12 text-amber-400" />
            <h2 className="text-lg font-bold text-white mb-2">Lien expiré</h2>
            <p className="text-sm text-gray-400 mb-6">
              Ce lien de vérification a expiré (validité&nbsp;: 24&nbsp;h).
              Reconnectez-vous pour en recevoir un nouveau.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center h-10 w-full rounded-lg
                         border border-[#1e1e2e] bg-[#12121a]
                         text-sm font-medium text-gray-300
                         hover:text-white hover:border-gray-500 transition-colors"
            >
              Retour à l'accueil
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <XCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
            <h2 className="text-lg font-bold text-white mb-2">Lien invalide</h2>
            <p className="text-sm text-gray-400 mb-6">{errorMsg}</p>
            <Link
              to="/"
              className="inline-flex items-center justify-center h-10 w-full rounded-lg
                         border border-[#1e1e2e] bg-[#12121a]
                         text-sm font-medium text-gray-300
                         hover:text-white hover:border-gray-500 transition-colors"
            >
              Retour à l'accueil
            </Link>
          </>
        )}

        {state === "no_token" && (
          <>
            <Mail className="mx-auto mb-4 h-12 w-12 text-gray-500" />
            <h2 className="text-lg font-bold text-white mb-2">Lien manquant</h2>
            <p className="text-sm text-gray-400 mb-6">
              Aucun token de vérification trouvé. Utilisez le lien reçu par email.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center h-10 w-full rounded-lg
                         border border-[#1e1e2e] bg-[#12121a]
                         text-sm font-medium text-gray-300
                         hover:text-white hover:border-gray-500 transition-colors"
            >
              Retour à l'accueil
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
