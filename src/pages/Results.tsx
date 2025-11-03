import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentStorage, applicationStorage } from '../lib/storage';
import { mockExamResults, mockUniversitiesFull } from '../lib/mockData';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import Header from '../components/Header';

export default function Results() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        const studentData = studentStorage.getStudent();
        if (!studentData) {
          navigate('/register');
          return;
        }

        if (studentData) {
          setStudent(studentData);
          setExamResults(mockExamResults(studentData.id));
          setApplications(applicationStorage.getApplications());
        }
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
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-slate-600">Loading results...</div>
        </div>
      </div>
    );
  }

  const acceptedCount = applications.filter(a => a.status === 'accepted').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;
  const underReviewCount = applications.filter(a => a.status === 'under_review').length;

  const avgMarks = examResults.length > 0
    ? (examResults.reduce((sum, r) => sum + r.obtained_marks, 0) / examResults.length).toFixed(1)
    : 0;

  const passedExams = examResults.filter(r => r.passed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <p className="text-slate-600 text-sm mb-2">Average Marks</p>
            <p className="text-3xl font-bold text-slate-900">{avgMarks}</p>
            <p className="text-xs text-slate-600 mt-2">out of 100</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <p className="text-slate-600 text-sm mb-2">Exams Passed</p>
            <p className="text-3xl font-bold text-slate-900">{passedExams}/{examResults.length}</p>
            <p className="text-xs text-slate-600 mt-2">Success rate</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <p className="text-slate-600 text-sm mb-2">Applications</p>
            <p className="text-3xl font-bold text-slate-900">{applications.length}</p>
            <p className="text-xs text-slate-600 mt-2">Total submitted</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
            <p className="text-slate-600 text-sm mb-2">Under Review</p>
            <p className="text-3xl font-bold text-slate-900">{underReviewCount}</p>
            <p className="text-xs text-slate-600 mt-2">Pending decisions</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={24} />
              Exam Results
            </h2>
            <div className="space-y-4">
              {examResults.length === 0 ? (
                <p className="text-slate-600 text-center py-8">No exam results available yet</p>
              ) : (
                examResults.map((result, idx) => (
                  <div key={result.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{result.exam_name}</h3>
                        <p className="text-sm text-slate-600">
                          {new Date(result.exam_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        result.passed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {result.passed ? 'Passed' : 'Not Passed'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Score</span>
                        <span className="font-semibold text-slate-900">
                          {result.obtained_marks}/{result.total_marks}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition"
                          style={{ width: `${(result.obtained_marks / result.total_marks) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-sm font-semibold text-slate-900">
                        {result.percentage}%
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <PieChartIcon className="text-purple-600" size={24} />
              Application Status
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">Accepted</span>
                  <span className="text-sm font-bold text-green-600">{acceptedCount}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${applications.length > 0 ? (acceptedCount / applications.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">Under Review</span>
                  <span className="text-sm font-bold text-blue-600">{underReviewCount}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${applications.length > 0 ? (underReviewCount / applications.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">Rejected</span>
                  <span className="text-sm font-bold text-red-600">{rejectedCount}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full"
                    style={{ width: `${applications.length > 0 ? (rejectedCount / applications.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Overall Success Rate</p>
                <p className="text-3xl font-bold text-slate-900">
                  {applications.length > 0 ? ((acceptedCount / applications.length) * 100).toFixed(0) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="text-orange-600" size={24} />
            Detailed Application Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">University</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Your Marks</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Required</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {applications.map(app => {
                  const uni = mockUniversitiesFull.find(u => u.id === app.university_id);
                  const statusColors = {
                    accepted: 'bg-green-100 text-green-700',
                    rejected: 'bg-red-100 text-red-700',
                    under_review: 'bg-blue-100 text-blue-700',
                    submitted: 'bg-purple-100 text-purple-700',
                    pending: 'bg-yellow-100 text-yellow-700',
                  };

                  return (
                    <tr key={app.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-medium text-slate-900">{uni?.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[app.status as keyof typeof statusColors]}`}>
                          {app.status.replace('_', ' ').charAt(0).toUpperCase() + app.status.replace('_', ' ').slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900">{app.marks_obtained}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{app.marks_required}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Not yet'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
