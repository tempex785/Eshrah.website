-- Create transactions_log table
CREATE TABLE IF NOT EXISTS public.transactions_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL,
  type text NOT NULL CHECK (type IN ('charge', 'purchase', 'refund', 'other')),
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.transactions_log ENABLE ROW LEVEL SECURITY;

-- Admins can do everything, users can only read their own logs
CREATE POLICY "Users can view their own transaction logs" 
ON public.transactions_log 
FOR SELECT 
USING (auth.uid() = student_id);

-- Optional: Create index on student_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_log_student_id ON public.transactions_log(student_id);
