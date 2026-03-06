
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function testInterest() {
    console.log("Testing match_interests insert...");
    const { error } = await supabase.from('match_interests').upsert({
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567' + Math.floor(Math.random() * 999),
        user_id: 'user_arman',
        target_id: 'user_target_' + Math.random(),
        email: 'test@example.com'
    }, { onConflict: 'user_id,target_id' });

    if (error) {
        console.log("Interest Error Detail:", error.message, error.hint, error.details);
    } else {
        console.log("Interest successful!");
    }
}

testInterest();
