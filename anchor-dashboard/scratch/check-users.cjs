const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// .env.local 또는 .env 파일에서 직접 환경변수를 읽습니다.
let envContent = '';
if (fs.existsSync('.env.local')) {
  envContent = fs.readFileSync('.env.local', 'utf8');
} else if (fs.existsSync('.env')) {
  envContent = fs.readFileSync('.env', 'utf8');
}

const urlMatch = envContent.match(/VITE_SUPABASE_URL\s*=\s*(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*(.+)/);

const url = urlMatch ? urlMatch[1].trim().replace(/['"]/g, '') : '';
const key = keyMatch ? keyMatch[1].trim().replace(/['"]/g, '') : '';

console.log("Supabase URL:", url);

if (!url || !key) {
  console.error("Supabase URL or Key not found in env files.");
  process.exit(1);
}

const supabase = createClient(url, key);

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
