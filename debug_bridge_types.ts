
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function checkSchema() {
    console.log("--- Column Types ---");

    const { data: cols, error: err } = await supabase.rpc('get_column_types', {});
    // If RPC doesn't exist, we'll try a different way or check migration files again.
    // Actually, I can't easily query information_schema via RPC unless I define one.

    // Let's try to insert a dummy row into bridges with a TEXT id and see if it fails.
    const { error: bridgeErr } = await supabase.from('bridges').insert({
        user_a: 'user_arman',
        user_b: 'user_test',
        common_ground_data: {}
    }).select();

    console.log("Bridge Insert Error (with TEXT IDs):", bridgeErr);

    const { error: bridgeErrUUID } = await supabase.from('bridges').insert({
        user_a: '00000000-0000-0000-0000-000000000000',
        user_b: '11111111-1111-1111-1111-111111111111',
        common_ground_data: {}
    }).select();

    console.log("Bridge Insert Error (with UUIDs):", bridgeErrUUID);
}

checkSchema();
