import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const envFile = fs.readFileSync('.env', 'utf8');
const env = Object.fromEntries(envFile.split('\n').filter(Boolean).map(line => line.split('=')));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY.replace(/["\r]/g, ''));
async function run() {
  const { data, error } = await supabase.from('unified_certificates').select('*');
  if (error) {
    console.error("DB Query Error:", error);
  } else {
    console.log("Total Certificate Data count:", data ? data.length : 0);
    if (data && data.length > 0) {
      const yearSummary = {};
      data.forEach(item => {
        yearSummary[item.year] = (yearSummary[item.year] || 0) + 1;
      });
      console.log("Year Summary:", yearSummary);
      console.log("Sample Data (first 2 items):", JSON.stringify(data.slice(0, 2), null, 2));
    }
  }
}
run();
