import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Users, Trash2, Calendar, MapPin, DollarSign } from 'lucide-react';
import { jobApi } from '../services/jobApi';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import JobPostModal from '../components/alumni/JobPostModal';
import JobApplicantsModal from '../components/alumni/JobApplicantsModal';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/formatters';

const AlumniJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedJobIdForApplicants, setSelectedJobIdForApplicants] = useState(null);
  const { showToast } = useNotifications();

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const res = await jobApi.getJobs({ myJobs: 'true', limit: 50 });
      if (res.success && res.data) {
        setJobs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await jobApi.deleteJob(jobId);
      showToast('Job Removed', 'Job posting was successfully deleted.', 'info');
      fetchMyJobs();
    } catch (err) {
      showToast('Delete Error', err.message, 'danger');
    }
  };

  if (loading) return <Loader text="Loading your posted jobs..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Job Postings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Post hiring opportunities for students, track applications, and invite candidates to interview.
          </p>
        </div>
        <Button onClick={() => setShowPostModal(true)} size="sm">
          <Plus className="w-4 h-4" />
          <span>Post New Opportunity</span>
        </Button>
      </div>

      {jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">{job.company}</span>
                  <Badge variant={job.type === 'internship' ? 'purple' : 'primary'} size="xs">
                    {job.type}
                  </Badge>
                  <Badge
                    variant={job.status === 'ACTIVE' ? 'success' : job.status === 'REJECTED' ? 'danger' : 'warning'}
                    size="xs"
                  >
                    {job.status}
                  </Badge>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{job.title}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location} ({job.workMode})
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    {job.salaryRange || 'Competitive'}
                  </span>
                  <span>Posted: {formatDate(job.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedJobIdForApplicants(job._id)}
                  className="flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Review Applicants ({job.applicantCount || 0})</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteJob(job._id)}
                  className="text-rose-600 hover:bg-rose-50"
                  title="Delete Job"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No jobs posted yet"
          description="Click below to post an internship or full-time position for students."
          actionLabel="Post a Job"
          onAction={() => setShowPostModal(true)}
        />
      )}

      {/* Post Modal */}
      {showPostModal && (
        <JobPostModal
          isOpen={showPostModal}
          onClose={() => setShowPostModal(false)}
          onSuccess={fetchMyJobs}
        />
      )}

      {/* Applicants Reviewer Modal */}
      {selectedJobIdForApplicants && (
        <JobApplicantsModal
          isOpen={Boolean(selectedJobIdForApplicants)}
          onClose={() => setSelectedJobIdForApplicants(null)}
          jobId={selectedJobIdForApplicants}
        />
      )}
    </div>
  );
};

export default AlumniJobsPage;
