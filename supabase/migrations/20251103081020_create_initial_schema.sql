/*
  # Create University Admission Platform Schema

  1. New Tables
    - `students` - Store student profiles with personal and academic information
    - `universities` - Store university data and admission requirements
    - `applications` - Track student applications to universities with status
    - `exam_results` - Store entrance exam results and marks
    - `transactions` - Track balance recharges and fee deductions
    - `notifications` - Store notifications for students

  2. Security
    - Enable RLS on all tables
    - Create policies for authenticated users to access their own data
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  father_name text NOT NULL,
  mother_name text NOT NULL,
  email text UNIQUE NOT NULL,
  mobile_number text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  unit text NOT NULL,
  ssc_roll text NOT NULL,
  ssc_year integer NOT NULL,
  ssc_board text NOT NULL,
  hsc_roll text NOT NULL,
  hsc_year integer NOT NULL,
  hsc_board text NOT NULL,
  hsc_registration_number text NOT NULL,
  ssc_marks decimal(5,2),
  hsc_marks decimal(5,2),
  registration_completed boolean DEFAULT false,
  current_balance decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  city text NOT NULL,
  established_year integer,
  acceptance_rate decimal(5,2),
  competition_level text,
  application_fee decimal(8,2) DEFAULT 0,
  deadline timestamptz NOT NULL,
  description text,
  website text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  university_id uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  auto_apply_enabled boolean DEFAULT false,
  applied_at timestamptz,
  result text,
  marks_required decimal(5,2),
  marks_obtained decimal(5,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, university_id)
);

CREATE TABLE IF NOT EXISTS exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exam_name text NOT NULL,
  total_marks decimal(5,2) NOT NULL,
  obtained_marks decimal(5,2) NOT NULL,
  percentage decimal(5,2),
  passed boolean,
  exam_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  type text NOT NULL,
  description text,
  balance_after decimal(10,2),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  related_university_id uuid REFERENCES universities(id) ON DELETE SET NULL,
  read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own profile"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Students can update own profile"
  ON students FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can insert own profile"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view universities"
  ON universities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Students can view own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = applications.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert own applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = applications.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update own applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = applications.student_id
      AND students.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = applications.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can view own exam results"
  ON exam_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = exam_results.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = transactions.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = transactions.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = notifications.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = notifications.student_id
      AND students.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = notifications.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_university_id ON applications(university_id);
CREATE INDEX idx_exam_results_student_id ON exam_results(student_id);
CREATE INDEX idx_transactions_student_id ON transactions(student_id);
CREATE INDEX idx_notifications_student_id ON notifications(student_id);
