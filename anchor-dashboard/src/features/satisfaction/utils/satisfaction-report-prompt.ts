import type { SatisfactionSurvey } from "../satisfaction-types";

export const buildSatisfactionReportPrompt = (
  survey: SatisfactionSurvey,
  avgScore: number,
  responsesCount: number
) => {
  const qList = survey.questions.map((q, i) => `문항 ${i+1}: ${q}`).join("\n");
  const commentList = survey.responses.filter(r => r.comment).map(r => `- ${r.comment}`).join("\n");
  return `
당신은 대학 RISE(앵커) 사업의 만족도 조사 전문 분석관입니다.
아래 만족도 조사 데이터를 분석하여 200~300자 이내의 한글 종합 평가(총평)를 작성해 주세요.

[조사 개요]
- 조사 ID: ${survey.id}
- 수행부서: ${survey.department}
- 조사제목: ${survey.title}
- 조사목적: ${survey.purpose}
- 대상: ${survey.target}
- 참여 인원: ${responsesCount}명
- 100점 환산 평균 점수: ${avgScore}점 / 100점

[조사 문항]
${qList}

[수집된 주관식 피드백]
${commentList || "(없음)"}

[요구사항]
1. 분석 결과를 근거로 잘된 부분(강점)과 개선이 필요한 부분(보안점)을 명확하게 도출하세요.
2. 약 200~300자 분량으로 작성하세요 (존댓말로 정중하고 신뢰감 있게).
3. "종합 의견:" 이나 "총평:" 등의 접두사는 제외하고 바로 본문만 출력하세요.
`;
};
