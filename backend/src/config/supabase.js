const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const SUPABASE_URL = env.SUPABASE_URL || process.env.SUPABASE_URL;
// Utamakan Service Role Key untuk backend Express (bypass RLS & optimize connection overhead)
const SUPABASE_KEY =
  env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_KEY ||
  process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: SUPABASE_URL atau SUPABASE_KEY belum dikonfigurasi di environment!');
}

// Supabase Client Connection Optimization for Express Server Runtime
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-application-name': 'eventhub-backend-express',
    },
  },
});

module.exports = supabase;