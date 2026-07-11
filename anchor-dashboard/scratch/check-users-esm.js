import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=');
      if (idx === -1) return [];
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
    .filter(arr => arr.length === 2)
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY.replace(/["\r]/g, ''));

async function run() {
  const { data, error } = await supabase.from('rise_users').select('*');
  if (error) {
    console.error("Error reading rise_users:", error);
    return;
  }
  console.log("=== rise_users List ===");
  console.log(JSON.stringify(data, null, 2));
}

run();
