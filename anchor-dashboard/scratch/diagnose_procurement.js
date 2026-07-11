import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

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
  console.log("=== Procurement DB tables diagnostics ===");
  
  const { data: envData, error: envErr } = await supabase.from('procurement_env').select('*');
  console.log(`[procurement_env] count: ${envData ? envData.length : 0}, error:`, envErr);
  if (envData && envData.length > 0) {
    console.log("procurement_env sample:", envData.slice(0, 3));
  }

  const { data: equipData, error: equipErr } = await supabase.from('procurement_equipment').select('*');
  console.log(`[procurement_equipment] count: ${equipData ? equipData.length : 0}, error:`, equipErr);
  if (equipData && equipData.length > 0) {
    console.log("procurement_equipment sample:", equipData.slice(0, 3));
  }

  const { data: servData, error: servErr } = await supabase.from('procurement_services').select('*');
  console.log(`[procurement_services] count: ${servData ? servData.length : 0}, error:`, servErr);
  if (servData && servData.length > 0) {
    console.log("procurement_services sample:", servData.slice(0, 3));
  }
}

run();
