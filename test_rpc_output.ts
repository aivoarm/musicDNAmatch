
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function testMatch() {
    console.log("Testing RPC directly...");
    const { data, error } = await supabase.rpc('match_sonic_soulmates_v2', {
        query_embedding: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
        match_threshold: 0,
        match_count: 5,
        caller_id: 'user_arman'
    });

    if (error) {
        console.error("RPC Error:", error);
    } else {
        console.log("RPC Result Sample:", data?.[0]);
    }
}

testMatch();
