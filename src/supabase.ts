import { createClient } from "@supabase/supabase-js";

// Works with our own names (VITE_*) or the ones the Vercel ↔ Supabase integration sets (NEXT_PUBLIC_*).
const env = import.meta.env as Record<string, string | undefined>;
const url = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const configured = !!(url && anon);
export const supabase = createClient(url || "http://localhost", anon || "missing", {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
