import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Compass, Sparkles } from 'lucide-react';
import { alumniApi } from '../services/alumniApi';
import MentorCard from '../components/student/MentorCard';
import MentorshipRequestModal from '../components/student/MentorshipRequestModal';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { INDUSTRIES } from '../utils/constants';

const MentorsPage = () => {
  const [mentors, setMentors] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [mentorAvailable, setMentorAvailable] = useState('true');
  const [page, setPage] = useState(1);

  const fetchMentors = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 9,
        search: search || undefined,
        industry: industry && industry !== 'All Industries' ? industry : undefined,
        mentorAvailable: mentorAvailable || undefined
      };
      const res = await alumniApi.getDirectory(params);
      if (res.success && res.data) {
        setMentors(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, industry, mentorAvailable]);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMentors();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Alumni Mentor Directory</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Find Your Mentor</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          Search alumni across top companies, filter by target industry and expertise, and request 1-on-1 mentorship.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skills, company (e.g. Google, React, System Design)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={industry}
              onChange={(e) => {
                setIndustry(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              {INDUSTRIES.map((ind, i) => (
                <option key={i} value={ind}>{ind}</option>
              ))}
            </select>

            <select
              value={mentorAvailable}
              onChange={(e) => {
                setMentorAvailable(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="true">● Available as Mentor</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition shadow-xs"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Results Grid */}
      {loading ? (
        <Loader text="Finding mentors..." />
      ) : mentors.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((m) => (
              <MentorCard
                key={m.user?._id || m._id}
                mentor={m}
                onRequestMentorship={(u) => setSelectedMentor(u)}
              />
            ))}
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </>
      ) : (
        <EmptyState
          title="No mentors found"
          description="Try broadening your search query or removing some industry filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setIndustry('');
            setMentorAvailable('');
            setPage(1);
          }}
        />
      )}

      {/* Mentorship Request Modal */}
      {selectedMentor && (
        <MentorshipRequestModal
          isOpen={Boolean(selectedMentor)}
          onClose={() => setSelectedMentor(null)}
          mentor={selectedMentor}
          onSuccess={fetchMentors}
        />
      )}
    </div>
  );
};

export default MentorsPage;
