import { University, Application, ExamResult, Transaction, Notification } from './supabase';
import { generateCircularSummary, formatCircularSummary } from './circularSummary';

const generateDeadline = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
};

const generateTransactionId = (): string => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `TXN-${dateStr}-${random}`;
};

const competitionLevels = ['Low', 'Medium', 'High', 'Very High'];

// Helper to generate circular text and summary
const generateCircularData = (universityName: string, deadline: Date) => {
  const deadlineStr = deadline.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const examDate = new Date(deadline);
  examDate.setDate(examDate.getDate() + 20);
  const examDateStr = examDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const circularText = `
${universityName} Admission Circular 2024

Admission Notice for Undergraduate Programs

${universityName} is pleased to announce the admission process for the academic year 2024-2025.

IMPORTANT DATES:
- Application Start Date: ${new Date(deadline.getTime() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
- Application Deadline: ${deadlineStr}
- Admission Test Date: ${examDateStr}
- Result Publication: Will be announced later

ELIGIBILITY CRITERIA:
- Must have passed HSC/equivalent examination
- Minimum GPA requirement: 3.50 in both SSC and HSC
- For Science unit: Physics, Chemistry, Mathematics required
- For Commerce unit: Accounting, Business Studies required
- For Arts unit: Bangla, English required

REQUIRED DOCUMENTS:
1. SSC Certificate (attested copy)
2. HSC Certificate (attested copy)
3. SSC Marksheet (attested copy)
4. HSC Marksheet (attested copy)
5. Passport size photograph (4 copies)
6. National ID Card (photocopy)
7. Character Certificate
8. Medical Certificate

APPLICATION PROCESS:
- Online application available through university website
- Application fee: To be paid through bKash/Nagad
- Fill all required information accurately
- Upload scanned copies of documents
- Pay application fee before deadline

SELECTION PROCESS:
- Admission test will be conducted
- Selection based on merit list
- Combined score of HSC marks and admission test

For more information, visit: www.university.edu.bd/admission

Note: Application fee is non-refundable. Submit applications before the deadline to avoid rejection.
  `.trim();
  
  const summary = generateCircularSummary(circularText);
  
  return {
    circular_url: `https://www.${universityName.toLowerCase().replace(/\s+/g, '')}.edu.bd/admission/circular-2024`,
    circular_text: circularText,
    guidelines_url: `https://www.${universityName.toLowerCase().replace(/\s+/g, '')}.edu.bd/admission/guidelines`,
    circular_summary: formatCircularSummary(summary),
  };
};

export const mockUniversities: University[] = [
  (() => {
    const deadline = new Date(generateDeadline(45));
    const circularData = generateCircularData('Dhaka University', deadline);
    return {
      id: '1',
      name: 'Dhaka University',
      city: 'Dhaka',
      established_year: 1921,
      acceptance_rate: 8,
      competition_level: 'Very High',
      application_fee: 500,
      deadline: deadline.toISOString(),
      description: 'Leading university in Bangladesh',
      website: 'www.du.ac.bd',
      circular_url: circularData.circular_url,
      circular_text: circularData.circular_text,
      guidelines_url: circularData.guidelines_url,
      created_at: new Date().toISOString(),
    };
  })(),
  (() => {
    const deadline = new Date(generateDeadline(30));
    const circularData = generateCircularData('BUET', deadline);
    return {
      id: '2',
      name: 'Bangladesh University of Engineering and Technology',
      city: 'Dhaka',
      established_year: 1912,
      acceptance_rate: 6,
      competition_level: 'Very High',
      application_fee: 750,
      deadline: deadline.toISOString(),
      description: 'Premier engineering university',
      website: 'www.buet.ac.bd',
      circular_url: circularData.circular_url,
      circular_text: circularData.circular_text,
      guidelines_url: circularData.guidelines_url,
      created_at: new Date().toISOString(),
    };
  })(),
  (() => {
    const deadline = new Date(generateDeadline(50));
    const circularData = generateCircularData('University of Rajshahi', deadline);
    return {
      id: '3',
      name: 'University of Rajshahi',
      city: 'Rajshahi',
      established_year: 1953,
      acceptance_rate: 15,
      competition_level: 'High',
      application_fee: 400,
      deadline: deadline.toISOString(),
      description: 'Historic university in Rajshahi',
      website: 'www.ru.ac.bd',
      circular_url: circularData.circular_url,
      circular_text: circularData.circular_text,
      guidelines_url: circularData.guidelines_url,
      created_at: new Date().toISOString(),
    };
  })(),
  (() => {
    const deadline = new Date(generateDeadline(55));
    const circularData = generateCircularData('Jahangirnagar University', deadline);
    return {
      id: '4',
      name: 'Jahangirnagar University',
      city: 'Dhaka',
      established_year: 1970,
      acceptance_rate: 12,
      competition_level: 'High',
      application_fee: 450,
      deadline: deadline.toISOString(),
      description: 'Known for humanities and sciences',
      website: 'www.juniv.edu.bd',
      circular_url: circularData.circular_url,
      circular_text: circularData.circular_text,
      guidelines_url: circularData.guidelines_url,
      created_at: new Date().toISOString(),
    };
  })(),
  (() => {
    const deadline = new Date(generateDeadline(48));
    const circularData = generateCircularData('Chittagong University', deadline);
    return {
      id: '5',
      name: 'Chittagong University',
      city: 'Chattogram',
      established_year: 1966,
      acceptance_rate: 14,
      competition_level: 'High',
      application_fee: 400,
      deadline: deadline.toISOString(),
      description: 'Major university in eastern Bangladesh',
      website: 'www.cu.ac.bd',
      circular_url: circularData.circular_url,
      circular_text: circularData.circular_text,
      guidelines_url: circularData.guidelines_url,
      created_at: new Date().toISOString(),
    };
  })(),
  (() => {
    const deadline = new Date(generateDeadline(60));
    const circularData = generateCircularData('Islamic University', deadline);
    return {
      id: '6',
      name: 'Islamic University',
      city: 'Kushtia',
      established_year: 1979,
      acceptance_rate: 18,
      competition_level: 'Medium',
      application_fee: 350,
      deadline: deadline.toISOString(),
      description: 'University with Islamic values',
      website: 'www.iu.ac.bd',
      circular_url: circularData.circular_url,
      circular_text: circularData.circular_text,
      guidelines_url: circularData.guidelines_url,
      created_at: new Date().toISOString(),
    };
  })(),
  (() => {
    const deadline = new Date(generateDeadline(52));
    const circularData = generateCircularData('Khulna University', deadline);
    return {
      id: '7',
      name: 'Khulna University',
      city: 'Khulna',
      established_year: 1987,
      acceptance_rate: 20,
      competition_level: 'Medium',
      application_fee: 350,
      deadline: deadline.toISOString(),
      description: 'Engineering and technology focused',
      website: 'www.ku.ac.bd',
      circular_url: circularData.circular_url,
      circular_text: circularData.circular_text,
      guidelines_url: circularData.guidelines_url,
      created_at: new Date().toISOString(),
    };
  })(),
  (() => {
    const deadline = new Date(generateDeadline(58));
    const circularData = generateCircularData('Bangladesh Agricultural University', deadline);
    return {
      id: '8',
      name: 'Bangladesh Agricultural University',
      city: 'Mymensingh',
      established_year: 1961,
      acceptance_rate: 22,
      competition_level: 'Medium',
      application_fee: 300,
      deadline: deadline.toISOString(),
      description: 'Leading agricultural university',
      website: 'www.bau.edu.bd',
      circular_url: circularData.circular_url,
      circular_text: circularData.circular_text,
      guidelines_url: circularData.guidelines_url,
      created_at: new Date().toISOString(),
    };
  })(),
  (() => {
    const deadline = new Date(generateDeadline(62));
    const circularData = generateCircularData('Sylhet Agricultural University', deadline);
    return {
      id: '9',
      name: 'Sylhet Agricultural University',
      city: 'Sylhet',
      established_year: 2001,
      acceptance_rate: 25,
      competition_level: 'Low',
      application_fee: 300,
      deadline: deadline.toISOString(),
      description: 'Agriculture and rural development',
      website: 'www.sau.ac.bd',
      circular_url: circularData.circular_url,
      circular_text: circularData.circular_text,
      guidelines_url: circularData.guidelines_url,
      created_at: new Date().toISOString(),
    };
  })(),
  (() => {
    const deadline = new Date(generateDeadline(65));
    const circularData = generateCircularData('Comilla University', deadline);
    return {
      id: '10',
      name: 'Comilla University',
      city: 'Cumilla',
      established_year: 2010,
      acceptance_rate: 28,
      competition_level: 'Low',
      application_fee: 300,
      deadline: deadline.toISOString(),
      description: 'Newer university with growing reputation',
      website: 'www.comu.ac.bd',
      circular_url: circularData.circular_url,
      circular_text: circularData.circular_text,
      guidelines_url: circularData.guidelines_url,
      created_at: new Date().toISOString(),
    };
  })(),
];

// Helper to add circular data to university objects
const addCircularDataToUniversity = (uni: Omit<University, 'circular_url' | 'circular_text' | 'guidelines_url'>): University => {
  const deadline = new Date(uni.deadline);
  const circularData = generateCircularData(uni.name, deadline);
  return {
    ...uni,
    circular_url: circularData.circular_url,
    circular_text: circularData.circular_text,
    guidelines_url: circularData.guidelines_url,
  };
};

export const mockUniversitiesFull: University[] = [
  ...mockUniversities,
  ...[
    { id: '11', name: 'Rangpur University', city: 'Rangpur', established_year: 2013, acceptance_rate: 30, competition_level: 'Low', application_fee: 300, deadline: generateDeadline(65), description: 'Regional university', website: 'www.ru-rng.ac.bd', created_at: new Date().toISOString() },
    { id: '12', name: 'Jessore University of Science and Technology', city: 'Jessore', established_year: 2009, acceptance_rate: 32, competition_level: 'Low', application_fee: 300, deadline: generateDeadline(65), description: 'Science and technology focus', website: 'www.just.edu.bd', created_at: new Date().toISOString() },
    { id: '13', name: 'Hajee Mohammad Danesh Science and Technology University', city: 'Dinajpur', established_year: 2003, acceptance_rate: 28, competition_level: 'Low', application_fee: 300, deadline: generateDeadline(65), description: 'STEM focused university', website: 'www.hstu.ac.bd', created_at: new Date().toISOString() },
    { id: '14', name: 'Mawlana Bhashani Science and Technology University', city: 'Tangail', established_year: 1999, acceptance_rate: 26, competition_level: 'Low', application_fee: 300, deadline: generateDeadline(65), description: 'Science and technology', website: 'www.mbstu.ac.bd', created_at: new Date().toISOString() },
    { id: '15', name: 'Patuakhali Science and Technology University', city: 'Patuakhali', established_year: 2006, acceptance_rate: 30, competition_level: 'Low', application_fee: 300, deadline: generateDeadline(65), description: 'Agricultural science focus', website: 'www.pstu.ac.bd', created_at: new Date().toISOString() },
    { id: '16', name: 'Sher-e-Bangla Agricultural University', city: 'Dhaka', established_year: 1961, acceptance_rate: 24, competition_level: 'Medium', application_fee: 350, deadline: generateDeadline(60), description: 'Agriculture focused', website: 'www.sau.edu.bd', created_at: new Date().toISOString() },
    { id: '17', name: 'Bangladesh Open University', city: 'Dhaka', established_year: 1992, acceptance_rate: 50, competition_level: 'Low', application_fee: 200, deadline: generateDeadline(70), description: 'Distance learning university', website: 'www.bou.edu.bd', created_at: new Date().toISOString() },
    { id: '18', name: 'American International University Bangladesh', city: 'Dhaka', established_year: 1994, acceptance_rate: 40, competition_level: 'Medium', application_fee: 1000, deadline: generateDeadline(65), description: 'Private university', website: 'www.aiub.edu', created_at: new Date().toISOString() },
    { id: '19', name: 'BRAC University', city: 'Dhaka', established_year: 2001, acceptance_rate: 35, competition_level: 'Medium', application_fee: 800, deadline: generateDeadline(65), description: 'Leading private university', website: 'www.bracu.ac.bd', created_at: new Date().toISOString() },
    { id: '20', name: 'East West University', city: 'Dhaka', established_year: 1996, acceptance_rate: 38, competition_level: 'Medium', application_fee: 900, deadline: generateDeadline(65), description: 'Private comprehensive university', website: 'www.ewubd.edu', created_at: new Date().toISOString() },
  ].slice(0, 70).map(addCircularDataToUniversity),
];

export const mockApplications = (studentId: string): Application[] => [
  {
    id: '1',
    student_id: studentId,
    university_id: '1',
    status: 'submitted',
    auto_apply_enabled: true,
    applied_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    result: null,
    marks_required: 65,
    marks_obtained: 72,
    transaction_id: generateTransactionId(),
    admission_card_url: null, // Will be generated when needed
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    student_id: studentId,
    university_id: '2',
    status: 'under_review',
    auto_apply_enabled: false,
    applied_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    result: null,
    marks_required: 70,
    marks_obtained: 75,
    transaction_id: generateTransactionId(),
    admission_card_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    student_id: studentId,
    university_id: '4',
    status: 'pending',
    auto_apply_enabled: true,
    applied_at: null,
    result: null,
    marks_required: 60,
    marks_obtained: 72,
    transaction_id: null,
    admission_card_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockExamResults = (studentId: string): ExamResult[] => [
  {
    id: '1',
    student_id: studentId,
    exam_name: 'Admission Test - DU',
    total_marks: 100,
    obtained_marks: 72,
    percentage: 72,
    passed: true,
    exam_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    student_id: studentId,
    exam_name: 'Admission Test - BUET',
    total_marks: 100,
    obtained_marks: 75,
    percentage: 75,
    passed: true,
    exam_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
];

export const mockTransactions = (studentId: string): Transaction[] => [
  {
    id: '1',
    student_id: studentId,
    amount: 5000,
    type: 'recharge',
    description: 'Wallet recharge via bKash',
    balance_after: 5000,
    transaction_id: generateTransactionId(),
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    student_id: studentId,
    amount: 500,
    type: 'deduction',
    description: 'Application fee - Dhaka University',
    balance_after: 4500,
    transaction_id: generateTransactionId(),
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    student_id: studentId,
    amount: 750,
    type: 'deduction',
    description: 'Application fee - BUET',
    balance_after: 3750,
    transaction_id: generateTransactionId(),
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    student_id: studentId,
    amount: 3000,
    type: 'recharge',
    description: 'Wallet recharge via Nagad',
    balance_after: 6750,
    transaction_id: generateTransactionId(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockNotifications = (studentId: string): Notification[] => {
  // Get university data for circular summaries
  const duUni = mockUniversities.find(u => u.id === '1');
  const buetUni = mockUniversities.find(u => u.id === '2');
  const rajuUni = mockUniversities.find(u => u.id === '3');
  
  return [
    {
      id: '1',
      student_id: studentId,
      type: 'circular_scrape',
      title: 'New Circular Detected',
      message: `New admission circular found for Dhaka University. Deadline: ${duUni ? new Date(duUni.deadline).toLocaleDateString() : 'Soon'}`,
      related_university_id: '1',
      read: false,
      action_url: '/circulars',
      circular_summary: duUni?.circular_text ? formatCircularSummary(generateCircularSummary(duUni.circular_text)) : null,
      transaction_id: null,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: '2',
      student_id: studentId,
      type: 'payment',
      title: 'Payment Successful',
      message: 'Application fee paid for BUET. Transaction completed successfully.',
      related_university_id: '2',
      read: false,
      action_url: '/applications',
      circular_summary: null,
      transaction_id: generateTransactionId(),
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
      id: '3',
      student_id: studentId,
      type: 'application_status',
      title: 'Application Submitted',
      message: 'Your application to BUET has been successfully submitted by AI agent',
      related_university_id: '2',
      read: true,
      action_url: '/applications',
      circular_summary: null,
      transaction_id: null,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      student_id: studentId,
      type: 'deadline',
      title: 'Approaching Deadline',
      message: 'Application deadline for Dhaka University is in 3 days',
      related_university_id: '1',
      read: false,
      action_url: '/applications',
      circular_summary: null,
      transaction_id: null,
      created_at: new Date().toISOString(),
    },
    {
      id: '5',
      student_id: studentId,
      type: 'manual_reminder',
      title: 'Manual Application Required',
      message: 'University of Rajshahi circular detected. Auto-apply is disabled. Apply manually before deadline.',
      related_university_id: '3',
      read: false,
      action_url: '/applications',
      circular_summary: rajuUni?.circular_text ? formatCircularSummary(generateCircularSummary(rajuUni.circular_text)) : null,
      transaction_id: null,
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    },
    {
      id: '6',
      student_id: studentId,
      type: 'circular_scrape',
      title: 'Circular Updated',
      message: 'Admission circular for University of Rajshahi has been updated with new information',
      related_university_id: '3',
      read: true,
      action_url: '/circulars',
      circular_summary: rajuUni?.circular_text ? formatCircularSummary(generateCircularSummary(rajuUni.circular_text)) : null,
      transaction_id: null,
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    },
    {
      id: '7',
      student_id: studentId,
      type: 'system',
      title: 'Low Balance Alert',
      message: 'Your wallet balance is below 1000. Recharge now to avoid missing deadlines',
      related_university_id: null,
      read: true,
      action_url: '/balance',
      circular_summary: null,
      transaction_id: null,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};
