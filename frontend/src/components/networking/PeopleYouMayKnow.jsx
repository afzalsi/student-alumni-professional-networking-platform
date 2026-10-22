import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Users, ArrowRight, Loader2 } from 'lucide-react';
import networkApi from '../../services/networkApi';
import ConnectionButton from './ConnectionButton';
import FollowButton from './FollowButton';
import Badge from '../common/Badge';

const PeopleYouMayKnow = ({ maxItems = 4, title = 'People You May Know', isFullPage = false }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const res = await networkApi.getSuggestions();
      setSuggestions(res.data || []);
    } catch (err) {
      console.error('Error loading suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs text-center">
        <Loader2 className="w-5 h-5 animate-spin mx-auto text-indigo-600 mb-2" />
        <p className="text-xs text-slate-400">Finding relevant connections...</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  const items = suggestions.slice(0, maxItems);

  if (isFullPage) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {suggestions.map((person) => (
          <div
            key={person._id}
            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition duration-300 flex flex-col justify-between text-center group"
          >
            <div>
              <div className="relative mx-auto w-20 h-20 mb-3">
                <Link to={`/profile/${person._id}`}>
                  <img
                    src={person.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={person.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-xs group-hover:scale-105 transition duration-300"
                  />
                </Link>
                <div className="absolute -bottom-1 -right-1">
                  <Badge
                    variant={person.role === 'alumni' ? 'success' : 'primary'}
                    size="xs"
                  >
                    {person.role === 'alumni' ? 'Alumni' : 'Student'}
                  </Badge>
                </div>
              </div>

              <Link to={`/profile/${person._id}`} className="block">
                <h4 className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition truncate">
                  {person.name}
                </h4>
              </Link>

              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {person.role === 'alumni'
                  ? person.jobTitle
                    ? `${person.jobTitle} at ${person.company || 'Tech'}`
                    : 'Industry Professional'
                  : `${person.department || 'Computer Science'}`}
              </p>

              {person.reasons && person.reasons.length > 0 && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50/70 border border-indigo-100 text-[10px] font-semibold text-indigo-700">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  <span>{person.reasons[0]}</span>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-center gap-2">
              <ConnectionButton targetUserId={person._id} size="sm" />
              <FollowButton
                targetUserId={person._id}
                initialIsFollowing={person.isFollowing}
                size="sm"
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Sidebar compact list view
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        </div>
        <Link
          to="/network"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
        >
          <span>See all</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-4">
        {items.map((person) => (
          <div key={person._id} className="flex items-start justify-between gap-3 group">
            <Link to={`/profile/${person._id}`} className="shrink-0">
              <img
                src={person.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={person.name}
                className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs group-hover:scale-105 transition"
              />
            </Link>

            <div className="flex-1 min-w-0">
              <Link to={`/profile/${person._id}`} className="block">
                <p className="text-xs font-bold text-slate-900 hover:text-indigo-600 transition truncate">
                  {person.name}
                </p>
              </Link>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {person.role === 'alumni'
                  ? person.company
                    ? `${person.jobTitle || 'Alumni'} • ${person.company}`
                    : 'Alumni'
                  : person.department || 'Student'}
              </p>
              {person.reasons && person.reasons.length > 0 && (
                <p className="text-[10px] text-indigo-600 font-medium truncate mt-0.5 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {person.reasons[0]}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <ConnectionButton targetUserId={person._id} size="sm" />
                <FollowButton
                  targetUserId={person._id}
                  initialIsFollowing={person.isFollowing}
                  size="sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PeopleYouMayKnow;
