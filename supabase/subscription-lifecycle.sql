-- Run in Supabase SQL editor after existing schema is in place.

alter table public.users
add column if not exists stripe_customer_id text unique;

alter table public.product_subscriptions
add column if not exists stripe_customer_id text,
add column if not exists stripe_subscription_id text unique,
add column if not exists stripe_price_id text,
add column if not exists current_period_start timestamptz,
add column if not exists current_period_end timestamptz,
add column if not exists cancel_at_period_end boolean not null default false,
add column if not exists canceled_at timestamptz,
add column if not exists pending_plan_id text,
add column if not exists updated_at timestamptz not null default now();

create index if not exists product_subscriptions_user_id_idx
on public.product_subscriptions (user_id);

create index if not exists product_subscriptions_stripe_subscription_id_idx
on public.product_subscriptions (stripe_subscription_id);

create index if not exists product_subscriptions_status_idx
on public.product_subscriptions (status);

create table if not exists public.webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

create table if not exists public.subscription_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references public.product_subscriptions(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists subscription_notifications_user_id_idx
on public.subscription_notifications (user_id, read, created_at desc);

alter table public.subscription_notifications enable row level security;

drop policy if exists "Users can read own subscription notifications" on public.subscription_notifications;

create policy "Users can read own subscription notifications"
on public.subscription_notifications for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can update own subscription notifications" on public.subscription_notifications;

create policy "Users can update own subscription notifications"
on public.subscription_notifications for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop trigger if exists set_product_subscriptions_updated_at on public.product_subscriptions;

create trigger set_product_subscriptions_updated_at
before update on public.product_subscriptions
for each row
execute function public.set_updated_at();
