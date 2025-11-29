import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Filter, CheckCircle2, X } from 'lucide-react';
import Header from '../components/Header';
import NotificationCard from '../components/NotificationCard';
import { authStorage, notificationStorage } from '../lib/storage';
import { Notification } from '../lib/supabase';

type FilterType = 'all' | 'circular_scrape' | 'payment' | 'application_status' | 'deadline' | 'manual_reminder' | 'system';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authStorage.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }

    const loadNotifications = () => {
      try {
        const allNotifications = notificationStorage.getNotifications();
        setNotifications(allNotifications);
      } catch (err) {
        console.error('Error loading notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [navigate]);

  const handleMarkAsRead = (id: string) => {
    notificationStorage.markAsRead(id);
    setNotifications(notificationStorage.getNotifications());
  };

  const handleMarkAllAsRead = () => {
    notificationStorage.markAllAsRead();
    setNotifications(notificationStorage.getNotifications());
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;
  const unreadFiltered = filteredNotifications.filter(n => !n.read).length;

  const filterOptions: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'circular_scrape', label: 'Circulars', count: notifications.filter(n => n.type === 'circular_scrape').length },
    { value: 'payment', label: 'Payments', count: notifications.filter(n => n.type === 'payment').length },
    { value: 'application_status', label: 'Applications', count: notifications.filter(n => n.type === 'application_status').length },
    { value: 'deadline', label: 'Deadlines', count: notifications.filter(n => n.type === 'deadline').length },
    { value: 'manual_reminder', label: 'Reminders', count: notifications.filter(n => n.type === 'manual_reminder').length },
    { value: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] pt-28">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7C83FD]/100 via-white to-[#7C83FD]/100">
      <Header />

      <div className="py-8 pt-28 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Bell className="text-blue-600" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
                <p className="text-slate-600">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                <CheckCircle2 size={18} />
                Mark All Read
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filter === option.value
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-blue-50 border-2 border-slate-200'
                }`}
              >
                {option.label}
                {option.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    filter === option.value
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {option.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl p-12 border-2 border-slate-200 text-center">
              <Bell className="text-slate-400 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-700 mb-2">No notifications</h3>
              <p className="text-slate-500">
                {filter === 'all' 
                  ? "You're all caught up! Check back later for updates."
                  : `No ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()} notifications.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Unread Section */}
              {unreadFiltered > 0 && (
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Unread ({unreadFiltered})
                  </h2>
                  <div className="space-y-3">
                    {filteredNotifications
                      .filter(n => !n.read)
                      .map((notification) => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Read Section */}
              {filteredNotifications.filter(n => n.read).length > 0 && (
                <div>
                  {unreadFiltered > 0 && (
                    <h2 className="text-lg font-bold text-slate-700 mb-3 mt-6">Read</h2>
                  )}
                  <div className="space-y-3">
                    {filteredNotifications
                      .filter(n => n.read)
                      .map((notification) => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

