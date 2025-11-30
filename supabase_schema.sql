-- Create a table for newsletter subscribers
create table public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true
);

-- Set up Row Level Security (RLS)
alter table public.newsletter_subscribers enable row level security;

-- Allow anyone to insert (subscribe)
create policy "Enable insert for everyone" on public.newsletter_subscribers
  for insert with check (true);

-- Only allow admins (service role) to view subscribers
create policy "Enable read for service role only" on public.newsletter_subscribers
  for select using (auth.role() = 'service_role');
