import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  BookmarkCheck,
  Video,
  CheckCircle2
} from 'lucide-react';
import { studentApi } from '../services/studentApi';
import { useAuth } from '../context/AuthContext';
import MentorCard from '../components/student/MentorCard';
import JobCard from '../components/student/JobCard';
import MentorshipRequestModal from '../components/student/MentorshipRequestModal';
import JobApplyModal from '../components/student/JobApplyModal';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { formatDate } from '../utils/formatters';

const StudentDashboard = () => {
  const { user, profileCompletion } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await studentApi.getDashboard();
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

  if (loading) {
    return <Loader text="Loading your personalized dashboard..." />;
  }

  const {
    stats = {},
    activeMentorships = [],
    upcomingSessions = [],
    activeApplications = [],
    recommendedJobs = [],
    recommendedMentors = []
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Student Career Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-2 leading-relaxed">
            Discover matched alumni mentors, track your 1-on-1 coaching milestones, and explore hiring opportunities calibrated to your {user?.department} curriculum.
          </p>
        </div>

        {/* Profile completion badge */}
        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 max-w-sm border border-white/15">
          <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
            <span>Profile Match Strength</span>
            <span>{profileCompletion}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Active Mentors</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.activeMentorshipsCount || 0}</div>
          <Link to="/student/mentorships" className="text-[11px] font-semibold text-indigo-600 hover:underline mt-1 block">
            View relationships →
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
          <Link to="/student/sessions" className="text-[11px] font-semibold text-emerald-600 hover:underline mt-1 block">
            Schedule a call →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Applications</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalApplications || 0}</div>
          <Link to="/student/applications" className="text-[11px] font-semibold text-amber-600 hover:underline mt-1 block">
            Track status →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Saved Jobs</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <BookmarkCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.savedJobsCount || 0}</div>
          <Link to="/student/saved-jobs" className="text-[11px] font-semibold text-purple-600 hover:underline mt-1 block">
            View bookmarks →
          </Link>
        </div>
      </div>

      {/* Upcoming Sessions Alert Banner */}
      {upcomingSessions.length > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Next Upcoming Mentoring Session</span>
            </div>
            <Link to="/student/sessions" className="text-xs font-semibold text-emerald-700 hover:underline">
              All Sessions ({upcomingSessions.length})
            </Link>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={upcomingSessions[0].mentorId?.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'}
                alt="Mentor"
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{upcomingSessions[0].topic}</h4>
                <p className="text-xs text-slate-500">
                  With {upcomingSessions[0].mentorId?.name} • {formatDate(upcomingSessions[0].date)} at {upcomingSessions[0].startTime}
                </p>
              </div>
            </div>

            {upcomingSessions[0].meetingLink && (
              <a
                href={upcomingSessions[0].meetingLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                <Video className="w-4 h-4" />
                <span>Join Video Call</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Recommended Mentors Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Intelligent Recommended Mentors
            </h2>
            <p className="text-xs text-slate-500">Ranked by shared skills, industry alignment, and department background</p>
          </div>
          <Link to="/mentors" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
            Browse All Mentors
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendedMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedMentors.map((m, idx) => (
              <MentorCard
                key={idx}
                mentor={m}
                onRequestMentorship={(user) => setSelectedMentor(user)}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No mentor matches yet" description="Complete your skills and department to get high precision matches." />
        )}
      </section>

      {/* Recommended Jobs & Internships Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              Recommended Jobs & Internships
            </h2>
            <p className="text-xs text-slate-500">Matched to your verified skills and target career path</p>
          </div>
          <Link to="/jobs" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
            Browse All Postings
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onApply={(j) => setSelectedJob(j)}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No active jobs matched" description="Explore all available job postings in the jobs catalog." />
        )}
      </section>

      {/* Modals */}
      {selectedMentor && (
        <MentorshipRequestModal
          isOpen={Boolean(selectedMentor)}
          onClose={() => setSelectedMentor(null)}
          mentor={selectedMentor}
          onSuccess={fetchDashboard}
        />
      )}

      {selectedJob && (
        <JobApplyModal
          isOpen={Boolean(selectedJob)}
          onClose={() => setSelectedJob(null)}
          job={selectedJob}
          onSuccess={fetchDashboard}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
