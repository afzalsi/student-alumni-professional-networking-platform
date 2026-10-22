import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle } from 'lucide-react';
import { mentorshipApi } from '../services/mentorshipApi';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/formatters';

const AlumniRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const { showToast } = useNotifications();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await mentorshipApi.getRequests();
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (requestId, status) => {
    try {
      setProcessingId(requestId);
      await mentorshipApi.updateRequestStatus(requestId, { status });
      showToast(
        status === 'ACCEPTED' ? 'Mentorship Activated! 🎉' : 'Request Updated',
        status === 'ACCEPTED'
          ? 'You can now chat and schedule sessions with this student.'
          : 'Status has been updated.',
        'success'
      );
      fetchRequests();
    } catch (err) {
      showToast('Error', err.message, 'danger');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <Loader text="Loading mentorship requests..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Mentorship Requests</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review incoming mentorship requests from students seeking your guidance.
        </p>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => {
            const student = req.studentId || {};
            const isPending = req.status === 'PENDING';

            return (
              <div key={req._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={student.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-indigo-100"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{student.name}</h4>
                      <p className="text-xs text-slate-500">
                        {student.department} • Class of {student.graduationYear}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      req.status === 'ACCEPTED'
                        ? 'success'
                        : req.status === 'REJECTED'
                        ? 'danger'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {req.status}
                  </Badge>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                  <p className="text-xs font-bold text-indigo-600">Focus Topic: {req.topic}</p>
                  <p className="text-xs text-slate-700 italic leading-relaxed">"{req.message}"</p>
                  <p className="text-[11px] text-slate-500 pt-1">
                    <span className="font-semibold text-slate-700">Mentorship Goal:</span> {req.goal}
                  </p>
                </div>

                {isPending && (
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(req._id, 'ACCEPTED')}
                      isLoading={processingId === req._id}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Accept Request</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(req._id, 'REJECTED')}
                      isLoading={processingId === req._id}
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Decline</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No mentorship requests"
          description="You do not have any mentorship requests right now."
        />
      )}
    </div>
  );
};

export default AlumniRequestsPage;
