import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  MessageSquare,
  Repeat,
  Bookmark,
  MoreHorizontal,
  Trash2,
  Edit,
  Share2,
  FileText,
  CornerDownRight,
  Send,
  Loader2,
  Check,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import postApi from '../../services/postApi';
import ShareModal from './ShareModal';
import Badge from '../common/Badge';

const CATEGORY_COLORS = {
  Certifications: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Placements: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Internships: 'bg-teal-50 text-teal-700 border-teal-200',
  Projects: 'bg-purple-50 text-purple-700 border-purple-200',
  Hackathons: 'bg-amber-50 text-amber-700 border-amber-200',
  Awards: 'bg-rose-50 text-rose-700 border-rose-200',
  Achievements: 'bg-orange-50 text-orange-700 border-orange-200',
  Courses: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Career updates': 'bg-blue-50 text-blue-700 border-blue-200',
  Publications: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  Qualifications: 'bg-violet-50 text-violet-700 border-violet-200',
  General: 'bg-slate-50 text-slate-700 border-slate-200',
  Other: 'bg-slate-50 text-slate-700 border-slate-200'
};

const PostCard = ({
  post,
  onPostUpdated,
  onPostDeleted,
  onTagClick,
  onSkillClick
}) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(Boolean(post?.isLiked));
  const [likesCount, setLikesCount] = useState(post?.likesCount || 0);
  const [isSaved, setIsSaved] = useState(Boolean(post?.isSaved));
  const [commentsCount, setCommentsCount] = useState(post?.commentsCount || 0);
  const [sharesCount, setSharesCount] = useState(post?.sharesCount || 0);

  // Comments state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // parentCommentId
  const [replyContent, setReplyContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Edit / Menu State
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || '');
  const [editContent, setEditContent] = useState(post.content || '');
  const [isExpanded, setIsExpanded] = useState(false);

  // Share Modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const author = post.authorId || {};
  const isAuthor = user && author._id && user._id.toString() === author._id.toString();
  const isAdmin = user && user.role === 'admin';

  // Toggle Like
  const handleToggleLike = async () => {
    // Optimistic UI
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await postApi.toggleLike(post._id);
      if (res.data) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
      }
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      console.error('Error toggling like:', err);
    }
  };

  // Toggle Save
  const handleToggleSave = async () => {
    const prevSaved = isSaved;
    setIsSaved(!prevSaved);
    try {
      const res = await postApi.toggleSave(post._id);
      if (res.data) {
        setIsSaved(res.data.isSaved);
      }
    } catch (err) {
      setIsSaved(prevSaved);
      console.error('Error saving post:', err);
    }
  };

  // Load comments
  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await postApi.getComments(post._id);
        setComments(res.data || []);
      } catch (err) {
        console.error('Error loading comments:', err);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  // Add comment
  const handleAddComment = async (e, parentCommentId = null) => {
    e.preventDefault();
    const contentToSend = parentCommentId ? replyContent : newComment;
    if (!contentToSend.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await postApi.addComment(post._id, {
        content: contentToSend.trim(),
        parentCommentId
      });

      if (res.data) {
        if (parentCommentId) {
          // Add nested reply to parent
          setComments(
            comments.map((c) => {
              if (c._id === parentCommentId) {
                return {
                  ...c,
                  replies: [...(c.replies || []), res.data]
                };
              }
              return c;
            })
          );
          setReplyingTo(null);
          setReplyContent('');
        } else {
          // Add top level comment
          setComments([...comments, res.data]);
          setNewComment('');
        }
        setCommentsCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await postApi.deleteComment(post._id, commentId);
      // Remove from top level or replies
      setComments(
        comments
          .filter((c) => c._id !== commentId)
          .map((c) => ({
            ...c,
            replies: (c.replies || []).filter((r) => r._id !== commentId)
          }))
      );
      setCommentsCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  // Save Edit Post
  const handleSaveEdit = async () => {
    try {
      const res = await postApi.updatePost(post._id, {
        title: editTitle,
        content: editContent
      });
      if (res.data) {
        if (onPostUpdated) onPostUpdated(res.data);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error updating post:', err);
    }
  };

  // Delete Post
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this professional post?')) return;
    try {
      await postApi.deletePost(post._id);
      if (onPostDeleted) onPostDeleted(post._id);
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/posts/${post._id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    setShowMenu(false);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHour / 24);

    if (diffDays > 7) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHour > 0) return `${diffHour}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return 'Just now';
  };

  const isLongContent = (post.content || '').length > 320;
  const displayContent =
    isLongContent && !isExpanded ? `${post.content.slice(0, 320)}...` : post.content;

  const categoryClass =
    CATEGORY_COLORS[post.category] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <article className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition duration-300 overflow-hidden mb-5">
      {/* Post Top Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Author avatar & info */}
          <div className="flex items-center gap-3">
            <Link to={`/profile/${author._id}`}>
              <img
                src={author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                alt={author.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-100 shadow-2xs hover:scale-105 transition"
              />
            </Link>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link to={`/profile/${author._id}`}>
                  <h4 className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition">
                    {author.name}
                  </h4>
                </Link>
                <Badge
                  variant={
                    author.role === 'admin'
                      ? 'purple'
                      : author.role === 'alumni'
                      ? 'success'
                      : 'primary'
                  }
                  size="xs"
                >
                  {author.role === 'alumni' ? 'Alumni' : 'Student'}
                </Badge>
              </div>

              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {author.role === 'alumni'
                  ? author.company
                    ? `${author.jobTitle || 'Alumni'} at ${author.company}`
                    : 'Verified Alumni'
                  : `${author.department || 'Computer Science'}`}
              </p>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-slate-400">{formatDate(post.createdAt)}</span>
                {post.isEdited && (
                  <span className="text-[10px] text-slate-400 italic">• edited</span>
                )}
                <span className="text-slate-300">•</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${categoryClass}`}
                >
                  {post.category}
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in slide-in-from-top-1 text-xs">
                {(isAuthor || isAdmin) && (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                    >
                      <Edit className="w-3.5 h-3.5 text-indigo-500" />
                      Edit Post
                    </button>
                    <button
                      onClick={() => {
                        handleDeletePost();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      Delete Post
                    </button>
                  </>
                )}
                <button
                  onClick={handleToggleSave}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                >
                  <Bookmark className="w-3.5 h-3.5 text-emerald-500" />
                  {isSaved ? 'Remove from Saved' : 'Save Post'}
                </button>
                <button
                  onClick={handleCopyLink}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium border-t border-slate-100"
                >
                  {copiedLink ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  {copiedLink ? 'Link Copied!' : 'Copy Link'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Body (or Edit Form) */}
      <div className="px-5 py-2">
        {isEditing ? (
          <div className="space-y-3 mb-4">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
            />
            <textarea
              rows={4}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Title */}
            {post.title && (
              <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                {post.title}
              </h3>
            )}

            {/* Content with whitespace preserved */}
            <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {displayContent}
            </div>

            {isLongContent && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 mt-1 block"
              >
                {isExpanded ? 'Show less' : '...see more'}
              </button>
            )}

            {/* Repost Commentary (if user reposted someone else's post) */}
            {post.shareCommentary && (
              <div className="mt-3 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 font-medium">
                "{post.shareCommentary}"
              </div>
            )}

            {/* Original Post Embed (if this is a shared post) */}
            {post.originalPostId && (
              <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <img
                    src={
                      post.originalPostId.authorId?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'
                    }
                    alt={post.originalPostId.authorId?.name}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {post.originalPostId.authorId?.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {post.originalPostId.category}
                    </p>
                  </div>
                </div>
                {post.originalPostId.title && (
                  <p className="text-xs font-bold text-slate-800">{post.originalPostId.title}</p>
                )}
                <p className="text-xs text-slate-600 line-clamp-3">
                  {post.originalPostId.content}
                </p>
              </div>
            )}

            {/* Skills Badges */}
            {post.skills && post.skills.length > 0 && (
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {post.skills.map((skill, i) => (
                  <button
                    key={i}
                    onClick={() => onSkillClick && onSkillClick(skill)}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 text-[11px] font-semibold transition"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}

            {/* Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {post.hashtags.map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => onTagClick && onTagClick(tag)}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline transition"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Media Attachments */}
      {post.media && post.media.length > 0 && (
        <div className="mt-3 border-y border-slate-100 bg-slate-900/5">
          {post.media.map((media, idx) => (
            <div key={idx}>
              {media.type === 'image' ? (
                <img
                  src={media.url}
                  alt={media.name || 'Post attachment'}
                  className="w-full max-h-[480px] object-cover"
                />
              ) : (
                <div className="p-4 flex items-center justify-between bg-slate-50 border-t border-slate-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {media.name || 'Certificate / Credential'}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">
                        {media.type}
                      </p>
                    </div>
                  </div>
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition flex items-center gap-1.5 shrink-0 shadow-2xs"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Engagement Counters */}
      <div className="px-5 py-2.5 flex items-center justify-between text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px]">
            ❤
          </span>
          <span>{likesCount} likes</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{commentsCount} comments</span>
          <span>•</span>
          <span>{sharesCount} shares</span>
        </div>
      </div>

      {/* Action Bar (Like, Comment, Share, Save) */}
      <div className="px-3 py-1.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
        <button
          onClick={handleToggleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition ${
            isLiked
              ? 'text-rose-600 font-bold bg-rose-50/70'
              : 'hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span>{isLiked ? 'Liked' : 'Like'}</span>
        </button>

        <button
          onClick={handleToggleComments}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition"
        >
          <MessageSquare className="w-4 h-4 text-slate-500" />
          <span>Comment</span>
        </button>

        <button
          onClick={() => setShowShareModal(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition"
        >
          <Repeat className="w-4 h-4 text-slate-500" />
          <span>Share</span>
        </button>

        <button
          onClick={handleToggleSave}
          className={`flex items-center justify-center px-3 py-2 rounded-xl transition ${
            isSaved
              ? 'text-emerald-600 bg-emerald-50'
              : 'hover:bg-slate-50 hover:text-slate-900'
          }`}
          title={isSaved ? 'Saved' : 'Save post'}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} />
        </button>
      </div>

      {/* Threaded Comment Drawer */}
      {showComments && (
        <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/40 space-y-4 animate-in fade-in">
          {/* New comment input */}
          <form onSubmit={(e) => handleAddComment(e)} className="flex items-start gap-2.5">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
              alt={user?.name}
              className="w-8 h-8 rounded-xl object-cover border border-slate-200 shrink-0 mt-0.5"
            />
            <div className="flex-1 flex items-center gap-1.5 bg-white border border-slate-200 rounded-2xl px-3 py-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition">
              <input
                type="text"
                placeholder="Add a thoughtful comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none py-1"
              />
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 transition"
              >
                {submittingComment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>

          {/* Comments List */}
          {loadingComments ? (
            <div className="py-4 text-center">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-indigo-600" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-2">
              Be the first to comment on this professional update!
            </p>
          ) : (
            <div className="space-y-3.5">
              {comments.map((comment) => (
                <div key={comment._id} className="space-y-2">
                  <div className="flex items-start gap-2.5 group">
                    <Link to={`/profile/${comment.userId?._id}`}>
                      <img
                        src={
                          comment.userId?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'
                        }
                        alt={comment.userId?.name}
                        className="w-8 h-8 rounded-xl object-cover shrink-0"
                      />
                    </Link>

                    <div className="flex-1 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <Link to={`/profile/${comment.userId?._id}`}>
                          <span className="text-xs font-bold text-slate-900 hover:text-indigo-600 transition">
                            {comment.userId?.name}
                          </span>
                        </Link>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500">
                        {comment.userId?.role === 'alumni'
                          ? comment.userId?.company || 'Alumni'
                          : comment.userId?.department || 'Student'}
                      </p>

                      <p className="text-xs text-slate-800 mt-1 leading-relaxed whitespace-pre-line">
                        {comment.content}
                      </p>

                      <div className="mt-2 flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                          className="hover:text-indigo-600 transition"
                        >
                          Reply
                        </button>

                        {(user?._id === comment.userId?._id || isAuthor || isAdmin) && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="hover:text-rose-600 transition opacity-0 group-hover:opacity-100"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nested Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-10 space-y-2 pl-3 border-l-2 border-indigo-100">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="flex items-start gap-2.5">
                          <Link to={`/profile/${reply.userId?._id}`}>
                            <img
                              src={
                                reply.userId?.avatar ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'
                              }
                              alt={reply.userId?.name}
                              className="w-7 h-7 rounded-xl object-cover shrink-0"
                            />
                          </Link>
                          <div className="flex-1 bg-white p-2.5 rounded-2xl border border-slate-200">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">
                                {reply.userId?.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 mt-1">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline Reply Input */}
                  {replyingTo === comment._id && (
                    <form
                      onSubmit={(e) => handleAddComment(e, comment._id)}
                      className="ml-10 flex items-center gap-2"
                    >
                      <CornerDownRight className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder={`Reply to ${comment.userId?.name}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={submittingComment || !replyContent.trim()}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-40"
                      >
                        Send
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Repost Share Modal */}
      {showShareModal && (
        <ShareModal
          post={post}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onPostShared={(newSharedPost) => {
            setSharesCount((prev) => prev + 1);
            if (onPostUpdated) onPostUpdated({ ...post, sharesCount: sharesCount + 1 });
          }}
        />
      )}
    </article>
  );
};

export default PostCard;
