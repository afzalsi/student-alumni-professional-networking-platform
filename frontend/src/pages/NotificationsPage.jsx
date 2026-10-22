import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  MessageSquare,
  Briefcase,
  Calendar,
  Users,
  Check,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { formatDate } from '../utils/formatters';

const NotificationsPage = () => {
  const { notifications, loading, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) return <Loader text="Loading your notifications..." />;

  const getIcon = (type) => {
    switch (type) {
      case 'FOLLOW':
        return <UserPlus className="w-5 h-5 text-indigo-600" />;
      case 'CONNECTION_REQUEST':
        return <Users className="w-5 h-5 text-indigo-600" />;
      case 'CONNECTION_ACCEPTED':
        return <UserCheck className="w-5 h-5 text-emerald-600" />;
      case 'POST_LIKE':
        return <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />;
      case 'POST_COMMENT':
        return <MessageCircle className="w-5 h-5 text-sky-500" />;
      case 'POST_SHARE':
        return <Share2 className="w-5 h-5 text-amber-500" />;
      case 'MENTORSHIP_REQUEST':
      case 'MENTORSHIP_ACCEPTED':
        return <Users className="w-5 h-5 text-indigo-600" />;
      case 'JOB_STATUS_CHANGE':
        return <Briefcase className="w-5 h-5 text-emerald-600" />;
      case 'SESSION_REQUEST':
      case 'SESSION_CONFIRMED':
        return <Calendar className="w-5 h-5 text-amber-500" />;
      case 'NEW_MESSAGE':
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Stay updated with mentorship requests, interview calls, new messages, and status updates.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead}>
          <Check className="w-3.5 h-3.5" />
          <span>Mark All as Read</span>
        </Button>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => markAsRead(n._id)}
              className={`p-5 rounded-3xl border transition flex items-start gap-4 cursor-pointer ${
                n.isRead
                  ? 'bg-white border-slate-200'
                  : 'bg-indigo-50/50 border-indigo-200 shadow-xs'
              }`}
            >
              <div className="p-2.5 rounded-2xl bg-white shadow-xs border border-slate-100 shrink-0">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">{formatDate(n.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>

                {n.link && (
                  <Link
                    to={n.link}
                    className="inline-block mt-2 text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    View Details →
                  </Link>
                )}
              </div>

              {!n.isRead && (
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full shrink-0 self-center" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No notifications" description="You are all caught up with your updates." />
      )}
    </div>
  );
};

export default NotificationsPage;
