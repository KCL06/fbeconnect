-- ══════════════════════════════════════════════════════
-- FBEconnect – Supabase Database Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  full_name   text,
  email       text,
  phone       text,
  role        text check (role in ('farmer','buyer','expert')),
  avatar_url  text,
  created_at  timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Anyone can view profiles"  on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- 2. FARMER PROFILES
create table if not exists public.farmer_profiles (
  id               uuid references public.profiles on delete cascade primary key,
  farm_name        text,
  farm_location    text,
  farming_type     text,
  years_experience integer,
  is_verified      boolean default false
);
alter table public.farmer_profiles enable row level security;
create policy "Anyone can view farmer profiles" on public.farmer_profiles for select using (true);
create policy "Farmers manage own profile" on public.farmer_profiles for all using (auth.uid() = id);

create table if not exists public.farmer_verifications (
  id               uuid references public.profiles on delete cascade primary key,
  national_id      text,
  created_at       timestamptz default now()
);
alter table public.farmer_verifications enable row level security;
create policy "Farmers manage own verification data" on public.farmer_verifications for all using (auth.uid() = id);

-- 3. BUYER PROFILES
create table if not exists public.buyer_profiles (
  id                 uuid references public.profiles on delete cascade primary key,
  location           text,
  preferred_products text,
  buying_frequency   text,
  account_type       text
);
alter table public.buyer_profiles enable row level security;
create policy "Anyone can view buyer profiles" on public.buyer_profiles for select using (true);
create policy "Buyers manage own profile" on public.buyer_profiles for all using (auth.uid() = id);

-- 4. EXPERT PROFILES
create table if not exists public.expert_profiles (
  id               uuid references public.profiles on delete cascade primary key,
  expertise        text,
  years_experience integer,
  institution      text,
  portfolio        text,
  is_verified      boolean default false
);
alter table public.expert_profiles enable row level security;
create policy "Anyone can view expert profiles" on public.expert_profiles for select using (true);
create policy "Experts manage own profile" on public.expert_profiles for all using (auth.uid() = id);

-- 5. PRODUCTS (marketplace listings)
create table if not exists public.products (
  id                 uuid default gen_random_uuid() primary key,
  farmer_id          uuid references public.profiles on delete cascade,
  name               text not null,
  description        text,
  price              numeric not null,
  price_label        text,
  unit               text,
  quantity_available numeric default 0,
  category           text,
  location           text,
  image_url          text,
  in_stock           boolean default true,
  rating             numeric default 0,
  review_count       integer default 0,
  created_at         timestamptz default now()
);
alter table public.products enable row level security;
create policy "Anyone can view products"    on public.products for select using (true);
create policy "Farmers manage own products" on public.products for all using (auth.uid() = farmer_id);

-- 6. CART ITEMS (persistent)
create table if not exists public.cart_items (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles on delete cascade,
  product_id uuid references public.products on delete cascade,
  quantity   integer default 1,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);
alter table public.cart_items enable row level security;
create policy "Users manage own cart" on public.cart_items for all using (auth.uid() = user_id);

-- 7. ORDERS
create table if not exists public.orders (
  id           uuid default gen_random_uuid() primary key,
  buyer_id     uuid references public.profiles on delete cascade,
  status       text default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  total_amount numeric,
  notes        text,
  created_at   timestamptz default now()
);
alter table public.orders enable row level security;
create policy "Buyers see own orders" on public.orders for all using (auth.uid() = buyer_id);

-- 8. ORDER ITEMS
create table if not exists public.order_items (
  id                uuid default gen_random_uuid() primary key,
  order_id          uuid references public.orders on delete cascade,
  product_id        uuid references public.products,
  quantity          integer,
  price_at_purchase numeric
);
alter table public.order_items enable row level security;
create policy "Order items via order" on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.buyer_id = auth.uid())
);

-- 9. MARKET PRICES
create table if not exists public.market_prices (
  id           uuid default gen_random_uuid() primary key,
  product_name text not null,
  price        numeric not null,
  unit         text,
  market       text,
  date         date default current_date,
  created_at   timestamptz default now()
);
alter table public.market_prices enable row level security;
create policy "Anyone can view market prices" on public.market_prices for select using (true);

-- 10. FARM RECORDS
create table if not exists public.farm_records (
  id          uuid default gen_random_uuid() primary key,
  farmer_id   uuid references public.profiles on delete cascade,
  title       text,
  description text,
  date        date not null,
  activity    text not null,
  type        text not null,
  area        text,
  created_at  timestamptz default now()
);
alter table public.farm_records enable row level security;
create policy "Farmers see own records"    on public.farm_records for select using (auth.uid() = farmer_id);
create policy "Farmers insert own records" on public.farm_records for insert with check (auth.uid() = farmer_id);
create policy "Farmers update own records" on public.farm_records for update using (auth.uid() = farmer_id);
create policy "Farmers delete own records" on public.farm_records for delete using (auth.uid() = farmer_id);


create table if not exists public.consultations (
  id          uuid default gen_random_uuid() primary key,
  farmer_id   uuid references public.profiles on delete cascade,
  expert_id   uuid references public.profiles on delete cascade,
  subject     text,
  status      text default 'pending' check (status in ('pending','active','completed','cancelled')),
  created_at  timestamptz default now()
);
alter table public.consultations enable row level security;
create policy "Parties see own consultations" on public.consultations for select using (
  auth.uid() = farmer_id or auth.uid() = expert_id
);

-- 12. MESSAGES
create table if not exists public.messages (
  id          uuid default gen_random_uuid() primary key,
  sender_id   uuid references public.profiles on delete cascade,
  receiver_id uuid references public.profiles on delete cascade,
  content     text,
  is_read     boolean default false,
  created_at  timestamptz default now()
);
alter table public.messages enable row level security;
create policy "Parties see own messages" on public.messages for select using (
  auth.uid() = sender_id or auth.uid() = receiver_id
);
create policy "Users send messages" on public.messages for insert with check (auth.uid() = sender_id);

-- 13. REVIEWS
create table if not exists public.reviews (
  id          uuid default gen_random_uuid() primary key,
  reviewer_id uuid references public.profiles on delete cascade,
  product_id  uuid references public.products,
  rating      integer check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now()
);
alter table public.reviews enable row level security;
create policy "Anyone can read reviews" on public.reviews for select using (true);
create policy "Users write own reviews" on public.reviews for insert with check (auth.uid() = reviewer_id);

-- 14. NOTIFICATIONS
create table if not exists public.notifications (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles on delete cascade,
  title      text,
  message    text,
  type       text,
  is_read    boolean default false,
  created_at timestamptz default now()
);
alter table public.notifications enable row level security;
create policy "Users see own notifications" on public.notifications for all using (auth.uid() = user_id);



-- ══════════════════════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGNUP
-- ══════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  user_role text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'buyer');

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    user_role
  );

  if user_role = 'farmer' then
    insert into public.farmer_profiles (id) values (new.id);
  elsif user_role = 'expert' then
    insert into public.expert_profiles (id) values (new.id);
  else
    insert into public.buyer_profiles (id) values (new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ══════════════════════════════════════════════════════
-- SUPABASE STORAGE BUCKETS
-- ══════════════════════════════════════════════════════
-- Note: Run these commands to set up the storage buckets.
-- You might need to enable the Storage extension or run this from the SQL Editor as a Superuser.
insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true),
       ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- PRODUCT IMAGES POLICIES
create policy "Anyone can view product images"
on storage.objects for select
using ( bucket_id = 'product-images' );

create policy "Authenticated users can upload product images"
on storage.objects for insert
with check ( bucket_id = 'product-images' and auth.uid() is not null );

create policy "Users can update their own product images"
on storage.objects for update
using ( bucket_id = 'product-images' and auth.uid() = owner );

create policy "Users can delete their own product images"
on storage.objects for delete
using ( bucket_id = 'product-images' and auth.uid() = owner );

-- AVATARS POLICIES
create policy "Anyone can view avatars"
on storage.objects for select
using ( bucket_id = 'avatars' );

create policy "Authenticated users can upload avatars"
on storage.objects for insert
with check ( bucket_id = 'avatars' and auth.uid() is not null );

create policy "Users can update their own avatars"
on storage.objects for update
using ( bucket_id = 'avatars' and auth.uid() = owner );

create policy "Users can delete their own avatars"
on storage.objects for delete
using ( bucket_id = 'avatars' and auth.uid() = owner );
