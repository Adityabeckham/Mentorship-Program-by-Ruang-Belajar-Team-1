const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const SUPABASE_URL = env.SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_KEY ||
  process.env.SUPABASE_KEY ||
  env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('⚠️ Warning: SUPABASE_URL atau SUPABASE_KEY belum dikonfigurasi di Environment Variables!');
}

// Supabase Client Connection Initialization with Stateless Auth Configuration
const supabase = createClient(
  SUPABASE_URL || 'https://nitoabgeuvxxpipybwrp.supabase.co',
  SUPABASE_KEY || 'dummy_key_for_initialization',
  {
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
  }
);

module.exports = supabase;
