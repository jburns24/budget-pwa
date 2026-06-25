create table public.transactions (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete cascade not null,
  amount      numeric     not null,
  description text        not null,
  date        date        not null,
  category    text        not null,
  created_at  timestamptz default now() not null
);

alter table public.transactions enable row level security;

create policy "users can read own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);
