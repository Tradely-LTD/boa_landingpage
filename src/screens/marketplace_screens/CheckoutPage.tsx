import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import Navbar from '../../components/Navbar';

import { NIGERIAN_STATES } from '../../config/commodityConfig';

interface DeliveryZone { state: string; lga?: string; charge: number; }

interface Listing {
  id: number; centreName: string; centreState: string; commodity: string;
  gradeQuality: string | null; pricePerKg: number; quantityAvailableKg: number;
  images: string[]; isReceiptBacked: boolean;
  deliveryAvailable: boolean; deliveryZones: DeliveryZone[];
}

interface PaymentResult {
  type: 'pos_terminal';
  orderRef: string;
  orderTotal: number;
}

interface BuyerAuth { token: string; buyer: { id: number; fullName: string; email: string; phone: string } }

const STEPS = ['Quantity', 'Delivery', 'Account', 'Payment'];

export default function CheckoutPage() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const pageRef   = useRef<HTMLDivElement>(null);

  const listingId = parseInt(params.get('listingId') ?? '0');
  const initQty   = parseInt(params.get('qty') ?? '100');

  const [listing,  setListing]  = useState<Listing | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [step,     setStep]     = useState(0);
  const [qty,      setQty]      = useState(initQty);
  const [auth,     setAuth]     = useState<BuyerAuth | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [processing,     setProcessing]     = useState(false);
  const [error,          setError]          = useState('');
  const [paymentResult,  setPaymentResult]  = useState<PaymentResult | null>(null);

  const [deliveryType,  setDeliveryType]  = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryState, setDeliveryState] = useState('');
  const [deliveryLga,   setDeliveryLga]   = useState('');

  const deliveryCharge = (() => {
    if (deliveryType !== 'delivery' || !listing || !deliveryState) return 0;
    const zone = listing.deliveryZones?.find(z => z.state === deliveryState);
    return zone?.charge ?? 0;
  })();

  const [loginForm,    setLoginForm]    = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });

  useEffect(() => {
    const stored = localStorage.getItem('buyer_token');
    if (stored) {
      fetch('/api/marketplace/buyers/me', { headers: { Authorization: `Bearer ${stored}` } })
        .then(r => r.json())
        .then(j => { if (j.success) setAuth({ token: stored, buyer: j.data }); })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!listingId) { navigate('/marketplace'); return; }
    fetch(`/api/marketplace/listings/${listingId}`)
      .then(r => r.json())
      .then(j => { setListing(j.data); setLoading(false); })
      .catch(() => { setLoading(false); navigate('/marketplace'); });
  }, [listingId]);

  useEffect(() => {
    if (!loading && pageRef.current) {
      gsap.fromTo('.checkout-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', clearProps: 'opacity,transform' });
    }
  }, [loading]);

  const animateStep = (direction: 1 | -1) => {
    gsap.to('.step-content', {
      opacity: 0, x: direction * -30, duration: 0.2, onComplete: () => {
        setStep(s => {
          const next = s + direction;
          // Skip the Account step (2) when already signed in
          if (next === 2 && auth) return s + direction * 2;
          return next;
        });
        gsap.fromTo('.step-content', { opacity: 0, x: direction * 30 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' });
      }
    });
  };

  const handleLogin = async () => {
    setError(''); setProcessing(true);
    try {
      const res  = await fetch('/api/marketplace/buyers/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) });
      const json = await res.json();
      if (!json.success) { setError(json.message); setProcessing(false); return; }
      localStorage.setItem('buyer_token', json.data.token);
      setAuth(json.data);
      animateStep(1);
    } catch { setError('Network error. Try again.'); }
    setProcessing(false);
  };

  const handleRegister = async () => {
    setError('');
    if (registerForm.password !== registerForm.confirm) { setError('Passwords do not match.'); return; }
    setProcessing(true);
    try {
      const res  = await fetch('/api/marketplace/buyers/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: registerForm.fullName, email: registerForm.email, phone: registerForm.phone, password: registerForm.password }) });
      const json = await res.json();
      if (!json.success) { setError(json.message); setProcessing(false); return; }
      localStorage.setItem('buyer_token', json.data.token);
      setAuth(json.data);
      animateStep(1);
    } catch { setError('Network error. Try again.'); }
    setProcessing(false);
  };

  const handlePay = async (gateway: 'paystack' | 'bank_transfer' | 'pos_terminal') => {
    if (!auth || !listing) return;
    setError(''); setProcessing(true);
    try {
      const orderRes = await fetch('/api/marketplace/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({
          listingId: listing.id, quantityKg: qty,
          deliveryType, deliveryState: deliveryState || undefined,
          deliveryLga: deliveryLga || undefined, deliveryCharge,
          paymentGateway: gateway,
        }),
      });
      const orderJson = await orderRes.json();
      if (!orderJson.success) { setError(orderJson.message); setProcessing(false); return; }

      if (gateway === 'bank_transfer' || gateway === 'pos_terminal') {
        setPaymentResult({ type: 'pos_terminal', orderRef: orderJson.data.order.refId, orderTotal: orderJson.data.order.totalAmount });
        setProcessing(false);
        return;
      }

      // Paystack: initiate payment redirect
      const payRes = await fetch('/api/marketplace/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ orderId: orderJson.data.order.id, gateway }),
      });
      const payJson = await payRes.json();
      if (!payJson.success) { setError(payJson.message); setProcessing(false); return; }

      window.location.href = payJson.data.authorizationUrl;
    } catch { setError('Payment initiation failed. Please try again.'); }
    setProcessing(false);
  };

  if (loading || !listing) return (
    <div className="min-h-screen bg-sage-white flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-boa-green border-t-transparent animate-spin" />
    </div>
  );

  const commodityTotal = qty * listing.pricePerKg;
  const total          = commodityTotal + deliveryCharge;
  const imgSrc = listing.images?.[0] || 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&cs=tinysrgb&w=400';

  return (
    <div ref={pageRef} className="min-h-screen bg-sage-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link to="/marketplace" className="hover:text-boa-green">Marketplace</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <Link to={`/marketplace/${listing.id}`} className="hover:text-boa-green">{listing.commodity}</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-gray-600 font-semibold">Checkout</span>
        </nav>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((label, i) => {
            const done    = i < step || (i === 2 && !!auth && step > 2);
            const current = i === step;
            return (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${done ? 'bg-emerald-500 text-white' : current ? 'bg-boa-green text-white shadow-lg shadow-emerald-200' : 'bg-gray-100 text-gray-400'}`}>
                  {done ? <span className="material-symbols-outlined text-sm">check</span> : i + 1}
                </div>
                <span className={`text-xs font-semibold transition-colors ${current ? 'text-boa-green' : 'text-gray-400'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-16 md:w-24 h-0.5 mx-1 mb-4 rounded-full transition-all duration-500 ${i < step ? 'bg-emerald-500' : 'bg-gray-200'}`} />
              )}
            </div>
          );
          })}
        </div>

        <div className="checkout-card grid lg:grid-cols-5 gap-8">
          {/* ── Step Content ────────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="step-content bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              {/* Step 0: Quantity */}
              {step === 0 && (
                <div>
                  <h2 className="font-headline text-xl font-bold text-gray-900 mb-1">Select Quantity</h2>
                  <p className="text-gray-500 text-sm mb-6">Max available: <strong>{listing.quantityAvailableKg.toLocaleString()} kg</strong></p>

                  <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setQty(q => Math.max(1, q - 50))} className="w-12 h-12 rounded-2xl border-2 border-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600 hover:border-boa-green hover:text-boa-green transition">−</button>
                    <div className="flex-1">
                      <input
                        type="number" value={qty} min={1} max={listing.quantityAvailableKg}
                        onChange={e => setQty(Math.min(listing.quantityAvailableKg, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-full text-center text-3xl font-headline font-black text-boa-green border-2 border-gray-100 rounded-2xl py-3 focus:outline-none focus:border-boa-green"
                      />
                      <p className="text-center text-xs text-gray-400 mt-1">kilograms</p>
                    </div>
                    <button onClick={() => setQty(q => Math.min(listing.quantityAvailableKg, q + 50))} className="w-12 h-12 rounded-2xl border-2 border-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600 hover:border-boa-green hover:text-boa-green transition">+</button>
                  </div>

                  <div className="quick-qty flex gap-2 mb-6 flex-wrap">
                    {[100, 250, 500, 1000].filter(v => v <= listing.quantityAvailableKg).map(v => (
                      <button key={v} onClick={() => setQty(v)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${qty === v ? 'bg-boa-green text-white border-boa-green' : 'border-gray-200 text-gray-600 hover:border-boa-green hover:text-boa-green'}`}>
                        {v} kg
                      </button>
                    ))}
                  </div>

                  <button onClick={() => animateStep(1)} className="w-full py-4 bg-boa-green text-white font-headline font-bold text-lg rounded-2xl hover:bg-emerald-800 transition flex items-center justify-center gap-2">
                    Continue
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              )}

              {/* Step 1: Delivery */}
              {step === 1 && (
                <div>
                  <h2 className="font-headline text-xl font-bold text-gray-900 mb-1">Delivery or Pickup?</h2>
                  <p className="text-gray-500 text-sm mb-6">Choose how you want to receive your order</p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {(['pickup', 'delivery'] as const).map(opt => {
                      const isDelivery = opt === 'delivery';
                      const available  = !isDelivery || listing.deliveryAvailable;
                      const active     = deliveryType === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => available && setDeliveryType(opt)}
                          disabled={!available}
                          className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${active ? 'border-boa-green bg-emerald-50' : 'border-gray-200 hover:border-gray-300'} ${!available ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          <span className={`material-symbols-outlined text-3xl ${active ? 'text-boa-green' : 'text-gray-400'}`}>
                            {isDelivery ? 'local_shipping' : 'store'}
                          </span>
                          <p className={`font-bold text-sm ${active ? 'text-boa-green' : 'text-gray-600'}`}>
                            {isDelivery ? 'Delivery' : 'Self Pickup'}
                          </p>
                          <p className="text-xs text-gray-400 text-center">
                            {isDelivery
                              ? (available ? `${listing.deliveryZones?.length ?? 0} zone${listing.deliveryZones?.length !== 1 ? 's' : ''} available` : 'Not available')
                              : 'Free · Collect at FAC'}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {deliveryType === 'delivery' && (
                    <div className="space-y-3 mb-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Delivery State</label>
                        <select
                          value={deliveryState}
                          onChange={e => { setDeliveryState(e.target.value); setDeliveryLga(''); }}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">Select state…</option>
                          {NIGERIAN_STATES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">City / LGA <span className="text-gray-300">(optional)</span></label>
                        <input
                          type="text" value={deliveryLga}
                          onChange={e => setDeliveryLga(e.target.value)}
                          placeholder="e.g. Kano Municipal"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      {deliveryState && (() => {
                        const zone = listing.deliveryZones?.find(z => z.state === deliveryState);
                        return zone ? (
                          <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                            <span className="text-sm text-blue-700">Delivery charge to <strong>{deliveryState}</strong></span>
                            <span className="font-bold text-blue-800">₦{zone.charge.toLocaleString()}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-700">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            No delivery zone set for this state. Contact the FAC directly.
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {deliveryType === 'pickup' && (
                    <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6">
                      <span className="material-symbols-outlined text-emerald-600 mt-0.5">info</span>
                      <div>
                        <p className="text-sm font-semibold text-emerald-800">Self Pickup</p>
                        <p className="text-xs text-emerald-700 mt-0.5">
                          You will collect your order directly at <strong>{listing.centreName}</strong>, {listing.centreState}. The FAC will contact you to arrange collection after payment.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => animateStep(-1)} className="flex-1 py-3 border border-gray-200 rounded-2xl text-gray-600 font-semibold hover:bg-gray-50 transition">Back</button>
                    <button
                      onClick={() => {
                        if (deliveryType === 'delivery' && !deliveryState) { setError('Please select a delivery state.'); return; }
                        setError('');
                        animateStep(1);
                      }}
                      className="flex-1 py-3 bg-boa-green text-white rounded-2xl font-semibold hover:bg-emerald-800 transition flex items-center justify-center gap-2"
                    >
                      Continue <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                  {error && <p className="text-sm text-red-500 mt-3 text-center">{error}</p>}
                </div>
              )}

              {/* Step 2: Account */}
              {step === 2 && (
                <div>
                  {auth ? (
                    <div>
                      <h2 className="font-headline text-xl font-bold text-gray-900 mb-1">Logged in as</h2>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-boa-green flex items-center justify-center">
                          <span className="material-symbols-outlined text-white">person</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{auth.buyer.fullName}</p>
                          <p className="text-sm text-gray-500">{auth.buyer.email}</p>
                        </div>
                        <button onClick={() => { localStorage.removeItem('buyer_token'); setAuth(null); }} className="ml-auto text-xs text-red-500 hover:underline">Sign out</button>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => animateStep(-1)} className="flex-1 py-3 border border-gray-200 rounded-2xl text-gray-600 font-semibold hover:bg-gray-50 transition">Back</button>
                        <button onClick={() => animateStep(1)} className="flex-1 py-3 bg-boa-green text-white rounded-2xl font-semibold hover:bg-emerald-800 transition flex items-center justify-center gap-2">
                          Continue to Payment <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="font-headline text-xl font-bold text-gray-900 mb-1">Create Account or Sign In</h2>
                      <p className="text-gray-500 text-sm mb-4">Your order is secure and protected</p>

                      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-5">
                        {(['login', 'register'] as const).map(m => (
                          <button key={m} onClick={() => setAuthMode(m)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${authMode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            {m === 'login' ? 'Sign In' : 'Create Account'}
                          </button>
                        ))}
                      </div>

                      {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-4">{error}</div>}

                      {authMode === 'login' ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                            <input type="email" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="you@email.com" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Password</label>
                            <input type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="••••••••" />
                          </div>
                          <button onClick={handleLogin} disabled={processing} className="w-full py-3.5 bg-boa-green text-white rounded-2xl font-semibold hover:bg-emerald-800 transition disabled:opacity-50">
                            {processing ? 'Signing in…' : 'Sign In & Continue'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                            <input type="text" value={registerForm.fullName} onChange={e => setRegisterForm(f => ({ ...f, fullName: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Your full name" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                              <input type="email" value={registerForm.email} onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="you@email.com" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                              <input type="tel" value={registerForm.phone} onChange={e => setRegisterForm(f => ({ ...f, phone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="08012345678" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Password</label>
                              <input type="password" value={registerForm.password} onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="••••••••" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Confirm</label>
                              <input type="password" value={registerForm.confirm} onChange={e => setRegisterForm(f => ({ ...f, confirm: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="••••••••" />
                            </div>
                          </div>
                          <button onClick={handleRegister} disabled={processing} className="w-full py-3.5 bg-boa-green text-white rounded-2xl font-semibold hover:bg-emerald-800 transition disabled:opacity-50">
                            {processing ? 'Creating account…' : 'Create Account & Continue'}
                          </button>
                        </div>
                      )}

                      <button onClick={() => animateStep(-1)} className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition">← Back</button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div>
                  {/* ── Payment result screen (bank transfer or POS) ─────── */}
                  {paymentResult ? (
                    <div>
                      {paymentResult.type === 'pos_terminal' && (
                        <>
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-2xl text-purple-600">point_of_sale</span>
                            </div>
                            <div>
                              <h2 className="font-headline text-xl font-bold text-gray-900">Visit the FAC to Pay</h2>
                              <p className="text-gray-500 text-sm">Your order is reserved — pay at the terminal</p>
                            </div>
                          </div>

                          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 mb-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Centre</span>
                              <span className="font-bold text-gray-900">{listing!.centreName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Location</span>
                              <span className="font-bold text-gray-700">{listing!.centreState}</span>
                            </div>
                            <div className="border-t border-purple-200 pt-3 flex justify-between items-center">
                              <span className="text-sm text-gray-500">Amount to Pay</span>
                              <span className="font-headline font-extrabold text-xl text-boa-green">₦{paymentResult.orderTotal.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                            <p className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">confirmation_number</span>
                              Your Order Reference
                            </p>
                            <p className="font-mono font-bold text-amber-900 text-xl tracking-wider">{paymentResult.orderRef}</p>
                            <p className="text-xs text-amber-600 mt-1">Show this to the FAC operator at the POS terminal.</p>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                            <p className="font-semibold text-gray-800 mb-1">What happens next?</p>
                            <ol className="list-decimal list-inside space-y-1 text-xs text-gray-500">
                              <li>Visit {listing!.centreName} in {listing!.centreState}</li>
                              <li>Present your order reference at the BOA POS terminal</li>
                              <li>The operator will confirm payment and process your order</li>
                            </ol>
                          </div>
                        </>
                      )}

                      <div className="mt-5 flex gap-3">
                        <Link
                          to="/marketplace"
                          className="flex-1 py-3 text-center border border-gray-200 rounded-2xl text-sm text-gray-600 font-semibold hover:bg-gray-50 transition"
                        >
                          Back to Marketplace
                        </Link>
                      </div>
                    </div>
                  ) : (
                    /* ── Payment method selection ──────────────────────────── */
                    <div>
                      <h2 className="font-headline text-xl font-bold text-gray-900 mb-1">Choose Payment Method</h2>
                      <p className="text-gray-500 text-sm mb-6">Select how you want to pay for your order</p>

                      {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-4">{error}</div>}

                      <div className="space-y-3 mb-6">
                        {/* Paystack */}
                        <button
                          onClick={() => handlePay('paystack')} disabled={processing}
                          className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-2xl hover:border-boa-green hover:bg-emerald-50/50 transition group disabled:opacity-50"
                        >
                          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-sm">PS</span>
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-bold text-gray-900 group-hover:text-boa-green transition">Pay with Paystack</p>
                            <p className="text-xs text-gray-400">Cards, Bank Transfer, USSD — Instant</p>
                          </div>
                          <span className="material-symbols-outlined text-gray-300 group-hover:text-boa-green transition">arrow_forward_ios</span>
                        </button>

                        {/* POS Terminal */}
                        <button
                          onClick={() => handlePay('pos_terminal')} disabled={processing}
                          className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50/50 transition group disabled:opacity-50"
                        >
                          <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-white text-xl">point_of_sale</span>
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-bold text-gray-900 group-hover:text-purple-700 transition">Pay at FAC (POS Terminal)</p>
                            <p className="text-xs text-gray-400">BOA-approved terminal at {listing?.centreName}</p>
                          </div>
                          <span className="material-symbols-outlined text-gray-300 group-hover:text-purple-600 transition">arrow_forward_ios</span>
                        </button>
                      </div>

                      {processing && (
                        <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-3 mb-4">
                          <div className="w-5 h-5 rounded-full border-2 border-boa-green border-t-transparent animate-spin" />
                          <p className="text-sm text-emerald-700 font-semibold">Processing…</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                        <span className="material-symbols-outlined text-sm text-gray-300">lock</span>
                        Secured with 256-bit SSL encryption
                      </div>

                      <button onClick={() => animateStep(-1)} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition">← Back</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Order Summary ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
              <div className="relative h-32">
                <img src={imgSrc} alt={listing.commodity} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <p className="font-headline font-bold text-lg">{listing.commodity}</p>
                  <p className="text-xs text-white/70">{listing.centreName} · {listing.centreState}</p>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <h3 className="font-semibold text-gray-700 text-sm">Order Summary</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Quantity</span>
                  <span className="font-semibold text-gray-800">{qty.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Price per kg</span>
                  <span className="font-semibold text-gray-800">₦{listing.pricePerKg.toLocaleString()}</span>
                </div>
                {listing.gradeQuality && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Grade</span>
                    <span className="font-semibold text-emerald-600">{listing.gradeQuality}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fulfilment</span>
                  <span className={`font-semibold ${deliveryType === 'delivery' ? 'text-blue-600' : 'text-gray-600'}`}>
                    {deliveryType === 'delivery' ? `Delivery · ${deliveryState || '—'}` : 'Self Pickup'}
                  </span>
                </div>
                {deliveryCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery charge</span>
                    <span className="font-semibold text-blue-700">₦{deliveryCharge.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-100 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-headline font-extrabold text-xl text-boa-green">₦{total.toLocaleString()}</span>
                </div>
                {listing.isReceiptBacked && (
                  <div className="flex items-center gap-2 bg-emerald-50 rounded-xl p-2.5 text-xs text-emerald-700">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    Warehouse-Receipt Backed commodity
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
