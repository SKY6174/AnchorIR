const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.existsSync('.env.local') 
  ? fs.readFileSync('.env.local', 'utf8') 
  : fs.readFileSync('.env', 'utf8');

const urlMatch = envContent.match(/VITE_SUPABASE_URL\s*=\s*(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*(.+)/);

const url = urlMatch ? urlMatch[1].trim().replace(/['"]/g, '') : '';
const key = keyMatch ? keyMatch[1].trim().replace(/['"]/g, '') : '';

console.log("Supabase URL:", url);

const supabase = createClient(url, key);

async function run() {
  // 1. 오염된 이메일 목록을 읽어옵니다.
  const { data: users, error: readError } = await supabase
    .from('rise_users')
    .select('id, email, name');

  if (readError) {
    console.error("Error reading users:", readError);
    return;
  }

  console.log(`Total users found: ${users.length}`);

  let fixCount = 0;
  for (const u of users) {
    if (u.email && u.email.endsWith('@uc.ac.kr@anchor.ac.kr')) {
      const fixedEmail = u.email.replace('@anchor.ac.kr', '');
      console.log(`[보정 대상 발견] ${u.name} (${u.id}): ${u.email} -> ${fixedEmail}`);
      
      const { error: updateError } = await supabase
        .from('rise_users')
        .update({ email: fixedEmail })
        .eq('id', u.id);

      if (updateError) {
        console.error(`Failed to update user ${u.id}:`, updateError);
      } else {
        fixCount++;
      }
    } else if (u.id.includes('@uc.ac.kr') && u.email !== u.id) {
      // id가 이메일 주소 전체인데 email과 다른 경우 맞춤 보정
      console.log(`[보정 대상 발견 - 미동기 이메일] ${u.name} (${u.id}): ${u.email} -> ${u.id}`);
      const { error: updateError } = await supabase
        .from('rise_users')
        .update({ email: u.id })
        .eq('id', u.id);

      if (updateError) {
        console.error(`Failed to update user ${u.id}:`, updateError);
      } else {
        fixCount++;
      }
    }
  }

  console.log(`Successfully fixed ${fixCount} user emails.`);
}

run();
