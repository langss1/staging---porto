import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    const oldDescription = "Undergraduate student @ Telkom University. Specializing in AI Engineering, Cyber Security, IoT, and Fullstack Development. Aspiring to become a key proficient IT resource in Indonesia, delivering secure & intelligent digital solutions.";
    
    console.log("Updating profile with old description...");
    
    const { data, error } = await supabase
        .from('profile')
        .update({ about_me: oldDescription })
        .eq('id', 1);
        
    if (error) console.error("Error updating profile:", error.message);
    else console.log("Profile updated successfully!");
}

run();
