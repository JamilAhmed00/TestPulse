import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Wallet, CheckCircle2, ArrowRight, Clock, Zap, Bot, Bell, Activity } from 'lucide-react';
import Header from '../components/Header';
import AdmissionCalendar from '../components/AdmissionCalendar';
import { authStorage, studentStorage, applicationStorage, notificationStorage } from '../lib/storage';
import { Student, Application, Notification } from '../lib/supabase';
import { mockUniversitiesFull } from '../lib/mockData';

export default function Dashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadData = () => {
      try {
        const user = authStorage.getCurrentUser();
        if (!user) {
          navigate('/login');
          return;
        }

        const studentData = studentStorage.getStudent();
        if (!studentData) {
          navigate('/register');
          return;
        }

        setStudent(studentData);
        setApplications(applicationStorage.getApplications());
        setNotifications(notificationStorage.getNotifications());
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
            <p className="text-xl text-slate-700 mb-4 font-semibold">Profile not found</p>
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Complete Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalApplications = applications.length;
  const autoApplyCount = applications.filter(a => a.auto_apply_enabled).length;
  const currentBalance = student.current_balance || 0;
  const unreadNotifications = notifications.filter(n => !n.read);
  const recentNotifications = notifications.slice(0, 5);

  // Calculate total cost of applications
  const totalCost = applications.reduce((sum, app) => {
    const uni = mockUniversitiesFull.find(u => u.id === app.university_id);
    return sum + (uni?.application_fee || 0);
  }, 0);

  // Get next urgent action
  const getNextAction = () => {
    if (totalApplications === 0) {
      return {
        title: 'Add Universities to Your List',
        description: 'Start by selecting universities you want to apply to',
        action: 'Browse Universities',
        icon: BookOpen,
        color: 'blue',
        path: '/applications',
        urgent: false,
      };
    }
    
    if (currentBalance < totalCost) {
      const needed = totalCost - currentBalance;
      return {
        title: `Add ৳${needed.toLocaleString()} to Your Account`,
        description: `You need ${needed.toLocaleString()} more to pay for ${totalApplications} applications`,
        action: 'Recharge Now',
        icon: Wallet,
        color: 'red',
        path: '/balance',
        urgent: true,
      };
    }

    if (autoApplyCount === 0) {
      return {
        title: 'Enable Auto-Apply',
        description: 'Turn on auto-apply so AI can automatically submit your applications',
        action: 'Enable Auto-Apply',
        icon: Zap,
        color: 'purple',
        path: '/applications',
        urgent: false,
      };
    }

    return {
      title: 'AI Agent is Working',
      description: 'Your applications are being monitored and processed automatically',
      action: 'View Status',
      icon: CheckCircle2,
      color: 'green',
      path: '/applications',
      urgent: false,
    };
  };

  const nextAction = getNextAction();
  const ActionIcon = nextAction.icon;

  // Get upcoming deadlines
  const upcomingDeadlines = applications
    .map(app => {
      const uni = mockUniversitiesFull.find(u => u.id === app.university_id);
      if (!uni) return null;
      const deadline = new Date(uni.deadline);
      const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return { ...app, university: uni, deadline, daysUntil };
    })
    .filter(Boolean)
    .sort((a, b) => a!.deadline.getTime() - b!.deadline.getTime())
    .slice(0, 3) as Array<Application & { university: typeof mockUniversitiesFull[0]; deadline: Date; daysUntil: number }>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Header />

      <div className="w-full pt-24">
        {/* Welcome & Next Action - Full Width Header */}
        <div className={`bg-white border-b border-slate-200 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="px-6 py-8">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  Hello, {student.first_name}! 👋
                </h1>
                <p className="text-lg text-slate-600">
                  {totalApplications === 0 
                    ? 'Get started by adding universities to your list'
                    : `You have ${totalApplications} universities in your list`}
                </p>
              </div>
              
              {/* Next Action CTA */}
              <div className={`bg-gradient-to-r ${
                nextAction.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                nextAction.color === 'red' ? 'from-red-500 to-orange-500' :
                nextAction.color === 'purple' ? 'from-purple-500 to-pink-500' :
                'from-green-500 to-emerald-500'
              } rounded-xl p-6 text-white shadow-lg min-w-[320px] ${nextAction.urgent ? 'ring-4 ring-red-300' : ''}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <ActionIcon size={24} />
                  </div>
                  <h3 className="text-lg font-bold">{nextAction.title}</h3>
                </div>
                <p className="text-white/90 text-sm mb-4">{nextAction.description}</p>
                <button
                  onClick={() => navigate(nextAction.path)}
                  className="w-full bg-white text-slate-900 hover:bg-blue-50 font-bold py-3 px-4 rounded-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
                >
                  {nextAction.action}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Full Width */}
        <div className="px-6 py-8">
          {/* Quick Status - Full Width Grid */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BookOpen className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Universities</p>
                  <p className="text-3xl font-bold text-slate-900">{totalApplications}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Wallet className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Balance</p>
                  <p className="text-3xl font-bold text-slate-900">৳{currentBalance.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Zap className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Auto-Apply</p>
                  <p className="text-3xl font-bold text-slate-900">{autoApplyCount}/{totalApplications || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-orange-100 rounded-xl relative">
                  <Bell className="text-orange-600" size={24} />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadNotifications.length}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-600">Updates</p>
                  <p className="text-3xl font-bold text-slate-900">{unreadNotifications.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid Layout - Full Width */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - 2 spans */}
            <div className="lg:col-span-2 space-y-6">
              {/* What Happens Next */}
              {totalApplications > 0 && (
                <div className={`bg-white rounded-xl p-6 border-2 border-slate-200 shadow-sm transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Bot className="text-blue-600" size={24} />
                    What Happens Next?
                  </h2>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Step 1: Recharge */}
                    <div className={`p-5 rounded-xl border-2 transition-all ${
                      currentBalance >= totalCost 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-blue-400 bg-blue-50'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          currentBalance >= totalCost ? 'bg-green-500' : 'bg-blue-500'
                        } text-white font-bold text-lg`}>
                          {currentBalance >= totalCost ? <CheckCircle2 size={20} /> : '1'}
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg">Recharge</h3>
                      </div>
                      <p className="text-sm text-slate-700 mb-3">
                        {currentBalance >= totalCost 
                          ? `Enough balance (৳${currentBalance.toLocaleString()})`
                          : `Need ৳${(totalCost - currentBalance).toLocaleString()} more`}
                      </p>
                      {currentBalance < totalCost && (
                        <button
                          onClick={() => navigate('/balance')}
                          className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1"
                        >
                          Add Money <ArrowRight size={14} />
                        </button>
                      )}
                    </div>

                    {/* Step 2: Enable Auto-Apply */}
                    <div className={`p-5 rounded-xl border-2 transition-all ${
                      autoApplyCount > 0 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-purple-400 bg-purple-50'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          autoApplyCount > 0 ? 'bg-green-500' : 'bg-purple-500'
                        } text-white font-bold text-lg`}>
                          {autoApplyCount > 0 ? <CheckCircle2 size={20} /> : '2'}
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg">Auto-Apply</h3>
                      </div>
                      <p className="text-sm text-slate-700 mb-3">
                        {autoApplyCount > 0 
                          ? `${autoApplyCount} enabled`
                          : 'Enable for automatic submission'}
                      </p>
                      {autoApplyCount === 0 && (
                        <button
                          onClick={() => navigate('/applications')}
                          className="text-sm text-purple-600 font-semibold hover:underline flex items-center gap-1"
                        >
                          Enable Now <ArrowRight size={14} />
                        </button>
                      )}
                    </div>

                    {/* Step 3: AI Takes Over */}
                    <div className={`p-5 rounded-xl border-2 transition-all ${
                      autoApplyCount > 0 && currentBalance >= totalCost
                        ? 'border-green-400 bg-green-50' 
                        : 'border-slate-300 bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          autoApplyCount > 0 && currentBalance >= totalCost ? 'bg-green-500' : 'bg-slate-400'
                        } text-white font-bold text-lg`}>
                          {autoApplyCount > 0 && currentBalance >= totalCost ? <Bot size={20} /> : '3'}
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg">AI Working</h3>
                      </div>
                      <p className="text-sm text-slate-700">
                        {autoApplyCount > 0 && currentBalance >= totalCost
                          ? 'Monitoring & submitting automatically'
                          : 'Will start after setup'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming Deadlines */}
              {upcomingDeadlines.length > 0 && (
                <div className={`bg-white rounded-xl p-6 border-2 border-slate-200 shadow-sm transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Clock className="text-orange-600" size={24} />
                    Upcoming Deadlines
                  </h2>
                  <div className="grid gap-4">
                    {upcomingDeadlines.map((app) => {
                      const isUrgent = app.daysUntil <= 7;
                      return (
                        <div
                          key={app.id}
                          className={`p-5 rounded-xl border-2 transition-all ${
                            isUrgent ? 'border-red-400 bg-red-50' : 'border-orange-300 bg-orange-50'
                          }`}
                        >
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex-1">
                              <p className="font-bold text-slate-900 text-lg mb-1">{app.university.name}</p>
                              <p className="text-sm text-slate-600">{app.university.city}</p>
                              {app.auto_apply_enabled && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-green-700">
                                  <CheckCircle2 size={16} />
                                  <span>Auto-apply enabled</span>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className={`font-bold text-2xl ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
                                {app.daysUntil === 0 ? 'Today' : app.daysUntil === 1 ? 'Tomorrow' : `${app.daysUntil} days`}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {app.deadline.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Calendar - Full Width */}
              {totalApplications > 0 && (
                <div className={`transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <AdmissionCalendar applications={applications} />
                </div>
              )}
            </div>

            {/* Right Column - 1 span */}
            <div className="space-y-6">
              {/* Recent Activity */}
              {recentNotifications.length > 0 && (
                <div className={`bg-white rounded-xl p-6 border-2 border-slate-200 shadow-sm transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Activity className="text-blue-600" size={24} />
                    Recent Activity
                  </h2>
                  <div className="space-y-3">
                    {recentNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          notif.read ? 'bg-slate-50 border-slate-200' : 'bg-blue-50 border-blue-300'
                        }`}
                      >
                        <p className="font-semibold text-slate-900 text-sm mb-1">{notif.title}</p>
                        <p className="text-xs text-slate-600 mb-2">{notif.message}</p>
                        {notif.circular_summary && (
                          <div className="mt-2 p-2 bg-white rounded-lg border border-blue-200">
                            <p className="text-xs font-semibold text-blue-700 mb-1">Circular Summary:</p>
                            <p className="text-xs text-slate-600">{notif.circular_summary}</p>
                          </div>
                        )}
                        {notif.transaction_id && (
                          <div className="mt-2 p-2 bg-white rounded-lg border border-green-200">
                            <p className="text-xs font-semibold text-green-700 mb-1">Transaction ID:</p>
                            <code className="text-xs text-green-900 font-mono">{notif.transaction_id}</code>
                          </div>
                        )}
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
