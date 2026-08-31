import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  serviceRoleKey &&
  supabaseUrl.startsWith("http") &&
  !supabaseUrl.includes("seu-projeto.supabase.co") &&
  serviceRoleKey !== "sua-chave-service-role-aqui" &&
  serviceRoleKey !== "sua-chave-service-role"
);

export const supabaseAdmin = isSupabaseConfigured
  ? createClient(supabaseUrl!, serviceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  : null;
