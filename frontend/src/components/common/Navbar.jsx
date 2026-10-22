import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Bell,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Compass,
  Briefcase,
  Calendar,
  BookOpen,
  Users,
  Search,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Badge from './Badge';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'alumni') return '/alumni/dashboard';
    return '/student/dashboard';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-3">
          {/* Left: Brand Logo & Search Bar */}
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <Link to={isAuthenticated ? '/feed' : '/'} className="flex items-center gap-2.5 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1">
                  Alum<span className="text-indigo-600">Net</span>
                </span>
                <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 -mt-1">
                  Professional Network
                </span>
              </div>
            </Link>

            {/* Global Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search people, posts, skills..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 focus:bg-white border border-transparent focus:border-indigo-400 rounded-xl text-xs transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </form>
          </div>

          {/* Center / Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/feed"
                  className={`flex flex-col items-center px-3 py-1 rounded-xl text-xs font-semibold transition ${
                    isActive('/feed')
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-5 h-5 mb-0.5" />
                  <span>Feed</span>
                </Link>

                <Link
                  to="/network"
                  className={`flex flex-col items-center px-3 py-1 rounded-xl text-xs font-semibold transition ${
                    isActive('/network')
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-5 h-5 mb-0.5" />
                  <span>My Network</span>
                </Link>

                <Link
                  to="/mentors"
                  className={`flex flex-col items-center px-3 py-1 rounded-xl text-xs font-semibold transition ${
                    isActive('/mentors')
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <Compass className="w-5 h-5 mb-0.5" />
                  <span>Mentors</span>
                </Link>

                <Link
                  to="/jobs"
                  className={`flex flex-col items-center px-3 py-1 rounded-xl text-xs font-semibold transition ${
                    isActive('/jobs')
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-5 h-5 mb-0.5" />
                  <span>Jobs</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/mentors"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition"
                >
                  <Compass className="w-4 h-4" />
                  Find Mentors
                </Link>
                <Link
                  to="/jobs"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition"
                >
                  <Briefcase className="w-4 h-4" />
                  Jobs & Internships
                </Link>
                <Link
                  to="/events"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition"
                >
                  <Calendar className="w-4 h-4" />
                  Events
                </Link>
                <Link
                  to="/resources"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition"
                >
                  <BookOpen className="w-4 h-4" />
                  Resources
                </Link>
              </>
            )}
          </div>

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                {/* Search icon for mobile */}
                <Link
                  to="/search"
                  title="Search"
                  className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 md:hidden transition"
                >
                  <Search className="w-5 h-5" />
                </Link>

                {/* Messages Link */}
                <Link
                  to="/messages"
                  title="Messages"
                  className={`p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 relative transition ${
                    isActive('/messages') ? 'text-indigo-600 bg-indigo-50' : ''
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* Notifications Link */}
                <Link
                  to="/notifications"
                  title="Notifications"
                  className={`p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 relative transition ${
                    isActive('/notifications') ? 'text-indigo-600 bg-indigo-50' : ''
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition"
                  >
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover border border-indigo-200"
                    />
                    <span className="hidden sm:block text-xs font-semibold text-slate-800 text-left">
                      {user?.name?.split(' ')[0]}
                      <span className="block text-[10px] font-normal text-slate-500 capitalize">
                        {user?.role}
                      </span>
                    </span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <div className="mt-1">
                          <Badge
                            variant={
                              user?.role === 'admin'
                                ? 'purple'
                                : user?.role === 'alumni'
                                ? 'success'
                                : 'primary'
                            }
                            size="xs"
                          >
                            {user?.role?.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <Link
                        to={getDashboardPath()}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Go to Dashboard
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                      >
                        <User className="w-4 h-4" />
                        My Profile & Settings
                      </Link>

                      <Link
                        to={`/users/${user?._id}`}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                      >
                        <Sparkles className="w-4 h-4" />
                        Public Profile View
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition border-t border-slate-100 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-200 transition"
                >
                  Join Portal
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
          {/* Mobile search bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people, posts, skills..."
              className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-xl text-xs"
            />
          </form>

          {isAuthenticated && (
            <>
              <Link
                to="/feed"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
              >
                Feed
              </Link>
              <Link
                to="/network"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
              >
                My Network
              </Link>
            </>
          )}

          <Link
            to="/mentors"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
          >
            Find Mentors
          </Link>
          <Link
            to="/jobs"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
          >
            Jobs & Internships
          </Link>
          <Link
            to="/events"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
          >
            Events
          </Link>
          <Link
            to="/resources"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
          >
            Resources
          </Link>
          {isAuthenticated && (
            <Link
              to={getDashboardPath()}
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-indigo-600 bg-indigo-50"
            >
              Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
