const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const clientFile = fs.readFileSync('src/supabaseClient.js', 'utf8');
const urlMatch = clientFile.match(/const supabaseUrl = ['"]([^'"]+)['"]/);
const keyMatch = clientFile.match(/const supabaseAnonKey = ['"]([^'"]+)['"]/);

const url = urlMatch ? urlMatch[1] : '';
const key = keyMatch ? keyMatch[1] : '';

console.log("Supabase URL:", url);

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
