import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't throw here: a hard throw during module evaluation blanks the whole app before
  // React even mounts. Fall back to a placeholder client so pages render their normal
  // loading/error states instead — every request will just fail until this is configured.
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.local.example to .env.local and fill in your Supabase project values.'
  );
}

// Distinct storageKey so this app's session never collides with the main site's in
// localStorage if the two ever end up served from the same origin.
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-anon-key', {
  auth: { storageKey: 'sclass-admin-auth' },
});
