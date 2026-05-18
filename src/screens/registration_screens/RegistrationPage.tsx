import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Tooltip from '../../components/Tooltip';

const STEPS = [
  { id: 1, label: 'Identity',      icon: 'badge' },
  { id: 2, label: 'Ownership',     icon: 'person' },
  { id: 3, label: 'Infrastructure',icon: 'warehouse' },
  { id: 4, label: 'Location',      icon: 'location_on' },
  { id: 5, label: 'Manager',       icon: 'manage_accounts' },
  { id: 6, label: 'Banking',       icon: 'account_balance' },
  { id: 7, label: 'Submit',        icon: 'send' },
];

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
];

const COMMODITIES = ['Maize','Rice / Paddy','Soybean','Sorghum','Wheat','Cassava','Millet','Groundnut','Others'];
const FACILITIES  = ['Weighbridge','Moisture Meter','Cold Storage','Processing Equipment','Security / CCTV','Generator Backup','Drying Floor','Grading Equipment'];

type FormData = {
  // Step 1 — Identity
  centreName:      string;
  centreType:      string;
  regNumber:       string;
  tinNumber:       string;
  yearEstablished: string;
  // Step 2 — Ownership
  ownerName:       string;
  ownerPhone:      string;
  ownerNin:        string;
  // Step 3 — Infrastructure
  warehouseType:           string;
  capacityMt:              string;
  coldStorageCapacityMt:   string;
  numBays:                 string;
  floorAreaSqm:            string;
  powerSource:             string;
  waterSource:             string;
  hasAccessRoad:           string;
  warehouseReceiptCapable: string;
  // Step 4 — Location
  address: string;
  state:   string;
  lga:     string;
  gpsLat:  string;
  gpsLng:  string;
  // Step 5 — Manager
  managerName:  string;
  managerPhone: string;
  managerNin:   string;
  managerEmail: string;
  // Step 6 — Banking
  bankName:      string;
  accountNumber: string;
  bvn:           string;
};

const inputClass  = 'w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none text-sm';
const labelClass  = 'block text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-2';
const selectClass = inputClass + ' appearance-none';

export default function RegistrationPage() {
  const [step, setStep]             = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [serverRefId, setServerRefId] = useState('');
  const [error, setError]           = useState('');
  const [commodities, setCommodities] = useState<string[]>([]);
  const [facilities,  setFacilities]  = useState<string[]>([]);
  const navigate = useNavigate();

  const { register, handleSubmit, getValues } = useForm<FormData>();

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) =>
    setList(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);

  const onSubmit = async () => {
    if (step < 7) { setStep(s => s + 1); return; }

    const values = getValues();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          centreName:              values.centreName,
          centreType:              values.centreType,
          regNumber:               values.regNumber    || undefined,
          tinNumber:               values.tinNumber    || undefined,
          yearEstablished:         values.yearEstablished ? parseInt(values.yearEstablished) : undefined,
          ownerName:               values.ownerName    || undefined,
          ownerPhone:              values.ownerPhone   || undefined,
          ownerNin:                values.ownerNin     || undefined,
          warehouseType:           values.warehouseType           || undefined,
          capacityMt:              values.capacityMt              ? parseFloat(values.capacityMt)            : undefined,
          coldStorageCapacityMt:   values.coldStorageCapacityMt   ? parseFloat(values.coldStorageCapacityMt) : undefined,
          numBays:                 values.numBays                 ? parseInt(values.numBays)                 : undefined,
          floorAreaSqm:            values.floorAreaSqm            ? parseFloat(values.floorAreaSqm)          : undefined,
          commodities:             commodities.length ? commodities : undefined,
          facilities:              facilities.length  ? facilities  : undefined,
          powerSource:             values.powerSource             || undefined,
          waterSource:             values.waterSource             || undefined,
          hasAccessRoad:           values.hasAccessRoad           ? values.hasAccessRoad === 'true'           : undefined,
          warehouseReceiptCapable: values.warehouseReceiptCapable ? values.warehouseReceiptCapable === 'true' : undefined,
          address:                 values.address    || undefined,
          state:                   values.state      || undefined,
          lga:                     values.lga        || undefined,
          gpsLat:                  values.gpsLat     || undefined,
          gpsLng:                  values.gpsLng     || undefined,
          managerName:             values.managerName  || undefined,
          managerPhone:            values.managerPhone || undefined,
          managerNin:              values.managerNin   || undefined,
          managerEmail:            values.managerEmail || undefined,
          bankName:                values.bankName      || undefined,
          accountNumber:           values.accountNumber || undefined,
          bvn:                     values.bvn           || undefined,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? 'Submission failed');
      setServerRefId(json.data.refId);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-boa-green-dark">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6 py-24">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-3xl bg-harvest-gold flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-emerald-950 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="font-headline font-black text-white text-4xl mb-4 leading-tight">
              Application<br />Submitted
            </h2>
            <p className="text-white/50 text-base mb-8 leading-relaxed">
              A BOA field officer will review your application within 3–5 business days.
              You'll receive an SMS confirmation shortly.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 mb-6">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Reference Number</p>
              <p className="font-mono font-black text-2xl text-harvest-gold">{serverRefId}</p>
            </div>
            <p className="text-white/25 text-xs">Save this reference — you'll need it to track your application.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-harvest-gold text-emerald-950 rounded-xl font-bold transition-all hover:brightness-110"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const stepTitles = [
    'Centre Identity',
    'Ownership Details',
    'Infrastructure',
    'Location',
    'Manager Details',
    'Banking Information',
    'Review & Submit',
  ];
  const stepDescs = [
    'Provide the official identification details for your facility.',
    'Tell us about who owns this aggregation centre.',
    'Describe your warehouse facilities, capacity and equipment.',
    'Provide the physical location and GPS coordinates.',
    'Details of the person managing day-to-day operations.',
    'Bank account details for disbursements and payments.',
    'Review and submit your application for BOA review.',
  ];

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
      <Navbar />

      {/* Fixed right sidebar */}
      <aside className="hidden md:flex flex-col h-screen fixed right-0 top-16 w-72 py-8 bg-emerald-900 text-amber-500 border-l border-emerald-800 shadow-xl z-40 overflow-y-auto">
        <div className="px-6 mb-8">
          <h2 className="text-emerald-100/60 text-[10px] uppercase tracking-widest mb-1">Application Steps</h2>
          <p className="text-xs text-emerald-300">{step} of {STEPS.length}</p>
        </div>
        <nav className="flex-grow">
          {STEPS.map((s) => {
            const isActive = step === s.id;
            const isDone   = step > s.id;
            return (
              <div key={s.id} className={`px-4 py-3 flex items-center gap-3 transition-all duration-300 ${
                isActive ? 'bg-emerald-800/50 text-amber-500 border-r-4 border-amber-500'
                : isDone  ? 'text-emerald-300'
                : 'text-emerald-100/50'
              }`}>
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: isActive || isDone ? "'FILL' 1" : "'FILL' 0" }}>
                  {isDone ? 'check_circle' : s.icon}
                </span>
                <span className="text-sm font-medium">{s.label}</span>
              </div>
            );
          })}
        </nav>
        <div className="mt-auto px-6 pt-4 border-t border-emerald-800/50">
          <div className="flex flex-col items-center gap-2">
            <img src="/boa-logo.png" alt="Bank of Agriculture" className="h-7 w-auto brightness-0 invert opacity-30" />
            <span className="text-[10px] text-emerald-100/30">AgriHub Platform © 2026</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-grow pt-4 md:pr-72">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Step {step} of {STEPS.length}
              </span>
            </div>
            <h1 className="font-headline font-extrabold text-3xl text-emerald-900 tracking-tight mb-2">
              {stepTitles[step - 1]}
            </h1>
            <p className="text-slate-500 max-w-lg text-sm">{stepDescs[step - 1]}</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-emerald-100/50 p-8 md:p-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* ── Step 1: Identity ─────────────────────────────────────── */}
              {step === 1 && (
                <>
                  <div>
                    <label className={labelClass}>Centre Name *</label>
                    <input {...register('centreName', { required: true })} className={inputClass} placeholder="Official name of the aggregation centre" />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Centre Type *
                      <Tooltip text="Primary: Large central warehouse receiving produce from multiple points. Secondary: Mid-sized hub serving nearby collection points. Collection Point: Small local drop-off point closest to farmers." />
                    </label>
                    <div className="relative">
                      <select {...register('centreType', { required: true })} className={selectClass}>
                        <option value="">Select type</option>
                        <option value="primary">Primary — Large central warehouse</option>
                        <option value="secondary">Secondary — Regional hub</option>
                        <option value="collection_point">Collection Point — Local farmer drop-off</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        CAC Reg. Number
                        <Tooltip text="Your Corporate Affairs Commission (CAC) registration number. Format: RC-XXXXXXX. Leave blank if your centre is not yet formally incorporated." />
                      </label>
                      <input {...register('regNumber')} className={inputClass} placeholder="RC-XXXXXXX" />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Tax ID (TIN)
                        <Tooltip text="Tax Identification Number issued by the Federal Inland Revenue Service (FIRS). Required for centres generating revenue." />
                      </label>
                      <input {...register('tinNumber')} className={inputClass} placeholder="TIN number" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Year Established</label>
                    <input {...register('yearEstablished')} className={inputClass} type="number" placeholder="e.g. 2015" min="1900" max="2026" />
                  </div>
                </>
              )}

              {/* ── Step 2: Ownership ────────────────────────────────────── */}
              {step === 2 && (
                <>
                  <div>
                    <label className={labelClass}>
                      Owner / Proprietor Full Name
                      <Tooltip text="The legal owner of the facility. This may be different from the day-to-day manager. Provide the name exactly as it appears on official documents." />
                    </label>
                    <input {...register('ownerName')} className={inputClass} placeholder="Legal name of owner" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Owner Phone</label>
                      <input {...register('ownerPhone')} className={inputClass} placeholder="08XXXXXXXXX" />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Owner NIN
                        <Tooltip text="National Identification Number issued by NIMC. An 11-digit number found on your National ID card or slip." />
                      </label>
                      <input {...register('ownerNin')} className={inputClass} placeholder="11-digit NIN" maxLength={11} />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-base mt-0.5">info</span>
                      <span>NIN is collected for identity verification only and is stored securely.</span>
                    </div>
                  </div>
                </>
              )}

              {/* ── Step 3: Infrastructure ───────────────────────────────── */}
              {step === 3 && (
                <>
                  <div>
                    <label className={labelClass}>
                      Warehouse Type
                      <Tooltip text="Silo: Tall cylindrical grain storage. Shed: Covered building with walls. Open Yard: Uncovered outdoor storage. Cold Storage: Temperature-controlled facility. Mixed: Combination of types." />
                    </label>
                    <div className="relative">
                      <select {...register('warehouseType')} className={selectClass}>
                        <option value="">Select type</option>
                        <option value="silo">Silo</option>
                        <option value="shed">Shed</option>
                        <option value="open_yard">Open Yard</option>
                        <option value="cold_storage">Cold Storage</option>
                        <option value="mixed">Mixed</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        Total Capacity (MT)
                        <Tooltip text="Maximum storage capacity in Metric Tonnes across all storage units combined." />
                      </label>
                      <input {...register('capacityMt')} className={inputClass} type="number" placeholder="e.g. 5000" />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Cold Storage Capacity (MT)
                        <Tooltip text="If your facility has a refrigerated or temperature-controlled section, enter its capacity here. Enter 0 or leave blank if not applicable." />
                      </label>
                      <input {...register('coldStorageCapacityMt')} className={inputClass} type="number" placeholder="e.g. 500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        Number of Bays
                        <Tooltip text="A bay is a distinct storage compartment or section within the warehouse. Enter the total number of separate storage bays." />
                      </label>
                      <input {...register('numBays')} className={inputClass} type="number" placeholder="e.g. 12" />
                    </div>
                    <div>
                      <label className={labelClass}>Floor Area (sqm)</label>
                      <input {...register('floorAreaSqm')} className={inputClass} type="number" placeholder="e.g. 2400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Power Source</label>
                      <div className="relative">
                        <select {...register('powerSource')} className={selectClass}>
                          <option value="">Select</option>
                          <option value="grid">National Grid (NEPA/DISCO)</option>
                          <option value="generator">Generator</option>
                          <option value="solar">Solar</option>
                          <option value="none">None</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Water Source</label>
                      <div className="relative">
                        <select {...register('waterSource')} className={selectClass}>
                          <option value="">Select</option>
                          <option value="borehole">Borehole</option>
                          <option value="tap">Tap / Pipe</option>
                          <option value="none">None</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        Access Road
                        <Tooltip text="Does your facility have a motorable road that trucks can use to load and unload produce?" />
                      </label>
                      <div className="relative">
                        <select {...register('hasAccessRoad')} className={selectClass}>
                          <option value="">Select</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>
                        AgriHub Receipt Capable
                        <Tooltip text="An AgriHub Receipt (AHR) is a digital document issued to farmers as proof of commodity deposit. It can be used as collateral for BOA loans. Select Yes if your facility can issue and manage these receipts." />
                      </label>
                      <div className="relative">
                        <select {...register('warehouseReceiptCapable')} className={selectClass}>
                          <option value="">Select</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Primary Commodities Handled</label>
                    <div className="flex flex-wrap gap-2">
                      {COMMODITIES.map(c => (
                        <button key={c} type="button" onClick={() => toggleItem(commodities, setCommodities, c)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                            commodities.includes(c)
                              ? 'border-boa-green bg-boa-green text-white'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
                          }`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Available Facilities</label>
                    <div className="grid grid-cols-2 gap-3">
                      {FACILITIES.map(f => (
                        <button key={f} type="button" onClick={() => toggleItem(facilities, setFacilities, f)}
                          className={`flex items-center gap-2.5 p-3 rounded-lg text-sm font-medium border-2 text-left transition-all ${
                            facilities.includes(f)
                              ? 'border-boa-green bg-emerald-50 text-emerald-800'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200'
                          }`}>
                          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: facilities.includes(f) ? "'FILL' 1" : "'FILL' 0" }}>
                            {facilities.includes(f) ? 'check_circle' : 'circle'}
                          </span>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── Step 4: Location ─────────────────────────────────────── */}
              {step === 4 && (
                <>
                  <div>
                    <label className={labelClass}>Full Address</label>
                    <input {...register('address')} className={inputClass} placeholder="Street address, landmark, area" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>State *</label>
                      <div className="relative">
                        <select {...register('state', { required: true })} className={selectClass}>
                          <option value="">Select state</option>
                          {NIGERIAN_STATES.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>LGA</label>
                      <input {...register('lga')} className={inputClass} placeholder="Local Government Area" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>GPS Latitude</label>
                      <input {...register('gpsLat')} className={inputClass} placeholder="e.g. 11.9964" />
                    </div>
                    <div>
                      <label className={labelClass}>GPS Longitude</label>
                      <input {...register('gpsLng')} className={inputClass} placeholder="e.g. 8.5173" />
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-4 rounded-lg bg-emerald-50 text-sm text-emerald-800">
                    <span className="material-symbols-outlined text-emerald-600 text-base mt-0.5">location_on</span>
                    <span>Use Google Maps → right-click your location → copy the coordinates shown.</span>
                  </div>
                </>
              )}

              {/* ── Step 5: Manager ──────────────────────────────────────── */}
              {step === 5 && (
                <>
                  <div>
                    <label className={labelClass}>Manager Full Name</label>
                    <input {...register('managerName')} className={inputClass} placeholder="Full legal name" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Phone Number</label>
                      <input {...register('managerPhone')} className={inputClass} placeholder="08XXXXXXXXX" />
                    </div>
                    <div>
                      <label className={labelClass}>Email Address</label>
                      <input {...register('managerEmail')} className={inputClass} type="email" placeholder="manager@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>
                      NIN (National ID Number)
                      <Tooltip text="11-digit National Identification Number issued by NIMC. Found on your National ID card, voter's card, or NIN slip. Used only for identity verification." />
                    </label>
                    <input {...register('managerNin')} className={inputClass} placeholder="11-digit NIN" maxLength={11} />
                    <p className="text-xs text-slate-400 mt-1.5">Stored securely and used for identity verification only.</p>
                  </div>
                </>
              )}

              {/* ── Step 6: Banking ──────────────────────────────────────── */}
              {step === 6 && (
                <>
                  <div>
                    <label className={labelClass}>Bank Name</label>
                    <input {...register('bankName')} className={inputClass} placeholder="e.g. First Bank of Nigeria" />
                  </div>
                  <div>
                    <label className={labelClass}>Account Number</label>
                    <input {...register('accountNumber')} className={inputClass} placeholder="10-digit account number" maxLength={10} />
                  </div>
                  <div>
                    <label className={labelClass}>
                      BVN (Bank Verification Number)
                      <Tooltip text="11-digit number that uniquely identifies you across all Nigerian banks. Dial *565*0# on your registered phone to retrieve your BVN. Required for BOA disbursements." />
                    </label>
                    <input {...register('bvn')} className={inputClass} placeholder="11-digit BVN" maxLength={11} />
                    <p className="text-xs text-slate-400 mt-1.5">BVN is encrypted and used only for financial disbursements.</p>
                  </div>
                  <div className="flex items-start gap-2.5 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
                    <span className="material-symbols-outlined text-base mt-0.5">security</span>
                    <span>Banking information is stored with bank-grade encryption and only accessed for BOA disbursements.</span>
                  </div>
                </>
              )}

              {/* ── Step 7: Review & Submit ───────────────────────────────── */}
              {step === 7 && (
                <>
                  <ReviewRow label="Centre Name"    value={getValues('centreName')} />
                  <ReviewRow label="Centre Type"    value={getValues('centreType')} />
                  <ReviewRow label="CAC Reg No."    value={getValues('regNumber')} />
                  <ReviewRow label="TIN"            value={getValues('tinNumber')} />
                  <ReviewRow label="Year Est."      value={getValues('yearEstablished')} />
                  <ReviewRow label="Owner"          value={getValues('ownerName')} />
                  <ReviewRow label="Warehouse Type" value={getValues('warehouseType')} />
                  <ReviewRow label="Capacity"       value={getValues('capacityMt') ? `${getValues('capacityMt')} MT` : ''} />
                  <ReviewRow label="Cold Storage"   value={getValues('coldStorageCapacityMt') ? `${getValues('coldStorageCapacityMt')} MT` : ''} />
                  <ReviewRow label="Bays"           value={getValues('numBays')} />
                  <ReviewRow label="Commodities"    value={commodities.join(', ')} />
                  <ReviewRow label="State"          value={getValues('state')} />
                  <ReviewRow label="LGA"            value={getValues('lga')} />
                  <ReviewRow label="Manager"        value={getValues('managerName')} />
                  <ReviewRow label="Bank"           value={getValues('bankName')} />
                  <div className="p-4 rounded-lg text-sm leading-relaxed bg-amber-50 text-amber-900 border border-amber-200 mt-4">
                    By submitting, you confirm all information is accurate and authorise BOA to conduct on-site verification as necessary.
                  </div>
                </>
              )}

              {/* Navigation */}
              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                {step > 1 ? (
                  <button type="button" onClick={() => setStep(s => s - 1)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Back
                  </button>
                ) : <div />}

                <button type="submit" disabled={submitting}
                  className="bg-harvest-gold hover:bg-amber-500 disabled:opacity-60 text-emerald-950 font-bold py-3 px-8 rounded-lg shadow-lg flex items-center gap-3 transition-transform active:scale-95">
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Submitting…
                    </>
                  ) : (
                    <>
                      {step === 7 ? 'Submit Application' : 'Save & Continue'}
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Decorative image */}
          <div className="mt-12 rounded-xl overflow-hidden relative h-48">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVLsPQwVTdEpajtCoM-3rYxfr2edhMNkatUsfWvKmRzkvTg1El3SZ_tawjCjpYDmkHxGhBgIwSUcynp5kgxc-o9NcRex79NHsztiZRajOxnAZfMo_GzLmyNlDMo7M4fysZwCqtO6rONWJF0h-6Ftt-4t4L-2Z5mUNppW-7QUe1f68SCN_oxWu0X9m2adBzQxkH93l9P8sOuaRjOECE6kc3HxiAlazjvPYwtjGl0eL4io4qScbfTslxuZnaBISB8T_jOWVLHU5UHgQ"
              alt="Grain silo complex"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-emerald-900/40 mix-blend-multiply" />
            <div className="absolute inset-0 p-6 flex items-end">
              <p className="text-white font-medium text-sm drop-shadow-md">Supporting Nigerian farmers with modern logistics.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="md:hidden bg-emerald-950 p-4 border-t border-emerald-800 flex justify-center">
        <div className="text-emerald-100/40 text-[10px]">Step {step} of {STEPS.length}</div>
      </footer>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 py-2.5 border-b border-slate-100 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 text-right capitalize">{value.replace('_', ' ')}</span>
    </div>
  );
}
