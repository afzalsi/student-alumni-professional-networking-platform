import React, { useState, useEffect } from 'react';
import { BookmarkCheck } from 'lucide-react';
import { jobApi } from '../services/jobApi';
import JobCard from '../components/student/JobCard';
import JobApplyModal from '../components/student/JobApplyModal';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { useNotifications } from '../context/NotificationContext';

const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const { showToast } = useNotifications();

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await jobApi.getSavedJobs();
      if (res.success && res.data) {
        setSavedJobs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleToggleSave = async (jobId) => {
    try {
      await jobApi.toggleSaveJob(jobId);
      showToast('Removed', 'Job removed from saved bookmarks.', 'info');
      setSavedJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch (err) {
      showToast('Error', err.message, 'danger');
    }
  };

  if (loading) return <Loader text="Loading your saved bookmarks..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Saved Jobs & Internships</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Your bookmarked opportunities for quick reference and application submission.
        </p>
      </div>

      {savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onApply={(j) => setSelectedJob(j)}
              onToggleSave={handleToggleSave}
              isSaved={true}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No saved jobs"
          description="Bookmark jobs and internships by clicking the bookmark icon on any job card."
          actionLabel="Browse Jobs"
          onAction={() => {}}
        />
      )}

      {selectedJob && (
        <JobApplyModal
          isOpen={Boolean(selectedJob)}
          onClose={() => setSelectedJob(null)}
          job={selectedJob}
          onSuccess={fetchSaved}
        />
      )}
    </div>
  );
};

export default SavedJobsPage;
