import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

type AppStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

interface TrackResult {
  refId: string;
  status: AppStatus;
  centreName: string;
  state: string | null;
  createdAt: string;
  reviewNotes: string | null;
}

const statusConfig: Record<AppStatus, { label: string; icon: string; color: string; bg: string; border: string; desc: string }> = {
  pending: {
    label:  'Pending Review',
    icon:   'schedule',
    color:  'text-amber-600',
    bg:     'bg-amber-50',
    border: 'border-amber-200',
    desc:   'Your application has been received and is in the queue for review by a BOA officer.',
  },
  under_review: {
    label:  'Under Review',
    icon:   'manage_search',
    color:  'text-blue-600',
    bg:     'bg-blue-50',
    border: 'border-blue-200',
    desc:   'A BOA officer is currently reviewing your application. This usually takes 3–5 business days.',
  },
  approved: {
    label:  'Approved',
    icon:   'verified',
    color:  'text-emerald-600',
    bg:     'bg-emerald-50',
    border: 'border-emerald-200',
    desc:   'Congratulations! Your aggregation centre has been approved and is now active on the BOA network.',
  },
  rejected: {
    label:  'Not Approved',
    icon:   'cancel',
    color:  'text-red-600',
    bg:     'bg-red-50',
    border: 'border-red-200',
    desc:   'Your application was not approved at this time. Please contact BOA for details and guidance on reapplying.',
  },
};

export default function TrackPage() {
  const navigate   = useNavigate();
  const [refId,    setRefId]   = useState('');
  const [loading,  setLoading] = useState(false);
  const [result,   setResult]  = useState<TrackResult | null>(null);
  const [error,    setError]   = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = refId.trim().toUpperCase();
    if (!clean) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res  = await fetch(`/api/applications/ref/${clean}`);
      const json = await res.json();
      if (!json.success) throw new Error('Reference ID not found. Please check and try again.');
      setResult(json.data);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cfg = result ? statusConfig[result.status] : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-emerald-900 py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-800 text-emerald-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <span className="material-symbols-outlined text-base">track_changes</span>
              Application Tracker
            </div>
            <h1 className="font-headline font-extrabold text-4xl text-white mb-4 leading-tight">
              Track Your Application
            </h1>
            <p className="text-emerald-300 text-base max-w-md mx-auto">
              Enter your reference number to check the current status of your aggregation centre registration.
            </p>

            {/* Search form */}
            <form onSubmit={handleTrack} className="mt-10 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
                placeholder="e.g. AGC-TSS3MLTK"
                className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-5 py-3.5 text-sm outline-none focus:border-harvest-gold focus:bg-white/15 transition font-mono tracking-wider uppercase"
                maxLength={12}
              />
              <button
                type="submit"
                disabled={loading || !refId.trim()}
                className="bg-harvest-gold hover:bg-amber-500 disabled:opacity-50 text-emerald-950 font-bold px-7 py-3.5 rounded-xl text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                ) : (
                  <span className="material-symbols-outlined text-base">search</span>
                )}
                {loading ? 'Checking…' : 'Track'}
              </button>
            </form>

            {error && (
              <div className="mt-4 flex items-center justify-center gap-2 text-red-300 text-sm">
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
              {/* Status card */}
              <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-8 text-center`}>
                <span className={`material-symbols-outlined text-5xl ${cfg.color} mb-3 block`}
                  style={{ fontVariationSettings: "'FILL' 1" }}>
                  {cfg.icon}
                </span>
                <p className={`text-lg font-bold ${cfg.color} mb-2`}>{cfg.label}</p>
                <p className="text-slate-600 text-sm leading-relaxed">{cfg.desc}</p>
              </div>

              {result.reviewNotes && (
                <div className="mt-4 p-5 rounded-2xl bg-white border border-slate-200 text-left">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Review Note from BOA</p>
                  <p className="text-slate-700 text-sm leading-relaxed">{result.reviewNotes}</p>
                </div>
              )}

              {/* Details */}
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                <DetailRow label="Reference ID"   value={result.refId}         mono />
                <DetailRow label="Centre Name"    value={result.centreName} />
                <DetailRow label="State"          value={result.state ?? '—'} />
                <DetailRow label="Submitted"      value={new Date(result.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })} />
              </div>

              {result.status === 'approved' && (
                <div className="mt-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-600 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
                  <div>
                    <p className="font-semibold text-emerald-800 text-sm">Your centre is now active!</p>
                    <p className="text-emerald-700 text-xs mt-1">A BOA representative will contact you with onboarding details and your official certificate.</p>
                  </div>
                </div>
              )}

              {result.status === 'rejected' && (
                <div className="mt-6 p-5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-500 mt-0.5">info</span>
                  <div>
                    <p className="font-semibold text-red-700 text-sm">Need help?</p>
                    <p className="text-red-600 text-xs mt-1">Call BOA on <strong>0800-BOA-HELP</strong> or visit your nearest BOA branch for guidance on reapplying.</p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => { setResult(null); setRefId(''); }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Track Another
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

        {/* Empty state — no search yet */}
        {!result && !loading && (
          <section className="py-16 px-6">
            <div className="max-w-2xl mx-auto">
              <p className="text-center text-slate-400 text-sm mb-10">What each status means</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {(Object.entries(statusConfig) as [AppStatus, typeof statusConfig[AppStatus]][]).map(([, cfg]) => (
                  <div key={cfg.label} className={`rounded-xl border ${cfg.border} ${cfg.bg} p-5 flex gap-4`}>
                    <span className={`material-symbols-outlined text-2xl ${cfg.color} shrink-0 mt-0.5`}
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                      {cfg.icon}
                    </span>
                    <div>
                      <p className={`font-semibold text-sm ${cfg.color}`}>{cfg.label}</p>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">{cfg.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center px-5 py-3.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold text-slate-800 ${mono ? 'font-mono tracking-wider' : ''}`}>{value}</span>
    </div>
  );
}
