const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('videos').select('count', { count: 'exact' });
    if (error) throw error;
    console.log('✅ Connected to Supabase successfully');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error.message);
    console.log('Please ensure you have run the migration SQL script in your Supabase dashboard');
    return false;
  }
}

module.exports = {
  supabase,
  testSupabaseConnection
};