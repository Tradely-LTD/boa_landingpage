import { useNavigate } from 'react-router-dom';

const roles = [
  {
    icon: 'agriculture',
    label: 'Farmers',
    color: 'emerald',
    tagline: 'No account needed — everything is self-service',
    features: [
      { icon: 'local_shipping',   text: 'Request a GPS-verified pickup from your farm' },
      { icon: 'receipt_long',     text: 'Receive a tamper-proof AgriHub Receipt (AHR)' },
      { icon: 'account_balance',  text: 'Apply for a BOA loan using your AHR as collateral' },
      { icon: 'verified',         text: 'Verify any receipt number publicly, free of charge' },
    ],
    cta: { label: 'Request a Collection', path: '/request-collection' },
  },
  // {
  //   icon: 'warehouse',
  //   label: 'FACs',
  //   sublabel: 'Farmer Aggregation Centres',
  //   color: 'amber',
  //   tagline: 'Register, operate, and grow — all from one platform',
  //   features: [
  //     { icon: 'app_registration', text: 'Apply for BOA accreditation via a 7-step online form' },
  //     { icon: 'inventory_2',      text: 'Log commodity intake and issue AgriHub Receipts (AHRs)' },
  //     { icon: 'person_pin',       text: 'Assign collectors to GPS-verified farm pickups' },
  //     { icon: 'bar_chart',        text: 'Track live stock, sales, and centre-scoped analytics' },
  //   ],
  //   cta: { label: 'Register Your Centre', path: '/register' },
  // },
  {
    icon: 'storefront',
    label: 'Buyers',
    sublabel: 'Traders, Processors & Exporters',
    color: 'amber',
    tagline: 'Source verified commodities directly from the AgriHub marketplace',
    features: [
      { icon: 'search',           text: 'Browse live commodity listings with verified stock levels' },
      { icon: 'verified',         text: 'Every lot is backed by a tamper-proof AgriHub Receipt (AHR)' },
      { icon: 'handshake',        text: 'Place orders and negotiate directly with aggregation centres' },
      { icon: 'local_shipping',   text: 'Track fulfilment and delivery from warehouse to door' },
    ],
    cta: { label: 'Explore the Marketplace', path: '/marketplace' },
  },
];

const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
  },
};

const RolesSection = () => {
  const navigate = useNavigate();

  return (
    <section id="roles-section" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-boa-green font-bold text-sm tracking-[0.2em] uppercase font-label">Who It Serves</span>
          <h2 className="section-heading text-3xl md:text-5xl font-extrabold text-emerald-950 font-headline mt-2 tracking-tight">
            One platform — two sides of the chain
          </h2>
          <p className="text-emerald-900/50 mt-4 max-w-xl mx-auto font-body text-base leading-relaxed">
            BOA AgriHub connects farmers and buyers through a verified, transparent commodity marketplace — each side with a tailored self-service experience.
          </p>
        </div>

        {/* Role cards — 2 columns */}
        <div className="roles-grid grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role, idx) => {
            const c = colorMap[role.color];
            return (
              <div
                key={role.label}
                className={`${idx === 0 ? 'role-card-left' : 'role-card-right'} rounded-2xl border ${c.border} ${c.bg} p-8 flex flex-col justify-between`}
              >
                <div>
                  {/* Card header */}
                  <div className="flex items-center gap-4 mb-7">
                    <div className={`w-14 h-14 rounded-2xl bg-white border ${c.border} flex items-center justify-center shadow-sm shrink-0`}>
                      <span
                        className={`material-symbols-outlined text-3xl ${c.icon}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {role.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-emerald-950 font-headline leading-tight">{role.label}</h3>
                      {'sublabel' in role && (
                        <p className="text-xs text-emerald-900/50 font-body mt-0.5">{(role as any).sublabel}</p>
                      )}
                      <p className="text-xs text-emerald-900/40 font-body mt-0.5">{role.tagline}</p>
                    </div>
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-3.5">
                    {role.features.map(f => (
                      <li key={f.text} className="flex items-start gap-3">
                        <span
                          className={`material-symbols-outlined text-lg ${c.icon} shrink-0 mt-0.5`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {f.icon}
                        </span>
                        <span className="text-sm text-emerald-900/70 font-body leading-snug">{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate(role.cta.path)}
                  className={`mt-8 w-full py-3.5 rounded-xl text-sm font-bold border ${c.border} bg-white ${c.icon} hover:shadow-md transition-all`}
                >
                  {role.cta.label} →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
