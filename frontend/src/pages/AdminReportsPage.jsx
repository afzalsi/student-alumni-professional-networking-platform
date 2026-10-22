import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/formatters';

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { showToast } = useNotifications();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getReports({ page, limit: 10 });
      if (res.success && res.data) {
        setReports(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page]);

  const handleResolve = async (reportId, status) => {
    try {
      await adminApi.resolveReport(reportId, { status, resolutionNotes: 'Reviewed by admin' });
      showToast('Report Resolved', `Report marked as ${status}`, 'success');
      fetchReports();
    } catch (err) {
      showToast('Error', err.message, 'danger');
    }
  };

  if (loading) return <Loader text="Loading user reports..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports & Moderation Disputes</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review community reports regarding inappropriate messages, users, or postings.
        </p>
      </div>

      {reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant={r.status === 'PENDING' ? 'warning' : 'success'} size="xs">
                    {r.status}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-500">Reported {r.entityType}</span>
                </div>
                <p className="text-xs font-bold text-slate-900">Reason: {r.reason}</p>
                <p className="text-[11px] text-slate-400">
                  Reported by {r.reporterId?.name} ({r.reporterId?.email}) • {formatDate(r.createdAt)}
                </p>
              </div>

              {r.status === 'PENDING' && (
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => handleResolve(r._id, 'RESOLVED')}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleResolve(r._id, 'DISMISSED')}>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Dismiss</span>
                  </Button>
                </div>
              )}
            </div>
          ))}

          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      ) : (
        <EmptyState title="No active reports" description="The platform is healthy with zero pending disputes." />
      )}
    </div>
  );
};

export default AdminReportsPage;
