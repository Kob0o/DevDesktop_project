create table teams (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  name text not null,
  formation jsonb not null
);

-- Ajout des politiques de sécurité
alter table teams enable row level security;

create policy "Users can view their own teams"
  on teams for select
  using (auth.uid() = user_id);

create policy "Users can insert their own teams"
  on teams for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own teams"
  on teams for update
  using (auth.uid() = user_id);

create policy "Users can delete their own teams"
  on teams for delete
  using (auth.uid() = user_id); 