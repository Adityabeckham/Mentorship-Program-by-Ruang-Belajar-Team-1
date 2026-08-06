require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
// Gunakan Service Role Key untuk operasi backend aman (bypass RLS jika diperlukan dari server)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ Warning: SUPABASE_URL atau SUPABASE_KEY belum dikonfigurasi di .env!');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;