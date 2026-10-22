import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Bookmark, ExternalLink, Plus, Search, Tag, FileText, Video, Code, Book } from 'lucide-react';
import { resourceApi } from '../services/resourceApi';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { formatDate } from '../utils/formatters';

const ResourcesPage = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { showToast } = useNotifications();

  // Create Resource State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'guide',
    url: '',
    category: 'Career & Resume',
    tags: 'Resume, Interview'
  });

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const res = await resourceApi.getResources({
        search: search || undefined,
        category: category && category !== 'All' ? category : undefined
      });
      if (res.success && res.data) {
        setResources(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleBookmark = async (id) => {
    try {
      const res = await resourceApi.bookmarkResource(id);
      showToast('Bookmarked!', 'Resource bookmark count increased.', 'success');
      setResources((prev) =>
        prev.map((r) => (r._id === id ? { ...r, bookmarksCount: res.bookmarksCount } : r))
      );
    } catch (err) {
      showToast('Error', err.message, 'danger');
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    setError('');
    setCreateLoading(true);

    try {
      await resourceApi.createResource({
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim())
      });
      showToast('Resource Shared! 📚', 'Your resource is now available to all students.', 'success');
      setShowCreateModal(false);
      fetchResources();
    } catch (err) {
      setError(err.message || 'Failed to share resource');
    } finally {
      setCreateLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-rose-500" />;
      case 'code': return <Code className="w-4 h-4 text-indigo-500" />;
      case 'article': return <FileText className="w-4 h-4 text-emerald-500" />;
      default: return <BookOpen className="w-4 h-4 text-amber-500" />;
    }
  };

  if (loading) return <Loader text="Loading career resources & guides..." />;

  const canShare = user?.role === 'alumni' || user?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curated Career & Technical Guides</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resource Library</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Access free LeetCode roadmaps, system design cheat sheets, and resume templates contributed by alumni.
          </p>
        </div>

        {canShare && (
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus className="w-4 h-4" />
            <span>Share Resource</span>
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides, system design, LeetCode, Docker..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
        >
          <option value="">All Categories</option>
          <option value="Career & Resume">Career & Resume</option>
          <option value="Technical Interview">Technical Interview</option>
          <option value="Coding Preparation">Coding Preparation</option>
          <option value="DevOps & Cloud">DevOps & Cloud</option>
        </select>
      </div>

      {resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((r) => (
            <div key={r._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                    {getTypeIcon(r.type)}
                    <span className="capitalize">{r.type}</span>
                  </div>
                  <button
                    onClick={() => handleBookmark(r._id)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-indigo-600 transition"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{r.bookmarksCount || 0}</span>
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-indigo-600 transition">
                  {r.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {r.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {(r.tags || []).map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-semibold">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">By {r.uploadedBy?.name || 'Alumni Mentor'}</span>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition"
                >
                  <span>Open Resource</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No resources matched" description="Try adjusting your search criteria." />
      )}

      {/* Share Resource Modal */}
      {showCreateModal && (
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Share a Career Resource">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateResource} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Resource Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Complete System Design Roadmap"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Format / Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="guide">Guide / Article</option>
                  <option value="code">Code Repository</option>
                  <option value="video">Video Masterclass</option>
                  <option value="pdf">PDF Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Career & Resume</option>
                  <option>Technical Interview</option>
                  <option>Coding Preparation</option>
                  <option>DevOps & Cloud</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Resource URL / Link</label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tags (Comma separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g. System Design, Microservices, Cloud"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What makes this resource helpful..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)} type="button">
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={createLoading}>
                Share Resource
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ResourcesPage;
