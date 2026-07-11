-- 066_update_members_real_phones.sql
-- 실제 구성원 명단 엑셀과 매치되도록 rise_members 테이블의 전화번호/사무실 정보를 업데이트하고
-- 065번 RPC 함수를 트리거하여 변경된 진짜 휴대폰 뒷자리를 기반으로 초기 비밀번호를 실시간 일괄 갱신합니다.

-- 1. rise_members 테이블의 전화번호 및 사무실 정보 일괄 갱신
UPDATE rise_members SET "phoneOffice" = '052-230-0798', "phoneMobile" = '010-5171-7140' WHERE email = 'delee@uc.ac.kr';
UPDATE rise_members SET "phoneOffice" = '052-279-3094', "phoneMobile" = '010-2243-9802' WHERE email = 'kbkim@uc.ac.kr';
UPDATE rise_members SET "phoneOffice" = '052-230-0643', "phoneMobile" = '010-4299-3119' WHERE email = 'yhhyun@uc.ac.kr';
UPDATE rise_members SET "phoneOffice" = '052-230-0786', "phoneMobile" = '010-3069-6996' WHERE id = 'm-06b' OR email = 'hdlee@uc.ac.kr';
UPDATE rise_members SET "phoneOffice" = '052-230-0724', "phoneMobile" = '010-2512-1233' WHERE email = 'gphong@uc.ac.kr';
UPDATE rise_members SET "phoneOffice" = '052-230-0798', "phoneMobile" = '010-5204-4521' WHERE email = 'kijang@uc.ac.kr';
UPDATE rise_members SET "phoneOffice" = '052-230-0798', "phoneMobile" = '010-4353-7720' WHERE email = 'hsko@uc.ac.kr';
UPDATE rise_members SET "phoneOffice" = '052-279-3138', "phoneMobile" = '010-8927-8740' WHERE email = 'shyang@uc.ac.kr';
UPDATE rise_members SET "phoneOffice" = '052-279-3123', "phoneMobile" = '010-9408-9672' WHERE email = 'skim@uc.ac.kr';
UPDATE rise_members SET "phoneOffice" = '052-230-0738', "phoneMobile" = '010-5293-3915' WHERE email = 'mrhan@uc.ac.kr';
UPDATE rise_members SET "phoneOffice" = '052-230-0663', "phoneMobile" = '010-9449-3310' WHERE email = 'mkkim@uc.ac.kr';
UPDATE rise_members SET "phoneOffice" = '052-230-0756', "phoneMobile" = '010-7676-8938' WHERE email = 'shlee@uc.ac.kr';
UPDATE rise_members SET "phoneOffice" = '052-230-0763', "phoneMobile" = '010-4132-0866' WHERE email = 'shpark@uc.ac.kr';
UPDATE rise_members SET "phoneOffice" = '052-279-3102', "phoneMobile" = '010-7651-7723' WHERE email = 'jjlee@uc.ac.kr';

-- 2. 065번 RPC 함수 실행을 통해 새 전화번호 뒷자리 기반 비밀번호 자동 갱신 트리거
-- 원격 배포 파이프라인에서 슈퍼유저 권한으로 일괄 갱신을 구동합니다.
SELECT public.reset_all_member_passwords_v2();
