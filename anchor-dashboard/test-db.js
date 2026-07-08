import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const envFile = fs.readFileSync('.env', 'utf8');
const env = Object.fromEntries(envFile.split('\n').filter(Boolean).map(line => line.split('=')));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY.replace(/["\r]/g, ''));
async function run() {
  const { data, error } = await supabase.from('agreements').select('*');
  if (error) {
    console.error("DB Query Error:", error);
  } else {
    console.log("Data count:", data ? data.length : 0);
    console.log(JSON.stringify(data ? data.slice(0, 3) : [], null, 2));
  }
}
run();
