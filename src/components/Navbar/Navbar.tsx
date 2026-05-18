import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const farmerLinks = [
  { to: '/track',               icon: 'track_changes',  label: 'Track Application',    desc: 'Check your centre registration status' },
  { to: '/verify-receipt',      icon: 'verified',        label: 'Verify Receipt',       desc: 'Confirm an AgriHub Receipt is authentic' },
  { to: '/apply-loan',          icon: 'account_balance', label: 'Apply for Loan',       desc: 'Use your receipt as collateral for financing' },
  { to: '/request-collection',  icon: 'local_shipping',  label: 'Request Collection',   desc: 'Book a collector to pick up your harvest' },
];

function getBuyerInitial(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const name: string = payload.fullName ?? payload.name ?? '';
    return name.charAt(0).toUpperCase();
  } catch { return '?'; }
}

function getBuyerName(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.fullName ?? payload.name ?? 'Account';
  } catch { return 'Account'; }
}

const Navbar = () => {
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [buyerToken,   setBuyerToken]   = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate    = useNavigate();
  const location    = useLocation();

  const isServicesActive  = farmerLinks.some(l => location.pathname === l.to);
  const isMarketplacePage = location.pathname.startsWith('/marketplace');

  // Check buyer auth on mount and on storage changes
  useEffect(() => {
    const sync = () => setBuyerToken(localStorage.getItem('buyer_token'));
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBuyerSignOut = () => {
    localStorage.removeItem('buyer_token');
    setBuyerToken(null);
    navigate('/marketplace');
  };

  return (
    <header className="bg-emerald-900 border-b border-emerald-800 shadow-lg sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-6 py-2 max-w-7xl mx-auto">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <img src="/boa-logo.png" alt="Bank of Agriculture" className="h-12 w-auto brightness-0 invert" />
          <span className="text-white font-bold text-sm leading-tight hidden sm:block" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            BOA AgriHub
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a className="text-white/90 hover:text-amber-400 transition-colors font-body" href="#programme">About</a>
          <a className="text-white/90 hover:text-amber-400 transition-colors font-body" href="#how-it-works">How It Works</a>
          <a className="text-white/90 hover:text-amber-400 transition-colors font-body" href="#features">Features</a>
          <Link
            to="/marketplace"
            className={`transition-colors font-body ${location.pathname.startsWith('/marketplace') ? 'text-harvest-gold font-semibold' : 'text-white/90 hover:text-amber-400'}`}
          >
            Marketplace
          </Link>
        </nav>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Farmer Services dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setServicesOpen(p => !p)}
              className={`flex items-center gap-1.5 text-sm font-semibold transition-colors px-3 py-2 rounded-lg
                ${isServicesActive
                  ? 'text-harvest-gold bg-emerald-800'
                  : 'text-white/90 hover:text-amber-400 hover:bg-emerald-800'}`}
            >
              <span className="material-symbols-outlined text-base">storefront</span>
              Services
              <span
                className="material-symbols-outlined text-base transition-transform duration-200"
                style={{ transform: servicesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                expand_more
              </span>
            </button>

            {servicesOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Self-Service</p>
                </div>
                {farmerLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setServicesOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0
                      ${location.pathname === link.to ? 'bg-emerald-50' : ''}`}
                  >
                    <span
                      className={`material-symbols-outlined text-xl mt-0.5 shrink-0
                        ${location.pathname === link.to ? 'text-emerald-600' : 'text-slate-400'}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {link.icon}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${location.pathname === link.to ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {link.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{link.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* On marketplace pages: show buyer account CTA in place of Register Centre */}
          {isMarketplacePage ? (
            buyerToken ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/marketplace/account"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-harvest-gold/20 border border-harvest-gold/30 hover:bg-harvest-gold/30 transition"
                >
                  <div className="w-6 h-6 rounded-md bg-harvest-gold/40 border border-harvest-gold/50 flex items-center justify-center text-harvest-gold text-xs font-bold">
                    {getBuyerInitial(buyerToken)}
                  </div>
                  <span className="text-amber-200 text-sm font-semibold max-w-[110px] truncate">
                    {getBuyerName(buyerToken)}
                  </span>
                </Link>
                <button
                  onClick={handleBuyerSignOut}
                  title="Sign out"
                  className="p-1.5 text-emerald-400 hover:text-white transition"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/marketplace/account"
                className="flex items-center gap-2 bg-harvest-gold hover:bg-amber-500 text-emerald-900 px-5 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 duration-150 shadow-md"
              >
                <span className="material-symbols-outlined text-base">person</span>
                Sign In
              </Link>
            )
          ) : (
            <button
              onClick={() => navigate('/register')}
              className="bg-harvest-gold hover:bg-amber-500 text-emerald-900 px-5 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 duration-150 shadow-md"
            >
              Register Centre
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-1.5">
          <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-emerald-900 border-t border-emerald-800 px-6 py-5 space-y-1">
          {[
            { label: 'About',        href: '#programme'   },
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Features',     href: '#features'     },
          ].map(l => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="block text-white/90 text-sm font-medium py-2">{l.label}</a>
          ))}
          <Link
            to="/marketplace"
            onClick={() => setMenuOpen(false)}
            className={`block text-sm font-medium py-2 ${location.pathname.startsWith('/marketplace') ? 'text-harvest-gold font-semibold' : 'text-white/90'}`}
          >
            Marketplace
          </Link>

          {/* Buyer account (mobile) */}
          {isMarketplacePage && (
            <div className="pt-3 mt-2 border-t border-emerald-800">
              <p className="text-emerald-500 text-xs font-semibold uppercase tracking-wider mb-2">My Account</p>
              {buyerToken ? (
                <div className="flex items-center justify-between">
                  <Link
                    to="/marketplace/account"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-semibold text-amber-300"
                  >
                    <div className="w-7 h-7 rounded-lg bg-harvest-gold/30 border border-harvest-gold/40 flex items-center justify-center text-harvest-gold text-xs font-bold">
                      {getBuyerInitial(buyerToken)}
                    </div>
                    {getBuyerName(buyerToken)} — My Orders
                  </Link>
                  <button onClick={() => { handleBuyerSignOut(); setMenuOpen(false); }} className="text-xs text-emerald-400">
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/marketplace/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-sm font-semibold text-amber-300"
                >
                  <span className="material-symbols-outlined text-base">person</span>
                  Sign In / Register
                </Link>
              )}
            </div>
          )}

          {/* Farmer Services section */}
          <div className="pt-3 mt-2 border-t border-emerald-800">
            <p className="text-emerald-500 text-xs font-semibold uppercase tracking-wider mb-2">Services</p>
            {farmerLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 py-2.5 text-sm font-semibold
                  ${location.pathname === link.to ? 'text-harvest-gold' : 'text-amber-400'}`}
              >
                <span className="material-symbols-outlined text-base">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3">
            <button
              onClick={() => { navigate('/register'); setMenuOpen(false); }}
              className="w-full py-3 rounded-lg text-sm font-bold bg-harvest-gold text-emerald-900"
            >
              Register Centre
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
