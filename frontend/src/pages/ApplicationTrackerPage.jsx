import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Building, MapPin, Calendar, ExternalLink, Video, CheckCircle } from 'lucide-react';
import { jobApi } from '../services/jobApi';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import { formatDate } from '../utils/formatters';

const stages = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'];

const ApplicationTrackerPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const res = await jobApi.getMyApplications();
        if (res.success && res.data) {
          setApplications(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

  if (loading) return <Loader text="Loading your application tracker..." />;

  const getStageIndex = (status) => {
    if (status === 'REJECTED' || status === 'WITHDRAWN') return -1;
    return stages.indexOf(status);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Application Tracker</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time hiring status updates for all jobs and internships you have submitted.
        </p>
      </div>

      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => {
            const job = app.jobId || {};
            const stageIdx = getStageIndex(app.status);
            const isRejected = app.status === 'REJECTED';

            return (
              <div key={app._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase">{job.company}</span>
                      <Badge variant={job.type === 'internship' ? 'purple' : 'primary'} size="xs">
                        {job.type?.toUpperCase()}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{job.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Applied: {formatDate(app.createdAt)}</span>
                      <span>•</span>
                      <span>Location: {job.location}</span>
                    </div>
                  </div>

                  <div>
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

                {!isRejected ? (
                  <div className="py-2">
                    <div className="grid grid-cols-5 gap-1 text-center">
                      {stages.map((stage, i) => {
                        const isCurrent = app.status === stage;
                        const isPast = stageIdx >= i;
                        return (
                          <div key={stage} className="space-y-1">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isCurrent
                                  ? 'bg-emerald-500'
                                  : isPast
                                  ? 'bg-indigo-600'
                                  : 'bg-slate-100'
                              }`}
                            />
                            <span className={`text-[10px] font-semibold block ${isCurrent ? 'text-emerald-700' : isPast ? 'text-slate-700' : 'text-slate-400'}`}>
                              {stage.replace('_', ' ')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 text-xs text-rose-700">
                    Application status is marked as Rejected. Keep applying to more opportunities!
                  </div>
                )}

                {app.interviewDetails && app.interviewDetails.date && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-xs text-emerald-900">Technical Interview Scheduled! 🎉</h4>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        {formatDate(app.interviewDetails.date)} at {app.interviewDetails.time} • {app.interviewDetails.notes}
                      </p>
                    </div>
                    {app.interviewDetails.link && (
                      <a
                        href={app.interviewDetails.link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Call</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No applications submitted"
          description="Browse available job postings and submit your applications to track them here."
          actionLabel="Explore Jobs"
          onAction={() => {}}
        />
      )}
    </div>
  );
};

export default ApplicationTrackerPage;
