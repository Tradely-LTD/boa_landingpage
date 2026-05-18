const Footer = () => (
  <footer className="bg-emerald-950 border-t border-emerald-900 py-12 px-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl mx-auto">
      <div>
        <div className="text-lg font-black text-emerald-500 mb-6 font-headline tracking-tight">BOA AgriHub</div>
        <p className="text-emerald-100/60 max-w-sm mb-8 font-body leading-relaxed">
          BOA AgriHub is the official digital platform of Bank of Agriculture Nigeria — enabling aggregation centres to register, issue AgriHub Receipts, access financing, and connect to commodity markets.
        </p>
        <div className="flex gap-4">
          <a href="#" className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-400 hover:bg-emerald-800 transition-colors">
            <span className="material-symbols-outlined text-sm">language</span>
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-400 hover:bg-emerald-800 transition-colors">
            <span className="material-symbols-outlined text-sm">mail</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h5 className="text-white font-bold mb-4 font-headline uppercase text-xs tracking-widest">Platform</h5>
          <ul className="space-y-3 font-body text-sm">
            <li><a href="/register" className="text-emerald-100/60 hover:text-white transition-colors hover:underline underline-offset-4">Register Centre</a></li>
            <li><a href="/track" className="text-emerald-100/60 hover:text-white transition-colors hover:underline underline-offset-4">Track Application</a></li>
            <li><a href="/verify-receipt" className="text-emerald-100/60 hover:text-white transition-colors hover:underline underline-offset-4">Verify Receipt</a></li>
            <li><a href="/apply-loan" className="text-emerald-100/60 hover:text-white transition-colors hover:underline underline-offset-4">Apply for Loan</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-white font-bold mb-4 font-headline uppercase text-xs tracking-widest">Resources</h5>
          <ul className="space-y-3 font-body text-sm">
            {['Privacy Policy', 'Terms of Service', 'Contact Support', 'BOA Portal'].map(l => (
              <li key={l}><a href="#" className="text-emerald-100/60 hover:text-white transition-colors hover:underline underline-offset-4">{l}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto border-t border-emerald-900 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="text-emerald-100/40 text-xs font-body">
        © 2026 Bank of Agriculture Nigeria — BOA AgriHub. All rights reserved.
      </div>
      <div className="flex gap-6 text-xs text-emerald-100/40 font-body">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          System Status: Online
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
