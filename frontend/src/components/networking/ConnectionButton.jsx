import React, { useState } from 'react';
import { UserCheck, Clock, Check, X, UserMinus, Loader2, Sparkles } from 'lucide-react';
import networkApi from '../../services/networkApi';

const ConnectionButton = ({
  targetUserId,
  initialStatus = 'none',
  initialConnectionId = null,
  onStatusChange,
  size = 'md',
  className = ''
}) => {
  const [status, setStatus] = useState(initialStatus);
  const [connectionId, setConnectionId] = useState(initialConnectionId);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await networkApi.sendConnectionRequest(targetUserId);
      setStatus('pending_sent');
      setConnectionId(res.data?._id);
      if (onStatusChange) onStatusChange('pending_sent', res.data?._id);
    } catch (err) {
      console.error('Send connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await networkApi.acceptConnectionRequest(connectionId || targetUserId);
      setStatus('connected');
      if (onStatusChange) onStatusChange('connected', connectionId);
    } catch (err) {
      console.error('Accept connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectOrCancel = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await networkApi.removeConnection(connectionId || targetUserId);
      setStatus('none');
      setConnectionId(null);
      setShowDropdown(false);
      if (onStatusChange) onStatusChange('none', null);
    } catch (err) {
      console.error('Cancel/remove connection error:', err);
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

  if (loading) {
    return (
      <button
        disabled
        className={`inline-flex items-center justify-center font-semibold rounded-xl bg-slate-100 text-slate-400 ${sizeClasses} ${className}`}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      </button>
    );
  }

  // State 1: Connected
  if (status === 'connected') {
    return (
      <div className="relative inline-block">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowDropdown(!showDropdown);
          }}
          className={`inline-flex items-center justify-center font-semibold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition shadow-2xs ${sizeClasses} ${className}`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Connected</span>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in slide-in-from-top-1">
            <button
              onClick={handleRejectOrCancel}
              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
            >
              <UserMinus className="w-3.5 h-3.5" />
              Remove Connection
            </button>
          </div>
        )}
      </div>
    );
  }

  // State 2: Pending Sent by me
  if (status === 'pending_sent') {
    return (
      <button
        onClick={handleRejectOrCancel}
        title="Click to withdraw connection request"
        className={`inline-flex items-center justify-center font-semibold rounded-xl bg-amber-50 text-amber-700 border border-amber-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 transition ${sizeClasses} ${className}`}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>Pending</span>
      </button>
    );
  }

  // State 3: Pending Received (needs response)
  if (status === 'pending_received') {
    return (
      <div className="inline-flex items-center gap-1.5">
        <button
          onClick={handleAcceptRequest}
          className={`inline-flex items-center justify-center font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs ${sizeClasses}`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>Accept</span>
        </button>
        <button
          onClick={handleRejectOrCancel}
          className={`inline-flex items-center justify-center font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 ${sizeClasses}`}
        >
          <X className="w-3.5 h-3.5" />
          <span>Ignore</span>
        </button>
      </div>
    );
  }

  // State 4: None or Rejected -> Connect
  return (
    <button
      onClick={handleSendRequest}
      className={`inline-flex items-center justify-center font-semibold rounded-xl bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-400 hover:border-indigo-600 transition shadow-2xs ${sizeClasses} ${className}`}
    >
      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
      <span>Connect</span>
    </button>
  );
};

export default ConnectionButton;
