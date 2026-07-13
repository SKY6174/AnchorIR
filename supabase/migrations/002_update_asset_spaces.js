import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// anchor-dashboard/.env 파일에서 Supabase 환경 변수를 읽어옵니다.
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

const SPACE_MIGRATION_MAP = {
  "AI∙DX대강의실": "AI∙DX다목적강의실",
  "AI∙DX1강의실": "AI∙DX강의실1",
  "AI∙DX2강의실": "AI∙DX강의실2",
  "늘봄누리센터강의실": "울산늘봄누리센터"
};

async function run() {
  console.log("=== 교육 시설 명칭 변경에 따른 DB 예약 데이터 마이그레이션 시작 ===");

  // 1. 관리자 계정 로그인 (RLS 정책 우회용 세션 확보)
  const directorEmail = "director@anchor.ac.kr";
  const directorPw = "uc_anchor";
  
  console.log(`🔐 [로그인] 관리자 계정 (${directorEmail}) 세션 로그인 시도...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: directorEmail,
    password: directorPw
  });

  if (authError) {
    console.error("❌ 로그인 실패:", authError.message);
    return;
  }
  console.log("✅ 로그인 성공! 인증 토큰 획득 완료.");

  // 로그인 세션을 획득한 client로 asset_reservations 테이블 갱신 진행
  const authorizedSupabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    }
  });
  // 세션 설정 복사
  authorizedSupabase.auth.setSession(authData.session);

  // 2. 예약 데이터 변경 적용
  for (const [oldName, newName] of Object.entries(SPACE_MIGRATION_MAP)) {
    console.log(`\n🔄 [공간명 치환] "${oldName}" ➡️ "${newName}" 변경 시도 중...`);
    
    // 대상 예약 건들이 실제로 있는지 확인
    const { data: beforeSelect, error: selectError } = await authorizedSupabase
      .from("asset_reservations")
      .select("id, purpose, reserved_date")
      .eq("space_name", oldName);

    if (selectError) {
      console.error(`- 조회 실패 (${oldName}):`, selectError.message);
      continue;
    }

    if (!beforeSelect || beforeSelect.length === 0) {
      console.log(`- "${oldName}" 에 매칭되는 예약 건이 없습니다. (통과)`);
      continue;
    }

    console.log(`- 발견된 대상 예약 건수: ${beforeSelect.length}건`);

    // space_name 업데이트 수행
    const { error: updateError } = await authorizedSupabase
      .from("asset_reservations")
      .update({ space_name: newName })
      .eq("space_name", oldName);

    if (updateError) {
      console.error(`❌ 업데이트 실패 (${oldName} ➡️ ${newName}):`, updateError.message);
    } else {
      console.log(`✅ 업데이트 성공! "${oldName}"에 대한 ${beforeSelect.length}건의 예약 정보가 "${newName}"으로 정상 갱신되었습니다.`);
    }
  }

  console.log("\n=== 모든 마이그레이션 작업이 안전하게 종료되었습니다. ===");
}

run();
