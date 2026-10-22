import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ text = 'Loading data...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
      <p className="text-xs text-slate-500 font-medium">{text}</p>
    </div>
  );
};

export default Loader;
