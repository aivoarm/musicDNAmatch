import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client with SERVICE ROLE key.
 * Use this ONLY in API routes for admin operations like:
 *  - Linking guest profiles to auth users
 *  - Bypassing RLS for identity transitions
 * 
 * NEVER expose this client to the browser.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
