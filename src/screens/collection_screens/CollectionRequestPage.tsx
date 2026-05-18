import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
];

const COMMODITIES = ['Maize','Rice','Sorghum','Millet','Cowpea','Groundnut','Soybean','Cassava','Yam','Sweet Potato','Wheat','Sesame','Other'];

const VEHICLE_OPTIONS = [
  { value: 'tricycle',   icon: 'electric_rickshaw', label: 'Tricycle'  },
  { value: 'motorcycle', icon: 'two_wheeler',        label: 'Motorcycle'},
  { value: 'truck',      icon: 'local_shipping',     label: 'Truck'     },
  { value: 'packer',     icon: 'shopping_bag',       label: 'Packer'    },
] as const;

type CollectionType = typeof VEHICLE_OPTIONS[number]['value'];
type GeoState = 'idle' | 'locating' | 'pinned' | 'error';
type Status = 'idle' | 'submitting' | 'done' | 'error';

const inputClass = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-300 bg-white text-slate-800 placeholder:text-slate-400';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

interface FormState {
  farmerName: string;
  farmerPhone: string;
  farmerNin: string;
  address: string;
  state: string;
  lga: string;
  commodity: string;
  estimatedQuantityKg: string;
  collectionType: CollectionType | '';
  preferredDate: string;
  preferredTimeHour: string;
  preferredTimeMinute: string;
  preferredTimePeriod: string;
  notes: string;
  gpsLat: string;
  gpsLng: string;
}

const EMPTY_FORM: FormState = {
  farmerName: '', farmerPhone: '', farmerNin: '',
  address: '', state: '', lga: '',
  commodity: '', estimatedQuantityKg: '',
  collectionType: '', preferredDate: '',
  preferredTimeHour: '8', preferredTimeMinute: '00', preferredTimePeriod: 'AM',
  notes: '',
  gpsLat: '', gpsLng: '',
};

export default function CollectionRequestPage() {
  const [form, setForm]     = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError]   = useState('');
  const [refId, setRefId]   = useState('');
  const [geoState, setGeoState] = useState<GeoState>('idle');
  const [geoError, setGeoError] = useState('');

  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handlePinLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setGeoState('error');
      return;
    }
    setGeoState('locating');
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        set('gpsLat', String(lat));
        set('gpsLng', String(lng));

        try {
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } },
          );
          const data = await res.json();
          const addr = data.address ?? {};

          // Street address — build from most specific fields available
          const streetParts = [addr.road, addr.neighbourhood, addr.suburb, addr.city_district, addr.village, addr.town].filter(Boolean);
          if (streetParts.length) set('address', streetParts.slice(0, 3).join(', '));

          // State matching — Nominatim returns e.g. "Kano State", "Federal Capital Territory"
          const STATE_ALIASES: Record<string, string> = {
            'federal capital territory':          'FCT',
            'abuja federal capital territory':    'FCT',
            'fct':                                'FCT',
          };
          const rawState      = (addr.state ?? '').replace(/\s+State$/i, '').trim();
          const rawStateLower = rawState.toLowerCase();
          const matchedState  =
            STATE_ALIASES[rawStateLower] ??
            NIGERIAN_STATES.find(s => s.toLowerCase() === rawStateLower) ??
            NIGERIAN_STATES.find(s => rawStateLower.includes(s.toLowerCase())) ??
            NIGERIAN_STATES.find(s => s.toLowerCase().includes(rawStateLower)) ??
            '';
          if (matchedState) set('state', matchedState);

          // LGA — Nominatim uses county/state_district/district depending on area
          const rawLga =
            addr.county         ??
            addr.state_district ??
            addr.district       ??
            addr.municipality   ??
            addr.city_district  ??
            '';
          if (rawLga) set('lga', rawLga.replace(/\s+LGA$/i, '').trim());
        } catch {
          // Nominatim failed — coords still saved, user can type manually
        }

        setGeoState('pinned');
      },
      (err) => {
        const denied = err.code === 1;
        setGeoError(denied
          ? 'Location access denied. Please allow location access in your browser and try again.'
          : 'Could not determine your location. Please type your address manually.');
        setGeoState('error');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setError('');

    try {
      const res  = await fetch('/api/collection-requests', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          farmerName:          form.farmerName,
          farmerPhone:         form.farmerPhone,
          farmerNin:           form.farmerNin           || undefined,
          address:             form.address,
          state:               form.state,
          lga:                 form.lga,
          commodity:           form.commodity,
          estimatedQuantityKg: parseFloat(form.estimatedQuantityKg),
          collectionType:      form.collectionType,
          preferredDate:       form.preferredDate,
          preferredTime:       `${form.preferredTimeHour}:${form.preferredTimeMinute} ${form.preferredTimePeriod}`,
          notes:               form.notes               || undefined,
          gpsLat:              form.gpsLat              || undefined,
          gpsLng:              form.gpsLng              || undefined,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? 'Submission failed. Please try again.');

      setRefId(json.data.refId);
      setStatus('done');
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 px-8 py-10 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-4xl text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                Request Submitted!
              </h1>
              <p className="text-slate-500 text-sm mb-6">
                Your collection request has been received. A collector will contact you within 24 hours to confirm the pickup.
              </p>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 mb-6">
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1">Your Reference Number</p>
                <p className="text-2xl font-mono font-bold text-emerald-700">{refId}</p>
                <p className="text-xs text-emerald-600 mt-1">Save this number to track your request</p>
              </div>

              <div className="space-y-3 text-left mb-6">
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-base text-emerald-500 mt-0.5 shrink-0">assignment_ind</span>
                  <span>A collector will be assigned and will contact you on <strong>{form.farmerPhone}</strong></span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-base text-emerald-500 mt-0.5 shrink-0">local_shipping</span>
                  <span>The collector will come with a <strong>{form.collectionType}</strong> to pick up your <strong>{form.commodity}</strong></span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-base text-emerald-500 mt-0.5 shrink-0">receipt_long</span>
                  <span>After collection, the centre will issue you an <strong>AgriHub Receipt (AHR)</strong> as proof of deposit</span>
                </div>
              </div>

              <a href="/" className="block w-full py-3 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition text-center">
                Back to Home
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <span className="material-symbols-outlined text-base">local_shipping</span>
              Harvest Collection Service
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Request a Harvest Pickup
            </h1>
            <p className="text-slate-500 max-w-lg mx-auto">
              Fill in the form below and we'll send a collector to your location with the right vehicle to pick up your harvest.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg border border-slate-100 px-8 py-8 space-y-6">

            {/* Farmer Details */}
            <section>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">person</span>
                Your Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Full Name <span className="text-red-400">*</span></label>
                  <input value={form.farmerName} onChange={e => set('farmerName', e.target.value)} required
                    className={inputClass} placeholder="Your full name" />
                </div>
                <div>
                  <label className={labelClass}>Phone Number <span className="text-red-400">*</span></label>
                  <input type="tel" value={form.farmerPhone} onChange={e => set('farmerPhone', e.target.value)} required
                    className={inputClass} placeholder="08012345678" />
                </div>
                <div>
                  <label className={labelClass}>NIN <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input value={form.farmerNin} onChange={e => set('farmerNin', e.target.value)}
                    className={inputClass} placeholder="11-digit NIN" />
                </div>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Location */}
            <section>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">location_on</span>
                Pickup Location
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Street Address <span className="text-red-400">*</span></label>

                  {/* Pin Location button */}
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={handlePinLocation}
                      disabled={geoState === 'locating'}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition
                        ${geoState === 'pinned'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700'}
                        disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {geoState === 'locating' ? (
                        <>
                          <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                          Getting location…
                        </>
                      ) : geoState === 'pinned' ? (
                        <>
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                          Location Pinned — {parseFloat(form.gpsLat).toFixed(5)}, {parseFloat(form.gpsLng).toFixed(5)}
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">my_location</span>
                          Pin My Location
                        </>
                      )}
                    </button>
                    {geoState === 'pinned' && (
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${form.gpsLat}&mlon=${form.gpsLng}&zoom=15`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-xs text-emerald-600 underline underline-offset-2 hover:text-emerald-800"
                      >
                        View on map
                      </a>
                    )}
                    {geoState === 'error' && (
                      <p className="mt-1 text-xs text-red-600">{geoError}</p>
                    )}
                  </div>

                  <input
                    value={form.address}
                    onChange={e => set('address', e.target.value)}
                    required
                    className={inputClass}
                    placeholder="Village / street address"
                  />
                </div>
                <div>
                  <label className={labelClass}>State <span className="text-red-400">*</span></label>
                  <select value={form.state} onChange={e => set('state', e.target.value)} required className={inputClass}>
                    <option value="">Select state…</option>
                    {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>LGA <span className="text-red-400">*</span></label>
                  <input value={form.lga} onChange={e => set('lga', e.target.value)} required
                    className={inputClass} placeholder="Local Government Area" />
                </div>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Harvest Details */}
            <section>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">agri</span>
                Harvest Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Commodity <span className="text-red-400">*</span></label>
                  <select value={form.commodity} onChange={e => set('commodity', e.target.value)} required className={inputClass}>
                    <option value="">Select commodity…</option>
                    {COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Estimated Quantity (kg) <span className="text-red-400">*</span></label>
                  <input type="number" min="1" step="0.1" value={form.estimatedQuantityKg} onChange={e => set('estimatedQuantityKg', e.target.value)} required
                    className={inputClass} placeholder="e.g. 500" />
                </div>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Collection Preferences */}
            <section>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">local_shipping</span>
                Collection Preferences
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Preferred Vehicle <span className="text-red-400">*</span></label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {VEHICLE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => set('collectionType', opt.value)}
                        className={`flex flex-col items-center gap-1.5 py-3.5 rounded-xl border-2 text-sm font-semibold transition
                          ${form.collectionType === opt.value
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                      >
                        <span className="material-symbols-outlined text-2xl">{opt.icon}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                  {!form.collectionType && (
                    <input type="text" required value="" onChange={() => {}} className="sr-only" aria-hidden="true" tabIndex={-1} />
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className={labelClass}>Preferred Pickup Date <span className="text-red-400">*</span></label>
                    <input type="date" value={form.preferredDate} onChange={e => set('preferredDate', e.target.value)} required
                      min={new Date().toISOString().slice(0, 10)}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Preferred Pickup Time <span className="text-red-400">*</span></label>
                    <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-300 bg-white">
                      {/* Hour */}
                      <select
                        value={form.preferredTimeHour}
                        onChange={e => set('preferredTimeHour', e.target.value)}
                        required
                        className="flex-1 px-3 py-3 text-sm text-slate-800 bg-transparent outline-none border-r border-slate-200 appearance-none text-center"
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      {/* Minute */}
                      <select
                        value={form.preferredTimeMinute}
                        onChange={e => set('preferredTimeMinute', e.target.value)}
                        className="flex-1 px-3 py-3 text-sm text-slate-800 bg-transparent outline-none border-r border-slate-200 appearance-none text-center"
                      >
                        {['00', '15', '30', '45'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      {/* AM / PM */}
                      <select
                        value={form.preferredTimePeriod}
                        onChange={e => set('preferredTimePeriod', e.target.value)}
                        className="px-3 py-3 text-sm font-semibold text-slate-800 bg-transparent outline-none appearance-none text-center"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className={labelClass}>Additional Notes <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
                  className={`${inputClass} resize-none`} placeholder="Any special instructions, access details, or information for the collector…" />
              </div>
            </section>

            {(status === 'error' && error) && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5">info</span>
              <span>After submission, a centre manager will review and assign a collector. The collector will call you before coming to confirm the pickup.</span>
            </div>

            <button
              type="submit"
              disabled={status === 'submitting' || !form.collectionType}
              className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
            >
              {status === 'submitting' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  Submitting Request…
                </span>
              ) : 'Submit Collection Request'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
