import { useNavigate } from 'react-router-dom';

const Features = () => {
  const navigate = useNavigate();

  return (
    <section id="features" className="py-24 px-6 bg-sage-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-boa-green font-bold text-sm tracking-[0.2em] uppercase font-label">What You Unlock</span>
            <h2 className="section-heading text-3xl md:text-5xl font-extrabold text-emerald-950 font-headline mt-2 tracking-tight">
              Built for the whole value chain
            </h2>
          </div>
          <button
            onClick={() => navigate('/register')}
            className="bg-boa-green text-white px-8 py-4 rounded-xl font-bold transition-all hover:bg-emerald-800 shadow-lg"
          >
            Register Your Centre
          </button>
        </div>

        {/* Grid */}
        <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 — white */}
          <div className="feature-card bg-white p-8 rounded-2xl shadow-sm border-l-4 border-boa-green transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-boa-green">description</span>
            </div>
            <h4 className="text-xl font-bold text-emerald-950 mb-3 font-headline">Accredited Aggregation Centre Portal</h4>
            <p className="text-emerald-900/60 font-body text-sm leading-relaxed">
              Apply for BOA accreditation online in 7 guided steps. Track your review status in real time using your unique reference ID — no office visit needed.
            </p>
          </div>

          {/* Feature 2 — green */}
          <div className="feature-card bg-boa-green p-8 rounded-2xl shadow-lg transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-white">receipt_long</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-3 font-headline">AgriHub Receipts</h4>
            <p className="text-white/70 font-body text-sm leading-relaxed">
              Issue legally-backed AgriHub Receipts (AHRs) the moment commodities arrive at your centre. Each AHR is verifiable, tamper-proof, and tied to your BOA accreditation.
            </p>
          </div>

          {/* Feature 3 — dark */}
          <div className="feature-card bg-boa-green-dark p-8 rounded-2xl shadow-lg transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-harvest-gold">payments</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-3 font-headline">WR-Backed BOA Financing</h4>
            <p className="text-emerald-100/50 font-body text-sm leading-relaxed">
              Pledge your AgriHub Receipts as collateral and receive BOA loan disbursements directly. Full lifecycle tracking from application to repayment.
            </p>
          </div>

          {/* Feature 4 — white */}
          <div className="feature-card bg-white p-8 rounded-2xl shadow-sm border-l-4 border-boa-green transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-boa-green">local_shipping</span>
            </div>
            <h4 className="text-xl font-bold text-emerald-950 mb-3 font-headline">Last-mile Collection Logistics</h4>
            <p className="text-emerald-900/60 font-body text-sm leading-relaxed">
              Farmers request GPS-verified pickups directly from their farms. FAC managers assign verified field collectors who record actual weights on arrival — no produce left behind.
            </p>
          </div>

          {/* Feature 5 — green */}
          <div className="feature-card bg-boa-green p-8 rounded-2xl shadow-lg transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-white">inventory_2</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-3 font-headline">Inventory &amp; Stock Management</h4>
            <p className="text-white/70 font-body text-sm leading-relaxed">
              Track live commodity stock, sales movements, and farm input supplies — seeds, fertilizers, and equipment — from a single POS dashboard at your centre.
            </p>
          </div>

          {/* Feature 6 — dark */}
          <div className="feature-card bg-boa-green-dark p-8 rounded-2xl shadow-lg transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-harvest-gold">verified_user</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-3 font-headline">BOA Compliance &amp; Audit Trail</h4>
            <p className="text-emerald-100/50 font-body text-sm leading-relaxed">
              Every transaction, status change, and document is logged, timestamped, and auditable. Full regulatory transparency for BOA inspection and reporting.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
