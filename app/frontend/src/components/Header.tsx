import { Search, Bell, TrendingUp, User, Package } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User as AuthUser } from "@/lib/auth";
import { LanguageSelector } from "./LanguageSelector";

interface HeaderProps {
  onLoginClick: () => void;
  onBellClick: () => void;
  user?: AuthUser | null;
}

export function Header({ onLoginClick, onBellClick, user }: HeaderProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const isSuppliersPage = location.pathname === "/fournisseurs";

  return (
    <header className="sticky top-0 z-30 border-b border-[#1e1e2e] bg-[#0a0a0f]/95 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 max-w-[1600px] mx-auto">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 shadow-lg shadow-emerald-500/20">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight group-hover:text-emerald-400 transition-colors">WinProd</h1>
              <p className="text-[10px] text-gray-500 leading-tight">{t('header.subtitle')}</p>
            </div>
          </Link>
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-1.5 ml-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-400">Live</span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 ml-2">
            <Link
              to="/fournisseurs"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                isSuppliersPage
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "text-gray-400 hover:text-white hover:bg-[#1e1e2e] border border-transparent"
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              {t('header.suppliers')}
            </Link>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-[#1e1e2e] bg-[#12121a] px-3 py-2">
            <Search className="h-3.5 w-3.5 text-gray-500" />
            <input
              type="text"
              placeholder={t('header.searchPlaceholder')}
              className="w-40 bg-transparent text-xs text-white placeholder:text-gray-600 focus:outline-none"
            />
          </div>

          {/* Notifications */}
          <button
            onClick={onBellClick}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#1e1e2e] text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-500" />
          </button>

          {/* Language Selector */}
          <LanguageSelector />

          {/* Profile */}
          <button
            onClick={onLoginClick}
            className="flex h-9 items-center gap-2 rounded-lg border border-[#1e1e2e] px-3 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            <User className="h-4 w-4" />
            {user ? (
              <span className="hidden sm:inline text-xs font-medium text-emerald-400">
                {user.isPremium ? "VIP" : user.email.split("@")[0]}
              </span>
            ) : (
              <span className="hidden sm:inline text-xs">{t('header.login')}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
