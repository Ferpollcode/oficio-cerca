import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

export const schemaSql = `
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('cliente', 'trabajador', 'admin')) not null default 'cliente',
  full_name text not null,
  phone text,
  created_at timestamptz default now()
);

create table workers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  trade text not null,
  license text,
  verified boolean default false,
  rating numeric default 5,
  jobs integer default 0,
  status text default 'Libre',
  last_lat numeric,
  last_lng numeric,
  location_shared boolean default false,
  updated_at timestamptz default now()
);

create table service_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references profiles(id),
  worker_id uuid references workers(id),
  trade text not null,
  address text not null,
  urgency text not null,
  status text default 'Pendiente',
  created_at timestamptz default now()
);

create table worker_locations (
  id bigint generated always as identity primary key,
  worker_id uuid references workers(id) on delete cascade,
  request_id uuid references service_requests(id) on delete cascade,
  lat numeric not null,
  lng numeric not null,
  consent_active boolean default true,
  recorded_at timestamptz default now()
);
`;
