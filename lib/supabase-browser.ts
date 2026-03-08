"use client";

import { createClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client for auth operations.
 * Uses the public ANON key — safe for client-side use.
 * This client handles Magic Link OTP sign-in and session management.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);
