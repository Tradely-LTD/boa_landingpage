import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import Navbar from '../../components/Navbar';

type VerifyStatus = 'loading' | 'success' | 'pending' | 'failed';

interface Order {
  refId: string; commodity: string; quantityKg: number;
  totalAmount: number; centreName: string; status: string;
}

export default function PaymentVerifyPage() {
  const [searchParams] = useSearchParams();
  const ref            = searchParams.get('ref') ?? '';

  const [status,  setStatus]  = useState<VerifyStatus>('loading');
  const [order,   setOrder]   = useState<Order | null>(null);
  const [attempt, setAttempt] = useState(0);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref) { setStatus('failed'); return; }

    let cancelled = false;
    const check = async () => {
      try {
        const res  = await fetch(`/api/marketplace/payments/verify/${ref}`);
        const json = await res.json();
        if (cancelled) return;

        if (!json.success) { setStatus('failed'); return; }

        if (json.data.status === 'success') {
          setOrder(json.data.order);
          setStatus('success');
        } else if (attempt < 4) {
          // Webhook may not have fired yet — retry up to 4 times, 2s apart
          setTimeout(() => setAttempt(a => a + 1), 2000);
        } else {
          setStatus('pending');
        }
      } catch {
        if (!cancelled) setStatus('failed');
      }
    };
    check();
    return () => { cancelled = true; };
  }, [ref, attempt]);

  useEffect(() => {
    if (status === 'success' && iconRef.current) {
      gsap.fromTo(iconRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
      );
    }
  }, [status]);

  const f = (n: number) => `₦${n.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-sage-white">
      <Navbar />
      <div className="max-w-md mx-auto px-4 pt-32 pb-16 flex flex-col items-center">

        {/* Loading */}
        {status === 'loading' && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full border-4 border-boa-green border-t-transparent animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying your payment…</h2>
            <p className="text-gray-500 text-sm">This usually takes a few seconds. Please don't close this page.</p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="text-center w-full">
            <div ref={iconRef} className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-5xl text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="text-2xl font-headline font-bold text-gray-900 mb-1">Payment Successful!</h2>
            <p className="text-gray-500 text-sm mb-6">Your order has been confirmed and the FAC has been notified.</p>

            {order && (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 text-left mb-6 space-y-3">
                <h3 className="font-semibold text-gray-700 text-sm">Order Summary</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-mono font-bold text-gray-800">{order.refId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Commodity</span>
                  <span className="font-semibold text-gray-800">{order.commodity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Quantity</span>
                  <span className="font-semibold text-gray-800">{order.quantityKg.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Centre</span>
                  <span className="font-semibold text-gray-800">{order.centreName}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total Paid</span>
                  <span className="font-headline font-extrabold text-xl text-boa-green">{f(order.totalAmount)}</span>
                </div>
              </div>
            )}

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 text-sm text-emerald-700 text-left">
              <p className="font-semibold mb-1">What happens next?</p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-emerald-600">
                <li>A confirmation email has been sent to your inbox</li>
                <li>The FAC is preparing your order</li>
                <li>You'll receive another email when your order is ready</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <Link to="/marketplace" className="flex-1 py-3 text-center border border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Browse More
              </Link>
              <Link to="/marketplace/account" className="flex-1 py-3 text-center bg-boa-green text-white rounded-2xl text-sm font-semibold hover:bg-emerald-800 transition">
                My Orders
              </Link>
            </div>
          </div>
        )}

        {/* Pending — payment made but webhook delayed */}
        {status === 'pending' && (
          <div className="text-center w-full">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-5xl text-amber-500">hourglass_top</span>
            </div>
            <h2 className="text-2xl font-headline font-bold text-gray-900 mb-1">Payment Pending</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your payment is being processed. This can take a minute. If money left your account, your order will be confirmed automatically.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-700 text-left">
              <p className="font-semibold mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">info</span>
                Reference: <span className="font-mono ml-1">{ref}</span>
              </p>
              <p className="text-xs text-amber-600">Keep this reference. Once confirmed, you'll receive a confirmation email.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStatus('loading'); setAttempt(0); }} className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Check Again
              </button>
              <Link to="/marketplace" className="flex-1 py-3 text-center bg-boa-green text-white rounded-2xl text-sm font-semibold hover:bg-emerald-800 transition">
                Go to Marketplace
              </Link>
            </div>
          </div>
        )}

        {/* Failed */}
        {status === 'failed' && (
          <div className="text-center w-full">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-5xl text-red-500">cancel</span>
            </div>
            <h2 className="text-2xl font-headline font-bold text-gray-900 mb-1">Payment Not Confirmed</h2>
            <p className="text-gray-500 text-sm mb-6">
              We couldn't verify your payment. If you were charged, please contact support with your reference.
            </p>
            {ref && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-xs text-red-600">Reference: <span className="font-mono font-bold">{ref}</span></p>
              </div>
            )}
            <Link to="/marketplace" className="w-full block py-3 text-center bg-boa-green text-white rounded-2xl text-sm font-semibold hover:bg-emerald-800 transition">
              Back to Marketplace
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
