import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import KPIOverview from "./components/KPIOverview";
import ExcelUploader from "./components/ExcelUploader";
import PDCAManager from "./components/PDCAManager";
import BudgetItemsManager from "./components/BudgetItemsManager";
import ProgramProgressManager from "./components/ProgramProgressManager";
import AuthManager from "./components/AuthManager";
import { initialProjectsData, userRoles, YEAR_1_PROGRAMS, Y1_UNIT_META } from "./data/mockData";
import { Sun, Moon, LogOut, HelpCircle, ArrowUpRight, Lock as LockIcon } from "lucide-react";
import { supabase } from "./supabaseClient";
import CryptoJS from "crypto-js";
import "./styles/dashboard.css";

// RISE 사업단 초기 구성원 주소록 명단 데이터셋
const INITIAL_MEMBERS = [
  // 교수 및 리더진
  { id: "m-01", name: "송경영", role: "사업단장", grade: "정교수", dept: "-", phoneOffice: "052-279-3154", phoneMobile: "010-7627-7123", email: "kysong@uc.ac.kr", room: "교수연구실/E1-307", hireDate: "2026-03-01" },
  { id: "m-02", name: "김현수", role: "본부장", grade: "정교수", dept: "운영본부", phoneOffice: "052-279-3122", phoneMobile: "010-4628-7963", email: "hskim3@uc.ac.kr", room: "교수연구실/E2-414", hireDate: "2026-03-01" },
  { id: "m-03", name: "심현미", role: "운영팀장", grade: "부장", dept: "사업운영팀", phoneOffice: "052-230-0441", phoneMobile: "010-6554-8359", email: "hmsim@uc.ac.kr", room: "산학협력단/S-203", hireDate: "2026-03-01" },
  { id: "m-04", name: "이동은", role: "센터장", grade: "정교수", dept: "ECC센터", phoneOffice: "052-230-0111", phoneMobile: "010-1234-5678", email: "delee@uc.ac.kr", room: "교수연구실/E2-201", hireDate: "2026-03-01" },
  { id: "m-05", name: "김기범", role: "센터장", grade: "정교수", dept: "ICC센터", phoneOffice: "052-230-0222", phoneMobile: "010-2345-6789", email: "kbkim@uc.ac.kr", room: "교수연구실/E2-301", hireDate: "2026-03-01" },
  { id: "m-06", name: "현용환", role: "센터장", grade: "정교수", dept: "RCC센터", phoneOffice: "052-230-0333", phoneMobile: "010-3456-7890", email: "yhhyun@uc.ac.kr", room: "교수연구실/E2-401", hireDate: "2026-03-01" },
  { id: "m-07", name: "홍광표", role: "센터장", grade: "정교수", dept: "울산늘봄누리센터", phoneOffice: "052-230-0444", phoneMobile: "010-4567-8901", email: "gphong@uc.ac.kr", room: "교수연구실/E2-501", hireDate: "2026-03-01" },
  { id: "m-07b", name: "홍진숙", role: "센터장", grade: "정교수", dept: "신산업특화센터", phoneOffice: "052-279-3134", phoneMobile: "010-9120-8583", email: "cshong@uc.ac.kr", room: "센터실/N-101", hireDate: "2026-06-01" },
  
  // 팀장교수
  { id: "m-08", name: "장광일", role: "팀장교수", grade: "정교수", dept: "ECC센터", phoneOffice: "052-230-0112", phoneMobile: "010-5678-9012", email: "kijang@uc.ac.kr", room: "교수연구실/E2-202", hireDate: "2026-03-01" },
  { id: "m-09", name: "고형석", role: "팀장교수", grade: "정교수", dept: "ECC센터", phoneOffice: "052-230-0113", phoneMobile: "010-6789-0123", email: "hsko@uc.ac.kr", room: "교수연구실/E2-203", hireDate: "2026-03-01" },
  { id: "m-10", name: "양승호", role: "팀장교수", grade: "정교수", dept: "ECC센터", phoneOffice: "052-230-0114", phoneMobile: "010-7890-1234", email: "shyang@uc.ac.kr", room: "교수연구실/E2-204", hireDate: "2026-03-01" },
  { id: "m-11", name: "김산", role: "팀장교수", grade: "정교수", dept: "ICC센터", phoneOffice: "052-230-0223", phoneMobile: "010-8901-2345", email: "skim@uc.ac.kr", room: "교수연구실/E2-302", hireDate: "2026-03-01" },
  { id: "m-12", name: "한미라", role: "팀장교수", grade: "정교수", dept: "ICC센터", phoneOffice: "052-230-0224", phoneMobile: "010-9012-3456", email: "mrhan@uc.ac.kr", room: "교수연구실/E2-303", hireDate: "2026-03-01" },
  { id: "m-13", name: "김민경", role: "팀장교수", grade: "정교수", dept: "RCC센터", phoneOffice: "052-230-0334", phoneMobile: "010-0123-4567", email: "mkkim@uc.ac.kr", room: "교수연구실/E2-402", hireDate: "2026-03-01" },
  { id: "m-14", name: "이한도", role: "팀장교수", grade: "정교수", dept: "RCC센터", phoneOffice: "052-230-0335", phoneMobile: "010-1234-8765", email: "hdlee@uc.ac.kr", room: "교수연구실/E2-403", hireDate: "2026-03-01" },
  { id: "m-15", name: "이상현", role: "팀장교수", grade: "정교수", dept: "RCC센터", phoneOffice: "052-230-0336", phoneMobile: "010-2345-9876", email: "shlee@uc.ac.kr", room: "교수연구실/E2-404", hireDate: "2026-03-01" },
  { id: "m-16", name: "이정준", role: "팀장교수", grade: "정교수", dept: "AID-X지원센터", phoneOffice: "052-230-0445", phoneMobile: "010-3456-0987", email: "jjlee@uc.ac.kr", room: "교수연구실/E2-502", hireDate: "2026-03-01" },

  // 실무 연구원 (등급/직위 3구분 적용)
  { id: "m-17", name: "이현섭", role: "연구원", grade: "책임연구원", dept: "RCC센터", phoneOffice: "052-230-0417", phoneMobile: "010-8252-1151", email: "mogern1@uc.ac.kr", room: "연구원실/R-101", hireDate: "2026-03-01" },
  { id: "m-18", name: "이은주", role: "연구원", grade: "선임연구원", dept: "ECC센터", phoneOffice: "052-230-0414", phoneMobile: "010-4026-3850", email: "ejlee7@uc.ac.kr", room: "연구원실/E-101", hireDate: "2026-03-01" },
  { id: "m-19", name: "이정은", role: "연구원", grade: "선임연구원", dept: "ICC센터", phoneOffice: "052-279-3305", phoneMobile: "010-3435-6878", email: "lje6878@uc.ac.kr", room: "연구원실/I-101", hireDate: "2026-03-01" },
  { id: "m-20", name: "임은애", role: "연구원", grade: "선임연구원", dept: "AID-X지원센터", phoneOffice: "052-279-3319", phoneMobile: "010-4595-5406", email: "jslover85@uc.ac.kr", room: "연구원실/A101", hireDate: "2026-03-01" },
  { id: "m-21", name: "박인숙", role: "연구원", grade: "선임연구원", dept: "RCC센터", phoneOffice: "052-230-0428", phoneMobile: "010-5703-5706", email: "ispark@uc.ac.kr", room: "연구원실/R-102", hireDate: "2026-03-01" },
  { id: "m-22", name: "한유경", role: "연구원", grade: "선임연구원", dept: "사업운영팀", phoneOffice: "052-230-0452", phoneMobile: "010-5137-7030", email: "hanyuky@uc.ac.kr", room: "운영팀실/S-204", hireDate: "2026-03-01" },
  { id: "m-23", name: "황수진", role: "연구원", grade: "선임연구원", dept: "울산늘봄누리센터", phoneOffice: "052-230-0418", phoneMobile: "010-2080-2503", email: "sujin5599@uc.ac.kr", room: "연구원실/N-103", hireDate: "2026-03-01" },
  { id: "m-24", name: "서란", role: "연구원", grade: "연구원", dept: "ECC센터", phoneOffice: "052-230-0415", phoneMobile: "010-8636-1276", email: "rseo2@uc.ac.kr", room: "연구원실/E-102", hireDate: "2026-03-01" },
  { id: "m-25", name: "정자윤", role: "연구원", grade: "연구원", dept: "ECC센터", phoneOffice: "052-230-0673", phoneMobile: "010-3517-9169", email: "jyjung2@uc.ac.kr", room: "연구원실/E-103", hireDate: "2026-03-01" },
  { id: "m-26", name: "박기범", role: "연구원", grade: "연구원", dept: "ECC센터", phoneOffice: "052-230-0445", phoneMobile: "010-8079-1798", email: "gbbak@uc.ac.kr", room: "연구원실/E-104", hireDate: "2026-03-01" },
  { id: "m-27", name: "김소연", role: "연구원", grade: "연구원", dept: "ECC센터", phoneOffice: "052-230-0667", phoneMobile: "010-2482-9506", email: "sysy400@uc.ac.kr", room: "연구원실/E-105", hireDate: "2026-03-01" },
  { id: "m-28", name: "이혜성", role: "연구원", grade: "연구원", dept: "ICC센터", phoneOffice: "052-279-3307", phoneMobile: "010-3459-0429", email: "hslee4@uc.ac.kr", room: "연구원실/I-102", hireDate: "2026-03-01" },
  { id: "m-29", name: "도지은", role: "연구원", grade: "연구원", dept: "ICC센터", phoneOffice: "052-279-3313", phoneMobile: "010-4262-0370", email: "jido@uc.ac.kr", room: "연구원실/I-103", hireDate: "2026-03-01" },
  { id: "m-30", name: "이연향", role: "연구원", grade: "연구원", dept: "RCC센터", phoneOffice: "052-230-0427", phoneMobile: "010-7165-7038", email: "yhlee4@uc.ac.kr", room: "연구원실/R-103", hireDate: "2026-03-01" },
  { id: "m-31", name: "김소정", role: "연구원", grade: "연구원", dept: "RCC센터", phoneOffice: "052-230-0450", phoneMobile: "010-3162-1678", email: "sjkim9@uc.ac.kr", room: "연구원실/R-104", hireDate: "2026-03-01" },
  { id: "m-32", name: "오영경", role: "연구원", grade: "연구원", dept: "RCC센터", phoneOffice: "052-230-0449", phoneMobile: "010-2636-3832", email: "ohyk@uc.ac.kr", room: "연구원실/R-105", hireDate: "2026-03-01" },
  { id: "m-33", name: "최승혜", role: "연구원", grade: "연구원", dept: "RCC센터", phoneOffice: "052-230-0448", phoneMobile: "010-8545-9087", email: "shchoi2@uc.ac.kr", room: "연구원실/R-106", hireDate: "2026-03-01" },
  { id: "m-34", name: "서은지", role: "연구원", grade: "연구원", dept: "AID-X지원센터", phoneOffice: "052-279-3220", phoneMobile: "010-3294-8295", email: "ajaeunji@uc.ac.kr", room: "연구원실/A102", hireDate: "2026-03-01" },
  { id: "m-35", name: "채민지", role: "연구원", grade: "연구원", dept: "AID-X지원센터", phoneOffice: "052-279-3185", phoneMobile: "010-7682-6864", email: "minji6843@uc.ac.kr", room: "연구원실/A103", hireDate: "2026-03-01" },
  { id: "m-36", name: "김나희", role: "연구원", grade: "연구원", dept: "신산업특화센터", phoneOffice: "052-230-0709", phoneMobile: "010-4363-7319", email: "nhkim2@uc.ac.kr", room: "센터실/N-101", hireDate: "2026-03-01" },
  { id: "m-37", name: "정호성", role: "연구원", grade: "연구원", dept: "신산업특화센터", phoneOffice: "052-230-0708", phoneMobile: "010-9208-7849", email: "jhsung@uc.ac.kr", room: "센터실/N-102", hireDate: "2026-03-01" },
  { id: "m-38", name: "김래림", role: "연구원", grade: "연구원", dept: "사업운영팀", phoneOffice: "052-230-0529", phoneMobile: "010-5246-9520", email: "rrkim@uc.ac.kr", room: "운영팀실/S-206", hireDate: "2026-03-01" },
  { id: "m-39", name: "박언주", role: "연구원", grade: "연구원", dept: "사업운영팀", phoneOffice: "052-230-0443", phoneMobile: "010-2541-5992", email: "ejpark@uc.ac.kr", room: "운영팀실/S-207", hireDate: "2026-03-01" },
  { id: "m-40", name: "이규상", role: "연구원", grade: "연구원", dept: "사업운영팀", phoneOffice: "052-230-0442", phoneMobile: "010-2402-1649", email: "leegyu@uc.ac.kr", room: "운영팀실/S-208", hireDate: "2026-03-01" },
  { id: "m-41", name: "김예지", role: "연구원", grade: "연구원", dept: "울산늘봄누리센터", phoneOffice: "052-230-0454", phoneMobile: "010-9778-1705", email: "limited0517@uc.ac.kr", room: "연구원실/N-104", hireDate: "2026-03-01" },
  { id: "m-42", name: "최주명", role: "연구원", grade: "연구원", dept: "울산늘봄누리센터", phoneOffice: "052-230-0419", phoneMobile: "010-9385-5959", email: "jmchoi@uc.ac.kr", room: "연구원실/N-105", hireDate: "2026-03-01" }
];

// LaTeX 수식 파서 및 HTML 렌더러 컴포넌트
const RenderLatexFormula = ({ formula }) => {
  if (!formula) return null;
  if (!formula.includes("\\frac")) {
    return <span style={{ fontSize: "0.85rem", color: "var(--text-secondary-dark)" }}>{formula}</span>;
  }

  const terms = formula.split("+");

  return (
    <div style={{
      display: "inline-flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      color: "var(--text-primary)",
      fontSize: "0.85rem",
      background: "rgba(255,255,255,0.01)",
      padding: "0.6rem 0.8rem",
      borderRadius: "0.4rem",
      border: "1px solid var(--border-color-dark)",
      width: "100%",
      boxSizing: "border-box"
    }}>
      {terms.map((termStr, index) => {
        const trimmed = termStr.trim();
        const fracRegex = /\\frac\{\\text\{([^}]+)\}\}\{\\text\{([^}]+)\}\}(?:\s*\\times\s*([\d.]+))?/;
        const match = trimmed.match(fracRegex);

        if (match) {
          const num = match[1];
          const den = match[2];
          const weight = match[3];

          return (
            <React.Fragment key={index}>
              {index > 0 && <span style={{ margin: "0 0.1rem", fontWeight: "700", color: "var(--text-secondary-dark)" }}>+</span>}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", minWidth: "65px" }}>
                  <span style={{ borderBottom: "1px solid var(--text-secondary)", paddingBottom: "2px", width: "100%", textAlign: "center", fontSize: "0.75rem", fontWeight: "600" }}>{num}</span>
                  <span style={{ paddingTop: "2px", width: "100%", textAlign: "center", fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>{den}</span>
                </div>
                {weight && (
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--accent-color)" }}>
                    × {weight}
                  </span>
                )}
              </div>
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={index}>
            {index > 0 && <span style={{ margin: "0 0.1rem", fontWeight: "700", color: "var(--text-secondary-dark)" }}>+</span>}
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>{trimmed}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// 백만원 단위 포맷팅 헬퍼 함수 (소수점 첫째자리까지 표현)
const formatToMillionWon = (value) => {
  if (value === undefined || value === null || isNaN(value)) return "0.0";
  return (value / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

// 5개년 연쇄 잔액 이월(Carry Over) 계산 함수
function recalculateCarryOver(years) {
  if (!years) return;

  // 1차년도 잔액 -> 2차년도 이월
  if (years[1] && years[2]) {
    const balanceY1 = Math.max(0, ((years[1].budget_main || 0) + (years[1].budget_carry || 0)) - ((years[1].spent_main || 0) + (years[1].spent_carry || 0)));
    years[2].budget_carry = balanceY1;
  }

  // 2차년도 잔액 -> 3차년도 이월
  if (years[2] && years[3]) {
    const balanceY2 = Math.max(0, ((years[2].budget_main || 0) + (years[2].budget_carry || 0)) - ((years[2].spent_main || 0) + (years[2].spent_carry || 0)));
    years[3].budget_carry = balanceY2;
  }

  // 3차년도 잔액 -> 4차년도 이월
  if (years[3] && years[4]) {
    const balanceY3 = Math.max(0, ((years[3].budget_main || 0) + (years[3].budget_carry || 0)) - ((years[3].spent_main || 0) + (years[3].spent_carry || 0)));
    years[4].budget_carry = balanceY3;
  }

  // 4차년도 잔액 -> 5차년도 이월
  if (years[4] && years[5]) {
    const balanceY4 = Math.max(0, ((years[4].budget_main || 0) + (years[4].budget_carry || 0)) - ((years[4].spent_main || 0) + (years[4].spent_carry || 0)));
    years[5].budget_carry = balanceY4;
  }
}

// 다년도 예산/집행 구조 동적 변환기 (1~5차년도)
function formatDataToMultiYear(data) {
  return data.map((p) => {
    const newUnits = p.units.map((u) => {
      // 1. 단위과제 예산 다년도 맵핑
      const unitYears = {};
      [1, 2, 3, 4, 5].forEach((yr) => {
        if (yr === 2) {
          unitYears[yr] = {
            budget_main: u.budget_2026 || 0,
            spent_main: u.spent_2026 || 0,
            budget_carry: u.budget_2025_carry || 0,
            spent_carry: u.spent_2025_carry || 0
          };
        } else if (yr === 1) {
          // 1차년도 실제 예산 데이터가 Y1_UNIT_META에 정의되어 있다면 이를 우선 사용하고, 없다면 0.9배 및 역산 공식 적용
          const meta = Y1_UNIT_META[u.id];
          let budgetMain, spentMain;
          if (meta) {
            budgetMain = meta.budget;
            spentMain = meta.budget - meta.carry; // 예산에서 이월 잔액(carry)을 차감하여 집행액 역산
          } else {
            budgetMain = Math.round((u.budget_2026 || 0) * 0.9);
            spentMain = Math.max(0, budgetMain - (u.budget_2025_carry || 0));
          }
          unitYears[yr] = {
            budget_main: budgetMain,
            spent_main: spentMain,
            budget_carry: 0,
            spent_carry: 0
          };
        } else {
          const factor = yr === 3 ? 1.1 : yr === 4 ? 1.2 : 1.3;
          unitYears[yr] = {
            budget_main: Math.round((u.budget_2026 || 0) * factor),
            spent_main: 0,
            budget_carry: 0,
            spent_carry: 0
          };
        }
      });
      // 1차년도부터 5차년도까지 이월예산 연쇄 반영
      recalculateCarryOver(unitYears);

      // 2. 세부 프로그램 다년도 맵핑
      // 1차년도용 프로그램 목록 생성
      const y1ProgList = YEAR_1_PROGRAMS[u.id] || [];
      const y1Progs = y1ProgList.map((item) => {
        const meta = Y1_UNIT_META[u.id] || { budget: 1, national: 1, city: 0, carry: 0 };
        const nationalRatio = meta.national / meta.budget;
        const spentRatio = (meta.budget - meta.carry) / meta.budget;
        
        const budgetMain = item.budget;
        const spentMain = item.spent !== undefined ? item.spent : Math.round(item.budget * spentRatio);
        
        const budget_national = Math.round(budgetMain * nationalRatio);
        const budget_city = budgetMain - budget_national;
        
        const spent_national = Math.round(spentMain * nationalRatio);
        const spent_city = spentMain - spent_national;
        
        const progYears = {
          1: {
            budget_main: budgetMain,
            spent_main: spentMain,
            budget_carry: 0,
            spent_carry: 0,
            
            budget_national,
            spent_national,
            budget_city,
            spent_city,
            budget_external: 0,
            spent_external: 0,
            
            budget_carry_national: 0,
            spent_carry_national: 0,
            budget_carry_city: 0,
            spent_carry_city: 0,
            budget_carry_external: 0,
            spent_carry_external: 0,
            budget_categories: item.budget_categories || []
          }
        };
        
        return {
          id: item.id,
          title: item.title,
          assignee: item.assignee || "미지정",
          pdca: item.pdca || { p: "완료", d: "완료", c: "완료", a: "완료" },
          years: progYears,
          timeline: item.timeline || "",
          targetAudience: item.targetAudience || "",
          coopDept: item.coopDept || "",
          evalType: "우수",
          excellent: "",
          improvePlan: "",
          deficiency: "",
          actionItem: ""
        };
      });

      // 2~5차년도용 프로그램 다년도 매핑 (1차년도는 제외)
      const y2Progs = u.programs.map((prog) => {
        const progYears = {};
        [2, 3, 4, 5].forEach((yr) => {
          let budgetMain = 0;
          let spentMain = 0;
          let budgetCarry = 0;
          let spentCarry = 0;

          if (yr === 2) {
            budgetMain = prog.budget_2026 || 0;
            spentMain = prog.spent_2026 || 0;
            budgetCarry = prog.budget_2025_carry || 0;
            spentCarry = prog.spent_2025_carry || 0;
          } else {
            const factor = yr === 3 ? 1.1 : yr === 4 ? 1.2 : 1.3;
            budgetMain = Math.round((prog.budget_2026 || 0) * factor);
            spentMain = 0;
            budgetCarry = 0;
            spentCarry = 0;
          }

          const isExternalSub = prog.id.endsWith("-2") || prog.id.includes("위탁") || prog.title.includes("위탁") || prog.title.includes("협력");
          
          let budget_national = 0;
          let budget_city = 0;
          let budget_external = 0;

          if (isExternalSub) {
            budget_external = budgetMain;
          } else {
            budget_national = Math.round(budgetMain * 0.5);
            budget_city = budgetMain - budget_national;
          }

          let spent_national = 0;
          let spent_city = 0;
          let spent_external = 0;
          if (spentMain > 0) {
            if (isExternalSub) {
              spent_external = spentMain;
            } else {
              spent_national = Math.round(spentMain * 0.5);
              spent_city = spentMain - spent_national;
            }
          }

          let carry_national = 0;
          let carry_city = 0;
          let carry_external = 0;
          if (budgetCarry > 0) {
            if (isExternalSub) {
              carry_external = budgetCarry;
            } else {
              carry_national = Math.round(budgetCarry * 0.5);
              carry_city = budgetCarry - carry_national;
            }
          }

          let carry_spent_national = 0;
          let carry_spent_city = 0;
          let carry_spent_external = 0;
          if (spentCarry > 0) {
            if (isExternalSub) {
              carry_spent_external = spentCarry;
            } else {
              carry_spent_national = Math.round(spentCarry * 0.5);
              carry_spent_city = spentCarry - carry_spent_national;
            }
          }

          progYears[yr] = {
            budget_main: budgetMain,
            spent_main: spentMain,
            budget_carry: budgetCarry,
            spent_carry: spentCarry,

            budget_national,
            spent_national,
            budget_city,
            spent_city,
            budget_external,
            spent_external,

            budget_carry_national: carry_national,
            spent_carry_national: carry_spent_national,
            budget_carry_city: carry_city,
            spent_carry_city: carry_spent_city,
            budget_carry_external: carry_external,
            spent_carry_external: carry_spent_external
          };
        });

        recalculateCarryOver(progYears);

        [2, 3, 4, 5].forEach((yr) => {
          const py = progYears[yr];
          const isExternalSub = prog.id.endsWith("-2") || prog.id.includes("위탁") || prog.title.includes("위탁") || prog.title.includes("협력");
          if (isExternalSub) {
            py.budget_carry_external = py.budget_carry || 0;
            py.budget_carry_national = 0;
            py.budget_carry_city = 0;
          } else {
            py.budget_carry_national = Math.round((py.budget_carry || 0) * 0.5);
            py.budget_carry_city = (py.budget_carry || 0) - py.budget_carry_national;
            py.budget_carry_external = 0;
          }
        });

        return {
          ...prog,
          years: progYears,
          timeline: prog.timeline || "",
          targetAudience: prog.targetAudience || "",
          coopDept: prog.coopDept || "",
          evalType: prog.evalType || "우수",
          excellent: prog.excellent || "",
          improvePlan: prog.improvePlan || "",
          deficiency: prog.deficiency || "",
          actionItem: prog.actionItem || ""
        };
      });

      const newPrograms = [...y1Progs, ...y2Progs];

      // 3. 비목별 예산 다년도 맵핑
      const newBudgetDetails = {};
      Object.keys(u.budgetDetails || {}).forEach((key) => {
        const b = u.budgetDetails[key];
        
        // [비정상 오버플로우 정화] 100억 원 초과 시 오기입 및 오계산 복구 (장학금 복원)
        if (b.budget_2026 > 10000000000) {
          b.budget_2026 = Math.round(b.budget_2026 / 1000);
        }
        if (b.budget_2025_carry > 10000000000) {
          b.budget_2025_carry = Math.round(b.budget_2025_carry / 1000);
        }
        if (b.spent_2026 > 10000000000) {
          b.spent_2026 = Math.round(b.spent_2026 / 1000);
        }
        if (b.spent_2025_carry > 10000000000) {
          b.spent_2025_carry = Math.round(b.spent_2025_carry / 1000);
        }

        const detailYears = {};
        [1, 2, 3, 4, 5].forEach((yr) => {
          if (yr === 2) {
            detailYears[yr] = {
              budget_main: b.budget_2026 || 0,
              spent_main: b.spent_2026 || 0,
              budget_carry: b.budget_2025_carry || 0,
              spent_carry: b.spent_2025_carry || 0
            };
          } else if (yr === 1) {
            const budgetMain = Math.round((b.budget_2026 || 0) * 0.9);
            const spentMain = Math.max(0, budgetMain - (b.budget_2025_carry || 0));
            detailYears[yr] = {
              budget_main: budgetMain,
              spent_main: spentMain,
              budget_carry: 0,
              spent_carry: 0
            };
          } else {
            const factor = yr === 3 ? 1.1 : yr === 4 ? 1.2 : 1.3;
            detailYears[yr] = {
              budget_main: Math.round((b.budget_2026 || 0) * factor),
              spent_main: 0,
              budget_carry: 0,
              spent_carry: 0
            };
          }
        });
        recalculateCarryOver(detailYears);
        newBudgetDetails[key] = {
          years: detailYears
        };
      });

      // 3.5. 세부 프로그램(newPrograms)의 비목별 배정 계획을 단위과제 10대 비목(newBudgetDetails)에 쪼개서 강제 롤업 연동
      [1, 2, 3, 4, 5].forEach((yr) => {
        const categorySums = {
          "인건비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "장학금": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "교육∙연구 프로그램 개발∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "교육∙연구 환경개선비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "실험∙실습장비 및 기자재 구입∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "지역 연계∙협업 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "기업 지원∙협력 활동비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "성과 활용∙확산 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "그 밖의 사업운영경비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "간접비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }
        };

        newPrograms.forEach((prog) => {
          const py = prog.years?.[yr] || {};
          const progTotalMain = py.budget_main || 0;
          const progTotalCarry = py.budget_carry || 0;
          const progTotalSpent = py.spent_main || 0;
          const progTotalSpentCarry = py.spent_carry || 0;

          let allocatedMain = 0;
          let allocatedCarry = 0;
          let allocatedSpent = 0;
          let allocatedSpentCarry = 0;

          if (py.budget_categories && Array.isArray(py.budget_categories)) {
            py.budget_categories.forEach((catItem) => {
              const catName = catItem.category;
              if (catName && categorySums[catName] && catName !== "교육∙연구 프로그램 개발∙운영비") {
                const mainVal = parseInt(String(catItem.budget || "0").replace(/,/g, ""), 10) || 0;
                const carryVal = parseInt(String(catItem.budget_carry || "0").replace(/,/g, ""), 10) || 0;
                const spentVal = Math.round(catItem.spent || 0);
                const spentCarryVal = Math.round(catItem.spent_carry || 0);

                categorySums[catName].main += mainVal;
                categorySums[catName].carry += carryVal;
                categorySums[catName].spent_main += spentVal;
                categorySums[catName].spent_carry += spentCarryVal;

                allocatedMain += mainVal;
                allocatedCarry += carryVal;
                allocatedSpent += spentVal;
                allocatedSpentCarry += spentCarryVal;
              }
            });
          }

          const remainMain = Math.max(0, progTotalMain - allocatedMain);
          const remainCarry = Math.max(0, progTotalCarry - allocatedCarry);
          const remainSpent = Math.max(0, progTotalSpent - allocatedSpent);
          const remainSpentCarry = Math.max(0, progTotalSpentCarry - allocatedSpentCarry);

          categorySums["교육∙연구 프로그램 개발∙운영비"].main += remainMain;
          categorySums["교육∙연구 프로그램 개발∙운영비"].carry += remainCarry;
          categorySums["교육∙연구 프로그램 개발∙운영비"].spent_main += remainSpent;
          categorySums["교육∙연구 프로그램 개발∙운영비"].spent_carry += remainSpentCarry;
        });

        // 결과 주입
        Object.keys(categorySums).forEach((catName) => {
          if (!newBudgetDetails[catName]) {
            newBudgetDetails[catName] = { years: {} };
          }
          if (!newBudgetDetails[catName].years[yr]) {
            newBudgetDetails[catName].years[yr] = {
              budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0
            };
          }
          const tgt = newBudgetDetails[catName].years[yr];
          tgt.budget_main = categorySums[catName].main;
          tgt.budget_carry = categorySums[catName].carry;
          tgt.spent_main = categorySums[catName].spent_main;
          tgt.spent_carry = categorySums[catName].spent_carry;
        });
      });

      // 모든 비목의 이월 잔액 5개년 연쇄 재계산
      Object.keys(newBudgetDetails).forEach((key) => {
        recalculateCarryOver(newBudgetDetails[key].years);
      });

      // 3.6. 롤업된 데이터를 바탕으로 단위과제 전체 연도별(unitYears) 총예산/총집행액 누적합 재집계
      [1, 2, 3, 4, 5].forEach((yr) => {
        unitYears[yr] = {
          budget_main: Object.values(newBudgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_main || 0), 0),
          budget_carry: Object.values(newBudgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_carry || 0), 0),
          spent_main: Object.values(newBudgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_main || 0), 0),
          spent_carry: Object.values(newBudgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_carry || 0), 0)
        };
      });
      recalculateCarryOver(unitYears);

      return {
        ...u,
        years: unitYears,
        programs: newPrograms,
        budgetDetails: newBudgetDetails
      };
    });

    return {
      ...p,
      units: newUnits
    };
  });
}

const getNormalizedKpi = (k, selectedYear) => {
  if (!k) return null;
  if (selectedYear !== 1) return k;

  if (k.id === "L-1") {
    return {
      ...k,
      description: "주류 및 신산업 연계 주문식 교육과정 개발 건수 및 강의 만족도 조사 지표",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 40 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 20 + \\frac{\\text{D 실적}}{\\text{D 기준}} \\times 10",
      subItems: [
        {
          id: "L-1-1",
          name: "지역 맞춤형 교과·비교과 프로그램 개편 건수",
          base: 28,
          unit: "건",
          years: { 1: { target: 28, current: 35 } }
        },
        {
          id: "L-1-2",
          name: "지역 맞춤형 교과·비교과 프로그램 이수 학생 수",
          base: 3500,
          unit: "명",
          years: { 1: { target: 4000, current: 3726 } }
        },
        {
          id: "L-1-3",
          name: "졸업자의 지역 내 취업자 수",
          base: 624,
          unit: "명",
          years: { 1: { target: 624, current: 624 } }
        },
        {
          id: "L-1-4",
          name: "졸업자의 지역 외 취업자 수",
          base: 527,
          unit: "명",
          years: { 1: { target: 527, current: 527 } }
        }
      ]
    };
  }

  if (k.id === "L-2") {
    return {
      ...k,
      description: "이차전지/조선 등 울산 핵심 분야 산업체 현장실습 이수 학생 수 및 만족도",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 30 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 20 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 10 + \\frac{\\text{D 실적}}{\\text{D 기준}} \\times 10 + \\frac{\\text{E 실적}}{\\text{E 기준}} \\times 30",
      subItems: [
        {
          id: "L-2-1",
          name: "12주 이상으로 운영된 표준 현장실습 학기제 이수학생 수",
          base: 74,
          unit: "명",
          years: { 1: { target: 74, current: 66 } }
        },
        {
          id: "L-2-2",
          name: "8주이상 12주미만으로 운영된 표준 현장실습 학기제 이수학생 수",
          base: 27,
          unit: "명",
          years: { 1: { target: 27, current: 26 } }
        },
        {
          id: "L-2-3",
          name: "4주 이상 8주 미만으로 운영된 표준 현장실습 학기제 이수학생 수",
          base: 103,
          unit: "명",
          years: { 1: { target: 103, current: 63 } }
        },
        {
          id: "L-2-4",
          name: "4주 이상으로 운영된 일반 현장실습 이수학생 수",
          base: 16,
          unit: "명",
          years: { 1: { target: 20, current: 1005 } }
        },
        {
          id: "L-2-5",
          name: "4주 이상 글로벌 표준 현장실습 학기제 이수학생 수",
          base: 4,
          unit: "명",
          years: { 1: { target: 4, current: 1 } }
        }
      ]
    };
  }

  if (k.id === "L-3") {
    return {
      ...k,
      description: "창업 강좌 개설 건수 및 창업 강좌 이수 학생 수 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        {
          id: "L-3-1",
          name: "창업교육 운영성과지수",
          base: 132,
          unit: "건",
          years: { 1: { target: 132, current: 143 } }
        },
        {
          id: "L-3-2",
          name: "창업교육과정 이수학생 수",
          base: 2300,
          unit: "명",
          years: { 1: { target: 2300, current: 3580 } }
        }
      ]
    };
  }

  if (k.id === "L-4") {
    return {
      ...k,
      description: "학생 및 교원의 창업 프로그램 참가 지원 및 실질 창업 활성화 수준 평가 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 40 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 10",
      subItems: [
        {
          id: "L-4-1",
          name: "창업지원 프로그램 지원(운영)건수",
          base: 22,
          unit: "건",
          years: { 1: { target: 22, current: 32 } }
        },
        {
          id: "L-4-2",
          name: "학생·교원 창업기업 수",
          base: 1,
          unit: "개사",
          years: { 1: { target: 1, current: 1 } }
        },
        {
          id: "L-4-3",
          name: "학생·교원 창업 매출액",
          base: 0,
          unit: "백만원",
          years: { 1: { target: 0, current: 0 } }
        }
      ]
    };
  }

  if (k.id === "L-5") {
    return {
      ...k,
      description: "산학공동 연구개발 성과의 기업 기술이전 계약 건수 및 로열티(기술료) 창출 실적 평가 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 25 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 25 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 10 + \\frac{\\text{D 실적}}{\\text{D 기준}} \\times 30 + \\frac{\\text{E 실적}}{\\text{E 기준}} \\times 10",
      subItems: [
        { id: "L-5-1", name: "산학연계 기술이전 건수", base: 1, unit: "건", years: { 1: { target: 0, current: 0 } } },
        { id: "L-5-2", name: "산학연계 기술이전 수익", base: 500, unit: "원", years: { 1: { target: 0, current: 0 } } },
        { id: "L-5-3", name: "산학연계 기술사업화 지원 건수", base: 6, unit: "건", years: { 1: { target: 0, current: 0 } } },
        { id: "L-5-4", name: "지식재산권 건수", base: 10, unit: "건", years: { 1: { target: 10, current: 21 } } },
        { id: "L-5-5", name: "논문 게재 수", base: 33, unit: "편", years: { 1: { target: 33, current: 62 } } }
      ]
    };
  }

  if (k.id === "L-6") {
    return {
      ...k,
      description: "대학 인프라 및 교수진을 매칭한 중소·중견기업 대상 기업애로 기술 지원 및 비즈니스 컨설팅 지원 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 70 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30",
      subItems: [
        { id: "L-6-1", name: "기업애로 해결 기술 지원 수", base: 21, unit: "건", years: { 1: { target: 21, current: 22 } } },
        { id: "L-6-2", name: "기업애로 해결 컨설팅 지원 건수", base: 3, unit: "건", years: { 1: { target: 3, current: 3 } } }
      ]
    };
  }

  if (k.id === "L-7") {
    return {
      ...k,
      description: "성인학습자 친화형 교육환경 구축 및 평생·직업교육 과정 활성화를 통한 평생학습 기회 보장 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 70 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30",
      subItems: [
        { id: "L-7-1", name: "평생·직업교육 프로그램 이수자 수", base: 100, unit: "명", years: { 1: { target: 110, current: 375 } } },
        { id: "L-7-2", name: "재학생 중 성인 학습자 수", base: 50, unit: "명", years: { 1: { target: 50, current: 98 } } }
      ]
    };
  }

  if (k.id === "L-8") {
    return {
      ...k,
      description: "평생·직업교육 품질 신뢰도 향상을 위한 교육과정 신개발 및 참여자의 취·창업 지원 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 30 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 40 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 40",
      subItems: [
        { id: "L-8-1", name: "평생·직업교육 프로그램 개발 및 개편 건수", base: 5, unit: "건", years: { 1: { target: 5, current: 10 } } },
        { id: "L-8-2", name: "대학 성인학습자 고등교육 참여자의 유지취업률", base: 10, unit: "%", years: { 1: { target: 10, current: 0 } } },
        { id: "L-8-3", name: "대학 성인학습자 고등교육 참여자의 취·창업률", base: 14, unit: "%", years: { 1: { target: 14, current: 25.9 } } }
      ]
    };
  }

  if (k.id === "L-9") {
    return {
      ...k,
      description: "지역 밀착형 문제 해결을 위한 리빙랩 및 지자체-대학-산업계 지역 현안 공동 대응 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 20",
      subItems: [
        { id: "L-9-1", name: "지역사회 문제를 해결한 프로젝트 건수", base: 7, unit: "건", years: { 1: { target: 7, current: 7 } } },
        { id: "L-9-2", name: "지역사회 문제해결 협의체 운영 건수", base: 5, unit: "명", years: { 1: { target: 5, current: 6 } } },
        { id: "L-9-3", name: "지역사회 문제 해결 프로젝트 참여 기업(기관) 수", base: 6, unit: "명", years: { 1: { target: 6, current: 6 } } }
      ]
    };
  }

  if (k.id === "L-10") {
    return {
      ...k,
      description: "대학 보건·안전·문화 인프라를 활용한 취약계층 돌봄 및 사회공헌 프로그램 활성화 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 70 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30",
      subItems: [
        { id: "L-10-1", name: "대학 특화분야 연계 사회공헌활동 참여 인원", base: 30, unit: "명", years: { 1: { target: 30, current: 34 } } },
        { id: "L-10-2", name: "지역사회 내 행사 봉사활동 참여 인원", base: 100, unit: "명", years: { 1: { target: 100, current: 164 } } }
      ]
    };
  }

  if (k.id === "L-11") {
    return {
      ...k,
      description: "재난 및 산업안전 분야 예방 관련 산학협력 안전기술 지도 및 재난안전 확산 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 40 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 30",
      subItems: [
        { id: "L-11-1", name: "재난 및 산업안전 관련 안전기술 지원 건수 (기준값: 3)", base: 3, unit: "건", years: { 1: { target: 3, current: 3 } } },
        { id: "L-11-2", name: "재난 및 산업안전 관련 연구 및 시스템(S/W, 콘텐츠) 개발 활용 건수 (기준값: 1)", base: 1, unit: "건", years: { 1: { target: 1, current: 1 } } },
        { id: "L-11-3", name: "재난 및 산업안전 확산 활동 건수 (기준값: 1)", base: 1, unit: "건", years: { 1: { target: 1, current: 3 } } }
      ]
    };
  }

  if (k.id === "L-12") {
    return {
      ...k,
      name: "재난 및 산업안전 교육성과 종합지수",
      description: "지역 밀착형 재난안전 교육프로그램 신규 개발 및 전문 교육 이수, 관련 자격 취득 활성화 종합 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 20 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 40 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 20 + \\frac{\\text{D 실적}}{\\text{D 기준}} \\times 20",
      subItems: [
        { id: "L-12-1", name: "재난 및 산업안전 관련 교육프로그램 개편건수 (기준값: 1)", base: 1, unit: "건", years: { 1: { target: 1, current: 1 } } },
        { id: "L-12-2", name: "재난 및 산업안전 관련 교육프로그램 이수자수 (기준값: 150)", base: 150, unit: "명", years: { 1: { target: 150, current: 168 } } },
        { id: "L-12-3", name: "재난 및 산업안전 관련 교육프로그램 이수자 자격증 취득건수 (기준값: 25)", base: 25, unit: "건", years: { 1: { target: 25, current: 31 } } },
        { id: "L-12-4", name: "재난 및 산업안전 관련 교육프로그램 산업현장 적용 기업수 (기준값: 4)", base: 4, unit: "개", years: { 1: { target: 5, current: 5 } } }
      ]
    };
  }

  if (k.id === "L-13") {
    return {
      ...k,
      description: "스마트 제조 및 미래 신산업 전환을 대비한 지역 산업 연계 AI·DX 핵심 인재 양성 교육프로그램 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 30 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 70",
      subItems: [
        { id: "L-13-1", name: "AI·DX 관련 교육프로그램 개발 건수", base: 5, unit: "건", years: { 1: { target: 5, current: 4 } } },
        { id: "L-13-2", name: "AI·DX 관련 교육프로그램 이수자 수", base: 300, unit: "명", years: { 1: { target: 300, current: 360 } } }
      ]
    };
  }

  if (k.id === "L-14") {
    return {
      ...k,
      name: "AI·DX 기술혁신 확산지수",
      description: "중소·중견 제조기업의 스마트화 지원을 위한 AI·DX 연계 밀착형 기술지도 및 융합컨설팅 지원 확산지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        { id: "L-14-1", name: "AI·DX 관련 기술지원 건수", base: 3, unit: "건", years: { 1: { target: 3, current: 3 } } },
        { id: "L-14-2", name: "AI·DX 관련 자문·컨설팅 건수", base: 5, unit: "건", years: { 1: { target: 5, current: 17 } } }
      ]
    };
  }

  if (k.id === "L-15") {
    return {
      ...k,
      description: "탄소중립 및 친환경 ESG 핵심 가치 확산을 위한 전공·비전공 학생 대상 ESG 전문 인력 육성 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 70 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30",
      subItems: [
        { id: "L-15-1", name: "ESG 전문인력 양성프로그램 이수자 수", base: 100, unit: "명", years: { 1: { target: 100, current: 146 } } },
        { id: "L-15-2", name: "ESG 경영개선 지원 건수", base: 1, unit: "건", years: { 1: { target: 1, current: 1 } } }
      ]
    };
  }

  if (k.id === "L-16") {
    return {
      ...k,
      description: "지역 중소기업의 저탄소 공정 전환 지원 및 친환경 탄소중립 실천 문화 정착 기여 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 70 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30",
      subItems: [
        { id: "L-16-1", name: "탄소중립 프로그램 운영 건수", base: 3, unit: "건", years: { 1: { target: 3, current: 4 } } },
        { id: "L-16-2", name: "탄소배출 경영개선 지원 건수", base: 1, unit: "건", years: { 1: { target: 1, current: 1 } } }
      ]
    };
  }

  if (k.id === "L-17") {
    return {
      ...k,
      description: "지역 보건·의료 분야 정주 인력 확보를 위한 전공 학생 대상 전문 취업 역량 및 지역 정착 지원지수",
      formula: "1차년도 미개설 지표 (0%)",
      subItems: []
    };
  }

  if (k.id === "L-18") {
    return {
      ...k,
      description: "취약계층의 만성질환 예방 및 만성병 환자의 체계적 자가 관리를 돕는 디지털 모니터링 수혜지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        { id: "L-18-1", name: "사회적약자 의료케어를 위한 전문인력 양성 인원 수", base: 110, unit: "명", years: { 1: { target: 110, current: 208 } } },
        { id: "L-18-2", name: "사회적약자 건강모니터링 지원 인원 수", base: 70, unit: "명", years: { 1: { target: 70, current: 87 } } }
      ]
    };
  }

  if (k.id === "L-19") {
    return {
      ...k,
      name: "늘봄학교 및 온동네 돌봄 교사 양성 프로그램 운영성과 지수",
      description: "울산형 온동네 초등 돌봄 교사 및 방과후 프로그램 연수를 통한 아동 돌봄 전문 인력 공급 양성 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        { id: "L-19-1", name: "늘봄/방과후 교사 양성 프로그램 수", base: 5, unit: "건", years: { 1: { target: 5, current: 11 } } },
        { id: "L-19-2", name: "늘봄/방과후 교사 양성 수", base: 100, unit: "명", years: { 1: { target: 100, current: 134 } } }
      ]
    };
  }

  if (k.id === "L-20") {
    return {
      ...k,
      name: "돌봄 및 체험 프로그램 운영 활성화 지수",
      description: "지역 영유아 및 초등학생을 위한 창의 융합 체험 프로그램 다각화 및 이용 수혜 실적 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        { id: "L-20-1", name: "돌봄 및 체험 프로그램 수", base: 10, unit: "건", years: { 1: { target: 10, current: 14 } } },
        { id: "L-20-2", name: "돌봄 및 체험 프로그램 이용자 수", base: 40, unit: "명", years: { 1: { target: 40, current: 69 } } }
      ]
    };
  }

  if (k.id === "L-21") {
    return {
      ...k,
      description: "도시 쇠퇴지역 공간 혁신 및 청년 창작 생태계 기반 조성을 위한 공간 재생 및 거버넌스 구축 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        { id: "L-21-1", name: "도시공간 재생프로젝트 운영 건수", base: 2, unit: "건", years: { 1: { target: 2, current: 2 } } },
        { id: "L-21-2", name: "도시공간 재생프로젝트 네트워크 건수", base: 3, unit: "건", years: { 1: { target: 3, current: 3 } } }
      ]
    };
  }

  if (k.id === "L-22") {
    return {
      ...k,
      description: "지역 고유 문화 자원 기반 청년 창작 콘텐츠 신규 개발 및 축제 활성화를 통한 관내 수혜 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        { id: "L-22-1", name: "문화 콘텐츠 개발 건수", base: 1, unit: "건", years: { 1: { target: 1, current: 2 } } },
        { id: "L-22-2", name: "문화 콘텐츠 개발 프로젝트 참여 인원", base: 40, unit: "명", years: { 1: { target: 40, current: 60 } } }
      ]
    };
  }

  if (k.id === "L-23") {
    return {
      ...k,
      description: "대학의 글로벌 학술 평판 제고 및 국제 공동 연구·교류 활성화를 통한 해외 우수 기관과의 파트너십 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 20 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 50",
      subItems: [
        { id: "L-23-1", name: "국제공동 연구 건수", base: 0, unit: "건", years: { 1: { target: 0, current: 0 } } },
        { id: "L-23-2", name: "국제공동 협력 건수", base: 3, unit: "건", years: { 1: { target: 3, current: 5 } } },
        { id: "L-23-3", name: "해외교류 프로그램 참여인원 수", base: 53, unit: "명", years: { 1: { target: 53, current: 100 } } }
      ]
    };
  }

  if (k.id === "L-24") {
    return {
      ...k,
      name: "글로벌 인재유치 및 정착 지원지수",
      description: "외국인 유학생 유치 다각화 및 안정적인 주거·학습·취업 전주기 밀착 케어 서비스 활성화 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 60 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 20 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 20",
      subItems: [
        { id: "L-24-1", name: "국제학생 유치 인원수", base: 190, unit: "명", years: { 1: { target: 190, current: 295 } } },
        { id: "L-24-2", name: "국제학생 정착 지원 건수", base: 1, unit: "건", years: { 1: { target: 1, current: 2 } } },
        { id: "L-24-3", name: "외국인 근로자 정착 지원 건수", base: 1, unit: "건", years: { 1: { target: 1, current: 0 } } }
      ]
    };
  }

  return k;
};

export default function App() {
  // [이전 캐시 자동 청소 로직]
  // 구버전 캐시(v1~v19 등)가 쌓여 QuotaExceededError(용량 초과)를 내는 현상을 원천 방지하기 위해 v20 이외의 옛날 데이터를 즉시 제거합니다.
  useEffect(() => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("anchor_projects_data_") && key !== "anchor_projects_data_v20") {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn("구버전 캐시 청소 실패:", e);
    }
  }, []);

  // [전역 자가 치유 에러 핸들러]
  // 캐시 오염 등으로 렌더링 에러가 날 경우, 화이트스크린 방지를 위해 로컬 세션을 비우고 클린 샌드박스로 자동 복원합니다.
  useEffect(() => {
    const handleGlobalError = (event) => {
      const err = event.error || event.reason;
      if (!err) return;
      
      const errMsg = String(err.message || err);
      
      // 렌더링을 완전히 멈추게 만드는 치명적인 자바스크립트 오류(TypeError, undefined/null 속성 에러 등)만 선별합니다.
      const isCriticalRenderError = 
        errMsg.includes("TypeError") || 
        errMsg.includes("Cannot read properties") || 
        errMsg.includes("undefined") || 
        errMsg.includes("null") ||
        errMsg.includes("is not a function");
        
      if (!isCriticalRenderError) {
        return; // API 요청 실패, CORS, 406 에러 등의 네트워크 지연/차단 오류는 자가치유 리로드를 타지 않고 넘어갑니다.
      }

      console.error("Critical rendering error caught by Self-Healing. Resetting cache:", errMsg);
      const lastReset = localStorage.getItem("anchor_last_self_healing_reset");
      const now = Date.now();
      if (lastReset && now - parseInt(lastReset, 10) < 3000) {
        return;
      }
      localStorage.setItem("anchor_last_self_healing_reset", String(now));
      localStorage.removeItem("anchor_logged_in_user");
      localStorage.removeItem("anchor_projects_data_v22");
      localStorage.removeItem("anchor_selected_kpi");
      window.location.reload();
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleGlobalError);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleGlobalError);
    };
  }, []);

  const [currentUser, setCurrentUser] = useState(null);
  const [projects, setProjects] = useState(() => {
    // D4 1차년도 실제 예산 및 집행 데이터 롤업 정합성 연동을 위해 로컬스토리지 키 버전을 v22로 업그레이드합니다.
    const cached = localStorage.getItem("anchor_projects_data_v22");
    if (cached) {
      try {
        const loaded = JSON.parse(cached);
        const multiYearInitialData = formatDataToMultiYear(initialProjectsData);
        // [자동 동기화] mockData.js의 initialProjectsData로부터 각 과제의 최신 프로그램 목록을 조회하여 캐시 데이터와 머지합니다.
        loaded.forEach((strategy) => {
          strategy.units.forEach((unit) => {
            const sourceUnit = multiYearInitialData
              ?.flatMap(s => s.units)
              ?.find(u => u.id === unit.id);
              
            if (sourceUnit && sourceUnit.programs) {
              const mergedPrograms = sourceUnit.programs.map((sourceProg) => {
                const cachedProg = unit.programs?.find(cp => cp.id === sourceProg.id);
                if (cachedProg) {
                  const updatedYears = { ...cachedProg.years };

                  // 5개년에 대한 예산 및 집행액 정합성 복원 루프
                  [1, 2, 3, 4, 5].forEach((yr) => {
                    if (updatedYears[yr]) {
                      // 소스에 해당 연도가 아예 기획되지 않은 프로그램이라면 캐시 오염을 막기 위해 제거
                      if (!sourceProg.years || !sourceProg.years[yr]) {
                        delete updatedYears[yr];
                        return;
                      }
                      const y = updatedYears[yr];
                      
                      // 1. 입력한 예산(세부 재원: 국고 + 시비 + 외부)이 있는지 확인
                      const inputBudgetSum = (y.budget_national || 0) + (y.budget_city || 0) + (y.budget_external || 0);
                      
                      if (inputBudgetSum > 0) {
                        // 사용자가 세부 재원 예산을 하나라도 입력했다면, 그 합산을 본예산(budget_main)으로 동기화 (입력 예산 우선 원칙)
                        y.budget_main = inputBudgetSum;
                      } else {
                        // 입력된 세부 예산이 없는 경우, 기존 sourceProg를 기준으로 본예산 기본값을 계산
                        let defaultBudgetMain = 0;
                        let defaultNational = 0;
                        let defaultCity = 0;
                        let defaultExternal = 0;
                        
                        let defaultSpentMain = 0;
                        let defaultSpentNational = 0;
                        let defaultSpentCity = 0;
                        let defaultSpentExternal = 0;

                        if (sourceProg.years && sourceProg.years[yr]) {
                          const sy = sourceProg.years[yr];
                          defaultBudgetMain = sy.budget_main || 0;
                          defaultNational = sy.budget_national || 0;
                          defaultCity = sy.budget_city || 0;
                          defaultExternal = sy.budget_external || 0;
                          
                          defaultSpentMain = sy.spent_main || 0;
                          defaultSpentNational = sy.spent_national || 0;
                          defaultSpentCity = sy.spent_city || 0;
                          defaultSpentExternal = sy.spent_external || 0;
                        } else {
                          if (yr === 2) {
                            defaultBudgetMain = sourceProg.budget_2026 || 0;
                          } else if (yr === 1) {
                            defaultBudgetMain = Math.round((sourceProg.budget_2026 || 0) * 0.9);
                          } else {
                            const factor = yr === 3 ? 1.1 : yr === 4 ? 1.2 : 1.3;
                            defaultBudgetMain = Math.round((sourceProg.budget_2026 || 0) * factor);
                          }
                          
                          const isExternalSub = sourceProg.id.endsWith("-2") || sourceProg.id.includes("위탁") || sourceProg.title.includes("위탁") || sourceProg.title.includes("협력");
                          if (isExternalSub) {
                            defaultExternal = defaultBudgetMain;
                          } else {
                            defaultNational = Math.round(defaultBudgetMain * 0.5);
                            defaultCity = defaultBudgetMain - defaultNational;
                          }
                        }
                        
                        y.budget_main = defaultBudgetMain;
                        y.budget_national = defaultNational;
                        y.budget_city = defaultCity;
                        y.budget_external = defaultExternal;
                        
                        y.spent_main = defaultSpentMain;
                        y.spent_national = defaultSpentNational;
                        y.spent_city = defaultSpentCity;
                        y.spent_external = defaultSpentExternal;
                      }

                      // 2. 이월예산도 세부 이월예산(국고 + 시비 + 외부)의 합산으로 동기화 (1차년도는 이월이 없으므로 강제 0원)
                      if (yr === 1) {
                        y.budget_carry_national = 0;
                        y.budget_carry_city = 0;
                        y.budget_carry_external = 0;
                        y.budget_carry = 0;
                      } else {
                        y.budget_carry = (y.budget_carry_national || 0) + (y.budget_carry_city || 0) + (y.budget_carry_external || 0);
                      }

                      // 3. 본집행액도 세부 집행액(국고 + 시비 + 외부)의 합으로 실시간 동기화
                      y.spent_main = (y.spent_national || 0) + (y.spent_city || 0) + (y.spent_external || 0);

                      // 4. 이월집행액도 세부 이월집행액(국고 + 시비 + 외부)의 합으로 동기화 (1차년도는 0원)
                      if (yr === 1) {
                        y.spent_carry_national = 0;
                        y.spent_carry_city = 0;
                        y.spent_carry_external = 0;
                        y.spent_carry = 0;
                      } else {
                        y.spent_carry = (y.spent_carry_national || 0) + (y.spent_carry_city || 0) + (y.spent_carry_external || 0);
                      }

                      // 5. 비목 카테고리 예산 오버플로우 보정 (기존 복원 로직)
                      if (y.budget_categories && Array.isArray(y.budget_categories)) {
                        y.budget_categories.forEach((cat) => {
                          const catBudget = parseInt(String(cat.budget || "0").replace(/,/g, ""), 10) || 0;
                          if (catBudget > 10000000000) {
                            cat.budget = Math.round(catBudget / 1000);
                          }
                          const catCarry = parseInt(String(cat.budget_carry || "0").replace(/,/g, ""), 10) || 0;
                          if (catCarry > 10000000000) {
                            cat.budget_carry = Math.round(catCarry / 1000);
                          }
                          const catSpent = parseInt(String(cat.spent || "0").replace(/,/g, ""), 10) || 0;
                          if (catSpent > 10000000000) {
                            cat.spent = Math.round(catSpent / 1000);
                          }
                          const catSpentCarry = parseInt(String(cat.spent_carry || "0").replace(/,/g, ""), 10) || 0;
                          if (catSpentCarry > 10000000000) {
                            cat.spent_carry = Math.round(catSpentCarry / 1000);
                          }
                        });
                      }
                    }
                  });

                  // 6. 프로그램 최상위 레거시 예산/집행 필드도 2차년도 기준으로 완벽하게 강제 동기화
                  const currentYearBudgetMain = updatedYears[2]?.budget_main || 0;
                  const currentYearBudgetCarry = updatedYears[2]?.budget_carry || 0;
                  const currentYearSpentMain = updatedYears[2]?.spent_main || 0;
                  const currentYearSpentCarry = updatedYears[2]?.spent_carry || 0;

                  return {
                    ...sourceProg,
                    pdca: cachedProg.pdca || sourceProg.pdca,
                    timeline: cachedProg.timeline || sourceProg.timeline,
                    targetAudience: cachedProg.targetAudience || sourceProg.targetAudience,
                    coopDept: cachedProg.coopDept || sourceProg.coopDept,
                    participants: cachedProg.participants !== undefined ? cachedProg.participants : sourceProg.participants,
                    satisfaction: cachedProg.satisfaction !== undefined ? cachedProg.satisfaction : sourceProg.satisfaction,
                    achievements: cachedProg.achievements || sourceProg.achievements,
                    evalType: cachedProg.evalType || sourceProg.evalType,
                    excellent: cachedProg.excellent || sourceProg.excellent,
                    improvePlan: cachedProg.improvePlan || sourceProg.improvePlan,
                    deficiency: cachedProg.deficiency || sourceProg.deficiency,
                    actionItem: cachedProg.actionItem || sourceProg.actionItem,
                    assignee: cachedProg.assignee !== undefined ? cachedProg.assignee : sourceProg.assignee,
                    
                    // 레거시 필드 롤업
                    budget_2026: currentYearBudgetMain,
                    budget_2025_carry: currentYearBudgetCarry,
                    budget: currentYearBudgetMain + currentYearBudgetCarry,
                    spent_2026: currentYearSpentMain,
                    spent_2025_carry: currentYearSpentCarry,
                    spent: currentYearSpentMain + currentYearSpentCarry,
                    years: updatedYears
                  };
                }
                return sourceProg;
              });
              unit.programs = mergedPrograms;
              unit.kpis = sourceUnit.kpis || []; // [성과 동기화] mockData.js의 1차년도 등 최신 KPI 실적 데이터를 캐시와 강제 동기화
              
              if (unit.id === "A1나" || unit.id === "A1가") {
                unit.budget = sourceUnit.budget;
                unit.spent = sourceUnit.spent;
                unit.budget_2026 = sourceUnit.budget_2026;
                unit.spent_2026 = sourceUnit.spent_2026;
                unit.budget_2025_carry = sourceUnit.budget_2025_carry || 0;
                unit.spent_2025_carry = sourceUnit.spent_2025_carry || 0;
              }
            }
          });
        });
        
        // 캐시 데이터가 존재해도 최신 5개년 프로그램 기획 예산을 단위과제 비목 및 통계로 강제 롤업 싱크
        loaded.forEach((p) => {
          p.units.forEach((u) => {
            if (u.budgetDetails) {
              [1, 2, 3, 4, 5].forEach((yr) => {
                const categorySums = {
                  "인건비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                  "장학금": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                  "교육∙연구 프로그램 개발∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                  "교육∙연구 환경개선비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                  "실험∙실습장비 및 기자재 구입∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                  "지역 연계∙협업 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                  "기업 지원∙협력 활동비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                  "성과 활용∙확산 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                  "그 밖의 사업운영경비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                  "간접비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }
                };

                u.programs.forEach(prog => {
                  const py = prog.years?.[yr] || {};
                  const progTotalMain = py.budget_main || 0;
                  const progTotalCarry = py.budget_carry || 0;
                  const progTotalSpent = py.spent_main || 0;
                  const progTotalSpentCarry = py.spent_carry || 0;

                  let allocatedMain = 0;
                  let allocatedCarry = 0;
                  let allocatedSpent = 0;
                  let allocatedSpentCarry = 0;

                  if (py.budget_categories && Array.isArray(py.budget_categories)) {
                    py.budget_categories.forEach(catItem => {
                      const catName = catItem.category;
                      if (catName && categorySums[catName] && catName !== "교육∙연구 프로그램 개발∙운영비") {
                        const mainVal = parseInt(String(catItem.budget || "0").replace(/,/g, ""), 10) || 0;
                        const carryVal = parseInt(String(catItem.budget_carry || "0").replace(/,/g, ""), 10) || 0;
                        const spentVal = Math.round(catItem.spent || 0);
                        const spentCarryVal = Math.round(catItem.spent_carry || 0);

                        categorySums[catName].main += mainVal;
                        categorySums[catName].carry += carryVal;
                        categorySums[catName].spent_main += spentVal;
                        categorySums[catName].spent_carry += spentCarryVal;

                        allocatedMain += mainVal;
                        allocatedCarry += carryVal;
                        allocatedSpent += spentVal;
                        allocatedSpentCarry += spentCarryVal;
                      }
                    });
                  }

                  const remainMain = Math.max(0, progTotalMain - allocatedMain);
                  const remainCarry = Math.max(0, progTotalCarry - allocatedCarry);
                  const remainSpent = Math.max(0, progTotalSpent - allocatedSpent);
                  const remainSpentCarry = Math.max(0, progTotalSpentCarry - allocatedSpentCarry);

                  categorySums["교육∙연구 프로그램 개발∙운영비"].main += remainMain;
                  categorySums["교육∙연구 프로그램 개발∙운영비"].carry += remainCarry;
                  categorySums["교육∙연구 프로그램 개발∙운영비"].spent_main += remainSpent;
                  categorySums["교육∙연구 프로그램 개발∙운영비"].spent_carry += remainSpentCarry;
                });

                Object.keys(categorySums).forEach(catName => {
                  if (!u.budgetDetails[catName]) {
                    u.budgetDetails[catName] = { years: {} };
                  }
                  if (!u.budgetDetails[catName].years[yr]) {
                    u.budgetDetails[catName].years[yr] = {
                      budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0
                    };
                  }
                  const tgt = u.budgetDetails[catName].years[yr];
                  tgt.budget_main = categorySums[catName].main;
                  tgt.budget_carry = categorySums[catName].carry;
                  tgt.spent_main = categorySums[catName].spent_main;
                  tgt.spent_carry = categorySums[catName].spent_carry;
                });
              });

              Object.keys(u.budgetDetails).forEach(key => {
                recalculateCarryOver(u.budgetDetails[key].years);
              });
            }

            // 단위과제 연도별 전체 집행액/예산 재집계 및 이월 계산
            [1, 2, 3, 4, 5].forEach((yr) => {
              if (!u.years[yr]) u.years[yr] = {};
              u.years[yr].spent_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_main || 0), 0);
              u.years[yr].spent_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_carry || 0), 0);
              u.years[yr].budget_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_main || 0), 0);
              u.years[yr].budget_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_carry || 0), 0);
            });
            recalculateCarryOver(u.years);
          });
        });
        return loaded;
      } catch (e) {
        console.error("Failed to parse cached projects data:", e);
      }
    }
    return formatDataToMultiYear(initialProjectsData);
  });
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("anchor_active_tab") || "dashboard";
  });
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    localStorage.setItem("anchor_active_tab", activeTab);
  }, [activeTab]);

  // 사업단 구성원 관리 및 서브탭 상태
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem("anchor_members");
    const initialList = INITIAL_MEMBERS.map((m) => ({
      ...m,
      startDate: m.startDate || m.hireDate || "2026-03-01",
      endDate: m.endDate || "",
      status: m.status || "재직중"
    }));

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 로컬스토리지에 홍진숙 교수(cshong@uc.ac.kr)가 존재할 경우 위치를 홍광표 교수(gphong@uc.ac.kr) 바로 다음으로 재정렬 이동
        const hongIdx = parsed.findIndex(m => m.email && m.email.trim().toLowerCase() === "cshong@uc.ac.kr");
        if (hongIdx !== -1) {
          const hongObj = parsed[hongIdx];
          parsed.splice(hongIdx, 1);
          const gphongIdx = parsed.findIndex(m => m.email && m.email.trim().toLowerCase() === "gphong@uc.ac.kr");
          if (gphongIdx !== -1) {
            parsed.splice(gphongIdx + 1, 0, hongObj);
          } else {
            parsed.push(hongObj);
          }
        } else {
          // 존재하지 않을 경우 새로 initialList에서 주입 복구
          const hongObj = initialList.find(m => m.email === "cshong@uc.ac.kr");
          if (hongObj) {
            const gphongIdx = parsed.findIndex(m => m.email && m.email.trim().toLowerCase() === "gphong@uc.ac.kr");
            if (gphongIdx !== -1) {
              parsed.splice(gphongIdx + 1, 0, hongObj);
            } else {
              parsed.push(hongObj);
            }
          }
        }

        // 하위 드롭다운 싱크 불일치 마이그레이션 보장
        return parsed.map((m) => {
          let currentGrade = m.grade || "연구원";
          if (currentGrade === "전임 교수") currentGrade = "정교수";
          if (currentGrade === "행정 부장") currentGrade = "부장";
          return {
            ...m,
            dept: m.dept === "미배정" ? "-" : m.dept,
            grade: currentGrade,
            startDate: m.startDate || m.hireDate || "2026-03-01",
            endDate: m.endDate || "",
            status: m.status || "재직중"
          };
        });
      } catch (e) {
        console.error("Failed to parse saved members:", e);
      }
    }
    return initialList;
  });

  useEffect(() => {
    localStorage.setItem("anchor_members", JSON.stringify(members));
  }, [members]);
  const [assignFilterUnitId, setAssignFilterUnitId] = useState("all");
  const [mgmtSubTab, setMgmtSubTab] = useState("members"); // "members", "programs", "approvals"
  const [projectsSubTab, setProjectsSubTab] = useState("unit_status"); // "unit_status" (단위과제 집행현황) 또는 "program_mgmt" (프로그램 관리)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null); // 추가/수정용 임시 객체

  // 개인정보 관리 (비밀번호 변경) 상태 및 핸들러
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmNewPw, setConfirmNewPw] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmNewPw) {
      alert("모든 필드를 입력해 주세요.");
      return;
    }
    if (newPw !== confirmNewPw) {
      alert("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      const hashedCurrent = CryptoJS.SHA256(currentPw).toString();

      // 1. Supabase에서 현재 사용자의 비밀번호 조회
      const { data: user, error: fetchError } = await supabase
        .from("rise_users")
        .select("pw")
        .eq("id", currentUser.id)
        .single();

      if (fetchError || !user) {
        alert("사용자 정보를 조회할 수 없습니다.");
        return;
      }

      if (user.pw !== hashedCurrent) {
        alert("현재 비밀번호가 일치하지 않습니다.");
        return;
      }

      // 2. 비밀번호 업데이트
      const hashedNew = CryptoJS.SHA256(newPw).toString();
      const { error: updateError } = await supabase
        .from("rise_users")
        .update({ pw: hashedNew })
        .eq("id", currentUser.id);

      if (updateError) {
        alert("비밀번호 변경 처리 중 오류가 발생했습니다.");
        return;
      }

      alert("비밀번호가 성공적으로 변경되었습니다.");
      setIsPasswordModalOpen(false);
      setCurrentPw("");
      setNewPw("");
      setConfirmNewPw("");
    } catch (err) {
      console.error("Password change error:", err);
      alert("비밀번호 변경 중 통신 오류가 발생했습니다.");
    }
  };

  // Supabase 회원현황 목록 상태
  const [registeredUsers, setRegisteredUsers] = useState([]);

  // 회원현황 목록 로드 함수
  const fetchRegisteredUsers = async () => {
    // 1. 기본 데모 계정들 정의
    const demoUsers = [
      { id: "admin", name: "시스템 관리자", role_key: "ADMIN", created_at: "2026-03-01T00:00:00.000Z" },
      { id: "director", name: "송경영", role_key: "DIRECTOR", created_at: "2026-03-01T00:00:00.000Z" },
      { id: "hq_head", name: "김현수", role_key: "HQ_HEAD", created_at: "2026-03-01T00:00:00.000Z" },
      { id: "center_director", name: "이동은", role_key: "CENTER_ECC", created_at: "2026-03-01T00:00:00.000Z" },
      { id: "team_leader", name: "심현미", role_key: "TEAM_LEADER", created_at: "2026-03-01T00:00:00.000Z" },
      { id: "researcher", name: "이은주", role_key: "RESEARCHER", created_at: "2026-03-01T00:00:00.000Z" }
    ];

    try {
      // 2. Supabase DB에서 가입된 회원 로드
      const { data, error } = await supabase
        .from("rise_users")
        .select("id, name, role_key, created_at");
      const dbUsers = data || [];
      const dbMap = new Map(dbUsers.map(u => [u.id.trim().toLowerCase(), u]));

      // 3. 주소록(members)에서 재직중인 멤버들 로드 및 매핑 (이메일 및 임시 비밀번호 매핑 가이드라인 연동)
      const activeMembers = (members || [])
        .filter(m => m.status !== "퇴직" && m.email)
        .map(m => {
          const emailId = m.email.trim().toLowerCase();
          
          // 역할 맵핑 규칙
          let autoRoleKey = "RESEARCHER";
          const mRole = m.role || "";
          const mDept = m.dept || "";
          if (mRole === "사업단장") {
            autoRoleKey = "DIRECTOR";
          } else if (mRole === "본부장") {
            autoRoleKey = "HQ_HEAD";
          } else if (mRole === "운영팀장") {
            autoRoleKey = "TEAM_LEADER";
          } else if (mRole === "센터장") {
            autoRoleKey = mDept === "ECC센터" ? "CENTER_ECC" : "CENTER_SPECIAL";
          }

          // DB에 비밀번호를 직접 변경한 이력이 존재하면 해당 가입일/이름 정보를 우선시함
          // cshong@uc.ac.kr 주소록과 DB 상의 special_head 계정 간의 예외 매핑을 함께 지원합니다.
          const dbUser = dbMap.get(emailId) || 
                         dbMap.get(emailId.split("@")[0]) || 
                         (emailId === "cshong@uc.ac.kr" ? dbMap.get("special_head") : null);
          return {
            id: emailId,
            name: dbUser ? dbUser.name : m.name,
            role_key: dbUser ? dbUser.role_key : autoRoleKey,
            // 주소록(members)에 시작일이 수정 기입되어 있다면 그것을 우선 표출하고, 없으면 DB 생성일 또는 디폴트값을 사용합니다.
            created_at: m.startDate || m.hireDate || (dbUser ? dbUser.created_at : "2026-03-01T00:00:00.000Z")
          };
        });

      // 4. 데모 계정 + 주소록 액티브 계정 + DB 계정 우선순위 병합
      const finalUsersMap = new Map();
      
      // 데모 계정 주입
      demoUsers.forEach(u => finalUsersMap.set(u.id.toLowerCase(), u));
      // 주소록 재직중인 계정 주입
      activeMembers.forEach(u => finalUsersMap.set(u.id.toLowerCase(), u));
      // DB 실제 회원 계정 주입 (최종 우선순위 보장)
      dbUsers.forEach(u => {
        const idLower = u.id.trim().toLowerCase();
        finalUsersMap.set(idLower, u);
      });

      // 직책별 가중치 순서 정의 (0순위 관리자 ~ 5순위 실무 연구원)
      const roleRanks = {
        ADMIN: 0,
        DIRECTOR: 1,
        HQ_HEAD: 2,
        CENTER_ECC: 3,
        CENTER_ICC: 3,
        CENTER_RCC: 3,
        CENTER_AID: 3,
        CENTER_NULBOM: 3,
        CENTER_SPECIAL: 3,
        TEAM_LEADER: 4,
        RESEARCHER: 5
      };

      const sortedUsers = Array.from(finalUsersMap.values()).sort((a, b) => {
        const rankA = roleRanks[a.role_key] !== undefined ? roleRanks[a.role_key] : 99;
        const rankB = roleRanks[b.role_key] !== undefined ? roleRanks[b.role_key] : 99;
        if (rankA !== rankB) {
          return rankA - rankB;
        }
        // 동일한 직급일 경우 ID 알파벳 순 정렬
        return a.id.localeCompare(b.id, 'en');
      });

      setRegisteredUsers(sortedUsers);
    } catch (err) {
      console.error("Fetch registered users error:", err);
      setRegisteredUsers(demoUsers);
    }
  };

  // 회원현황에서 사용자 계정 삭제 실행 함수
  const handleDeleteUser = async (userId) => {
    const demoIds = ["admin", "director", "hq_head", "center_director", "team_leader", "researcher"];
    if (demoIds.includes(userId.toLowerCase())) {
      alert("시스템 기본 데모 계정은 삭제할 수 없습니다.");
      return;
    }

    if (!window.confirm(`정말로 '${userId}' 계정을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("rise_users")
        .delete()
        .eq("id", userId);
      
      if (error) {
        alert("계정 삭제 중 오류가 발생했습니다.");
      } else {
        alert("성공적으로 계정이 삭제되었습니다.");
        fetchRegisteredUsers(); // 목록 새로고침
      }
    } catch (err) {
      console.error("Delete user error:", err);
      alert("삭제 처리 중 예기치 못한 에러가 발생했습니다.");
    }
  };

  // 관리자 탭 활성화 시 또는 주소록(members)이 변경되었을 때 대기 목록 로드 및 갱신
  useEffect(() => {
    if (activeTab === "management" && currentUser && currentUser.role?.rank <= 2) {
      fetchRegisteredUsers();
    }
  }, [activeTab, currentUser, members]);

  // 성과지표 상세 조회용 상태 및 다년도 성과관리 연도 선택 상태
  const [selectedKpi, setSelectedKpi] = useState(() => {
    const saved = localStorage.getItem("anchor_selected_kpi");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const saved = localStorage.getItem("anchor_selected_year");
    return saved ? parseInt(saved, 10) : 2;
  });
  const [kpiSubTab, setKpiSubTab] = useState(() => {
    return localStorage.getItem("anchor_kpi_sub_tab") || "자율";
  });
  const [selectedUnitId, setSelectedUnitId] = useState(() => {
    return localStorage.getItem("anchor_selected_unit_id") || "A1가";
  });
  const [selectedProgId, setSelectedProgId] = useState(() => {
    return localStorage.getItem("anchor_selected_prog_id") || null;
  });

  useEffect(() => {
    if (selectedKpi) {
      localStorage.setItem("anchor_selected_kpi", JSON.stringify(selectedKpi));
    } else {
      localStorage.removeItem("anchor_selected_kpi");
    }
  }, [selectedKpi]);

  useEffect(() => {
    localStorage.setItem("anchor_selected_year", String(selectedYear));
  }, [selectedYear]);

  useEffect(() => {
    localStorage.setItem("anchor_kpi_sub_tab", kpiSubTab);
  }, [kpiSubTab]);

  useEffect(() => {
    localStorage.setItem("anchor_selected_unit_id", selectedUnitId);
  }, [selectedUnitId]);

  useEffect(() => {
    if (selectedProgId) {
      localStorage.setItem("anchor_selected_prog_id", selectedProgId);
    } else {
      localStorage.removeItem("anchor_selected_prog_id");
    }
  }, [selectedProgId]);
  const [pdcaViewMode, setPdcaViewMode] = useState("unit");

  // 1차년도용 단위과제 필터링 및 이름/ID 변환
  const getNormalizedProjectsForRendering = (rawProjects, yr) => {
    if (!rawProjects) return [];
    
    const cloned = JSON.parse(JSON.stringify(rawProjects));
    
    if (yr !== 1) {
      // 2~5차년도에는 해당 연도의 프로그램만 필터링
      return cloned.map(p => {
        const newUnits = p.units.map(u => {
          return {
            ...u,
            programs: u.programs.filter(prog => prog.years && prog.years[yr])
          };
        });
        return { ...p, units: newUnits };
      });
    }

    // 1차년도에 A1나 및 공통 E는 필터링 제외
    const mapping = {
      "A1가": { id: "A1", title: "지역과 미래를 만드는 UC-HYPER 전문기술인재 양성" },
      "A2": { id: "A2", title: "지역 창업 생태계 혁신을 위한 글로컬 창업 문화 조성" },
      "A3": { id: "D4", title: "지역산업 연계 글로벌 협력 거점 대학 육성" },
      "B1": { id: "B1", title: "중소·중견기업 맞춤형 기술지원·공동연구 활성화" },
      "B2": { id: "C2", title: "AID 역량강화 기반 지역산업 전환 지원" },
      "B3": { id: "C3", title: "교육·산업·복지가 조화로운 지속가능한 탄소중립" },
      "B4": { id: "C1", title: "복합재난 대응 산업안전·보건 관리시스템 개발" },
      "C1": { id: "B2", title: "U-LIFE 평생직업교육 플랫폼 구축" },
      "C2": { id: "D2", title: "내일을 밝히는 '위드아이' 늘봄 생태계 조성" },
      "D1": { id: "B3", title: "지역을 키우는 지역문제 해결 협력 체계 구축" },
      "D2": { id: "D1", title: "통합형 인재양성 기반 포용적 보건복지서비스 구현" },
      "D3": { id: "D3", title: "에코 컬처로 만드는 꿀잼도시 울산" }
    };

    return cloned.map(p => {
      if (p.id === "E") return null;

      const newUnits = p.units
        .filter(u => u.id !== "A1나")
        .map(u => {
          const mapInfo = mapping[u.id];
          const filteredPrograms = u.programs.filter(prog => prog.years && prog.years[1]);
          if (mapInfo) {
            return {
              ...u,
              id: mapInfo.id,
              title: mapInfo.title,
              programs: filteredPrograms
            };
          }
          return {
            ...u,
            programs: filteredPrograms
          };
        });

      return {
        ...p,
        units: newUnits
      };
    }).filter(Boolean);
  };

  const displayProjects = getNormalizedProjectsForRendering(projects, selectedYear);


  // 로컬스토리지에서 세션 확인 및 테마 설정
  useEffect(() => {
    const sessionUser = localStorage.getItem("anchor_logged_in_user");
    if (sessionUser) {
      try {
        const parsed = JSON.parse(sessionUser);
        if (parsed && parsed.role && typeof parsed.role === "object" && parsed.role.id) {
          setCurrentUser(parsed);
        } else {
          console.warn("Invalid session role structure detected. Clearing session to prevent crash.");
          localStorage.removeItem("anchor_logged_in_user");
          setCurrentUser(null);
        }
      } catch (e) {
        console.error("Failed to parse logged in user session:", e);
        localStorage.removeItem("anchor_logged_in_user");
        setCurrentUser(null);
      }
    }
  }, []);

  // 다크모드 바인딩
  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
    }
  }, [darkMode]);

  // projects 상태 변경 시 localStorage 자동 기입 (새로고침 휘발 방지 우회책)
  useEffect(() => {
    try {
      localStorage.setItem("anchor_projects_data_v22", JSON.stringify(projects));
    } catch (e) {
      const isQuotaError = e.name === "QuotaExceededError" || e.code === 22 || e.number === -2147024882;
      if (isQuotaError) {
        console.warn("로컬 스토리지 공간이 부족합니다. 이전 구버전 캐시를 청소하고 재시도합니다...");
        try {
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("anchor_projects_data_") && key !== "anchor_projects_data_v22") {
              localStorage.removeItem(key);
            }
          });
          localStorage.setItem("anchor_projects_data_v22", JSON.stringify(projects));
          console.log("이전 캐시 청소 및 데이터 재저장 성공");
        } catch (retryError) {
          console.error("이전 캐시 청소 후에도 로컬 스토리지 기입 실패:", retryError);
        }
      } else {
        console.error("로컬 스토리지 기입 중 알 수 없는 예외 발생:", e);
      }
    }
  }, [projects]);

  /* 
   * [성과지표 자동 연계 UX 로직]
   * 사용자가 성과지표 관리('kpis') 탭에 진입하거나, 
   * 성과지표 서브탭('자율' 또는 '중점')을 전환할 때 빈 화면을 보지 않도록 
   * 해당 서브탭 유형에 맞는 첫 번째 성과지표를 자동으로 찾아 상세 조회창(selectedKpi)에 설정합니다.
   */
  useEffect(() => {
    if (activeTab === "kpis") {
      // 모든 단위과제(units)의 성과지표(kpis) 중에서 현재 선택된 서브탭 유형('자율'/'중점')과 일치하는 첫 번째 지표를 검색합니다.
      const firstKpi = projects
        .flatMap((p) => p.units.flatMap((u) => u.kpis || []))
        .find((k) => k ? k.type === kpiSubTab : false);
      
      // 검색된 첫 번째 지표가 있으면 자동으로 조회 대상으로 설정하고, 없으면 null로 초기화합니다.
      setSelectedKpi(firstKpi || null);
    }
  }, [activeTab, kpiSubTab, projects]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem("anchor_logged_in_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("anchor_logged_in_user");
  };

  // 엑셀 업로드로 데이터 실시간 갱신 (본사업비/이월비 구분 갱신 및 다년도 연쇄 이월 반영)
  const handleUpdateData = (excelJson, type) => {
    setProjects((prevProjects) => {
      const updated = JSON.parse(JSON.stringify(prevProjects));

      if (type === "BUDGET") {
        // 프로그램ID별로 행들을 그룹화
        const progRows = {};
        excelJson.forEach(row => {
          const pid = row["프로그램ID"];
          if (pid) {
            if (!progRows[pid]) progRows[pid] = [];
            progRows[pid].push(row);
          }
        });

        // 각 프로그램ID별로 본예산 행과 이월예산 행을 조합하여 롤업 업데이트 실행
        Object.keys(progRows).forEach(progId => {
          const rows = progRows[progId];
          const mainRow = rows.find(r => r["예산구분"] === "본예산") || {};
          const carryRow = rows.find(r => r["예산구분"] === "이월예산") || {};

          updated.forEach((p) => {
            p.units.forEach((u) => {
              u.programs.forEach((prog) => {
                if (prog.id === progId) {
                  const py = prog.years[selectedYear];
                  if (py) {
                    // 1. 재원별 본예산 및 이월예산 원화 단위(* 1,000,000)로 파싱하여 대입
                    const bNational = Math.round((parseFloat(mainRow["국고"]) || 0) * 1000000);
                    const bCity = Math.round((parseFloat(mainRow["지자체시비"]) || 0) * 1000000);
                    const bExternal = Math.round((parseFloat(mainRow["외부사업비"]) || 0) * 1000000);
                    
                    const bCarryNational = selectedYear === 1 ? 0 : Math.round((parseFloat(carryRow["국고"]) || 0) * 1000000);
                    const bCarryCity = selectedYear === 1 ? 0 : Math.round((parseFloat(carryRow["지자체시비"]) || 0) * 1000000);
                    const bCarryExternal = selectedYear === 1 ? 0 : Math.round((parseFloat(carryRow["외부사업비"]) || 0) * 1000000);

                    py.budget_national = bNational;
                    py.budget_city = bCity;
                    py.budget_external = bExternal;
                    py.budget_main = bNational + bCity + bExternal; // 본예산 입력 우선 합산

                    py.budget_carry_national = bCarryNational;
                    py.budget_carry_city = bCarryCity;
                    py.budget_carry_external = bCarryExternal;
                    py.budget_carry = bCarryNational + bCarryCity + bCarryExternal; // 이월예산 입력 우선 합산

                    // 2. 10대 비목별 요소 파싱 및 0원 초과 비목 필터링 롤업 (최대 4개 제한)
                    const standardCategories = [
                      { label: "인건비", dbCategory: "인건비" },
                      { label: "장학금", dbCategory: "장학금" },
                      { label: "프로그램개발운영비", dbCategory: "교육∙연구 프로그램 개발∙운영비" },
                      { label: "환경개선비", dbCategory: "교육∙연구 환경개선비" },
                      { label: "실험실습장비비", dbCategory: "실험∙실습장비 및 기자재 구입∙운영비" },
                      { label: "지역연계협업비", dbCategory: "지역 연계∙협업 지원비" },
                      { label: "기업지원협력비", dbCategory: "기업 지원∙협력 활동비" },
                      { label: "성과활용확산비", dbCategory: "성과 활용∙확산 지원비" },
                      { label: "기타운영경비", dbCategory: "그 밖의 사업운영경비" },
                      { label: "간접비", dbCategory: "간접비" }
                    ];

                    const cats = [];
                    standardCategories.forEach(cat => {
                      const budgetVal = parseFloat(mainRow[cat.label]) || 0;
                      const carryVal = parseFloat(carryRow[cat.label]) || 0;
                      
                      if (budgetVal > 0 || carryVal > 0) {
                        // 기존에 이미 등록되어 있던 비목이면 spent/spent_carry 집행액 정보를 보존
                        const existing = (py.budget_categories || []).find(c => c.category === cat.dbCategory) || {};
                        cats.push({
                          category: cat.dbCategory,
                          budget: Math.round(budgetVal * 1000000),
                          budget_carry: Math.round(carryVal * 1000000),
                          spent: existing.spent || 0,
                          spent_carry: existing.spent_carry || 0
                        });
                      }
                    });
                    
                    // UI 기획 슬롯 제약에 맞춰 금액이 0보다 큰 비목 중 선입된 최대 4개까지만 배정
                    py.budget_categories = cats.slice(0, 4);

                    // 3. 프로그램 최상위 레거시 예산/집행 필드도 현재 5개년 연도 정보 기준으로 롤업 일치화
                    if (selectedYear === 2) {
                      prog.budget_2026 = py.budget_main;
                      prog.budget_2025_carry = py.budget_carry;
                      prog.budget = prog.budget_2026 + prog.budget_2025_carry;
                    } else if (selectedYear === 1) {
                      prog.budget_2025_carry = 0;
                      prog.budget = py.budget_main;
                    } else {
                      prog.budget = py.budget_main + py.budget_carry;
                    }

                    // 프로그램의 5개년 이월 예산 및 집행액 재계산 연쇄 작동
                    recalculateCarryOver(prog.years);
                  }
                }
              });
              
              // 해당 단위과제에 소속된 세부 프로그램들의 비목별 배정계획을 10대 표준비목으로 쪼개서 실시간 롤업 동기화
              const categorySums = {
                "인건비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "장학금": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "교육∙연구 프로그램 개발∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "교육∙연구 환경개선비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "실험∙실습장비 및 기자재 구입∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "지역 연계∙협업 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "기업 지원∙협력 활동비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "성과 활용∙확산 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "그 밖의 사업운영경비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
                "간접비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }
              };

              u.programs.forEach(prog => {
                const py = prog.years?.[selectedYear] || {};
                const progTotalMain = py.budget_main || 0;
                const progTotalCarry = py.budget_carry || 0;
                const progTotalSpent = py.spent_main || 0;
                const progTotalSpentCarry = py.spent_carry || 0;

                let allocatedMain = 0;
                let allocatedCarry = 0;
                let allocatedSpent = 0;
                let allocatedSpentCarry = 0;

                if (py.budget_categories && Array.isArray(py.budget_categories)) {
                  py.budget_categories.forEach(catItem => {
                    const catName = catItem.category;
                    if (catName && categorySums[catName] && catName !== "교육∙연구 프로그램 개발∙운영비") {
                      const mainVal = catItem.budget || 0;
                      const carryVal = catItem.budget_carry || 0;
                      const spentVal = catItem.spent || 0;
                      const spentCarryVal = catItem.spent_carry || 0;

                      categorySums[catName].main += mainVal;
                      categorySums[catName].carry += carryVal;
                      categorySums[catName].spent_main += spentVal;
                      categorySums[catName].spent_carry += spentCarryVal;

                      allocatedMain += mainVal;
                      allocatedCarry += carryVal;
                      allocatedSpent += spentVal;
                      allocatedSpentCarry += spentCarryVal;
                    }
                  });
                }

                const remainMain = Math.max(0, progTotalMain - allocatedMain);
                const remainCarry = Math.max(0, progTotalCarry - allocatedCarry);
                const remainSpent = Math.max(0, progTotalSpent - allocatedSpent);
                const remainSpentCarry = Math.max(0, progTotalSpentCarry - allocatedSpentCarry);

                categorySums["교육∙연구 프로그램 개발∙운영비"].main += remainMain;
                categorySums["교육∙연구 프로그램 개발∙운영비"].carry += remainCarry;
                categorySums["교육∙연구 프로그램 개발∙운영비"].spent_main += remainSpent;
                categorySums["교육∙연구 프로그램 개발∙운영비"].spent_carry += remainSpentCarry;
              });

              Object.keys(categorySums).forEach(catName => {
                if (!u.budgetDetails[catName]) {
                  u.budgetDetails[catName] = { years: {} };
                }
                if (!u.budgetDetails[catName].years[selectedYear]) {
                  u.budgetDetails[catName].years[selectedYear] = {
                    budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0
                  };
                }
                const tgt = u.budgetDetails[catName].years[selectedYear];
                tgt.budget_main = categorySums[catName].main;
                tgt.budget_carry = categorySums[catName].carry;
                tgt.spent_main = categorySums[catName].spent_main;
                tgt.spent_carry = categorySums[catName].spent_carry;
              });

              // 비목별 이월 재계산
              Object.keys(u.budgetDetails).forEach(key => {
                recalculateCarryOver(u.budgetDetails[key].years);
              });

              if (u.years[selectedYear]) {
                u.years[selectedYear].budget_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years[selectedYear]?.budget_main || 0), 0);
                u.years[selectedYear].budget_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years[selectedYear]?.budget_carry || 0), 0);
                u.years[selectedYear].spent_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years[selectedYear]?.spent_main || 0), 0);
                u.years[selectedYear].spent_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years[selectedYear]?.spent_carry || 0), 0);
              }
              
              // 단위과제 이월 재계산
              recalculateCarryOver(u.years);
            });
          });
        });
      } else if (type === "KPI") {
        excelJson.forEach((row) => {
          const subId = row["세부항목ID"];
          const currentVal = parseFloat(row["실적값(현재값)"]);
          
          if (subId && !isNaN(currentVal)) {
            updated.forEach((p) => {
              p.units.forEach((u) => {
                u.kpis.forEach((kpi) => {
                  let subItemFound = false;
                  kpi.subItems.forEach((sub) => {
                    if (sub.id === subId) {
                      if (!sub.years) sub.years = {};
                      if (!sub.years[selectedYear]) sub.years[selectedYear] = { target: 0, current: 0 };
                      sub.years[selectedYear].current = currentVal;
                      subItemFound = true;
                    }
                  });
                  if (subItemFound) {
                    const totalAchievement = kpi.subItems.reduce((sum, s) => {
                      const yData = s.years?.[selectedYear] || { target: 0, current: 0 };
                      const achievementRate = yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
                      return sum + achievementRate;
                    }, 0);
                    const avgAchievement = totalAchievement / kpi.subItems.length;
                    kpi.current = avgAchievement;
                    kpi.target = 100.0;
                  }
                });
              });
            });
          }
        });
      }

      return updated;
    });
  };

  // 실무진 수동 갱신 (프로그램 PDCA 및 실적 등록)
  const handleUpdateProgramDetails = (unitId, progId, updatedFields) => {
    setProjects((prevProjects) => {
      const updated = JSON.parse(JSON.stringify(prevProjects));
      updated.forEach((p) => {
        p.units.forEach((u) => {
          if (u.id === unitId) {
            u.programs.forEach((prog) => {
              if (prog.id === progId) {
                // PDCA 상태 갱신
                if (updatedFields.pdca !== undefined) prog.pdca = updatedFields.pdca;
                if (updatedFields.participants !== undefined) prog.participants = updatedFields.participants;
                if (updatedFields.satisfaction !== undefined) prog.satisfaction = updatedFields.satisfaction;
                if (updatedFields.selfEval !== undefined) prog.selfEval = updatedFields.selfEval;
                
                // 신규 P단계 기획 필드 갱신
                if (updatedFields.timeline !== undefined) prog.timeline = updatedFields.timeline;
                if (updatedFields.targetAudience !== undefined) prog.targetAudience = updatedFields.targetAudience;
                if (updatedFields.coopDept !== undefined) prog.coopDept = updatedFields.coopDept;
                
                // 신규 A단계 2분할 환류 필드 갱신
                if (updatedFields.evalType !== undefined) prog.evalType = updatedFields.evalType;
                if (updatedFields.excellent !== undefined) prog.excellent = updatedFields.excellent;
                if (updatedFields.improvePlan !== undefined) prog.improvePlan = updatedFields.improvePlan;
                if (updatedFields.deficiency !== undefined) prog.deficiency = updatedFields.deficiency;
                if (updatedFields.actionItem !== undefined) prog.actionItem = updatedFields.actionItem;
                if (updatedFields.achievements !== undefined) prog.achievements = updatedFields.achievements;

                const py = prog.years[selectedYear];
                if (py) {
                  // P단계 예산 배정액 세부 재원 갱신 (본예산 및 이월예산 구분)
                  if (updatedFields.budget_national !== undefined) py.budget_national = updatedFields.budget_national;
                  if (updatedFields.budget_city !== undefined) py.budget_city = updatedFields.budget_city;
                  if (updatedFields.budget_external !== undefined) py.budget_external = updatedFields.budget_external;
                  
                  if (updatedFields.budget_carry_national !== undefined) py.budget_carry_national = updatedFields.budget_carry_national;
                  if (updatedFields.budget_carry_city !== undefined) py.budget_carry_city = updatedFields.budget_carry_city;
                  if (updatedFields.budget_carry_external !== undefined) py.budget_carry_external = updatedFields.budget_carry_external;

                  // 세부 재원 예산의 합으로 총 본예산(budget_main) 동기화
                  py.budget_main = (py.budget_national || 0) + (py.budget_city || 0) + (py.budget_external || 0);

                  // 세부 재원 이월예산의 합으로 총 이월예산(budget_carry) 동기화 (1차년도 제외)
                  if (selectedYear === 1) {
                    py.budget_carry_national = 0;
                    py.budget_carry_city = 0;
                    py.budget_carry_external = 0;
                    py.budget_carry = 0;
                  } else {
                    py.budget_carry = (py.budget_carry_national || 0) + (py.budget_carry_city || 0) + (py.budget_carry_external || 0);
                  }

                  // 프로그램 최상위 레거시 필드도 현재 5개년 연도 정보 기준으로 일치화 (P 단계 입력이 진짜)
                  if (selectedYear === 2) {
                    prog.budget_2026 = py.budget_main;
                    prog.budget_2025_carry = py.budget_carry;
                    prog.budget = prog.budget_2026 + prog.budget_2025_carry;
                  } else if (selectedYear === 1) {
                    prog.budget_2025_carry = 0;
                    prog.budget = py.budget_main;
                  } else {
                    prog.budget = py.budget_main + py.budget_carry;
                  }

                  // D단계 집행액 세부 재원 갱신
                  if (updatedFields.spent_national !== undefined) py.spent_national = Math.min(updatedFields.spent_national, py.budget_national || 0);
                  if (updatedFields.spent_city !== undefined) py.spent_city = Math.min(updatedFields.spent_city, py.budget_city || 0);
                  if (updatedFields.spent_external !== undefined) py.spent_external = Math.min(updatedFields.spent_external, py.budget_external || 0);
                  
                  // 세부 재원 집행액의 합으로 총 본집행액(spent_main) 동기화
                  py.spent_main = (py.spent_national || 0) + (py.spent_city || 0) + (py.spent_external || 0);

                  // 프로그램 최상위 집행액 레거시 필드 동기화 (D 단계 입력이 진짜)
                  if (selectedYear === 2) {
                    prog.spent_2026 = py.spent_main;
                    prog.spent_2025_carry = py.spent_carry || 0;
                    prog.spent = prog.spent_2026 + prog.spent_2025_carry;
                  } else if (selectedYear === 1) {
                    prog.spent_2025_carry = 0;
                    prog.spent = py.spent_main;
                  } else {
                    prog.spent = py.spent_main + (py.spent_carry || 0);
                  }

                  // 비목별 이원화 예산 갱신
                  if (updatedFields.budget_categories !== undefined) {
                    py.budget_categories = updatedFields.budget_categories;
                  }
                }
                
                // 프로그램 5개년 이월 잔액 재계산
                recalculateCarryOver(prog.years);

                // 수동 이월 배정 기입이 포함되지 않은 경우에만 예산 이월비 자동 재조정
                if (updatedFields.budget_carry_national === undefined) {
                  [1, 2, 3, 4, 5].forEach((yr) => {
                    if (yr !== selectedYear) {
                      const y = prog.years[yr];
                      const isExternalSub = prog.id.endsWith("-2") || prog.id.includes("위탁") || prog.title.includes("위탁") || prog.title.includes("협력");
                      if (isExternalSub) {
                        y.budget_carry_external = y.budget_carry || 0;
                        y.budget_carry_national = 0;
                        y.budget_carry_city = 0;
                      } else {
                        y.budget_carry_national = Math.round((y.budget_carry || 0) * 0.5);
                        y.budget_carry_city = (y.budget_carry || 0) - y.budget_carry_national;
                        y.budget_carry_external = 0;
                      }
                    }
                  });
                }
              }
            });
            
            // 해당 단위과제에 소속된 세부 프로그램들의 비목별 배정계획을 10대 표준비목으로 쪼개서 실시간 롤업 동기화
            const categorySums = {
              "인건비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "장학금": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "교육∙연구 프로그램 개발∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "교육∙연구 환경개선비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "실험∙실습장비 및 기자재 구입∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "지역 연계∙협업 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "기업 지원∙협력 활동비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "성과 활용∙확산 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "그 밖의 사업운영경비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "간접비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }
            };

            u.programs.forEach(prog => {
              const py = prog.years?.[selectedYear] || {};
              const progTotalMain = py.budget_main || 0;
              const progTotalCarry = py.budget_carry || 0;
              const progTotalSpent = py.spent_main || 0;
              const progTotalSpentCarry = py.spent_carry || 0;

              let allocatedMain = 0;
              let allocatedCarry = 0;
              let allocatedSpent = 0;
              let allocatedSpentCarry = 0;

              if (py.budget_categories && Array.isArray(py.budget_categories)) {
                py.budget_categories.forEach(catItem => {
                  const catName = catItem.category;
                  if (catName && categorySums[catName] && catName !== "교육∙연구 프로그램 개발∙운영비") {
                    const mainVal = parseInt(String(catItem.budget || "0").replace(/,/g, ""), 10) || 0;
                    const carryVal = parseInt(String(catItem.budget_carry || "0").replace(/,/g, ""), 10) || 0;
                    const spentVal = Math.round(catItem.spent || 0);
                    const spentCarryVal = Math.round(catItem.spent_carry || 0);

                    categorySums[catName].main += mainVal;
                    categorySums[catName].carry += carryVal;
                    categorySums[catName].spent_main += spentVal;
                    categorySums[catName].spent_carry += spentCarryVal;

                    allocatedMain += mainVal;
                    allocatedCarry += carryVal;
                    allocatedSpent += spentVal;
                    allocatedSpentCarry += spentCarryVal;
                  }
                });
              }

              const remainMain = Math.max(0, progTotalMain - allocatedMain);
              const remainCarry = Math.max(0, progTotalCarry - allocatedCarry);
              const remainSpent = Math.max(0, progTotalSpent - allocatedSpent);
              const remainSpentCarry = Math.max(0, progTotalSpentCarry - allocatedSpentCarry);

              categorySums["교육∙연구 프로그램 개발∙운영비"].main += remainMain;
              categorySums["교육∙연구 프로그램 개발∙운영비"].carry += remainCarry;
              categorySums["교육∙연구 프로그램 개발∙운영비"].spent_main += remainSpent;
              categorySums["교육∙연구 프로그램 개발∙운영비"].spent_carry += remainSpentCarry;
            });

            // 계산 결과를 u.budgetDetails 의 selectedYear 에 주입
            Object.keys(categorySums).forEach(catName => {
              if (!u.budgetDetails[catName]) {
                u.budgetDetails[catName] = { years: {} };
              }
              if (!u.budgetDetails[catName].years[selectedYear]) {
                u.budgetDetails[catName].years[selectedYear] = {
                  budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0
                };
              }
              const tgt = u.budgetDetails[catName].years[selectedYear];
              tgt.budget_main = categorySums[catName].main;
              tgt.budget_carry = categorySums[catName].carry;
              tgt.spent_main = categorySums[catName].spent_main;
              tgt.spent_carry = categorySums[catName].spent_carry;
            });
            
            // 모든 비목의 이월 잔액 재계산
            Object.keys(u.budgetDetails).forEach(key => {
              recalculateCarryOver(u.budgetDetails[key].years);
            });
            
            // 단위과제 연도별 전체 집행액/예산 재집계 및 이월 연쇄 재계산
            [1, 2, 3, 4, 5].forEach(yr => {
              const uYear = u.years[yr] || {};
              uYear.spent_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_main || 0), 0);
              uYear.spent_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_carry || 0), 0);
              uYear.budget_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_main || 0), 0);
              uYear.budget_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_carry || 0), 0);
            });
            recalculateCarryOver(u.years);
            
            // 레거시/기타 UI 연동용 필드 동기화
            u.spent = (u.years[selectedYear]?.spent_main || 0) + (u.years[selectedYear]?.spent_carry || 0);
            u.budget = (u.years[selectedYear]?.budget_main || 0) + (u.years[selectedYear]?.budget_carry || 0);
          }
        });
        
        // 프로젝트 전체 집행액/예산 총합 갱신
        p.spent = p.units.reduce((sum, un) => sum + (un.years[selectedYear]?.spent_main || 0) + (un.years[selectedYear]?.spent_carry || 0), 0);
        p.budget = p.units.reduce((sum, un) => sum + (un.years[selectedYear]?.budget_main || 0) + (un.years[selectedYear]?.budget_carry || 0), 0);
      });
      return updated;
    });
  };

  // 프로그램 신규 추가 핸들러
  const handleAddProgram = (unitId, title, assignee, budget2026, carryBudget) => {
    setProjects((prevProjects) => {
      const updated = JSON.parse(JSON.stringify(prevProjects));
      updated.forEach((p) => {
        p.units.forEach((u) => {
          if (u.id === unitId) {
            // 새 프로그램 ID 자동 연산
            let nextNum = 1;
            if (u.programs.length > 0) {
              const lastId = u.programs[u.programs.length - 1].id;
              const parts = lastId.split("-");
              const lastNum = parseInt(parts[parts.length - 1], 10);
              if (!isNaN(lastNum)) nextNum = lastNum + 1;
            }
            const newId = `${unitId}-${String(nextNum).padStart(2, '0')}`;

            const bMain = Math.round((parseFloat(budget2026) || 0) * 1000000);
            const bCarry = Math.round((parseFloat(carryBudget) || 0) * 1000000);

            const yearsObj = {};
            [1, 2, 3, 4, 5].forEach((yr) => {
              const baseMain = yr === 2 ? bMain : Math.round(bMain * (yr === 1 ? 0.9 : yr === 3 ? 1.1 : yr === 4 ? 1.2 : 1.3));
              const baseCarry = yr === 2 ? bCarry : 0;
              yearsObj[yr] = {
                budget_main: baseMain,
                budget_carry: baseCarry,
                spent_main: 0,
                spent_carry: 0,
                budget_categories: [],
                budget_national: baseMain,
                budget_city: 0,
                budget_external: 0,
                budget_carry_national: baseCarry,
                budget_carry_city: 0,
                budget_carry_external: 0
              };
            });

            const newProg = {
              id: newId,
              title: title,
              assignee: assignee || "미지정",
              assignees: {
                [selectedYear]: assignee || "미지정"
              },
              budget_2026: bMain,
              budget_2025_carry: bCarry,
              budget: bMain + bCarry,
              spent_2026: 0,
              spent_2025_carry: 0,
              spent: 0,
              participants: 0,
              satisfaction: 0,
              selfEval: "",
              timeline: "",
              targetAudience: "",
              coopDept: "",
              pdca: { p: "대기", d: "대기", c: "대기", a: "대기" },
              years: yearsObj
            };

            u.programs.push(newProg);

            // 해당 단위과제 롤업 및 이월 재계산
            const categorySums = {
              "인건비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "장학금": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "교육∙연구 프로그램 개발∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "교육∙연구 환경개선비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "실험∙실습장비 및 기자재 구입∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "지역 연계∙협업 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "기업 지원∙협력 활동비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "성과 활용∙확산 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "그 밖의 사업운영경비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
              "간접비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }
            };

            u.programs.forEach(prog => {
              const py = prog.years?.[selectedYear] || {};
              const progTotalMain = py.budget_main || 0;
              const progTotalCarry = py.budget_carry || 0;
              const progTotalSpent = py.spent_main || 0;
              const progTotalSpentCarry = py.spent_carry || 0;

              let allocatedMain = 0;
              let allocatedCarry = 0;
              let allocatedSpent = 0;
              let allocatedSpentCarry = 0;

              if (py.budget_categories && Array.isArray(py.budget_categories)) {
                py.budget_categories.forEach(catItem => {
                  const catName = catItem.category;
                  if (catName && categorySums[catName] && catName !== "교육∙연구 프로그램 개발∙운영비") {
                    const mainVal = parseInt(String(catItem.budget || "0").replace(/,/g, ""), 10) || 0;
                    const carryVal = parseInt(String(catItem.budget_carry || "0").replace(/,/g, ""), 10) || 0;
                    const spentVal = Math.round(catItem.spent || 0);
                    const spentCarryVal = Math.round(catItem.spent_carry || 0);

                    categorySums[catName].main += mainVal;
                    categorySums[catName].carry += carryVal;
                    categorySums[catName].spent_main += spentVal;
                    categorySums[catName].spent_carry += spentCarryVal;

                    allocatedMain += mainVal;
                    allocatedCarry += carryVal;
                    allocatedSpent += spentVal;
                    allocatedSpentCarry += spentCarryVal;
                  }
                });
              }

              const remainMain = Math.max(0, progTotalMain - allocatedMain);
              const remainCarry = Math.max(0, progTotalCarry - allocatedCarry);
              const remainSpent = Math.max(0, progTotalSpent - allocatedSpent);
              const remainSpentCarry = Math.max(0, progTotalSpentCarry - allocatedSpentCarry);

              categorySums["교육∙연구 프로그램 개발∙운영비"].main += remainMain;
              categorySums["교육∙연구 프로그램 개발∙운영비"].carry += remainCarry;
              categorySums["교육∙연구 프로그램 개발∙운영비"].spent_main += remainSpent;
              categorySums["교육∙연구 프로그램 개발∙운영비"].spent_carry += remainSpentCarry;
            });

            Object.keys(categorySums).forEach(catName => {
              if (!u.budgetDetails[catName]) {
                u.budgetDetails[catName] = { years: {} };
              }
              if (!u.budgetDetails[catName].years[selectedYear]) {
                u.budgetDetails[catName].years[selectedYear] = {
                  budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0
                };
              }
              const tgt = u.budgetDetails[catName].years[selectedYear];
              tgt.budget_main = categorySums[catName].main;
              tgt.budget_carry = categorySums[catName].carry;
              tgt.spent_main = categorySums[catName].spent_main;
              tgt.spent_carry = categorySums[catName].spent_carry;
            });

            Object.keys(u.budgetDetails).forEach(key => {
              recalculateCarryOver(u.budgetDetails[key].years);
            });

            [1, 2, 3, 4, 5].forEach(yr => {
              const uYear = u.years[yr] || {};
              uYear.spent_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_main || 0), 0);
              uYear.spent_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_carry || 0), 0);
              uYear.budget_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_main || 0), 0);
              uYear.budget_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_carry || 0), 0);
            });
            recalculateCarryOver(u.years);

            u.spent = (u.years[selectedYear]?.spent_main || 0) + (u.years[selectedYear]?.spent_carry || 0);
            u.budget = (u.years[selectedYear]?.budget_main || 0) + (u.years[selectedYear]?.budget_carry || 0);
          }
        });

        p.spent = p.units.reduce((sum, un) => sum + (un.years[selectedYear]?.spent_main || 0) + (un.years[selectedYear]?.spent_carry || 0), 0);
        p.budget = p.units.reduce((sum, un) => sum + (un.years[selectedYear]?.budget_main || 0) + (un.years[selectedYear]?.budget_carry || 0), 0);
      });
      return updated;
    });
  };

  // 성과지표 목표치/실적치 직접 수정 핸들러
  const handleUpdateKpiValue = (subItemId, field, value) => {
    setProjects((prevProjects) => {
      const updated = JSON.parse(JSON.stringify(prevProjects));
      updated.forEach((p) => {
        p.units.forEach((u) => {
          u.kpis.forEach((k) => {
            if (k.subItems) {
              k.subItems.forEach((sub) => {
                if (sub.id === subItemId) {
                  if (!sub.years) sub.years = {};
                  if (!sub.years[selectedYear]) {
                    sub.years[selectedYear] = { target: 0, current: 0 };
                  }
                  sub.years[selectedYear][field] = value;
                }
              });
            }
          });
        });
      });
      return updated;
    });
  };

  // 비목 예산 세부 조율 갱신 핸들러 (5개년 연쇄 이월 계산 연계)
  const handleUpdateBudgetDetails = (unitId, updatedBudgetDetails) => {
    setProjects(prevProjects => {
      const updated = JSON.parse(JSON.stringify(prevProjects));
      updated.forEach(p => {
        p.units.forEach(u => {
          if (u.id === unitId) {
            // 비목 예산 배정 수정분 반영
            Object.keys(updatedBudgetDetails).forEach(key => {
              if (!u.budgetDetails[key]) {
                u.budgetDetails[key] = { years: {} };
              }
              const yearsUpdate = updatedBudgetDetails[key].years || {};
              Object.keys(yearsUpdate).forEach(yr => {
                if (!u.budgetDetails[key].years) {
                  u.budgetDetails[key].years = {};
                }
                const existing = u.budgetDetails[key].years[yr] || {};
                u.budgetDetails[key].years[yr] = {
                  ...existing,
                  ...yearsUpdate[yr]
                };
              });
            });

            // 모든 비목의 이월 잔액 5개년 연쇄 재계산
            Object.keys(u.budgetDetails).forEach(key => {
              recalculateCarryOver(u.budgetDetails[key].years);
            });

            // 단위과제 연도별 전체 집행액/예산 재집계 및 이월 연쇄 재계산
            [1, 2, 3, 4, 5].forEach(yr => {
              const uYear = u.years[yr] || {};
              uYear.spent_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_main || 0), 0);
              uYear.spent_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_carry || 0), 0);
              uYear.budget_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_main || 0), 0);
              uYear.budget_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_carry || 0), 0);
            });
            recalculateCarryOver(u.years);

            u.spent = (u.years[selectedYear]?.spent_main || 0) + (u.years[selectedYear]?.spent_carry || 0);
            u.budget = (u.years[selectedYear]?.budget_main || 0) + (u.years[selectedYear]?.budget_carry || 0);
          }
        });
        
        p.spent = p.units.reduce((sum, un) => sum + (un.years[selectedYear]?.spent_main || 0) + (un.years[selectedYear]?.spent_carry || 0), 0);
        p.budget = p.units.reduce((sum, un) => sum + (un.years[selectedYear]?.budget_main || 0) + (un.years[selectedYear]?.budget_carry || 0), 0);
      });
      return updated;
    });
  };;;

  // 연구원 배정 핸들러
  const handleAssignChange = (unitId, progId, newAssignee) => {
    setProjects((prevProjects) => {
      const updated = JSON.parse(JSON.stringify(prevProjects));
      updated.forEach((p) => {
        p.units.forEach((u) => {
          if (u.id === unitId) {
            u.programs.forEach((prog) => {
              if (prog.id === progId) {
                if (!prog.assignees) {
                  prog.assignees = {};
                }
                prog.assignees[selectedYear] = newAssignee;
                // 하위 호환성을 위해 현재 선택된 년도의 배정을 단일 assignee 필드에도 업데이트
                prog.assignee = newAssignee;
              }
            });
          }
        });
      });
      return updated;
    });
    alert(`[${progId}] 프로그램의 ${selectedYear}차년도 담당연구원이 "${newAssignee || "미배정"}"(으)로 배정 및 저장되었습니다.`);
  };

  // 사용자 호칭 맵핑 웰컴 메시지 헬퍼 함수
  const getWelcomeMessage = () => {
    if (!currentUser) return "";
    let cleanName = currentUser.name ? currentUser.name.split(" ")[0].split("(")[0].trim() : "";
    const roleId = currentUser.role?.id || "";
    let titleSuffix = "님";
    if (roleId === "DIRECTOR") titleSuffix = " 단장님";
    else if (roleId === "HQ_HEAD") titleSuffix = " 본부장님";
    else if (roleId === "CENTER_LEADER") titleSuffix = " 센터장님";
    else if (roleId === "OP_LEADER") titleSuffix = " 팀장님";
    else if (roleId === "RESEARCHER") titleSuffix = " 연구원님";

    return (
      <span>
        반갑습니다, <strong>{cleanName}{titleSuffix}</strong>
      </span>
    );
  };

  if (!currentUser) {
    return <AuthManager onLoginSuccess={handleLoginSuccess} members={members} />;
  }

  const currentRole = currentUser.role;

  return (
    <div className="dashboard-container">
      {/* 사이드바 */}
      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <Sidebar
          currentRole={currentRole}
          onChangeRole={() => {}}
          activeTab={activeTab}
          onChangeTab={(tab) => {
            setActiveTab(tab);
            setSelectedKpi(null);
          }}
          projectsSubTab={projectsSubTab}
          onChangeProjectsSubTab={setProjectsSubTab}
          kpiSubTab={kpiSubTab}
          onChangeKpiSubTab={setKpiSubTab}
          mgmtSubTab={mgmtSubTab}
          onChangeMgmtSubTab={setMgmtSubTab}
        />
        <div style={{ padding: "0.5rem 1.5rem 0.25rem 1.5rem", background: "var(--panel-bg-dark)", borderRight: "1px solid var(--border-color-dark)" }}>
          <button
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", color: "white" }}
            onClick={() => setIsPasswordModalOpen(true)}
          >
            <LockIcon size={16} />
            <span>개인정보 관리</span>
          </button>
        </div>
        <div style={{ padding: "0.25rem 1.5rem 1.5rem 1.5rem", background: "var(--panel-bg-dark)", borderRight: "1px solid var(--border-color-dark)" }} className="light-mode-logout-bg">
          <button className="btn-primary" style={{ width: "100%", justifyContent: "center", background: "rgba(239,68,68,0.15)", border: "1px solid var(--danger-color)", color: "#f87171" }} onClick={handleLogout}>
            <LogOut size={16} />
            <span>로그아웃</span>
          </button>
        </div>
      </div>

      {/* 메인 뷰 */}
      <main className="main-content">
        <header className="top-nav" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div className="page-title">
            <h1>앵커사업 통합 IR 대시보드</h1>
            <p>울산과학대학교 앵커사업 {selectedYear}차년도 사업예산 및 성과관리 시스템</p>
          </div>

          {/* 전역 연도 선택 컨트롤러 */}
          <div style={{ display: "flex", gap: "0.25rem", background: "rgba(255, 255, 255, 0.03)", padding: "0.25rem", borderRadius: "2rem", border: "1px solid var(--border-color-dark)" }}>
            {[1, 2, 3, 4, 5].map((yr) => (
              <button
                key={yr}
                onClick={() => {
                  setSelectedYear(yr);
                  setSelectedKpi(null);
                  if (yr === 1) {
                    setSelectedUnitId("A1");
                  } else {
                    setSelectedUnitId("A1가");
                  }
                  setSelectedProgId(null);
                }}
                style={{
                  padding: "0.4rem 0.9rem",
                  fontSize: "0.75rem",
                  borderRadius: "2rem",
                  border: "none",
                  background: selectedYear === yr ? "var(--accent-color)" : "transparent",
                  color: selectedYear === yr ? "#fff" : "var(--text-secondary-dark)",
                  cursor: "pointer",
                  fontWeight: "700",
                  transition: "all 0.2s"
                }}
              >
                {yr}차년도{yr === 2 ? "(현)" : ""}
              </button>
            ))}
          </div>

          <div className="controls-section">
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary-dark)", marginRight: "1rem" }}>
              {getWelcomeMessage()}
            </span>
            <button className="theme-toggle-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div>
            {/* 메인 대시보드 탭: 사용자의 요청에 따라 엑셀 업로더 영역을 제거하고 KPI 요약 카드만 노출합니다. */}
            <KPIOverview projects={displayProjects} currentRole={currentRole} selectedYear={selectedYear} />
          </div>
        )}

        {activeTab === "projects" && (
          <>
            {/* 단위과제 및 프로그램 관리 탭: 전체 카드를 Fragment로 감싼 뒤 하단에 예산 전용 엑셀 업로더를 배치합니다. */}
            <div className="glass-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>단위과제 관리 (ANCHOR Unit Projects)</h2>
            </div>

            {/* 서브탭 내비게이션 바 */}
            <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.8rem", marginBottom: "1.2rem" }}>
              <button
                type="button"
                onClick={() => setProjectsSubTab("unit_status")}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  color: projectsSubTab === "unit_status" ? "var(--accent-color)" : "var(--text-secondary-dark)",
                  borderBottom: projectsSubTab === "unit_status" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s"
                }}
              >
                단위과제 집행현황
              </button>
              <button
                type="button"
                onClick={() => setProjectsSubTab("program_mgmt")}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  color: projectsSubTab === "program_mgmt" ? "var(--accent-color)" : "var(--text-secondary-dark)",
                  borderBottom: projectsSubTab === "program_mgmt" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s"
                }}
              >
                프로그램 관리
              </button>
            </div>
            
            {projectsSubTab === "unit_status" && (
              <div className="table-panel">
                <table className="custom-table" style={{ fontSize: "0.8rem" }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                      <th rowSpan={2} style={{ verticalAlign: "middle", borderBottom: "1px solid rgba(255,255,255,0.1)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>과제/부서</th>
                      <th colSpan={selectedYear >= 2 ? 5 : 4} style={{ textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", borderRight: "1px solid rgba(255,255,255,0.05)", fontWeight: "800", color: "var(--accent-color)" }}>
                        예산 배정 및 집행 (단위: 백만원)
                      </th>
                      <th colSpan={5} style={{ textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", fontWeight: "800", color: "#10b981" }}>
                        프로그램 현황 및 진행
                      </th>
                    </tr>
                    <tr>
                      <th style={{ fontSize: "0.75rem", textAlign: "right", paddingRight: "1rem" }}>본예산</th>
                      {selectedYear >= 2 && <th style={{ fontSize: "0.75rem", textAlign: "right", paddingRight: "1rem" }}>이월예산</th>}
                      <th style={{ fontSize: "0.75rem", textAlign: "right", paddingRight: "1rem" }}>총 배정액</th>
                      <th style={{ fontSize: "0.75rem", textAlign: "right", paddingRight: "1rem" }}>누적 집행</th>
                      <th style={{ fontSize: "0.75rem", borderRight: "1px solid rgba(255,255,255,0.05)", textAlign: "right", paddingRight: "1rem" }}>집행률</th>
                      <th style={{ fontSize: "0.75rem", textAlign: "center" }}>총 개수</th>
                      <th style={{ fontSize: "0.75rem", textAlign: "center" }}>준비</th>
                      <th style={{ fontSize: "0.75rem", textAlign: "center" }}>진행</th>
                      <th style={{ fontSize: "0.75rem", textAlign: "center" }}>완료</th>
                      <th style={{ fontSize: "0.75rem" }}>진행률</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayProjects.flatMap((p) => p.units)
                      .sort((a, b) => {
                        if (a.id === "Common") return 1;
                        if (b.id === "Common") return -1;
                        return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
                      })
                      .map((u) => {
                        const yData = u.years?.[selectedYear] || { budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0 };
                        const budgetCarryVal = selectedYear === 1 ? 0 : (yData.budget_carry || 0);
                        const spentCarryVal = selectedYear === 1 ? 0 : (yData.spent_carry || 0);
                        const totalBudget = (yData.budget_main || 0) + budgetCarryVal;
                        const totalSpent = (yData.spent_main || 0) + spentCarryVal;
                        const rate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

                        // 프로그램 현황 집계 변수들
                        const totalPrograms = u.programs?.length || 0;
                        let readyCount = 0;
                        let inProgressCount = 0;
                        let completedCount = 0;
                        let totalProgressSum = 0;

                        if (totalPrograms > 0) {
                          u.programs.forEach((prog) => {
                            const pdca = prog.pdca || { p: "대기", d: "대기", c: "대기", a: "대기" };
                            const completedSteps = [pdca.p, pdca.d, pdca.c, pdca.a].filter(step => step === "완료").length;
                            const progProgress = (completedSteps / 4) * 100;
                            totalProgressSum += progProgress;

                            if (completedSteps === 0) {
                              readyCount++;
                            } else if (completedSteps === 4) {
                              completedCount++;
                            } else {
                              inProgressCount++;
                            }
                          });
                        }
                        const progressRate = totalPrograms > 0 ? (totalProgressSum / totalPrograms) : 0;

                        return (
                          <tr 
                            key={u.id}
                            onClick={() => {
                              setSelectedUnitId(u.id);
                              setSelectedProgId(null);
                              setProjectsSubTab("program_mgmt"); // 단위과제 클릭 시 프로그램 관리 탭으로 연계 이동
                            }}
                            style={{
                              cursor: "pointer",
                              background: selectedUnitId === u.id ? "rgba(59, 130, 246, 0.15)" : "transparent",
                              transition: "background 0.2s"
                            }}
                          >
                            <td style={{ fontWeight: "700", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
                              {u.id === "Common" ? "" : `${u.id}. `}{u.title}
                            </td>
                            <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                              {formatToMillionWon(yData.budget_main)}
                            </td>
                            {selectedYear >= 2 && (
                              <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                                {formatToMillionWon(budgetCarryVal)}
                              </td>
                            )}
                            <td style={{ fontFamily: "var(--font-data)", fontWeight: "700", textAlign: "right", paddingRight: "1rem" }}>
                              {formatToMillionWon(totalBudget)}
                            </td>
                            <td style={{ fontFamily: "var(--font-data)", textAlign: "right", paddingRight: "1rem" }}>
                              {formatToMillionWon(totalSpent)}
                            </td>
                            <td style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-data)" }}>{rate.toFixed(1)}%</span>
                              </div>
                            </td>
                            {u.id === "Common" ? (
                              <>
                                <td style={{ textAlign: "center" }}>-</td>
                                <td style={{ textAlign: "center" }}>-</td>
                                <td style={{ textAlign: "center" }}>-</td>
                                <td style={{ textAlign: "center" }}>-</td>
                                <td>-</td>
                              </>
                            ) : (
                              <>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "center" }}>
                                  {totalPrograms}개
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "center", color: "var(--text-secondary-dark)" }}>
                                  {readyCount}
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "center", color: "#f59e0b" }}>
                                  {inProgressCount}
                                </td>
                                <td style={{ fontFamily: "var(--font-data)", textAlign: "center", color: "var(--success-color)", fontWeight: "700" }}>
                                  {completedCount}
                                </td>
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    <div style={{ width: "40px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                                      <div style={{ width: `${Math.min(progressRate, 100)}%`, height: "100%", background: "#10b981" }} />
                                    </div>
                                    <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-data)", fontWeight: "700", color: "#10b981" }}>{progressRate.toFixed(1)}%</span>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            )}

            {projectsSubTab === "program_mgmt" && (
              <div id="pdca-manager-section">
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1rem" }}>프로그램 관리</h3>
                <PDCAManager
                  projects={displayProjects}
                  currentRole={currentRole}
                  onUpdateProgramDetails={handleUpdateProgramDetails}
                  onAddProgram={handleAddProgram}
                  selectedYear={selectedYear}
                  selectedUnitId={selectedUnitId}
                  setSelectedUnitId={setSelectedUnitId}
                  selectedProgId={selectedProgId}
                  setSelectedProgId={setSelectedProgId}
                  viewMode={pdcaViewMode}
                  setViewMode={setPdcaViewMode}
                />
                {/* 단위과제 및 프로그램 전용 예산 엑셀 업로더 (mode="BUDGET") */}
                <ExcelUploader
                  mode="BUDGET"
                  onUpdateData={handleUpdateData}
                  projects={displayProjects}
                  selectedYear={selectedYear}
                  viewMode={pdcaViewMode}
                  selectedUnitId={selectedUnitId}
                />
              </div>
            )}
          </div>
        </>
        )}

        {activeTab === "management" && (
          <div className="glass-card" style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", flexWrap: "wrap", gap: "0.8rem" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>사업단 관리 (ANCHOR Management)</h2>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginTop: "0.2rem" }}>
                  울산과학대학교 라이즈(앵커) 사업단 구성원을 관리하고, 각 세부 프로그램의 실무 연구원을 매핑하는 통합 업무 공간입니다.
                </p>
              </div>

              {mgmtSubTab === "members" && currentRole.rank <= 2 && (
                <button
                  className="btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: "0.3rem", borderRadius: "0.4rem", padding: "0.5rem 1rem", fontSize: "0.8rem", fontWeight: "700" }}
                  onClick={() => {
                    setEditingMember({
                      id: "",
                      name: "",
                      role: "연구원",
                      grade: "연구원",
                      dept: "ECC센터",
                      phoneOffice: "",
                      phoneMobile: "",
                      email: "",
                      room: "",
                      hireDate: "2026-03-01",
                      startDate: "2026-03-01",
                      endDate: "",
                      status: "재직중"
                    });
                    setIsMemberModalOpen(true);
                  }}
                >
                  구성원 추가
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.8rem", marginBottom: "1.2rem" }}>
              <button
                type="button"
                onClick={() => setMgmtSubTab("members")}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  color: mgmtSubTab === "members" ? "var(--accent-color)" : "var(--text-secondary-dark)",
                  borderBottom: mgmtSubTab === "members" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s"
                }}
              >
                구성원 관리
              </button>
              <button
                type="button"
                onClick={() => setMgmtSubTab("programs")}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  color: mgmtSubTab === "programs" ? "var(--accent-color)" : "var(--text-secondary-dark)",
                  borderBottom: mgmtSubTab === "programs" ? "2px solid var(--accent-color)" : "none",
                  transition: "all 0.2s"
                }}
              >
                프로그램 배정
              </button>
              {currentRole.rank <= 2 && (
                <button
                  type="button"
                  onClick={() => setMgmtSubTab("approvals")}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: "0.5rem 1rem",
                    fontSize: "0.85rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    color: mgmtSubTab === "approvals" ? "var(--accent-color)" : "var(--text-secondary-dark)",
                    borderBottom: mgmtSubTab === "approvals" ? "2px solid var(--accent-color)" : "none",
                    transition: "all 0.2s"
                  }}
                >
                  회원현황
                </button>
              )}
            </div>

            {mgmtSubTab === "members" && (
              <div>
                <div className="table-panel">
                  <table className="custom-table" style={{ fontSize: "0.8rem" }}>
                    <thead>
                      <tr>
                        <th>소속 부서</th>
                        <th>성명</th>
                        <th>직책</th>
                        <th>직급/직위</th>
                        <th>이메일</th>
                        <th>교내 전화</th>
                        <th>휴대전화</th>
                        <th>시작일</th>
                        <th>종료일</th>
                        <th>재직 여부</th>
                        {currentRole.rank <= 2 && <th>관리</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m) => (
                        <tr key={m.id}>
                          <td style={{ fontWeight: "700" }}>{m.dept}</td>
                          <td style={{ fontWeight: "800", color: "white" }}>{m.name}</td>
                          <td>
                            <span
                              className={`badge ${
                                m.role === "사업단장" || m.role === "본부장"
                                  ? "badge-red"
                                  : m.role === "센터장"
                                  ? "badge-blue"
                                  : m.role === "팀장교수"
                                  ? "badge-green"
                                  : "badge-gray"
                              }`}
                              style={{ fontSize: "0.65rem" }}
                            >
                              {m.role}
                            </span>
                          </td>
                          <td>{m.grade}</td>
                          <td style={{ fontFamily: "var(--font-data)" }}>{m.email}</td>
                          <td style={{ fontFamily: "var(--font-data)" }}>{m.phoneOffice || "-"}</td>
                          <td style={{ fontFamily: "var(--font-data)" }}>{m.phoneMobile || "-"}</td>
                          <td style={{ fontFamily: "var(--font-data)" }}>{m.startDate || m.hireDate || "-"}</td>
                          <td style={{ fontFamily: "var(--font-data)" }}>{m.endDate || "-"}</td>
                          <td>
                            <span
                              className={`badge ${
                                m.status === "퇴직" ? "badge-red" : "badge-green"
                              }`}
                              style={{ fontSize: "0.65rem" }}
                            >
                              {m.status || "재직중"}
                            </span>
                          </td>
                          {currentRole.rank <= 2 && (
                            <td>
                              <div style={{ display: "flex", gap: "0.3rem" }}>
                                <button
                                  className="btn-primary"
                                  style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.25rem", background: "rgba(59,130,246,0.15)", border: "1px solid var(--accent-color)", color: "#60a5fa" }}
                                  onClick={() => {
                                    setEditingMember(m);
                                    setIsMemberModalOpen(true);
                                  }}
                                >
                                  수정
                                </button>
                                <button
                                  className="btn-primary"
                                  style={{ padding: "0.2rem 0.4rem", fontSize: "0.65rem", borderRadius: "0.25rem", background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", color: "#f87171" }}
                                  onClick={() => {
                                    if (window.confirm(`정말 ${m.name} 구성원을 삭제하시겠습니까?`)) {
                                      setMembers(members.filter((item) => item.id !== m.id));
                                    }
                                  }}
                                >
                                  삭제
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {mgmtSubTab === "programs" && (
              <div>
                <div style={{ marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-secondary-dark)" }}>단위과제 필터:</span>
                  <select
                    className="user-selector"
                    value={assignFilterUnitId}
                    onChange={(e) => setAssignFilterUnitId(e.target.value)}
                    style={{
                      padding: "0.3rem 0.6rem",
                      fontSize: "0.78rem",
                      borderRadius: "0.25rem",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid var(--border-color-dark)",
                      color: "white",
                      outline: "none"
                    }}
                  >
                    <option value="all">전체 단위과제</option>
                    {displayProjects.flatMap((p) => p.units)
                      .sort((a, b) => {
                        if (a.id === "Common") return 1;
                        if (b.id === "Common") return -1;
                        return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
                      })
                      .map((u) => (
                        <option key={u.id} value={u.id}>{u.id === "Common" ? "" : `${u.id}. `}{u.title}</option>
                      ))}
                  </select>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", marginBottom: "1rem" }}>
                  * 실무 연구원으로 등록된 구성원(직책: 연구원)만 프로그램 담당연구원 목록으로 매핑됩니다.
                </p>
                <div className="table-panel">
                  <table className="custom-table" style={{ fontSize: "0.8rem" }}>
                    <thead>
                      <tr>
                        <th rowSpan={2}>단위과제</th>
                        <th rowSpan={2}>프로그램 ID</th>
                        <th rowSpan={2}>프로그램명</th>
                        <th rowSpan={2}>담당부서</th>
                        <th rowSpan={2}>담당연구원</th>
                        <th colSpan={4} style={{ textAlign: "center" }}>진행 단계(PDCA)</th>
                        <th rowSpan={2}>작업</th>
                      </tr>
                      <tr>
                        <th style={{ textAlign: "center", width: "50px" }}>P</th>
                        <th style={{ textAlign: "center", width: "50px" }}>D</th>
                        <th style={{ textAlign: "center", width: "50px" }}>C</th>
                        <th style={{ textAlign: "center", width: "50px" }}>A</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayProjects.flatMap((p) => p.units)
                        .filter((u) => assignFilterUnitId === "all" || u.id === assignFilterUnitId)
                        .sort((a, b) => {
                          if (a.id === "Common") return 1;
                          if (b.id === "Common") return -1;
                          return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
                        })
                        .flatMap((u) => {
                          return u.programs.map((prog) => {
                            let dept = "사업운영팀";
                            if (selectedYear === 1) {
                              if (["A1", "A2", "D4"].includes(u.id)) dept = "ECC센터";
                              else if (["B1", "B3", "C1", "C3"].includes(u.id)) dept = "ICC센터";
                              else if (["B2", "D1", "D3"].includes(u.id)) dept = "RCC센터";
                              else if (u.id === "C2") dept = "AID-X지원센터";
                              else if (u.id === "D2") dept = "울산늘봄누리센터";
                            } else {
                              if (["A1가", "A2", "A3"].includes(u.id)) dept = "ECC센터";
                              else if (u.id === "A1나") dept = "신산업특화센터";
                              else if (["B1", "B3", "B4"].includes(u.id)) dept = "ICC센터";
                              else if (u.id === "B2") dept = "AID-X지원센터";
                              else if (u.id === "C2") dept = "울산늘봄누리센터";
                              else if (["C1", "D1", "D2", "D3"].includes(u.id)) dept = "RCC센터";
                            }

                            return (
                              <tr key={prog.id}>
                                <td style={{ fontWeight: "700" }}>{u.id === "Common" ? "공통경비" : `${u.id}. ${u.title}`}</td>
                                <td style={{ fontFamily: "var(--font-data)", fontWeight: "700" }}>{prog.id}</td>
                                <td>{prog.title}</td>
                                <td style={{ color: "var(--accent-color)", fontWeight: "700" }}>{dept}</td>
                                <td>
                                  {currentRole.rank <= 2 ? (
                                    <select
                                      className="user-selector"
                                      style={{ width: "200px", padding: "0.2rem 0.4rem", fontSize: "0.75rem" }}
                                      value={prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : (prog.assignee || "")}
                                      onChange={(e) => handleAssignChange(u.id, prog.id, e.target.value)}
                                    >
                                      <option value="">미배정</option>
                                      {members
                                        .filter((m) => {
                                          if (m.role !== "연구원") return false;
                                          const currentAssignee = prog.assignees?.[selectedYear] || prog.assignee || "";
                                          const isCurrent = currentAssignee === `${m.name} ${m.grade}`;
                                          const isDeptMatch = m.dept === dept;
                                          if (!isCurrent && !isDeptMatch) return false;
                                          
                                          // 연차별 담당자는 당해 연도에 재직하고 있어야 함
                                          const startYear = 2024 + selectedYear;
                                          const endYear = 2025 + selectedYear;
                                          const yearStart = new Date(`${startYear}-03-01T00:00:00`);
                                          const yearEnd = new Date(`${endYear}-02-28T23:59:59`);
                                          
                                          const mStartStr = m.startDate || m.hireDate || "2025-03-01";
                                          const mStartDate = new Date(mStartStr);
                                          if (mStartDate > yearEnd) return false;
                                          
                                          if (m.endDate) {
                                            const mEndDate = new Date(m.endDate);
                                            if (mEndDate < yearStart) return false;
                                          }
                                          
                                          return true;
                                        })
                                        .map((m) => {
                                          const valueStr = `${m.name} ${m.grade}`;
                                          const labelStr = `${m.name} ${m.grade} (${m.dept})`;
                                          return (
                                            <option key={m.id} value={valueStr}>
                                              {labelStr}
                                            </option>
                                          );
                                        })}
                                    </select>
                                  ) : (
                                    <span>{(prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : prog.assignee) || "미배정"}</span>
                                  )}
                                </td>
                                <td style={{ textAlign: "center", color: prog.pdca.p === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.p}</td>
                                <td style={{ textAlign: "center", color: prog.pdca.d === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.d}</td>
                                <td style={{ textAlign: "center", color: prog.pdca.c === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.c}</td>
                                <td style={{ textAlign: "center", color: prog.pdca.a === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca.a}</td>
                                <td>
                                  {currentRole.rank <= 2 ? (
                                    <button
                                      className="btn-primary"
                                      style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem", borderRadius: "0.3rem" }}
                                      onClick={() => {
                                        setSelectedUnitId(u.id);
                                        setSelectedProgId(prog.id);
                                        setActiveTab("projects");
                                        setTimeout(() => {
                                          const el = document.getElementById("pdca-manager-section");
                                          if (el) el.scrollIntoView({ behavior: "smooth" });
                                        }, 100);
                                      }}
                                    >
                                      정보 등록
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: "0.7rem", color: "var(--text-secondary-dark)" }}>권한 없음</span>
                                  )}
                                </td>
                              </tr>
                            );
                          });
                        })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {mgmtSubTab === "approvals" && currentRole.rank <= 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--accent-color)" }}>회원현황</h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>
                  현재 ANCHOR 통합 대시보드 시스템에 가입되었거나 주소록에서 자동으로 연동된 재직 구성원 계정 현황 목록입니다.
                </p>
                <div className="table-panel" style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <table className="custom-table" style={{ fontSize: "0.75rem" }}>
                    <thead>
                      <tr>
                        <th>아이디</th>
                        <th>이름</th>
                        <th>역할</th>
                        <th>역할키</th>
                        <th>시작일</th>
                        <th style={{ width: "80px", textAlign: "center" }}>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registeredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: "center", color: "var(--text-secondary-dark)", padding: "2rem" }}>
                            등록된 회원 정보가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        registeredUsers.map((u) => {
                          const roleNames = {
                            ADMIN: "최고 관리자",
                            DIRECTOR: "사업단장",
                            HQ_HEAD: "본부장",
                            CENTER_ECC: "ECC센터장",
                            CENTER_SPECIAL: "신산업특화센터장",
                            TEAM_LEADER: "운영팀장",
                            RESEARCHER: "실무 연구원"
                          };
                          const cleanName = (u.name || "").split(" ")[0];
                          const isDemoId = ["admin", "director", "hq_head", "center_director", "team_leader", "researcher"].includes(u.id.toLowerCase());
                          const isDirectoryUser = (members || []).some(m => m.email && m.email.trim().toLowerCase() === u.id.trim().toLowerCase() && m.status !== "퇴직");
                          const isProtected = isDemoId || isDirectoryUser;

                          return (
                            <tr key={u.id}>
                              <td style={{ fontFamily: "var(--font-data)", fontWeight: "700" }}>{u.id}</td>
                              <td style={{ fontWeight: "700" }}>{cleanName}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    u.role_key === "ADMIN" || u.role_key === "DIRECTOR" || u.role_key === "HQ_HEAD"
                                      ? "badge-red"
                                      : u.role_key === "CENTER_ECC" || u.role_key === "CENTER_SPECIAL"
                                      ? "badge-blue"
                                      : u.role_key === "TEAM_LEADER"
                                      ? "badge-green"
                                      : "badge-gray"
                                  }`}
                                  style={{ fontSize: "0.65rem" }}
                                >
                                  {roleNames[u.role_key] || u.role_key}
                                </span>
                              </td>
                              <td style={{ fontFamily: "var(--font-data)" }}>{u.role_key}</td>
                              <td style={{ fontFamily: "var(--font-data)" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                              <td style={{ textAlign: "center" }}>
                                {!isProtected ? (
                                  <button
                                    className="btn-primary"
                                    style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem", borderRadius: "0.3rem", background: "var(--danger-color)", cursor: "pointer", border: "none" }}
                                    onClick={() => handleDeleteUser(u.id)}
                                  >
                                    삭제
                                  </button>
                                ) : (
                                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary-dark)" }}>
                                    {isDemoId ? "고정 계정" : "주소록 회원"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 탭 개편: 반응형 사이드 2분할 레이아웃 및 목표치/실적 미니 표 */}
        {activeTab === "kpis" && (
          <>
            {/* 성과지표 관리 탭: 전체 영역을 Fragment로 묶어 하단에 성과지표 전용 엑셀 업로더를 배치합니다. */}
            <div className="kpi-split-layout">
            {/* 좌측 성과지표 리스트 테이블 */}
            <div className="glass-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>성과지표(KPI) 통합 목록</h2>
                  {/* 자율 / 중점 성과지표 서브탭 제어기 */}
                  <div style={{ display: "flex", gap: "0.3rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color-dark)", padding: "0.25rem", borderRadius: "0.5rem", marginTop: "0.5rem", width: "fit-content" }}>
                    <button
                      onClick={() => {
                        setKpiSubTab("자율");
                        // 자율 탭에 해당하는 첫 번째 지표 자동 선택
                        const first = displayProjects.flatMap(p => p.units.flatMap(u => u.kpis)).find(k => k.type === "자율");
                        setSelectedKpi(first || null);
                      }}
                      style={{
                        border: "none",
                        padding: "0.3rem 0.8rem",
                        borderRadius: "0.35rem",
                        fontSize: "0.7rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        background: kpiSubTab === "자율" ? "var(--accent-color)" : "transparent",
                        color: kpiSubTab === "자율" ? "white" : "var(--text-secondary-dark)",
                        transition: "all 0.2s"
                      }}
                    >
                      (지자체)자율성과지표
                    </button>
                    <button
                      onClick={() => {
                        setKpiSubTab("중점");
                        // 중점 탭에 해당하는 첫 번째 지표 자동 선택
                        const first = displayProjects.flatMap(p => p.units.flatMap(u => u.kpis)).find(k => k.type === "중점");
                        setSelectedKpi(first || null);
                      }}
                      style={{
                        border: "none",
                        padding: "0.3rem 0.8rem",
                        borderRadius: "0.35rem",
                        fontSize: "0.7rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        background: kpiSubTab === "중점" ? "var(--accent-color)" : "transparent",
                        color: kpiSubTab === "중점" ? "white" : "var(--text-secondary-dark)",
                        transition: "all 0.2s"
                      }}
                    >
                      (대학)중점관리지표
                    </button>
                  </div>
                </div>
                

              </div>
              
              <div className="table-panel">
                <table className="custom-table" style={{ fontSize: "0.85rem" }}>
                  <thead>
                    <tr>
                      <th>지표 ID</th>
                      <th>지표명</th>
                      <th>유형</th>
                      <th>현재달성도</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const kpiMap = new Map();
                      displayProjects.forEach((p) => {
                        p.units.forEach((u) => {
                          u.kpis.forEach((k) => {
                            if (k.type === kpiSubTab) {
                              const nk = getNormalizedKpi(k, selectedYear);
                              kpiMap.set(nk.id, { k, nk });
                            }
                          });
                        });
                      });

                      const sortedKpis = Array.from(kpiMap.values()).sort((a, b) => {
                        const numA = parseInt(a.nk.id.replace("L-", ""), 10) || 0;
                        const numB = parseInt(b.nk.id.replace("L-", ""), 10) || 0;
                        return numA - numB;
                      });

                      return sortedKpis.map(({ k, nk }) => {
                        let rate = 0;
                        if (selectedYear === 1 && nk.id === "L-1") {
                          rate = 111.9;
                        } else if (selectedYear === 1 && nk.id === "L-2") {
                          rate = 687.8;
                        } else if (selectedYear === 1 && nk.id === "L-3") {
                          rate = 138.6;
                        } else if (selectedYear === 1 && nk.id === "L-4") {
                          rate = 146.7;
                        } else if (selectedYear === 1 && nk.id === "L-5") {
                          rate = 81.8;
                        } else if (selectedYear === 1 && nk.id === "L-6") {
                          rate = 103.3;
                        } else if (selectedYear === 1 && nk.id === "L-7") {
                          rate = 321.3;
                        } else if (selectedYear === 1 && nk.id === "L-8") {
                          rate = 134.0;
                        } else if (selectedYear === 1 && nk.id === "L-9") {
                          rate = 106.0;
                        } else if (selectedYear === 1 && nk.id === "L-10") {
                          rate = 128.5;
                        } else if (selectedYear === 1 && nk.id === "L-11") {
                          rate = 160.0;
                        } else if (selectedYear === 1 && nk.id === "L-12") {
                          rate = 114.6;
                        } else if (selectedYear === 1 && nk.id === "L-13") {
                          rate = 108.0;
                        } else if (selectedYear === 1 && nk.id === "L-14") {
                          rate = 500.0;
                        } else if (selectedYear === 1 && nk.id === "L-15") {
                          rate = 132.2;
                        } else if (selectedYear === 1 && nk.id === "L-16") {
                          rate = 123.3;
                        } else if (selectedYear === 1 && nk.id === "L-17") {
                          rate = 0.0;
                        } else if (selectedYear === 1 && nk.id === "L-18") {
                          rate = 176.5;
                        } else if (selectedYear === 1 && nk.id === "L-19") {
                          rate = 244.0;
                        } else if (selectedYear === 1 && nk.id === "L-20") {
                          rate = 202.5;
                        } else if (selectedYear === 1 && nk.id === "L-21") {
                          rate = 100.0;
                        } else if (selectedYear === 1 && nk.id === "L-22") {
                          rate = 175.0;
                        } else if (selectedYear === 1 && nk.id === "L-23") {
                          rate = 144.3;
                        } else if (selectedYear === 1 && nk.id === "L-24") {
                          rate = 138.3;
                        } else if (nk.subItems && nk.subItems.length > 0) {
                          let sumRate = 0;
                          nk.subItems.forEach((sub) => {
                            const yData = sub.years?.[selectedYear] || { target: 0, current: 0 };
                            sumRate += yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
                          });
                          rate = sumRate / nk.subItems.length;
                        } else {
                          rate = nk.target > 0 ? (nk.current / nk.target) * 100 : 0;
                        }
                        const isSelected = selectedKpi?.id === nk.id;
                        return (
                          <tr
                            key={nk.id}
                            onClick={() => setSelectedKpi(nk)}
                            style={{
                              cursor: "pointer",
                              background: isSelected ? "rgba(59,130,246,0.08)" : "inherit",
                              borderLeft: isSelected ? "4px solid var(--accent-color)" : "none",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <td style={{ fontFamily: "var(--font-data)", fontWeight: "700" }}>{nk.id}</td>
                            <td style={{ fontWeight: isSelected ? "700" : "normal" }}>{nk.name}</td>
                            <td>
                              <span className={`badge ${nk.type === "자율" ? "badge-blue" : "badge-yellow"}`}>
                                {nk.type}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <div style={{ width: "50px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                                  <div style={{ width: `${Math.min(rate, 100)}%`, height: "100%", background: rate >= 100 ? "var(--success-color)" : "var(--warning-color)" }} />
                                </div>
                                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-data)", color: rate >= 100 ? "var(--success-color)" : "inherit" }}>
                                  {rate.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 우측 성과지표 세부내용 상세 블록 (Sticky 고정 스크롤 효과) */}
            <div className="sticky-panel">
              <div className="glass-card" style={{ border: selectedKpi ? "1px solid var(--accent-color)" : "1px solid var(--border-color-dark)", minHeight: "360px" }}>
                {selectedKpi ? (() => {
                  const nk = getNormalizedKpi(selectedKpi, selectedYear);
                  return (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.75rem" }}>
                        <span className="badge badge-blue" style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}>
                          {nk.id}
                        </span>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "800" }}>{nk.name} 상세 명세</h3>
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                        <div>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>지표 정의</span>
                          <p style={{ fontSize: "0.85rem", fontWeight: "700", marginTop: "0.2rem", lineHeight: "1.4" }}>
                            {nk.description}
                          </p>
                        </div>

                        {/* 세부지표 목푯값 및 실적값을 보여주는 미니 표 추가 */}
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>지표 구성 세부항목 목표 대비 실적 표</span>
                            <span className="badge badge-yellow" style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem" }}>{selectedYear}차년도 세부지표</span>
                          </div>
                          <table className="mini-table" style={{ fontSize: "0.75rem" }}>
                            <thead>
                              <tr>
                                <th>세부 항목명</th>
                                <th style={{ textAlign: "right" }}>기준값</th>
                                <th style={{ textAlign: "right" }}>목푯값</th>
                                <th style={{ textAlign: "right" }}>현재실적</th>
                                <th style={{ textAlign: "right" }}>달성도</th>
                              </tr>
                            </thead>
                            <tbody>
                              {nk.subItems && nk.subItems.map((sub) => {
                                const yData = sub.years?.[selectedYear] || { target: 0, current: 0 };
                                const subRate = yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
                                const canEditTarget = currentRole.rank <= 4;
                                const cleanName = sub.name.replace(/\s*\(기준값:\s*\d+\)/, "");
                                return (
                                  <tr key={sub.id}>
                                    <td style={{ fontWeight: "700" }}>{cleanName}</td>
                                    <td style={{ textAlign: "right", color: "var(--text-secondary-dark)" }}>
                                      {sub.base !== undefined ? `${sub.base.toLocaleString()} ${sub.unit}` : "-"}
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.2rem" }}>
                                        <input
                                          type="number"
                                          step="any"
                                          className="user-selector"
                                          disabled={!canEditTarget}
                                          defaultValue={yData.target}
                                          onBlur={(e) => {
                                            if (!canEditTarget) return;
                                            const val = parseFloat(e.target.value);
                                            if (!isNaN(val)) {
                                              handleUpdateKpiValue(sub.id, "target", val);
                                            }
                                          }}
                                          style={{
                                            width: "55px",
                                            textAlign: "right",
                                            fontSize: "0.75rem",
                                            padding: "0.1rem 0.2rem",
                                            background: !canEditTarget ? "rgba(255,255,255,0.02)" : "#18181b",
                                            color: !canEditTarget ? "rgba(255,255,255,0.3)" : "white",
                                            border: "1px solid var(--border-color-dark)",
                                            borderRadius: "0.25rem",
                                            cursor: !canEditTarget ? "not-allowed" : "text"
                                          }}
                                        />
                                        <span style={{ fontSize: "0.7rem", color: "var(--text-secondary-dark)" }}>{sub.unit}</span>
                                      </div>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.2rem" }}>
                                        <input
                                          type="number"
                                          step="any"
                                          className="user-selector"
                                          defaultValue={yData.current}
                                          onBlur={(e) => {
                                            const val = parseFloat(e.target.value);
                                            if (!isNaN(val)) {
                                              handleUpdateKpiValue(sub.id, "current", val);
                                            }
                                          }}
                                          style={{
                                            width: "55px",
                                            textAlign: "right",
                                            fontSize: "0.75rem",
                                            padding: "0.1rem 0.2rem",
                                            background: "#18181b",
                                            color: "var(--accent-color)",
                                            border: "1px solid var(--border-color-dark)",
                                            borderRadius: "0.25rem"
                                          }}
                                        />
                                        <span style={{ fontSize: "0.7rem", color: "var(--text-secondary-dark)" }}>{sub.unit}</span>
                                      </div>
                                    </td>
                                    <td style={{ textAlign: "right", fontFamily: "var(--font-data)", fontWeight: "800", color: subRate >= 100 ? "var(--success-color)" : "var(--warning-color)" }}>
                                      {subRate.toFixed(1)}%
                                    </td>
                                  </tr>
                                );
                              })}
                              {(() => {
                                let totalKpiRate = 0;
                                if (selectedYear === 1 && nk.id === "L-1") {
                                  totalKpiRate = 111.9;
                                } else if (selectedYear === 1 && nk.id === "L-2") {
                                  totalKpiRate = 687.8;
                                } else if (selectedYear === 1 && nk.id === "L-3") {
                                  totalKpiRate = 138.6;
                                } else if (selectedYear === 1 && nk.id === "L-4") {
                                  totalKpiRate = 146.7;
                                } else if (selectedYear === 1 && nk.id === "L-5") {
                                  totalKpiRate = 81.8;
                                } else if (selectedYear === 1 && nk.id === "L-6") {
                                  totalKpiRate = 103.3;
                                } else if (selectedYear === 1 && nk.id === "L-7") {
                                  totalKpiRate = 321.3;
                                } else if (selectedYear === 1 && nk.id === "L-8") {
                                  totalKpiRate = 134.0;
                                } else if (selectedYear === 1 && nk.id === "L-9") {
                                  totalKpiRate = 106.0;
                                } else if (selectedYear === 1 && nk.id === "L-10") {
                                  totalKpiRate = 128.5;
                                } else if (selectedYear === 1 && nk.id === "L-11") {
                                  totalKpiRate = 160.0;
                                } else if (selectedYear === 1 && nk.id === "L-12") {
                                  totalKpiRate = 114.6;
                                } else if (selectedYear === 1 && nk.id === "L-13") {
                                  totalKpiRate = 108.0;
                                } else if (selectedYear === 1 && nk.id === "L-14") {
                                  totalKpiRate = 500.0;
                                } else if (selectedYear === 1 && nk.id === "L-15") {
                                  totalKpiRate = 132.2;
                                } else if (selectedYear === 1 && nk.id === "L-16") {
                                  totalKpiRate = 123.3;
                                } else if (selectedYear === 1 && nk.id === "L-17") {
                                  totalKpiRate = 0.0;
                                } else if (selectedYear === 1 && nk.id === "L-18") {
                                  totalKpiRate = 176.5;
                                } else if (selectedYear === 1 && nk.id === "L-19") {
                                  totalKpiRate = 244.0;
                                } else if (selectedYear === 1 && nk.id === "L-20") {
                                  totalKpiRate = 202.5;
                                } else if (selectedYear === 1 && nk.id === "L-21") {
                                  totalKpiRate = 100.0;
                                } else if (selectedYear === 1 && nk.id === "L-22") {
                                  totalKpiRate = 175.0;
                                } else if (selectedYear === 1 && nk.id === "L-23") {
                                  totalKpiRate = 144.3;
                                } else if (selectedYear === 1 && nk.id === "L-24") {
                                  totalKpiRate = 138.3;
                                } else if (nk.subItems && nk.subItems.length > 0) {
                                  let sumKpiRate = 0;
                                  nk.subItems.forEach((sub) => {
                                    const yData = sub.years?.[selectedYear] || { target: 0, current: 0 };
                                    sumKpiRate += yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
                                  });
                                  totalKpiRate = sumKpiRate / nk.subItems.length;
                                }
                                const finalCapRate = Math.min(totalKpiRate, 100.0);
                                return (
                                  <tr style={{ background: "rgba(59,130,246,0.06)", borderTop: "1px solid var(--border-color-dark)" }}>
                                    <td colSpan={2} style={{ fontWeight: "800" }}>종합 지표 달성도 (Total)</td>
                                    <td style={{ textAlign: "right", fontFamily: "var(--font-data)" }}>100.0%</td>
                                    <td style={{ textAlign: "right", fontFamily: "var(--font-data)", color: "var(--accent-color)", fontWeight: "700" }}>{totalKpiRate.toFixed(1)}%</td>
                                    <td style={{ textAlign: "right", fontFamily: "var(--font-data)", fontWeight: "900", color: finalCapRate >= 100 ? "var(--success-color)" : "var(--warning-color)" }}>
                                      {finalCapRate.toFixed(1)}%
                                    </td>
                                  </tr>
                                );
                              })()}
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.4rem" }}>성과지표 산출공식</span>
                          <RenderLatexFormula formula={nk.formula} />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.8rem" }}>
                          <div>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary-dark)" }}>주관 부서</span>
                            <p style={{ fontWeight: "700" }}>{nk.owner}</p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary-dark)" }}>측정 주기</span>
                            <p style={{ fontWeight: "700" }}>{nk.cycle}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })() : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "320px", color: "var(--text-secondary-dark)", gap: "0.5rem" }}>
                    <HelpCircle size={32} style={{ color: "var(--accent-color)" }} />
                    <span style={{ fontSize: "0.8rem" }}>좌측 목록의 성과지표 행을 클릭하시면 상세 비교 정보가 나타납니다.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* 성과지표 목표 및 실적 업데이트 전용 엑셀 업로더 (mode="KPI") */}
          <ExcelUploader mode="KPI" onUpdateData={handleUpdateData} projects={displayProjects} selectedYear={selectedYear} />
        </>
        )}

        {activeTab === "progress" && (
          <ProgramProgressManager
            projects={displayProjects}
            selectedYear={selectedYear}
          />
        )}

        {activeTab === "budget-items" && (
          <BudgetItemsManager
            projects={displayProjects}
            currentRole={currentRole}
            onUpdateBudgetDetails={handleUpdateBudgetDetails}
            selectedYear={selectedYear}
          />
        )}
      </main>

      {isMemberModalOpen && editingMember && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!editingMember.name || !editingMember.email) {
                alert("성명과 이메일은 필수 입력 사항입니다.");
                return;
              }
              if (editingMember.id) {
                setMembers(members.map((m) => (m.id === editingMember.id ? editingMember : m)));
              } else {
                const newMember = { ...editingMember, id: `m-${Date.now()}` };
                setMembers([...members, newMember]);
              }
              setIsMemberModalOpen(false);
              setEditingMember(null);
            }}
            className="glass-card"
            style={{ width: "480px", maxHeight: "85vh", overflowY: "auto", padding: "2rem", border: "1px solid var(--border-color-dark)", background: "var(--bg-dark)", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
          >
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem" }}>
              {editingMember.id ? "구성원 정보 수정" : "신규 구성원 등록"}
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.8rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>성명 *</label>
                  <input
                    type="text"
                    required
                    className="user-selector"
                    style={{ width: "100%", padding: "0.4rem", color: "white" }}
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>소속 부서</label>
                  <select
                    className="user-selector"
                    style={{ width: "100%", padding: "0.4rem" }}
                    value={editingMember.dept}
                    onChange={(e) => setEditingMember({ ...editingMember, dept: e.target.value })}
                  >
                    <option value="-">-</option>
                    <option value="운영본부">운영본부</option>
                    <option value="사업운영팀">사업운영팀</option>
                    <option value="ECC센터">ECC센터</option>
                    <option value="신산업특화센터">신산업특화센터</option>
                    <option value="ICC센터">ICC센터</option>
                    <option value="AID-X지원센터">AID-X지원센터</option>
                    <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                    <option value="RCC센터">RCC센터</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>직책(역할)</label>
                  <select
                    className="user-selector"
                    style={{ width: "100%", padding: "0.4rem" }}
                    value={editingMember.role}
                    onChange={(e) => {
                      const nextRole = e.target.value;
                      let nextGrade = "연구원";
                      if (["사업단장", "본부장", "센터장", "팀장교수"].includes(nextRole)) {
                        nextGrade = "정교수";
                      } else if (nextRole === "운영팀장") {
                        nextGrade = "부장";
                      }
                      setEditingMember({ ...editingMember, role: nextRole, grade: nextGrade });
                    }}
                  >
                    <option value="사업단장">사업단장</option>
                    <option value="본부장">본부장</option>
                    <option value="센터장">센터장</option>
                    <option value="운영팀장">운영팀장</option>
                    <option value="팀장교수">팀장교수</option>
                    <option value="연구원">연구원</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>직급/직위</label>
                  <select
                    className="user-selector"
                    style={{ width: "100%", padding: "0.4rem" }}
                    value={editingMember.grade}
                    onChange={(e) => setEditingMember({ ...editingMember, grade: e.target.value })}
                  >
                    {["사업단장", "본부장", "센터장", "팀장교수"].includes(editingMember.role) ? (
                      <>
                        <option value="정교수">정교수</option>
                        <option value="부교수">부교수</option>
                        <option value="조교수">조교수</option>
                      </>
                    ) : (
                      <>
                        <option value="부장">부장</option>
                        <option value="차장">차장</option>
                        <option value="과장">과장</option>
                        <option value="대리">대리</option>
                        <option value="사원">사원</option>
                        <option value="책임연구원">책임연구원</option>
                        <option value="선임연구원">선임연구원</option>
                        <option value="연구원">연구원</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>이메일 *</label>
                <input
                  type="email"
                  required
                  className="user-selector"
                  style={{ width: "100%", padding: "0.4rem", color: "white" }}
                  value={editingMember.email}
                  onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>교내 전화번호</label>
                  <input
                    type="text"
                    className="user-selector"
                    style={{ width: "100%", padding: "0.4rem", color: "white" }}
                    placeholder="052-230-XXXX"
                    value={editingMember.phoneOffice}
                    onChange={(e) => setEditingMember({ ...editingMember, phoneOffice: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>휴대전화번호</label>
                  <input
                    type="text"
                    className="user-selector"
                    style={{ width: "100%", padding: "0.4rem", color: "white" }}
                    placeholder="010-XXXX-XXXX"
                    value={editingMember.phoneMobile}
                    onChange={(e) => setEditingMember({ ...editingMember, phoneMobile: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem" }}>
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingMember.status !== "퇴직"}
                  onChange={(e) => {
                    const isActive = e.target.checked;
                    setEditingMember({
                      ...editingMember,
                      status: isActive ? "재직중" : "퇴직",
                      endDate: isActive ? "" : (editingMember.endDate || "")
                    });
                  }}
                />
                <label htmlFor="is_active" style={{ fontWeight: "700", cursor: "pointer" }}>현재 재직중</label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>시작일</label>
                  <input
                    type="date"
                    className="user-selector"
                    style={{ width: "100%", padding: "0.4rem", color: "white" }}
                    value={editingMember.startDate || editingMember.hireDate || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, startDate: e.target.value, hireDate: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>종료일</label>
                  <input
                    type="date"
                    className="user-selector"
                    style={{ width: "100%", padding: "0.4rem", color: "white" }}
                    disabled={editingMember.status !== "퇴직"}
                    value={editingMember.endDate || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
              <button
                type="button"
                className="btn-primary"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", padding: "0.4rem 1rem", borderRadius: "0.35rem", fontSize: "0.75rem" }}
                onClick={() => {
                  setIsMemberModalOpen(false);
                  setEditingMember(null);
                }}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: "0.4rem 1rem", borderRadius: "0.35rem", fontSize: "0.75rem" }}
              >
                저장
              </button>
            </div>
          </form>
        </div>
      )}

      {isPasswordModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <form
            onSubmit={handlePasswordChange}
            className="glass-card"
            style={{ width: "400px", padding: "2rem", border: "1px solid var(--border-color-dark)", background: "var(--bg-dark)", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
          >
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <LockIcon size={20} style={{ color: "var(--accent-color)" }} />
              <span>개인정보 관리 (비밀번호 변경)</span>
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.8rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700", color: "var(--text-secondary-dark)" }}>아이디 (이메일)</label>
                <input
                  type="text"
                  disabled
                  className="user-selector"
                  style={{ width: "100%", padding: "0.4rem", color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.02)" }}
                  value={currentUser.id}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700", color: "var(--text-secondary-dark)" }}>성명</label>
                <input
                  type="text"
                  disabled
                  className="user-selector"
                  style={{ width: "100%", padding: "0.4rem", color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.02)" }}
                  value={currentUser.name}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>현재 비밀번호 *</label>
                <input
                  type="password"
                  required
                  className="user-selector"
                  style={{ width: "100%", padding: "0.4rem", color: "white" }}
                  placeholder="현재 비밀번호를 입력해 주세요"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>새 비밀번호 *</label>
                <input
                  type="password"
                  required
                  className="user-selector"
                  style={{ width: "100%", padding: "0.4rem", color: "white" }}
                  placeholder="새 비밀번호를 입력해 주세요"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>새 비밀번호 확인 *</label>
                <input
                  type="password"
                  required
                  className="user-selector"
                  style={{ width: "100%", padding: "0.4rem", color: "white" }}
                  placeholder="새 비밀번호를 한 번 더 입력해 주세요"
                  value={confirmNewPw}
                  onChange={(e) => setConfirmNewPw(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
              <button
                type="button"
                className="btn-primary"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", padding: "0.4rem 1rem", borderRadius: "0.35rem", fontSize: "0.75rem" }}
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setCurrentPw("");
                  setNewPw("");
                  setConfirmNewPw("");
                }}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: "0.4rem 1rem", borderRadius: "0.35rem", fontSize: "0.75rem" }}
              >
                변경하기
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
