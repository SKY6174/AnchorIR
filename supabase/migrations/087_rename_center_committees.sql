-- 💡 [Supabase DB 마이그레이션 규칙 7 준수]
-- 6대 센터 운영위원회 명칭을 최신 공식 이름으로 변경 및 동기화

UPDATE committees SET name = 'ECC센터운영위원회' WHERE id = 'ecc_op';
UPDATE committees SET name = 'ICC센터운영위원회' WHERE id = 'icc_op';
UPDATE committees SET name = 'RCC센터운영위원회' WHERE id = 'rcc_op';
UPDATE committees SET name = 'AID-X지원센터운영위원회' WHERE id = 'aidx_op';
UPDATE committees SET name = '울산늘봄누리센터운영위원회' WHERE id = 'neulbom_op';
UPDATE committees SET name = '신산업특화센터운영위원회' WHERE id = 'newind_op';

-- PostgREST API 스키마 캐시 새로고침 신호 전송
NOTIFY pgrst, 'reload schema';
