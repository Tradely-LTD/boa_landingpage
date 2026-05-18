const HowItWorks = () => (
  <section id="how-it-works" className="py-24 px-6 bg-sage-white">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-boa-green font-bold text-sm tracking-[0.2em] uppercase font-label">Process</span>
        <h2 className="section-heading text-3xl md:text-5xl font-extrabold text-emerald-950 font-headline mt-2 tracking-tight">
          From application to financing in three steps
        </h2>
      </div>

      <div className="how-grid grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1 */}
        <div className="how-card bg-boa-green-dark rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden group" style={{ minHeight: '400px' }}>
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-white/[0.05] text-[12rem] font-black pointer-events-none font-headline">01</div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-harvest-gold/10 rounded-2xl flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-harvest-gold text-3xl">app_registration</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 font-headline">Register &amp; Get Accredited</h3>
            <p className="text-emerald-100/70 font-body leading-relaxed">
              Submit your aggregation centre application through the portal. A BOA officer will review your details, inspect your facility, and issue your official AGC accreditation code.
            </p>
          </div>
          <div className="relative z-10 flex items-center text-harvest-gold font-bold text-sm uppercase tracking-widest gap-2 mt-8">
            <span>Apply Now</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="how-card bg-boa-green rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden group shadow-xl ring-1 ring-white/10" style={{ minHeight: '400px' }}>
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 text-white/[0.05] text-[12rem] font-black pointer-events-none font-headline">02</div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-white text-3xl">receipt_long</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 font-headline">Receive Intake &amp; Issue AHRs</h3>
            <p className="text-white/80 font-body leading-relaxed">
              Accept commodity deposits from farmers at your accredited centre. Log each intake and issue AgriHub Receipts (AHRs) instantly — creating verified proof of ownership.
            </p>
          </div>
          <div className="relative z-10 flex items-center text-white font-bold text-sm uppercase tracking-widest gap-2 mt-8">
            <span>Learn More</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        </div>

        {/* Step 3 */}
        <div className="how-card bg-harvest-gold rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden group" style={{ minHeight: '400px' }}>
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-black/[0.05] text-[12rem] font-black pointer-events-none font-headline">03</div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-emerald-950/10 rounded-2xl flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-emerald-950 text-3xl">account_balance</span>
            </div>
            <h3 className="text-2xl font-bold text-emerald-950 mb-4 font-headline">Access Financing &amp; Markets</h3>
            <p className="text-emerald-950/80 font-body leading-relaxed">
              Pledge your AHRs as collateral for a BOA loan disbursement. When ready to sell, connect directly to buyers via TradelyX — available on Android &amp; iOS.
            </p>
          </div>
          <div className="relative z-10 flex items-center text-emerald-950 font-bold text-sm uppercase tracking-widest gap-2 mt-8">
            <span>Get Financing</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorks;
