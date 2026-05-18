import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { COMMODITY_CONFIG, ALL_COMMODITIES, NIGERIAN_STATES } from '../../config/commodityConfig';

gsap.registerPlugin(ScrollTrigger);

interface Listing {
  id: number; refId: string; centreId: number; centreName: string; centreState: string;
  centreLga: string | null; commodity: string; gradeQuality: string | null;
  description: string | null; quantityAvailableKg: number; pricePerKg: number;
  images: string[]; status: string; isReceiptBacked: boolean; deliveryAvailable: boolean;
  createdAt: string;
  packaging?: { packageType?: string; packageWeightKg?: number; labelType?: string; moqKg?: number; notes?: string };
}

const COMMODITY_IMAGES: Record<string, string> = {
  Maize:          'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=600',
  Sorghum:        'https://images.pexels.com/photos/1586947/pexels-photo-1586947.jpeg?auto=compress&cs=tinysrgb&w=600',
  Rice:           'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Rice (Paddy)': 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=600',
  Soybeans:       'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=600',
  Soybean:        'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=600',
  Groundnut:      'https://images.pexels.com/photos/144206/pexels-photo-144206.jpeg?auto=compress&cs=tinysrgb&w=600',
  Millet:         'https://images.pexels.com/photos/1435517/pexels-photo-1435517.jpeg?auto=compress&cs=tinysrgb&w=600',
  Wheat:          'https://images.pexels.com/photos/326082/pexels-photo-326082.jpeg?auto=compress&cs=tinysrgb&w=600',
  Cowpea:         'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=600',
  Sesame:         'https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg?auto=compress&cs=tinysrgb&w=600',
  Cassava:        'https://images.pexels.com/photos/5718071/pexels-photo-5718071.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Cocoa Beans':  'https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Palm Oil':     'https://images.pexels.com/photos/725998/pexels-photo-725998.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Palm Kernel':  'https://images.pexels.com/photos/725998/pexels-photo-725998.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Irish Potato': 'https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg?auto=compress&cs=tinysrgb&w=600',
  default:        'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&cs=tinysrgb&w=600',
};

const getImg = (listing: Listing) =>
  listing.images?.[0] || COMMODITY_IMAGES[listing.commodity] || COMMODITY_IMAGES.default;

const HERO_PARTICLES = [
  { w: 5, h: 5, left: '7%',  top: '25%', dur: 5.5, delay: 0   },
  { w: 3, h: 3, left: '18%', top: '65%', dur: 7,   delay: 1.2 },
  { w: 4, h: 4, left: '32%', top: '40%', dur: 6,   delay: 0.7 },
  { w: 6, h: 6, left: '55%', top: '75%', dur: 8,   delay: 2   },
  { w: 3, h: 3, left: '70%', top: '20%', dur: 5,   delay: 0.4 },
  { w: 5, h: 5, left: '82%', top: '55%', dur: 6.5, delay: 1.5 },
  { w: 4, h: 4, left: '92%', top: '35%', dur: 7.5, delay: 0.9 },
  { w: 3, h: 3, left: '45%', top: '15%', dur: 6,   delay: 1.8 },
  { w: 5, h: 5, left: '60%', top: '85%', dur: 8.5, delay: 0.3 },
  { w: 4, h: 4, left: '25%', top: '88%', dur: 5.8, delay: 2.3 },
];

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'oldest',     label: 'Oldest First' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'qty_desc',   label: 'Quantity: Most First' },
];

export default function MarketplacePage() {
  const navigate = useNavigate();
  const heroRef  = useRef<HTMLDivElement>(null);
  const gridRef  = useRef<HTMLDivElement>(null);

  const [listings, setListings]           = useState<Listing[]>([]);
  const [total, setTotal]                 = useState(0);
  const [page, setPage]                   = useState(1);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [commodity, setCommodity]         = useState('All');
  const [grade, setGrade]                 = useState('All');
  const [locationState, setLocationState] = useState('All');
  const [minPrice, setMinPrice]           = useState('');
  const [maxPrice, setMaxPrice]           = useState('');
  const [sort, setSort]                   = useState('newest');
  const [deliveryOnly, setDeliveryOnly]   = useState(false);
  const [showFilters, setShowFilters]     = useState(false);
  const LIMIT = 12;

  const gradeOptions = commodity !== 'All' ? (COMMODITY_CONFIG[commodity]?.grades ?? []) : [];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      // Badge pops in with spring
      tl.fromTo('.hero-mkt-badge',
        { opacity: 0, scale: 0.7, y: -16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(2)', clearProps: 'all' },
      );

      // Headline lines curtain-reveal (overflow-hidden on parent clips the slide)
      tl.fromTo('.hero-mkt-line',
        { y: 90, opacity: 0, skewY: 2 },
        { y: 0, opacity: 1, skewY: 0, duration: 1, stagger: 0.14, clearProps: 'all' },
        '-=0.35',
      );

      // Subtitle
      tl.fromTo('.hero-mkt-sub',
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.9, clearProps: 'all' },
        '-=0.55',
      );

      // Search bar bounces up
      tl.fromTo('.hero-mkt-search',
        { opacity: 0, y: 36, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'back.out(1.5)', clearProps: 'all' },
        '-=0.5',
      );

      // Stats stagger in
      tl.fromTo('.hero-mkt-stat',
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, clearProps: 'all' },
        '-=0.4',
      );

      // Blobs drift continuously
      gsap.to('.hero-blob-1', { y: -35, x: 25, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.hero-blob-2', { y: 25, x: -18, duration: 10, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2 });

      // Particles float up and fade
      gsap.utils.toArray<HTMLElement>('.hero-particle').forEach((el, i) => {
        gsap.fromTo(el,
          { y: 0, opacity: 0.5 },
          { y: -50, opacity: 0, duration: HERO_PARTICLES[i]?.dur ?? 6, repeat: -1, delay: HERO_PARTICLES[i]?.delay ?? 0, ease: 'none' },
        );
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const fetchListings = async (pageOverride?: number, searchOverride?: string) => {
    setLoading(true);
    const p = pageOverride ?? page;
    const s = searchOverride !== undefined ? searchOverride : search;
    const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
    if (commodity !== 'All')   params.set('commodity', commodity);
    if (grade !== 'All')       params.set('grade', grade);
    if (locationState !== 'All') params.set('state', locationState);
    if (minPrice)              params.set('minPrice', minPrice);
    if (maxPrice)              params.set('maxPrice', maxPrice);
    if (sort !== 'newest')     params.set('sort', sort);
    if (deliveryOnly)          params.set('deliveryOnly', 'true');
    if (s)                     params.set('search', s);
    try {
      const res  = await fetch(`/api/marketplace/listings?${params}`);
      const json = await res.json();
      setListings(json.data ?? []);
      setTotal(json.total ?? 0);
    } catch { setListings([]); }
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, [page, commodity, grade, locationState, minPrice, maxPrice, sort, deliveryOnly]);

  useEffect(() => {
    if (!loading && gridRef.current) {
      gsap.killTweensOf('.listing-card');
      gsap.fromTo(
        '.listing-card',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out', clearProps: 'opacity,transform' },
      );
    }
  }, [loading, listings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchListings(1, search);
  };

  const resetFilters = () => {
    setCommodity('All'); setGrade('All'); setLocationState('All');
    setMinPrice(''); setMaxPrice(''); setSearch('');
    setSort('newest'); setDeliveryOnly(false); setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);
  const activeFilterCount = [
    commodity !== 'All', grade !== 'All', locationState !== 'All',
    !!minPrice, !!maxPrice, deliveryOnly,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-sage-white">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative bg-boa-green pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 grain-texture" />
        <div className="absolute inset-0 bg-gradient-to-br from-boa-green via-boa-green to-emerald-900 opacity-90" />

        {/* Animated blobs */}
        <div className="hero-blob-1 absolute -top-32 -right-32 w-96 h-96 rounded-full bg-harvest-gold/8 blur-3xl pointer-events-none" />
        <div className="hero-blob-2 absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-emerald-400/12 blur-3xl pointer-events-none" />

        {/* Floating particles */}
        {HERO_PARTICLES.map((p, i) => (
          <div
            key={i}
            className="hero-particle absolute rounded-full bg-harvest-gold/30 pointer-events-none"
            style={{ width: p.w, height: p.h, left: p.left, top: p.top }}
          />
        ))}

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          {/* Badge */}
          <div className="hero-mkt-badge inline-block mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-harvest-gold/20 text-harvest-gold text-xs font-bold tracking-widest uppercase border border-harvest-gold/30">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
              BOA Commodity Marketplace
            </span>
          </div>

          {/* Headline — each line wrapped in overflow-hidden for curtain reveal */}
          <h1 className="mb-4">
            <div className="overflow-hidden">
              <div className="hero-mkt-line font-headline text-4xl md:text-6xl text-white font-extrabold tracking-tight leading-tight">
                Buy Direct from Verified
              </div>
            </div>
            <div className="overflow-hidden">
              <div className="hero-mkt-line font-headline text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                <span className="text-harvest-gold">Nigerian Aggregation Centres</span>
              </div>
            </div>
          </h1>

          <p className="hero-mkt-sub text-emerald-100/80 text-lg max-w-2xl mx-auto mb-10 font-body">
            Transparent pricing. Verified stock. Receipt-backed commodities from FACs across all 36 states.
          </p>

          <form onSubmit={handleSearch} className="hero-mkt-search flex items-center gap-2 max-w-2xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 shadow-lg shadow-black/20">
            <span className="material-symbols-outlined text-white/60 ml-2">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search commodity (Maize, Rice, Sorghum…)"
              className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-sm py-1"
            />
            <button type="submit" className="px-5 py-2 bg-harvest-gold text-emerald-950 font-headline font-bold rounded-xl text-sm hover:brightness-110 transition active:scale-95">
              Search
            </button>
          </form>

          <div className="flex justify-center gap-10 mt-12 flex-wrap">
            {[
              { label: 'Active Listings', value: total > 0 ? total.toLocaleString() : '—', icon: 'inventory_2' },
              { label: 'States Covered',  value: '36',   icon: 'map' },
              { label: 'Receipt-Backed',  value: '100%', icon: 'verified' },
            ].map(s => (
              <div key={s.label} className="hero-mkt-stat text-center">
                <span className="material-symbols-outlined text-harvest-gold/70 text-lg mb-1 block" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                <div className="text-2xl font-headline font-black text-white">{s.value}</div>
                <div className="text-xs font-label uppercase tracking-widest text-white/50 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-sage-white to-transparent" />
      </section>

      {/* ── CONTENT ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ── FILTER SIDEBAR ──────────────────────────────────────────── */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-64 shrink-0`}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-headline font-bold text-gray-900">Filters</h3>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button onClick={resetFilters} className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1.5">
                      Reset all
                      <span className="bg-emerald-100 text-emerald-700 rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>
              </div>

              {/* Delivery toggle */}
              <div className="mb-5">
                <button
                  onClick={() => { setDeliveryOnly(d => !d); setPage(1); }}
                  className="flex items-center gap-3 w-full text-left"
                >
                  <div className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${deliveryOnly ? 'bg-boa-green' : 'bg-gray-200'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${deliveryOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className={`text-sm font-semibold ${deliveryOnly ? 'text-boa-green' : 'text-gray-600'}`}>
                    Delivery Available
                  </span>
                </button>
              </div>

              {/* Commodity */}
              <div className="mb-5 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Commodity</p>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {['All', ...ALL_COMMODITIES].map(c => (
                    <button
                      key={c}
                      onClick={() => { setCommodity(c); setGrade('All'); setPage(1); }}
                      className="flex items-center gap-2 w-full text-left group"
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition flex-shrink-0 ${commodity === c ? 'bg-boa-green border-boa-green' : 'border-gray-300 group-hover:border-boa-green'}`}>
                        {commodity === c && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className={`text-sm transition ${commodity === c ? 'text-boa-green font-semibold' : 'text-gray-600'}`}>{c}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade — only shown when a specific commodity is selected */}
              {gradeOptions.length > 0 && (
                <div className="mb-5 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Grade</p>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {['All', ...gradeOptions].map(g => (
                      <button
                        key={g}
                        onClick={() => { setGrade(g); setPage(1); }}
                        className="flex items-center gap-2 w-full text-left group"
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition flex-shrink-0 ${grade === g ? 'bg-boa-green border-boa-green' : 'border-gray-300 group-hover:border-boa-green'}`}>
                          {grade === g && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className={`text-sm transition leading-tight ${grade === g ? 'text-boa-green font-semibold' : 'text-gray-600'}`}>{g}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="mb-5 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Location (State)</p>
                <select
                  value={locationState}
                  onChange={e => { setLocationState(e.target.value); setPage(1); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="All">All States</option>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Price range */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Price per kg (₦)</p>
                <div className="flex gap-2">
                  <input
                    value={minPrice}
                    onChange={e => { setMinPrice(e.target.value); setPage(1); }}
                    placeholder="Min"
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    type="number"
                    min="0"
                  />
                  <input
                    value={maxPrice}
                    onChange={e => { setMaxPrice(e.target.value); setPage(1); }}
                    placeholder="Max"
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    type="number"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* ── LISTINGS GRID ────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
              <p className="text-gray-500 text-sm">
                {loading ? 'Loading…' : `${total.toLocaleString()} listing${total !== 1 ? 's' : ''} found`}
                {activeFilterCount > 0 && !loading && (
                  <button onClick={resetFilters} className="ml-2 text-emerald-600 hover:underline text-xs font-semibold">
                    Clear filters
                  </button>
                )}
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={sort}
                  onChange={e => { setSort(e.target.value); setPage(1); }}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowFilters(f => !f)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <span className="material-symbols-outlined text-sm">tune</span>
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-boa-green text-white rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>
                  )}
                </button>
              </div>
            </div>

            {loading ? (
              <div ref={gridRef} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="h-8 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
                <span className="material-symbols-outlined text-5xl text-gray-200">inventory_2</span>
                <p className="text-gray-400 font-body">No listings match your filters.</p>
                <button onClick={resetFilters} className="text-emerald-600 text-sm font-semibold hover:underline">Clear filters</button>
              </div>
            ) : (
              <>
                <div ref={gridRef} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {listings.map(l => (
                    <ListingCard key={l.id} listing={l} onClick={() => navigate(`/marketplace/${l.id}`)} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition">
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      const pg = i + 1;
                      return (
                        <button key={pg} onClick={() => setPage(pg)}
                          className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${page === pg ? 'bg-boa-green text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                          {pg}
                        </button>
                      );
                    })}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition">
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ── Listing Card ───────────────────────────────────────────────────────── */
function ListingCard({ listing, onClick }: { listing: Listing; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  const fmtQty = (kg: number) =>
    kg >= 1000 ? `${(kg / 1000).toFixed(kg % 1000 === 0 ? 0 : 1)} t` : `${kg.toLocaleString()} kg`;

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const maxQty   = Math.max(listing.quantityAvailableKg, 50000);
  const pct      = Math.min(100, (listing.quantityAvailableKg / maxQty) * 100);
  const barColor = listing.quantityAvailableKg < 5000
    ? 'bg-red-400'
    : listing.quantityAvailableKg < 15000
    ? 'bg-harvest-gold'
    : 'bg-emerald-500';

  const gradeColor = !listing.gradeQuality
    ? 'bg-gray-50 border-gray-200 text-gray-500'
    : /Grade 1|Export|Grade A|Premium|Food Grade|High Oil|High Protein|Organic|Natural/i.test(listing.gradeQuality)
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : /Grade 2|Grade B|Off-Grade|Processing|Mixed|Brown|Red/i.test(listing.gradeQuality)
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <div
      className="listing-card group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getImg(listing)}
          alt={listing.commodity}
          onError={e => { (e.target as HTMLImageElement).src = COMMODITY_IMAGES[listing.commodity] ?? COMMODITY_IMAGES.default; }}
          className={`w-full h-full object-cover transition-transform duration-700 ${hovered ? 'scale-110' : 'scale-100'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {listing.isReceiptBacked && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600/90 backdrop-blur-sm rounded-full text-white text-xs font-bold">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              Receipt Backed
            </span>
          )}
          {listing.deliveryAvailable && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-600/90 backdrop-blur-sm rounded-full text-white text-xs font-bold">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
              Delivery
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <div className="text-white font-headline font-extrabold text-xl drop-shadow">{listing.commodity}</div>
          <div className="flex items-center gap-1 mt-0.5 text-white/70 text-xs">
            <span className="material-symbols-outlined text-xs">location_on</span>
            <span>{listing.centreName} · {listing.centreState}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Key stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className={`flex flex-col items-center justify-center rounded-xl border py-2 px-1 ${gradeColor}`}>
            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">Grade</span>
            <span className="text-xs font-bold leading-tight text-center">{listing.gradeQuality ?? '—'}</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-blue-100 bg-blue-50 py-2 px-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-400 mb-0.5">Available</span>
            <span className="text-xs font-bold text-blue-700 leading-tight text-center">{fmtQty(listing.quantityAvailableKg)}</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-amber-100 bg-amber-50 py-2 px-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-500 mb-0.5">Min. Order</span>
            <span className="text-xs font-bold text-amber-700 leading-tight text-center">
              {listing.packaging?.moqKg ? fmtQty(listing.packaging.moqKg) : 'None'}
            </span>
          </div>
        </div>

        {/* Stock bar */}
        <div className="mb-4">
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
          {listing.quantityAvailableKg < 5000 && (
            <p className="text-xs text-red-500 font-semibold mt-1">Low stock — act fast</p>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Price per kg</p>
            <p className="text-xl font-headline font-extrabold text-boa-green">₦{listing.pricePerKg.toLocaleString()}</p>
          </div>
          <div className={`flex items-center gap-1 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${hovered ? 'bg-boa-green text-white shadow-lg' : 'bg-emerald-50 text-emerald-700'}`}>
            Buy Now
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        </div>
      </div>
    </div>
  );
}
