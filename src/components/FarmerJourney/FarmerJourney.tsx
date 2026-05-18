import { useNavigate } from 'react-router-dom';

const steps = [
  {
    number: '01',
    icon: 'agriculture',
    title: 'Request a Collection',
    desc: 'Submit a pickup request from the portal — no account needed. Provide your farm location, commodity type, estimated quantity, and preferred date. Get a reference ID instantly.',
    cta: null,
  },
  {
    number: '02',
    icon: 'local_shipping',
    title: 'Collector Arrives at Your Farm',
    desc: 'A BOA-verified field collector is assigned to your request by the nearest centre manager. They travel to your GPS coordinates, collect your produce, and record the actual weight.',
    cta: null,
  },
  {
    number: '03',
    icon: 'receipt_long',
    title: 'Deposit Logged & AHR Issued',
    desc: 'The centre manager logs your commodity intake and issues an AgriHub Receipt (AHR) — a tamper-proof digital certificate of your stored produce and its value.',
    cta: null,
  },
  {
    number: '04',
    icon: 'account_balance',
    title: 'Apply for a BOA Loan',
    desc: 'Pledge your active AHR as collateral directly from this portal. BOA officers review your application, approve the loan amount, and disburse funds — all digitally tracked.',
    cta: null,
  },
];

const FarmerJourney = () => {
  const navigate = useNavigate();

  return (
    <section id="farmer-journey" className="py-24 px-6 bg-boa-green-dark relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 grain-texture" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-harvest-gold font-bold text-sm tracking-[0.2em] uppercase font-label">For Farmers</span>
            <h2 className="section-heading text-3xl md:text-5xl font-extrabold text-white font-headline mt-2 tracking-tight leading-tight">
              From your farm gate<br className="hidden md:block" /> to a BOA loan in 4 steps.
            </h2>
            <p className="text-emerald-100/60 mt-4 max-w-xl font-body text-base leading-relaxed">
              You don't need a portal account. Every step — from requesting a pickup to receiving financing — is done through a simple public form.
            </p>
          </div>
          <button
            onClick={() => navigate('/request-collection')}
            className="shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-harvest-gold text-emerald-950 font-headline font-extrabold rounded-xl hover:brightness-110 transition-all shadow-xl"
          >
            <span className="material-symbols-outlined">agriculture</span>
            Request a Pickup
          </button>
        </div>

        {/* Steps grid */}
        <div className="journey-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="journey-card relative bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 transition-colors group"
            >
              {/* Connector line — hidden on last */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-2.5 w-5 h-px bg-harvest-gold/40 z-10" />
              )}

              {/* Step number */}
              <div className="text-[3.5rem] font-black text-white/5 font-headline leading-none absolute top-4 right-5 select-none">
                {step.number}
              </div>

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-harvest-gold/10 border border-harvest-gold/20 flex items-center justify-center mb-6 group-hover:bg-harvest-gold/20 transition-colors">
                  <span
                    className="material-symbols-outlined text-harvest-gold text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {step.icon}
                  </span>
                </div>

                {/* Badge */}
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-harvest-gold bg-harvest-gold/10 px-2.5 py-1 rounded-full mb-3">
                  Step {step.number}
                </span>

                <h3 className="text-lg font-bold text-white font-headline mb-3 leading-snug">
                  {step.title}
                </h3>
                <p className="text-emerald-100/50 text-sm font-body leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom info strip */}
        <div className="journey-strips mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: 'verified', text: 'No account or login required for any step' },
            { icon: 'gps_fixed', text: 'GPS-verified collection from your exact location' },
            { icon: 'qr_code_scanner', text: 'Verify your receipt number publicly at any time' },
          ].map(item => (
            <div key={item.text} className="journey-strip flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5">
              <span
                className="material-symbols-outlined text-emerald-400 text-xl shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {item.icon}
              </span>
              <p className="text-emerald-100/70 text-sm font-body">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FarmerJourney;
