-- procurement_equipment 테이블에 규격(spec) 및 단위(item_unit) 컬럼 추가
ALTER TABLE procurement_equipment 
ADD COLUMN spec TEXT DEFAULT '',
ADD COLUMN item_unit TEXT DEFAULT '대';
