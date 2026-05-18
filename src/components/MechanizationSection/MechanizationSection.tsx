import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const IMPLEMENTS = [
  {
    icon: 'agriculture',
    name: 'Land Preparation',
    desc: 'Disc ploughs and harrows to break and condition soil ahead of planting season',
  },
  {
    icon: 'layers',
    name: 'Ridge Formation',
    desc: 'Disc ridgers create precision planting ridges for root and tuber crops',
  },
  {
    icon: 'scatter_plot',
    name: 'Precision Planting',
    desc: 'Seed drills for accurate, mechanised row planting across large hectarages',
  },
  {
    icon: 'water_drop',
    name: 'Crop Spraying',
    desc: '800L boom sprayers for uniform pesticide and herbicide coverage across fields',
  },
  {
    icon: 'local_shipping',
    name: 'Farm Haulage',
    desc: 'Tractor-pulled trailers to move produce and inputs across the farm',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Contact Your FAC',
    desc: 'Visit or call your nearest Farmer Aggregation Centre to register your land details and the service you need.',
  },
  {
    n: '02',
    title: 'Receive a Quote',
    desc: 'The FAC calculates your service cost based on your hectarage and the implement required, then confirms tractor availability.',
  },
  {
    n: '03',
    title: 'Pay & Get Deployed',
    desc: 'Once payment is confirmed, a fully-equipped tractor is dispatched to your farm at the agreed time.',
  },
];

export default function MechanizationSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.mech-header',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', clearProps: 'opacity,transform',
          scrollTrigger: { trigger: '.mech-header', start: 'top 85%', toggleActions: 'play none none none' },
        },
      );
      gsap.fromTo(
        '.mech-image-block',
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', clearProps: 'opacity,transform',
          scrollTrigger: { trigger: '.mech-image-block', start: 'top 80%', toggleActions: 'play none none none' },
        },
      );
      gsap.fromTo(
        '.mech-step',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out', clearProps: 'opacity,transform',
          scrollTrigger: { trigger: '.mech-steps', start: 'top 85%', toggleActions: 'play none none none' },
        },
      );
      gsap.fromTo(
        '.mech-chip',
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', clearProps: 'opacity,transform',
          scrollTrigger: { trigger: '.mech-chips', start: 'top 85%', toggleActions: 'play none none none' },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="mechanization" className="py-24 px-6 bg-emerald-950 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mech-header text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-harvest-gold/20 text-harvest-gold text-xs font-bold tracking-widest uppercase border border-harvest-gold/30 mb-4">
            Mechanization Services
          </span>
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Modern machinery,<br />
            <span className="text-harvest-gold">at your farm gate</span>
          </h2>
          <p className="text-emerald-100/50 text-lg max-w-2xl mx-auto font-body">
            BOA deploys tractors and implements directly to farmers through accredited FACs — from ploughing to spraying, fully equipped and ready to work.
          </p>
        </div>

        {/* Image block */}
        <div className="mech-image-block grid lg:grid-cols-5 gap-4 rounded-3xl overflow-hidden shadow-2xl mb-16">

          {/* Main tractor image — 3 cols */}
          <div className="lg:col-span-3 relative min-h-[380px] lg:min-h-[460px] overflow-hidden">
            <img
              src="https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Tractor working on farmland"
              className="absolute w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/20 to-transparent" />

            {/* Floating info card */}
            <div className="absolute bottom-8 left-8 right-8 z-10">
              <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-harvest-gold/20 border border-harvest-gold/30 flex items-center justify-center shrink-0">
                    <span
                      className="material-symbols-outlined text-harvest-gold text-lg"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      agriculture
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm font-headline">BOA Tractor Hire Programme</p>
                    <p className="text-white/50 text-xs font-body">Available through accredited FACs nationwide</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-harvest-gold font-black text-xl font-headline">81–90</p>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider">Horsepower</p>
                  </div>
                  <div className="text-center border-x border-white/10">
                    <p className="text-harvest-gold font-black text-xl font-headline">5</p>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider">Implement Types</p>
                  </div>
                  <div className="text-center">
                    <p className="text-harvest-gold font-black text-xl font-headline">2WD/4WD</p>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider">Drive Options</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary field image — 2 cols */}
          <div className="lg:col-span-2 relative min-h-[280px] lg:min-h-[460px] overflow-hidden">
            <img
              src="https://images.pexels.com/photos/14314165/pexels-photo-14314165.jpeg?auto=compress&cs=tinysrgb&w=900"
              alt="Nigerian farmer in field"
              className="absolute w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-boa-green/90 via-boa-green/30 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 z-10">
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-emerald-800/60 border border-emerald-600/30 px-3 py-1 rounded-full mb-3">
                Nationwide Coverage
              </span>
              <h3 className="text-2xl font-extrabold text-white font-headline leading-snug">
                Powered by BOA,<br />deployed to you
              </h3>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-16">
          <p className="text-center text-emerald-400 font-bold text-sm tracking-[0.2em] uppercase font-label mb-10">
            How It Works
          </p>
          <div className="mech-steps grid md:grid-cols-3 gap-6">
            {STEPS.map(s => (
              <div
                key={s.n}
                className="mech-step relative bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/[0.08] transition-colors"
              >
                <span className="text-6xl font-black text-white/[0.04] font-headline absolute top-4 right-5 select-none">
                  {s.n}
                </span>
                <div className="w-9 h-9 rounded-xl bg-harvest-gold flex items-center justify-center mb-5">
                  <span className="text-emerald-950 font-black text-sm font-headline">{s.n}</span>
                </div>
                <h4 className="text-white font-bold text-lg font-headline mb-2">{s.title}</h4>
                <p className="text-white/40 text-sm font-body leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Implement chips */}
        <div>
          <p className="text-center text-emerald-400 font-bold text-sm tracking-[0.2em] uppercase font-label mb-8">
            Available Services
          </p>
          <div className="mech-chips grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {IMPLEMENTS.map(impl => (
              <div
                key={impl.name}
                className="mech-chip bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-800/60 flex items-center justify-center mb-4">
                  <span
                    className="material-symbols-outlined text-harvest-gold text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {impl.icon}
                  </span>
                </div>
                <p className="text-white font-semibold text-sm font-headline mb-1">{impl.name}</p>
                <p className="text-white/40 text-xs font-body leading-relaxed">{impl.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
