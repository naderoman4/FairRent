import { createBrowserClient } from '@supabase/ssr';

// Untyped client — use typed helper functions from auth.ts and credits.ts
// for type-safe database access. The Database generic doesn't propagate
// correctly through @supabase/ssr v0.8.x.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
