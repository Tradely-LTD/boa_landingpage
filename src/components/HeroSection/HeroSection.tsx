import { useNavigate } from 'react-router-dom';
import ParticleField from '../ParticleField/ParticleField';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section id="hero-section" className="relative bg-boa-green pt-20 pb-32 px-6 overflow-hidden">
      <div className="absolute inset-0 grain-texture" />
      <ParticleField />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* Content — 8 cols */}
          <div className="hero-content lg:col-span-8 space-y-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-800/50 text-emerald-200 text-xs font-bold tracking-widest uppercase border border-emerald-700/50">
              Official Platform of Bank of Agriculture
            </span>

            <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl text-white font-extrabold tracking-tight leading-[1.1]">
              Nigeria's Digital Agricultural Supply Chain{' '}
              <span className="text-harvest-gold">Starts at Your Gate.</span>
            </h1>

            <p className="text-emerald-100/80 text-lg md:text-xl max-w-2xl font-body leading-relaxed">
              Empowering warehouse operators and aggregators with world-class digital tools to secure stock, manage logistics, and bridge the gap to national premium markets.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-harvest-gold text-emerald-950 font-headline font-extrabold rounded-xl hover:brightness-110 transition-all shadow-xl"
              >
                Register Your Centre
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white/20 text-white font-headline font-extrabold rounded-xl hover:bg-white/5 transition-all"
              >
                See How It Works
                <span className="material-symbols-outlined">arrow_downward</span>
              </a>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-12 border-t border-white/10">
              <div>
                <div className="text-3xl md:text-4xl font-headline font-black text-white">5,000+</div>
                <div className="text-sm font-label uppercase tracking-widest text-white/50 mt-1">Farmers Registered</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-headline font-black text-harvest-gold">36</div>
                <div className="text-sm font-label uppercase tracking-widest text-white/50 mt-1">States Covered</div>
              </div>
              <div className="hidden md:block">
                <div className="text-3xl md:text-4xl font-headline font-black text-white">₦2.4B+</div>
                <div className="text-sm font-label uppercase tracking-widest text-white/50 mt-1">Trade Volume</div>
              </div>
            </div>
          </div>

          {/* Visual card — 4 cols */}
          <div className="hero-card lg:col-span-4 hidden lg:block">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-harvest-gold to-boa-green rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
              <div className="relative bg-boa-green-dark border border-white/10 rounded-2xl p-2 overflow-hidden shadow-2xl" style={{ aspectRatio: '4/5' }}>
                <img
                  src="https://images.pexels.com/photos/10697911/pexels-photo-10697911.jpeg?auto=compress&cs=tinysrgb&w=900"
                  alt="African farmers harvesting vegetables and grains"
                  className="w-full h-full object-cover rounded-xl object-center"
                />
                <div className="absolute bottom-6 left-6 right-6 p-6 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-boa-green flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
                    </div>
                    <div>
                      <div className="text-white font-headline font-bold text-sm">Verified Aggregator</div>
                      <div className="text-white/60 text-xs font-body">Kano State Hub</div>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-harvest-gold rounded-full" style={{ width: '75%' }} />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-white/40 uppercase tracking-tighter">Inventory Level</span>
                    <span className="text-[10px] text-harvest-gold font-bold">75% Capacity</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-sage-white to-transparent" />
    </section>
  );
};

export default HeroSection;
