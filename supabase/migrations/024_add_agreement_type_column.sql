-- 1. agreements 테이블에 협약유형(agreement_type) 컬럼을 추가합니다.
-- 기본값은 '-' 이며, 종류는 '프리미엄', '무료', '-' 세 가지를 지원합니다.
ALTER TABLE agreements 
ADD COLUMN IF NOT EXISTS agreement_type TEXT DEFAULT '-';
