import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckCircle2, MessageSquare, Clock, Star, Target, Plus, ArrowRight } from 'lucide-react';
import { mentorshipApi } from '../services/mentorshipApi';
import { reviewApi } from '../services/reviewApi';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/formatters';

const StudentMentorshipsPage = () => {
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalMentor, setReviewModalMentor] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const { showToast } = useNotifications();

  const fetchMentorships = async () => {
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

  useEffect(() => {
    fetchMentorships();
  }, []);

  const handleToggleGoal = async (mentorshipId, goalIndex) => {
    const mentorship = mentorships.find((m) => m._id === mentorshipId);
    if (!mentorship) return;

    const updatedGoals = [...mentorship.goals];
    updatedGoals[goalIndex].isCompleted = !updatedGoals[goalIndex].isCompleted;

    const completedCount = updatedGoals.filter((g) => g.isCompleted).length;
    const progress = Math.round((completedCount / updatedGoals.length) * 100);

    try {
      await mentorshipApi.updateMentorship(mentorshipId, {
        goals: updatedGoals,
        progressPercentage: progress
      });

      setMentorships((prev) =>
        prev.map((m) =>
          m._id === mentorshipId
            ? { ...m, goals: updatedGoals, progressPercentage: progress }
            : m
        )
      );
      showToast('Goal Updated', 'Mentorship progress milestone updated.', 'success');
    } catch (err) {
      showToast('Update Failed', err.message, 'danger');
    }
  };

  const handleAddGoal = async (mentorshipId, title) => {
    if (!title.trim()) return;
    const mentorship = mentorships.find((m) => m._id === mentorshipId);
    if (!mentorship) return;

    const updatedGoals = [...(mentorship.goals || []), { title, isCompleted: false }];
    const completedCount = updatedGoals.filter((g) => g.isCompleted).length;
    const progress = Math.round((completedCount / updatedGoals.length) * 100);

    try {
      await mentorshipApi.updateMentorship(mentorshipId, {
        goals: updatedGoals,
        progressPercentage: progress
      });

      setMentorships((prev) =>
        prev.map((m) =>
          m._id === mentorshipId
            ? { ...m, goals: updatedGoals, progressPercentage: progress }
            : m
        )
      );
      showToast('Goal Added', 'New target goal added to roadmap.', 'success');
    } catch (err) {
      showToast('Action Failed', err.message, 'danger');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalMentor) return;
    setReviewSubmitting(true);

    try {
      await reviewApi.createReview({
        mentorId: reviewModalMentor.alumniId?._id || reviewModalMentor.alumniId,
        mentorshipId: reviewModalMentor._id,
        rating: Number(rating),
        comment: reviewComment
      });

      showToast('Review Submitted', 'Thank you for reviewing your mentor!', 'success');
      setReviewModalMentor(null);
      setReviewComment('');
    } catch (err) {
      showToast('Review Error', err.message, 'danger');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading your active mentorships..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Mentors & Goals</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track active mentorship progress, manage career milestones, and schedule 1-on-1 reviews.
          </p>
        </div>
        <Link to="/mentors">
          <Button size="sm">
            <Plus className="w-4 h-4" />
            <span>Find Another Mentor</span>
          </Button>
        </Link>
      </div>

      {mentorships.length > 0 ? (
        <div className="space-y-6">
          {mentorships.map((m) => {
            const mentor = m.alumniId || {};
            return (
              <div key={m._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <img
                      src={mentor.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'}
                      alt={mentor.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{mentor.name}</h3>
                      <p className="text-xs text-indigo-600 font-semibold">{mentor.department} • Class of {mentor.graduationYear}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Mentoring since {formatDate(m.startDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to="/messages">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </Button>
                    </Link>
                    <Link to="/student/sessions">
                      <Button size="sm">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Book Session</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReviewModalMentor(m)}
                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>Rate Mentor</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-indigo-600" />
                      Milestone Roadmap Progress
                    </span>
                    <span className="text-indigo-600 font-bold">{m.progressPercentage || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${m.progressPercentage || 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Action Goals & Targets</h4>
                  <div className="space-y-2">
                    {(m.goals || []).map((g, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={g.isCompleted}
                          onChange={() => handleToggleGoal(m._id, idx)}
                          className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500"
                        />
                        <span className={`text-xs font-medium ${g.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {g.title}
                        </span>
                      </label>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddGoal(m._id, e.target.elements.newGoal.value);
                      e.target.elements.newGoal.value = '';
                    }}
                    className="mt-3 flex gap-2"
                  >
                    <input
                      name="newGoal"
                      placeholder="Add a new milestone goal (e.g. Master React Hooks and GraphQL)..."
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                    <Button type="submit" size="sm" variant="outline">
                      Add Goal
                    </Button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No active mentors yet"
          description="Browse our verified alumni mentor directory and send a mentorship request to get started."
          actionLabel="Find a Mentor"
          onAction={() => {}}
        />
      )}

      {reviewModalMentor && (
        <Modal
          isOpen={Boolean(reviewModalMentor)}
          onClose={() => setReviewModalMentor(null)}
          title={`Rate & Review ${reviewModalMentor.alumniId?.name}`}
        >
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rating (1 - 5 Stars)</label>
              <div className="flex gap-2 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-xl"
                  >
                    <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Feedback / Written Review</label>
              <textarea
                required
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share how this mentor helped you with code reviews, interviews, or career advice..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setReviewModalMentor(null)} type="button">
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={reviewSubmitting}>
                Submit Review
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StudentMentorshipsPage;
