/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_ENABLE_EMAIL_OTP?: string;
  readonly VITE_EMAIL_OTP_PROVIDER_READY?: string;
  readonly VITE_ENABLE_SMS_OTP?: string;
  readonly VITE_SMS_OTP_PROVIDER_READY?: string;
  readonly VITE_OTP_RESEND_COOLDOWN_MS?: string;
  readonly VITE_OTP_MAX_VERIFY_FAILURES?: string;
  readonly VITE_ENABLE_PADES_SIGNING?: string;
  readonly VITE_PADES_PROVIDER_READY?: string;
  // 추가 환경 변수가 있을 경우 여기에 정의합니다.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
