import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env', 'utf8');
const env = Object.fromEntries(envFile.split('\n').filter(Boolean).map(line => {
  const parts = line.split('=');
  const key = parts[0].trim();
  const val = parts.slice(1).join('=').trim().replace(/["\r]/g, '');
  return [key, val];
}));

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const committeesData = [
  {
    id: 'total',
    name: '앵커총괄위원회',
    full_name: '앵커총괄위원회 (구. 앵커사업위원회)',
    badge: '최고의사결정',
    color: 'linear-gradient(135deg, #ec4899 0%, #be123c 100%)',
    purpose: '앵커 사업 총괄 / 사업계획서 심의 / 교육환경 및 기자재 구축심의 / 예산변경안 최종승인 등',
    description: '울산 지역 앵커 사업의 최고 의사 결정 기구로, 사업의 총괄 방향 설정, 주요 계획의 심의·의결, 성과 지표 평가 및 환류 체계 조율 등의 핵심 역할을 담당합니다.',
    constitution: '내부 9인, 외부 2인을 포함한 11인 내외',
    cycle: '반기별 1회 개최 (필요 시 임시 위원회 소집)',
    functions: [
      '앵커 사업 총괄 및 연도별 사업계획서 심의·의결',
      '교육환경 개선 및 기자재 구축 심의·확정',
      '사업비 대규모 변경(예산변경안) 최종 승인 및 조율',
      '기타 앵커 사업 운영 상 최고 의사결정이 필요한 현안 해결'
    ]
  },
  {
    id: 'planning',
    name: '앵커기획위원회',
    full_name: '앵커기획위원회 (구. 앵커사업추진위원회)',
    badge: '기획·실무조율',
    color: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    purpose: '대학/지자체 발전계획에 의거한 앵커사업계획서 작성 및 타당성 검토 / 사업계획서 및 사업결과보고서 운영 등',
    description: '세부 추진전략 수립 및 프로그램 기획을 실무적으로 조율하는 위원회로, 대학발전계획 및 울산광역시 발전계획에 근거하여 사업계획의 적합성과 타당성을 검토합니다.',
    constitution: '앵커사업단장 및 내부위원 11인, 외부위원 4인을 포함한 15인 내외',
    cycle: '분기별 1회 개최 (실무 단계 상시 협의)',
    functions: [
      '대학발전계획 및 울산광역시 기본계획 연계성 타당성 검토',
      '앵커 사업계획서 기획·작성 및 결과보고서 운영 검토',
      '추진전략(S) 및 프로그램(PG) 실무 심의 및 조율',
      '참여 대학 및 외부 대학/기관과의 협력 연계 프로세스 설계'
    ]
  },
  {
    id: 'eval',
    name: '앵커사업자체평가위원회',
    full_name: '앵커사업자체평가위원회 (상임)',
    badge: '성과평가',
    color: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    purpose: '사업계획서 및 목표에 기반한 사업성과 평가 (중간평가/최종평가)',
    description: '참여 부서 및 외부 협력 기관의 사업 실적을 공정하고 객관적으로 자체 평가하는 상임 위원회입니다. 위원장은 외부 위원 중에서 호선으로 선출하여 평가의 공정성과 전문성을 제고합니다.',
    constitution: '외부위원을 포함하여 내부 4인, 외부 5인을 포함한 9인 내외',
    cycle: '연 1회 정기 평가 (필요 시 중간/최종 평가 개최)',
    functions: [
      '성과목표 대비 달성도 및 사업 타당성 자체 평가',
      '중간 평가 및 최종 성과 분석을 통한 개선 조치 마련',
      '각 사업부서별 실적 검증 및 환류 평가 연계',
      '평가 결과에 의거한 차년도 예산 조정 방안 심의'
    ]
  },
  {
    id: 'budget',
    name: '앵커사업비관리위원회',
    full_name: '앵커사업비관리위원회',
    badge: '재정투명성',
    color: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    purpose: '사업비 집행 가이드라인에 따라 사업 예산 집행 모니터링 / 집행률 점검 및 관리 / 사업비 조정 심의 등',
    description: '사업 예산 집행의 규정 준수 여부를 모니터링하고 집행률을 극대화하기 위해 재정 건전성을 상시 관리·심의하는 특별 재정 관리 기구입니다.',
    constitution: '앵커사업단장을 포함하여 7인 내외 (내부 6인, 외부 1인)',
    cycle: '매 분기 정기 개최 (예산 변경 수시 심의 병행)',
    functions: [
      '국고 및 시비 매칭 자금 집행 가이드라인 점검 및 통제',
      '분기별 예산 집행률 분석 및 집행 촉진 대책 심의',
      '단위과제(UP) 간 대규모 예산 조정 및 재배분 심의',
      '사업비 정산 및 가이드 준수 여부 정밀 감독'
    ]
  },
  {
    id: 'advisory',
    name: '앵커사업자문회의',
    full_name: '앵커사업자문회의',
    badge: '외부전문가자문',
    color: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    purpose: '앵커 사업 정책 방향 및 지역 정주형 인재 양성을 위한 다변화 정책 자문',
    description: '타 대학 혁신사업단 및 외부 전문기관의 전략적 자문을 구하고 지산학연 광역 네트워킹을 확대하기 위해 학계 및 행정계 전문가로 구성된 자문 기구입니다.',
    constitution: '외부전문가 중심 (교외 위원 7인 및 간사 교내 1인)',
    cycle: '반기별 1회 정기 회의 (현안에 따른 수시 자문 개최)',
    functions: [
      '울산 지역 혁신 인재 양성 및 정주 환경 조성을 위한 아이디어 제공',
      '타 대학(영남이공대, 거제대 등) 선도 사례 공유 및 연계 방안 수립',
      '지산학연 거버넌스 정책 동향 분석 및 전문 자문',
      '사업의 장기적 발전전략 및 핵심 프로그램 다각화 제언'
    ]
  }
];

const membersData = [
  // total
  { committee_id: 'total', type: '위원장', name: '조홍래', org: '울산과학대학교', dept: '-', rank: '총장', location: '교내', note: '', sort_order: 1 },
  { committee_id: 'total', type: '위원', name: '김성철', org: '울산과학대학교', dept: '-', rank: '부총장', location: '교내', note: '', sort_order: 2 },
  { committee_id: 'total', type: '위원', name: '변홍석', org: '울산과학대학교', dept: '교무처', rank: '처장', location: '교내', note: '', sort_order: 3 },
  { committee_id: 'total', type: '위원', name: '김강연', org: '울산과학대학교', dept: '기획처', rank: '처장', location: '교내', note: '인사발령으로 인한 변경', sort_order: 4 },
  { committee_id: 'total', type: '위원', name: '이주영', org: '울산과학대학교', dept: '학생취업처', rank: '처장', location: '교내', note: '', sort_order: 5 },
  { committee_id: 'total', type: '위원', name: '박일현', org: '울산과학대학교', dept: '총무처', rank: '처장', location: '교내', note: '', sort_order: 6 },
  { committee_id: 'total', type: '위원', name: '송경영', org: '울산과학대학교', dept: '산학협력단(앵커)', rank: '단장', location: '교내', note: '', sort_order: 7 },
  { committee_id: 'total', type: '위원', name: '정문호', org: '정테크', dept: '-', rank: '대표', location: '교외', note: '신규 추가', sort_order: 8 },
  { committee_id: 'total', type: '위원', name: '이경우', org: '울산발전연구원', dept: '경제산업연구실', rank: '실장', location: '교외', note: '신규 추가', sort_order: 9 },
  { committee_id: 'total', type: '간사', name: '고우근', org: '울산과학대학교', dept: '기획처', rank: '팀장', location: '교내', note: '', sort_order: 10 },

  // planning
  { committee_id: 'planning', type: '위원장', name: '김강연', org: '울산과학대학교', dept: '기획처', rank: '처장', location: '교내', note: '', sort_order: 1 },
  { committee_id: 'planning', type: '위원장', name: '송경영', org: '울산과학대학교', dept: '앵커사업단', rank: '단장', location: '교내', note: '', sort_order: 2 },
  { committee_id: 'planning', type: '위원', name: '김현수', org: '울산과학대학교', dept: '앵커사업단', rank: '본부장', location: '교내', note: '', sort_order: 3 },
  { committee_id: 'planning', type: '위원', name: '최윤아', org: '울산과학대학교', dept: '기획처', rank: '부처장', location: '교내', note: '신규 추가', sort_order: 4 },
  { committee_id: 'planning', type: '위원', name: '이동은', org: '울산과학대학교', dept: '지산학교육센터(ECC)', rank: '센터장', location: '교내', note: '', sort_order: 5 }
];

async function seed() {
  console.log("=== 위원회 데이터 시딩 및 적재 시작 ===");

  // 1. 관리자 세션 로그인
  let authRes = await supabase.auth.signInWithPassword({
    email: 'kysong@uc.ac.kr',
    password: env.VITE_SUPABASE_USER_PASSWORD || 'uc_anchor'
  });

  if (authRes.error) {
    console.log("kysong@uc.ac.kr 로그인 실패, 예비 관리자 director@anchor.ac.kr 로그인 시도...");
    authRes = await supabase.auth.signInWithPassword({
      email: 'director@anchor.ac.kr',
      password: 'uc_anchor'
    });
  }

  if (authRes.error) {
    console.error("관리자 로그인 실패:", authRes.error.message);
    return;
  }

  console.log("로그인 성공! RLS 바이패스 세션 확보 완료.");
  const sessionToken = authRes.data.session.access_token;
  
  // 인증 헤더를 주입한 임시 클라이언트 생성
  const client = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${sessionToken}`
      }
    }
  });

  try {
    // 2. committees 테이블 시드 적재
    console.log("committees 적재 시도...");
    const { error: cErr } = await client.from('committees').upsert(committeesData, { onConflict: 'id' });
    if (cErr) throw cErr;
    console.log("committees 테이블 적재 성공!");

    // 3. committee_members 테이블 시드 적재
    console.log("committee_members 적재 시도...");
    const { error: mErr } = await client.from('committee_members').upsert(membersData, { onConflict: 'committee_id,name' });
    if (mErr) throw mErr;
    console.log("committee_members 테이블 적재 성공!");

    console.log("🎉 모든 거버넌스 위원회 기초 데이터 적재가 완료되었습니다!");
  } catch (err) {
    console.error("시딩 오류 발생:", err.message);
  }
}

seed();
