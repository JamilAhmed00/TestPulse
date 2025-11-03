import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Student = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  father_name: string;
  mother_name: string;
  email: string;
  mobile_number: string;
  address: string;
  city: string;
  unit: string;
  ssc_roll: string;
  ssc_year: number;
  ssc_board: string;
  hsc_roll: string;
  hsc_year: number;
  hsc_board: string;
  hsc_registration_number: string;
  ssc_marks: number;
  hsc_marks: number;
  registration_completed: boolean;
  current_balance: number;
  created_at: string;
  updated_at: string;
};

export type University = {
  id: string;
  name: string;
  city: string;
  established_year: number;
  acceptance_rate: number;
  competition_level: string;
  application_fee: number;
  deadline: string;
  description: string;
  website: string;
  circular_url: string | null;
  circular_text: string | null;
  guidelines_url: string | null;
  created_at: string;
};

export type Application = {
  id: string;
  student_id: string;
  university_id: string;
  status: 'pending' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  auto_apply_enabled: boolean;
  applied_at: string | null;
  result: string | null;
  marks_required: number;
  marks_obtained: number;
  transaction_id: string | null;
  admission_card_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ExamResult = {
  id: string;
  student_id: string;
  exam_name: string;
  total_marks: number;
  obtained_marks: number;
  percentage: number;
  passed: boolean;
  exam_date: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  student_id: string;
  amount: number;
  type: 'recharge' | 'deduction';
  description: string;
  balance_after: number;
  transaction_id: string;
  created_at: string;
};

export type Notification = {
  id: string;
  student_id: string;
  type: 'deadline' | 'application_status' | 'balance' | 'system' | 'circular_scrape' | 'payment' | 'manual_reminder';
  title: string;
  message: string;
  related_university_id: string | null;
  read: boolean;
  action_url: string | null;
  circular_summary: string | null;
  transaction_id: string | null;
  created_at: string;
};
