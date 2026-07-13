const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qpojcgpdgvzlivjrhrhn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwb2pjZ3BkZ3Z6bGl2anJocmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NjIzNDYsImV4cCI6MjA5ODQzODM0Nn0.jOIAsZTTnVy91ipbOjMlkgLFTJhjf7AIpqKCweXsYIM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data, error } = await supabase
    .from('projects_data')
    .select('*')
    .eq('year', 2)
    .single();

  if (error) {
    console.error('Error fetching projects data:', error);
    return;
  }

  // A1가-S3T5-1 프로그램 찾기
  let targetProg = null;
  data.data.forEach(p => {
    p.units.forEach(u => {
      u.programs.forEach(prog => {
        if (prog.id === 'A1가-S3T5-1') {
          targetProg = prog;
        }
      });
    });
  });

  if (targetProg) {
    console.log('Target Program Found:');
    console.log('kpi_type:', targetProg.kpi_type);
    console.log('kpi_link:', targetProg.kpi_link);
    console.log('kpi_types:', targetProg.kpi_types);
    console.log('kpi_links:', targetProg.kpi_links);
    console.log('kpi_targets:', targetProg.kpi_targets);
    console.log('kpi_actuals:', targetProg.kpi_actuals);
  } else {
    console.log('A1가-S3T5-1 program not found in DB JSON data');
  }
}

main();
