-- ══════════════════════════════════════════════════════
-- FBEconnect – Seed / Test Data
-- Run AFTER schema.sql in Supabase SQL Editor
-- ══════════════════════════════════════════════════════
-- NOTE: You must first create these users in Supabase Dashboard
-- Authentication → Users → Add User (set email + password)
-- Then run this SQL to assign their roles and profiles.
-- ══════════════════════════════════════════════════════

-- Step 1: After creating users in the dashboard, 
-- run this to set up profiles (replace UUIDs with real ones from auth.users table):

-- VIEW current auth users to get their UUIDs:
-- SELECT id, email FROM auth.users;

-- Step 2: Set roles for your test accounts
-- UPDATE public.profiles SET role = 'farmer', full_name = 'Demo Farmer' WHERE email = 'farmer@fbeconnect.com';
-- UPDATE public.profiles SET role = 'buyer',  full_name = 'Demo Buyer'  WHERE email = 'buyer@fbeconnect.com';
-- UPDATE public.profiles SET role = 'expert', full_name = 'Demo Expert' WHERE email = 'expert@fbeconnect.com';

-- ── Seed Market Prices ───────────────────────────────
INSERT INTO public.market_prices (product_name, price, unit, market, date) VALUES
  ('Tomatoes',      120, 'kg',    'Nairobi',  current_date),
  ('Fresh Milk',    100, 'liter', 'Nakuru',   current_date),
  ('Maize',          60, 'kg',    'Kitale',   current_date),
  ('Cabbage',        80, 'kg',    'Naivasha', current_date),
  ('Sweet Potatoes', 70, 'kg',    'Eldoret',  current_date),
  ('Brown Eggs',     15, 'piece', 'Kiambu',   current_date),
  ('Mangoes',        50, 'piece', 'Mombasa',  current_date),
  ('Wheat Flour',   150, 'bag',   'Nakuru',   current_date)
ON CONFLICT DO NOTHING;

-- ── View all profiles (useful for debugging) ─────────
-- SELECT p.id, p.email, p.full_name, p.role, p.created_at FROM public.profiles p ORDER BY p.created_at DESC;

-- ── Reset a user's password (use Dashboard instead) ──
-- Supabase Dashboard → Authentication → Users → click user → Reset Password

-- ══════════════════════════════════════════════════════
-- QUICK SETUP SUMMARY
-- 1. Run schema.sql first
-- 2. Go to Authentication → Users → Add User for each account:
--    farmer@fbeconnect.com  / password: FarmerDemo2024!
--    buyer@fbeconnect.com   / password: BuyerDemo2024!
--    expert@fbeconnect.com  / password: ExpertDemo2024!
-- 3. Run the UPDATE statements above to assign roles
-- 4. Run this file to seed market prices
-- ══════════════════════════════════════════════════════
