import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentStorage, authStorage } from '../lib/storage';
import { Edit2, Save, X } from 'lucide-react';
import Header from '../components/Header';

export default function Profile() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = () => {
      try {
        const currentUser = authStorage.getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);

        const studentData = studentStorage.getStudent();
        if (!studentData) {
          navigate('/register');
          return;
        }

        if (studentData) {
          setStudent(studentData);
          setFormData(studentData);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleSave = () => {
    setSaving(true);
    try {
      const updated = studentStorage.updateStudent(formData);
      if (updated) {
        setStudent(updated);
        setEditing(false);
      }
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-slate-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <p className="text-xl text-slate-600 mb-4">Profile not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                <Edit2 size={20} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFormData(student);
                    setEditing(false);
                  }}
                  className="flex items-center gap-2 bg-slate-300 hover:bg-slate-400 text-slate-800 font-semibold py-2 px-4 rounded-lg transition"
                >
                  <X size={20} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  <Save size={20} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {editing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-blue-900">You are now editing your profile. Make changes and click Save to update.</p>
            </div>
          )}

          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.first_name || ''}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">{student.first_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.last_name || ''}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">{student.last_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Father's Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.father_name || ''}
                      onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">{student.father_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mother's Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.mother_name || ''}
                      onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">{student.mother_name}</p>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  {editing ? (
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">{student.email}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mobile Number</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.mobile_number || ''}
                      onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">{student.mobile_number}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">{student.address}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">{student.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Unit</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.unit || ''}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">{student.unit}</p>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Academic Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">SSC Roll</label>
                  <p className="text-slate-900 font-medium">{student.ssc_roll}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">SSC Year</label>
                  <p className="text-slate-900 font-medium">{student.ssc_year}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">SSC Board</label>
                  <p className="text-slate-900 font-medium">{student.ssc_board}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">HSC Roll</label>
                  <p className="text-slate-900 font-medium">{student.hsc_roll}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">HSC Year</label>
                  <p className="text-slate-900 font-medium">{student.hsc_year}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">HSC Board</label>
                  <p className="text-slate-900 font-medium">{student.hsc_board}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">HSC Registration Number</label>
                  <p className="text-slate-900 font-medium">{student.hsc_registration_number}</p>
                </div>
              </div>
            </section>

            <section className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Account Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email (Account)</label>
                  <p className="text-slate-900 font-medium">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Registration Date</label>
                  <p className="text-slate-900 font-medium">
                    {new Date(student.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
