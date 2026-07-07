-- 045_update_2025_scholarships_approval_date.sql
-- 1차년도(2025) 장학금 데이터의 승인일을 '2025-12-31'로 일괄 할당

UPDATE public.scholarships
SET approval_date = '2025-12-31'
WHERE year = 1;
