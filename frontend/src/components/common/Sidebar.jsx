import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Compass,
  Briefcase,
  BookmarkCheck,
  Calendar,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Settings,
  HelpCircle,
  Clock,
  FileCheck,
  Award,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, profileCompletion } = useAuth();

  if (!user) return null;

  const studentLinks = [
    { to: '/feed', icon: Sparkles, label: 'Professional Feed' },
    { to: '/network', icon: Users, label: 'My Network' },
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/mentors', icon: Compass, label: 'Find Mentors' },
    { to: '/student/mentorships', icon: Users, label: 'My Mentors & Goals' },
    { to: '/student/sessions', icon: Clock, label: 'Mentoring Sessions' },
    { to: '/jobs', icon: Briefcase, label: 'Jobs & Internships' },
    { to: '/student/applications', icon: FileCheck, label: 'Application Tracker' },
    { to: '/student/saved-jobs', icon: BookmarkCheck, label: 'Saved Jobs' },
    { to: '/events', icon: Calendar, label: 'Events' },
    { to: '/resources', icon: BookOpen, label: 'Resource Library' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' }
  ];

  const alumniLinks = [
    { to: '/feed', icon: Sparkles, label: 'Professional Feed' },
    { to: '/network', icon: Users, label: 'My Network' },
    { to: '/alumni/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/alumni/requests', icon: Users, label: 'Mentorship Requests' },
    { to: '/alumni/mentees', icon: Award, label: 'My Mentees' },
    { to: '/alumni/sessions', icon: Clock, label: 'Mentoring Sessions' },
    { to: '/alumni/jobs', icon: Briefcase, label: 'Manage Job Posts' },
    { to: '/events', icon: Calendar, label: 'Events' },
    { to: '/resources', icon: BookOpen, label: 'Resources' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' }
  ];

  const adminLinks = [
    { to: '/feed', icon: Sparkles, label: 'Professional Feed' },
    { to: '/network', icon: Users, label: 'My Network' },
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Analytics & Metrics' },
    { to: '/admin/users', icon: Users, label: 'User Directory' },
    { to: '/admin/jobs', icon: Briefcase, label: 'Job Moderation' },
    { to: '/admin/reports', icon: ShieldCheck, label: 'Reports & Disputes' },
    { to: '/admin/audit-logs', icon: FileCheck, label: 'Audit Logs' },
    { to: '/events', icon: Calendar, label: 'Manage Events' },
    { to: '/resources', icon: BookOpen, label: 'Manage Resources' }
  ];

  const links =
    user.role === 'admin'
      ? adminLinks
      : user.role === 'alumni'
      ? alumniLinks
      : studentLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 hidden md:flex">
      <div className="space-y-6">
        {/* Profile Completion Bar (Student / Alumni) */}
        {user.role !== 'admin' && (
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
              <span>Profile Completion</span>
              <span className="text-indigo-600">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            {profileCompletion < 100 && (
              <NavLink
                to="/profile"
                className="mt-2 block text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition"
              >
                + Complete profile for better matches
              </NavLink>
            )}
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.includes('dashboard')}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Support Link */}
      <div className="pt-4 border-t border-slate-100">
        <NavLink
          to="/profile"
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-indigo-600 transition"
        >
          <Settings className="w-4 h-4" />
          <span>Account Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
