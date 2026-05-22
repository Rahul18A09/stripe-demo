create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
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

create table if not exists public.product_subscriptions (
  id uuid primary key default gen_random_uuid(),
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
  created_at timestamptz not null default now()
);
