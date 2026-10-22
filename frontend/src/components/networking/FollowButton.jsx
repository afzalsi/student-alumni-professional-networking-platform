import React, { useState } from 'react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import networkApi from '../../services/networkApi';

const FollowButton = ({
  targetUserId,
  initialIsFollowing = false,
  onFollowChange,
  size = 'md',
  className = ''
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggleFollow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      if (isFollowing) {
        const res = await networkApi.unfollowUser(targetUserId);
        setIsFollowing(false);
        if (onFollowChange) onFollowChange(false, res.data?.followersCount);
      } else {
        const res = await networkApi.followUser(targetUserId);
        setIsFollowing(true);
        if (onFollowChange) onFollowChange(true, res.data?.followersCount);
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-1 text-xs gap-1'
      : size === 'lg'
      ? 'px-5 py-2.5 text-sm gap-2'
      : 'px-3.5 py-1.5 text-xs gap-1.5';

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`inline-flex items-center justify-center font-semibold rounded-xl transition duration-200 shadow-2xs ${
        isFollowing
          ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-300'
          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-200'
      } ${sizeClasses} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus className="w-3.5 h-3.5" />
          <span>Follow</span>
        </>
      )}
    </button>
  );
};

export default FollowButton;
