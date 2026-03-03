
import { supabase } from "./lib/supabase.js";

async function checkProfiles() {
    const { data, error } = await supabase.from("dna_profiles").select("id, user_id, metadata").limit(5);
    if (error) {
        console.error("Error fetching profiles:", error);
    } else {
        console.log("Recent profiles:", JSON.stringify(data, null, 2));
    }
}

checkProfiles();
