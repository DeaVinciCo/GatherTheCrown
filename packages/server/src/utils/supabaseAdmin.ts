import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  // Keep startup behavior explicit when env is not configured.
  // Game runtime can still work with Prisma-only paths if this client is unused.
  console.warn('[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.');
}

export const supabaseAdmin = createClient(
  supabaseUrl ?? 'http://localhost:54321',
  serviceRoleKey ?? 'missing-service-role-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);
