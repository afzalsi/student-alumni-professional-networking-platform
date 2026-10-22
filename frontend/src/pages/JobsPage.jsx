import React, { useState, useEffect, useCallback } from 'react';
import { Search, Briefcase, Filter, Sparkles } from 'lucide-react';
import { jobApi } from '../services/jobApi';
import JobCard from '../components/student/JobCard';
import JobApplyModal from '../components/student/JobApplyModal';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { JOB_TYPES, WORK_MODES, INDUSTRIES } from '../utils/constants';
import { useNotifications } from '../context/NotificationContext';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const { showToast } = useNotifications();

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 9,
        search: search || undefined,
        type: type || undefined,
        workMode: workMode || undefined,
        category: category && category !== 'All Industries' ? category : undefined
      };
      const res = await jobApi.getJobs(params);
      if (res.success && res.data) {
        setJobs(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, type, workMode, category]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleToggleSave = async (jobId) => {
    try {
      const res = await jobApi.toggleSaveJob(jobId);
      showToast(res.message, res.isSaved ? 'Job bookmarked to saved list' : 'Job removed from saved list', 'info');
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, isSaved: res.isSaved } : j))
      );
    } catch (err) {
      showToast('Action Failed', err.message, 'danger');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Opportunities & Internships</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Jobs & Internships Hub</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          Discover verified roles posted directly by alumni recruiters with automated skill match scoring.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role title, company, skills (e.g. Full Stack, React, Python)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700"
            >
              {JOB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <select
              value={workMode}
              onChange={(e) => { setWorkMode(e.target.value); setPage(1); }}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700"
            >
              {WORK_MODES.map((w) => (
                <option key={w.value} value={w.value}>{w.label}</option>
              ))}
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition shadow-xs"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Grid Results */}
      {loading ? (
        <Loader text="Fetching verified job opportunities..." />
      ) : jobs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onApply={(j) => setSelectedJob(j)}
                onToggleSave={handleToggleSave}
                isSaved={job.isSaved}
              />
            ))}
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </>
      ) : (
        <EmptyState
          title="No jobs found"
          description="Try broadening your search query or removing filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setType('');
            setWorkMode('');
            setCategory('');
            setPage(1);
          }}
        />
      )}

      {/* Application Modal */}
      {selectedJob && (
        <JobApplyModal
          isOpen={Boolean(selectedJob)}
          onClose={() => setSelectedJob(null)}
          job={selectedJob}
          onSuccess={fetchJobs}
        />
      )}
    </div>
  );
};

export default JobsPage;
