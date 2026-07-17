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

// 3. 크래시 방지용 더미(Mock) 폴백 객체 정의
// 환경 변수가 없거나 초기화에 실패할 경우, 메서드 체이닝 시 에러가 터져 화면이 화이트 스크린이 되는 것을 방지합니다.
const createDummyClient = (initError) => {
  const dummyQueryBuilder = {
    select: function() { return this; },
    insert: function() { return this; },
    update: function() { return this; },
    delete: function() { return this; },
    eq: function() { return this; },
    single: function() { return this; },
    then: function(resolve) {
      // Promise처럼 작동하여 await 호출 시 에러 정보와 빈 결과를 리턴합니다.
      resolve({ data: null, error: initError });
    }
  };

  return {
    from: () => dummyQueryBuilder,
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: initError }),
      signOut: () => Promise.resolve({ error: null })
    }
  };
};

// 4. Supabase 클라이언트 생성 시도
let supabaseInstance;
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,     // 💡 브라우저 로컬스토리지에 로그인 세션을 보관하지 않음
        autoRefreshToken: false,   // 💡 만료된 토큰의 백그라운드 자동 리프레시를 차단하여 콘솔 400 에러 원천 방어
        detectSessionInUrl: false  // 💡 URL 내 세션 해시 감지 방지
      }
    });
  } else {
    const errorMsg = new Error('Supabase 환경 변수가 누락되었습니다.');
    supabaseInstance = createDummyClient(errorMsg);
  }
} catch (e) {
  console.error('Supabase 클라이언트 생성 실패:', e);
  supabaseInstance = createDummyClient(e);
}

export const supabase = supabaseInstance;

