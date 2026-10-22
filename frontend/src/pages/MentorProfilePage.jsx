import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building,
  MapPin,
  Star,
  Clock,
  Calendar,
  Sparkles,
  Send,
  Linkedin,
  Globe,
  Award,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { alumniApi } from '../services/alumniApi';
import { reviewApi } from '../services/reviewApi';
import MatchBadge from '../components/common/MatchBadge';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import MentorshipRequestModal from '../components/student/MentorshipRequestModal';
import { formatDate } from '../utils/formatters';

const MentorProfilePage = () => {
  const { id } = useParams();
  const [mentorData, setMentorData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const [mentorRes, reviewsRes] = await Promise.all([
          alumniApi.getById(id),
          reviewApi.getMentorReviews(id)
        ]);

        if (mentorRes.success) setMentorData(mentorRes.data);
        if (reviewsRes.success) setReviews(reviewsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) return <Loader text="Loading mentor profile..." />;
  if (!mentorData) return <div className="p-8 text-center text-slate-500">Mentor not found</div>;

  const { user, profile, matchScore, matchReasons } = mentorData;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/mentors" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" />
        Back to Mentors Directory
      </Link>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160'}
              alt={user.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-indigo-50 shadow-md"
            />
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
                {user.isVerified && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" title="Verified Alumni" />
                )}
                {profile?.mentorAvailable && (
                  <Badge variant="success" size="xs">● Available as Mentor</Badge>
                )}
              </div>

              <p className="text-sm font-bold text-indigo-600 mb-2">
                {profile?.jobTitle || 'Senior Software Engineer'} at {profile?.company || 'Tech Corp'}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500">
                <span>🎓 Class of {user.graduationYear} ({user.department})</span>
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {user.location}
                  </span>
                )}
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{profile?.ratingAverage || 5.0}</span>
                  <span className="text-slate-400 font-normal">({profile?.ratingCount || 1} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto">
            {matchScore && <MatchBadge score={matchScore} reasons={matchReasons} />}
            <Button
              onClick={() => setShowRequestModal(true)}
              disabled={!profile?.mentorAvailable}
              className="w-full"
            >
              <Send className="w-4 h-4" />
              <span>Request Mentorship</span>
            </Button>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About & Background</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            {user.bio || 'Experienced engineering professional dedicated to helping students develop skills, review code, and prepare for interviews.'}
          </p>
        </div>

        {/* Areas of Expertise */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Mentoring Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {(profile?.expertise || user.skills || []).map((exp, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold"
              >
                {exp}
              </span>
            ))}
          </div>
        </div>

        {/* Availability Schedule */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">General Availability</h3>
          <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 text-xs text-slate-700">
            <Clock className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="font-semibold">{profile?.availabilitySchedule || 'Weekends and Evenings by appointment'}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Mode: {profile?.mentorshipMode || 'Online Video Meetings'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-current" />
          <span>Student Reviews & Feedback ({reviews.length})</span>
        </h3>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={r.studentId?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                      alt="Student"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{r.studentId?.name || 'Verified Student'}</h5>
                      <p className="text-[10px] text-slate-400">{r.studentId?.department}</p>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(r.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">"{r.comment}"</p>
                <span className="text-[10px] text-slate-400 mt-2 block">{formatDate(r.createdAt)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No reviews yet for this mentor.</p>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <MentorshipRequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          mentor={user}
        />
      )}
    </div>
  );
};

export default MentorProfilePage;
