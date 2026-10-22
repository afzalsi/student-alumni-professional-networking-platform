import React, { useState, useEffect } from 'react';
import { FileCheck, ShieldCheck } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import { formatDate } from '../utils/formatters';

const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getAuditLogs({ page, limit: 15 });
        if (res.success && res.data) {
          setLogs(res.data);
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page]);

  if (loading) return <Loader text="Loading audit logs..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Audit Logs</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable ledger of sensitive administrator actions, verifications, and status changes.
        </p>
      </div>

      {logs.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Entity Type</th>
                  <th className="px-6 py-4">Metadata</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 font-bold text-indigo-700">
                      {log.action}
                    </td>
                    <td className="px-6 py-3 font-sans text-slate-700">
                      {log.actorId?.name || 'System Admin'} ({log.actorId?.email || 'system'})
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {log.entityType}
                    </td>
                    <td className="px-6 py-3 text-slate-600 max-w-xs truncate">
                      {JSON.stringify(log.metadata || {})}
                    </td>
                    <td className="px-6 py-3 font-sans text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      ) : (
        <EmptyState title="No audit logs recorded" description="Admin actions will be logged here." />
      )}
    </div>
  );
};

export default AdminAuditLogsPage;
