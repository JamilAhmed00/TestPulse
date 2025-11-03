import { Menu, X, Bot, Activity, LayoutDashboard, BookOpen, BarChart3, ArrowRight, Bell, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authStorage, notificationStorage } from '../lib/storage';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = authStorage.getCurrentUser();
  const showNav = !!user && location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const unreadCount = user ? notificationStorage.getUnreadCount() : 0;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Applications', path: '/applications', icon: BookOpen },
    { label: 'Results', path: '/results', icon: BarChart3 },
    { label: 'Circulars', path: '/circulars', icon: FileText },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
  ];

  const handleLogout = () => {
    authStorage.signOut();
    navigate('/');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-lg shadow-slate-900/5' 
        : 'bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm'
    }`}>
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            to="/"
            className="flex items-center gap-3 group cursor-pointer transition-transform hover:scale-105"
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
              
              {/* Icon Container */}
              <div className="relative bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 p-2.5 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/50 transition-all">
                <Bot className="text-white relative z-10" size={26} />
                
                {/* Inner Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 to-blue-400/30 rounded-2xl blur-sm"></div>
              </div>
              
              {/* Pulse Indicator */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg">
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  TestPulse
                </span>
                {!showNav && (
                  <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/60 rounded-full shadow-sm">
                    <Activity className="text-blue-600" size={12} />
                    <span className="text-xs font-bold text-blue-700">AI Active</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">Your Smart Admission Ally</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {showNav && (
                  <nav className="hidden md:flex items-center gap-1">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`group relative px-4 py-2.5 font-medium transition-all rounded-xl flex items-center gap-2 ${
                              isActive
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/80'
                            }`}
                          >
                            <Icon className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} size={18} />
                            <span>{item.label}</span>
                            {item.badge && item.badge > 0 && (
                              <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center">
                                {item.badge > 99 ? '99+' : item.badge}
                              </span>
                            )}
                            {isActive && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                            )}
                          </Link>
                        );
                      })}
                    </nav>
          )}

          {/* CTA Buttons for Landing Page */}
          {!showNav && !user && (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="px-5 py-2.5 text-slate-700 hover:text-blue-600 font-semibold transition-colors rounded-xl hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-20 blur-xl rounded-xl transition-opacity"></div>
              </Link>
            </div>
          )}

          {/* Logout Button for Authenticated Users */}
          {showNav && user && (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/profile"
                className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors rounded-xl hover:bg-blue-50"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-slate-700 hover:text-red-600 font-medium transition-colors rounded-xl hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative p-2.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={24} className="transition-transform rotate-90" />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-6 border-t border-slate-200/80 mt-4 pt-6 animate-in slide-in-from-top-2">
            {showNav ? (
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                        isActive
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-slate-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50'
                      }`}
                    >
                      <Icon className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} size={20} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                >
                  Logout
                </button>
              </nav>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-left text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group relative px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-between"
                >
                  <span>Get Started</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
