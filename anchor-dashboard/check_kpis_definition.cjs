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

  // 전체 kpi 리스트 수집
  const kpis = [];
  data.data.forEach(p => {
    p.units.forEach(u => {
      if (Array.isArray(u.kpis)) {
        u.kpis.forEach(k => {
          kpis.push(k);
        });
      }
    });
  });

  console.log('KPIs count:', kpis.length);
  kpis.forEach(k => {
    console.log(`KPI [${k.id}] ${k.name}:`);
    if (k.subItems) {
      k.subItems.forEach(s => {
        console.log(`  SubItem [${s.id}] ${s.name} (unit: ${s.unit})`);
      });
    }
  });
}

main();
