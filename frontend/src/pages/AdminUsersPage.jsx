import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, ShieldCheck, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/formatters';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const { showToast } = useNotifications();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers({
        page,
        limit: 10,
        search: search || undefined,
        role: role || undefined
      });
      if (res.success && res.data) {
        setUsers(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (userId) => {
    try {
      const res = await adminApi.toggleUserStatus(userId);
      showToast('Status Updated', res.message, 'success');
      fetchUsers();
    } catch (err) {
      showToast('Error', err.message, 'danger');
    }
  };

  const handleToggleVerify = async (userId, currentVerified) => {
    try {
      const res = await adminApi.verifyAlumni(userId, !currentVerified);
      showToast('Verification Updated', res.message, 'success');
      fetchUsers();
    } catch (err) {
      showToast('Error', err.message, 'danger');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Management Directory</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View, activate, suspend accounts, and verify official alumni status.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, department..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="alumni">Alumni</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <Loader text="Loading users..." />
      ) : users.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Department & Class</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          u.role === 'admin' ? 'purple' : u.role === 'alumni' ? 'success' : 'primary'
                        }
                        size="xs"
                      >
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {u.department || 'N/A'} {u.graduationYear ? `(${u.graduationYear})` : ''}
                    </td>

                    <td className="px-6 py-4">
                      {u.role === 'alumni' ? (
                        <button
                          onClick={() => handleToggleVerify(u._id, u.isVerified)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                            u.isVerified
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{u.isVerified ? 'Verified' : 'Click to Verify'}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400">Student Account</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={u.isActive ? 'success' : 'danger'} size="xs">
                        {u.isActive ? 'Active' : 'Suspended'}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {u.role !== 'admin' && (
                        <Button
                          size="sm"
                          variant={u.isActive ? 'outline' : 'secondary'}
                          onClick={() => handleToggleStatus(u._id)}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      ) : (
        <EmptyState title="No users matched" description="Try adjusting your search criteria." />
      )}
    </div>
  );
};

export default AdminUsersPage;
