import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  Bookmark,
  Filter,
  Users,
  Compass,
  Briefcase,
  Award,
  BookOpen,
  FolderGit2,
  Trophy,
  RefreshCw,
  Hash,
  Share2,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { postApi } from '../services/postApi';
import { networkApi } from '../services/networkApi';
import CreatePostCard from '../components/networking/CreatePostCard';
import PostCard from '../components/networking/PostCard';
import UserMiniCard from '../components/networking/UserMiniCard';
import PeopleYouMayKnow from '../components/networking/PeopleYouMayKnow';
import { POST_CATEGORIES } from '../services/postApi';

const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // all, connections, following, my-posts, saved, or category
  const [selectedTag, setSelectedTag] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [counts, setCounts] = useState({ followers: 0, following: 0, connections: 0 });

  // Load feed posts
  const fetchFeed = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      setError(null);

      const params = {
        page: pageNum,
        limit: 10
      };

      if (activeFilter === 'connections') {
        params.filter = 'connections';
      } else if (activeFilter === 'following') {
        params.filter = 'following';
      } else if (activeFilter === 'my-posts') {
        params.authorId = user?._id;
      } else if (activeFilter === 'saved') {
        // Saved posts fetched via separate API
        const res = await postApi.getSavedPosts({ page: pageNum, limit: 10 });
        if (res.success) {
          const raw = Array.isArray(res.data) ? res.data : (res.data?.posts || []);
          const fetched = raw.map((item) => (item?.postId ? { ...item.postId, isSaved: true } : item)).filter(Boolean);
          setPosts(append ? (prev) => [...prev, ...fetched] : fetched);
          setHasMore(Boolean(res.data?.pagination && res.data.pagination.page < res.data.pagination.pages));
        }
        setLoading(false);
        setRefreshing(false);
        return;
      } else if (activeFilter !== 'all') {
        params.category = activeFilter;
      }

      if (selectedTag) {
        params.hashtag = selectedTag.replace('#', '');
      }

      const res = await postApi.getFeed(params);
      if (res.success) {
        const fetched = Array.isArray(res.data) ? res.data : (res.data?.posts || []);
        setPosts(append ? (prev) => [...prev, ...fetched] : fetched);
        setHasMore(Boolean(res.data?.pagination && res.data.pagination.page < res.data.pagination.pages));
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter, selectedTag, user?._id]);

  useEffect(() => {
    setPage(1);
    fetchFeed(1, false);
  }, [fetchFeed]);

  // Load user network counts
  useEffect(() => {
    if (user?._id) {
      networkApi.getUserNetworkCounts(user._id).then((res) => {
        if (res.data) {
          setCounts({
            followers: res.data.followersCount || 0,
            following: res.data.followingCount || 0,
            connections: res.data.connectionsCount || 0
          });
        }
      }).catch((err) => console.error(err));
    }
  }, [user?._id]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDelete = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeed(1, false);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage, true);
    }
  };

  // Quick category list
  const quickCategories = [
    { key: 'all', label: 'All Updates', icon: Sparkles },
    { key: 'connections', label: 'Connections', icon: Users },
    { key: 'following', label: 'Following', icon: Compass },
    { key: 'my-posts', label: 'My Posts', icon: Award },
    { key: 'saved', label: 'Saved Posts', icon: Bookmark },
    { key: 'Projects', label: 'Projects', icon: FolderGit2 },
    { key: 'Internships', label: 'Internships', icon: Briefcase },
    { key: 'Placements', label: 'Placements', icon: Briefcase },
    { key: 'Achievements', label: 'Achievements', icon: Trophy },
    { key: 'Certifications', label: 'Certifications', icon: CheckCircle2 },
    { key: 'Hackathons', label: 'Hackathons', icon: Trophy },
    { key: 'Career updates', label: 'Career Updates', icon: TrendingUp }
  ];

  const popularHashtags = [
    'SoftwareEngineering',
    'FullStack',
    'OpenSource',
    'Internship2026',
    'AlumniGuidance',
    'SystemDesign',
    'MachineLearning',
    'WebDev'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Card & Quick Filters (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-4">
          <UserMiniCard counts={counts} />

          {/* Feed Filter Menu */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
            <div className="px-3 py-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                Feed Views
              </span>
            </div>
            <div className="space-y-0.5 mt-1">
              {quickCategories.slice(0, 5).map((item) => {
                const Icon = item.icon;
                const isActive = activeFilter === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setActiveFilter(item.key);
                      setSelectedTag('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Categories
              </div>
              <div className="space-y-0.5 mt-1">
                {quickCategories.slice(5).map((item) => {
                  const Icon = item.icon;
                  const isActive = activeFilter === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setActiveFilter(item.key);
                        setSelectedTag('');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Professional Links */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-4 shadow-xs text-xs space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Career Boost
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Explore vetted job postings or schedule a 1-on-1 mock interview with verified alumni.
            </p>
            <div className="pt-2 flex flex-col gap-1.5">
              <Link
                to="/mentors"
                className="flex items-center justify-between px-3 py-1.5 bg-white rounded-xl border border-indigo-100 font-semibold text-indigo-700 hover:bg-indigo-50 transition"
              >
                <span>Find Alumni Mentors</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/jobs"
                className="flex items-center justify-between px-3 py-1.5 bg-white rounded-xl border border-indigo-100 font-semibold text-indigo-700 hover:bg-indigo-50 transition"
              >
                <span>Hiring & Referrals</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Center Column: Feed Stream (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Post Creation Box */}
          <CreatePostCard onPostCreated={handlePostCreated} />

          {/* Active Tag Filter Indicator */}
          {selectedTag && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-2 flex items-center justify-between text-xs text-indigo-800">
              <div className="flex items-center gap-1.5 font-bold">
                <Hash className="w-3.5 h-3.5 text-indigo-600" />
                Filtering by tag: <span className="underline">#{selectedTag}</span>
              </div>
              <button
                onClick={() => setSelectedTag('')}
                className="text-indigo-600 hover:text-indigo-900 font-semibold text-xs"
              >
                Clear
              </button>
            </div>
          )}

          {/* Feed Header / Filter Pills */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 shrink-0">
              {['all', 'connections', 'following', 'saved'].map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => {
                    setActiveFilter(filterKey);
                    setSelectedTag('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                    activeFilter === filterKey
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {filterKey === 'all' ? 'All Feed' : filterKey}
                </button>
              ))}
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh Feed"
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition shrink-0 ml-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <div className="w-32 h-3.5 bg-slate-200 rounded" />
                      <div className="w-20 h-2.5 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-slate-200 rounded" />
                    <div className="w-4/5 h-3 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && posts.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No posts found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                {activeFilter === 'saved'
                  ? "You haven't saved any posts yet. Click the bookmark icon on any post to read it later."
                  : activeFilter === 'connections'
                  ? 'None of your professional connections have posted yet. Try connecting with more peers and alumni!'
                  : activeFilter === 'following'
                  ? "People you follow haven't posted yet. Follow more active alumni and students."
                  : 'Be the first in your campus network to share an achievement, project, or career milestone!'}
              </p>
              {activeFilter !== 'all' ? (
                <button
                  onClick={() => setActiveFilter('all')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                >
                  View All Feed
                </button>
              ) : (
                <Link
                  to="/network"
                  className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                >
                  Explore Network
                </Link>
              )}
            </div>
          )}

          {/* Post Stream */}
          {!loading && posts.length > 0 && (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={handlePostDelete}
                  onUpdate={handlePostUpdate}
                />
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-2">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
                  >
                    Load More Updates
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Suggestions & Trending (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-4">
          {/* People You May Know Widget */}
          <PeopleYouMayKnow limit={5} />

          {/* Trending Topics & Hashtags */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              Trending in Network
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {popularHashtags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(tag);
                    setActiveFilter('all');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                    selectedTag === tag
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Professional Network Guidelines */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-[11px] text-slate-500 space-y-2">
            <p className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Professional Networking Tips
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Keep posts professional & career-oriented.</li>
              <li>Include technologies used in your projects.</li>
              <li>Tag mentors and collaborators to grow reach.</li>
              <li>Engage constructively in comment discussions.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
