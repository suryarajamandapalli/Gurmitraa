import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://sjutpdwlrpixkbtoznmt.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqdXRwZHdscnBpeGtidG96bm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NzcwOTQsImV4cCI6MjEwMDM1MzA5NH0.aa_NAzd9R-vBNssnr49jW19qEexaoXKpp9nnRqKG10Q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
