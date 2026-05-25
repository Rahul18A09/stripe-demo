-- Drop existing tables if they exist to start fresh
drop table if exists public.orders cascade;
drop table if exists public.product_subscriptions cascade;
drop table if exists public.users cascade;

-- Recreate users table
create table public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  name text,
  email text not null unique,
  stripe_customer_id text unique,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Recreate orders table
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  user_email text not null,
  product_id text not null,
  product_name text not null,
  product_image text,
  amount integer not null,
  currency text not null default 'inr',
  status text not null default 'checkout_started',
  stripe_checkout_session_id text,
  created_at timestamptz not null default now()
);

-- Recreate product_subscriptions table
create table public.product_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  user_email text not null,
  product_id text,
  product_name text,
  product_image text,
  plan_id text not null,
  plan_name text not null,
  amount integer not null,
  currency text not null default 'inr',
  interval text not null default 'month',
  status text not null default 'subscription_started',
  stripe_checkout_session_id text,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  pending_plan_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.product_subscriptions enable row level security;

-- Policies for public.users
create policy "Users can read own profile"
on public.users for select
to authenticated
using (auth.uid() = auth_user_id);

create policy "Users can insert own profile"
on public.users for insert
to authenticated
with check (auth.uid() = auth_user_id);

create policy "Users can update own profile"
on public.users for update
to authenticated
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

-- Policies for public.orders
create policy "Users can read own orders"
on public.orders for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own orders"
on public.orders for insert
to authenticated
with check (auth.uid() = user_id);

-- Policies for public.product_subscriptions
create policy "Users can read own subscriptions"
on public.product_subscriptions for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own subscriptions"
on public.product_subscriptions for insert
to authenticated
with check (auth.uid() = user_id);

create table public.webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

create table public.subscription_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references public.product_subscriptions(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.subscription_notifications enable row level security;

create policy "Users can read own subscription notifications"
on public.subscription_notifications for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can update own subscription notifications"
on public.subscription_notifications for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
