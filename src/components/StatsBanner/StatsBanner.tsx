const StatsBanner = () => (
  <section id="programme" className="px-6 -mt-16 relative z-20">
    <div className="max-w-7xl mx-auto">
      <div className="bg-boa-green rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Ghost BOA */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <span className="text-[20rem] font-black text-white/[0.03] select-none tracking-tighter font-headline">BOA</span>
        </div>

        <div className="stats-banner relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center lg:text-left">
          <div className="stat-number space-y-1">
            <div className="text-harvest-gold text-4xl md:text-5xl font-extrabold font-headline tracking-tight">36</div>
            <div className="text-white/80 font-medium tracking-wide uppercase text-xs font-label">States Covered</div>
          </div>
          <div className="stat-number space-y-1 border-t border-white/10 pt-8 lg:pt-0 lg:border-t-0 lg:border-l lg:pl-12">
            <div className="text-harvest-gold text-4xl md:text-5xl font-extrabold font-headline tracking-tight">9+</div>
            <div className="text-white/80 font-medium tracking-wide uppercase text-xs font-label">Commodity Types Supported</div>
          </div>
          <div className="stat-number space-y-1 border-t border-white/10 pt-8 lg:pt-0 lg:border-t-0 lg:border-l lg:pl-12">
            <div className="text-harvest-gold text-4xl md:text-5xl font-extrabold font-headline tracking-tight">RH-SHF</div>
            <div className="text-white/80 font-medium tracking-wide uppercase text-xs font-label">Programme</div>
          </div>
          <div className="stat-number space-y-1 border-t border-white/10 pt-8 lg:pt-0 lg:border-t-0 lg:border-l lg:pl-12">
            <div className="text-harvest-gold text-4xl md:text-5xl font-extrabold font-headline tracking-tight">100%</div>
            <div className="text-white/80 font-medium tracking-wide uppercase text-xs font-label">Digital &amp; Paperless</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default StatsBanner;
