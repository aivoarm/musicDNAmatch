import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Utility to ensure we have a valid string ID. 
 * Note: Hashing is removed to maintain compatibility with literal string IDs 
 * like 'user_arman' found in the database.
 */
export function toUUID(str: string): string {
    if (!str) return str;
    // We used to hash here to force UUID format, but the database column 
    // is currently TEXT and contains literal strings.
    return str;
}

/**
 * DNA Profile schema reference:
 * {
 *   id: string,
 *   user_id: string,
 *   sonic_embedding: number[], -- length: 12
 *   broadcasting: boolean,
 *   metadata: any,
 *   created_at: string
 * }
 */
