import React from 'react';
import { GraduationCap, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span>AlumNet Portal</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering students through alumni mentorship, curated internships, interview preparation, and lifelong career networks.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/mentors" className="hover:text-indigo-400 transition">Find a Mentor</Link></li>
              <li><Link to="/jobs" className="hover:text-indigo-400 transition">Jobs & Internships</Link></li>
              <li><Link to="/events" className="hover:text-indigo-400 transition">Alumni Tech Talks</Link></li>
              <li><Link to="/resources" className="hover:text-indigo-400 transition">Resume & Code Guides</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Roles</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/register" className="hover:text-indigo-400 transition">Join as Student</Link></li>
              <li><Link to="/register" className="hover:text-indigo-400 transition">Join as Alumni Mentor</Link></li>
              <li><Link to="/login" className="hover:text-indigo-400 transition">Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Tech Ecosystem</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              Full Stack MERN: React 18, Vite, Node.js, Express, MongoDB, Socket.IO & Tailwind CSS.
            </p>
            <div className="text-xs text-slate-500">
              © {new Date().getFullYear()} University Alumni Network.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
