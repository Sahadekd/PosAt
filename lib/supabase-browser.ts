import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isBrowserSupabaseConfigured = Boolean(
  supabaseUrl &&
  anonKey &&
  supabaseUrl.startsWith("http") &&
  !supabaseUrl.includes("seu-projeto.supabase.co") &&
  anonKey !== "sua-chave-anon-aqui" &&
  anonKey !== "sua-chave-anon"
);

export const supabaseBrowser = isBrowserSupabaseConfigured
  ? createClient(supabaseUrl!, anonKey!)
  : null;
