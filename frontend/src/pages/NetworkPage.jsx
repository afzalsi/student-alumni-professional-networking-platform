import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserPlus,
  Compass,
  Search,
  MessageSquare,
  Trash2,
  Clock,
  Sparkles,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { networkApi } from '../services/networkApi';
import FollowButton from '../components/networking/FollowButton';
import ConnectionButton from '../components/networking/ConnectionButton';
import PeopleYouMayKnow from '../components/networking/PeopleYouMayKnow';
import Badge from '../components/common/Badge';
import { useNotifications } from '../context/NotificationContext';

const NetworkPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState('suggestions'); // 'requests', 'suggestions', 'connections', 'following', 'followers'
  const [counts, setCounts] = useState({ followers: 0, following: 0, connections: 0 });
  const [loading, setLoading] = useState(false);

  // Lists
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);

  // Search filter inside tabs
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch network stats and counts
  const loadCounts = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await networkApi.getUserNetworkCounts(user._id);
      if (res.data) {
        setCounts({
          connections: res.data.connectionsCount || 0,
          following: res.data.followingCount || 0,
          followers: res.data.followersCount || 0
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [user?._id]);

  // Load Requests
  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const [receivedRes, sentRes] = await Promise.all([
        networkApi.getReceivedRequests(),
        networkApi.getSentRequests()
      ]);
      const rec = Array.isArray(receivedRes.data) ? receivedRes.data : [];
      const snt = Array.isArray(sentRes.data) ? sentRes.data : [];
      setReceivedRequests(rec);
      setSentRequests(snt);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load Connections
  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      const res = await networkApi.getConnections();
      const list = res.data?.connections || res.data || [];
      setConnections(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load Following
  const loadFollowing = useCallback(async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const res = await networkApi.getFollowing(user._id);
      const list = res.data?.users || res.data || [];
      setFollowingList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  // Load Followers
  const loadFollowers = useCallback(async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const res = await networkApi.getFollowers(user._id);
      const list = res.data?.users || res.data || [];
      setFollowersList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    if (activeTab === 'requests') loadRequests();
    else if (activeTab === 'connections') loadConnections();
    else if (activeTab === 'following') loadFollowing();
    else if (activeTab === 'followers') loadFollowers();
  }, [activeTab, loadRequests, loadConnections, loadFollowing, loadFollowers]);

  // Actions for requests
  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await networkApi.acceptConnection(requestId);
      if (res.success) {
        showToast('Connected!', 'Connection request accepted.', 'success');
        setReceivedRequests((prev) => prev.filter((r) => r._id !== requestId));
        loadCounts();
      }
    } catch (err) {
      showToast('Error', err.message, 'danger');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const res = await networkApi.rejectConnection(requestId);
      if (res.success) {
        showToast('Ignored', 'Connection request ignored.', 'info');
        setReceivedRequests((prev) => prev.filter((r) => r._id !== requestId));
      }
    } catch (err) {
      showToast('Error', err.message, 'danger');
    }
  };

  const handleCancelRequest = async (connectionId) => {
    try {
      const res = await networkApi.removeConnection(connectionId);
      if (res.success) {
        showToast('Withdrawn', 'Connection request cancelled.', 'info');
        setSentRequests((prev) => prev.filter((r) => r._id !== connectionId));
      }
    } catch (err) {
      showToast('Error', err.message, 'danger');
    }
  };

  const handleRemoveConnection = async (connectionId, name) => {
    if (!window.confirm(`Are you sure you want to remove your connection with ${name}?`)) return;
    try {
      const res = await networkApi.removeConnection(connectionId);
      if (res.success) {
        showToast('Removed', 'Connection removed.', 'info');
        setConnections((prev) => prev.filter((c) => c._id !== connectionId));
        loadCounts();
      }
    } catch (err) {
      showToast('Error', err.message, 'danger');
    }
  };

  // Filter connections by search query
  const filteredConnections = connections.filter((conn) => {
    const peer = conn.user;
    if (!peer) return false;
    const q = searchQuery.toLowerCase();
    return (
      peer.name?.toLowerCase().includes(q) ||
      peer.department?.toLowerCase().includes(q) ||
      peer.location?.toLowerCase().includes(q)
    );
  });

  const filteredFollowing = followingList.filter((item) => {
    const peer = item.followingId;
    if (!peer) return false;
    const q = searchQuery.toLowerCase();
    return (
      peer.name?.toLowerCase().includes(q) ||
      peer.department?.toLowerCase().includes(q) ||
      peer.role?.toLowerCase().includes(q)
    );
  });

  const filteredFollowers = followersList.filter((item) => {
    const peer = item.followerId;
    if (!peer) return false;
    const q = searchQuery.toLowerCase();
    return (
      peer.name?.toLowerCase().includes(q) ||
      peer.department?.toLowerCase().includes(q) ||
      peer.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5" />
              Professional Network
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Manage Your Network & Relationships
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Grow your career opportunities by connecting with students, alumni leaders, and industry professionals.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('connections')}
              className={`p-3.5 rounded-2xl border text-center transition ${
                activeTab === 'connections'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <div className="text-xl font-black">{counts.connections}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Connections
              </div>
            </button>

            <button
              onClick={() => setActiveTab('following')}
              className={`p-3.5 rounded-2xl border text-center transition ${
                activeTab === 'following'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <div className="text-xl font-black">{counts.following}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Following
              </div>
            </button>

            <button
              onClick={() => setActiveTab('followers')}
              className={`p-3.5 rounded-2xl border text-center transition ${
                activeTab === 'followers'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <div className="text-xl font-black">{counts.followers}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Followers
              </div>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-100 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'suggestions'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>People You May Know</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap relative ${
              activeTab === 'requests'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Invitations</span>
            {receivedRequests.length > 0 && (
              <span className="w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {receivedRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('connections')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'connections'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>My Connections ({counts.connections})</span>
          </button>

          <button
            onClick={() => setActiveTab('following')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'following'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Following ({counts.following})</span>
          </button>

          <button
            onClick={() => setActiveTab('followers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'followers'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Followers ({counts.followers})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: People You May Know */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Recommended Students & Alumni For You
            </h2>
          </div>
          <PeopleYouMayKnow limit={16} />
        </div>
      )}

      {/* Tab 2: Invitations & Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Received Requests */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Received Invitations</span>
                <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-black">
                  {receivedRequests.length}
                </span>
              </h3>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading invitations...</div>
            ) : receivedRequests.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No pending connection invitations.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {receivedRequests.map((req) => {
                  const sender = req.senderId;
                  if (!sender) return null;
                  return (
                    <div
                      key={req._id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <Link to={`/users/${sender._id}`}>
                          <img
                            src={
                              sender.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                            }
                            alt={sender.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs"
                          />
                        </Link>
                        <div>
                          <Link
                            to={`/users/${sender._id}`}
                            className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition"
                          >
                            {sender.name}
                          </Link>
                          <p className="text-xs text-slate-500">
                            {sender.role === 'alumni'
                              ? `Alumni • ${sender.department || 'Graduate'}`
                              : `Student • ${sender.department || 'Campus'}`}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={sender.role === 'alumni' ? 'success' : 'primary'}
                              size="xs"
                            >
                              {sender.role?.toUpperCase()}
                            </Badge>
                            <span className="text-[11px] text-slate-400">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleRejectRequest(req._id)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                        >
                          Ignore
                        </button>
                        <button
                          onClick={() => handleAcceptRequest(req._id)}
                          className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs transition"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sent Requests */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Sent Invitations (Pending)</span>
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-black">
                  {sentRequests.length}
                </span>
              </h3>
            </div>

            {sentRequests.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No outgoing pending requests.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sentRequests.map((req) => {
                  const receiver = req.receiverId;
                  if (!receiver) return null;
                  return (
                    <div
                      key={req._id}
                      className="py-3.5 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <Link to={`/users/${receiver._id}`}>
                          <img
                            src={
                              receiver.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                            }
                            alt={receiver.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                          />
                        </Link>
                        <div>
                          <Link
                            to={`/users/${receiver._id}`}
                            className="text-xs font-bold text-slate-900 hover:text-indigo-600"
                          >
                            {receiver.name}
                          </Link>
                          <p className="text-[11px] text-slate-500">
                            Sent {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCancelRequest(req._id)}
                        className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        Withdraw
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: My Connections */}
      {activeTab === 'connections' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {connections.length} Professional Connections
              </h3>
              <p className="text-xs text-slate-500">
                Mutual two-way connections on AlumNet.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search connections..."
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading connections...</div>
          ) : filteredConnections.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              {searchQuery ? 'No connections matching your search.' : 'You have no connections yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredConnections.map((conn) => {
                const peer = conn.user;
                if (!peer) return null;
                return (
                  <div
                    key={conn._id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition flex items-center justify-between gap-3 bg-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Link to={`/users/${peer._id}`}>
                        <img
                          src={
                            peer.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                          }
                          alt={peer.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                        />
                      </Link>
                      <div className="min-w-0">
                        <Link
                          to={`/users/${peer._id}`}
                          className="text-xs font-bold text-slate-900 hover:text-indigo-600 truncate block"
                        >
                          {peer.name}
                        </Link>
                        <p className="text-[11px] text-slate-500 truncate">
                          {peer.department || (peer.role === 'alumni' ? 'Alumni' : 'Student')}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          Connected {new Date(conn.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link
                        to="/messages"
                        title="Send Message"
                        className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleRemoveConnection(conn._id, peer.name)}
                        title="Remove Connection"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Following */}
      {activeTab === 'following' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                You Are Following {followingList.length} People
              </h3>
              <p className="text-xs text-slate-500">
                Updates from these people appear in your feed.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search following..."
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading following...</div>
          ) : filteredFollowing.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              {searchQuery ? 'No people matching your search.' : "You aren't following anyone yet."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFollowing.map((item) => {
                const target = item.followingId;
                if (!target) return null;
                return (
                  <div
                    key={item._id}
                    className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 bg-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Link to={`/users/${target._id}`}>
                        <img
                          src={
                            target.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                          }
                          alt={target.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                        />
                      </Link>
                      <div className="min-w-0">
                        <Link
                          to={`/users/${target._id}`}
                          className="text-xs font-bold text-slate-900 hover:text-indigo-600 truncate block"
                        >
                          {target.name}
                        </Link>
                        <p className="text-[11px] text-slate-500 truncate">
                          {target.department || target.role}
                        </p>
                        <Badge
                          variant={target.role === 'alumni' ? 'success' : 'primary'}
                          size="xs"
                        >
                          {target.role?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <FollowButton
                        targetUserId={target._id}
                        initialIsFollowing={true}
                        onToggle={(nowFollowing) => {
                          if (!nowFollowing) {
                            setFollowingList((prev) => prev.filter((i) => i._id !== item._id));
                            loadCounts();
                          }
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Followers */}
      {activeTab === 'followers' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {followersList.length} Followers
              </h3>
              <p className="text-xs text-slate-500">
                People who follow your professional updates and achievements.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search followers..."
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading followers...</div>
          ) : filteredFollowers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              {searchQuery ? 'No followers matching your search.' : 'You have no followers yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFollowers.map((item) => {
                const follower = item.followerId;
                if (!follower) return null;
                return (
                  <div
                    key={item._id}
                    className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 bg-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Link to={`/users/${follower._id}`}>
                        <img
                          src={
                            follower.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                          }
                          alt={follower.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                        />
                      </Link>
                      <div className="min-w-0">
                        <Link
                          to={`/users/${follower._id}`}
                          className="text-xs font-bold text-slate-900 hover:text-indigo-600 truncate block"
                        >
                          {follower.name}
                        </Link>
                        <p className="text-[11px] text-slate-500 truncate">
                          {follower.department || follower.role}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          Followed {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <FollowButton targetUserId={follower._id} />
                      <ConnectionButton targetUserId={follower._id} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkPage;
