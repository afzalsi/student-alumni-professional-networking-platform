import React from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, Star, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge';
import MatchBadge from '../common/MatchBadge';
import Button from '../common/Button';

const MentorCard = ({ mentor, onRequestMentorship }) => {
  const user = mentor.user || mentor.alumni || mentor;
  const profile = mentor.profile || {};
  const matchScore = mentor.matchScore;
  const matchReasons = mentor.matchReasons || [];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Header with Avatar, Verified badge, and Match Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
              alt={user.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100 group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 text-base leading-tight">{user.name}</h3>
                {user.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" title="Verified Alumni" />
                )}
              </div>
              <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                {profile.jobTitle || 'Alumni Mentor'}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" />
                  {profile.company || user.department}
                </span>
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {user.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {matchScore && <MatchBadge score={matchScore} reasons={matchReasons} />}
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {user.bio || 'Experienced university alumni offering career guidance, technical mentorship, and resume reviews.'}
        </p>

        {/* Skills & Expertise */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {(profile.expertise || user.skills || []).slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Rating and Availability */}
        <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-xl mb-4 text-xs">
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{profile.ratingAverage || 5.0}</span>
            <span className="text-slate-400 font-normal">({profile.ratingCount || 1} reviews)</span>
          </div>
          <div className="text-[11px] font-medium text-slate-600">
            {profile.mentorAvailable ? (
              <span className="text-emerald-600 font-semibold">● Available</span>
            ) : (
              <span className="text-slate-400">Not Available</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <Link to={`/mentors/${user._id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            View Profile
          </Button>
        </Link>
        <Button
          size="sm"
          onClick={() => onRequestMentorship(user)}
          disabled={!profile.mentorAvailable}
          className="flex-1"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Request</span>
        </Button>
      </div>
    </div>
  );
};

export default MentorCard;
