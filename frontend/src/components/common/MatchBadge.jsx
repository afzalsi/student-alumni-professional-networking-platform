import React, { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';

const MatchBadge = ({ score, reasons = [] }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!score) return null;

  let colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (score >= 80) colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300';
  else if (score >= 60) colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-help shadow-xs ${colorClasses}`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{score}% Match</span>
        {reasons.length > 0 && <Info className="w-3 h-3 text-slate-400" />}
      </div>

      {showTooltip && reasons.length > 0 && (
        <div className="absolute left-0 bottom-full mb-2 z-40 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl border border-slate-700 space-y-1.5">
          <div className="font-semibold text-indigo-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Why this is a strong match:
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            {reasons.map((reason, idx) => (
              <li key={idx} className="leading-tight">{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MatchBadge;
