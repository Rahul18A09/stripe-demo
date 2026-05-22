alter table public.users
add column if not exists auth_user_id uuid unique references auth.users(id) on delete cascade;

alter table public.orders
add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.product_subscriptions
add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.product_subscriptions enable row level security;

drop policy if exists "Users can read own profile" on public.users;
drop policy if exists "Users can insert own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;

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

drop policy if exists "Users can read own orders" on public.orders;
drop policy if exists "Users can insert own orders" on public.orders;

create policy "Users can read own orders"
on public.orders for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own orders"
on public.orders for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can read own subscriptions" on public.product_subscriptions;
drop policy if exists "Users can insert own subscriptions" on public.product_subscriptions;

create policy "Users can read own subscriptions"
on public.product_subscriptions for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own subscriptions"
on public.product_subscriptions for insert
to authenticated
with check (auth.uid() = user_id);
