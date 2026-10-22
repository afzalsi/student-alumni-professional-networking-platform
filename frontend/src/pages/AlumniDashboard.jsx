import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Video
} from 'lucide-react';
import { alumniApi } from '../services/alumniApi';
import { mentorshipApi } from '../services/mentorshipApi';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import JobPostModal from '../components/alumni/JobPostModal';
import { formatDate } from '../utils/formatters';

const AlumniDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showJobModal, setShowJobModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const { showToast } = useNotifications();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await alumniApi.getDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRequestStatus = async (requestId, status) => {
    try {
      setProcessingId(requestId);
      await mentorshipApi.updateRequestStatus(requestId, { status });
      showToast(
        status === 'ACCEPTED' ? 'Mentorship Activated! 🎉' : 'Request Declined',
        status === 'ACCEPTED'
          ? 'You can now chat and schedule mentoring sessions with this mentee.'
          : 'Request was updated.',
        status === 'ACCEPTED' ? 'success' : 'info'
      );
      fetchDashboard();
    } catch (err) {
      showToast('Action Error', err.message, 'danger');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <Loader text="Loading your alumni mentor dashboard..." />;

  const {
    stats = {},
    pendingRequests = [],
    activeMentorships = [],
    upcomingSessions = [],
    postedJobs = []
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-400/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Alumni Mentor & Recruiter Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Manage your mentees, review pending student mentorship requests, schedule 1-on-1 calls, and hire top student talent for your company.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/alumni/requests">
            <Button size="sm" variant="primary">
              Review Requests ({stats.pendingRequestsCount || 0})
            </Button>
          </Link>
          <Button size="sm" variant="secondary" onClick={() => setShowJobModal(true)}>
            <Plus className="w-4 h-4" />
            <span>Post a Job / Internship</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Pending Requests</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.pendingRequestsCount || 0}</div>
          <Link to="/alumni/requests" className="text-[11px] font-semibold text-amber-600 hover:underline mt-1 block">
            Review requests →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Active Mentees</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.activeMenteesCount || 0}</div>
          <Link to="/alumni/mentees" className="text-[11px] font-semibold text-indigo-600 hover:underline mt-1 block">
            Manage mentees →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Upcoming Sessions</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.upcomingSessionsCount || 0}</div>
          <Link to="/alumni/sessions" className="text-[11px] font-semibold text-emerald-600 hover:underline mt-1 block">
            View calendar →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Total Applicants</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalApplicantsCount || 0}</div>
          <Link to="/alumni/jobs" className="text-[11px] font-semibold text-purple-600 hover:underline mt-1 block">
            Review candidates →
          </Link>
        </div>
      </div>

      {/* Inbound Mentorship Requests */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              Inbound Mentorship Requests ({pendingRequests.length})
            </h2>
            <p className="text-xs text-slate-500">Students seeking your guidance in software engineering, interview prep, and career growth.</p>
          </div>
          <Link to="/alumni/requests" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
            View All Requests
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => {
              const student = req.studentId || {};
              return (
                <div key={req._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={student.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-indigo-100"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{student.name}</h4>
                        <p className="text-xs text-slate-500">
                          {student.department} • Class of {student.graduationYear}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                      <p className="text-[11px] font-bold text-indigo-600 mb-0.5">Topic: {req.topic}</p>
                      <p className="text-xs text-slate-700 italic leading-relaxed">"{req.message}"</p>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">Goal:</span> {req.goal}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <Button
                      size="sm"
                      onClick={() => handleRequestStatus(req._id, 'ACCEPTED')}
                      isLoading={processingId === req._id}
                      className="flex-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequestStatus(req._id, 'REJECTED')}
                      isLoading={processingId === req._id}
                      className="flex-1"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Decline</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No pending mentorship requests"
            description="When students request your guidance, they will appear here."
          />
        )}
      </section>

      {/* Active Mentees Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Active Mentees ({activeMentorships.length})
            </h2>
            <p className="text-xs text-slate-500">Mentees you are currently guiding.</p>
          </div>
          <Link to="/alumni/mentees" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
            Manage All Mentees
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeMentorships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeMentorships.map((m) => {
              const student = m.studentId || {};
              return (
                <div key={m._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={student.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-emerald-100"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{student.name}</h4>
                      <p className="text-xs text-slate-500">{student.department}</p>
                      <div className="mt-1 text-[11px] font-semibold text-indigo-600">
                        Progress: {m.progressPercentage || 0}%
                      </div>
                    </div>
                  </div>

                  <Link to="/messages">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No active mentees yet"
            description="Accept pending requests from students above to start mentoring relationships."
          />
        )}
      </section>

      {/* Job Post Modal */}
      {showJobModal && (
        <JobPostModal
          isOpen={showJobModal}
          onClose={() => setShowJobModal(false)}
          onSuccess={fetchDashboard}
        />
      )}
    </div>
  );
};

export default AlumniDashboard;
