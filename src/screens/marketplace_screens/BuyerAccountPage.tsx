import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface Order {
  id: number; refId: string; commodity: string; centreName: string; centreState: string;
  quantityKg: number; pricePerKg: number; totalAmount: number; status: string;
  buyerName: string; createdAt: string;
  deliveryType: 'pickup' | 'delivery'; deliveryState: string | null; deliveryLga: string | null;
  deliveryCharge: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending_payment: { label: 'Awaiting Payment', color: 'bg-gray-100 text-gray-600',     icon: 'schedule' },
  paid:            { label: 'Paid',             color: 'bg-blue-100 text-blue-700',     icon: 'payments' },
  processing:      { label: 'Processing',       color: 'bg-yellow-100 text-yellow-700', icon: 'local_shipping' },
  completed:       { label: 'Completed',        color: 'bg-green-100 text-green-700',   icon: 'check_circle' },
  cancelled:       { label: 'Cancelled',        color: 'bg-red-100 text-red-600',       icon: 'cancel' },
};

// ── Auth panel ─────────────────────────────────────────────────────────────────
function AuthPanel({ onAuth }: { onAuth: (token: string) => void }) {
  const [mode,        setMode]        = useState<'login' | 'register'>('login');
  const [processing,  setProcessing]  = useState(false);
  const [error,       setError]       = useState('');
  const [loginForm,   setLoginForm]   = useState({ email: '', password: '' });
  const [regForm,     setRegForm]     = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });

  const handleLogin = async () => {
    setError(''); setProcessing(true);
    try {
      const res  = await fetch('/api/marketplace/buyers/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const json = await res.json();
      if (!json.success) { setError(json.message); setProcessing(false); return; }
      localStorage.setItem('buyer_token', json.data.token);
      window.dispatchEvent(new Event('storage'));
      onAuth(json.data.token);
    } catch { setError('Network error. Please try again.'); }
    setProcessing(false);
  };

  const handleRegister = async () => {
    setError('');
    if (regForm.password !== regForm.confirm) { setError('Passwords do not match.'); return; }
    setProcessing(true);
    try {
      const res  = await fetch('/api/marketplace/buyers/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: regForm.fullName, email: regForm.email, phone: regForm.phone, password: regForm.password }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.message); setProcessing(false); return; }
      localStorage.setItem('buyer_token', json.data.token);
      window.dispatchEvent(new Event('storage'));
      onAuth(json.data.token);
    } catch { setError('Network error. Please try again.'); }
    setProcessing(false);
  };

  const inp = 'w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-boa-green/30 focus:border-boa-green transition';

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-boa-green/10 border border-boa-green/20 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-3xl text-boa-green" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
        </div>

        <h1 className="text-2xl font-headline font-bold text-gray-900 text-center mb-1">
          {mode === 'login' ? 'Sign in to your account' : 'Create your buyer account'}
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          {mode === 'login'
            ? 'Track your orders and manage your purchases.'
            : 'Join the BOA Marketplace to buy commodities directly from FACs.'}
        </p>

        {/* Tabs */}
        <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === m ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <div className="space-y-3">
            <input type="email" placeholder="Email address" value={loginForm.email}
              onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className={inp} />
            <input type="password" placeholder="Password" value={loginForm.password}
              onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className={inp} />
            <button onClick={handleLogin} disabled={processing}
              className="w-full py-3 bg-boa-green text-white rounded-xl font-bold text-sm hover:bg-emerald-800 active:scale-[0.98] transition disabled:opacity-60">
              {processing ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input type="text" placeholder="Full name" value={regForm.fullName}
              onChange={e => setRegForm(f => ({ ...f, fullName: e.target.value }))} className={inp} />
            <input type="email" placeholder="Email address" value={regForm.email}
              onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} className={inp} />
            <input type="tel" placeholder="Phone number (e.g. 08012345678)" value={regForm.phone}
              onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))} className={inp} />
            <input type="password" placeholder="Password" value={regForm.password}
              onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} className={inp} />
            <input type="password" placeholder="Confirm password" value={regForm.confirm}
              onChange={e => setRegForm(f => ({ ...f, confirm: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
              className={inp} />
            <button onClick={handleRegister} disabled={processing}
              className="w-full py-3 bg-boa-green text-white rounded-xl font-bold text-sm hover:bg-emerald-800 active:scale-[0.98] transition disabled:opacity-60">
              {processing ? 'Creating account…' : 'Create Account'}
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          Want to browse first?{' '}
          <Link to="/marketplace" className="text-boa-green font-semibold hover:underline">View Listings</Link>
        </p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BuyerAccountPage() {
  const navigate  = useNavigate();
  const pageRef   = useRef<HTMLDivElement>(null);

  const [token,   setToken]   = useState<string | null>(() => localStorage.getItem('buyer_token'));
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [buyer,   setBuyer]   = useState<{ fullName: string; email: string; phone: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter,  setFilter]  = useState('all');

  const loadAccount = async (t: string) => {
    setLoading(true);
    try {
      const [meRes, ordersRes] = await Promise.all([
        fetch('/api/marketplace/buyers/me',   { headers: { Authorization: `Bearer ${t}` } }),
        fetch('/api/marketplace/orders/mine', { headers: { Authorization: `Bearer ${t}` } }),
      ]);
      const [meJson, ordersJson] = await Promise.all([meRes.json(), ordersRes.json()]);
      if (!meJson.success) {
        localStorage.removeItem('buyer_token');
        window.dispatchEvent(new Event('storage'));
        setToken(null);
      } else {
        setBuyer(meJson.data);
        setOrders(ordersJson.data ?? []);
      }
    } catch { /* keep showing auth form on network error */ }
    setLoading(false);
  };

  useEffect(() => {
    if (token) loadAccount(token);
  }, [token]);

  useEffect(() => {
    if (!loading && buyer && pageRef.current) {
      gsap.from('.order-row', {
        opacity: 0, y: 16, duration: 0.35, stagger: 0.05, ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    }
  }, [loading, buyer, filter]);

  const handleSignOut = () => {
    localStorage.removeItem('buyer_token');
    window.dispatchEvent(new Event('storage'));
    setToken(null);
    setBuyer(null);
    setOrders([]);
  };

  const filtered       = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const totalSpent     = orders.filter(o => ['paid', 'processing', 'completed'].includes(o.status)).reduce((s, o) => s + o.totalAmount, 0);
  const lastDelivery   = orders.find(o => o.deliveryType === 'delivery' && o.deliveryState);

  return (
    <div ref={pageRef} className="min-h-screen bg-sage-white">
      <Navbar />

      {/* Not logged in → show auth form */}
      {!token && <AuthPanel onAuth={t => { setToken(t); }} />}

      {/* Loading */}
      {token && loading && (
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 rounded-full border-4 border-boa-green border-t-transparent animate-spin" />
        </div>
      )}

      {/* Logged in → dashboard */}
      {token && !loading && buyer && (
        <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
          {/* Profile header */}
          <div className="bg-boa-green-dark rounded-3xl p-6 mb-8 flex items-center gap-5 relative overflow-hidden">
            <div className="absolute inset-0 grain-texture" />
            <div className="relative z-10 flex items-center gap-5 flex-1 flex-wrap">
              <div className="w-16 h-16 rounded-2xl bg-harvest-gold/20 border border-harvest-gold/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-harvest-gold text-3xl">person</span>
              </div>
              <div>
                <h1 className="font-headline text-2xl font-extrabold text-white">{buyer.fullName}</h1>
                <p className="text-emerald-300 text-sm">{buyer.email} · {buyer.phone}</p>
                {lastDelivery ? (
                  <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs" style={{ fontSize: 14 }}>location_on</span>
                    {lastDelivery.deliveryLga ? `${lastDelivery.deliveryLga}, ` : ''}{lastDelivery.deliveryState}
                  </p>
                ) : (
                  <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs" style={{ fontSize: 14 }}>location_off</span>
                    No delivery address on file
                  </p>
                )}
              </div>
              <div className="ml-auto flex gap-6">
                {[
                  { label: 'Total Orders', value: orders.length },
                  { label: 'Completed',    value: orders.filter(o => o.status === 'completed').length },
                  { label: 'Total Spent',  value: `₦${totalSpent.toLocaleString()}` },
                ].map(s => (
                  <div key={s.label} className="text-center hidden sm:block">
                    <div className="text-white font-headline font-bold text-xl">{s.value}</div>
                    <div className="text-emerald-400 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
              <button onClick={handleSignOut}
                className="text-xs text-emerald-400 hover:text-white border border-emerald-700 px-3 py-1.5 rounded-lg transition">
                Sign Out
              </button>
            </div>
          </div>

          {/* Orders section */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-headline font-bold text-gray-900 text-lg">My Orders</h2>
            <Link to="/marketplace" className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-800 font-semibold">
              <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
              Browse Listings
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {['all', 'paid', 'processing', 'completed', 'cancelled', 'pending_payment'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${filter === s ? 'bg-boa-green text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label}
                {` (${s === 'all' ? orders.length : orders.filter(o => o.status === s).length})`}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-200 mb-3 block">shopping_bag</span>
              <p className="text-gray-400 font-body">No orders yet.</p>
              <Link to="/marketplace" className="mt-4 inline-block px-5 py-2.5 bg-boa-green text-white rounded-xl text-sm font-semibold">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(order => {
                const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending_payment;
                return (
                  <div key={order.id} className="order-row bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sc.color}`}>
                      <span className="material-symbols-outlined text-lg">{sc.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900">{order.commodity}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${sc.color}`}>{sc.label}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{order.centreName} · {order.centreState}</p>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">{order.refId}</p>
                      {order.deliveryType === 'delivery' && order.deliveryState ? (
                        <p className="text-xs text-blue-500 mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>local_shipping</span>
                          Delivery → {order.deliveryLga ? `${order.deliveryLga}, ` : ''}{order.deliveryState}
                          {order.deliveryCharge > 0 && ` (+₦${order.deliveryCharge.toLocaleString()})`}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>store</span>
                          Pickup at centre
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-headline font-extrabold text-boa-green">₦{order.totalAmount.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{order.quantityKg.toLocaleString()} kg</p>
                      <p className="text-xs text-gray-300 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
