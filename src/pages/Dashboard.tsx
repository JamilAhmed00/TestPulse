import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Wallet, CheckCircle2, ArrowRight, Clock, Zap, Bot, Bell, Activity } from 'lucide-react';
import Header from '../components/Header';
import AdmissionCalendar from '../components/AdmissionCalendar';
import { authStorage, studentStorage, applicationStorage, notificationStorage } from '../lib/storage';
import { Student, Application, Notification } from '../lib/supabase';
import { mockUniversitiesFull } from '../lib/mockData';
import Footer from '../components/Footer';

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
      // --- COLOR UPDATE: Loading spinner ---
      <div className="min-h-screen bg-[#F8F9FA]">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#7C83FD] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
            <p className="text-xl text-slate-700 mb-4 font-semibold">Profile not found</p>
            {/* --- COLOR UPDATE: Button gradient --- */}
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-[#7C83FD] to-[#96BAFF] hover:from-[#7C83FD] hover:to-[#7C83FD] text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
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

  const totalCost = applications.reduce((sum, app) => {
    const uni = mockUniversitiesFull.find(u => u.id === app.university_id);
    return sum + (uni?.application_fee || 0);
  }, 0);

  const getNextAction = () => {
    if (totalApplications === 0) return { title: 'Add Universities', description: 'Start by selecting universities you want to apply to', action: 'Browse', icon: BookOpen, color: 'primary', path: '/applications', urgent: false };
    if (currentBalance < totalCost) {
      const needed = totalCost - currentBalance;
      return { title: `Add ৳${needed.toLocaleString()}`, description: `You need ${needed.toLocaleString()} more to pay`, action: 'Recharge Now', icon: Wallet, color: 'red', path: '/balance', urgent: true };
    }
    if (autoApplyCount === 0) return { title: 'Enable Auto-Apply', description: 'Let AI automatically submit your applications', action: 'Enable', icon: Zap, color: 'primary', path: '/applications', urgent: false };
    return { title: 'AI Agent is Working', description: 'Your applications are monitored and processed', action: 'View Status', icon: CheckCircle2, color: 'black', path: '/applications', urgent: false };
  };

  const nextAction = getNextAction();
  const ActionIcon = nextAction.icon;

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
    // --- COLOR UPDATE: Main background gradient ---
    <div className="min-h-screen bg-gradient-to-br from-[#7C83FD]/100 via-white to-[#7C83FD]/100">
      <Header />

      <div className="w-full pt-24">
        <div className={`bg-white border-b border-slate-200/80 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="px-6 py-8">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div>
                {/* --- COLOR UPDATE: Welcome text --- */}
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                  Hello, <span className="bg-gradient-to-r from-[#7C83FD] to-[#96BAFF] bg-clip-text text-transparent">{student.first_name}</span>! 👋
                </h1>
                <p className="text-lg text-slate-500">
                  {totalApplications === 0 ? 'Let’s get you started on your university applications.' : `You have ${totalApplications} universities in your list.`}
                </p>
              </div>
              
              {/* --- COLOR UPDATE: Next Action CTA gradients --- */}
              <div className={`bg-gradient-to-r ${
                nextAction.color === 'primary' ? 'from-[#7C83FD] to-[#96BAFF]' :
                nextAction.color === 'red' ? 'from-red-500 to-orange-500' :
                nextAction.color === 'black' ? 'from-slate-800 to-slate-900' : // <-- ADD THIS LINE
      
                'from-[#7DEDFF] to-[#88FFF7]'
              } rounded-xl p-6 text-white shadow-lg min-w-[320px] ${nextAction.urgent ? 'ring-4 ring-red-300' : ''}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg"><ActionIcon size={24} /></div>
                  <h3 className="text-lg font-bold">{nextAction.title}</h3>
                </div>
                <p className={`${nextAction.color === 'blac' ? 'text-sky-900/80' : 'text-white/90'} text-sm mb-4`}>{nextAction.description}</p>
                <button
                  onClick={() => navigate(nextAction.path)}
                  className="w-full bg-white text-slate-800 hover:bg-[#88FFF7]/50 font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2"
                >
                  {nextAction.action} <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-8">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* --- COLOR UPDATE: Quick Status Cards --- */}
            <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#7C83FD] transition">
              <div className="flex items-center gap-3"><div className="p-3 bg-[#7C83FD]/10 rounded-xl"><BookOpen className="text-[#7C83FD]" size={24} /></div><div><p className="text-sm text-slate-500">Universities</p><p className="text-3xl font-bold text-slate-800">{totalApplications}</p></div></div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#96BAFF] transition">
              <div className="flex items-center gap-3"><div className="p-3 bg-[#96BAFF]/20 rounded-xl"><Wallet className="text-[#5170b0]" size={24} /></div><div><p className="text-sm text-slate-500">Balance</p><p className="text-3xl font-bold text-slate-800">৳{currentBalance.toLocaleString()}</p></div></div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#7C83FD] transition">
              <div className="flex items-center gap-3"><div className="p-3 bg-[#7C83FD]/10 rounded-xl"><Zap className="text-[#7C83FD]" size={24} /></div><div><p className="text-sm text-slate-500">Auto-Apply</p><p className="text-3xl font-bold text-slate-800">{autoApplyCount}/{totalApplications || 0}</p></div></div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#7DEDFF] transition">
              <div className="flex items-center gap-3"><div className="p-3 bg-[#7DEDFF]/30 rounded-xl relative"><Bell className="text-[#36b3c9]" size={24} />{unreadNotifications.length > 0 && (<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{unreadNotifications.length}</span>)}</div><div><p className="text-sm text-slate-500">Updates</p><p className="text-3xl font-bold text-slate-800">{unreadNotifications.length}</p></div></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* --- COLOR UPDATE: "What Happens Next?" steps --- */}
              {totalApplications > 0 && (
                <div className={`bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Bot className="text-[#7C83FD]" size={24} /> What Happens Next?</h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className={`p-5 rounded-xl border-2 transition-all ${currentBalance >= totalCost ? 'border-[#7DEDFF] bg-[#7DEDFF]/20' : 'border-[#96BAFF] bg-[#96BAFF]/20'}`}>
                      <div className="flex items-center gap-3 mb-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentBalance >= totalCost ? 'bg-[#7DEDFF]' : 'bg-[#96BAFF]'} text-white font-bold text-lg`}>{currentBalance >= totalCost ? <CheckCircle2 size={20} /> : '1'}</div><h3 className="font-bold text-slate-800 text-lg">Recharge</h3></div>
                      <p className="text-sm text-slate-700 mb-3">{currentBalance >= totalCost ? `Sufficient balance` : `Need ৳${(totalCost - currentBalance).toLocaleString()}`}</p>
                      {currentBalance < totalCost && (<button onClick={() => navigate('/balance')} className="text-sm text-[#5170b0] font-semibold hover:underline flex items-center gap-1">Add Money <ArrowRight size={14} /></button>)}
                    </div>
                    <div className={`p-5 rounded-xl border-2 transition-all ${autoApplyCount > 0 ? 'border-[#7DEDFF] bg-[#7DEDFF]/20' : 'border-[#7C83FD] bg-[#7C83FD]/20'}`}>
                      <div className="flex items-center gap-3 mb-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${autoApplyCount > 0 ? 'bg-[#7DEDFF]' : 'bg-[#7C83FD]'} text-white font-bold text-lg`}>{autoApplyCount > 0 ? <CheckCircle2 size={20} /> : '2'}</div><h3 className="font-bold text-slate-800 text-lg">Auto-Apply</h3></div>
                      <p className="text-sm text-slate-700 mb-3">{autoApplyCount > 0 ? `${autoApplyCount} enabled` : 'Enable submissions'}</p>
                      {autoApplyCount === 0 && (<button onClick={() => navigate('/applications')} className="text-sm text-[#7C83FD] font-semibold hover:underline flex items-center gap-1">Enable Now <ArrowRight size={14} /></button>)}
                    </div>
                    <div className={`p-5 rounded-xl border-2 transition-all ${autoApplyCount > 0 && currentBalance >= totalCost ? 'border-[#7DEDFF] bg-[#7DEDFF]/20' : 'border-slate-300 bg-slate-50'}`}>
                      <div className="flex items-center gap-3 mb-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${autoApplyCount > 0 && currentBalance >= totalCost ? 'bg-[#7DEDFF]' : 'bg-slate-400'} text-white font-bold text-lg`}>{autoApplyCount > 0 && currentBalance >= totalCost ? <Bot size={20} /> : '3'}</div><h3 className="font-bold text-slate-800 text-lg">AI Working</h3></div>
                      <p className="text-sm text-slate-700">{autoApplyCount > 0 && currentBalance >= totalCost ? 'Monitoring deadlines' : 'Pending setup'}</p>
                    </div>
                  </div>
                </div>
              )}

              {upcomingDeadlines.length > 0 && ( /* Keeping urgent colors as-is for UX */
                <div className={`bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Clock className="text-orange-600" size={24} /> Upcoming Deadlines</h2>
                  <div className="grid gap-4">{upcomingDeadlines.map((app) => {/* ... content ... */})}</div>
                </div>
              )}

              {totalApplications > 0 && (
                <div className={`transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <AdmissionCalendar applications={applications} />
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* --- COLOR UPDATE: Recent Activity --- */}
              {recentNotifications.length > 0 && (
                <div className={`bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Activity className="text-[#7C83FD]" size={24} /> Recent Activity</h2>
                  <div className="space-y-3">{recentNotifications.map((notif) => (
                      <div key={notif.id} className={`p-4 rounded-xl border-2 transition-all ${notif.read ? 'bg-slate-50/70 border-slate-200/80' : 'bg-[#96BAFF]/20 border-[#96BAFF]'}`}>
                        <p className="font-semibold text-slate-800 text-sm mb-1">{notif.title}</p>
                        <p className="text-xs text-slate-600 mb-2">{notif.message}</p>
                        {notif.circular_summary && (<div className="mt-2 p-2 bg-white rounded-lg border border-[#96BAFF]/50"><p className="text-xs font-semibold text-[#5170b0] mb-1">Summary:</p><p className="text-xs text-slate-600">{notif.circular_summary}</p></div>)}
                        <p className="text-xs text-slate-500 mt-2">{new Date(notif.created_at).toLocaleDateString()}</p>
                      </div>
                  ))}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}