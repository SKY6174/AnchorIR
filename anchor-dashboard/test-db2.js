import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const envFile = fs.readFileSync('.env', 'utf8');
const env = Object.fromEntries(envFile.split('\n').filter(Boolean).map(line => line.split('=')));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY.replace(/["\r]/g, ''));

async function run() {
  const meetingId = 'a27781e2-6bc5-4c76-baf4-45c57c649e8e';
  
  // 1. 기존 결과 삭제
  await supabase.from('meeting_results').delete().eq('meeting_id', meetingId);

  // 2. meeting_results에 결과 보고서 탑재
  const { data: _resData, error: resError } = await supabase
    .from('meeting_results')
    .insert([{
      meeting_id: meetingId,
      is_established: true,
      decision_status: 'APPROVED',
      ai_summary: '### 1. 종합 평가 동향 및 핵심 논지\n본 기획위원회에서는 2차년도 사업계획서 수정안을 적극 심의하였으며, 참석한 위원 전원 만장일치 찬성으로 안건을 가결 처리하였습니다.\n\n### 2. 안건별 분석 보고 및 보완 권고사항\n- 계획서 심의 안건에 대한 예산 배분 조정 필요성에 다수 공감함.\n\n### 3. 향후 추진 방향\n- 의결 결과에 따라 차주 내 수정계획서 최종 확정 예정.',
      official_minutes: '[회의록 자동 생성] 본 위원회는 재적 16명 중 3명 참석으로 성원되었으며, 총 1개 의안에 대한 심의 의결 결과 최종 가결 처리되었음을 증명합니다.',
      published_at: new Date().toISOString()
    }]);

  if (resError) {
    console.error("Results upsert failed:", resError);
    return;
  }
  console.log("Upserted meeting results successfully!");

  // 2. committee_meetings 상태를 REPORTED로 업데이트
  const { data: _meetData, error: meetError } = await supabase
    .from('committee_meetings')
    .update({ status: 'REPORTED' })
    .eq('id', meetingId);

  if (meetError) {
    console.error("Meeting status update failed:", meetError);
    return;
  }
  console.log("Updated meeting status to REPORTED successfully!");
}

run();
