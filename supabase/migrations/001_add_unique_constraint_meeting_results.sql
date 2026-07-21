-- ==============================================================================
-- Migration File: 001_add_unique_constraint_meeting_results.sql
-- Description: meeting_results 테이블의 meeting_id 컬럼에 UNIQUE 제약조건을 부여하여
--              ON CONFLICT 제약조건 매칭 오류를 원천 방지합니다.
-- Created At: 2026-07-21
-- ==============================================================================

-- 1. meeting_results 테이블에 meeting_id UNIQUE 제약조건 추가 (이미 존재하는 경우 무시)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'meeting_results_meeting_id_key'
    ) THEN
        ALTER TABLE meeting_results 
        ADD CONSTRAINT meeting_results_meeting_id_key UNIQUE (meeting_id);
    END IF;
END $$;
