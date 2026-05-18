import { useState } from 'react';

interface TooltipProps {
  text: string;
}

export default function Tooltip({ text }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-1.5 align-middle">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700 transition-colors flex items-center justify-center"
        aria-label="More information"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>info</span>
      </button>
      {visible && (
        <span className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-64 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 leading-relaxed shadow-xl pointer-events-none">
          {text}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
        </span>
      )}
    </span>
  );
}
