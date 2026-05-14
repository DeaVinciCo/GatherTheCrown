import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[GTC] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set. ' +
    'Auth and cloud saves will not work. Copy packages/client/.env.example -> .env.local'
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'gtc-session'
      }
    })
  : {
      auth: {
        signInWithPassword: async () => ({
          data: null,
          error: new Error('Supabase not configured')
        })
      }
    };

/**
 * Convert a game username to the synthetic email that is stored in Supabase Auth.
 * Must match the server-side toAuthEmail() in utils/auth.ts.
 */
export function toAuthEmail(username: string): string {
  return `${username.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}@gtc.local`;
}
