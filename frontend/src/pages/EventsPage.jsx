import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, MapPin, Users, Video, Plus, CheckCircle, ExternalLink } from 'lucide-react';
import { eventApi } from '../services/eventApi';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { formatDate } from '../utils/formatters';

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useNotifications();

  // Create Event Form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '6:00 PM - 7:30 PM PST',
    location: 'Virtual Webinar',
    mode: 'online',
    meetingLink: 'https://meet.google.com/new',
    capacity: 200,
    tags: 'Tech Talk, Career Guidance'
  });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await eventApi.getEvents();
      if (res.success && res.data) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRegister = async (eventId, isRegistered) => {
    try {
      if (isRegistered) {
        await eventApi.cancelRegistration(eventId);
        showToast('Cancelled', 'Your event registration has been cancelled.', 'info');
      } else {
        await eventApi.register(eventId);
        showToast('Registered! 🎉', 'You have secured your spot for this event.', 'success');
      }
      fetchEvents();
    } catch (err) {
      showToast('Registration Error', err.message, 'danger');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setError('');
    setCreateLoading(true);

    try {
      await eventApi.createEvent({
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim())
      });
      showToast('Event Created! 📅', 'The event is now published for all students and alumni.', 'success');
      setShowCreateModal(false);
      fetchEvents();
    } catch (err) {
      setError(err.message || 'Failed to create event');
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) return <Loader text="Loading tech webinars & career events..." />;

  const canCreate = user?.role === 'alumni' || user?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Alumni Talks & Networking Webinars</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">University Events & Tech Talks</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Join live masterclasses, tech interview workshops, and career fairs hosted by alumni.
          </p>
        </div>

        {canCreate && (
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus className="w-4 h-4" />
            <span>Host an Event</span>
          </Button>
        )}
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div key={ev._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant={ev.mode === 'online' ? 'primary' : 'success'} size="xs">
                    {ev.mode?.toUpperCase()}
                  </Badge>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {ev.registeredCount || 0} / {ev.capacity || 100} Registered
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-indigo-600 transition">
                  {ev.title}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    {formatDate(ev.date)}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    {ev.time}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {ev.description}
                </p>

                {/* Organizer Info */}
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 mb-4">
                  <img
                    src={ev.organizer?.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80'}
                    alt="Organizer"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">{ev.organizer?.name}</p>
                    <p className="text-[10px] text-slate-500">{ev.organizer?.department}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {ev.meetingLink && ev.isRegistered && (
                  <a
                    href={ev.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition text-xs font-bold flex items-center gap-1"
                    title="Meeting Link"
                  >
                    <Video className="w-4 h-4" />
                  </a>
                )}

                <Button
                  size="sm"
                  variant={ev.isRegistered ? 'outline' : 'primary'}
                  onClick={() => handleRegister(ev._id, ev.isRegistered)}
                  className="flex-1"
                >
                  {ev.isRegistered ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Registered (Cancel)</span>
                    </>
                  ) : (
                    <span>Register Spot</span>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No upcoming events" description="Check back soon for upcoming tech talks and webinars." />
      )}

      {/* Host Event Modal */}
      {showCreateModal && (
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Host an Event / Webinar">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Event Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Distributed System Design Masterclass"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time & Timezone</label>
                <input
                  type="text"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="e.g. 6:00 PM - 7:30 PM PST"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Mode</label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="online">Online (Virtual Webinar)</option>
                  <option value="offline">In-Person (Campus)</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Capacity</label>
                <input
                  type="number"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Link (Google Meet / Zoom)</label>
              <input
                type="url"
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Event Description & Agenda</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Details on what attendees will learn..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)} type="button">
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={createLoading}>
                Publish Event
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default EventsPage;
