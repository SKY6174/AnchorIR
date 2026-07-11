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
const supabaseKey = env.VITE_SUPABASE_ANON_KEY.replace(/["\r]/g, '');

const testEmails = [
  'g_director@anchor.ac.kr',
  'manager@anchor.ac.kr',
  'hq_head@anchor.ac.kr'
];

async function verifyAccount(email, password) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.log(`[실패] 이메일: ${email} | 비밀번호: ${password} | 에러: ${error.message}`);
    return false;
  } else {
    console.log(`[성공] 이메일: ${email} | 비밀번호: ${password} | 사용자 UUID: ${data.user.id}`);
    await supabase.auth.signOut();
    return true;
  }
}

async function run() {
  console.log("=== 데모 가상 계정 로그인 검증 테스트 ===");
  for (const email of testEmails) {
    await verifyAccount(email, 'uc_anchor');
  }
}

run();
