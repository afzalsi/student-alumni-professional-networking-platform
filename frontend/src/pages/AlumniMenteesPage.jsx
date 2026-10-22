import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, MessageSquare, Clock, Target, CheckCircle2 } from 'lucide-react';
import { mentorshipApi } from '../services/mentorshipApi';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { formatDate } from '../utils/formatters';

const AlumniMenteesPage = () => {
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        setLoading(true);
        const res = await mentorshipApi.getActiveMentorships();
        if (res.success && res.data) {
          setMentorships(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentees();
  }, []);

  if (loading) return <Loader text="Loading your mentees..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active Mentees</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review your current mentees' progress, action goals, and schedule 1-on-1 calls.
        </p>
      </div>

      {mentorships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mentorships.map((m) => {
            const student = m.studentId || {};
            return (
              <div key={m._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={student.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-emerald-100"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{student.name}</h3>
                        <p className="text-xs text-slate-500">
                          {student.department} • Class of {student.graduationYear}
                        </p>
                      </div>
                    </div>
                  </div>

                  {student.careerGoals && (
                    <p className="text-xs text-slate-600 mb-3">
                      <span className="font-semibold text-slate-800">Target Goal:</span> {student.careerGoals}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                      <span>Roadmap Progress</span>
                      <span className="text-indigo-600 font-bold">{m.progressPercentage || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${m.progressPercentage || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Goals list */}
                  <div className="space-y-1.5 mb-4">
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Milestone Checklist</h5>
                    {(m.goals || []).map((g, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${g.isCompleted ? 'text-emerald-500' : 'text-slate-300'}`} />
                        <span className={g.isCompleted ? 'line-through text-slate-400' : ''}>{g.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Link to="/messages" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </Button>
                  </Link>
                  <Link to="/alumni/sessions" className="flex-1">
                    <Button size="sm" className="w-full">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Sessions</span>
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No active mentees"
          description="When you accept student requests, they will be listed here for progress tracking."
        />
      )}
    </div>
  );
};

export default AlumniMenteesPage;
