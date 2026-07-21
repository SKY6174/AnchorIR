/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_OPENAI_API_KEY?: string;
  // 추가 환경 변수가 있을 경우 여기에 정의합니다.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
