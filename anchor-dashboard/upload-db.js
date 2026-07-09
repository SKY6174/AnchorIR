import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const targetYear = process.argv[2];
if (!targetYear) {
  console.error("오류: 업로드할 연차 번호를 인자로 입력해주세요. (예: node upload-db.js 2)");
  process.exit(1);
}

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

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const fileName = `projects_data_year_${targetYear}.json`;
  if (!fs.existsSync(fileName)) {
    console.error(`오류: 로컬에 수정 완료된 ${fileName} 파일이 존재하지 않습니다.`);
    return;
  }
  
  console.log("=== RLS 권한 획득을 위해 관리자 계정 로그인 시도 ===");
  
  // 1. 단장님(kysong@uc.ac.kr) 계정으로 로그인 시도
  let authRes = await supabase.auth.signInWithPassword({
    email: 'kysong@uc.ac.kr',
    password: 'uc_anchor'
  });
  
  // 실패 시 다른 관리자 계정(director@anchor.ac.kr)으로 예비 시도
  if (authRes.error) {
    console.log("kysong@uc.ac.kr 로그인 실패, director@anchor.ac.kr 계정으로 재시도...");
    authRes = await supabase.auth.signInWithPassword({
      email: 'director@anchor.ac.kr',
      password: 'uc_anchor'
    });
  }
  
  if (authRes.error) {
    console.error("로그인 실패! RLS 권한이 없어 업로드를 계속할 수 없습니다:", authRes.error.message);
    return;
  }
  
  console.log(`로그인 성공! 회원 이메일: ${authRes.data.user.email}`);
  
  // 로그인 성공 후 획득한 세션을 주입한 새 Supabase 클라이언트 생성
  const sessionToken = authRes.data.session.access_token;
  const authSupabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${sessionToken}`
      }
    }
  });

  console.log(`=== ${targetYear}차년도 수정 데이터 Supabase 업로드 시작 ===`);
  const rawData = fs.readFileSync(fileName, 'utf8');
  let jsonData;
  try {
    jsonData = JSON.parse(rawData);
  } catch (e) {
    console.error("JSON 파싱 에러! 형식을 다시 확인해 주세요:", e);
    return;
  }
  
  // year 컬럼이 targetYear 숫자인 로우를 찾아서 data 컬럼에 덮어씀 (로그인 세션이 있으므로 RLS 정책 통과)
  const { data, error } = await authSupabase
    .from('projects_data')
    .update({ data: jsonData })
    .eq('year', parseInt(targetYear, 10))
    .select();
    
  if (error) {
    console.error("업로드 실패:", error);
  } else if (!data || data.length === 0) {
    console.error("업로드 실패: 업데이트된 행이 반환되지 않았습니다. RLS 권한 혹은 연도 조건을 재확인하세요.");
  } else {
    console.log(`[연도: ${targetYear}차년도] Supabase 데이터베이스에 강제 업데이트 성공! (Row ID: ${data[0].id})`);
  }
}

run();
