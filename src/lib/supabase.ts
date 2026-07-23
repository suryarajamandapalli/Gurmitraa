import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ptxhhjadszkrihvrwrqm.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0eGhoamFkc3prcmlodnJ3cnFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NjQzOTUsImV4cCI6MjEwMDM0MDM5NX0.Pid7zCwm8Z1Obl7k9mbNLAKpjttN6reke_bXjrHaeIo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
