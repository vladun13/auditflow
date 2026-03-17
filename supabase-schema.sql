-- Accessibility Audit Generator Database Schema
-- To be run in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  credits INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Audits table
CREATE TABLE public.audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  website_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scanning', 'completed', 'failed')),
  pages_scanned INTEGER DEFAULT 0 NOT NULL,
  total_violations INTEGER DEFAULT 0 NOT NULL,
  critical_count INTEGER DEFAULT 0 NOT NULL,
  serious_count INTEGER DEFAULT 0 NOT NULL,
  moderate_count INTEGER DEFAULT 0 NOT NULL,
  minor_count INTEGER DEFAULT 0 NOT NULL,
  wcag_score DECIMAL(5,2),
  wcag_level TEXT CHECK (wcag_level IN ('A', 'AA', 'AAA', NULL)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Violations table
CREATE TABLE public.violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  violation_type TEXT NOT NULL,
  impact TEXT NOT NULL CHECK (impact IN ('critical', 'serious', 'moderate', 'minor')),
  wcag_criterion TEXT NOT NULL,
  description TEXT NOT NULL,
  ai_explanation TEXT,
  ai_fix_steps TEXT,
  affected_elements INTEGER DEFAULT 1 NOT NULL,
  estimated_fix_hours DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_session_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL, -- Amount in cents
  credits_added INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Claude cache table (optional - for caching AI responses)
CREATE TABLE public.claude_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  violation_type TEXT NOT NULL UNIQUE,
  explanation TEXT NOT NULL,
  fix_steps TEXT NOT NULL,
  estimated_hours DECIMAL(5,2),
  tools TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for better query performance
CREATE INDEX idx_audits_user_id ON public.audits(user_id);
CREATE INDEX idx_audits_created_at ON public.audits(created_at DESC);
CREATE INDEX idx_audits_status ON public.audits(status);
CREATE INDEX idx_violations_audit_id ON public.violations(audit_id);
CREATE INDEX idx_violations_impact ON public.violations(impact);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claude_cache ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Audits policies
CREATE POLICY "Users can view own audits"
  ON public.audits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own audits"
  ON public.audits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own audits"
  ON public.audits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own audits"
  ON public.audits FOR DELETE
  USING (auth.uid() = user_id);

-- Violations policies
CREATE POLICY "Users can view violations of own audits"
  ON public.violations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.audits
      WHERE audits.id = violations.audit_id
      AND audits.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert violations"
  ON public.violations FOR INSERT
  WITH CHECK (true);

-- Payments policies
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- Claude cache policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view cache"
  ON public.claude_cache FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage cache"
  ON public.claude_cache FOR ALL
  USING (auth.role() = 'service_role');

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON public.audits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, credits)
  VALUES (NEW.id, NEW.email, 1); -- 1 free credit for new users
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate WCAG score
CREATE OR REPLACE FUNCTION calculate_wcag_score(
  critical_count INTEGER,
  serious_count INTEGER,
  moderate_count INTEGER,
  minor_count INTEGER
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  score DECIMAL(5,2);
BEGIN
  score := 100 - (critical_count * 10) - (serious_count * 5) - (moderate_count * 2) - (minor_count * 1);

  -- Cap at 0 minimum
  IF score < 0 THEN
    score := 0;
  END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to determine WCAG level
CREATE OR REPLACE FUNCTION determine_wcag_level(score DECIMAL(5,2))
RETURNS TEXT AS $$
BEGIN
  IF score >= 95 THEN
    RETURN 'AAA';
  ELSIF score >= 85 THEN
    RETURN 'AA';
  ELSIF score >= 70 THEN
    RETURN 'A';
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql;
