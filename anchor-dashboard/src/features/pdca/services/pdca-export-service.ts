import type { Dispatch, SetStateAction } from "react";
import type { LegacyPdcaRecord } from "../utils/pdca-utils";
import { formatAssignee, formatToMillionWon } from "../utils/pdca-utils";

export interface PdcaExportContext {
  activeProg: LegacyPdcaRecord | undefined;
  selectedYear: number;
  setIsDownloadingPdf: Dispatch<SetStateAction<boolean>>;
  inputBudgetNational: string;
  inputSpentNational: string;
  inputBudgetCity: string;
  inputSpentCity: string;
  inputBudgetExternal: string;
  inputSpentExternal: string;
  inputCoopDept1: string;
  inputCoopDept2: string;
  inputTargetAudience: string;
  inputTimeline: string;
  inputFrequency: string;
  inputTargetParticipants: string;
  inputTargetParticipantsUnit: string;
  inputTargetParticipantsName: string;
  inputTargetDevelopments: string;
  inputTargetDevelopmentsUnit: string;
  inputTargetDevelopmentsName: string;
  inputTargetEtc: string;
  inputTargetEtcUnit: string;
  inputParticipants: string;
  inputActualDevelopments: string;
  inputActualEtc: string;
  inputSatisfaction: string;
  inputAchievements: string;
  inputEvalType: string;
  inputExcellent: string;
  inputImprovePlan: string;
  inputDeficiency: string;
  inputActionItem: string;
  inputBudgetCategories: LegacyPdcaRecord[];
  inputMonthlyPDCA: string[];
  inputMonthlyPDCAActual: string[];
  inputAudienceParticipants: Record<string, string>;
}

// 💡 [프로그램 ID별 PDF 내보내기 - P, D, C, A를 단일 파일 결합 및 여백 고정]
export const exportPdcaProgramPdf = async ({
  activeProg,
  selectedYear,
  setIsDownloadingPdf,
  inputBudgetNational,
  inputSpentNational,
  inputBudgetCity,
  inputSpentCity,
  inputBudgetExternal,
  inputSpentExternal,
  inputBudgetCategories,
  inputMonthlyPDCA,
  inputMonthlyPDCAActual,
  inputCoopDept1,
  inputCoopDept2,
  inputTargetAudience,
  inputTimeline: _inputTimeline,
  inputFrequency,
  inputTargetParticipants,
  inputTargetParticipantsUnit,
  inputTargetParticipantsName,
  inputTargetDevelopments,
  inputTargetDevelopmentsUnit,
  inputTargetDevelopmentsName,
  inputTargetEtc,
  inputTargetEtcUnit,
  inputParticipants,
  inputAudienceParticipants,
  inputActualDevelopments,
  inputActualEtc,
  inputSatisfaction,
  inputAchievements,
  inputEvalType,
  inputExcellent,
  inputImprovePlan,
  inputDeficiency,
  inputActionItem,
}: PdcaExportContext) => {
  if (!activeProg) return;
  setIsDownloadingPdf(true);
  const pdfWindow = window as typeof window & { html2pdf?: any };

  try {
    await new Promise((resolve, reject) => {
      if (pdfWindow.html2pdf) return resolve(pdfWindow.html2pdf);
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = () => resolve(pdfWindow.html2pdf);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  } catch (e) {
    console.error(e);
    setIsDownloadingPdf(false);
    alert("PDF 변환 엔진 로드 중 오류가 발생했습니다.");
    return;
  }

  const py = activeProg.years?.[selectedYear] || {};
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const fileName = `[${activeProg.id}]${activeProg.title}_PDCA_${dateStr}.pdf`;

  const natRate = parseFloat(inputBudgetNational) > 0 ? (parseFloat(inputSpentNational) / parseFloat(inputBudgetNational) * 100).toFixed(1) : "0.0";
  const cityRate = parseFloat(inputBudgetCity) > 0 ? (parseFloat(inputSpentCity) / parseFloat(inputBudgetCity) * 100).toFixed(1) : "0.0";
  const extRate = parseFloat(inputBudgetExternal) > 0 ? (parseFloat(inputSpentExternal) / parseFloat(inputBudgetExternal) * 100).toFixed(1) : "0.0";
  const totalBudget = (py.budget_main || 0) + (py.budget_carry || 0);
  const totalSpent = (py.spent_main || 0) + (py.spent_carry || 0);
  const totalRate = totalBudget > 0 ? (totalSpent / totalBudget * 100).toFixed(1) : "0.0";

  const kpiLinksHtml = activeProg.kpi_links?.map((kLink: string, idx: number) => {
    const kType = activeProg.kpi_types?.[idx] || "자율";
    return kLink ? `<li><strong>[${kType}]</strong> ${kLink}</li>` : "";
  }).filter(Boolean).join("") || "<li>연계된 핵심성과지표(KPI)가 없습니다.</li>";

  const categoryRows = inputBudgetCategories.filter(c => c.category).map((c, i) => `
    <tr>
      <td style="border: 1px solid #d1d5db; padding: 7px 5px; text-align: center; font-size: 9.5px;">${i + 1}</td>
      <td style="border: 1px solid #d1d5db; padding: 7px 5px; font-size: 9.5px;">${c.category}</td>
      <td style="border: 1px solid #d1d5db; padding: 7px 5px; text-align: right; font-size: 9.5px;">${c.budget ? (parseFloat(c.budget) * 1000000).toLocaleString() : "0"}</td>
      <td style="border: 1px solid #d1d5db; padding: 7px 5px; text-align: right; font-size: 9.5px;">${c.budget_carry ? (parseFloat(c.budget_carry) * 1000000).toLocaleString() : "0"}</td>
      <td style="border: 1px solid #d1d5db; padding: 7px 5px; text-align: right; font-size: 9.5px;">${c.spent ? parseInt(c.spent.replace(/,/g, "")).toLocaleString() : "0"}</td>
      <td style="border: 1px solid #d1d5db; padding: 7px 5px; text-align: right; font-size: 9.5px;">${c.spent_carry ? parseInt(c.spent_carry.replace(/,/g, "")).toLocaleString() : "0"}</td>
    </tr>
  `).join("");

  const _pMonths = inputMonthlyPDCA.map((val, idx) => val ? `${idx + 3}월(${val})` : null).filter(Boolean).join(", ") || "일정 없음";
  const _dMonths = inputMonthlyPDCAActual.map((val, idx) => val ? `${idx + 3}월(${val})` : null).filter(Boolean).join(", ") || "일정 없음";

  // 💡 [비주얼 타임라인 렌더링 헬퍼 함수]
  const renderTimelineCell = (val: string) => {
    if (!val) {
      return `<td style="padding: 4px 1px; border-right: 1px solid #e5e7eb; vertical-align: middle;">
        <div style="border: 1px dashed #d1d5db; border-radius: 4px; height: 16px; line-height: 16px; color: #9ca3af; font-size: 8px; font-weight: bold; background: #ffffff;">-</div>
      </td>`;
    }
    
    let bg = "#e5e7eb";
    let color = "#ffffff";
    let label = val.toUpperCase();
    
    if (label === "P") {
      bg = "#3b82f6";
    } else if (label === "D") {
      bg = "#10b981";
    } else if (label === "C") {
      bg = "#f59e0b";
    } else if (label === "A") {
      bg = "#8b5cf6";
    } else if (label === "C/A") {
      bg = "#a78bfa"; // 캡슐 내 가독성을 위한 단색 보라/주황 혼합형 톤 보정
    }
    
    return `<td style="padding: 4px 1px; border-right: 1px solid #e5e7eb; vertical-align: middle;">
      <div style="background: ${bg}; color: ${color}; border-radius: 4px; height: 16px; line-height: 16px; font-weight: bold; font-size: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">${label}</div>
    </td>`;
  };

  const planCellsHtml = inputMonthlyPDCA.map((val, idx) => {
    const cellHtml = renderTimelineCell(val);
    if (idx === 11) return cellHtml.replace('border-right: 1px solid #e5e7eb;', 'border-right: none;');
    return cellHtml;
  }).join("");

  const actualCellsHtml = inputMonthlyPDCAActual.map((val, idx) => {
    const cellHtml = renderTimelineCell(val);
    if (idx === 11) return cellHtml.replace('border-right: 1px solid #e5e7eb;', 'border-right: none;');
    return cellHtml;
  }).join("");

  const startYr = 2024 + selectedYear;
  const endYr = 2025 + selectedYear;

  const timelineTableHtml = `
    <div style="margin-top: 5px; margin-bottom: 12px; border: 1px solid #d1d5db; border-radius: 6px; padding: 6px; background: #f9fafb; width: 100%;">
      <div style="text-align: center; font-size: 10px; font-weight: bold; margin-bottom: 6px; color: #1e3a8a;">
        ${selectedYear}차년도 Timeline
      </div>
      <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 8.5px; table-layout: fixed;">
        <thead>
          <tr style="color: #4b5563; font-weight: bold;">
            <th colspan="10" style="padding: 2px; border-right: 1px solid #e5e7eb; font-size: 8px; color: #1e3a8a; border-bottom: 1px solid #e5e7eb;">${startYr}년</th>
            <th colspan="2" style="padding: 2px; font-size: 8px; color: #1e3a8a; border-bottom: 1px solid #e5e7eb;">${endYr}년</th>
          </tr>
          <tr style="background: #e5e7eb; color: #374151; font-weight: bold; border-bottom: 1px solid #d1d5db;">
            <td style="padding: 3px 1px; border-right: 1px solid #d1d5db;">3월</td>
            <td style="padding: 3px 1px; border-right: 1px solid #d1d5db;">4월</td>
            <td style="padding: 3px 1px; border-right: 1px solid #d1d5db;">5월</td>
            <td style="padding: 3px 1px; border-right: 1px solid #d1d5db;">6월</td>
            <td style="padding: 3px 1px; border-right: 1px solid #d1d5db;">7월</td>
            <td style="padding: 3px 1px; border-right: 1px solid #d1d5db;">8월</td>
            <td style="padding: 3px 1px; border-right: 1px solid #d1d5db;">9월</td>
            <td style="padding: 3px 1px; border-right: 1px solid #d1d5db;">10월</td>
            <td style="padding: 3px 1px; border-right: 1px solid #d1d5db;">11월</td>
            <td style="padding: 3px 1px; border-right: 1px solid #d1d5db;">12월</td>
            <td style="padding: 3px 1px; border-right: 1px solid #d1d5db;">1월</td>
            <td style="padding: 3px 1px;">2월</td>
          </tr>
        </thead>
        <tbody>
          <!-- 계획 (Plan) 행 -->
          <tr>
            ${planCellsHtml}
          </tr>
          <!-- 구분 행 (화살표 대응 가이드 점선) -->
          <tr style="height: 4px;">
            <td colspan="12" style="padding: 0; vertical-align: middle;">
              <div style="height: 1px; border-top: 1px dashed #d1d5db; margin: 1px 0;"></div>
            </td>
          </tr>
          <!-- 실행 (Do) 행 -->
          <tr>
            ${actualCellsHtml}
          </tr>
        </tbody>
      </table>
      
      <div style="display: flex; justify-content: center; gap: 8px; margin-top: 5px; font-size: 7.5px; color: #6b7280; line-height: 1;">
        <div style="display: flex; align-items: center; gap: 2px;"><span style="display:inline-block; width:6px; height:6px; background:#3b82f6; border-radius:50%;"></span> Plan</div>
        <div style="display: flex; align-items: center; gap: 2px;"><span style="display:inline-block; width:6px; height:6px; background:#10b981; border-radius:50%;"></span> Do</div>
        <div style="display: flex; align-items: center; gap: 2px;"><span style="display:inline-block; width:6px; height:6px; background:#f59e0b; border-radius:50%;"></span> Check</div>
        <div style="display: flex; align-items: center; gap: 2px;"><span style="display:inline-block; width:6px; height:6px; background:#8b5cf6; border-radius:50%;"></span> Act</div>
      </div>
    </div>
  `;

  const htmlContent = `
    <div style="padding: 0; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; color: #333333; background: #ffffff; width: 100%;">
      <div style="text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 15px;">
        <span style="font-size: 10px; color: #6b7280; text-transform: uppercase;">Ulsan College Anchor Project</span>
        <h1 style="font-size: 18px; font-weight: 800; color: #1e3a8a; margin: 4px 0 0 0;">[${activeProg.id}] ${activeProg.title}</h1>
        <p style="font-size: 11px; color: #4b5563; margin: 4px 0 0 0;">세부 프로그램 PDCA 성과환류 결과보고서 (${selectedYear}차년도)</p>
      </div>

      <!-- 1. 기본 정보 개요 -->
      <h3 style="font-size: 11px; font-weight: bold; color: #1e3a8a; margin: 0 0 6px 0; border-left: 3px solid #1e3a8a; padding-left: 6px;">1. 세부 프로그램 개요</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #d1d5db; font-size: 9.5px;">
        <colgroup>
          <col style="width: 20%;" />
          <col style="width: 30%;" />
          <col style="width: 20%;" />
          <col style="width: 30%;" />
        </colgroup>
        <tr>
          <th style="border: 1px solid #d1d5db; background: #f3f4f6; padding: 7px; text-align: left; font-weight: bold;">단위과제</th>
          <td style="border: 1px solid #d1d5db; padding: 7px;" colspan="3">${activeProg.unitTitle || "미지정"}</td>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; background: #f3f4f6; padding: 7px; text-align: left; font-weight: bold;">담당부서(협업)</th>
          <td style="border: 1px solid #d1d5db; padding: 7px;">${inputCoopDept1 || "없음"}${inputCoopDept2 ? `, ${inputCoopDept2}` : ""}</td>
          <th style="border: 1px solid #d1d5db; background: #f3f4f6; padding: 7px; text-align: left; font-weight: bold;">사업 대상</th>
          <td style="border: 1px solid #d1d5db; padding: 7px;">${inputTargetAudience || "미정"}</td>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; background: #f3f4f6; padding: 7px; text-align: left; font-weight: bold;">담당연구원</th>
          <td style="border: 1px solid #d1d5db; padding: 7px;">${formatAssignee(activeProg.assignees?.[selectedYear] !== undefined ? activeProg.assignees[selectedYear] : activeProg.assignee)}</td>
          <th style="border: 1px solid #d1d5db; background: #f3f4f6; padding: 7px; text-align: left; font-weight: bold;">총 예산 (집행률)</th>
          <td style="border: 1px solid #d1d5db; padding: 7px; font-weight: bold;">${formatToMillionWon(totalBudget)}백만원 (${totalRate}%)</td>
        </tr>
      </table>

      <!-- 2. 재원별/비목별 예산 계획 및 집행 실적 -->
      <h3 style="font-size: 11px; font-weight: bold; color: #1e3a8a; margin: 15px 0 6px 0; border-left: 3px solid #1e3a8a; padding-left: 6px;">2. 예산 계획 및 집행 실적</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1px solid #d1d5db; font-size: 9.5px; table-layout: fixed;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="border: 1px solid #d1d5db; padding: 7px; font-weight: bold; text-align: center; width: 25%;">재원 구분</th>
            <th style="border: 1px solid #d1d5db; padding: 7px; font-weight: bold; text-align: center; width: 25%;">예산액 (백만원)</th>
            <th style="border: 1px solid #d1d5db; padding: 7px; font-weight: bold; text-align: center; width: 25%;">집행액 (백만원)</th>
            <th style="border: 1px solid #d1d5db; padding: 7px; font-weight: bold; text-align: center; width: 25%;">집행률</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 7px; text-align: center; font-weight: bold;">국고</td>
            <td style="border: 1px solid #d1d5db; padding: 7px; text-align: right;">${inputBudgetNational}</td>
            <td style="border: 1px solid #d1d5db; padding: 7px; text-align: right;">${inputSpentNational}</td>
            <td style="border: 1px solid #d1d5db; padding: 7px; text-align: center; font-weight: bold;">${natRate}%</td>
          </tr>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 7px; text-align: center; font-weight: bold;">시비</td>
            <td style="border: 1px solid #d1d5db; padding: 7px; text-align: right;">${inputBudgetCity}</td>
            <td style="border: 1px solid #d1d5db; padding: 7px; text-align: right;">${inputSpentCity}</td>
            <td style="border: 1px solid #d1d5db; padding: 7px; text-align: center; font-weight: bold;">${cityRate}%</td>
          </tr>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 7px; text-align: center; font-weight: bold;">외부</td>
            <td style="border: 1px solid #d1d5db; padding: 7px; text-align: right;">${inputBudgetExternal}</td>
            <td style="border: 1px solid #d1d5db; padding: 7px; text-align: right;">${inputSpentExternal}</td>
            <td style="border: 1px solid #d1d5db; padding: 7px; text-align: center; font-weight: bold;">${extRate}%</td>
          </tr>
        </tbody>
      </table>

      ${categoryRows ? `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #d1d5db; font-size: 9px; table-layout: fixed;">
        <colgroup>
          <col style="width: 8%;" />
          <col style="width: 32%;" />
          <col style="width: 15%;" />
          <col style="width: 15%;" />
          <col style="width: 15%;" />
          <col style="width: 15%;" />
        </colgroup>
        <thead>
          <tr style="background: #e5e7eb;">
            <th style="border: 1px solid #d1d5db; padding: 6px; font-weight: bold; text-align: center;">순번</th>
            <th style="border: 1px solid #d1d5db; padding: 6px; font-weight: bold; text-align: center;">세부 비목 (카테고리)</th>
            <th style="border: 1px solid #d1d5db; padding: 6px; font-weight: bold; text-align: center;">본예산 계획(원)</th>
            <th style="border: 1px solid #d1d5db; padding: 6px; font-weight: bold; text-align: center;">이월예산 계획(원)</th>
            <th style="border: 1px solid #d1d5db; padding: 6px; font-weight: bold; text-align: center;">본집행 실적(원)</th>
            <th style="border: 1px solid #d1d5db; padding: 6px; font-weight: bold; text-align: center;">이월집행 실적(원)</th>
          </tr>
        </thead>
        <tbody>
          ${categoryRows}
        </tbody>
      </table>
      ` : ""}

      <!-- 3. PDCA 단계별 세부 평가 -->
      <h3 style="font-size: 11px; font-weight: bold; color: #1e3a8a; margin: 15px 0 6px 0; border-left: 3px solid #1e3a8a; padding-left: 6px;">3. PDCA 단계별 상세 성과환류</h3>
      
      <!-- 💡 계획 & 실행 추진일정 비주얼 타임라인 표 (100% 가용폭) -->
      ${timelineTableHtml}

      <!-- P / D 테이블 -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; border: 1px solid #d1d5db; font-size: 9.5px; table-layout: fixed;">
        <colgroup>
          <col style="width: 50%;" />
          <col style="width: 50%;" />
        </colgroup>
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="border: 1px solid #d1d5db; padding: 7px; font-weight: bold; text-align: center; color: #10b981;">📌 Plan (기획 및 목표수립) - [${activeProg.pdca?.p || "대기"}]</th>
            <th style="border: 1px solid #d1d5db; padding: 7px; font-weight: bold; text-align: center; color: #3b82f6;">📌 Do (추진 및 집행실적) - [${activeProg.pdca?.d || "대기"}]</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 8px; vertical-align: top; line-height: 1.4;">
              <div>• <strong>성과 목표 설정:</strong></div>
              <div style="margin-left: 10px; font-size: 9px; color: #4b5563;">
                - 운영 횟수: ${inputFrequency || "0"}회<br/>
                - 참여 인원: ${inputTargetParticipants || "0"}${inputTargetParticipantsUnit || "명"} (${inputTargetParticipantsName || "목표명 없음"})<br/>
                - 개발/개설: ${inputTargetDevelopments || "0"}${inputTargetDevelopmentsUnit || "건"} (${inputTargetDevelopmentsName || "목표명 없음"})<br/>
                - 기타 성과: ${inputTargetEtc || "0"}${inputTargetEtcUnit || "건"}
              </div>
              <div style="margin-top: 5px;">• <strong>핵심성과지표(KPI) 링크:</strong></div>
              <ul style="margin: 3px 0 0 10px; padding: 0 0 0 10px; font-size: 9px; color: #4b5563;">
                ${kpiLinksHtml}
              </ul>
            </td>
            <td style="border: 1px solid #d1d5db; padding: 8px; vertical-align: top; line-height: 1.4;">
              <div>• <strong>실제 추진 성과 실적:</strong></div>
              <div style="margin-left: 10px; font-size: 9px; color: #4b5563;">
                - 총 참여인원: ${inputParticipants || "0"}명<br/>
                <span style="font-size: 8.5px; color: #6b7280; margin-left: 8px;">
                  (재학생: ${inputAudienceParticipants["재학생"] || "0"}명, 성인학습자: ${inputAudienceParticipants["성인학습자"] || "0"}명, 재직자: ${inputAudienceParticipants["재직자"] || "0"}명, 기타: ${inputAudienceParticipants["기타"] || "0"}명)
                </span><br/>
                - 실제 개발/개설: ${inputActualDevelopments || "0"}건<br/>
                - 실제 기타 실적: ${inputActualEtc || "0"}건
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- C / A 테이블 -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1px solid #d1d5db; font-size: 9.5px; table-layout: fixed;">
        <colgroup>
          <col style="width: 40%;" />
          <col style="width: 60%;" />
        </colgroup>
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="border: 1px solid #d1d5db; padding: 7px; font-weight: bold; text-align: center; color: #6366f1;">📌 Check (성과 분석) - [${activeProg.pdca?.c || "대기"}]</th>
            <th style="border: 1px solid #d1d5db; padding: 7px; font-weight: bold; text-align: center; color: #f59e0b;">📌 Act (자체평가 및 환류) - [${activeProg.pdca?.a || "대기"}]</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 8px; vertical-align: top; line-height: 1.4;">
              <div style="font-weight: bold; color: #4f46e5; margin-bottom: 4px;">• 만족도: ${inputSatisfaction || "0.0"} / 5.0 점</div>
              <div>• <strong>주요 성과 요약:</strong></div>
              <div style="font-size: 9px; color: #4b5563; background: #f9fafb; border: 1px solid #e5e7eb; padding: 6px; border-radius: 4px; margin-top: 4px; white-space: pre-wrap; word-break: break-all; height: 100px; overflow: hidden;">${inputAchievements || "등록된 성과 요약이 없습니다."}</div>
            </td>
            <td style="border: 1px solid #d1d5db; padding: 8px; vertical-align: top; line-height: 1.4;">
              <div style="font-weight: bold; color: #d97706; margin-bottom: 6px;">• 자체 평가 등급: <span style="background: #fef3c7; color: #d97706; padding: 2px 6px; border-radius: 4px;">${inputEvalType}</span></div>
              
              ${inputEvalType === "우수" ? `
                <div style="font-size: 9px; line-height: 1.3;">
                  <strong>[우수요인]</strong><br/>
                  <span style="color: #4b5563;">${inputExcellent || "기재된 우수 요인이 없습니다."}</span>
                  <div style="margin-top: 6px;"><strong>[차년도 발전방안]</strong></div>
                  <span style="color: #4b5563;">${inputImprovePlan || "기재된 차년도 발전방안이 없습니다."}</span>
                </div>
              ` : `
                <div style="font-size: 9px; line-height: 1.3;">
                  <strong>[미흡요인]</strong><br/>
                  <span style="color: #4b5563;">${inputDeficiency || "기재된 미흡 요인이 없습니다."}</span>
                  <div style="margin-top: 6px;"><strong>[단기조치사항]</strong></div>
                  <span style="color: #4b5563;">${inputActionItem || "기재된 단기 조치 사항이 없습니다."}</span>
                </div>
              `}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  const opt = {
    margin: [22.5, 20, 22.5, 20],
    filename: fileName,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  const worker = pdfWindow.html2pdf().from(htmlContent).set(opt);
  worker.save().then(() => {
    setIsDownloadingPdf(false);
  }).catch((err: unknown) => {
    console.error(err);
    setIsDownloadingPdf(false);
    alert("PDF 변환 중 오류가 발생했습니다.");
  });
};

// 💡 [프로그램 ID별 Markdown 내보내기]
export const exportPdcaProgramMarkdown = ({
  activeProg,
  selectedYear,
  setIsDownloadingPdf: _setIsDownloadingPdf,
  inputBudgetNational,
  inputSpentNational,
  inputBudgetCity,
  inputSpentCity,
  inputBudgetExternal,
  inputSpentExternal,
  inputBudgetCategories,
  inputMonthlyPDCA,
  inputMonthlyPDCAActual,
  inputCoopDept1,
  inputCoopDept2,
  inputTargetAudience,
  inputTimeline,
  inputFrequency,
  inputTargetParticipants,
  inputTargetParticipantsUnit,
  inputTargetParticipantsName,
  inputTargetDevelopments,
  inputTargetDevelopmentsUnit,
  inputTargetDevelopmentsName,
  inputTargetEtc,
  inputTargetEtcUnit,
  inputParticipants,
  inputAudienceParticipants,
  inputActualDevelopments,
  inputActualEtc,
  inputSatisfaction,
  inputAchievements,
  inputEvalType,
  inputExcellent,
  inputImprovePlan,
  inputDeficiency,
  inputActionItem,
}: PdcaExportContext) => {
  if (!activeProg) return;
  const py = activeProg.years?.[selectedYear] || {};
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const fileName = `[${activeProg.id}]${activeProg.title}_PDCA_${dateStr}.md`;

  const natRate = parseFloat(inputBudgetNational) > 0 ? (parseFloat(inputSpentNational) / parseFloat(inputBudgetNational) * 100).toFixed(1) : "0.0";
  const cityRate = parseFloat(inputBudgetCity) > 0 ? (parseFloat(inputSpentCity) / parseFloat(inputBudgetCity) * 100).toFixed(1) : "0.0";
  const extRate = parseFloat(inputBudgetExternal) > 0 ? (parseFloat(inputSpentExternal) / parseFloat(inputBudgetExternal) * 100).toFixed(1) : "0.0";

  const mdContent = `# [${activeProg.id}] ${activeProg.title} - PDCA 보고서

## 1. 기본 개요
- **단위과제**: ${activeProg.unitTitle || "미지정"}
- **담당부서(협업)**: ${inputCoopDept1 || "없음"}${inputCoopDept2 ? `, ${inputCoopDept2}` : ""}
- **사업 기간 (추진 일정)**: ${inputTimeline || "미정"}
- **주요 사업 대상**: ${inputTargetAudience || "미정"}

---

## 2. 예산 및 집행 현황
- **배정 본예산**: ${formatToMillionWon(py.budget_main)} 백만원
- **이월 예산액**: ${formatToMillionWon(py.budget_carry)} 백만원
- **본집행 실적**: ${formatToMillionWon(py.spent_main)} 백만원
- **이월 집행액**: ${formatToMillionWon(py.spent_carry)} 백만원
- **총 배정 예산**: ${formatToMillionWon((py.budget_main || 0) + (py.budget_carry || 0))} 백만원
- **총 집행 실적**: ${formatToMillionWon((py.spent_main || 0) + (py.spent_carry || 0))} 백만원
- **전체 집행률**: ${((py.budget_main || 0) + (py.budget_carry || 0)) > 0 ? (((py.spent_main || 0) + (py.spent_carry || 0)) / ((py.budget_main || 0) + (py.budget_carry || 0)) * 100).toFixed(1) : "0.0"}%

### 재원별 세부 예산 및 집행 (단위: 백만원)
| 재원구분 | 예산액 | 집행액 | 집행률 |
| :--- | :---: | :---: | :---: |
| **국고** | ${inputBudgetNational} | ${inputSpentNational} | ${natRate}% |
| **시비** | ${inputBudgetCity} | ${inputSpentCity} | ${cityRate}% |
| **외부** | ${inputBudgetExternal} | ${inputSpentExternal} | ${extRate}% |

### 비목별 기획 및 실적 (단위: 원)
| 순번 | 세부 비목 (카테고리) | 본예산 계획 | 이월예산 계획 | 본집행 실적 | 이월집행 실적 |
| :---: | :--- | :---: | :---: | :---: | :---: |
${inputBudgetCategories.filter(c => c.category).map((c, i) => 
`| ${i + 1} | ${c.category} | ${c.budget ? (parseFloat(c.budget) * 1000000).toLocaleString() : "0"} | ${c.budget_carry ? (parseFloat(c.budget_carry) * 1000000).toLocaleString() : "0"} | ${c.spent ? parseInt(c.spent.replace(/,/g, "")).toLocaleString() : "0"} | ${c.spent_carry ? parseInt(c.spent_carry.replace(/,/g, "")).toLocaleString() : "0"} |`
).join("\n")}

---

## 3. PDCA 단계별 세부 현황

### 📌 P (Plan) - 기획 및 목표 수립
- **단계 상태**: ${activeProg.pdca?.p || "대기"}
- **기획 일정**: ${inputMonthlyPDCA.map((val, idx) => val ? `${idx + 3}월(${val})` : null).filter(Boolean).join(", ") || "일정 없음"}
- **성과 목표 설정**:
- 운영 횟수: ${inputFrequency || "0"} 회
- 참여 인원: ${inputTargetParticipants || "0"} ${inputTargetParticipantsUnit || "명"} (${inputTargetParticipantsName || "목표명 없음"})
- 개발/개설: ${inputTargetDevelopments || "0"} ${inputTargetDevelopmentsUnit || "건"} (${inputTargetDevelopmentsName || "목표명 없음"})
- 기타 성과: ${inputTargetEtc || "0"} ${inputTargetEtcUnit || "건"}
- **연계 핵심 성과 지표(KPI)**:
${activeProg.kpi_links?.map((kLink: string, idx: number) => {
  const kType = activeProg.kpi_types?.[idx] || "자율";
  return kLink ? `- [${kType}] ${kLink}` : null;
}).filter(Boolean).join("\n") || "- 연계된 KPI 없음"}

### 📌 D (Do) - 추진 및 집행 실적
- **단계 상태**: ${activeProg.pdca?.d || "대기"}
- **실제 추진 일정**: ${inputMonthlyPDCAActual.map((val, idx) => val ? `${idx + 3}월(${val})` : null).filter(Boolean).join(", ") || "일정 없음"}
- **실제 성과 실적**:
- 총 참여 인원: ${inputParticipants || "0"} 명
  - (세부 유형) 재학생: ${inputAudienceParticipants["재학생"] || "0"}명, 성인학습자: ${inputAudienceParticipants["성인학습자"] || "0"}명, 재직자: ${inputAudienceParticipants["재직자"] || "0"}명, 기타: ${inputAudienceParticipants["기타"] || "0"}명
- 실제 개발/개설 실적: ${inputActualDevelopments || "0"} 건
- 실제 기타 실적: ${inputActualEtc || "0"} 건

### 📌 C (Check) - 성과 평가 및 분석
- **단계 상태**: ${activeProg.pdca?.c || "대기"}
- **수요자 만족도**: ${inputSatisfaction || "0.0"} 점 / 5.0 점
- **주요 성과 요약**:
\`\`\`text
${inputAchievements || "등록된 성과 사항이 없습니다."}
\`\`\`

### 📌 A (Act) - 자체평가 및 환류
- **단계 상태**: ${activeProg.pdca?.a || "대기"}
- **자체 평가 등급**: **${inputEvalType}**
${inputEvalType === "우수" ? `
- **우수 요인**:
> ${inputExcellent || "기재 사항 없음"}
- **차년도 발전 방안**:
> ${inputImprovePlan || "기재 사항 없음"}
` : `
- **미흡 요인**:
> ${inputDeficiency || "기재 사항 없음"}
- **단기 조치 사항**:
> ${inputActionItem || "기재 사항 없음"}
`}
`;

  const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
