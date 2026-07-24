import type { SatisfactionSurvey } from "../satisfaction-types";

// 수집 결과 Excel 파일로 내보내기 시뮬레이션 (xlsx 연동 라이브러리)
export const exportSatisfactionSurveyToExcel = async (survey: SatisfactionSurvey) => {
  if (!survey.responses || survey.responses.length === 0) {
    alert("수집된 응답 데이터가 없어 엑셀 파일 생성이 불가합니다.");
    return;
  }

  // 1. 헤더 행 정의
  const headers = ["응답 ID", "응답자명", "제출 일시"];
  survey.questions.forEach((_q, idx) => {
    headers.push(`질문 ${idx + 1} 점수 (5점만점)`);
    headers.push(`질문 ${idx + 1} 만족도 (%)`);
  });
  headers.push("기타 건의사항 및 주관식 피드백");

  // 2. 데이터 행 정의
  const dataRows = survey.responses.map(res => {
    const row: Array<number | string | undefined> = [res.id, res.responder, res.date];
    res.scores.forEach(s => {
      row.push(s);
      row.push(s * 20); // 100점 환산
    });
    row.push(res.comment || "");
    return row;
  });

  const worksheetData = [
    [`만족도조사 보고서 (ID: ${survey.id})`],
    [`조사제목: ${survey.title}`],
    [`조사목적: ${survey.purpose}`],
    [`수행부서: ${survey.department} | 대상: ${survey.target} | 기간: ${survey.startDate} ~ ${survey.endDate}`],
    [],
    headers,
    ...dataRows
  ];

  // XLSX 생성
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // 스타일을 위한 열 넓이 설정 자동화
  ws["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, ...survey.questions.map(() => ({ wch: 22 })), { wch: 45 }];

  XLSX.utils.book_append_sheet(wb, ws, "만족도 조사 결과");
  XLSX.writeFile(wb, `satisfaction_survey_${survey.id}.xlsx`);
};
