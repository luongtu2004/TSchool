const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gnesbuzqdawmmsgfwstp.supabase.co';
const supabaseAnonKey = 'sb_publishable_eFqHM-c2vIpZs0mTDC9_LA_TO9JEFDa'; // we read this from .env.local

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUser() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*');
    if (error) {
      console.error('Error fetching user_profiles:', error);
    } else {
      console.log('User profiles:', data);
    }
  } catch (err) {
    console.error('Catch error:', err);
  }
}

checkUser();
