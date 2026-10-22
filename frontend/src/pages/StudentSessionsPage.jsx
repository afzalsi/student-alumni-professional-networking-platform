import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Video, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { sessionApi } from '../services/sessionApi';
import { mentorshipApi } from '../services/mentorshipApi';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/formatters';
import { Link } from 'react-router-dom';

const StudentSessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookLoading, setBookLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useNotifications();

  // Booking Form State
  const [mentorId, setMentorId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:00');
  const [topic, setTopic] = useState('System Design & Technical Mock Interview');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessRes, mentRes] = await Promise.all([
        sessionApi.getSessions(),
        mentorshipApi.getActiveMentorships()
      ]);

      if (sessRes.success) setSessions(sessRes.data);
      if (mentRes.success) {
        setMentorships(mentRes.data);
        if (mentRes.data.length > 0) {
          setMentorId(mentRes.data[0].alumniId?._id || mentRes.data[0].alumniId);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookSession = async (e) => {
    e.preventDefault();
    setError('');
    setBookLoading(true);

    try {
      await sessionApi.bookSession({
        mentorId,
        date,
        startTime,
        endTime,
        topic,
        notes
      });
      showToast('Session Booked! 🎉', 'Your mentoring session has been confirmed and added to your schedule.', 'success');
      setShowBookModal(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to book session');
    } finally {
      setBookLoading(false);
    }
  };

  if (loading) return <Loader text="Loading your mentoring sessions..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Mentoring Sessions</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Book 1-on-1 video calls with your active mentors and access meeting links.
          </p>
        </div>
        <Button onClick={() => setShowBookModal(true)} size="sm">
          <Plus className="w-4 h-4" />
          <span>Book New Session</span>
        </Button>
      </div>

      {sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((s) => {
            const mentor = s.mentorId || {};
            const isConfirmed = s.status === 'CONFIRMED';
            return (
              <div key={s._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={mentor.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'}
                        alt={mentor.name}
                        className="w-12 h-12 rounded-2xl object-cover"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{mentor.name}</h3>
                        <p className="text-xs text-slate-500">{mentor.department}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        s.status === 'CONFIRMED'
                          ? 'success'
                          : s.status === 'COMPLETED'
                          ? 'primary'
                          : s.status === 'CANCELLED'
                          ? 'danger'
                          : 'warning'
                      }
                      size="xs"
                    >
                      {s.status}
                    </Badge>
                  </div>

                  <h4 className="font-semibold text-slate-800 text-sm mb-2">{s.topic}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      {formatDate(s.date)}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      {s.startTime} - {s.endTime}
                    </span>
                  </div>

                  {s.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mb-4 italic">
                      Notes: {s.notes}
                    </p>
                  )}
                </div>

                {isConfirmed && s.meetingLink && (
                  <div className="pt-3 border-t border-slate-100">
                    <a
                      href={s.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Video Call</span>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No scheduled sessions"
          description="You do not have any mentoring sessions scheduled yet. Click below to book your first slot."
          actionLabel="Book a Session"
          onAction={() => setShowBookModal(true)}
        />
      )}

      {showBookModal && (
        <Modal
          isOpen={showBookModal}
          onClose={() => setShowBookModal(false)}
          title="Schedule a Mentoring Session"
        >
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {mentorships.length === 0 ? (
            <div className="text-center py-6">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-xs text-slate-600">You must have an active accepted mentorship to book sessions.</p>
              <Link to="/mentors" className="mt-3 inline-block text-xs font-bold text-indigo-600">
                Browse Alumni Mentors →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleBookSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Mentor</label>
                <select
                  value={mentorId}
                  onChange={(e) => setMentorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  {mentorships.map((m) => (
                    <option key={m._id} value={m.alumniId?._id}>
                      {m.alumniId?.name} ({m.alumniId?.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Topic / Goal</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. System Design Mock Interview or Resume Deep Dive"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preparation Notes / Questions</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any questions or links you want the mentor to look over before the call..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => setShowBookModal(false)} type="button">
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={bookLoading}>
                  Confirm Booking
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default StudentSessionsPage;
