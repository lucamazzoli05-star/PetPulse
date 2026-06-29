-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Pets table
create table pets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  species text not null,
  breed text,
  birth_date date,
  photo_url text,
  active_sections text[] not null default '{}',
  created_at timestamptz default now()
);

-- Vaccines / deadlines
create table vaccines (
  id uuid primary key default uuid_generate_v4(),
  pet_id uuid references pets(id) on delete cascade not null,
  name text not null,
  date date not null,
  expiry_date date,
  reminder_days int not null default 7,
  notes text,
  created_at timestamptz default now()
);

-- Expenses
create table expenses (
  id uuid primary key default uuid_generate_v4(),
  pet_id uuid references pets(id) on delete cascade not null,
  date date not null,
  amount numeric(10,2) not null,
  category text not null check (category in ('vet','food','grooming','toys','medicine','other')),
  notes text,
  created_at timestamptz default now()
);

-- Weight entries
create table weight_entries (
  id uuid primary key default uuid_generate_v4(),
  pet_id uuid references pets(id) on delete cascade not null,
  date date not null,
  weight_kg numeric(6,2) not null,
  notes text,
  created_at timestamptz default now()
);

-- Diary entries
create table diary_entries (
  id uuid primary key default uuid_generate_v4(),
  pet_id uuid references pets(id) on delete cascade not null,
  date date not null,
  content text not null,
  created_at timestamptz default now()
);

-- Row Level Security
alter table pets enable row level security;
alter table vaccines enable row level security;
alter table expenses enable row level security;
alter table weight_entries enable row level security;
alter table diary_entries enable row level security;

-- Policies: users see only their own data
create policy "Users manage their pets" on pets
  for all using (auth.uid() = user_id);

create policy "Users manage their vaccines" on vaccines
  for all using (
    pet_id in (select id from pets where user_id = auth.uid())
  );

create policy "Users manage their expenses" on expenses
  for all using (
    pet_id in (select id from pets where user_id = auth.uid())
  );

create policy "Users manage their weight entries" on weight_entries
  for all using (
    pet_id in (select id from pets where user_id = auth.uid())
  );

create policy "Users manage their diary entries" on diary_entries
  for all using (
    pet_id in (select id from pets where user_id = auth.uid())
  );
