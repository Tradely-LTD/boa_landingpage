import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ReceiptPreview {
  receiptNumber: string;
  commodity: string;
  quantityKg: number;
  gradeQuality: string | null;
  farmerName: string;
  farmerPhone: string | null;
  centreName: string;
  issuedAt: string;
  expiresAt: string | null;
  status: string;
}

interface LoanConfirmation {
  refId: string;
  farmerName: string;
  commodity: string;
  quantityKg: number;
  centreName: string;
  receiptNumber: string;
  loanAmountRequested: number;
  status: string;
  createdAt: string;
}

type Step = 'lookup' | 'form' | 'done';

const fmt = (n: number) => `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });

export default function ApplyLoanPage() {
  const [step, setStep]             = useState<Step>('lookup');
  const [receiptNo, setReceiptNo]   = useState('');
  const [preview, setPreview]       = useState<ReceiptPreview | null>(null);
  const [confirmation, setConfirm]  = useState<LoanConfirmation | null>(null);

  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError,   setLookupError]   = useState('');

  const [form, setForm] = useState({ loanAmount: '', farmerPhone: '', farmerNin: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError,   setSubmitError]   = useState('');

  // ── Step 1: verify receipt ──────────────────────────────────────────────────
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = receiptNo.trim().toUpperCase();
    if (!clean) return;

    setLookupLoading(true);
    setLookupError('');
    setPreview(null);

    try {
      const res  = await fetch(`/api/warehouse-receipts/verify/${encodeURIComponent(clean)}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? 'Receipt not found.');

      if (json.data.status !== 'active') {
        if (json.data.status === 'pledged') {
          const loanStatusLabel: Record<string, string> = {
            pending:   'pending review',
            approved:  'approved',
            disbursed: 'disbursed',
            repaid:    'repaid',
            defaulted: 'defaulted',
            rejected:  'rejected',
          };
          const label = loanStatusLabel[json.data.loanStatus] ?? 'under review';
          const refPart = json.data.loanRef ? ` (Ref: ${json.data.loanRef})` : '';
          throw new Error(`A loan application${refPart} is currently ${label} against this receipt. It cannot be used again until the application is resolved.`);
        }
        const msg: Record<string, string> = {
          redeemed: 'This receipt has already been redeemed — the commodity was collected.',
          expired:  'This receipt has expired and cannot be used as collateral.',
        };
        throw new Error(msg[json.data.status] ?? `Receipt status is "${json.data.status}" — only active receipts can be used.`);
      }

      setPreview(json.data);
      setForm(f => ({ ...f, farmerPhone: json.data.farmerPhone ?? '' }));
      setStep('form');
    } catch (err: any) {
      setLookupError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  // ── Step 2: submit application ──────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) return;

    setSubmitLoading(true);
    setSubmitError('');

    try {
      const res  = await fetch('/api/loan-applications/public', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptNumber:       preview.receiptNumber,
          loanAmountRequested: parseFloat(form.loanAmount),
          farmerPhone:         form.farmerPhone || undefined,
          farmerNin:           form.farmerNin   || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? 'Submission failed.');
      setConfirm(json.data);
      setStep('done');
    } catch (err: any) {
      setSubmitError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const reset = () => {
    setStep('lookup'); setReceiptNo(''); setPreview(null); setConfirm(null);
    setForm({ loanAmount: '', farmerPhone: '', farmerNin: '' });
    setLookupError(''); setSubmitError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-emerald-900 py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-800 text-emerald-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <span className="material-symbols-outlined text-base">account_balance</span>
              AgriHub Receipt Financing
            </div>
            <h1 className="font-headline font-extrabold text-4xl text-white mb-4 leading-tight">
              Apply for a BOA Agri-Loan
            </h1>
            <p className="text-emerald-300 text-base max-w-lg mx-auto">
              Use your AgriHub Receipt (AHR) as collateral to access affordable financing from the Bank of Agriculture.
              No additional registration required.
            </p>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-3 mt-10">
              {(['lookup', 'form', 'done'] as Step[]).map((s, i) => {
                const labels = ['Verify Receipt', 'Loan Details', 'Confirmation'];
                const done = (step === 'form' && i === 0) || step === 'done';
                const active = step === s;
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        done    ? 'bg-harvest-gold text-emerald-900' :
                        active  ? 'bg-white text-emerald-900' :
                                  'bg-emerald-800 text-emerald-400'
                      }`}>
                        {done ? <span className="material-symbols-outlined text-sm">check</span> : i + 1}
                      </div>
                      <span className={`text-sm font-medium hidden sm:block ${active ? 'text-white' : done ? 'text-harvest-gold' : 'text-emerald-500'}`}>
                        {labels[i]}
                      </span>
                    </div>
                    {i < 2 && <div className={`w-8 h-px ${done ? 'bg-harvest-gold' : 'bg-emerald-700'}`} />}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-lg mx-auto">

            {/* ── STEP 1: Receipt Lookup ─────────────────────────────── */}
            {step === 'lookup' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8">
                <div className="text-center mb-8">
                  <span className="material-symbols-outlined text-4xl text-emerald-600 mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>
                    receipt_long
                  </span>
                  <h2 className="text-xl font-bold text-slate-800">Enter your Receipt Number</h2>
                  <p className="text-slate-500 text-sm mt-2">
                    Your AgriHub Receipt (AHR) number is printed on the receipt issued by your Aggregation Centre Manager.
                  </p>
                </div>

                <form onSubmit={handleLookup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">AgriHub Receipt Number (AHR)</label>
                    <input
                      value={receiptNo}
                      onChange={e => setReceiptNo(e.target.value)}
                      placeholder="e.g. WR-202505-AB12C"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 font-mono tracking-wider uppercase transition"
                    />
                  </div>

                  {lookupError && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                      <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
                      {lookupError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={lookupLoading || !receiptNo.trim()}
                    className="w-full bg-boa-green hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {lookupLoading
                      ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Verifying…</>
                      : <><span className="material-symbols-outlined text-base">search</span> Look Up Receipt</>
                    }
                  </button>
                </form>

                {/* Info box */}
                <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-600 shrink-0 mt-0.5 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">What you'll need</p>
                    <ul className="text-amber-700 text-xs mt-1 space-y-0.5 list-disc list-inside leading-relaxed">
                      <li>Your AgriHub Receipt (AHR) number (from your Centre Manager)</li>
                      <li>The loan amount you are requesting</li>
                      <li>Your phone number (optional but recommended)</li>
                      <li>Your NIN — National Identification Number (optional)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Loan Application Form ─────────────────────── */}
            {step === 'form' && preview && (
              <div className="space-y-4">
                {/* Receipt summary card */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-emerald-600 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    <p className="text-sm font-bold text-emerald-800">Receipt Verified — Active</p>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div>
                      <p className="text-xs text-emerald-600">Receipt No.</p>
                      <p className="font-mono font-semibold text-emerald-900 text-xs">{preview.receiptNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600">Farmer</p>
                      <p className="font-semibold text-emerald-900 text-xs">{preview.farmerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600">Commodity</p>
                      <p className="font-semibold text-emerald-900 text-xs">{preview.commodity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600">Quantity</p>
                      <p className="font-semibold text-emerald-900 text-xs">{preview.quantityKg.toLocaleString()} kg</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-emerald-600">Storage Centre</p>
                      <p className="font-semibold text-emerald-900 text-xs">{preview.centreName}</p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-800 mb-1">Loan Request Details</h2>
                  <p className="text-slate-500 text-sm mb-6">
                    Your stored commodity will serve as collateral. A BOA loan officer will review your application.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Loan Amount Requested (₦) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="10000"
                        step="1000"
                        value={form.loanAmount}
                        onChange={e => setForm(f => ({ ...f, loanAmount: e.target.value }))}
                        placeholder="e.g. 500000"
                        required
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        BOA typically finances 60–80% of the stored commodity value. A loan officer will confirm the final approved amount.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={form.farmerPhone}
                        onChange={e => setForm(f => ({ ...f, farmerPhone: e.target.value }))}
                        placeholder="e.g. 08012345678"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
                      />
                      <p className="text-xs text-slate-400 mt-1">So BOA can contact you about your application.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">NIN (National Identification Number)</label>
                      <input
                        type="text"
                        maxLength={11}
                        value={form.farmerNin}
                        onChange={e => setForm(f => ({ ...f, farmerNin: e.target.value.replace(/\D/g, '') }))}
                        placeholder="11-digit NIN"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition font-mono tracking-wider"
                      />
                    </div>

                    {/* Collateral warning */}
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <span className="material-symbols-outlined text-amber-600 shrink-0 mt-0.5 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                      <p className="text-amber-700 text-xs leading-relaxed">
                        By submitting this application, your receipt <strong>{preview.receiptNumber}</strong> will be <strong>pledged as collateral</strong> and locked until the loan is repaid or your application is rejected.
                      </p>
                    </div>

                    {submitError && (
                      <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                        <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
                        {submitError}
                      </div>
                    )}

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setStep('lookup')}
                        className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={submitLoading || !form.loanAmount}
                        className="flex-1 py-3 rounded-xl bg-boa-green hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        {submitLoading
                          ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Submitting…</>
                          : <><span className="material-symbols-outlined text-base">send</span> Submit Application</>
                        }
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ── STEP 3: Confirmation ───────────────────────────────── */}
            {step === 'done' && confirmation && (
              <div className="space-y-4">
                {/* Success banner */}
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-8 text-center">
                  <span className="material-symbols-outlined text-6xl text-emerald-600 mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  <h2 className="text-xl font-bold text-emerald-800 mb-2">Application Submitted!</h2>
                  <p className="text-emerald-700 text-sm leading-relaxed">
                    Your loan application has been received. A BOA loan officer will review it and contact you shortly.
                  </p>
                  <div className="mt-4 bg-white border border-emerald-200 rounded-xl px-6 py-4 inline-block">
                    <p className="text-xs text-emerald-600 mb-1">Your Application Reference Number</p>
                    <p className="font-mono font-bold text-xl text-emerald-900 tracking-wider">{confirmation.refId}</p>
                    <p className="text-xs text-slate-400 mt-1">Save this number for follow-up at any BOA branch</p>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Application Summary</p>
                  </div>
                  <SummaryRow label="Farmer Name"       value={confirmation.farmerName} />
                  <SummaryRow label="Commodity"         value={confirmation.commodity} />
                  <SummaryRow label="Quantity Stored"   value={`${confirmation.quantityKg.toLocaleString()} kg`} />
                  <SummaryRow label="Storage Centre"    value={confirmation.centreName} />
                  <SummaryRow label="Receipt No."       value={confirmation.receiptNumber} />
                  <SummaryRow label="Amount Requested"  value={fmt(confirmation.loanAmountRequested)} />
                  <SummaryRow label="Status"            value="Pending Review" last />
                </div>

                {/* What happens next */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                  <p className="text-sm font-semibold text-slate-800">What happens next?</p>
                  {[
                    { icon: 'manage_search', label: 'BOA reviews your application', desc: 'A loan officer will verify your receipt and assess the loan amount.' },
                    { icon: 'call', label: 'You will be contacted', desc: `We'll reach out via your registered phone number with a decision.` },
                    { icon: 'payments', label: 'Disbursement', desc: 'Once approved, the loan is disbursed to your BOA account or linked bank account.' },
                    { icon: 'lock_open', label: 'Receipt released on repayment', desc: 'After full repayment, your receipt is unlocked and you can collect your commodity.' },
                  ].map(item => (
                    <div key={item.icon} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-600 text-base shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{item.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={reset}
                  className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Submit Another Application
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SummaryRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex justify-between items-center px-5 py-3.5 text-sm ${!last ? 'border-b border-slate-100' : ''}`}>
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800 text-right max-w-[55%]">{value}</span>
    </div>
  );
}
