import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function check() {
    console.log("Checking dna_profiles user_id...");
    const { data: profiles, error: pErr } = await supabase.from('dna_profiles').select('user_id').limit(1);
    console.log("DNA Profile user_id:", profiles?.[0]?.user_id);

    console.log("Checking match_interests...");
    const { data: interests, error: iErr } = await supabase.from('match_interests').select('*').limit(1);
    if (iErr) console.error("Interests Error:", iErr);
    else console.log("Interests sample:", interests?.[0]);

    console.log("Checking bridges...");
    const { data: bridges, error: bErr } = await supabase.from('bridges').select('*').limit(1);
    if (bErr) console.error("Bridges Error:", bErr);
    else console.log("Bridges sample:", bridges?.[0]);
}

check();
