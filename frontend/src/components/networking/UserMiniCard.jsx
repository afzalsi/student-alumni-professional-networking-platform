import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookmarkCheck, FileText, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import networkApi from '../../services/networkApi';
import Badge from '../common/Badge';

const UserMiniCard = ({ onFilterChange, activeFilter, counts }) => {
  const { user } = useAuth();
  const [internalStats, setInternalStats] = useState({
    followersCount: 0,
    followingCount: 0,
    connectionsCount: 0
  });

  useEffect(() => {
    if (user?._id) {
      networkApi
        .getNetworkStatus(user._id)
        .then((res) => {
          if (res.data) {
            setInternalStats({
              followersCount: res.data.followersCount || 0,
              followingCount: res.data.followingCount || 0,
              connectionsCount: res.data.connectionsCount || 0
            });
          }
        })
        .catch((err) => console.error('Error loading mini card stats:', err));
    }
  }, [user?._id]);

  const stats = {
    followersCount: counts?.followersCount ?? counts?.followers ?? internalStats.followersCount,
    followingCount: counts?.followingCount ?? counts?.following ?? internalStats.followingCount,
    connectionsCount: counts?.connectionsCount ?? counts?.connections ?? internalStats.connectionsCount
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition duration-300">
      {/* Cover Banner */}
      <div className="h-20 bg-gradient-to-r from-indigo-600 via-indigo-700 to-emerald-600 relative">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
      </div>

      {/* Profile info */}
      <div className="px-5 pb-5 pt-0 -mt-10 relative text-center">
        <Link to="/profile" className="inline-block group">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user.name}
            className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md mx-auto group-hover:scale-105 transition duration-300"
          />
        </Link>

        <Link to="/profile" className="block mt-2">
          <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition truncate">
            {user.name}
          </h3>
        </Link>

        <p className="text-xs text-slate-500 truncate mt-0.5">
          {user.role === 'alumni'
            ? user.jobTitle
              ? `${user.jobTitle} at ${user.company || 'Tech'}`
              : 'Alumni Network Member'
            : user.department
            ? `${user.department} '${user.graduationYear ? user.graduationYear.toString().slice(-2) : '26'}`
            : 'University Student'}
        </p>

        <div className="mt-2 flex justify-center">
          <Badge
            variant={
              user.role === 'admin' ? 'purple' : user.role === 'alumni' ? 'success' : 'primary'
            }
            size="xs"
          >
            {user.role?.toUpperCase() || 'MEMBER'}
          </Badge>
        </div>

        {/* Networking Counts */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
          <Link
            to="/network?tab=connections"
            className="p-1 rounded-xl hover:bg-slate-50 transition"
          >
            <span className="block text-sm font-black text-slate-900">
              {stats.connectionsCount}
            </span>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Connect
            </span>
          </Link>
          <Link
            to="/network?tab=followers"
            className="p-1 rounded-xl hover:bg-slate-50 transition"
          >
            <span className="block text-sm font-black text-slate-900">
              {stats.followersCount}
            </span>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Followers
            </span>
          </Link>
          <Link
            to="/network?tab=following"
            className="p-1 rounded-xl hover:bg-slate-50 transition"
          >
            <span className="block text-sm font-black text-slate-900">
              {stats.followingCount}
            </span>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Following
            </span>
          </Link>
        </div>

        {/* Quick Filters / Links */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-left">
          <button
            onClick={() => onFilterChange && onFilterChange('my_posts')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
              activeFilter === 'my_posts'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>My Professional Posts</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => onFilterChange && onFilterChange('saved')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
              activeFilter === 'saved'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-emerald-500" />
              <span>Saved Items & Posts</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <Link
            to="/network"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span>Grow My Network</span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserMiniCard;
