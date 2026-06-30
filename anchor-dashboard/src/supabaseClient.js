import { createClient } from '@supabase/supabase-js';

// 1. Vite 환경 변수에서 Supabase 접속 정보(URL, Anon Key)를 가져옵니다.
// VITE_ 접두사가 붙은 환경 변수는 Vite 빌드 도구에서 클라이언트 측 코드로 안전하게 노출해 줍니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. 환경 변수가 정상적으로 등록되어 있는지 검증합니다.
// 값이 누락되었을 경우 개발자가 원인을 쉽게 찾을 수 있도록 안내 로그를 출력합니다.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase 환경 변수가 설정되지 않았습니다. 프로젝트 루트에 .env.local 파일을 생성하고 VITE_SUPABASE_URL 및 VITE_SUPABASE_ANON_KEY를 설정해 주세요.'
  );
}

// 3. Supabase 클라이언트 인스턴스를 생성하여 내보냅니다(export).
// 이 클라이언트 객체를 통해 DB 조회, 입력, 수정, 삭제(CRUD) 및 실시간 데이터 구독 등을 수행할 수 있습니다.
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
