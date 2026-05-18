import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Listing {
  id: number; centreName: string; centreState: string; commodity: string;
  gradeQuality: string | null; pricePerKg: number; quantityAvailableKg: number;
  images: string[]; isReceiptBacked: boolean;
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
  Cowpea:         'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=600',
  Sesame:         'https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg?auto=compress&cs=tinysrgb&w=600',
  Cassava:        'https://images.pexels.com/photos/5718071/pexels-photo-5718071.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Cocoa Beans':  'https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Palm Oil':     'https://images.pexels.com/photos/725998/pexels-photo-725998.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Palm Kernel':  'https://images.pexels.com/photos/725998/pexels-photo-725998.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Irish Potato': 'https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg?auto=compress&cs=tinysrgb&w=600',
  default:        'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&cs=tinysrgb&w=600',
};

export default function MarketplaceSection() {
  const navigate    = useNavigate();
  const sectionRef  = useRef<HTMLElement>(null);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    fetch('/api/marketplace/listings/featured')
      .then(r => r.json())
      .then(j => setListings(j.data ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.mkt-section-header',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', clearProps: 'opacity,transform',
          scrollTrigger: { trigger: '.mkt-section-header', start: 'top 85%', toggleActions: 'play none none none' } },
      );
      gsap.fromTo('.mkt-card',
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          clearProps: 'opacity,transform',
          scrollTrigger: { trigger: '.mkt-cards-grid', start: 'top 85%', toggleActions: 'play none none none' },
        },
      );
      gsap.fromTo('.mkt-cta',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', clearProps: 'opacity,transform',
          scrollTrigger: { trigger: '.mkt-cta', start: 'top 92%', toggleActions: 'play none none none' } },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [listings]);

  const displayListings = listings.length > 0 ? listings.slice(0, 6) : FALLBACK_LISTINGS;

  return (
    <section ref={sectionRef} id="marketplace" className="py-24 px-6 bg-boa-green-dark relative overflow-hidden">
      <div className="absolute inset-0 grain-texture" />

      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-harvest-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-400/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mkt-section-header text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-harvest-gold/20 text-harvest-gold text-xs font-bold tracking-widest uppercase border border-harvest-gold/30 mb-4">
            Live Marketplace
          </span>
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Buy Direct from the<br />
            <span className="text-harvest-gold">Source</span>
          </h2>
          <p className="text-emerald-300/80 text-lg max-w-2xl mx-auto font-body">
            Premium Nigerian commodities, verified by the Bank of Agriculture. Transparent prices, direct from Aggregation Centres.
          </p>
        </div>

        {/* Cards grid */}
        <div className="mkt-cards-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mb-10">
          {displayListings.map((listing, i) => (
            <FeaturedCard key={listing.id ?? i} listing={listing} onClick={() => navigate(`/marketplace/${listing.id}`)} />
          ))}
        </div>

        {/* CTA */}
        <div className="mkt-cta text-center">
          <button
            onClick={() => navigate('/marketplace')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-harvest-gold text-emerald-950 font-headline font-extrabold rounded-2xl hover:brightness-110 transition-all shadow-xl hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined">storefront</span>
            View All Listings
          </button>
          <p className="text-emerald-400/60 text-xs mt-4 font-body">Updated in real-time · All listings verified by BOA</p>
        </div>
      </div>
    </section>
  );
}

function FeaturedCard({ listing, onClick }: { listing: Listing; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const imgSrc = listing.images?.[0] || COMMODITY_IMAGES[listing.commodity] || COMMODITY_IMAGES.default;
  const pct    = Math.min(100, (listing.quantityAvailableKg / 5000) * 100);

  return (
    <div
      className="mkt-card group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={imgSrc}
          alt={listing.commodity}
          onError={e => { (e.target as HTMLImageElement).src = COMMODITY_IMAGES[listing.commodity] ?? COMMODITY_IMAGES.default; }}
          className={`w-full h-full object-cover transition-transform duration-700 ${hovered ? 'scale-110' : 'scale-100'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-boa-green-dark via-boa-green-dark/20 to-transparent" />

        {listing.isReceiptBacked && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-emerald-600/90 backdrop-blur-sm rounded-full text-white text-xs font-bold">
            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            Verified
          </div>
        )}

        {listing.gradeQuality && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full text-white text-xs font-semibold">
            {listing.gradeQuality}
          </div>
        )}

        <div className="absolute bottom-3 left-4">
          <p className="font-headline font-extrabold text-white text-xl drop-shadow">{listing.commodity}</p>
          <p className="text-white/60 text-xs flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">location_on</span>
            {listing.centreName} · {listing.centreState}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Stock bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-emerald-400/70">Available stock</span>
            <span className="text-white/80 font-semibold">{listing.quantityAvailableKg.toLocaleString()} kg</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${pct < 20 ? 'bg-red-400' : pct < 50 ? 'bg-harvest-gold' : 'bg-emerald-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {pct < 20 && <p className="text-xs text-red-400 font-semibold mt-1">Low stock</p>}
        </div>

        {/* Price & button */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-400/70 text-xs">Per kilogram</p>
            <p className="font-headline text-2xl font-black text-harvest-gold">₦{listing.pricePerKg.toLocaleString()}</p>
          </div>
          <div className={`flex items-center gap-1 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${hovered ? 'bg-harvest-gold text-emerald-950 shadow-lg' : 'bg-white/10 text-white'}`}>
            Buy Now
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fallback listings shown before API loads
const FALLBACK_LISTINGS: Listing[] = [
  { id: 0, centreName: 'Kano North FAC', centreState: 'Kano', commodity: 'Maize', gradeQuality: 'Grade A', pricePerKg: 85000, quantityAvailableKg: 2500, images: [], isReceiptBacked: true },
  { id: 0, centreName: 'Kaduna Central FAC', centreState: 'Kaduna', commodity: 'Soybeans', gradeQuality: 'Premium', pricePerKg: 120000, quantityAvailableKg: 800, images: [], isReceiptBacked: true },
  { id: 0, centreName: 'Katsina AgriHub', centreState: 'Katsina', commodity: 'Sorghum', gradeQuality: 'Grade B', pricePerKg: 62000, quantityAvailableKg: 4200, images: [], isReceiptBacked: false },
];
