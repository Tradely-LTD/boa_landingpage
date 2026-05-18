const siloFeatures = [
  { icon: 'verified_user',  label: 'BOA Certified',        desc: 'Every facility passes BOA inspection before accreditation' },
  { icon: 'thermostat',     label: 'Quality-Controlled',   desc: 'Monitored storage conditions preserve commodity grade' },
  { icon: 'qr_code_scanner',label: 'AHR Enabled',           desc: 'Digital receipts issued instantly at point of intake' },
  { icon: 'gps_fixed',      label: 'GPS-Verified Location', desc: 'Every centre is geolocated for full auditability' },
];

const WarehouseSection = () => (
  <section id="warehouse-section" className="py-24 px-6 bg-emerald-950 overflow-hidden">
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="text-center mb-14">
        <span className="text-emerald-400 font-bold text-sm tracking-[0.2em] uppercase font-label">Storage Infrastructure</span>
        <h2 className="section-heading text-3xl md:text-5xl font-extrabold text-white font-headline mt-2 tracking-tight">
          Where commodities are secured
        </h2>
        <p className="text-emerald-100/50 mt-4 max-w-xl mx-auto font-body text-base leading-relaxed">
          BOA AgriHub links farmers directly to a nationwide network of accredited warehouses and aggregation centres.
        </p>
      </div>

      {/* Split image block */}
      <div className="grid lg:grid-cols-5 gap-4 rounded-3xl overflow-hidden shadow-2xl mb-12">

        {/* Silo / Warehouse — 3 cols */}
        <div className="lg:col-span-3 relative min-h-[380px] lg:min-h-[480px] overflow-hidden">
          <img
            src="https://images.pexels.com/photos/34021878/pexels-photo-34021878.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Large grain storage silos at an accredited BOA aggregation centre"
            className="warehouse-img-left absolute w-full object-cover"
            style={{ height: 'calc(100% + 120px)', top: '-60px' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/30 to-transparent" />

          {/* Floating info card */}
          <div className="absolute bottom-8 left-8 right-8 z-10">
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-harvest-gold/20 border border-harvest-gold/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-harvest-gold text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>warehouse</span>
                </div>
                <div>
                  <p className="text-white font-bold text-sm font-headline">Grain Storage &amp; Silos</p>
                  <p className="text-white/50 text-xs font-body">BOA Accredited Infrastructure</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <p className="text-harvest-gold font-black text-xl font-headline">36</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">States</p>
                </div>
                <div className="text-center border-x border-white/10">
                  <p className="text-harvest-gold font-black text-xl font-headline">9+</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Commodities</p>
                </div>
                <div className="text-center">
                  <p className="text-harvest-gold font-black text-xl font-headline">100%</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Digital</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Farmer — 2 cols */}
        <div className="lg:col-span-2 relative min-h-[300px] lg:min-h-[480px] overflow-hidden">
          <img
            src="https://images.pexels.com/photos/14314165/pexels-photo-14314165.jpeg?auto=compress&cs=tinysrgb&w=900"
            alt="Nigerian farmers working together in Benue State"
            className="warehouse-img-right absolute w-full object-cover object-top"
            style={{ height: 'calc(100% + 160px)', top: '-80px' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-boa-green/90 via-boa-green/20 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 z-10">
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-emerald-800/60 border border-emerald-600/30 px-3 py-1 rounded-full mb-3">
              Benue State, Nigeria
            </span>
            <h3 className="text-2xl font-extrabold text-white font-headline leading-snug">
              Farmers driving<br />the supply chain
            </h3>
          </div>
        </div>
      </div>

      {/* Feature chips */}
      <div className="warehouse-chips grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {siloFeatures.map(f => (
          <div key={f.label} className="warehouse-chip bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/60 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-harvest-gold text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
            </div>
            <p className="text-white font-semibold text-sm font-headline mb-1">{f.label}</p>
            <p className="text-white/40 text-xs font-body leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

    </div>
  </section>
);

export default WarehouseSection;
