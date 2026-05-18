import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { COMMODITY_CONFIG } from '../../config/commodityConfig';

interface DeliveryZone { state: string; lga?: string; charge: number; }

interface PackagingInfo {
  packageType:     string;
  packageWeightKg: number;
  labelType:       string;
  moqKg:           number;
  notes?:          string;
}

interface Listing {
  id: number; refId: string; centreName: string; centreState: string; centreLga: string | null;
  commodity: string; gradeQuality: string | null; description: string | null;
  quantityAvailableKg: number; pricePerKg: number; images: string[];
  status: string; isReceiptBacked: boolean; createdAt: string;
  deliveryAvailable: boolean; deliveryZones: DeliveryZone[];
  specs: Record<string, string>;
  packaging: PackagingInfo;
}

const COMMODITY_IMAGES: Record<string, string> = {
  Maize:          'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=900',
  Sorghum:        'https://images.pexels.com/photos/1586947/pexels-photo-1586947.jpeg?auto=compress&cs=tinysrgb&w=900',
  Rice:           'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=900',
  'Rice (Paddy)': 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=900',
  Soybeans:       'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=900',
  Soybean:        'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=900',
  Groundnut:      'https://images.pexels.com/photos/144206/pexels-photo-144206.jpeg?auto=compress&cs=tinysrgb&w=900',
  Millet:         'https://images.pexels.com/photos/1435517/pexels-photo-1435517.jpeg?auto=compress&cs=tinysrgb&w=900',
  Cowpea:         'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=900',
  Sesame:         'https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg?auto=compress&cs=tinysrgb&w=900',
  Cassava:        'https://images.pexels.com/photos/5718071/pexels-photo-5718071.jpeg?auto=compress&cs=tinysrgb&w=900',
  'Cocoa Beans':  'https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=900',
  'Palm Oil':     'https://images.pexels.com/photos/725998/pexels-photo-725998.jpeg?auto=compress&cs=tinysrgb&w=900',
  'Palm Kernel':  'https://images.pexels.com/photos/725998/pexels-photo-725998.jpeg?auto=compress&cs=tinysrgb&w=900',
  'Irish Potato': 'https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg?auto=compress&cs=tinysrgb&w=900',
  default:        'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&cs=tinysrgb&w=900',
};

export default function ListingDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pageRef  = useRef<HTMLDivElement>(null);

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [selImg,  setSelImg]  = useState(0);
  const [qty,     setQty]     = useState(100);

  useEffect(() => {
    fetch(`/api/marketplace/listings/${id}`)
      .then(r => r.json())
      .then(j => { setListing(j.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!loading && listing && pageRef.current) {
      gsap.killTweensOf(['.detail-img', '.detail-panel', '.detail-badge', '.detail-spec']);
      gsap.fromTo('.detail-img',
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', clearProps: 'opacity,transform' });
      gsap.fromTo('.detail-panel',
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', clearProps: 'opacity,transform' });
      gsap.fromTo('.detail-badge',
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, delay: 0.4, ease: 'back.out(1.4)', clearProps: 'opacity,transform' });
      gsap.fromTo('.detail-spec',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, delay: 0.5, ease: 'power2.out', clearProps: 'opacity,transform' });
    }
  }, [loading, listing]);

  if (loading) return (
    <div className="min-h-screen bg-sage-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-boa-green border-t-transparent animate-spin" />
        <p className="text-gray-400 font-body">Loading listing…</p>
      </div>
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen bg-sage-white flex flex-col items-center justify-center gap-4">
      <span className="material-symbols-outlined text-5xl text-gray-300">inventory_2</span>
      <p className="text-gray-500 font-body">Listing not found.</p>
      <Link to="/marketplace" className="text-boa-green font-semibold hover:underline">← Back to Marketplace</Link>
    </div>
  );

  const images = listing.images?.length ? listing.images : [COMMODITY_IMAGES[listing.commodity] ?? COMMODITY_IMAGES.default];
  const total  = qty * listing.pricePerKg;
  const maxQty = listing.quantityAvailableKg;
  const pct    = Math.min(100, (maxQty / 5000) * 100);

  return (
    <div ref={pageRef} className="min-h-screen bg-sage-white pb-24 lg:pb-0">
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-2">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/" className="hover:text-boa-green transition">Home</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <Link to="/marketplace" className="hover:text-boa-green transition">Marketplace</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-gray-600 font-semibold">{listing.commodity}</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-10 items-start">

          {/* ── Image Gallery ─────────────────────────────────────────── */}
          <div className="detail-img">
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3] mb-3">
              <img src={images[selImg]} alt={listing.commodity} className="w-full h-full object-cover" />
              {listing.isReceiptBacked && (
                <div className="detail-badge absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 rounded-full text-white text-xs font-bold shadow-lg">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Warehouse-Receipt Backed
                </div>
              )}
              <div className="detail-badge absolute top-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs font-bold">
                {listing.status === 'active' ? '🟢 Available' : '🔴 Unavailable'}
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${i === selImg ? 'border-boa-green' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Purchase Panel ────────────────────────────────────────── */}
          <div className="detail-panel lg:sticky lg:top-24">
            <h1 className="font-headline text-3xl font-extrabold text-gray-900 mb-1">
              {listing.commodity}
              {listing.gradeQuality && <span className="ml-2 text-base font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{listing.gradeQuality}</span>}
            </h1>
            <p className="text-gray-500 text-sm mb-5 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {listing.centreName} · {listing.centreState}{listing.centreLga ? `, ${listing.centreLga}` : ''}
            </p>

            {/* Price */}
            <div className="bg-boa-green-dark rounded-2xl p-5 mb-5 text-white">
              <p className="text-emerald-400 text-xs uppercase tracking-wider mb-1">Price per kg</p>
              <p className="font-headline text-4xl font-black text-harvest-gold">₦{listing.pricePerKg.toLocaleString()}</p>
            </div>

            {/* ── Core specs ───────────────────────────────────────────── */}
            <div className="space-y-2 mb-5">
              {[
                { icon: 'scale',          label: 'Available Quantity', value: `${listing.quantityAvailableKg.toLocaleString()} kg` },
                { icon: 'star',           label: 'Grade / Quality',    value: listing.gradeQuality ?? 'Not specified' },
                { icon: 'calendar_today', label: 'Listed On',          value: new Date(listing.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' }) },
              ].map(spec => (
                <div key={spec.label} className="detail-spec flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-emerald-600 text-sm">{spec.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{spec.label}</p>
                    <p className="text-sm font-semibold text-gray-800">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Quality analysis sheet ───────────────────────────────── */}
            {(() => {
              const fields  = COMMODITY_CONFIG[listing.commodity]?.specs ?? [];
              const entries = fields.filter(f => listing.specs?.[f.key]);
              if (!entries.length) return null;
              return (
                <div className="detail-spec mb-5 bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-emerald-600">biotech</span>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Quality Analysis</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {entries.map(f => (
                      <div key={f.key} className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-xs text-gray-500">{f.label}</span>
                        <span className="text-xs font-bold text-gray-800">{listing.specs[f.key]}{f.unit ? ` ${f.unit}` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* ── Stock bar ────────────────────────────────────────────── */}
            <div className="mb-5">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Stock level</span>
                <span className={pct < 20 ? 'text-red-500 font-bold' : 'text-gray-600'}>{pct < 20 ? 'Low — act fast!' : 'Good availability'}</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${pct < 20 ? 'bg-red-400' : pct < 50 ? 'bg-harvest-gold' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* ── Delivery info ────────────────────────────────────────── */}
            {listing.deliveryAvailable && listing.deliveryZones?.length > 0 ? (
              <div className="detail-spec mb-5 bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-blue-600">local_shipping</span>
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Delivery Available</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {listing.deliveryZones.map((z, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-xs text-gray-600">{z.state}{z.lga ? ` · ${z.lga}` : ''}</span>
                      <span className="text-xs font-bold text-blue-700">₦{z.charge.toLocaleString()} / order</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="detail-spec mb-5 flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
                <span className="material-symbols-outlined text-sm">info</span>
                Self-pickup only — collect directly at the FAC.
              </div>
            )}

            {/* ── Packaging info ───────────────────────────────────────── */}
            <div className="detail-spec mb-5 bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Packaging</p>
              </div>
              <div className="grid grid-cols-2 divide-x divide-y divide-gray-50">
                <div className="px-4 py-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Package Type</p>
                  <p className="text-sm font-semibold text-gray-800">{listing.packaging?.packageType || 'Not specified'}</p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Net Weight / Bag</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {listing.packaging?.packageWeightKg ? `${listing.packaging.packageWeightKg} kg` : 'Not specified'}
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Labelling</p>
                  <p className="text-sm font-semibold text-gray-800">{listing.packaging?.labelType || 'Not specified'}</p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Min. Order</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {listing.packaging?.moqKg > 0 ? `${listing.packaging.moqKg.toLocaleString()} kg` : 'No minimum'}
                  </p>
                </div>
              </div>
              {listing.packaging?.notes && (
                <div className="px-4 py-3 border-t border-gray-50">
                  <p className="text-xs text-gray-500 italic">{listing.packaging.notes}</p>
                </div>
              )}
            </div>

            {/* Qty selector */}
            {listing.status === 'active' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Select Quantity</p>
                <div className="flex items-center gap-3 mb-3">
                  <button onClick={() => setQty(q => Math.max(1, q - 50))} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition font-bold text-lg">−</button>
                  <div className="flex-1 text-center">
                    <input
                      type="number" value={qty} min={1} max={maxQty}
                      onChange={e => setQty(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-24 text-center text-xl font-bold text-gray-900 border border-gray-200 rounded-xl py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-400 mt-0.5">kg</p>
                  </div>
                  <button onClick={() => setQty(q => Math.min(maxQty, q + 50))} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition font-bold text-lg">+</button>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="text-xl font-headline font-extrabold text-boa-green">₦{total.toLocaleString()}</span>
                </div>
              </div>
            )}

            {listing.status === 'active' ? (
              <button
                onClick={() => navigate(`/marketplace/checkout?listingId=${listing.id}&qty=${qty}`)}
                className="w-full py-4 bg-boa-green text-white font-headline font-extrabold text-lg rounded-2xl hover:bg-emerald-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">shopping_cart</span>
                Buy Now — ₦{total.toLocaleString()}
              </button>
            ) : (
              <div className="w-full py-4 bg-gray-100 text-gray-400 font-semibold text-center rounded-2xl">
                This listing is currently unavailable
              </div>
            )}

            {listing.description && (
              <div className="mt-5 p-4 bg-white rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</p>
                <p className="text-sm text-gray-600 font-body leading-relaxed">{listing.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-16 bg-boa-green-dark rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 grain-texture" />
          <div className="relative z-10">
            <h2 className="font-headline text-2xl font-extrabold text-white mb-2">How the Purchase Works</h2>
            <p className="text-emerald-300 text-sm mb-8">Simple, transparent and secure</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { step: '01', icon: 'shopping_cart', label: 'Select Quantity', desc: 'Choose how many kg you want to buy' },
                { step: '02', icon: 'person_add', label: 'Create Account', desc: 'Quick buyer registration or login' },
                { step: '03', icon: 'payments', label: 'Pay Securely', desc: 'Pay via Paystack or Moniepoint' },
                { step: '04', icon: 'local_shipping', label: 'Collect Goods', desc: 'Coordinate pickup with the FAC' },
              ].map(s => (
                <div key={s.step} className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-harvest-gold/20 border border-harvest-gold/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-harvest-gold">{s.icon}</span>
                  </div>
                  <div>
                    <p className="text-harvest-gold text-xs font-bold tracking-widest">{s.step}</p>
                    <p className="font-semibold text-white mt-0.5">{s.label}</p>
                    <p className="text-emerald-300 text-xs mt-0.5 font-body">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* ── Floating Buy Bar (mobile) ─────────────────────────────────── */}
      {listing.status === 'active' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl shadow-black/20 px-4 py-3 flex items-center gap-3">
          {/* Qty controls */}
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-2 py-1 border border-gray-200">
            <button
              onClick={() => setQty(q => Math.max(1, q - 50))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-200 transition font-bold text-lg"
            >−</button>
            <input
              type="number" value={qty} min={1} max={maxQty}
              onChange={e => setQty(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-14 text-center text-sm font-bold text-gray-900 bg-transparent outline-none"
            />
            <span className="text-xs text-gray-400 -ml-1">kg</span>
            <button
              onClick={() => setQty(q => Math.min(maxQty, q + 50))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-200 transition font-bold text-lg"
            >+</button>
          </div>

          {/* Buy button */}
          <button
            onClick={() => navigate(`/marketplace/checkout?listingId=${listing.id}&qty=${qty}`)}
            className="flex-1 py-3 bg-boa-green text-white font-headline font-extrabold rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">shopping_cart</span>
            Buy Now — ₦{total.toLocaleString()}
          </button>
        </div>
      )}
    </div>
  );
}
