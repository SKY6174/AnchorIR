const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qpojcgpdgvzlivjrhrhn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwb2pjZ3BkZ3Z6bGl2anJocmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NjIzNDYsImV4cCI6MjA5ODQzODM0Nn0.jOIAsZTTnVy91ipbOjMlkgLFTJhjf7AIpqKCweXsYIM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data, error } = await supabase
    .from('program_version_requests')
    .select('*')
    .order('id', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching requests:', error);
    return;
  }

  console.log('Fetched requests count:', data.length);
  data.forEach((r, idx) => {
    console.log(`[Request #${idx}] ID: ${r.id}, Program: ${r.program_id}, Name: ${r.version_name}, Status: ${r.status}`);
    console.log('  Changes after:', JSON.stringify(r.changes?.after));
  });
}

main();
