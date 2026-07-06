import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const envFile = fs.readFileSync('.env', 'utf8');
const env = Object.fromEntries(envFile.split('\n').filter(Boolean).map(line => line.split('=')));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY.replace(/["\r]/g, ''));
async function run() {
  const targetYearNum = 2026;
  const startDateStr = `${targetYearNum}-03-01T00:00:00+09:00`;
  const endDateStr = `${targetYearNum + 1}-03-01T00:00:00+09:00`;
  const { data, error } = await supabase
    .from('press_releases')
    .select('*')
    .gte('broadcast_date', startDateStr)
    .lt('broadcast_date', endDateStr);
  console.log(JSON.stringify(data, null, 2));
}
run();
