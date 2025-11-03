import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authStorage, studentStorage } from '../lib/storage';
import { Student } from '../lib/supabase';
import Header from '../components/Header';
import { ChevronRight, ChevronLeft, Mail, Lock, CheckCircle, Loader } from 'lucide-react';

type RegistrationStep = 'auth' | 'credentials' | 'eligibility' | 'personal' | 'preferences' | 'complete';

export default function RegistrationFlow() {
  const navigate = useNavigate();
  const [user] = useState(() => authStorage.getCurrentUser());
  const [step, setStep] = useState<RegistrationStep>(user ? 'credentials' : 'auth');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [eligibleUniversities, setEligibleUniversities] = useState<number>(0);

  const [auth, setAuth] = useState({ email: '', password: '' });
  const [credentials, setCredentials] = useState({
    ssc_roll: '',
    ssc_year: new Date().getFullYear(),
    ssc_board: '',
    hsc_roll: '',
    hsc_year: new Date().getFullYear(),
    hsc_board: '',
    hsc_registration_number: '',
  });
  const [personal, setPersonal] = useState({
    first_name: '',
    last_name: '',
    father_name: '',
    mother_name: '',
    email: '',
    mobile_number: '',
    address: '',
    city: '',
    unit: '',
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!auth.email || !auth.password) {
        throw new Error('Email and password are required');
      }

      const newUser = authStorage.signUp(auth.email, auth.password);
      setStep('credentials');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step === 'credentials') {
      if (!credentials.ssc_roll || !credentials.hsc_roll || !credentials.hsc_registration_number) {
        setError('Please fill all credential fields');
        return;
      }
      // Show eligibility verification
      setStep('eligibility');
      await verifyEligibility();
    } else if (step === 'eligibility') {
      setStep('personal');
    } else if (step === 'personal') {
      if (!personal.first_name || !personal.email || !personal.mobile_number) {
        setError('Please fill all personal fields');
        return;
      }
      setStep('preferences');
    } else if (step === 'preferences') {
      handleComplete();
    }
    setError('');
  };

  const verifyEligibility = async () => {
    setVerifying(true);
    // Simulate API call to Education Board
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock eligibility check - in real app, this would call Education Board API
    // For demo, assume student is eligible for most universities
    const mockEligibleCount = Math.floor(Math.random() * 40) + 30; // 30-70 universities
    setEligibleUniversities(mockEligibleCount);
    setVerifying(false);
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      const currentUser = authStorage.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');

      // Calculate mock marks based on unit (for demo purposes)
      const mockHscMarks = personal.unit === 'Science' ? 75 : personal.unit === 'Commerce' ? 72 : 70;
      const mockSscMarks = mockHscMarks - 5;

      const studentData: Student = {
        id: `student_${Date.now()}`,
        user_id: currentUser.id,
        ...credentials,
        ...personal,
        ssc_marks: mockSscMarks,
        hsc_marks: mockHscMarks,
        registration_completed: true,
        current_balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      studentStorage.saveStudent(studentData);
      setStep('complete');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'auth':
        return (
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-slate-900">Create Your Account</h2>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input
                    type="email"
                    value={auth.email}
                    onChange={(e) => setAuth({ ...auth, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input
                    type="password"
                    value={auth.password}
                    onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-2 rounded-lg transition"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>
        );

      case 'credentials':
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-2 text-slate-900">Step 1: Academic Credentials</h2>
            <p className="text-slate-600 mb-8">Enter your SSC and HSC examination details. This information will be used for all your university applications.</p>
            <div className="grid md:grid-cols-2 gap-4 space-y-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">SSC Board</label>
                <input
                  type="text"
                  value={credentials.ssc_board}
                  onChange={(e) => setCredentials({ ...credentials, ssc_board: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Dhaka Board"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">SSC Roll Number</label>
                <input
                  type="text"
                  value={credentials.ssc_roll}
                  onChange={(e) => setCredentials({ ...credentials, ssc_roll: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">SSC Year</label>
                <input
                  type="number"
                  value={credentials.ssc_year}
                  onChange={(e) => setCredentials({ ...credentials, ssc_year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">HSC Board</label>
                <input
                  type="text"
                  value={credentials.hsc_board}
                  onChange={(e) => setCredentials({ ...credentials, hsc_board: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Dhaka Board"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">HSC Roll Number</label>
                <input
                  type="text"
                  value={credentials.hsc_roll}
                  onChange={(e) => setCredentials({ ...credentials, hsc_roll: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="654321"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">HSC Year</label>
                <input
                  type="number"
                  value={credentials.hsc_year}
                  onChange={(e) => setCredentials({ ...credentials, hsc_year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">HSC Registration Number</label>
                <input
                  type="text"
                  value={credentials.hsc_registration_number}
                  onChange={(e) => setCredentials({ ...credentials, hsc_registration_number: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="REG123456"
                />
              </div>
            </div>
            {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep('auth')}
                className="flex items-center gap-2 px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                <ChevronLeft size={20} /> Back
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 ml-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Next <ChevronRight size={20} />
              </button>
            </div>
          </div>
        );

      case 'eligibility':
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-2 text-slate-900">Verifying Eligibility</h2>
            <p className="text-slate-600 mb-8">Checking your eligibility with Education Board...</p>
            
            {verifying ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
                <p className="text-blue-900 font-medium">Verifying your credentials...</p>
                <p className="text-blue-700 text-sm mt-2">This may take a few moments</p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-8">
                <div className="flex items-start gap-4">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={32} />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-2 text-lg">Eligibility Verified!</h3>
                    <p className="text-green-800 mb-4">
                      Based on your HSC credentials, you are eligible to apply to <strong>{eligibleUniversities}+ universities</strong>.
                    </p>
                    <p className="text-sm text-green-700">
                      ✓ Credentials verified with Education Board<br />
                      ✓ Eligible universities identified<br />
                      ✓ Ready to proceed with registration
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep('credentials')}
                className="flex items-center gap-2 px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                <ChevronLeft size={20} /> Back
              </button>
              {!verifying && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 ml-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Continue <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        );

      case 'personal':
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-2 text-slate-900">Step 3: Personal Information</h2>
            <p className="text-slate-600 mb-8">Tell us about yourself</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={personal.first_name}
                  onChange={(e) => setPersonal({ ...personal, first_name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={personal.last_name}
                  onChange={(e) => setPersonal({ ...personal, last_name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Father's Name</label>
                <input
                  type="text"
                  value={personal.father_name}
                  onChange={(e) => setPersonal({ ...personal, father_name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mother's Name</label>
                <input
                  type="text"
                  value={personal.mother_name}
                  onChange={(e) => setPersonal({ ...personal, mother_name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={personal.email}
                  onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Mobile Number</label>
                <input
                  type="tel"
                  value={personal.mobile_number}
                  onChange={(e) => setPersonal({ ...personal, mobile_number: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                <input
                  type="text"
                  value={personal.address}
                  onChange={(e) => setPersonal({ ...personal, address: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                <input
                  type="text"
                  value={personal.city}
                  onChange={(e) => setPersonal({ ...personal, city: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Unit (Science/Commerce/Arts)</label>
                <select
                  value={personal.unit}
                  onChange={(e) => setPersonal({ ...personal, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Unit</option>
                  <option value="Science">Science</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>
            </div>
            {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep('credentials')}
                className="flex items-center gap-2 px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                <ChevronLeft size={20} /> Back
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 ml-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Next <ChevronRight size={20} />
              </button>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-2 text-slate-900">Step 4: Almost Done!</h2>
            <p className="text-slate-600 mb-8">You'll select your interested universities next. Your one-time registration is complete—this data will be reused for all applications.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Complete your registration</li>
                <li>✓ Browse and select universities with smart recommendations</li>
                <li>✓ Enable auto-apply for universities you like</li>
                <li>✓ Recharge your balance via bKash/Nagad</li>
                <li>✓ Let our AI agent handle the rest—24/7 automation!</li>
              </ul>
            </div>
            {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
            <div className="flex gap-4">
              <button
                onClick={() => setStep('personal')}
                className="flex items-center gap-2 px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                <ChevronLeft size={20} /> Back
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 ml-auto bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg"
              >
                {loading ? 'Completing...' : 'Complete Registration'} <ChevronRight size={20} />
              </button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Registration Complete!</h2>
            <p className="text-slate-600 mb-8">Welcome to TestPulse! You're all set to start exploring universities and managing your applications. Your AI agent is ready to help.</p>
            <p className="text-sm text-slate-500">Redirecting to dashboard...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step !== 'complete' && (
          <div className="mb-12">
            <div className="flex justify-between mb-4">
            {['auth', 'credentials', 'eligibility', 'personal', 'preferences'].map((s, idx) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full mx-1 transition ${
                  ['auth', 'credentials', 'eligibility', 'personal', 'preferences'].indexOf(step) >= idx
                    ? 'bg-blue-600'
                    : 'bg-slate-300'
                }`}
              ></div>
            ))}
            </div>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-md p-8">{renderStep()}</div>
      </div>
    </div>
  );
}
