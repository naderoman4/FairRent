import { createClient } from '@supabase/supabase-js';

// Service-role client for admin operations (webhooks, background jobs)
// Bypasses RLS — use only in server-side trusted contexts
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
