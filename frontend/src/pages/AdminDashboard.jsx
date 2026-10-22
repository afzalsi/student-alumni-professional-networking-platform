import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  ShieldCheck,
  TrendingUp,
  Award,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { adminApi } from '../services/adminApi';
import Loader from '../components/common/Loader';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/formatters';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useNotifications();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getDashboard();
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

  const handleApproveJob = async (jobId, status) => {
    try {
      setActionLoading(true);
      await adminApi.updateJobApproval(jobId, status);
      showToast('Job Status Updated', `Job marked as ${status}`, 'success');
      fetchDashboard();
    } catch (err) {
      showToast('Error', err.message, 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyAlumni = async (alumniId, isVerified) => {
    try {
      setActionLoading(true);
      await adminApi.verifyAlumni(alumniId, isVerified);
      showToast('Alumni Verified', 'Alumni verification status updated.', 'success');
      fetchDashboard();
    } catch (err) {
      showToast('Error', err.message, 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader text="Loading administrative analytics..." />;

  const {
    stats = {},
    applicationStatusStats = [],
    monthlyRegistrations = [],
    recentPendingJobs = [],
    recentPendingAlumni = []
  } = data || {};

  // Formatter for Recharts
  const pieData = applicationStatusStats.map((item) => ({
    name: item._id,
    value: item.count
  }));

  const barData = monthlyRegistrations.map((m) => ({
    month: `M${m._id?.month}/${m._id?.year}`,
    students: m.students,
    alumni: m.alumni,
    total: m.total
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>System Administration & Platform Analytics</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Control Center</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          University-wide metrics, alumni verification, job post moderation, and audit management.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Total Registered Users</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsers || 0}</div>
          <div className="flex gap-2 text-[11px] text-slate-400 mt-1">
            <span>🎓 {stats.totalStudents || 0} Students</span>
            <span>•</span>
            <span>💼 {stats.totalAlumni || 0} Alumni</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Verified Alumni Mentors</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats.verifiedAlumni || 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">{stats.activeMentors || 0} currently available for mentees</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Jobs & Internships</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">{(stats.totalJobs || 0) + (stats.totalInternships || 0)}</div>
          <p className="text-[11px] text-slate-400 mt-1">{stats.pendingJobs || 0} postings pending review</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Placements & Selections</span>
          <div className="text-2xl font-black text-purple-600 mt-1">{stats.successfulPlacements || 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">From {stats.totalApplications || 0} total applications</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly User Registrations Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Monthly Registrations (Students vs Alumni)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData.length > 0 ? barData : [{ month: 'Current', students: stats.totalStudents || 1, alumni: stats.totalAlumni || 1 }]}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]} name="Students" />
                <Bar dataKey="alumni" fill="#10b981" radius={[4, 4, 0, 0]} name="Alumni" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Applications Status Breakdown Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Job Applications Status Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No application telemetry data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Moderation Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Job Approvals */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Pending Job Post Approvals ({recentPendingJobs.length})
            </h3>
          </div>

          {recentPendingJobs.length > 0 ? (
            <div className="space-y-3">
              {recentPendingJobs.map((job) => (
                <div key={job._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{job.title}</h4>
                    <p className="text-[11px] text-slate-500">{job.company} • Posted by {job.postedBy?.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      onClick={() => handleApproveJob(job._id, 'ACTIVE')}
                      disabled={actionLoading}
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Approve</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleApproveJob(job._id, 'REJECTED')}
                      disabled={actionLoading}
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Reject</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No job postings currently awaiting moderation.</p>
          )}
        </div>

        {/* Pending Alumni Verification */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Unverified Alumni Accounts ({recentPendingAlumni.length})
            </h3>
          </div>

          {recentPendingAlumni.length > 0 ? (
            <div className="space-y-3">
              {recentPendingAlumni.map((alumni) => (
                <div key={alumni._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{alumni.name}</h4>
                    <p className="text-[11px] text-slate-500">{alumni.department} • Class of {alumni.graduationYear}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleVerifyAlumni(alumni._id, true)}
                    disabled={actionLoading}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verify Badge</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">All registered alumni are verified.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
