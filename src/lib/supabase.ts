import { createClient } from "@supabase/supabase-js";

const projectUrl = (import.meta.env.VITE_SUPABASE_URL || "https://ittpqrisgxjmpfauozcr.supabase.co").replace(/\/$/, "");
const publishableKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_K4nLu7bFjpOslIVFDZS6Qg_prIfITZ2";

export const EDM_ADMIN_EMAILS = [
  "edm.piscinas@gmail.com",
  "gufreefire50@gmail.com",
] as const;

export const DEFAULT_ADMIN_EMAIL = "gufreefire50@gmail.com";

export function isEdmAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && EDM_ADMIN_EMAILS.includes(email.toLowerCase() as typeof EDM_ADMIN_EMAILS[number]));
}

export const supabase = createClient(projectUrl, publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
