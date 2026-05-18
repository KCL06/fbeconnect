import { supabase } from "./supabase";
import { cleanInput } from "../utils/validation";

/**
 * FBEconnect – Authentication Library
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralises all Supabase Auth calls. Sanitizes inputs before sending.
 * Returns typed data; throws typed errors that callers can handle.
 *
 * ⚠️ BACKEND: Supabase handles password hashing (bcrypt). NEVER store
 * plain-text passwords. Enforce password complexity via Supabase Auth settings
 * in the dashboard (Authentication → Password Policy).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type UserRole = "farmer" | "buyer" | "expert" | "admin";

// ── Sign Up ──────────────────────────────────────────────────────────────────
/**
 * Creates a new Supabase auth user and sets role metadata.
 *
 * ⚠️ BACKEND: A database trigger on auth.users should automatically create a
 * matching row in the `profiles` table on sign-up. Validate role assignment
 * server-side — do NOT trust the client to set the role.
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole
) {
  // Sanitize text inputs before sending to Supabase
  const cleanEmail = cleanInput(email).toLowerCase();
  const cleanName = cleanInput(fullName);

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password, // Passwords are NOT sanitized — special chars are valid and needed
    options: {
      data: {
        full_name: cleanName,
        role,
      },
    },
  });
  if (error) throw error;
  return data;
}

// ── Sign In ──────────────────────────────────────────────────────────────────
/**
 * Signs in with email + password.
 * ⚠️ BACKEND: Implement server-side rate limiting via Supabase Auth hook or
 * Vercel Edge Middleware to prevent brute-force attacks.
 */
export async function signIn(email: string, password: string) {
  const cleanEmail = cleanInput(email).toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });
  if (error) throw error;
  return data;
}

// ── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ── Get Session ───────────────────────────────────────────────────────────────
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ── Get Profile ───────────────────────────────────────────────────────────────
/**
 * Fetches the authenticated user's profile from the `profiles` table.
 * ⚠️ BACKEND: RLS policy must restrict this to SELECT WHERE id = auth.uid()
 */
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at?: string;
}

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, avatar_url, created_at")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as Profile;
}

// ── Update Profile ────────────────────────────────────────────────────────────
/**
 * Updates editable profile fields.
 * ⚠️ BACKEND: RLS must restrict UPDATE to WHERE id = auth.uid()
 * Do NOT allow the client to update the `role` column.
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, "full_name" | "phone" | "avatar_url">>
): Promise<Profile> {
  // Sanitize string fields
  const sanitized: typeof updates = {};
  if (updates.full_name !== undefined) sanitized.full_name = cleanInput(updates.full_name);
  if (updates.phone !== undefined) sanitized.phone = cleanInput(updates.phone);
  if (updates.avatar_url !== undefined) sanitized.avatar_url = updates.avatar_url;

  const { data, error } = await supabase
    .from("profiles")
    .update(sanitized)
    .eq("id", userId)
    .select("id, full_name, email, phone, role, avatar_url")
    .single();
  if (error) throw error;
  return data as Profile;
}

// ── Role-Specific Profiles ────────────────────────────────────────────────────

export interface FarmerProfileData {
  farm_name: string;
  farm_location: string;
  farming_type: string;
  years_experience: number;
}

/**
 * ⚠️ BACKEND: RLS on farmer_profiles must restrict to WHERE id = auth.uid()
 */
export async function saveFarmerProfile(userId: string, profile: FarmerProfileData) {
  const { error } = await supabase
    .from("farmer_profiles")
    .upsert({ id: userId, ...profile });
  if (error) throw error;
}

export async function saveFarmerVerification(
  userId: string,
  data: { national_id: string }
) {
  // ⚠️ BACKEND: Validate and store ID documents securely; restrict access via RLS
  const { error } = await supabase
    .from("farmer_verifications")
    .upsert({ id: userId, national_id: data.national_id });
  if (error) throw error;
}

export interface BuyerProfileData {
  business_name?: string;
  location?: string;
  business_type?: string;
}

export async function saveBuyerProfile(userId: string, profile: BuyerProfileData) {
  const { error } = await supabase
    .from("buyer_profiles")
    .upsert({ id: userId, ...profile });
  if (error) throw error;
}

export interface ExpertProfileData {
  specialization?: string;
  qualifications?: string;
  years_experience?: number;
  bio?: string;
}

export async function saveExpertProfile(userId: string, profile: ExpertProfileData) {
  const { error } = await supabase
    .from("expert_profiles")
    .upsert({ id: userId, ...profile });
  if (error) throw error;
}
