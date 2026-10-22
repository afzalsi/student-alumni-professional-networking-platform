import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 mb-2">404</h1>
      <h2 className="text-lg font-bold text-slate-700 mb-2">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        The page or resource you are looking for does not exist or has been relocated.
      </p>
      <Link to="/">
        <Button size="sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
