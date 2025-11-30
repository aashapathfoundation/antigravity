-- Admin Users Table with Roles and Permissions
CREATE TABLE public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('super_admin', 'admin', 'editor')),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX idx_admin_users_email ON public.admin_users(email);
CREATE INDEX idx_admin_users_role ON public.admin_users(role);

-- RLS Policies
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only service role and super_admins can manage admin users
CREATE POLICY "Enable all for service role" ON public.admin_users
  FOR ALL USING (auth.role() = 'service_role');

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION public.update_admin_user_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_user_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_admin_user_updated_at();

-- Insert a default super admin (update email to your admin email)
-- You'll need to sign up first with this email
INSERT INTO public.admin_users (user_id, email, full_name, role)
SELECT id, email, raw_user_meta_data->>'full_name', 'super_admin'
FROM auth.users
WHERE email = 'aashapathfoundation@gmail.com' -- Change this to your admin email
ON CONFLICT (email) DO UPDATE SET role = 'super_admin';

-- Activity Logs Table
CREATE TABLE public.admin_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_admin_activity_logs_admin_user ON public.admin_activity_logs(admin_user_id);
CREATE INDEX idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at DESC);

ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for service role" ON public.admin_activity_logs
  FOR ALL USING (auth.role() = 'service_role');
