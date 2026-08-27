const { SUPABASE_URL, SUPABASE_KEY } = require('./env');
const { createClient } = require('@supabase/supabase-js');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(' Warning: SUPABASE_URL atau SUPABASE_KEY belum dikonfigurasi di .env!');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
