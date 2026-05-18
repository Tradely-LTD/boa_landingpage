import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface ReceiptResult {
  receiptNumber: string;
  centreName: string;
  commodity: string;
  quantityKg: number;
  gradeQuality: string | null;
  farmerName: string;
  issuedAt: string;
  expiresAt: string | null;
  status: 'active' | 'pledged' | 'redeemed' | 'expired';
  loanRef: string | null;
  loanStatus: string | null;
}

const statusConfig = {
  active: {
    label:  'Active — Commodity in Storage',
    icon:   'verified',
    color:  'text-emerald-600',
    bg:     'bg-emerald-50',
    border: 'border-emerald-300',
    badge:  'bg-emerald-100 text-emerald-700',
    desc:   'This receipt is valid. The commodity is currently stored at the centre and this receipt has not been redeemed.',
  },
  pledged: {
    label:  'Pledged — Used as Loan Collateral',
    icon:   'lock',
    color:  'text-amber-600',
    bg:     'bg-amber-50',
    border: 'border-amber-300',
    badge:  'bg-amber-100 text-amber-700',
    desc:   'This receipt is currently pledged as collateral for a BOA loan application. It cannot be used again until the loan is repaid or the application is rejected.',
  },
  redeemed: {
    label:  'Redeemed — Goods Collected',
    icon:   'task_alt',
    color:  'text-slate-600',
    bg:     'bg-slate-50',
    border: 'border-slate-300',
    badge:  'bg-slate-100 text-slate-600',
    desc:   'This receipt has been redeemed. The commodity was collected from the storage centre by the farmer.',
  },
  expired: {
    label:  'Expired',
    icon:   'schedule',
    color:  'text-red-500',
    bg:     'bg-red-50',
    border: 'border-red-200',
    badge:  'bg-red-100 text-red-600',
    desc:   'This receipt has expired. The storage period ended without redemption. Please contact the centre for further information.',
  },
};

export default function VerifyReceiptPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [receiptNo, setReceiptNo] = useState(() => searchParams.get('r')?.toUpperCase() ?? '');
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState<ReceiptResult | null>(null);
  const [error,     setError]     = useState('');

  useEffect(() => {
    const r = searchParams.get('r');
    if (r) {
      setReceiptNo(r.toUpperCase());
      doVerify(r.trim().toUpperCase());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doVerify = async (clean: string) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res  = await fetch(`/api/warehouse-receipts/verify/${encodeURIComponent(clean)}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? 'Receipt not found.');
      setResult(json.data);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = receiptNo.trim().toUpperCase();
    if (!clean) return;
    doVerify(clean);
  };

  const cfg = result ? statusConfig[result.status] : null;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-emerald-900 py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-800 text-emerald-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <span className="material-symbols-outlined text-base">receipt_long</span>
              AgriHub Receipt Verification
            </div>
            <h1 className="font-headline font-extrabold text-4xl text-white mb-4 leading-tight">
              Verify an AgriHub Receipt
            </h1>
            <p className="text-emerald-300 text-base max-w-md mx-auto">
              Enter your receipt number to confirm the authenticity of an AgriHub Receipt (AHR) and check the commodity status.
            </p>

            <form onSubmit={handleVerify} className="mt-10 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                placeholder="e.g. WR-202505-AB12C"
                className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-5 py-3.5 text-sm outline-none focus:border-harvest-gold focus:bg-white/15 transition font-mono tracking-wider uppercase"
              />
              <button
                type="submit"
                disabled={loading || !receiptNo.trim()}
                className="bg-harvest-gold hover:bg-amber-500 disabled:opacity-50 text-emerald-950 font-bold px-7 py-3.5 rounded-xl text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                ) : (
                  <span className="material-symbols-outlined text-base">verified</span>
                )}
                {loading ? 'Verifying…' : 'Verify'}
              </button>
            </form>

            {error && (
              <div className="mt-5 inline-flex items-center gap-2 bg-red-900/40 border border-red-500/40 text-red-300 text-sm px-5 py-3 rounded-xl">
                <span className="material-symbols-outlined text-base">error</span>
                {error}
              </div>
            )}
          </div>
        </section>

        {/* Result */}
        {result && cfg && (
          <section className="py-16 px-6">
            <div className="max-w-lg mx-auto">

              {/* Authenticity banner */}
              <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-6 text-center mb-6`}>
                <span
                  className={`material-symbols-outlined text-5xl ${cfg.color} mb-3 block`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {cfg.icon}
                </span>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</p>
                </div>
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${cfg.badge}`}>
                  {result.receiptNumber}
                </span>
                <p className="text-slate-600 text-sm leading-relaxed">{cfg.desc}</p>
              </div>

              {/* Receipt details */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
                <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Receipt Details</p>
                </div>
                <DetailRow label="Commodity"      value={result.commodity} />
                <DetailRow label="Quantity"        value={`${result.quantityKg.toLocaleString()} kg`} />
                <DetailRow label="Grade / Quality" value={result.gradeQuality ?? '—'} />
                <DetailRow label="Farmer Name"     value={result.farmerName} />
                <DetailRow label="Storage Centre"  value={result.centreName} />
                <DetailRow label="Issued On"       value={fmt(result.issuedAt)} />
                <DetailRow label="Expires"         value={result.expiresAt ? fmt(result.expiresAt) : 'No expiry set'} />
                <DetailRow label="Status"          value={result.status.toUpperCase()} last />
              </div>

              {/* What this means callout */}
              {result.status === 'active' && (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 mb-6">
                  <span className="material-symbols-outlined text-emerald-600 shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                    info
                  </span>
                  <div>
                    <p className="font-semibold text-emerald-800 text-sm">This receipt is authentic and valid</p>
                    <p className="text-emerald-700 text-xs mt-1 leading-relaxed">
                      The commodity listed above is currently stored at <strong>{result.centreName}</strong> under the Bank of Agriculture AgriHub programme. This receipt may be used as collateral for BOA loans.
                    </p>
                  </div>
                </div>
              )}

              {result.status === 'pledged' && (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 mb-6">
                  <span className="material-symbols-outlined text-amber-600 shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                    lock
                  </span>
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">
                      Loan Application {result.loanStatus === 'pending' ? 'Pending Review' : result.loanStatus === 'approved' ? 'Approved' : result.loanStatus === 'disbursed' ? 'Disbursed' : 'Active'}
                    </p>
                    {result.loanRef && (
                      <p className="font-mono text-xs font-bold text-amber-900 mt-1 mb-1">{result.loanRef}</p>
                    )}
                    <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                      {result.loanStatus === 'pending'
                        ? 'A loan application has been submitted and is awaiting review by a BOA loan officer. The receipt will be released if the application is rejected.'
                        : result.loanStatus === 'approved'
                        ? 'The loan has been approved and is pending disbursement.'
                        : result.loanStatus === 'disbursed'
                        ? 'The loan has been disbursed. This receipt will be released upon full repayment.'
                        : 'This receipt is pledged against an active BOA loan.'}
                    </p>
                  </div>
                </div>
              )}

              {result.status === 'redeemed' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 mb-6">
                  <span className="material-symbols-outlined text-slate-500 shrink-0 mt-0.5">info</span>
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">Commodity has been collected</p>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                      This receipt was already redeemed. The goods are no longer in storage. If you believe this is an error, contact your nearest BOA branch.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setResult(null); setReceiptNo(''); }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Verify Another
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 py-3 rounded-xl bg-boa-green text-white text-sm font-semibold hover:bg-emerald-700 transition"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Info section — shown before any search */}
        {!result && !loading && (
          <section className="py-16 px-6">
            <div className="max-w-2xl mx-auto">
              <p className="text-center text-slate-400 text-sm mb-8">Receipt statuses explained</p>
              <div className="grid sm:grid-cols-3 gap-4">
                {(Object.entries(statusConfig) as [string, typeof statusConfig['active']][]).map(([key, s]) => (
                  <div key={key} className={`rounded-xl border ${s.border} ${s.bg} p-5`}>
                    <span
                      className={`material-symbols-outlined text-2xl ${s.color} mb-2 block`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {s.icon}
                    </span>
                    <p className={`font-semibold text-sm ${s.color} mb-1`}>{s.label}</p>
                    <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 bg-white rounded-2xl border border-slate-200 flex items-start gap-4">
                <span className="material-symbols-outlined text-2xl text-amber-500 shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shield
                </span>
                <div>
                  <p className="font-semibold text-slate-800 text-sm mb-1">AgriHub Receipts are fraud-proof</p>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Every receipt is generated by a certified BOA Aggregation Centre Manager and recorded on the BOA AgriHub platform. Farmers can verify any receipt number here at any time, free of charge.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

function DetailRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex justify-between items-center px-5 py-3.5 text-sm ${!last ? 'border-b border-slate-100' : ''}`}>
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800 text-right max-w-[55%]">{value}</span>
    </div>
  );
}
