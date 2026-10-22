import React from 'react';
import { Building, MapPin, DollarSign, Calendar, Bookmark, BookmarkCheck, Sparkles, Send } from 'lucide-react';
import Badge from '../common/Badge';
import MatchBadge from '../common/MatchBadge';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';

const JobCard = ({ job, onApply, onToggleSave, isSaved }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {job.company}
              </span>
              <Badge variant={job.type === 'internship' ? 'purple' : 'primary'} size="xs">
                {job.type?.toUpperCase()}
              </Badge>
              {job.workMode && (
                <Badge variant="default" size="xs">
                  {job.workMode}
                </Badge>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition">
              {job.title}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            {job.matchScore && <MatchBadge score={job.matchScore} reasons={job.matchReasons} />}
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(job._id)}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition"
                title={isSaved ? 'Unsave Job' : 'Save Job'}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-5 h-5 text-indigo-600 fill-indigo-100" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Location & Compensation */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mb-3.5">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            {job.salaryRange || 'Competitive'}
          </span>
          {job.deadline && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              Due: {formatDate(job.deadline)}
            </span>
          )}
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {job.description}
        </p>

        {/* Required Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(job.skills || []).slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-medium"
            >
              {skill}
            </span>
          ))}
          {(job.skills || []).length > 4 && (
            <span className="text-[11px] text-slate-400 self-center">
              +{(job.skills || []).length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <Button
          onClick={() => onApply(job)}
          size="sm"
          className="w-full"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Apply Now</span>
        </Button>
      </div>
    </div>
  );
};

export default JobCard;
