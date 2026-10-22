import React, { useState, useEffect } from 'react';
import { ExternalLink, FileText, CheckCircle, Video, UserCheck, XCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import { jobApi } from '../../services/jobApi';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

const JobApplicantsModal = ({ isOpen, onClose, jobId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const { showToast } = useNotifications();

  // Schedule modal state
  const [schedulingApp, setSchedulingApp] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('14:00 PST');
  const [interviewLink, setInterviewLink] = useState('https://meet.google.com/new');
  const [interviewNotes, setInterviewNotes] = useState('');

  const fetchApplicants = async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      const res = await jobApi.getJobApplicants(jobId);
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
    fetchApplicants();
  }, [jobId]);

  const handleUpdateStatus = async (appId, status, extra = {}) => {
    try {
      setUpdatingId(appId);
      await jobApi.updateApplicationStatus(appId, { status, ...extra });
      showToast('Status Updated', `Applicant status changed to ${status}`, 'success');
      fetchApplicants();
      setSchedulingApp(null);
    } catch (err) {
      showToast('Update Failed', err.message, 'danger');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isOpen) return null;

  const job = data?.job || {};
  const applications = data?.applications || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Applicants for: ${job.title || 'Job'}`} maxWidth="max-w-4xl">
      {loading ? (
        <Loader text="Loading candidate applications..." />
      ) : applications.length > 0 ? (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {applications.map((app) => {
            const student = app.studentId || {};
            return (
              <div key={app._id} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={student.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-indigo-100"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{student.name}</h4>
                      <p className="text-xs text-slate-500">
                        {student.department} • Class of {student.graduationYear} • {student.location || 'Student'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        app.status === 'SELECTED'
                          ? 'success'
                          : app.status === 'REJECTED'
                          ? 'danger'
                          : app.status === 'INTERVIEW'
                          ? 'warning'
                          : 'primary'
                      }
                      size="sm"
                    >
                      {app.status}
                    </Badge>
                  </div>
                </div>

                {/* Candidate Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {(student.skills || []).map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Cover Letter */}
                {app.coverLetter && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 italic">
                    "{app.coverLetter}"
                  </div>
                )}

                {/* Resume Link & Recruiter Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {app.resumeUrl && (
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-indigo-600 transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Resume</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <span className="text-[11px] text-slate-400">Applied {formatDate(app.createdAt)}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(app._id, 'SHORTLISTED')}
                      isLoading={updatingId === app._id}
                    >
                      Shortlist
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSchedulingApp(app)}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Interview</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(app._id, 'SELECTED')}
                      isLoading={updatingId === app._id}
                    >
                      Select / Hire
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleUpdateStatus(app._id, 'REJECTED')}
                      isLoading={updatingId === app._id}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No candidates applied yet"
          description="Applications submitted for this job posting will appear here."
        />
      )}

      {/* Schedule Interview Sub-Modal */}
      {schedulingApp && (
        <Modal
          isOpen={Boolean(schedulingApp)}
          onClose={() => setSchedulingApp(null)}
          title={`Schedule Interview: ${schedulingApp.studentId?.name}`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateStatus(schedulingApp._id, 'INTERVIEW', {
                interviewDetails: {
                  date: new Date(interviewDate),
                  time: interviewTime,
                  link: interviewLink,
                  notes: interviewNotes
                }
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Interview Date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time & Timezone</label>
              <input
                type="text"
                required
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                placeholder="e.g. 2:00 PM PST"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Link (Google Meet / Zoom)</label>
              <input
                type="url"
                required
                value={interviewLink}
                onChange={(e) => setInterviewLink(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Interview Topic / Notes</label>
              <textarea
                rows={3}
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                placeholder="Technical screening format, coding interview details..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSchedulingApp(null)} type="button">
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Send Interview Invite
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Modal>
  );
};

export default JobApplicantsModal;
