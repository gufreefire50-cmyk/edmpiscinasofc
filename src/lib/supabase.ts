import { createClient } from "@supabase/supabase-js";

const projectUrl = (import.meta.env.VITE_SUPABASE_URL || "https://ittpqrisgxjmpfauozcr.supabase.co").replace(/\/$/, "");
const publishableKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_K4nLu7bFjpOslIVFDZS6Qg_prIfITZ2";

export const EDM_ADMIN_EMAIL = "edm.piscinas@gmail.com";
export const supabase = createClient(projectUrl, publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
