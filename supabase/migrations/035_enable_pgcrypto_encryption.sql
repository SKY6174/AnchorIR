-- 035_enable_pgcrypto_encryption.sql
-- 1. PostgreSQL pgcrypto 확장 모듈 활성화
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. 향후 개인정보 및 민감 데이터 암호화 테이블 설계 시 사용 가능한 예제 뷰(View) 및 함수 가이드라인 수립
-- 데이터베이스 단에서 암복호화하는 SQL 내장 함수:
--   - 암호화: pgp_sym_encrypt(text, 비밀키) -> bytea (바이트 데이터 형태로 안전하게 적재)
--   - 복호화: pgp_sym_decrypt(bytea, 비밀키) -> text (평문으로 변환)

-- 아래는 암호화 성능을 실증하기 위해 생성하는 대칭키 암복호화 유틸리티 함수 쌍입니다.
-- (실제 서비스 기밀 데이터 암호화는 이 유틸리티를 활용하거나, pgcrypto를 쿼리 레벨에서 직접 호출합니다.)

CREATE OR REPLACE FUNCTION encrypt_sensitive_data(plain_text text, encryption_key text)
RETURNS bytea AS $$
BEGIN
  RETURN pgp_sym_encrypt(plain_text, encryption_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data bytea, encryption_key text)
RETURNS text AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted_data, encryption_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
