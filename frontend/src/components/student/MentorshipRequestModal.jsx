import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { mentorshipApi } from '../../services/mentorshipApi';
import { useNotifications } from '../../context/NotificationContext';

const MentorshipRequestModal = ({ isOpen, onClose, mentor, onSuccess }) => {
  const [goal, setGoal] = useState('');
  const [topic, setTopic] = useState('Full Stack Architecture & Interview Prep');
  const [message, setMessage] = useState('');
  const [preferredMode, setPreferredMode] = useState('online');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useNotifications();

  if (!mentor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await mentorshipApi.createRequest({
        alumniId: mentor._id,
        goal,
        topic,
        message,
        preferredMode
      });
      showToast('Mentorship Request Sent!', `Your request to ${mentor.name} was successfully submitted.`, 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Request Mentorship from ${mentor.name}`}>
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Mentorship Topic / Focus Area</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          >
            <option>Full Stack Architecture & Interview Prep</option>
            <option>Machine Learning & Data Science Guidance</option>
            <option>DevOps, Cloud & Infrastructure</option>
            <option>Resume & Portfolio Review</option>
            <option>Career Strategy & Grad School</option>
            <option>General Tech Mentorship</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Your Primary Mentorship Goal</label>
          <input
            type="text"
            required
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Master System Design and prepare for summer SWE internships"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Mentorship Mode</label>
          <select
            value={preferredMode}
            onChange={(e) => setPreferredMode(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          >
            <option value="online">Online (Video Call & Messaging)</option>
            <option value="in-person">In-Person (Campus / Coffee)</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Introduction & Message to Mentor</label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell the mentor a little about your background, current challenges, and why you are reaching out..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={loading}>
            Send Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MentorshipRequestModal;
