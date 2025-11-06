import Header from '../components/Header';
import Footer from '../components/Footer';
import { CheckCircle, Info } from 'lucide-react';

// Mock data for admission calls
const admissionCalls = [
  {
    id: 1,
    university: "Dhaka University (DU)",
    department: "Computer Science and Engineering (CSE)",
    rankRange: "20 to 200",
    studentMeritPosition: 110,
    isEligible: true,
  },
  {
    id: 2,
    university: "BUET",
    department: "Electrical and Electronic Engineering (EEE)",
    rankRange: "1 to 50",
    studentMeritPosition: 25,
    isEligible: true,
  },
  {
    id: 3,
    university: "Jahangirnagar University (JU)",
    department: "Biotechnology and Genetic Engineering",
    rankRange: "50 to 150",
    studentMeritPosition: 200,
    isEligible: false,
  },
    {
    id: 4,
    university: "University of Chittagong (CU)",
    department: "Marine Science",
    rankRange: "100 to 300",
    studentMeritPosition: 430,
    isEligible: false,
  },
];

export default function CallForAdmission() {
  // Assuming the student's merit position is 45 for this example
  //const studentMeritPosition = 245;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-800">University Admission Calls</h1>
          <p className="text-slate-600 mt-2">
            Based on your merit position of <span className="font-bold text-blue-600"></span>, here are the universities calling for admission.
          </p>
        </div>

        <div className="space-y-6">
          {admissionCalls.map(call => (
            <div
              key={call.id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden border-l-8 ${
                call.isEligible ? 'border-green-500' : 'border-slate-300'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{call.university}</h2>
                    <p className="text-md text-slate-700 font-medium mt-1">{call.department}</p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                      call.isEligible
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {call.isEligible ? <CheckCircle size={14} /> : <Info size={14} />}
                    {call.isEligible ? 'You are Eligible' : 'Not in Range'}
                  </div>
                </div>

                {/* === THIS IS THE ONLY PART THAT HAS BEEN ADDED === */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <p className="text-sm font-bold">
                    <span className="text-slate-600">Your Position: </span>
                    <span className="text-blue-600 text-base font-extrabold">{call.studentMeritPosition}</span>
                    <span className="text-slate-300 mx-2 font-light">|</span>
                    <span className="text-slate-600">Currently Calling: </span>
                    <span className={`text-base font-extrabold ${call.isEligible ? 'text-green-600' : 'text-red-500'}`}>
                      {call.rankRange}
                    </span>
                  </p>
                </div>
                {/* === END OF THE ADDED SECTION === */}

                <div className="mt-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-md">
                  <p>
                    <span className="font-semibold">{call.university}</span> is calling students with a merit position rank from <span className="font-bold text-blue-600">{call.rankRange}</span> for the <span className="font-semibold">{call.department}</span> department.
                  </p>
                </div>
                
                {call.isEligible && (
                  <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg shadow-inner">
                    <p className="font-bold text-lg">
                      🎉 Congratulations, you are selected for {call.department} at {call.university}.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}