import React, { useState, useEffect, useCallback } from 'react';
import { Briefcase, Search, CheckCircle, XCircle } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/formatters';

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { showToast } = useNotifications();

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getJobs({
        page,
        limit: 10,
        status: status || undefined,
        search: search || undefined
      });
      if (res.success && res.data) {
        setJobs(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      await adminApi.updateJobApproval(jobId, newStatus);
      showToast('Status Updated', `Job marked as ${newStatus}`, 'success');
      fetchJobs();
    } catch (err) {
      showToast('Error', err.message, 'danger');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Job Moderation Center</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review alumni job postings, approve active vacancies, and remove inappropriate content.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title, company..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending Review</option>
          <option value="ACTIVE">Active & Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <Loader text="Loading job postings..." />
      ) : jobs.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Job Title & Company</th>
                  <th className="px-6 py-4">Type & Mode</th>
                  <th className="px-6 py-4">Posted By</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{job.title}</p>
                      <p className="text-[11px] text-slate-500">{job.company} • {job.location}</p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-1.5">
                        <Badge variant="primary" size="xs">{job.type}</Badge>
                        <Badge variant="default" size="xs">{job.workMode}</Badge>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {job.postedBy?.name || 'Alumni'}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(job.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={job.status === 'ACTIVE' ? 'success' : job.status === 'REJECTED' ? 'danger' : 'warning'}
                        size="xs"
                      >
                        {job.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {job.status !== 'ACTIVE' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(job._id, 'ACTIVE')}
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Approve</span>
                          </Button>
                        )}
                        {job.status !== 'REJECTED' && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleUpdateStatus(job._id, 'REJECTED')}
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Reject</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      ) : (
        <EmptyState title="No jobs found" description="No jobs match the current filter selection." />
      )}
    </div>
  );
};

export default AdminJobsPage;
