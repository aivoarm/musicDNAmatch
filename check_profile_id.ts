
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function check() {
    const { data } = await supabase.from('dna_profiles').select('id, user_id').limit(1);
    console.log('Profile ID:', data?.[0]?.id);
}
check();
