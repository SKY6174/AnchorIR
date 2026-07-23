import React from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import type { Html2PdfFactory, LegacyAppRecord } from "../../../app/app-types";
import { getErrorMessage } from "../../../app/app-data-utils";

declare const html2pdf: Html2PdfFactory;

// ==========================================
// 💡 [총괄 투자 계획 매니저 컴포넌트 & 동적 데이터셋]
// ==========================================




// 문자열 내의 특수 점을 표준 가운데점(·)으로 통일하는 헬퍼
const normalizeCategoryName = (name: string) => {
  if (!name) return "";
  return name.replace(/[∙•]/g, "·").trim();
};

type InvestmentValue = { main: number; carry: number };
type InvestmentCategory = { name: string; values: InvestmentValue[] };
type AnnualInvestmentCategory = { name: string; values: number[] };
type TotalInvestmentManagerProps = {
  investmentSubTab: string;
  onChangeInvestmentSubTab: (tab: string) => void;
  projects: LegacyAppRecord[];
  selectedYear: number;
  darkMode: boolean;
};

export function TotalInvestmentManager({ investmentSubTab, onChangeInvestmentSubTab, projects, selectedYear, darkMode }: TotalInvestmentManagerProps) {
  const [expandedUnits, setExpandedUnits] = React.useState<Record<string, boolean>>({});
  // PDF 다운로드 진행 상태 제어 (어느 탭에서 다운로드 중인지 기록)
  const [isDownloadingPdf, setIsDownloadingPdf] = React.useState<"five_year" | "annual" | null>(null);

  const toggleUnit = (id: string) => {
    setExpandedUnits((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 1. 모든 단위과제 수집 (정렬 포함)
  const allUnits: LegacyAppRecord[] = [];
  if (projects && Array.isArray(projects)) {
    projects.forEach((p: LegacyAppRecord) => {
      if (p.units && Array.isArray(p.units)) {
        p.units.forEach((u: LegacyAppRecord) => {
          allUnits.push({
            ...u,
            projectTitle: p.title
          });
        });
      }
    });
  }

  // ID 기준으로 정렬 (Common은 맨 마지막에 위치하도록 함)
  allUnits.sort((a, b) => {
    if (a.id === "Common" || a.id === "X0") return 1;
    if (b.id === "Common" || b.id === "X0") return -1;
    return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
  });

  // 비목 기본 정렬 기준 목록
  const CATEGORY_ORDER = [
    "인건비",
    "장학금",
    "교육·연구 프로그램 개발·운영비",
    "교육·연구 환경개선비",
    "실험·실습장비 및 기자재 구입·운영비",
    "지역 연계·협업 지원비",
    "기업 지원·협력 활동비",
    "성과 활용·확산 지원비",
    "그 밖의 사업운영비",
    "간접비"
  ];

  // ----------------------------------------------------
  // (1) 5개년 총괄 데이터 동적 계산 (단위: 백만원)
  // ----------------------------------------------------
  const TOTAL_INVESTMENT_5YEAR_DATA = allUnits.map((u) => {
    const unitTitle = u.id === "Common" ? "공통운영경비" : `${u.id}. ${u.title}`;

    // 연도별 예산 총액 (백만원 단위, {main, carry} 형태의 객체 반환)
    // 1~5차년도
    const annualTotals = [1, 2, 3, 4, 5].map((yr) => {
      return {
        main: (u.years?.[yr]?.budget_main || 0) / 1e6,
        carry: (u.years?.[yr]?.budget_carry || 0) / 1e6
      };
    });
    // 5개년 총합
    const fiveYearMainSum = annualTotals.reduce((sum, val) => sum + val.main, 0);
    const fiveYearCarrySum = annualTotals.reduce((sum, val) => sum + val.carry, 0);
    const totalRow = [...annualTotals, { main: fiveYearMainSum, carry: fiveYearCarrySum }];

    // 비목별 5개년 예산
    const categoriesMap: Record<string, InvestmentValue[]> = {};
    CATEGORY_ORDER.forEach((catName) => {
      categoriesMap[catName] = [1, 2, 3, 4, 5].map(() => ({ main: 0, carry: 0 })); // 1~5차년도
    });

    // 프로그램들을 순회하며 각 연도의 비목 데이터 합산
    if (u.programs && Array.isArray(u.programs)) {
      u.programs.forEach((prog: LegacyAppRecord) => {
        [1, 2, 3, 4, 5].forEach((yr) => {
          const bgCats = prog.years?.[yr]?.budget_categories || [];
          bgCats.forEach((cat: LegacyAppRecord) => {
            const normCat = normalizeCategoryName(cat.category);
            const matchedOrderCat = CATEGORY_ORDER.find(c => normalizeCategoryName(c) === normCat);
            if (matchedOrderCat) {
              const cleanBudget = typeof cat.budget === "string"
                ? parseFloat(cat.budget.replace(/,/g, ""))
                : Number(cat.budget || 0);
              const cleanCarry = typeof cat.budget_carry === "string"
                ? parseFloat(cat.budget_carry.replace(/,/g, ""))
                : Number(cat.budget_carry || 0);
              categoriesMap[matchedOrderCat][yr - 1].main += cleanBudget / 1e6;
              categoriesMap[matchedOrderCat][yr - 1].carry += cleanCarry / 1e6;
            }
          });
        });
      });
    }

    // 값이 0보다 큰 비목만 필터링하여 categories 구성
    const categories: InvestmentCategory[] = [];
    CATEGORY_ORDER.forEach((catName) => {
      const values = categoriesMap[catName];
      const mainSum = values.reduce((sum: number, val: InvestmentValue) => sum + val.main, 0);
      const carrySum = values.reduce((sum: number, val: InvestmentValue) => sum + val.carry, 0);
      const catSum = mainSum + carrySum;
      if (catSum > 0) {
        categories.push({
          name: catName,
          values: [...values, { main: mainSum, carry: carrySum }]
        });
      }
    });

    return {
      id: u.id,
      title: unitTitle,
      total: totalRow,
      categories: categories
    };
  });

  // ----------------------------------------------------
  // (2) 5개년 총괄 요약 영역 동적 계산 ({main, carry} 형태의 배열로 확장)
  // ----------------------------------------------------
  const summaryTotal = [1, 2, 3, 4, 5, 6].map(() => ({ main: 0, carry: 0 }));
  const summaryLabor = [1, 2, 3, 4, 5, 6].map(() => ({ main: 0, carry: 0 }));
  const summaryOperation = [1, 2, 3, 4, 5, 6].map(() => ({ main: 0, carry: 0 }));
  const summaryIndirect = [1, 2, 3, 4, 5, 6].map(() => ({ main: 0, carry: 0 }));
  const summaryOnlyOperation = [1, 2, 3, 4, 5, 6].map(() => ({ main: 0, carry: 0 }));

  TOTAL_INVESTMENT_5YEAR_DATA.forEach((uData) => {
    for (let i = 0; i < 6; i++) {
      summaryTotal[i].main += uData.total[i].main;
      summaryTotal[i].carry += uData.total[i].carry;
    }

    uData.categories.forEach((cat) => {
      const normCat = normalizeCategoryName(cat.name);
      if (normCat === "인건비") {
        for (let i = 0; i < 6; i++) {
          summaryLabor[i].main += cat.values[i].main;
          summaryLabor[i].carry += cat.values[i].carry;
        }
      } else if (normCat === "그 밖의 사업운영비" || normCat === "그 밖의 사업운영경비") {
        for (let i = 0; i < 6; i++) {
          summaryOperation[i].main += cat.values[i].main;
          summaryOperation[i].carry += cat.values[i].carry;
        }
      } else if (normCat === "간접비") {
        for (let i = 0; i < 6; i++) {
          summaryIndirect[i].main += cat.values[i].main;
          summaryIndirect[i].carry += cat.values[i].carry;
        }
      }
    });
  });

  // "총사업비 중 운영비" = "인건비" + "그 밖의 사업운영비" + "간접비"
  for (let i = 0; i < 6; i++) {
    summaryOnlyOperation[i].main = summaryLabor[i].main + summaryOperation[i].main + summaryIndirect[i].main;
    summaryOnlyOperation[i].carry = summaryLabor[i].carry + summaryOperation[i].carry + summaryIndirect[i].carry;
  }

  const TOTAL_INVESTMENT_SUMMARY_DATA = {
    total: summaryTotal,
    labor: summaryLabor,
    operation: summaryOperation,
    indirect: summaryIndirect,
    only_operation: summaryOnlyOperation
  };

  // ----------------------------------------------------
  // (3) 연차별 계획 (재원별) 데이터 동적 계산
  // ----------------------------------------------------
  const ANNUAL_INVESTMENT_DATA = allUnits.map((u) => {
    const unitTitle = u.id === "Common" ? "공통운영경비" : `${u.id}. ${u.title}`;

    let uNat = 0, uCity = 0, uExt = 0;
    if (u.programs && Array.isArray(u.programs)) {
      u.programs.forEach((prog: LegacyAppRecord) => {
        const py = prog.years?.[selectedYear] || {};
        uNat += (py.budget_national || 0) + (py.budget_carry_national || 0);
        uCity += (py.budget_city || 0) + (py.budget_carry_city || 0);
        uExt += (py.budget_external || 0) + (py.budget_carry_external || 0);
      });
    }

    const natKr = uNat / 1e6;
    const cityKr = uCity / 1e6;
    const extKr = uExt / 1e6;
    const sumKr = natKr + cityKr + extKr;

    // 단위과제 대로우의 비율은 100%로 고정
    // [국비, 시비, 외부사업비, 합계, 비율] -> 총 5개 요소
    const totalRow = [natKr, cityKr, extKr, sumKr, 100.0];

    // 비목별 재원 안분 계산
    const categoriesMap: Record<string, { national: number; city: number; external: number }> = {};
    CATEGORY_ORDER.forEach((catName) => {
      categoriesMap[catName] = { national: 0, city: 0, external: 0 };
    });

    if (u.programs && Array.isArray(u.programs)) {
      u.programs.forEach((prog: LegacyAppRecord) => {
        const py = prog.years?.[selectedYear] || {};
        const progBudgetMain = py.budget_main || 0;
        const progBudgetCarry = py.budget_carry || 0;

        // 안분 비율
        const natRatio = progBudgetMain > 0 ? (py.budget_national || 0) / progBudgetMain : 0;
        const cityRatio = progBudgetMain > 0 ? (py.budget_city || 0) / progBudgetMain : 0;
        const extRatio = progBudgetMain > 0 ? (py.budget_external || 0) / progBudgetMain : 0;

        const carryNatRatio = progBudgetCarry > 0 ? (py.budget_carry_national || 0) / progBudgetCarry : 0;
        const carryCityRatio = progBudgetCarry > 0 ? (py.budget_carry_city || 0) / progBudgetCarry : 0;
        const carryExtRatio = progBudgetCarry > 0 ? (py.budget_carry_external || 0) / progBudgetCarry : 0;

        const bgCats = py.budget_categories || [];
        bgCats.forEach((cat: LegacyAppRecord) => {
          const normCat = normalizeCategoryName(cat.category);
          const matchedOrderCat = CATEGORY_ORDER.find(c => normalizeCategoryName(c) === normCat);
          if (matchedOrderCat) {
            const catB = cat.budget ? parseFloat(String(cat.budget).replace(/,/g, "")) : 0;
            const catBC = cat.budget_carry ? parseFloat(String(cat.budget_carry).replace(/,/g, "")) : 0;

            // 재원 안분 적용
            const cNat = catB * natRatio + catBC * carryNatRatio;
            const cCity = catB * cityRatio + catBC * carryCityRatio;
            const cExt = catB * extRatio + catBC * carryExtRatio;

            categoriesMap[matchedOrderCat].national += cNat / 1e6;
            categoriesMap[matchedOrderCat].city += cCity / 1e6;
            categoriesMap[matchedOrderCat].external += cExt / 1e6;
          }
        });
      });
    }

    const categories: AnnualInvestmentCategory[] = [];
    CATEGORY_ORDER.forEach((catName) => {
      const cData = categoriesMap[catName];
      const catSum = cData.national + cData.city + cData.external;
      if (catSum > 0) {
        // 비목의 비율은 해당 단위과제 총합 예산(sumKr) 대비 비율
        const catRatio = sumKr > 0 ? (catSum / sumKr) * 100 : 0;
        categories.push({
          name: catName,
          // values 형식: [국비, 시비, 외부사업비, 합계, 비율] -> 총 5개 요소
          values: [cData.national, cData.city, cData.external, catSum, catRatio]
        });
      }
    });

    return {
      id: u.id,
      title: unitTitle,
      total: totalRow,
      categories: categories
    };
  });

  // ----------------------------------------------------
  // (4) 연차별 계획 요약 요율 및 합계 동적 계산
  // ----------------------------------------------------
  let annualTotalNat = 0;
  let annualTotalCity = 0;
  let annualTotalExt = 0;
  let annualTotalSum = 0;

  let annualLaborNat = 0, annualLaborCity = 0, annualLaborExt = 0, annualLaborSum = 0;
  let annualOpNat = 0, annualOpCity = 0, annualOpExt = 0, annualOpSum = 0;
  let annualIndNat = 0, annualIndCity = 0, annualIndExt = 0, annualIndSum = 0;

  ANNUAL_INVESTMENT_DATA.forEach((uData) => {
    annualTotalNat += uData.total[0];
    annualTotalCity += uData.total[1];
    annualTotalExt += uData.total[2];
    annualTotalSum += uData.total[3];

    uData.categories.forEach((cat) => {
      const normCat = normalizeCategoryName(cat.name);
      if (normCat === "인건비") {
        annualLaborNat += cat.values[0];
        annualLaborCity += cat.values[1];
        annualLaborExt += cat.values[2];
        annualLaborSum += cat.values[3];
      } else if (normCat === "그 밖의 사업운영비" || normCat === "그 밖의 사업운영경비") {
        annualOpNat += cat.values[0];
        annualOpCity += cat.values[1];
        annualOpExt += cat.values[2];
        annualOpSum += cat.values[3];
      } else if (normCat === "간접비") {
        annualIndNat += cat.values[0];
        annualIndCity += cat.values[1];
        annualIndExt += cat.values[2];
        annualIndSum += cat.values[3];
      }
    });
  });

  const annualLaborRatio = annualTotalSum > 0 ? (annualLaborSum / annualTotalSum) * 100 : 0;
  const annualOpRatio = annualTotalSum > 0 ? (annualOpSum / annualTotalSum) * 100 : 0;
  const annualIndRatio = annualTotalSum > 0 ? (annualIndSum / annualTotalSum) * 100 : 0;

  const annualOnlyOpNat = annualLaborNat + annualOpNat + annualIndNat;
  const annualOnlyOpCity = annualLaborCity + annualOpCity + annualIndCity;
  const annualOnlyOpExt = annualLaborExt + annualOpExt + annualIndExt;
  const annualOnlyOpSum = annualLaborSum + annualOpSum + annualIndSum;
  const annualOnlyOpRatio = annualTotalSum > 0 ? (annualOnlyOpSum / annualTotalSum) * 100 : 0;

  const targetYear = 2024 + selectedYear;

  // 천 단위 콤마 포맷팅 및 소수점 1자리 표기를 위한 공통 헬퍼 함수
  const formatValue = (val: number | null | undefined) => {
    if (val === undefined || val === null || val === 0) return "-";
    return val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  // 1) 5개년 총괄 PDF 다운로드 핸들러
  const handleExportFiveYearPDF = async () => {
    setIsDownloadingPdf("five_year");
    try {
      await new Promise((resolve, reject) => {
        if (window.html2pdf) return resolve(window.html2pdf);
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => resolve(window.html2pdf);
        script.onerror = reject;
        document.head.appendChild(script);
      });

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const fileName = `앵커사업비_5개년_총괄_투자계획_${targetYear}_${yyyy}${mm}${dd}.pdf`;

      // 💡 [요구사항 반영] 5개년 단위과제별 예산 합산 비율 차트 데이터 가공
      const fiveYearUnitTotals: Record<string, number> = {};
      let totalSumVal = 0;
      TOTAL_INVESTMENT_5YEAR_DATA.forEach(u => {
        const normId = getNormalizedUnitId(u.id);
        const totalObj = u.total[5] || { main: 0, carry: 0 };
        const val = (totalObj.main || 0) + (totalObj.carry || 0);
        if (val > 0) {
          fiveYearUnitTotals[normId] = (fiveYearUnitTotals[normId] || 0) + val;
          totalSumVal += val;
        }
      });

      const fiveYearChartItems = Object.entries(fiveYearUnitTotals).map(([id, val]) => {
        let displayName = id;
        if (id === "Common") displayName = "공통경비";
        else if (id === "X0") displayName = "X0(공통)";
        return {
          id,
          name: displayName,
          value: val,
          ratio: totalSumVal > 0 ? (val / totalSumVal) * 100 : 0,
          color: getUnitColor(id)
        };
      }).sort((a, b) => {
        const order = ["A1", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "D1", "D2", "D3", "D4", "Common", "X0"];
        const idxA = order.indexOf(a.id);
        const idxB = order.indexOf(b.id);
        const posA = idxA === -1 ? 999 : idxA;
        const posB = idxB === -1 ? 999 : idxB;
        return posA - posB;
      });

      let barDivsHtml = "";
      let legendItemsHtml = "";
      fiveYearChartItems.forEach((item) => {
        if (item.value > 0) {
          barDivsHtml += `<div style="width: ${item.ratio}%; background: ${item.color}; height: 100%;"></div>`;
          legendItemsHtml += `
            <div style="display: flex; align-items: center; gap: 4px; font-size: 8.5px; margin-right: 12px; margin-bottom: 4px; white-space: nowrap;">
              <span style="width: 7px; height: 7px; border-radius: 50%; background: ${item.color}; display: inline-block; flex-shrink: 0;"></span>
              <span style="font-weight: 700; color: #111827;">${item.name}</span>
              <span style="color: #4b5563;">${item.ratio.toFixed(1)}%</span>
              <span style="color: #6b7280; font-size: 7.5px;">(${formatValue(item.value)})</span>
            </div>
          `;
        }
      });

      const progressBarHtml = `
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin-bottom: 15px; display: flex; flex-direction: column; gap: 8px; width: 100%; box-sizing: border-box;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; font-weight: bold; color: #111827;">📊 5개년 단위과제별 예산 합산 비율</span>
            <span style="font-size: 9px; color: #4b5563; font-weight: bold;">총 ${formatValue(totalSumVal)}백만 원</span>
          </div>
          <div style="width: 100%; height: 14px; display: flex; border-radius: 7px; overflow: hidden; background: #e5e7eb;">
            ${barDivsHtml}
          </div>
          <div style="display: flex; flex-wrap: wrap; margin-top: 2px;">
            ${legendItemsHtml}
          </div>
        </div>
      `;

      let tableRowsHtml = "";
      TOTAL_INVESTMENT_5YEAR_DATA.forEach((u) => {
        const totalObj = u.total[5] || { main: 0, carry: 0 };
        const mainSum = (totalObj.main || 0) + (totalObj.carry || 0);

        tableRowsHtml += `
          <tr style="background: ${u.id === "Common" || u.id === "X0" ? "#fffbeb" : "#ffffff"}; font-weight: bold; page-break-inside: avoid; break-inside: avoid;">
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; font-size: 10px; font-weight: bold; text-align: left;">${u.title}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(u.total[0].main + u.total[0].carry)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px; color: #1d4ed8;">${formatValue(u.total[1].main)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px; color: #047857;">${formatValue(u.total[1].carry)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(u.total[2].main)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(u.total[3].main)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(u.total[4].main)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px; font-weight: bold; color: #10b981;">${formatValue(mainSum)}</td>
          </tr>
        `;

        u.categories.forEach((cat) => {
          const catSum = (cat.values[5]?.main || 0) + (cat.values[5]?.carry || 0);
          tableRowsHtml += `
            <tr style="background: #fafafa; font-size: 9px; color: #4b5563; page-break-inside: avoid; break-inside: avoid;">
              <td style="border: 1px solid #d1d5db; padding: 6px 6px 6px 18px; text-align: left;">&nbsp;&nbsp;└ ${cat.name}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right;">${formatValue(cat.values[0].main + cat.values[0].carry)}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right; color: #2563eb;">${formatValue(cat.values[1].main)}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right; color: #059669;">${formatValue(cat.values[1].carry)}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right;">${formatValue(cat.values[2].main)}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right;">${formatValue(cat.values[3].main)}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right;">${formatValue(cat.values[4].main)}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right; font-weight: bold;">${formatValue(catSum)}</td>
            </tr>
          `;
        });
      });

      const summaryLabels = ["총 사업비", "인건비", "그 밖의 사업운영비", "간접비", "총사업비 중 운영비"];
      const summaryKeys: Array<keyof typeof TOTAL_INVESTMENT_SUMMARY_DATA> = ["total", "labor", "operation", "indirect", "only_operation"];
      summaryKeys.forEach((key, sIdx) => {
        const rowData = TOTAL_INVESTMENT_SUMMARY_DATA[key];
        const rowSum = (rowData[5]?.main || 0) + (rowData[5]?.carry || 0);
        const isTotal = key === "total";
        const isOnlyOp = key === "only_operation";

        tableRowsHtml += `
          <tr style="background: ${isTotal ? "#e0f2fe" : isOnlyOp ? "#ecfdf5" : "#f3f4f6"}; font-weight: bold; border-top: ${isTotal || isOnlyOp ? "2px solid #3b82f6" : "1px solid #d1d5db"}; page-break-inside: avoid; break-inside: avoid;">
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; font-size: 10px; font-weight: bold; text-align: left;">${summaryLabels[sIdx]}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(rowData[0].main + rowData[0].carry)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px; color: #1d4ed8;">${formatValue(rowData[1].main)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px; color: #047857;">${formatValue(rowData[1].carry)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(rowData[2].main)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(rowData[3].main)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(rowData[4].main)}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px; font-weight: bold; color: ${isTotal ? "#0369a1" : "#047857"};">${formatValue(rowSum)}</td>
          </tr>
        `;
      });

      const htmlContent = `
        <div style="padding: 0; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; color: #333333; background: #ffffff; width: 100%;">
          <h1 style="text-align: center; font-size: 18px; font-weight: 800; margin-bottom: 5px; color: #111827;">울산과학대학교 앵커사업비 5개년 총괄 투자 계획</h1>
          <p style="text-align: center; font-size: 11px; color: #6b7280; margin-bottom: 20px;">[${targetYear}년도 기준 조회] 5개년 총괄 투자 현황 (단위: 백만원)</p>

          ${progressBarHtml}

          <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; color: #111827; border: 1px solid #d1d5db; table-layout: fixed;">
            <colgroup>
              <col style="width: 25%;" />
              <col style="width: 10%;" />
              <col style="width: 11%;" />
              <col style="width: 11%;" />
              <col style="width: 10%;" />
              <col style="width: 10%;" />
              <col style="width: 10%;" />
              <col style="width: 13%;" />
            </colgroup>
            <thead>
              <tr style="background: transparent; font-weight: bold;">
                <th rowspan="2" style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; vertical-align: middle; padding: 8px 4px; background: #f3f4f6;">구분</th>
                <th rowspan="2" style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; vertical-align: middle; padding: 8px 4px; background: #f3f4f6;">2025</th>
                <th colspan="2" style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; padding: 6px 4px; background: #f3f4f6;">2026</th>
                <th rowspan="2" style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; vertical-align: middle; padding: 8px 4px; background: #f3f4f6;">2027</th>
                <th rowspan="2" style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; vertical-align: middle; padding: 8px 4px; background: #f3f4f6;">2028</th>
                <th rowspan="2" style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; vertical-align: middle; padding: 8px 4px; background: #f3f4f6;">2029</th>
                <th rowspan="2" style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; vertical-align: middle; padding: 8px 4px; color: #3b82f6; background: #f3f4f6;">합계</th>
              </tr>
              <tr style="background: transparent;">
                <th style="border: 1px solid #d1d5db; text-align: center; font-size: 9px; color: #1d4ed8; padding: 5px 2px; background: #f9fafb;">본사업</th>
                <th style="border: 1px solid #d1d5db; text-align: center; font-size: 9px; color: #047857; padding: 5px 2px; background: #f9fafb;">이월사업</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <div style="margin-top: 30px; font-size: 9px; color: #9ca3af; text-align: right;">
            울산과학대학교 앵커사업단 | 출력 일자: ${yyyy}-${mm}-${dd}
          </div>
        </div>
      `;

      const opt = {
        margin: [22.5, 20, 22.5, 20],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().from(htmlContent).set(opt).save();
    } catch (err) {
      alert("PDF 다운로드 도중 에러가 발생하였습니다: " + getErrorMessage(err));
    } finally {
      setIsDownloadingPdf(null);
    }
  };

  // 2) 5개년 총괄 Markdown 다운로드 핸들러
  const handleExportFiveYearMarkdown = () => {
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');

      let md = `# 울산과학대학교 앵커사업비 5개년 총괄 투자 계획\n\n`;
      md += `* 조회 차년도 기준: ${targetYear}년도 (${selectedYear}차년도)\n`;
      md += `* 생성일자: ${yyyy}-${mm}-${dd}\n\n`;
      md += `| 구분 | 2025 | 2026 (본사업) | 2026 (이월사업) | 2027 | 2028 | 2029 | 합계 |\n`;
      md += `| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n`;

      TOTAL_INVESTMENT_5YEAR_DATA.forEach((u) => {
        const totalObj = u.total[5] || { main: 0, carry: 0 };
        const mainSum = (totalObj.main || 0) + (totalObj.carry || 0);
        md += `| **${u.title}** | ${formatValue(u.total[0].main + u.total[0].carry)} | ${formatValue(u.total[1].main)} | ${formatValue(u.total[1].carry)} | ${formatValue(u.total[2].main)} | ${formatValue(u.total[3].main)} | ${formatValue(u.total[4].main)} | **${formatValue(mainSum)}** |\n`;
        u.categories.forEach((cat) => {
          const catSum = (cat.values[5]?.main || 0) + (cat.values[5]?.carry || 0);
          md += `| &nbsp;&nbsp;&nbsp;&nbsp;└ ${cat.name} | ${formatValue(cat.values[0].main + cat.values[0].carry)} | ${formatValue(cat.values[1].main)} | ${formatValue(cat.values[1].carry)} | ${formatValue(cat.values[2].main)} | ${formatValue(cat.values[3].main)} | ${formatValue(cat.values[4].main)} | ${formatValue(catSum)} |\n`;
        });
      });

      md += `| | | | | | | | |\n`;
      md += `| **[총괄 요약]** | | | | | | | |\n`;

      const summaryLabels = ["총 사업비", "인건비", "그 밖의 사업운영비", "간접비", "총사업비 중 운영비"];
      const summaryKeys: Array<keyof typeof TOTAL_INVESTMENT_SUMMARY_DATA> = ["total", "labor", "operation", "indirect", "only_operation"];
      summaryKeys.forEach((key, sIdx) => {
        const rowData = TOTAL_INVESTMENT_SUMMARY_DATA[key];
        const rowSum = (rowData[5]?.main || 0) + (rowData[5]?.carry || 0);
        md += `| **${summaryLabels[sIdx]}** | ${formatValue(rowData[0].main + rowData[0].carry)} | ${formatValue(rowData[1].main)} | ${formatValue(rowData[1].carry)} | ${formatValue(rowData[2].main)} | ${formatValue(rowData[3].main)} | ${formatValue(rowData[4].main)} | **${formatValue(rowSum)}** |\n`;
      });

      const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `앵커사업비_5개년_총괄_투자계획_${targetYear}_${yyyy}${mm}${dd}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("마크다운 내보내기 도중 에러가 발생하였습니다: " + getErrorMessage(err));
    }
  };

  // 3) 연차별 계획 PDF 다운로드 핸들러
  const handleExportAnnualPDF = async () => {
    setIsDownloadingPdf("annual");
    try {
      await new Promise((resolve, reject) => {
        if (window.html2pdf) return resolve(window.html2pdf);
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => resolve(window.html2pdf);
        script.onerror = reject;
        document.head.appendChild(script);
      });

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const fileName = `앵커사업비_${targetYear}년도_재원별_투자계획_${yyyy}${mm}${dd}.pdf`;

      // 💡 [요구사항 반영] (1) 연차별 단위과제별 예산 비율 차트 데이터 가공
      const annualUnitTotals: Record<string, number> = {};
      let annualTotalGovSum = 0;
      ANNUAL_INVESTMENT_DATA.forEach(u => {
        const normId = getNormalizedUnitId(u.id);
        const val = (u.total[0] || 0) + (u.total[1] || 0); // 국비 + 시비
        if (val > 0) {
          annualUnitTotals[normId] = (annualUnitTotals[normId] || 0) + val;
          annualTotalGovSum += val;
        }
      });

      const annualUnitChartItems = Object.entries(annualUnitTotals).map(([id, val]) => {
        let displayName = id;
        if (id === "Common") displayName = "공통경비";
        else if (id === "X0") displayName = "X0(공통)";
        return {
          id,
          name: displayName,
          value: val,
          ratio: annualTotalGovSum > 0 ? (val / annualTotalGovSum) * 100 : 0,
          color: getUnitColor(id)
        };
      }).sort((a, b) => {
        const order = ["A1", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "D1", "D2", "D3", "D4", "Common", "X0"];
        const idxA = order.indexOf(a.id);
        const idxB = order.indexOf(b.id);
        const posA = idxA === -1 ? 999 : idxA;
        const posB = idxB === -1 ? 999 : idxB;
        return posA - posB;
      });

      // (2) 전체사업비 재원 구성 비율 가공
      const sourceChartItems = [
        { name: "국비", value: annualTotalNat, color: "#3b82f6" },
        { name: "시비", value: annualTotalCity, color: "#10b981" },
        { name: "외부사업비", value: annualTotalExt, color: "#f59e0b" }
      ];

      // HTML ProgressBar 스트링 생성 (1번 차트)
      let barDivs1Html = "";
      let legendItems1Html = "";
      annualUnitChartItems.forEach((item) => {
        if (item.value > 0) {
          barDivs1Html += `<div style="width: ${item.ratio}%; background: ${item.color}; height: 100%;"></div>`;
          legendItems1Html += `
            <div style="display: flex; align-items: center; gap: 4px; font-size: 8.5px; margin-right: 12px; margin-bottom: 4px; white-space: nowrap;">
              <span style="width: 7px; height: 7px; border-radius: 50%; background: ${item.color}; display: inline-block; flex-shrink: 0;"></span>
              <span style="font-weight: 700; color: #111827;">${item.name}</span>
              <span style="color: #4b5563;">${item.ratio.toFixed(1)}%</span>
              <span style="color: #6b7280; font-size: 7.5px;">(${formatValue(item.value)})</span>
            </div>
          `;
        }
      });

      const progressBar1Html = `
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px; width: 100%; box-sizing: border-box;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; font-weight: bold; color: #111827;">📊 ${targetYear}년도 단위과제별 예산(국비+시비) 비율</span>
            <span style="font-size: 9px; color: #4b5563; font-weight: bold;">총 ${formatValue(annualTotalGovSum)}백만 원</span>
          </div>
          <div style="width: 100%; height: 14px; display: flex; border-radius: 7px; overflow: hidden; background: #e5e7eb;">
            ${barDivs1Html}
          </div>
          <div style="display: flex; flex-wrap: wrap; margin-top: 2px;">
            ${legendItems1Html}
          </div>
        </div>
      `;

      // HTML ProgressBar 스트링 생성 (2번 차트)
      const sourceTotal = annualTotalNat + annualTotalCity + annualTotalExt;
      let barDivs2Html = "";
      let legendItems2Html = "";
      sourceChartItems.forEach((item) => {
        if (item.value > 0) {
          const itemRatio = sourceTotal > 0 ? (item.value / sourceTotal) * 100 : 0;
          barDivs2Html += `<div style="width: ${itemRatio}%; background: ${item.color}; height: 100%;"></div>`;
          legendItems2Html += `
            <div style="display: flex; align-items: center; gap: 4px; font-size: 8.5px; margin-right: 12px; margin-bottom: 4px; white-space: nowrap;">
              <span style="width: 7px; height: 7px; border-radius: 50%; background: ${item.color}; display: inline-block; flex-shrink: 0;"></span>
              <span style="font-weight: 700; color: #111827;">${item.name}</span>
              <span style="color: #4b5563;">${itemRatio.toFixed(1)}%</span>
              <span style="color: #6b7280; font-size: 7.5px;">(${formatValue(item.value)})</span>
            </div>
          `;
        }
      });

      const progressBar2Html = `
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin-bottom: 15px; display: flex; flex-direction: column; gap: 8px; width: 100%; box-sizing: border-box;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; font-weight: bold; color: #111827;">📊 ${targetYear}년도 전체사업비 재원 구성 비율</span>
            <span style="font-size: 9px; color: #4b5563; font-weight: bold;">총 ${formatValue(sourceTotal)}백만 원</span>
          </div>
          <div style="width: 100%; height: 14px; display: flex; border-radius: 7px; overflow: hidden; background: #e5e7eb;">
            ${barDivs2Html}
          </div>
          <div style="display: flex; flex-wrap: wrap; margin-top: 2px;">
            ${legendItems2Html}
          </div>
        </div>
      `;

      let tableRowsHtml = "";
      ANNUAL_INVESTMENT_DATA.forEach((u) => {
        tableRowsHtml += `
          <tr style="background: ${u.id === "Common" || u.id === "X0" ? "#fffbeb" : "#ffffff"}; font-weight: bold; page-break-inside: avoid; break-inside: avoid;">
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; font-size: 10px; font-weight: bold; text-align: left;">${u.title}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(u.total[0])}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(u.total[1])}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(u.total[2])}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px; font-weight: bold; color: #10b981;">${formatValue(u.total[3])}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: center; font-size: 10px;">100%</td>
          </tr>
        `;

        u.categories.forEach((cat) => {
          tableRowsHtml += `
            <tr style="background: #fafafa; font-size: 9px; color: #4b5563; page-break-inside: avoid; break-inside: avoid;">
              <td style="border: 1px solid #d1d5db; padding: 6px 6px 6px 18px; text-align: left;">&nbsp;&nbsp;└ ${cat.name}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right;">${formatValue(cat.values[0])}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right;">${formatValue(cat.values[1])}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right;">${formatValue(cat.values[2])}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: right; font-weight: bold;">${formatValue(cat.values[3])}</td>
              <td style="border: 1px solid #d1d5db; padding: 6px 6px; text-align: center;">${cat.values[4].toFixed(1)}%</td>
            </tr>
          `;
        });
      });

      const summaryRows = [
        { label: "총 사업비", values: [annualTotalNat, annualTotalCity, annualTotalExt, annualTotalSum, 100.0] },
        { label: "인건비", values: [annualLaborNat, annualLaborCity, annualLaborExt, annualLaborSum, annualLaborRatio] },
        { label: "그 밖의 사업운영비", values: [annualOpNat, annualOpCity, annualOpExt, annualOpSum, annualOpRatio] },
        { label: "간접비", values: [annualIndNat, annualIndCity, annualIndExt, annualIndSum, annualIndRatio] },
        { label: "총사업비 중 운영비", values: [annualOnlyOpNat, annualOnlyOpCity, annualOnlyOpExt, annualOnlyOpSum, annualOnlyOpRatio] }
      ];

      summaryRows.forEach((row) => {
        const isTotal = row.label === "총 사업비";
        const isOnlyOp = row.label === "총사업비 중 운영비";

        tableRowsHtml += `
          <tr style="background: ${isTotal ? "#e0f2fe" : isOnlyOp ? "#ecfdf5" : "#f3f4f6"}; font-weight: bold; border-top: ${isTotal || isOnlyOp ? "2px solid #3b82f6" : "1px solid #d1d5db"}; page-break-inside: avoid; break-inside: avoid;">
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; font-size: 10px; font-weight: bold; text-align: left;">${row.label}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(row.values[0])}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(row.values[1])}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px;">${formatValue(row.values[2])}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: right; font-size: 10px; font-weight: bold; color: ${isTotal ? "#0369a1" : "#047857"};">${formatValue(row.values[3])}</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 6px; text-align: center; font-size: 10px;">${row.values[4].toFixed(1)}%</td>
          </tr>
        `;
      });

      const htmlContent = `
        <div style="padding: 0; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; color: #333333; background: #ffffff; width: 100%;">
          <h1 style="text-align: center; font-size: 18px; font-weight: 800; margin-bottom: 5px; color: #111827;">울산과학대학교 앵커사업비 ${targetYear}년도 재원별 투자 계획</h1>
          <p style="text-align: center; font-size: 11px; color: #6b7280; margin-bottom: 20px;">연차별 재원 안분 현황 (단위: 백만원)</p>

          ${progressBar1Html}
          ${progressBar2Html}

          <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; color: #111827; border: 1px solid #d1d5db; table-layout: fixed;">
            <colgroup>
              <col style="width: 35%;" />
              <col style="width: 13%;" />
              <col style="width: 13%;" />
              <col style="width: 13%;" />
              <col style="width: 14%;" />
              <col style="width: 12%;" />
            </colgroup>
            <thead>
              <tr style="background: #f3f4f6; font-weight: bold;">
                <th style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; padding: 9px 4px;">구분</th>
                <th style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; padding: 9px 4px;">국비</th>
                <th style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; padding: 9px 4px;">시비</th>
                <th style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; padding: 9px 4px;">외부사업비</th>
                <th style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; padding: 9px 4px; color: #3b82f6;">합계</th>
                <th style="border: 1px solid #d1d5db; text-align: center; font-size: 10.5px; padding: 9px 4px;">비율 (%)</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <div style="margin-top: 30px; font-size: 9px; color: #9ca3af; text-align: right;">
            울산과학대학교 앵커사업단 | 출력 일자: ${yyyy}-${mm}-${dd}
          </div>
        </div>
      `;

      const opt = {
        margin: [22.5, 20, 22.5, 20],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().from(htmlContent).set(opt).save();
    } catch (err) {
      alert("PDF 다운로드 도중 에러가 발생하였습니다: " + getErrorMessage(err));
    } finally {
      setIsDownloadingPdf(null);
    }
  };

  // 4) 연차별 계획 Markdown 다운로드 핸들러
  const handleExportAnnualMarkdown = () => {
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');

      let md = `# 울산과학대학교 앵커사업비 ${targetYear}년도 재원별 계획\n\n`;
      md += `* 생성일자: ${yyyy}-${mm}-${dd}\n\n`;
      md += `| ${targetYear}년도 구분 | 국비 | 시비 | 외부사업비 | 합계 | 비율 (%) |\n`;
      md += `| :--- | ---: | ---: | ---: | ---: | ---: |\n`;

      ANNUAL_INVESTMENT_DATA.forEach((u) => {
        md += `| **${u.title}** | ${formatValue(u.total[0])} | ${formatValue(u.total[1])} | ${formatValue(u.total[2])} | **${formatValue(u.total[3])}** | 100% |\n`;
        u.categories.forEach((cat) => {
          md += `| &nbsp;&nbsp;&nbsp;&nbsp;└ ${cat.name} | ${formatValue(cat.values[0])} | ${formatValue(cat.values[1])} | ${formatValue(cat.values[2])} | ${formatValue(cat.values[3])} | ${cat.values[4].toFixed(1)}% |\n`;
        });
      });

      md += `| | | | | | |\n`;
      md += `| **[재원별 요약]** | | | | | |\n`;

      const summaryRows = [
        { label: "총 사업비", values: [annualTotalNat, annualTotalCity, annualTotalExt, annualTotalSum, 100.0] },
        { label: "인건비", values: [annualLaborNat, annualLaborCity, annualLaborExt, annualLaborSum, annualLaborRatio] },
        { label: "그 밖의 사업운영비", values: [annualOpNat, annualOpCity, annualOpExt, annualOpSum, annualOpRatio] },
        { label: "간접비", values: [annualIndNat, annualIndCity, annualIndExt, annualIndSum, annualIndRatio] },
        { label: "총사업비 중 운영비", values: [annualOnlyOpNat, annualOnlyOpCity, annualOnlyOpExt, annualOnlyOpSum, annualOnlyOpRatio] }
      ];

      summaryRows.forEach((row) => {
        md += `| **${row.label}** | ${formatValue(row.values[0])} | ${formatValue(row.values[1])} | ${formatValue(row.values[2])} | **${formatValue(row.values[3])}** | ${row.values[4].toFixed(1)}% |\n`;
      });

      const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `앵커사업비_${targetYear}년도_재원별_계획_${yyyy}${mm}${dd}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("마크다운 내보내기 도중 에러가 발생하였습니다: " + getErrorMessage(err));
    }
  };

  const getNormalizedUnitId = (id: string) => {
    if (id === "Common" || id === "X0") return id;
    const match = id.match(/^[A-D][1-4]/);
    return match ? match[0] : id;
  };

  const getUnitColor = (id: string) => {
    const colors: Record<string, string> = {
      A1: "#3b82f6",
      A2: "#60a5fa",
      B1: "#6366f1",
      B2: "#8b5cf6",
      C1: "#14b8a6",
      C2: "#10b981",
      D1: "#f59e0b",
      D2: "#ec4899",
      Common: "#94a3b8",
      X0: "#cbd5e1"
    };
    return colors[id] || "#64748b";
  };

  const HorizontalProgressBar = ({ title, items, unitText = "백만원" }: { title?: string; items: Array<{ name: string; value: number; color: string }>; unitText?: string }) => {
    const validItems = items.filter((item) => item.value > 0);
    const totalVal = validItems.reduce((acc: number, curr) => acc + curr.value, 0);

    return (
      <div style={{
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        padding: "1rem",
        marginBottom: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem"
      }}>
        {title && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)" }}>{title}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "500" }}>총 {totalVal.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}{unitText}</span>
          </div>
        )}

        <div style={{
          width: "100%",
          height: "20px",
          display: "flex",
          borderRadius: "10px",
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.03)"
        }}>
          {validItems.length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              예산 데이터가 없습니다.
            </div>
          ) : (
            validItems.map((item, idx: number) => {
              const itemRatio = totalVal > 0 ? (item.value / totalVal) * 100 : 0;
              return (
                <div
                  key={idx}
                  style={{
                    width: `${itemRatio}%`,
                    background: item.color,
                    height: "100%",
                    transition: "width 0.3s ease",
                    cursor: "pointer"
                  }}
                  title={`${item.name}: ${item.value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${unitText} (${itemRatio.toFixed(1)}%)`}
                />
              );
            })
          )}
        </div>

        {validItems.length > 0 && (
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem 1rem",
            fontSize: "0.72rem",
            color: "var(--text-secondary)",
            marginTop: "0.2rem"
          }}>
            {validItems.map((item, idx: number) => {
              const itemRatio = totalVal > 0 ? (item.value / totalVal) * 100 : 0;
              return (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: item.color,
                    display: "inline-block"
                  }} />
                  <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{item.name}</span>
                  <span>{itemRatio.toFixed(1)}%</span>
                  <span style={{ fontSize: "0.68rem", opacity: 0.75 }}>({item.value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })})</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderFiveYear = () => {
    const fiveYearUnitTotals: Record<string, number> = {};
    let totalSumVal = 0;
    TOTAL_INVESTMENT_5YEAR_DATA.forEach(u => {
      const normId = getNormalizedUnitId(u.id);
      const totalObj = u.total[5] || { main: 0, carry: 0 };
      const val = (totalObj.main || 0) + (totalObj.carry || 0);
      if (val > 0) {
        fiveYearUnitTotals[normId] = (fiveYearUnitTotals[normId] || 0) + val;
        totalSumVal += val;
      }
    });

    const fiveYearChartItems = Object.entries(fiveYearUnitTotals).map(([id, val]) => {
      let displayName = id;
      if (id === "Common") displayName = "공통경비";
      else if (id === "X0") displayName = "X0(공통)";
      return {
        id,
        name: displayName,
        value: val,
        ratio: totalSumVal > 0 ? (val / totalSumVal) * 100 : 0,
        color: getUnitColor(id)
      };
    }).sort((a, b) => {
      const order = ["A1", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "D1", "D2", "D3", "D4", "Common", "X0"];
      const idxA = order.indexOf(a.id);
      const idxB = order.indexOf(b.id);
      const posA = idxA === -1 ? 999 : idxA;
      const posB = idxB === -1 ? 999 : idxB;
      return posA - posB;
    });

    return (
      <div className="table-panel">
        {/* 💡 [요구사항 반영] 5개년 총괄 내보내기 버튼 그룹 */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          <button
            type="button"
            onClick={() => handleDownloadUnifiedExcel("five_year")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.45rem 0.85rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              borderRadius: "6px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#10b981",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(16, 185, 129, 0.25)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(16, 185, 129, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <FileSpreadsheet size={14} />
            Excel 다운로드
          </button>

          <button
            type="button"
            onClick={handleExportFiveYearPDF}
            disabled={isDownloadingPdf === "five_year"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.45rem 0.85rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              borderRadius: "6px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
              cursor: isDownloadingPdf === "five_year" ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              if (isDownloadingPdf !== "five_year") {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {isDownloadingPdf === "five_year" ? (
              <>
                <div className="spinner" style={{ width: "12px", height: "12px", border: "2px solid rgba(239,68,68,0.3)", borderTopColor: "#ef4444", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block", marginRight: "4px" }} />
                PDF 내보내는 중...
              </>
            ) : (
              <>
                <FileText size={14} />
                PDF 다운로드
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportFiveYearMarkdown}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.45rem 0.85rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              borderRadius: "6px",
              background: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              color: "#3b82f6",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Download size={14} />
            Markdown 다운로드
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1.25rem", background: "rgba(59, 130, 246, 0.05)", borderLeft: "4px solid var(--accent-color)", borderRadius: "4px", marginBottom: "1rem", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
          <span>💡 2차년도 사업비는 본사업비와 이월사업비로 구성되며, 타 연차는 본사업비만을 나타냄.</span>
          <span style={{ fontWeight: "700", color: "var(--accent-color)" }}>(단위: 백만원)</span>
        </div>

        {/* 5개년 단위과제별 합산비율 차트 (가로형 2D-Bar) */}
        <HorizontalProgressBar title="📊 5개년 단위과제별 예산 합산 비율" items={fiveYearChartItems} />

        <table className="custom-table" style={{ fontSize: "0.8rem", width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)" }}>
              <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>구분</th>
              <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>2025</th>
              <th colSpan={2} style={{ textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)", padding: "0.45rem" }}>
                2026
              </th>
              <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>2027</th>
              <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>2028</th>
              <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>2029</th>
              <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center", fontWeight: "800", color: "var(--accent-color)", borderBottom: "1px solid var(--border-color)" }}>합계</th>
            </tr>
            <tr style={{ background: "rgba(255,255,255,0.01)" }}>
              <th style={{ textAlign: "center", fontSize: "0.7rem", color: darkMode ? "#60a5fa" : "#1d4ed8", borderBottom: "1px solid var(--border-color)", borderRight: "1px dashed rgba(255, 255, 255, 0.15)" }}>본사업</th>
              <th style={{ textAlign: "center", fontSize: "0.7rem", color: darkMode ? "#34d399" : "#047857", borderBottom: "1px solid var(--border-color)", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>이월사업</th>
            </tr>
          </thead>
          <tbody>
            {TOTAL_INVESTMENT_5YEAR_DATA.map((u) => {
              const isExpanded = !!expandedUnits[u.id];
              const hasCategories = u.categories && u.categories.length > 0;
              return (
                <React.Fragment key={u.id}>
                  {/* 대단위과제 로우 */}
                  <tr
                    onClick={() => hasCategories && toggleUnit(u.id)}
                    style={{
                      cursor: hasCategories ? "pointer" : "default",
                      background: u.id === "Common" || u.id === "X0" ? "rgba(245, 158, 11, 0.08)" : "rgba(255,255,255,0.01)",
                      fontWeight: "700"
                    }}
                   role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                    <td style={{ paddingLeft: "1.5rem", color: u.id === "Common" || u.id === "X0" ? "#fbbf24" : "inherit", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {hasCategories && (
                        <span style={{ fontSize: "0.6rem", display: "inline-block", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }}>▶</span>
                      )}
                      {u.title}
                    </td>
                    {u.total.map((val, idx) => {
                      if (idx === 1) {
                        const mainVal = val.main || 0;
                        const carryVal = val.carry || 0;
                        return (
                          <React.Fragment key={idx}>
                            <td style={{ textAlign: "right", paddingRight: "0.5rem", color: darkMode ? "#60a5fa" : "#1d4ed8", borderRight: "1px dashed rgba(255, 255, 255, 0.15)", fontWeight: "700" }}>
                              {formatValue(mainVal)}
                            </td>
                            <td style={{ textAlign: "right", paddingRight: "0.5rem", color: darkMode ? "#34d399" : "#047857", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)", fontWeight: "700" }}>
                              {formatValue(carryVal)}
                            </td>
                          </React.Fragment>
                        );
                      }
                      const mainVal = val.main || 0;
                      const carryVal = val.carry || 0;
                      const sumVal = mainVal + carryVal;
                      let displayVal = "-";
                      if (idx === 0) displayVal = formatValue(sumVal);
                      else displayVal = formatValue(mainVal);

                      return (
                        <td
                          key={idx}
                          style={{
                            textAlign: "right",
                            paddingRight: idx === 5 ? "1.5rem" : "1rem",
                            fontWeight: idx === 5 ? "800" : "700",
                            color: idx === 5 ? "var(--accent-color)" : "inherit",
                            borderRight: idx === 5 ? "none" : "1.5px solid rgba(255, 255, 255, 0.2)"
                          }}
                        >
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                  {/* 세부 비목 아코디언 로우 */}
                  {isExpanded && u.categories.map((cat, catIdx) => (
                    <tr key={`${u.id}-${catIdx}`} style={{ background: "rgba(0,0,0,0.25)", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      <td style={{ paddingLeft: "3rem", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>
                        {cat.name}
                      </td>
                      {cat.values.map((v, vIdx) => {
                        if (vIdx === 1) {
                          const mainVal = v.main || 0;
                          const carryVal = v.carry || 0;
                          return (
                            <React.Fragment key={vIdx}>
                              <td style={{ textAlign: "right", paddingRight: "0.5rem", color: darkMode ? "#60a5fa" : "#1d4ed8", borderRight: "1px dashed rgba(255, 255, 255, 0.15)" }}>
                                {formatValue(mainVal)}
                              </td>
                              <td style={{ textAlign: "right", paddingRight: "0.5rem", color: darkMode ? "#34d399" : "#047857", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>
                                {formatValue(carryVal)}
                              </td>
                            </React.Fragment>
                          );
                        }
                        const mainVal = v.main || 0;
                        const carryVal = v.carry || 0;
                        const sumVal = mainVal + carryVal;
                        let displayVal = "-";
                        if (vIdx === 0) displayVal = formatValue(sumVal);
                        else displayVal = formatValue(mainVal);

                        return (
                          <td key={vIdx} style={{ textAlign: "right", paddingRight: vIdx === 5 ? "1.5rem" : "1rem", borderRight: vIdx === 5 ? "none" : "1.5px solid rgba(255, 255, 255, 0.2)" }}>
                            {displayVal}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}

            {/* 총 합계 요약 영역 */}
            <tr style={{ borderTop: "2px solid var(--accent-color)", background: "rgba(59, 130, 246, 0.05)", fontWeight: "800" }}>
              <td style={{ paddingLeft: "1.5rem", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>총 사업비</td>
              {TOTAL_INVESTMENT_SUMMARY_DATA.total.map((v, i) => {
                if (i === 1) {
                  const mainVal = v.main || 0;
                  const carryVal = v.carry || 0;
                  return (
                    <React.Fragment key={i}>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", color: darkMode ? "#60a5fa" : "#1d4ed8", borderRight: "1px dashed rgba(255, 255, 255, 0.15)" }}>
                        {formatValue(mainVal)}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", color: darkMode ? "#34d399" : "#047857", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>
                        {formatValue(carryVal)}
                      </td>
                    </React.Fragment>
                  );
                }
                const mainVal = v.main || 0;
                const carryVal = v.carry || 0;
                const sumVal = mainVal + carryVal;
                let displayVal = "-";
                if (i === 0) displayVal = formatValue(sumVal);
                else displayVal = formatValue(mainVal);
                return <td key={i} style={{ textAlign: "right", paddingRight: i === 5 ? "1.5rem" : "1rem", borderRight: i === 5 ? "none" : "1.5px solid rgba(255, 255, 255, 0.2)" }}>{displayVal}</td>;
              })}
            </tr>
            <tr style={{ background: "rgba(255,255,255,0.02)", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              <td style={{ paddingLeft: "3rem", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>인건비</td>
              {TOTAL_INVESTMENT_SUMMARY_DATA.labor.map((v, i) => {
                if (i === 1) {
                  const mainVal = v.main || 0;
                  const carryVal = v.carry || 0;
                  return (
                    <React.Fragment key={i}>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", color: "#60a5fa", borderRight: "1px dashed rgba(255, 255, 255, 0.15)" }}>
                        {formatValue(mainVal)}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", color: "#34d399", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>
                        {formatValue(carryVal)}
                      </td>
                    </React.Fragment>
                  );
                }
                const mainVal = v.main || 0;
                const carryVal = v.carry || 0;
                const sumVal = mainVal + carryVal;
                let displayVal = "-";
                if (i === 0) displayVal = formatValue(sumVal);
                else displayVal = formatValue(mainVal);
                return <td key={i} style={{ textAlign: "right", paddingRight: i === 5 ? "1.5rem" : "1rem", borderRight: i === 5 ? "none" : "1.5px solid rgba(255, 255, 255, 0.2)" }}>{displayVal}</td>;
              })}
            </tr>
            <tr style={{ background: "rgba(255,255,255,0.02)", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              <td style={{ paddingLeft: "3rem", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>그 밖의 사업운영비</td>
              {TOTAL_INVESTMENT_SUMMARY_DATA.operation.map((v, i) => {
                if (i === 1) {
                  const mainVal = v.main || 0;
                  const carryVal = v.carry || 0;
                  return (
                    <React.Fragment key={i}>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", color: "#60a5fa", borderRight: "1px dashed rgba(255, 255, 255, 0.15)" }}>
                        {formatValue(mainVal)}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", color: "#34d399", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>
                        {formatValue(carryVal)}
                      </td>
                    </React.Fragment>
                  );
                }
                const mainVal = v.main || 0;
                const carryVal = v.carry || 0;
                const sumVal = mainVal + carryVal;
                let displayVal = "-";
                if (i === 0) displayVal = formatValue(sumVal);
                else displayVal = formatValue(mainVal);
                return <td key={i} style={{ textAlign: "right", paddingRight: i === 5 ? "1.5rem" : "1rem", borderRight: i === 5 ? "none" : "1.5px solid rgba(255, 255, 255, 0.2)" }}>{displayVal}</td>;
              })}
            </tr>
            <tr style={{ background: "rgba(255,255,255,0.02)", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              <td style={{ paddingLeft: "3rem", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>간접비</td>
              {TOTAL_INVESTMENT_SUMMARY_DATA.indirect.map((v, i) => {
                if (i === 1) {
                  const mainVal = v.main || 0;
                  const carryVal = v.carry || 0;
                  return (
                    <React.Fragment key={i}>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", color: "#60a5fa", borderRight: "1px dashed rgba(255, 255, 255, 0.15)" }}>
                        {formatValue(mainVal)}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", color: "#34d399", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)" }}>
                        {formatValue(carryVal)}
                      </td>
                    </React.Fragment>
                  );
                }
                const mainVal = v.main || 0;
                const carryVal = v.carry || 0;
                const sumVal = mainVal + carryVal;
                let displayVal = "-";
                if (i === 0) displayVal = formatValue(sumVal);
                else displayVal = formatValue(mainVal);
                return <td key={i} style={{ textAlign: "right", paddingRight: i === 5 ? "1.5rem" : "1rem", borderRight: i === 5 ? "none" : "1.5px solid rgba(255, 255, 255, 0.2)" }}>{displayVal}</td>;
              })}
            </tr>
            <tr style={{ borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(16, 185, 129, 0.05)", fontWeight: "800" }}>
              <td style={{ paddingLeft: "1.5rem", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)", color: "#10b981" }}>총사업비 중 운영비</td>
              {TOTAL_INVESTMENT_SUMMARY_DATA.only_operation.map((v, i) => {
                if (i === 1) {
                  const mainVal = v.main || 0;
                  const carryVal = v.carry || 0;
                  return (
                    <React.Fragment key={i}>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", borderRight: "1px dashed rgba(255, 255, 255, 0.15)", color: "#10b981" }}>
                        {formatValue(mainVal)}
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "0.5rem", borderRight: "1.5px solid rgba(255, 255, 255, 0.2)", color: "#10b981" }}>
                        {formatValue(carryVal)}
                      </td>
                    </React.Fragment>
                  );
                }
                const mainVal = v.main || 0;
                const carryVal = v.carry || 0;
                const sumVal = mainVal + carryVal;
                let displayVal = "-";
                if (i === 0) displayVal = formatValue(sumVal);
                else displayVal = formatValue(mainVal);
                return <td key={i} style={{ textAlign: "right", paddingRight: i === 5 ? "1.5rem" : "1rem", color: "#10b981", borderRight: i === 5 ? "none" : "1.5px solid rgba(255, 255, 255, 0.2)" }}>{displayVal}</td>;
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderAnnual = () => {
    // (1) 당해년도 단위과제별 예산(국비+시비) 비율 가공
    const annualUnitTotals: Record<string, number> = {};
    let annualTotalGovSum = 0;
    ANNUAL_INVESTMENT_DATA.forEach(u => {
      const normId = getNormalizedUnitId(u.id);
      const val = (u.total[0] || 0) + (u.total[1] || 0); // 국비 + 시비
      if (val > 0) {
        annualUnitTotals[normId] = (annualUnitTotals[normId] || 0) + val;
        annualTotalGovSum += val;
      }
    });

    const annualUnitChartItems = Object.entries(annualUnitTotals).map(([id, val]) => {
      let displayName = id;
      if (id === "Common") displayName = "공통경비";
      else if (id === "X0") displayName = "X0(공통)";
      return {
        id,
        name: displayName,
        value: val,
        ratio: annualTotalGovSum > 0 ? (val / annualTotalGovSum) * 100 : 0,
        color: getUnitColor(id)
      };
    }).sort((a, b) => {
      const order = ["A1", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "D1", "D2", "D3", "D4", "Common", "X0"];
      const idxA = order.indexOf(a.id);
      const idxB = order.indexOf(b.id);
      const posA = idxA === -1 ? 999 : idxA;
      const posB = idxB === -1 ? 999 : idxB;
      return posA - posB;
    });

    // (2) 전체사업비 중 국비 vs. 시비 vs. 외부사업비 비율 가공
    const sourceChartItems = [
      { name: "국비", value: annualTotalNat, color: "#3b82f6" },
      { name: "시비", value: annualTotalCity, color: "#10b981" },
      { name: "외부사업비", value: annualTotalExt, color: "#f59e0b" }
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* 💡 [요구사항 반영] 연차별 계획 내보내기 버튼 그룹 */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
          <button
            type="button"
            onClick={() => handleDownloadUnifiedExcel("annual")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.45rem 0.85rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              borderRadius: "6px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#10b981",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(16, 185, 129, 0.25)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(16, 185, 129, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <FileSpreadsheet size={14} />
            Excel 다운로드
          </button>

          <button
            type="button"
            onClick={handleExportAnnualPDF}
            disabled={isDownloadingPdf === "annual"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.45rem 0.85rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              borderRadius: "6px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
              cursor: isDownloadingPdf === "annual" ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              if (isDownloadingPdf !== "annual") {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {isDownloadingPdf === "annual" ? (
              <>
                <div className="spinner" style={{ width: "12px", height: "12px", border: "2px solid rgba(239,68,68,0.3)", borderTopColor: "#ef4444", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block", marginRight: "4px" }} />
                PDF 내보내는 중...
              </>
            ) : (
              <>
                <FileText size={14} />
                PDF 다운로드
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportAnnualMarkdown}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.45rem 0.85rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              borderRadius: "6px",
              background: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              color: "#3b82f6",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Download size={14} />
            Markdown 다운로드
          </button>
        </div>
        {/* 요약 연차 정보 헤더 */}
        <div style={{ padding: "0.5rem 0", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h4 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "0.3rem" }}>■ {targetYear}년도 예산</h4>
            <div style={{ fontSize: "0.85rem", color: "var(--accent-color)", fontWeight: "700" }}>
              ○ {formatValue(annualTotalSum)}백만 원 (국비 {formatValue(annualTotalNat)}, 시비 {formatValue(annualTotalCity)}, 외부사업비 {formatValue(annualTotalExt)})
            </div>
          </div>
          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--accent-color)" }}>(단위: 백만원)</span>
        </div>

        {/* 당해년도 단위과제별 예산(국비+시비) 비율 차트 */}
        <HorizontalProgressBar title={`📊 ${targetYear}년도 단위과제별 예산(국비+시비) 비율`} items={annualUnitChartItems} />

        {/* 당해년도 재원별(국비/시비/외부) 안분 비율 차트 */}
        <HorizontalProgressBar title={`📊 ${targetYear}년도 전체사업비 재원 구성 비율`} items={sourceChartItems} />

        <div className="table-panel">
          <table className="custom-table" style={{ fontSize: "0.8rem", width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                <th style={{ verticalAlign: "middle", textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>구분</th>
                <th style={{ textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>국비</th>
                <th style={{ textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>시비</th>
                <th style={{ textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>외부사업비</th>
                <th style={{ textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid rgba(255, 255, 255, 0.1)", fontWeight: "800", color: "var(--accent-color)" }}>합계</th>
                <th style={{ textAlign: "center", borderBottom: "1px solid var(--border-color)", borderRight: "none" }}>비율 (%)</th>
              </tr>
            </thead>
            <tbody>
              {ANNUAL_INVESTMENT_DATA.map((u) => {
                const isExpanded = !!expandedUnits[u.id];
                const hasCategories = u.categories && u.categories.length > 0;
                return (
                  <React.Fragment key={u.id}>
                    {/* 대단위과제 로우 */}
                    <tr
                      onClick={() => hasCategories && toggleUnit(u.id)}
                      style={{
                        cursor: hasCategories ? "pointer" : "default",
                        background: u.id === "Common" || u.id === "X0" ? "rgba(245, 158, 11, 0.08)" : "rgba(255,255,255,0.01)",
                        fontWeight: "700"
                      }}
                     role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                      <td style={{ paddingLeft: "1.5rem", color: u.id === "Common" || u.id === "X0" ? "#fbbf24" : "inherit", borderRight: "1px solid rgba(255, 255, 255, 0.1)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {hasCategories && (
                          <span style={{ fontSize: "0.6rem", display: "inline-block", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }}>▶</span>
                        )}
                        {u.title}
                      </td>
                      {u.total.map((val, idx) => (
                        <td
                          key={idx}
                          style={{
                            textAlign: idx === 4 ? "center" : "right",
                            paddingRight: idx === 4 ? "0" : "1rem",
                            fontWeight: (idx === 3 || idx === 4) ? "800" : "700",
                            color: idx === 3 ? "var(--accent-color)" : "inherit",
                            borderRight: idx === 4 ? "none" : "1px solid rgba(255, 255, 255, 0.1)"
                          }}
                        >
                          {idx === 4 ? `${val.toFixed(0)}` : formatValue(val)}
                        </td>
                      ))}
                    </tr>
                    {/* 세부 비목 아코디언 로우 */}
                    {isExpanded && u.categories.map((cat, catIdx) => (
                      <tr key={`${u.id}-${catIdx}`} style={{ background: "rgba(0,0,0,0.25)", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        <td style={{ paddingLeft: "3rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>
                          {cat.name}
                        </td>
                        {cat.values.map((v, vIdx) => (
                          <td
                            key={vIdx}
                            style={{
                              textAlign: vIdx === 4 ? "center" : "right",
                              paddingRight: vIdx === 4 ? "0" : "1rem",
                              borderRight: vIdx === 4 ? "none" : "1px solid rgba(255, 255, 255, 0.1)"
                            }}
                          >
                            {vIdx === 4 ? `${v.toFixed(1)}%` : formatValue(v)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}

              {/* 총 합계 요약 영역 */}
              <tr style={{ borderTop: "2px solid var(--accent-color)", background: "rgba(59, 130, 246, 0.05)", fontWeight: "800" }}>
                <td style={{ paddingLeft: "1.5rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>총 사업비</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualTotalNat)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualTotalCity)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualTotalExt)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", color: "var(--accent-color)", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualTotalSum)}</td>
                <td style={{ textAlign: "center", borderRight: "none" }}>100</td>
              </tr>
              <tr style={{ background: "rgba(255,255,255,0.02)", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                <td style={{ paddingLeft: "3rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>인건비</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualLaborNat)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualLaborCity)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualLaborExt)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualLaborSum)}</td>
                <td style={{ textAlign: "center", borderRight: "none" }}>{annualLaborRatio.toFixed(1)}%</td>
              </tr>
              <tr style={{ background: "rgba(255,255,255,0.02)", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                <td style={{ paddingLeft: "3rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>그 밖의 사업운영비</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualOpNat)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualOpCity)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualOpExt)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualOpSum)}</td>
                <td style={{ textAlign: "center", borderRight: "none" }}>{annualOpRatio.toFixed(1)}%</td>
              </tr>
              <tr style={{ background: "rgba(255,255,255,0.02)", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                <td style={{ paddingLeft: "3rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>간접비</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualIndNat)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualIndCity)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualIndExt)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualIndSum)}</td>
                <td style={{ textAlign: "center", borderRight: "none" }}>{annualIndRatio.toFixed(1)}%</td>
              </tr>
              <tr style={{ borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(16, 185, 129, 0.05)", fontWeight: "800" }}>
                <td style={{ paddingLeft: "1.5rem", borderRight: "1px solid rgba(255, 255, 255, 0.1)", color: "#10b981" }}>총사업비 중 운영비</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", color: "#10b981", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualOnlyOpNat)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", color: "#10b981", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualOnlyOpCity)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", color: "#10b981", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualOnlyOpExt)}</td>
                <td style={{ textAlign: "right", paddingRight: "1rem", color: "#10b981", borderRight: "1px solid rgba(255, 255, 255, 0.1)" }}>{formatValue(annualOnlyOpSum)}</td>
                <td style={{ textAlign: "center", color: "#10b981", borderRight: "none" }}>{annualOnlyOpRatio.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 엑셀 다운로드 헬퍼
  const handleDownloadUnifiedExcel = async (type: "all" | "five_year" | "annual" = "all") => {
      // 1. 5개년 총괄 데이터 포맷팅
      const fiveYearRows: Array<Array<string | number>> = [];
      fiveYearRows.push([
        "구분",
        "2025",
        "2026 (본사업)",
        "2026 (이월사업)",
        "2027",
        "2028",
        "2029",
        "합계"
      ]);

      TOTAL_INVESTMENT_5YEAR_DATA.forEach((u) => {
        fiveYearRows.push([
          u.title,
          u.total[0].main + u.total[0].carry,
          u.total[1].main,
          u.total[1].carry,
          u.total[2].main,
          u.total[3].main,
          u.total[4].main,
          u.total[5].main + u.total[5].carry
        ]);
        u.categories.forEach((cat) => {
          fiveYearRows.push([
            `   └ ${cat.name}`,
            cat.values[0].main + cat.values[0].carry,
            cat.values[1].main,
            cat.values[1].carry,
            cat.values[2].main,
            cat.values[3].main,
            cat.values[4].main,
            cat.values[5].main + cat.values[5].carry
          ]);
        });
      });

      fiveYearRows.push([]);
      fiveYearRows.push(["[총괄 요약]"]);

      const summaryTypes = [
        { label: "총 사업비", data: TOTAL_INVESTMENT_SUMMARY_DATA.total },
        { label: "인건비", data: TOTAL_INVESTMENT_SUMMARY_DATA.labor },
        { label: "그 밖의 사업운영비", data: TOTAL_INVESTMENT_SUMMARY_DATA.operation },
        { label: "간접비", data: TOTAL_INVESTMENT_SUMMARY_DATA.indirect },
        { label: "총사업비 중 운영비", data: TOTAL_INVESTMENT_SUMMARY_DATA.only_operation }
      ];

      summaryTypes.forEach((st) => {
        fiveYearRows.push([
          st.label,
          st.data[0].main + st.data[0].carry,
          st.data[1].main,
          st.data[1].carry,
          st.data[2].main,
          st.data[3].main,
          st.data[4].main,
          st.data[5].main + st.data[5].carry
        ]);
      });

      // 2. 연차별 계획 데이터 포맷팅
      const annualRows: Array<Array<string | number>> = [];
      annualRows.push([
        `${targetYear}년도 구분`,
        "국비",
        "시비",
        "외부사업비",
        "합계",
        "비율 (%)"
      ]);

      ANNUAL_INVESTMENT_DATA.forEach((u) => {
        annualRows.push([
          u.title,
          u.total[0],
          u.total[1],
          u.total[2],
          u.total[3],
          u.total[4]
        ]);
        u.categories.forEach((cat) => {
          annualRows.push([
            `   └ ${cat.name}`,
            cat.values[0],
            cat.values[1],
            cat.values[2],
            cat.values[3],
            cat.values[4]
          ]);
        });
      });

      annualRows.push([]);
      annualRows.push(["[재원별 요약]"]);
      annualRows.push(["총 사업비", annualTotalNat, annualTotalCity, annualTotalExt, annualTotalSum, 100]);
      annualRows.push(["인건비", annualLaborNat, annualLaborCity, annualLaborExt, annualLaborSum, annualLaborRatio]);
      annualRows.push(["그 밖의 사업운영비", annualOpNat, annualOpCity, annualOpExt, annualOpSum, annualOpRatio]);
      annualRows.push(["간접비", annualIndNat, annualIndCity, annualIndExt, annualIndSum, annualIndRatio]);
      annualRows.push(["총사업비 중 운영비", annualOnlyOpNat, annualOnlyOpCity, annualOnlyOpExt, annualOnlyOpSum, annualOnlyOpRatio]);

      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();

      if (type === "all" || type === "five_year") {
        const wsFiveYear = XLSX.utils.aoa_to_sheet(fiveYearRows);
        XLSX.utils.book_append_sheet(wb, wsFiveYear, "5개년 총괄 투자 계획");
      }
      if (type === "all" || type === "annual") {
        const wsAnnual = XLSX.utils.aoa_to_sheet(annualRows);
        XLSX.utils.book_append_sheet(wb, wsAnnual, `${targetYear}년도 재원별 계획`);
      }

      const filename = type === "all"
        ? `앵커사업비_통합_투자계획_현황_${targetYear}.xlsx`
        : type === "five_year"
          ? `앵커사업비_5개년_총괄_투자계획_${targetYear}.xlsx`
          : `앵커사업비_${targetYear}년도_재원별_계획.xlsx`;

      XLSX.writeFile(wb, filename);
  };

  const _renderExcelDownload = () => {
    return (
      <div className="glass-card" style={{ padding: "2.5rem", maxWidth: "600px", margin: "2rem auto", textAlign: "center", border: "1px solid var(--border-color)" }}>
        <div style={{ display: "inline-flex", padding: "1.2rem", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", marginBottom: "1.5rem" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-spreadsheet">
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M8 13h2" />
            <path d="M14 13h2" />
            <path d="M8 17h2" />
            <path d="M14 17h2" />
          </svg>
        </div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "0.5rem" }}>투자 계획 엑셀 다운로드</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: "1.5" }}>
          울산과학대학교 앵커사업비 계획의 5개년 총괄 현황 및 {targetYear}년도 연차별 재원별 현황을 단 한 번에 워크북 시트로 묶어 엑셀 파일로 내려받습니다.
        </p>

        <button
          onClick={() => handleDownloadUnifiedExcel("all")}
          className="btn-primary"
          style={{
            width: "100%",
            padding: "0.85rem 1.5rem",
            fontSize: "0.95rem",
            fontWeight: "800",
            borderRadius: "6px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
            transition: "all 0.2s ease",
            marginBottom: "1rem"
          }}
        >
          📥 통합 투자 계획서 엑셀 다운로드 (.xlsx)
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
          <button
            onClick={() => handleDownloadUnifiedExcel("five_year")}
            style={{
              padding: "0.60rem 1rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              borderRadius: "4px",
              background: "rgba(255, 255, 255, 0.05)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            📄 5개년 총괄만 받기
          </button>
          <button
            onClick={() => handleDownloadUnifiedExcel("annual")}
            style={{
              padding: "0.60rem 1rem",
              fontSize: "0.8rem",
              fontWeight: "700",
              borderRadius: "4px",
              background: "rgba(255, 255, 255, 0.05)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            📅 {targetYear}년도 계획만 받기
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* 2단계 서브 메뉴 헤더 (5개년 총괄 / 연차별 계획) */}
      <div style={{ display: "flex", gap: "1rem", background: "rgba(255,255,255,0.02)", padding: "0.4rem 0.6rem", borderRadius: "8px", border: "1px solid var(--border-color)", width: "fit-content" }}>
        <button
          onClick={() => onChangeInvestmentSubTab("five_year")}
          style={{
            background: investmentSubTab === "five_year" ? "var(--accent-color)" : "transparent",
            color: investmentSubTab === "five_year" ? "#fff" : "var(--text-secondary)",
            border: "none",
            borderRadius: "6px",
            padding: "0.4rem 1.2rem",
            fontWeight: "700",
            fontSize: "0.82rem",
            cursor: "pointer",
            transition: "all 0.18s ease"
          }}
        >
          5개년 총괄
        </button>
        <button
          onClick={() => onChangeInvestmentSubTab("annual")}
          style={{
            background: investmentSubTab === "annual" ? "var(--accent-color)" : "transparent",
            color: investmentSubTab === "annual" ? "#fff" : "var(--text-secondary)",
            border: "none",
            borderRadius: "6px",
            padding: "0.4rem 1.2rem",
            fontWeight: "700",
            fontSize: "0.82rem",
            cursor: "pointer",
            transition: "all 0.18s ease"
          }}
        >
          연차별 계획 (재원별)
        </button>
      </div>

      {/* 실시간 렌더링 스위칭 */}
      {investmentSubTab === "five_year" ? renderFiveYear() : renderAnnual()}
    </div>
  );
}
