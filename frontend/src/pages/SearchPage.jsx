import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Users,
  FileText,
  Tag,
  Briefcase,
  GraduationCap,
  Sparkles,
  Compass,
  ArrowRight
} from 'lucide-react';
import { networkApi } from '../services/networkApi';
import FollowButton from '../components/networking/FollowButton';
import ConnectionButton from '../components/networking/ConnectionButton';
import PostCard from '../components/networking/PostCard';
import Badge from '../components/common/Badge';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState(initialType);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    users: [],
    posts: [],
    skills: [],
    hashtags: []
  });

  const performSearch = useCallback(async (searchQuery, searchType) => {
    if (!searchQuery.trim()) {
      setResults({ users: [], posts: [], skills: [], hashtags: [] });
      return;
    }
    try {
      setLoading(true);
      const res = await networkApi.search(searchQuery, searchType);
      if (res.data) {
        setResults({
          users: res.data.people || res.data.users || [],
          posts: res.data.posts || [],
          skills: (res.data.skills || []).map((s) => (typeof s === 'string' ? s : s.name || s._id)).filter(Boolean),
          hashtags: (res.data.hashtags || []).map((h) => (typeof h === 'string' ? h : h.name || h._id)).filter(Boolean)
        });
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, activeTab);
    }
  }, [initialQuery, activeTab, performSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query, type: activeTab });
    performSearch(query, activeTab);
  };

  const handleTabChange = (type) => {
    setActiveTab(type);
    setSearchParams({ q: query, type });
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
    setSearchParams({ q: tag, type: 'all' });
    performSearch(tag, 'all');
  };

  const totalResults =
    results.users.length +
    results.posts.length +
    results.skills.length +
    results.hashtags.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Search Header & Input */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Professional Search & Discover
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search students, verified alumni, skills, job titles, posts, and topics across the network.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, skill (e.g. React, Python), role, company, or #hashtag..."
            className="w-full pl-12 pr-28 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 pt-2 overflow-x-auto scrollbar-none border-t border-slate-100">
          {[
            { id: 'all', label: 'All Results', icon: Sparkles },
            { id: 'people', label: `People (${results.users.length})`, icon: Users },
            { id: 'posts', label: `Posts (${results.posts.length})`, icon: FileText },
            { id: 'skills', label: `Skills (${results.skills.length})`, icon: Tag }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-16 text-center text-xs text-slate-400 animate-pulse">
          Searching the professional network...
        </div>
      )}

      {/* No results */}
      {!loading && query && totalResults === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No matching results for "{query}"
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try checking spelling, using more general keywords like "React", "Python", or exploring by department.
          </p>
        </div>
      )}

      {/* Results Content */}
      {!loading && (
        <div className="space-y-6">
          {/* People Section */}
          {(activeTab === 'all' || activeTab === 'people') && results.users.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>People</span>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-bold">
                    {results.users.length}
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.users.map((person) => (
                  <div
                    key={person._id}
                    className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <Link to={`/users/${person._id}`}>
                        <img
                          src={
                            person.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                          }
                          alt={person.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/users/${person._id}`}
                          className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition truncate block"
                        >
                          {person.name}
                        </Link>
                        <p className="text-xs text-slate-500 truncate">
                          {person.department || (person.role === 'alumni' ? 'Alumni' : 'Student')}
                          {person.location ? ` • ${person.location}` : ''}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant={person.role === 'alumni' ? 'success' : 'primary'}
                            size="xs"
                          >
                            {person.role?.toUpperCase()}
                          </Badge>
                          {person.graduationYear && (
                            <span className="text-[10px] text-slate-400">
                              Class of {person.graduationYear}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Skills pills */}
                    {person.skills && person.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {person.skills.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-slate-600 font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {person.skills.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{person.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-end gap-2">
                      <FollowButton targetUserId={person._id} />
                      <ConnectionButton targetUserId={person._id} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {(activeTab === 'all' || activeTab === 'skills') && results.skills.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>Matching Skills</span>
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {results.skills.map((skill, i) => (
                  <button
                    key={i}
                    onClick={() => handleTagClick(skill)}
                    className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <span>{skill}</span>
                    <ArrowRight className="w-3 h-3 text-emerald-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Posts Section */}
          {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Posts & Articles</span>
                  <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-bold">
                    {results.posts.length}
                  </span>
                </h2>
              </div>

              {results.posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
