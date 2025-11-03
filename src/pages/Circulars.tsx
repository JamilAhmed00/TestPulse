import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Filter, CheckCircle2, XCircle } from 'lucide-react';
import Header from '../components/Header';
import CircularCard from '../components/CircularCard';
import { authStorage, applicationStorage } from '../lib/storage';
import { mockUniversitiesFull } from '../lib/mockData';
import { Application } from '../lib/supabase';

type FilterType = 'all' | 'new' | 'applied' | 'closed';

export default function Circulars() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authStorage.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }

    const loadData = () => {
      try {
        setApplications(applicationStorage.getApplications());
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleAddToList = (universityId: string) => {
    navigate(`/applications?university=${universityId}`);
  };

  const filteredUniversities = useMemo(() => {
    let filtered = mockUniversitiesFull;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(uni =>
        uni.name.toLowerCase().includes(query) ||
        uni.city.toLowerCase().includes(query) ||
        uni.description.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filter === 'applied') {
      filtered = filtered.filter(uni =>
        applications.some(app => app.university_id === uni.id)
      );
    } else if (filter === 'closed') {
      filtered = filtered.filter(uni => {
        const deadline = new Date(uni.deadline);
        return deadline.getTime() < Date.now();
      });
    } else if (filter === 'new') {
      filtered = filtered.filter(uni => {
        const deadline = new Date(uni.deadline);
        const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntil > 7 && !applications.some(app => app.university_id === uni.id);
      });
    }

    // Sort by deadline (upcoming first)
    return filtered.sort((a, b) => {
      const deadlineA = new Date(a.deadline).getTime();
      const deadlineB = new Date(b.deadline).getTime();
      return deadlineA - deadlineB;
    });
  }, [searchQuery, filter, applications]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] pt-28">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading circulars...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Header />

      <div className="py-8 pt-28 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="text-blue-600" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">University Circulars</h1>
                <p className="text-slate-600">
                  Browse all admission circulars and guidelines
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search universities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                {[
                  { value: 'all' as FilterType, label: 'All', count: mockUniversitiesFull.length },
                  { value: 'new' as FilterType, label: 'New', count: mockUniversitiesFull.filter(uni => {
                    const deadline = new Date(uni.deadline);
                    const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return daysUntil > 7 && !applications.some(app => app.university_id === uni.id);
                  }).length },
                  { value: 'applied' as FilterType, label: 'Applied', count: applications.length },
                  { value: 'closed' as FilterType, label: 'Closed', count: mockUniversitiesFull.filter(uni => {
                    const deadline = new Date(uni.deadline);
                    return deadline.getTime() < Date.now();
                  }).length },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
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
            </div>
          </div>

          {/* Circulars Grid */}
          {filteredUniversities.length === 0 ? (
            <div className="bg-white rounded-xl p-12 border-2 border-slate-200 text-center">
              <FileText className="text-slate-400 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-700 mb-2">No circulars found</h3>
              <p className="text-slate-500">
                {searchQuery 
                  ? `No universities match "${searchQuery}". Try a different search term.`
                  : 'No circulars match the selected filter.'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredUniversities.map((university) => {
                const application = applications.find(app => app.university_id === university.id);
                return (
                  <CircularCard
                    key={university.id}
                    university={university}
                    application={application || null}
                    onAddToList={() => handleAddToList(university.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

