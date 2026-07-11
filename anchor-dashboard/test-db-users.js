import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFilePath = './.env';
const envFile = fs.readFileSync(envFilePath, 'utf8');
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

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY.replace(/["\r]/g, '');

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== Checking if rise_users has director/manager/hq_head records ===");
  const { data: users, error } = await supabase
    .from('rise_users')
    .select('*')
    .in('id', ['director', 'g_director', 'manager', 'hq_head', 'kysong@uc.ac.kr', 'hmsim@uc.ac.kr', 'hskim3@uc.ac.kr']);
  
  if (error) {
    console.error("Error fetching users:", error.message);
  } else {
    console.log("Found Users in DB:", users);
  }
}

run();
