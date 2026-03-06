
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function checkCols() {
    // We can't query information_schema directly via standard Supabase client usually
    // but we can try an RPC if one is available, or just try to insert and see the error.

    console.log("Testing bridge insert...");
    const { error } = await supabase.from('bridges').insert({
        user_a: 'user_arman',
        user_b: 'user_other',
        common_ground_data: {}
    });

    if (error) {
        console.log("Insert Error Detail:", error.message, error.hint, error.details);
    } else {
        console.log("Insert successful! (Columns are TEXT compatible)");
    }
}

checkCols();
