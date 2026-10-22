import React, { useState } from 'react';
import { X, Repeat, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import postApi from '../../services/postApi';

const ShareModal = ({ post, isOpen, onClose, onPostShared }) => {
  const { user } = useAuth();
  const [commentary, setCommentary] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !post) return null;

  const handleShare = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await postApi.sharePost(post._id, {
        originalPostId: post._id,
        shareCommentary: commentary.trim(),
        content: commentary.trim() || `Reposted ${post.authorId?.name || 'an update'}'s post`
      });

      if (onPostShared) {
        onPostShared(res.data);
      }
      onClose();
    } catch (err) {
      console.error('Error sharing post:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Share to your network</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleShare} className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.name}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200"
            />
            <div>
              <p className="text-xs font-bold text-slate-900">{user?.name}</p>
              <p className="text-[10px] text-slate-500">Post will appear on your profile and feed</p>
            </div>
          </div>

          <textarea
            rows={3}
            placeholder="Add your thoughts or key takeaway from this post (optional)..."
            value={commentary}
            onChange={(e) => setCommentary(e.target.value)}
            className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
          />

          {/* Original Post Preview Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2.5">
              <img
                src={post.authorId?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                alt={post.authorId?.name}
                className="w-7 h-7 rounded-lg object-cover"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">{post.authorId?.name}</p>
                <p className="text-[10px] text-slate-400">{post.category}</p>
              </div>
            </div>
            {post.title && <p className="text-xs font-semibold text-slate-900 truncate">{post.title}</p>}
            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{post.content}</p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Repost</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareModal;
