-- 064_update_all_member_passwords.sql
-- (보안 및 권한 가드) 원격 Supabase 배포 시 auth.users 직접 INSERT/UPDATE 제한으로 인한 빌드 깨짐을 방지하기 위해 
-- 실제 패스워드 재설정 작업은 065번 RPC 함수 및 JIT 가드 단계로 이관합니다.
SELECT 1;
