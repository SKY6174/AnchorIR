-- 027_add_ai_report_to_satisfaction_surveys.sql
-- satisfaction_surveys 테이블에 AI 만족도 종합 총평을 저장하기 위한 ai_report 컬럼 추가

ALTER TABLE satisfaction_surveys ADD COLUMN IF NOT EXISTS ai_report TEXT;
