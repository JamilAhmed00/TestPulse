import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentStorage, applicationStorage } from '../lib/storage';
import { mockUniversitiesFull } from '../lib/mockData';
import { Search, Filter, MapPin, Clock, CheckCircle2, ChevronDown, ChevronUp, Download, FileText, ExternalLink, Bot } from 'lucide-react';
import Header from '../components/Header';
import { downloadAdmissionCard } from '../lib/admissionCardGenerator';
import { Student, Application } from '../lib/supabase';

export default function Applications() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = () => {
      try {
        const studentData = studentStorage.getStudent();
        if (!studentData) {
          navigate('/register');
          return;
        }

        setStudent(studentData);
        setApplications(applicationStorage.getApplications());
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const filteredUniversities = mockUniversitiesFull.filter(uni => {
    const matchesSearch = uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         uni.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === 'all' || uni.competition_level === filterLevel;
    return matchesSearch && matchesFilter;
  });

  const isApplied = (uniId: string) => applications.some(a => a.university_id === uniId);
  const getApplicationStatus = (uniId: string) => applications.find(a => a.university_id === uniId)?.status;

  const handleToggleAutoApply = (uniId: string) => {
    const existing = applications.find(a => a.university_id === uniId);
    if (existing) {
      const updated = applications.map(a =>
        a.university_id === uniId
          ? { ...a, auto_apply_enabled: !a.auto_apply_enabled }
          : a
      );
      setApplications(updated);
      // Update in localStorage
      const appToUpdate = updated.find(a => a.university_id === uniId);
      if (appToUpdate) {
        applicationStorage.updateApplication(appToUpdate.id, { auto_apply_enabled: appToUpdate.auto_apply_enabled });
      }
    }
  };

  const handleApply = (uniId: string) => {
    if (!isApplied(uniId) && student) {
      const newApp: Application = {
        id: Date.now().toString(),
        student_id: student.id,
        university_id: uniId,
        status: 'pending',
        auto_apply_enabled: false,
        applied_at: null,
        result: null,
        marks_required: 60,
        marks_obtained: 0,
        transaction_id: null,
        admission_card_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [...applications, newApp];
      setApplications(updated);
      applicationStorage.addApplication(newApp);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-slate-600">Loading universities...</div>
        </div>
      </div>
    );
  }

  const totalApplications = applications.length;
  const hoursSaved = Math.round(totalApplications * 1.2);
  const manualTime = totalApplications * 1.2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7C83FD]/100 via-white to-[#7C83FD]/100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        {/* Problem Context Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 mb-8 text-white shadow-xl">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bot className="text-white" size={24} />
                <h2 className="text-2xl font-bold">70+ Universities</h2>
              </div>
              <p className="text-blue-100 text-sm">One Profile. One Platform.</p>
            </div>
            <div className="border-l border-r border-white/30 px-6">
              <div className="text-center">
                <div className="text-3xl font-extrabold mb-1">{totalApplications}</div>
                <div className="text-sm text-blue-100">Applications Selected</div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-yellow-300" size={24} />
                <h3 className="text-xl font-bold">Time Saved</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-yellow-300">{hoursSaved}h</span>
                <span className="text-sm text-blue-100">vs {manualTime.toFixed(1)}h manual</span>
              </div>
            </div>
          </div>
        </div>

        {/* Time Comparison Banner */}
        <div className="bg-white rounded-xl p-4 mb-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-red-600 font-bold text-lg">Without TestPulse</div>
                <div className="text-slate-600 text-sm">{manualTime.toFixed(1)} hours</div>
              </div>
              <div className="text-slate-400">→</div>
              <div className="text-center">
                <div className="text-green-600 font-bold text-lg">With TestPulse</div>
                <div className="text-slate-600 text-sm">5 minutes setup</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="text-green-600" size={18} />
              <span className="text-green-700 font-semibold text-sm">
                {hoursSaved} hours saved this season
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search universities or cities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Filter className="absolute left-3 top-3 text-slate-400" size={20} />
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Levels</option>
                  <option value="Low">Low Competition</option>
                  <option value="Medium">Medium Competition</option>
                  <option value="High">High Competition</option>
                  <option value="Very High">Very High Competition</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {filteredUniversities.length} universities • {applications.length} selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map(uni => {
              const applied = isApplied(uni.id);
              const status = getApplicationStatus(uni.id);
              const application = applications.find(a => a.university_id === uni.id);

              return (
                <div
                  key={uni.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition border border-slate-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-1 line-clamp-2">{uni.name}</h3>
                        <div className="flex items-center gap-1 text-slate-600 text-sm">
                          <MapPin size={16} /> {uni.city}
                        </div>
                      </div>
                      {applied && (
                        <div className="flex flex-col gap-1 items-end">
                          <div className={`text-xs font-semibold px-2 py-1 rounded ${
                            applications.find(a => a.university_id === uni.id)?.auto_apply_enabled
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {applications.find(a => a.university_id === uni.id)?.auto_apply_enabled
                              ? '🤖 AI Auto-Applied'
                              : '✋ Manual Required'}
                          </div>
                          <div className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                            {status === 'pending' ? 'Pending' : 'Applied'}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between text-slate-600">
                        <span>Acceptance Rate:</span>
                        <span className="font-semibold text-slate-900">{uni.acceptance_rate}%</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Competition:</span>
                        <span className={`font-semibold ${
                          uni.competition_level === 'Very High' ? 'text-red-600' :
                          uni.competition_level === 'High' ? 'text-orange-600' :
                          uni.competition_level === 'Medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {uni.competition_level}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>App. Fee:</span>
                        <span className="font-semibold text-slate-900">৳{uni.application_fee}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Deadline:</span>
                        <span className="font-semibold text-slate-900">
                          {new Date(uni.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {applied && (
                      <>
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={applications.find(a => a.university_id === uni.id)?.auto_apply_enabled || false}
                              onChange={() => handleToggleAutoApply(uni.id)}
                              className="w-4 h-4 rounded accent-blue-600"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-semibold text-slate-900 block">AI Auto-Apply</span>
                              <span className="text-xs text-slate-600">
                                {applications.find(a => a.university_id === uni.id)?.auto_apply_enabled
                                  ? 'AI will handle everything automatically'
                                  : 'You\'ll get notifications to apply manually'}
                              </span>
                            </div>
                          </label>
                          {applications.find(a => a.university_id === uni.id)?.auto_apply_enabled && (
                            <div className="mt-2 pt-2 border-t border-blue-200">
                              <div className="flex items-center gap-2 text-xs text-blue-700">
                                <Clock size={14} />
                                <span>Saved you ~1.2 hours of form filling</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Expand/Collapse Button */}
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedCards);
                            if (newExpanded.has(uni.id)) {
                              newExpanded.delete(uni.id);
                            } else {
                              newExpanded.add(uni.id);
                            }
                            setExpandedCards(newExpanded);
                          }}
                          className="w-full mb-4 flex items-center justify-between px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                        >
                          <span className="text-sm font-semibold text-slate-700">
                            {expandedCards.has(uni.id) ? 'Hide Details' : 'Show Details'}
                          </span>
                          {expandedCards.has(uni.id) ? (
                            <ChevronUp className="text-slate-600" size={18} />
                          ) : (
                            <ChevronDown className="text-slate-600" size={18} />
                          )}
                        </button>

                        {/* Expanded Content */}
                        {expandedCards.has(uni.id) && (
                          <div className="mb-4 space-y-4">
                            {/* Circular Section */}
                            {uni.circular_text && (
                              <div className="border-t border-slate-200 pt-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <FileText className="text-blue-600" size={20} />
                                  <h4 className="font-bold text-slate-900">Admission Circular</h4>
                                </div>
                                {uni.circular_url && (
                                  <a
                                    href={uni.circular_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 mb-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all text-sm"
                                  >
                                    <ExternalLink size={16} />
                                    View Full Circular
                                  </a>
                                )}
                                {uni.guidelines_url && (
                                  <a
                                    href={uni.guidelines_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 mb-3 ml-2 px-4 py-2 bg-white border-2 border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 font-semibold rounded-lg transition-all text-sm"
                                  >
                                    <FileText size={16} />
                                    Guidelines
                                  </a>
                                )}
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                  <p className="text-xs text-slate-700 whitespace-pre-wrap line-clamp-6">
                                    {uni.circular_text}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Download Admission Card */}
                            {application && (application.status === 'submitted' || application.status === 'under_review' || application.status === 'accepted') && student && (
                              <div className="border-t border-slate-200 pt-4">
                                <button
                                  onClick={() => {
                                    if (application && student) {
                                      downloadAdmissionCard(student, uni, application);
                                    }
                                  }}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                                >
                                  <Download size={18} />
                                  Download Admission Card
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex gap-2">
                      {!applied && (
                        <>
                          <button
                            onClick={() => navigate(`/apply?university=${uni.id}`)}
                            className="flex-1 py-2 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={18} />
                            Apply Now
                          </button>
                          <button
                            onClick={() => handleApply(uni.id)}
                            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                          >
                            Add to List
                          </button>
                        </>
                      )}
                      {applied && (
                        <button
                          className="w-full py-2 rounded-lg font-medium transition text-sm bg-slate-100 text-slate-700 cursor-default"
                          disabled
                        >
                          ✓ Added to Your List
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">University</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Competition</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Acceptance</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Fee</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Deadline</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUniversities.map(uni => {
                  const applied = isApplied(uni.id);

                  return (
                    <tr key={uni.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{uni.name}</p>
                          <p className="text-sm text-slate-600">{uni.city}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-semibold ${
                          uni.competition_level === 'Very High' ? 'text-red-600' :
                          uni.competition_level === 'High' ? 'text-orange-600' :
                          uni.competition_level === 'Medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {uni.competition_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">{uni.acceptance_rate}%</td>
                      <td className="px-6 py-4 text-sm text-slate-900">৳{uni.application_fee}</td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {new Date(uni.deadline).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {!applied && (
                            <>
                              <button
                                onClick={() => navigate(`/apply?university=${uni.id}`)}
                                className="text-sm px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all shadow-lg"
                              >
                                Apply
                              </button>
                              <button
                                onClick={() => handleApply(uni.id)}
                                className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                              >
                                Add
                              </button>
                            </>
                          )}
                          {applied && (
                            <span className="text-sm px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                              ✓ Added
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
