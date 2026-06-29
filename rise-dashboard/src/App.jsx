import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import KPIOverview from "./components/KPIOverview";
import ExcelUploader from "./components/ExcelUploader";
import PDCAManager from "./components/PDCAManager";
import BudgetItemsManager from "./components/BudgetItemsManager";
import ProgramProgressManager from "./components/ProgramProgressManager";
import AuthManager from "./components/AuthManager";
import { initialProjectsData, userRoles } from "./data/mockData";
import { Sun, Moon, LogOut, HelpCircle, ArrowUpRight } from "lucide-react";
import { supabase } from "./supabaseClient";
import "./styles/dashboard.css";

// RISE 사업단 초기 구성원 주소록 명단 데이터셋
const INITIAL_MEMBERS = [
  // 교수 및 리더진
  { id: "m-01", name: "송경영", role: "사업단장", grade: "전임 교수", dept: "사업운영팀", phoneOffice: "052-279-3154", phoneMobile: "010-7627-7123", email: "kysong@uc.ac.kr", room: "교수연구실/E1-307", hireDate: "2026-03-01" },
  { id: "m-02", name: "김현수", role: "본부장", grade: "전임 교수", dept: "AID-X지원센터", phoneOffice: "052-279-3122", phoneMobile: "010-4628-7963", email: "hskim3@uc.ac.kr", room: "교수연구실/E2-414", hireDate: "2026-03-01" },
  { id: "m-03", name: "심현미", role: "운영팀장", grade: "행정 부장", dept: "사업운영팀", phoneOffice: "052-230-0441", phoneMobile: "010-6554-8359", email: "hmsim@uc.ac.kr", room: "산학협력단/S-203", hireDate: "2026-03-01" },
  { id: "m-04", name: "이동은", role: "센터장", grade: "전임 교수", dept: "ECC센터", phoneOffice: "052-230-0111", phoneMobile: "010-1234-5678", email: "delee@uc.ac.kr", room: "교수연구실/E2-201", hireDate: "2026-03-01" },
  { id: "m-05", name: "김기범", role: "센터장", grade: "전임 교수", dept: "ICC센터", phoneOffice: "052-230-0222", phoneMobile: "010-2345-6789", email: "kbkim@uc.ac.kr", room: "교수연구실/E2-301", hireDate: "2026-03-01" },
  { id: "m-06", name: "현용환", role: "센터장", grade: "전임 교수", dept: "RCC센터", phoneOffice: "052-230-0333", phoneMobile: "010-3456-7890", email: "yhhyun@uc.ac.kr", room: "교수연구실/E2-401", hireDate: "2026-03-01" },
  { id: "m-07", name: "홍광표", role: "센터장", grade: "전임 교수", dept: "울산늘봄누리센터", phoneOffice: "052-230-0444", phoneMobile: "010-4567-8901", email: "gphong@uc.ac.kr", room: "교수연구실/E2-501", hireDate: "2026-03-01" },
  
  // 팀장교수
  { id: "m-08", name: "장광일", role: "팀장교수", grade: "전임 교수", dept: "ECC센터", phoneOffice: "052-230-0112", phoneMobile: "010-5678-9012", email: "kijang@uc.ac.kr", room: "교수연구실/E2-202", hireDate: "2026-03-01" },
  { id: "m-09", name: "고형석", role: "팀장교수", grade: "전임 교수", dept: "ECC센터", phoneOffice: "052-230-0113", phoneMobile: "010-6789-0123", email: "hsko@uc.ac.kr", room: "교수연구실/E2-203", hireDate: "2026-03-01" },
  { id: "m-10", name: "양승호", role: "팀장교수", grade: "전임 교수", dept: "ECC센터", phoneOffice: "052-230-0114", phoneMobile: "010-7890-1234", email: "shyang@uc.ac.kr", room: "교수연구실/E2-204", hireDate: "2026-03-01" },
  { id: "m-11", name: "김산", role: "팀장교수", grade: "전임 교수", dept: "ICC센터", phoneOffice: "052-230-0223", phoneMobile: "010-8901-2345", email: "skim@uc.ac.kr", room: "교수연구실/E2-302", hireDate: "2026-03-01" },
  { id: "m-12", name: "한미라", role: "팀장교수", grade: "전임 교수", dept: "ICC센터", phoneOffice: "052-230-0224", phoneMobile: "010-9012-3456", email: "mrhan@uc.ac.kr", room: "교수연구실/E2-303", hireDate: "2026-03-01" },
  { id: "m-13", name: "김민경", role: "팀장교수", grade: "전임 교수", dept: "RCC센터", phoneOffice: "052-230-0334", phoneMobile: "010-0123-4567", email: "mkkim@uc.ac.kr", room: "교수연구실/E2-402", hireDate: "2026-03-01" },
  { id: "m-14", name: "이한도", role: "팀장교수", grade: "전임 교수", dept: "RCC센터", phoneOffice: "052-230-0335", phoneMobile: "010-1234-8765", email: "hdlee@uc.ac.kr", room: "교수연구실/E2-403", hireDate: "2026-03-01" },
  { id: "m-15", name: "이상현", role: "팀장교수", grade: "전임 교수", dept: "RCC센터", phoneOffice: "052-230-0336", phoneMobile: "010-2345-9876", email: "shlee@uc.ac.kr", room: "교수연구실/E2-404", hireDate: "2026-03-01" },
  { id: "m-16", name: "이정준", role: "팀장교수", grade: "전임 교수", dept: "AID-X지원센터", phoneOffice: "052-230-0445", phoneMobile: "010-3456-0987", email: "jjlee@uc.ac.kr", room: "교수연구실/E2-502", hireDate: "2026-03-01" },

  // 실무 연구원 (등급/직위 3구분 적용)
  { id: "m-17", name: "이현섭", role: "연구원", grade: "책임연구원", dept: "RCC센터", phoneOffice: "052-230-0417", phoneMobile: "010-8252-1151", email: "mogern1@uc.ac.kr", room: "연구원실/R-101", hireDate: "2026-03-01" },
  { id: "m-18", name: "이은주", role: "연구원", grade: "선임연구원", dept: "ECC센터", phoneOffice: "052-230-0414", phoneMobile: "010-4026-3850", email: "ejlee7@uc.ac.kr", room: "연구원실/E-101", hireDate: "2026-03-01" },
  { id: "m-19", name: "이정은", role: "연구원", grade: "선임연구원", dept: "ICC센터", phoneOffice: "052-279-3305", phoneMobile: "010-3435-6878", email: "lje6878@uc.ac.kr", room: "연구원실/I-101", hireDate: "2026-03-01" },
  { id: "m-20", name: "임은애", role: "연구원", grade: "선임연구원", dept: "AID-X지원센터", phoneOffice: "052-279-3319", phoneMobile: "010-4595-5406", email: "jslover85@uc.ac.kr", room: "연구원실/A-101", hireDate: "2026-03-01" },
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
  { id: "m-34", name: "서은지", role: "연구원", grade: "연구원", dept: "AID-X지원센터", phoneOffice: "052-279-3220", phoneMobile: "010-3294-8295", email: "ajaeunji@uc.ac.kr", room: "연구원실/A-102", hireDate: "2026-03-01" },
  { id: "m-35", name: "채민지", role: "연구원", grade: "연구원", dept: "AID-X지원센터", phoneOffice: "052-279-3185", phoneMobile: "010-7682-6864", email: "minji6843@uc.ac.kr", room: "연구원실/A-103", hireDate: "2026-03-01" },
  { id: "m-36", name: "김나희", role: "연구원", grade: "연구원", dept: "신산업특화센터", phoneOffice: "052-230-0709", phoneMobile: "010-4363-7319", email: "nhkim2@uc.ac.kr", room: "센터실/N-101", hireDate: "2026-03-01" },
  { id: "m-37", name: "정호성", role: "연구원", grade: "연구원", dept: "신산업특화센터", phoneOffice: "052-230-0708", phoneMobile: "010-9208-7849", email: "jhsung@uc.ac.kr", room: "센터실/N-102", hireDate: "2026-03-01" },
  { id: "m-38", name: "김래림", role: "연구원", grade: "연구원", dept: "사업운영팀", phoneOffice: "052-230-0529", phoneMobile: "010-5246-9520", email: "rrkim@uc.ac.kr", room: "운영팀실/S-206", hireDate: "2026-03-01" },
  { id: "m-39", name: "박언주", role: "연구원", grade: "연구원", dept: "사업운영팀", phoneOffice: "052-230-0443", phoneMobile: "010-2541-5992", email: "ejpark@uc.ac.kr", room: "운영팀실/S-207", hireDate: "2026-03-01" },
  { id: "m-40", name: "이규상", role: "연구원", grade: "연구원", dept: "사업운영팀", phoneOffice: "052-230-0442", phoneMobile: "010-2402-1649", email: "leegyu@uc.ac.kr", room: "운영팀실/S-208", hireDate: "2026-03-01" },
  { id: "m-41", name: "김예지", role: "연구원", grade: "연구원", dept: "울산늘봄누리센터", phoneOffice: "052-230-0454", phoneMobile: "010-9778-1705", email: "limited0517@uc.ac.kr", room: "연구원실/N-104", hireDate: "2026-03-01" },
  { id: "m-42", name: "최주명", role: "연구원", grade: "연구원", dept: "울산늘봄누리센터", phoneOffice: "052-230-0419", phoneMobile: "010-9385-5959", email: "jmchoi@uc.ac.kr", room: "연구원실/N-105", hireDate: "2026-03-01" }
];

// 백만원 단위 포맷팅 헬퍼 함수
const formatToMillionWon = (value) => {
  if (value === undefined || value === null || isNaN(value)) return "0";
  return Math.round(value / 1000000).toLocaleString();
};

// 5개년 연쇄 잔액 이월(Carry Over) 계산 함수
function recalculateCarryOver(years) {
  // 1차년도 잔액 -> 2차년도 이월
  const balanceY1 = Math.max(0, ((years[1].budget_main || 0) + (years[1].budget_carry || 0)) - ((years[1].spent_main || 0) + (years[1].spent_carry || 0)));
  years[2].budget_carry = balanceY1;

  // 2차년도 잔액 -> 3차년도 이월
  const balanceY2 = Math.max(0, ((years[2].budget_main || 0) + (years[2].budget_carry || 0)) - ((years[2].spent_main || 0) + (years[2].spent_carry || 0)));
  years[3].budget_carry = balanceY2;

  // 3차년도 잔액 -> 4차년도 이월
  const balanceY3 = Math.max(0, ((years[3].budget_main || 0) + (years[3].budget_carry || 0)) - ((years[3].spent_main || 0) + (years[3].spent_carry || 0)));
  years[4].budget_carry = balanceY3;

  // 4차년도 잔액 -> 5차년도 이월
  const balanceY4 = Math.max(0, ((years[4].budget_main || 0) + (years[4].budget_carry || 0)) - ((years[4].spent_main || 0) + (years[4].spent_carry || 0)));
  years[5].budget_carry = balanceY4;
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
          // 1차년도 본예산은 2차년도 본예산의 0.9배
          const budgetMain = Math.round((u.budget_2026 || 0) * 0.9);
          // 1차년도 잔액이 2차년도 이월예산(budget_2025_carry)과 일치하도록 집행액 역산
          const spentMain = Math.max(0, budgetMain - (u.budget_2025_carry || 0));
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
      const newPrograms = u.programs.map((prog) => {
        const progYears = {};
        [1, 2, 3, 4, 5].forEach((yr) => {
          let budgetMain = 0;
          let spentMain = 0;
          let budgetCarry = 0;
          let spentCarry = 0;

          if (yr === 2) {
            budgetMain = prog.budget_2026 || 0;
            spentMain = prog.spent_2026 || 0;
            budgetCarry = prog.budget_2025_carry || 0;
            spentCarry = prog.spent_2025_carry || 0;
          } else if (yr === 1) {
            budgetMain = Math.round((prog.budget_2026 || 0) * 0.9);
            spentMain = Math.max(0, budgetMain - (prog.budget_2025_carry || 0));
            budgetCarry = 0;
            spentCarry = 0;
          } else {
            const factor = yr === 3 ? 1.1 : yr === 4 ? 1.2 : 1.3;
            budgetMain = Math.round((prog.budget_2026 || 0) * factor);
            spentMain = 0;
            budgetCarry = 0;
            spentCarry = 0;
          }

          // 재원 다변화 디폴트 배정 규칙:
          // 특정 외부위탁 성격의 프로그램(ID의 끝이 -2이거나, 명칭에 '위탁', '협력', '외부'가 들어가는 경우)은 '외부사업비'로 100% 배정
          // 그 외 일반 앵커 본사업은 국고 50%, 시비 50% 분할 매칭
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

          // 집행액(spent)도 배정 비율에 따라 배분
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

          // 이월예산(carry) 국고/시비/외부 배분
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

            // 세부 재원 예산/집행 필드
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

        // recalculateCarryOver 실행 후 갱신된 이월예산(budget_carry)에 맞게 세부 이월액 재조정
        [1, 2, 3, 4, 5].forEach((yr) => {
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
          // P 단계 기본 기획 필드 추가
          timeline: prog.timeline || "",
          targetAudience: prog.targetAudience || "",
          coopDept: prog.coopDept || "",
          // A 단계 환류 필드 추가
          evalType: prog.evalType || "우수", // "우수" | "미흡"
          excellent: prog.excellent || "",
          improvePlan: prog.improvePlan || "",
          deficiency: prog.deficiency || "",
          actionItem: prog.actionItem || ""
        };
      });

      // 3. 비목별 예산 다년도 맵핑
      const newBudgetDetails = {};
      Object.keys(u.budgetDetails || {}).forEach((key) => {
        const b = u.budgetDetails[key];
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

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [projects, setProjects] = useState(() => formatDataToMultiYear(initialProjectsData));
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(true);

  // 사업단 구성원 관리 및 서브탭 상태
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [mgmtSubTab, setMgmtSubTab] = useState("members"); // "members", "programs", "approvals"
  const [projectsSubTab, setProjectsSubTab] = useState("unit_status"); // "unit_status" (단위과제 집행현황) 또는 "program_mgmt" (프로그램 관리)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null); // 추가/수정용 임시 객체

  // Supabase 가입 승인 대기 목록 상태
  const [pendingUsers, setPendingUsers] = useState([]);

  // 가입 승인 대기자 로드 함수
  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("rise_users")
        .select("id, name, role_key, created_at")
        .eq("approved", false);
      if (!error && data) {
        setPendingUsers(data);
      }
    } catch (err) {
      console.error("Fetch pending users error:", err);
    }
  };

  // 가입 승인 실행 함수
  const handleApproveUser = async (userId) => {
    try {
      const { error } = await supabase
        .from("rise_users")
        .update({ approved: true })
        .eq("id", userId);
      
      if (error) {
        alert("승인 처리 중 데이터베이스 에러가 발생했습니다.");
      } else {
        alert("성공적으로 가입 승인이 완료되었습니다!");
        fetchPendingUsers(); // 목록 새로고침
      }
    } catch (err) {
      console.error("Approve user error:", err);
    }
  };

  // 관리자 탭 활성화 시 또는 주기적으로 대기 목록 로드
  useEffect(() => {
    if (activeTab === "management" && currentUser && currentUser.role?.rank <= 2) {
      fetchPendingUsers();
    }
  }, [activeTab, currentUser]);

  // 성과지표 상세 조회용 상태 및 다년도 성과관리 연도 선택 상태
  const [selectedKpi, setSelectedKpi] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2);
  const [kpiSubTab, setKpiSubTab] = useState("자율"); // "자율" ((지자체)자율성과지표) 또는 "중점" ((대학)중점관리지표)
  const [selectedUnitId, setSelectedUnitId] = useState("A-1-가");
  const [selectedProgId, setSelectedProgId] = useState(null);

  // 로컬스토리지에서 세션 확인 및 테마 설정
  useEffect(() => {
    const sessionUser = localStorage.getItem("rise_logged_in_user");
    if (sessionUser) {
      setCurrentUser(JSON.parse(sessionUser));
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
        .flatMap((p) => p.units.flatMap((u) => u.kpis))
        .find((k) => k.type === kpiSubTab);
      
      // 검색된 첫 번째 지표가 있으면 자동으로 조회 대상으로 설정하고, 없으면 null로 초기화합니다.
      setSelectedKpi(firstKpi || null);
    }
  }, [activeTab, kpiSubTab, projects]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem("rise_logged_in_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("rise_logged_in_user");
  };

  // 엑셀 업로드로 데이터 실시간 갱신 (본사업비/이월비 구분 갱신 및 다년도 연쇄 이월 반영)
  const handleUpdateData = (excelJson, type) => {
    setProjects((prevProjects) => {
      const updated = JSON.parse(JSON.stringify(prevProjects));

      excelJson.forEach((row) => {
        if (type === "BUDGET") {
          const progId = row["프로그램ID"];
          const spentMain = parseInt(row["2026년본사업비_집행"], 10);
          const spentCarry = parseInt(row["2025년이월비_집행"], 10);
          
          if (progId) {
            updated.forEach((p) => {
              p.units.forEach((u) => {
                u.programs.forEach((prog) => {
                  if (prog.id === progId) {
                    const py = prog.years[selectedYear];
                    if (py) {
                      if (!isNaN(spentMain)) {
                        py.spent_main = Math.min(spentMain, py.budget_main || 0);
                      }
                      if (!isNaN(spentCarry)) {
                        py.spent_carry = Math.min(spentCarry, py.budget_carry || 0);
                      }
                      // 프로그램의 이월 재계산
                      recalculateCarryOver(prog.years);
                    }
                  }
                });
                
                const progSpentTotalMain = u.programs.reduce((sum, pr) => sum + (pr.years[selectedYear]?.spent_main || 0), 0);
                const progSpentTotalCarry = u.programs.reduce((sum, pr) => sum + (pr.years[selectedYear]?.spent_carry || 0), 0);
                
                const targetDetail = u.budgetDetails["교육∙연구 프로그램 개발∙운영비"];
                if (targetDetail && targetDetail.years[selectedYear]) {
                  targetDetail.years[selectedYear].spent_main = Math.min(progSpentTotalMain, targetDetail.years[selectedYear].budget_main || 0);
                  targetDetail.years[selectedYear].spent_carry = Math.min(progSpentTotalCarry, targetDetail.years[selectedYear].budget_carry || 0);
                }

                // 비목별 이월 재계산
                Object.keys(u.budgetDetails).forEach(key => {
                  recalculateCarryOver(u.budgetDetails[key].years);
                });

                if (u.years[selectedYear]) {
                  u.years[selectedYear].spent_main = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years[selectedYear]?.spent_main || 0), 0);
                  u.years[selectedYear].spent_carry = Object.values(u.budgetDetails).reduce((sum, b) => sum + (b.years[selectedYear]?.spent_carry || 0), 0);
                }
                
                // 단위과제 이월 재계산
                recalculateCarryOver(u.years);
              });
            });
          }
        } else if (type === "KPI") {
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
        }
      });

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
                  // P단계 예산 배정액 세부 재원 갱신
                  if (updatedFields.budget_national !== undefined) py.budget_national = updatedFields.budget_national;
                  if (updatedFields.budget_city !== undefined) py.budget_city = updatedFields.budget_city;
                  if (updatedFields.budget_external !== undefined) py.budget_external = updatedFields.budget_external;
                  
                  // 세부 재원 예산의 합으로 총 본예산(budget_main) 동기화
                  py.budget_main = (py.budget_national || 0) + (py.budget_city || 0) + (py.budget_external || 0);

                  // D단계 집행액 세부 재원 갱신
                  if (updatedFields.spent_national !== undefined) py.spent_national = Math.min(updatedFields.spent_national, py.budget_national || 0);
                  if (updatedFields.spent_city !== undefined) py.spent_city = Math.min(updatedFields.spent_city, py.budget_city || 0);
                  if (updatedFields.spent_external !== undefined) py.spent_external = Math.min(updatedFields.spent_external, py.budget_external || 0);
                  
                  // 세부 재원 집행액의 합으로 총 본집행액(spent_main) 동기화
                  py.spent_main = (py.spent_national || 0) + (py.spent_city || 0) + (py.spent_external || 0);

                  // 비목별 이원화 예산 갱신
                  if (updatedFields.budget_categories !== undefined) {
                    py.budget_categories = updatedFields.budget_categories;
                  }
                }
                
                // 프로그램 5개년 이월 잔액 재계산
                recalculateCarryOver(prog.years);

                // 이월비 결과에 맞춰 세부 재원의 이월 배정액 비율 재조정
                [1, 2, 3, 4, 5].forEach((yr) => {
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
                });
              }
            });
            
            // 해당 단위과제의 프로그램 집행액 합산을 비목(교육∙연구 프로그램 개발∙운영비)에 동적으로 반영
            const progSpentTotalMain = u.programs.reduce((sum, pr) => sum + (pr.years[selectedYear]?.spent_main || 0), 0);
            const progSpentTotalCarry = u.programs.reduce((sum, pr) => sum + (pr.years[selectedYear]?.spent_carry || 0), 0);
            
            const targetDetail = u.budgetDetails["교육∙연구 프로그램 개발∙운영비"];
            if (targetDetail && targetDetail.years[selectedYear]) {
              targetDetail.years[selectedYear].spent_main = Math.min(progSpentTotalMain, targetDetail.years[selectedYear].budget_main || 0);
              targetDetail.years[selectedYear].spent_carry = Math.min(progSpentTotalCarry, targetDetail.years[selectedYear].budget_carry || 0);
            }
            
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
                prog.assignee = newAssignee;
              }
            });
          }
        });
      });
      return updated;
    });
  };

  if (!currentUser) {
    return <AuthManager onLoginSuccess={handleLoginSuccess} />;
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
        />
        <div style={{ padding: "0 1.5rem 1.5rem 1.5rem", background: "var(--panel-bg-dark)", borderRight: "1px solid var(--border-color-dark)" }} className="light-mode-logout-bg">
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
            <p>울산과학대학교 {selectedYear}차년도 사업 예산 관리 및 성과 실증 시스템</p>
          </div>

          {/* 전역 연도 선택 컨트롤러 */}
          <div style={{ display: "flex", gap: "0.25rem", background: "rgba(255, 255, 255, 0.03)", padding: "0.25rem", borderRadius: "2rem", border: "1px solid var(--border-color-dark)" }}>
            {[1, 2, 3, 4, 5].map((yr) => (
              <button
                key={yr}
                onClick={() => {
                  setSelectedYear(yr);
                  setSelectedKpi(null);
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
              반갑습니다, <strong>{currentUser.name}</strong> 님
            </span>
            <button className="theme-toggle-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div>
            <KPIOverview projects={projects} currentRole={currentRole} selectedYear={selectedYear} />
            <ExcelUploader onUpdateData={handleUpdateData} projects={projects} selectedYear={selectedYear} />
          </div>
        )}

        {activeTab === "projects" && (
          <div className="glass-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>단위과제 관리 (Anchor Unit Projects)</h2>
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
                    <tr>
                      <th>과제/부서</th>
                      <th>담당 센터장/팀장</th>
                      <th>{selectedYear}차년도 본예산 (백만원)</th>
                      {selectedYear >= 2 && <th>{selectedYear - 1}차년도 이월예산 (백만원)</th>}
                      <th>총 배정액 (백만원)</th>
                      <th>누적 집행실적 (백만원)</th>
                      <th>집행률</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.flatMap((p) =>
                      p.units.map((u) => {
                        const yData = u.years?.[selectedYear] || { budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0 };
                        const budgetCarryVal = selectedYear === 1 ? 0 : (yData.budget_carry || 0);
                        const spentCarryVal = selectedYear === 1 ? 0 : (yData.spent_carry || 0);
                        const totalBudget = (yData.budget_main || 0) + budgetCarryVal;
                        const totalSpent = (yData.spent_main || 0) + spentCarryVal;
                        const rate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
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
                            <td style={{ fontWeight: "700" }}>
                              {u.id === "Common" ? "" : `${u.id} `}{u.title}
                            </td>
                            <td>{u.manager}</td>
                            <td style={{ fontFamily: "var(--font-data)" }}>
                              {formatToMillionWon(yData.budget_main)}
                            </td>
                            {selectedYear >= 2 && (
                              <td style={{ fontFamily: "var(--font-data)" }}>
                                {formatToMillionWon(budgetCarryVal)}
                              </td>
                            )}
                            <td style={{ fontFamily: "var(--font-data)", fontWeight: "700" }}>
                              {formatToMillionWon(totalBudget)}
                            </td>
                            <td style={{ fontFamily: "var(--font-data)" }}>
                              {formatToMillionWon(totalSpent)}
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <div style={{ width: "50px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                                  <div style={{ width: `${Math.min(rate, 100)}%`, height: "100%", background: u.id === "Common" ? "#ec4899" : "var(--accent-color)" }} />
                                </div>
                                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-data)" }}>{rate.toFixed(1)}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {projectsSubTab === "program_mgmt" && (
              <div id="pdca-manager-section">
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1rem" }}>프로그램 관리</h3>
                <PDCAManager
                  projects={projects}
                  currentRole={currentRole}
                  onUpdateProgramDetails={handleUpdateProgramDetails}
                  selectedYear={selectedYear}
                  selectedUnitId={selectedUnitId}
                  setSelectedUnitId={setSelectedUnitId}
                  selectedProgId={selectedProgId}
                  setSelectedProgId={setSelectedProgId}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === "management" && (
          <div className="glass-card" style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", flexWrap: "wrap", gap: "0.8rem" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>사업단 관리 (Anchor Management)</h2>
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
                      hireDate: "2026-03-01"
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
                  가입 승인 대기
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
                        <th>입사일</th>
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
                          <td style={{ fontFamily: "var(--font-data)" }}>{m.hireDate}</td>
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
                      {projects.flatMap((p) => {
                        return p.units.flatMap((u) => {
                          return u.programs.map((prog) => {
                            let dept = "사업운영팀";
                            if (["A-1-가", "A-2", "A-3"].includes(u.id)) dept = "ECC센터";
                            else if (u.id === "A-1-나") dept = "신산업특화센터";
                            else if (["B-1", "B-3", "B-4"].includes(u.id)) dept = "ICC센터";
                            else if (u.id === "B-2") dept = "AID-X지원센터";
                            else if (u.id === "C-2") dept = "울산늘봄누리센터";
                            else if (["C-1", "D-1", "D-2", "D-3"].includes(u.id)) dept = "RCC센터";

                            return (
                              <tr key={prog.id}>
                                <td style={{ fontWeight: "700" }}>{u.id === "Common" ? "공통경비" : `${u.id} ${u.title}`}</td>
                                <td style={{ fontFamily: "var(--font-data)", fontWeight: "700" }}>{prog.id}</td>
                                <td>{prog.title}</td>
                                <td style={{ color: "var(--accent-color)", fontWeight: "700" }}>{dept}</td>
                                <td>
                                  {currentRole.rank <= 2 ? (
                                    <select
                                      className="user-selector"
                                      style={{ width: "200px", padding: "0.2rem 0.4rem", fontSize: "0.75rem" }}
                                      value={prog.assignee}
                                      onChange={(e) => handleAssignChange(u.id, prog.id, e.target.value)}
                                    >
                                      <option value="">미배정</option>
                                      {members
                                        .filter((m) => m.role === "연구원")
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
                                    <span>{prog.assignee || "미배정"}</span>
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
                        });
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {mgmtSubTab === "approvals" && currentRole.rank <= 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--accent-color)" }}>가입 승인 대기 목록</h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>
                  포털 대시보드에 신규 가입 신청한 교원 및 실무 연구원의 명단입니다. [승인 완료] 버튼을 누르면 즉시 로그인 권한이 승인됩니다.
                </p>
                <div className="table-panel" style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <table className="custom-table" style={{ fontSize: "0.75rem" }}>
                    <thead>
                      <tr>
                        <th>아이디</th>
                        <th>이름 / 역할</th>
                        <th>역할 키</th>
                        <th>신청 일자</th>
                        <th style={{ width: "100px" }}>가입 승인</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingUsers.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center", color: "var(--text-secondary-dark)", padding: "2rem" }}>
                            현재 가입 승인 대기자가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        pendingUsers.map((u) => (
                          <tr key={u.id}>
                            <td style={{ fontFamily: "var(--font-data)", fontWeight: "700" }}>{u.id}</td>
                            <td style={{ fontWeight: "700" }}>{u.name}</td>
                            <td style={{ fontFamily: "var(--font-data)" }}>{u.role_key}</td>
                            <td style={{ fontFamily: "var(--font-data)" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                            <td>
                              <button
                                className="btn-primary"
                                style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem", borderRadius: "0.3rem", background: "var(--success-color)" }}
                                onClick={() => handleApproveUser(u.id)}
                              >
                                승인 완료
                              </button>
                            </td>
                          </tr>
                        ))
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
                        const first = projects.flatMap(p => p.units.flatMap(u => u.kpis)).find(k => k.type === "자율");
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
                        const first = projects.flatMap(p => p.units.flatMap(u => u.kpis)).find(k => k.type === "중점");
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
                    {projects.flatMap((p) =>
                      p.units.flatMap((u) =>
                        u.kpis
                          .filter((k) => k.type === kpiSubTab) // 선택된 서브탭 유형별 필터링
                          .map((k) => {
                            let rate = 0;
                            if (k.subItems && k.subItems.length > 0) {
                              let sumRate = 0;
                              k.subItems.forEach((sub) => {
                                const yData = sub.years?.[selectedYear] || { target: 0, current: 0 };
                                sumRate += yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
                              });
                              rate = sumRate / k.subItems.length;
                            } else {
                              rate = k.target > 0 ? (k.current / k.target) * 100 : 0;
                            }
                            const isSelected = selectedKpi?.id === k.id;
                            return (
                              <tr
                                key={k.id}
                                onClick={() => setSelectedKpi(k)}
                                style={{
                                  cursor: "pointer",
                                  background: isSelected ? "rgba(59,130,246,0.08)" : "inherit",
                                  borderLeft: isSelected ? "4px solid var(--accent-color)" : "none",
                                  transition: "all 0.2s ease"
                                }}
                              >
                                <td style={{ fontFamily: "var(--font-data)", fontWeight: "700" }}>{k.id}</td>
                                <td style={{ fontWeight: isSelected ? "700" : "normal" }}>{k.name}</td>
                                <td>
                                  <span className={`badge ${k.type === "자율" ? "badge-blue" : "badge-yellow"}`}>
                                    {k.type}
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
                          })
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 우측 성과지표 세부내용 상세 블록 (Sticky 고정 스크롤 효과) */}
            <div className="sticky-panel">
              <div className="glass-card" style={{ border: selectedKpi ? "1px solid var(--accent-color)" : "1px solid var(--border-color-dark)", minHeight: "360px" }}>
                {selectedKpi ? (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.75rem" }}>
                      <span className="badge badge-blue" style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}>
                        {selectedKpi.id}
                      </span>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: "800" }}>{selectedKpi.name} 상세 명세</h3>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>지표 정의</span>
                        <p style={{ fontSize: "0.85rem", fontWeight: "700", marginTop: "0.2rem", lineHeight: "1.4" }}>
                          {selectedKpi.description}
                        </p>
                      </div>

                      {/* 세부지표 목표값 및 실적값을 보여주는 미니 표 추가 */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>지표 구성 세부항목 목표 대비 실적 표</span>
                          <span className="badge badge-yellow" style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem" }}>{selectedYear}차년도 세부지표</span>
                        </div>
                        <table className="mini-table" style={{ fontSize: "0.75rem" }}>
                          <thead>
                            <tr>
                              <th>세부 항목명</th>
                              <th style={{ textAlign: "right" }}>목표치</th>
                              <th style={{ textAlign: "right" }}>현재실적</th>
                              <th style={{ textAlign: "right" }}>달성도</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedKpi.subItems && selectedKpi.subItems.map((sub) => {
                              const yData = sub.years?.[selectedYear] || { target: 0, current: 0 };
                              const subRate = yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
                              return (
                                <tr key={sub.id}>
                                  <td style={{ fontWeight: "700" }}>{sub.name}</td>
                                  <td style={{ textAlign: "right", fontFamily: "var(--font-data)" }}>{yData.target.toFixed(1)}{sub.unit}</td>
                                  <td style={{ textAlign: "right", fontFamily: "var(--font-data)", color: "var(--accent-color)" }}>{yData.current.toFixed(1)}{sub.unit}</td>
                                  <td style={{ textAlign: "right", fontFamily: "var(--font-data)", fontWeight: "800", color: subRate >= 100 ? "var(--success-color)" : "var(--warning-color)" }}>
                                    {subRate.toFixed(1)}%
                                  </td>
                                </tr>
                              );
                            })}
                            {(() => {
                              let totalKpiRate = 0;
                              if (selectedKpi.subItems && selectedKpi.subItems.length > 0) {
                                let sumKpiRate = 0;
                                selectedKpi.subItems.forEach((sub) => {
                                  const yData = sub.years?.[selectedYear] || { target: 0, current: 0 };
                                  sumKpiRate += yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
                                });
                                totalKpiRate = sumKpiRate / selectedKpi.subItems.length;
                              }
                              return (
                                <tr style={{ background: "rgba(59,130,246,0.06)", borderTop: "1px solid var(--border-color-dark)" }}>
                                  <td style={{ fontWeight: "800" }}>종합 지표 달성도 (Total)</td>
                                  <td style={{ textAlign: "right", fontFamily: "var(--font-data)" }}>100.0%</td>
                                  <td style={{ textAlign: "right", fontFamily: "var(--font-data)", color: "var(--accent-color)", fontWeight: "700" }}>{totalKpiRate.toFixed(1)}%</td>
                                  <td style={{ textAlign: "right", fontFamily: "var(--font-data)", fontWeight: "900", color: totalKpiRate >= 100 ? "var(--success-color)" : "var(--warning-color)" }}>
                                    {totalKpiRate.toFixed(1)}%
                                  </td>
                                </tr>
                              );
                            })()}
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>성과지표 산출공식</span>
                        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color-dark)", borderRadius: "0.5rem", padding: "0.6rem", marginTop: "0.2rem" }}>
                          <code style={{ fontSize: "0.75rem", fontFamily: "var(--font-data)", color: "#93c5fd" }}>
                            {selectedKpi.formula}
                          </code>
                        </div>
                      </div>

                      {/* 성과지표 목표치 및 실적 직접 수정 (실시간 연동 & 권한 통제) */}
                      <div style={{ borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.8rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.4rem" }}>
                          지표 목표치 및 실적 수정 (소수점 입력 가능)
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                          {selectedKpi.subItems && selectedKpi.subItems.map((sub) => {
                            const yData = sub.years?.[selectedYear] || { target: 0, current: 0 };
                            const canEditTarget = currentRole.rank <= 4; // 단장, 본부장, 센터장, 운영팀장 (rank <= 4)
                            return (
                              <div key={sub.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: "0.4rem", alignItems: "center", background: "rgba(255,255,255,0.01)", padding: "0.25rem 0.4rem", borderRadius: "0.3rem", border: "1px solid rgba(255,255,255,0.02)" }}>
                                <span style={{ fontSize: "0.7rem", fontWeight: "700", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                  {sub.name}
                                </span>
                                <div>
                                  <span style={{ fontSize: "0.55rem", color: "var(--text-secondary-dark)", display: "block" }}>목표 ({sub.unit})</span>
                                  <input
                                    type="number"
                                    step="any"
                                    className="user-selector"
                                    disabled={!canEditTarget}
                                    defaultValue={yData.target}
                                    placeholder={!canEditTarget ? "권한 없음" : "목표치"}
                                    onBlur={(e) => {
                                      if (!canEditTarget) return;
                                      const val = parseFloat(e.target.value);
                                      if (!isNaN(val)) {
                                        handleUpdateKpiValue(sub.id, "target", val);
                                      }
                                    }}
                                    style={{
                                      padding: "0.15rem 0.3rem",
                                      fontSize: "0.7rem",
                                      width: "100%",
                                      background: !canEditTarget ? "rgba(255,255,255,0.02)" : "#18181b",
                                      color: !canEditTarget ? "rgba(255,255,255,0.25)" : "white",
                                      border: "1px solid var(--border-color-dark)",
                                      borderRadius: "0.2rem",
                                      cursor: !canEditTarget ? "not-allowed" : "text"
                                    }}
                                  />
                                </div>
                                <div>
                                  <span style={{ fontSize: "0.55rem", color: "var(--text-secondary-dark)", display: "block" }}>실적 ({sub.unit})</span>
                                  <input
                                    type="number"
                                    step="any"
                                    className="user-selector"
                                    defaultValue={yData.current}
                                    placeholder="실적치"
                                    onBlur={(e) => {
                                      const val = parseFloat(e.target.value);
                                      if (!isNaN(val)) {
                                        handleUpdateKpiValue(sub.id, "current", val);
                                      }
                                    }}
                                    style={{
                                      padding: "0.15rem 0.3rem",
                                      fontSize: "0.7rem",
                                      width: "100%",
                                      background: "#18181b",
                                      color: "white",
                                      border: "1px solid var(--border-color-dark)",
                                      borderRadius: "0.2rem"
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.8rem" }}>
                        <div>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary-dark)" }}>주관 부서</span>
                          <p style={{ fontWeight: "700" }}>{selectedKpi.owner}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary-dark)" }}>측정 주기</span>
                          <p style={{ fontWeight: "700" }}>{selectedKpi.cycle}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "320px", color: "var(--text-secondary-dark)", gap: "0.5rem" }}>
                    <HelpCircle size={32} style={{ color: "var(--accent-color)" }} />
                    <span style={{ fontSize: "0.8rem" }}>좌측 목록의 성과지표 행을 클릭하시면 상세 비교 정보가 나타납니다.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "progress" && (
          <ProgramProgressManager
            projects={projects}
            selectedYear={selectedYear}
          />
        )}

        {activeTab === "budget-items" && (
          <BudgetItemsManager
            projects={projects}
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
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
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
                    {editingMember.role === "연구원" ? (
                      <>
                        <option value="책임연구원">책임연구원</option>
                        <option value="선임연구원">선임연구원</option>
                        <option value="연구원">연구원</option>
                      </>
                    ) : (
                      <>
                        <option value="전임 교수">전임 교수</option>
                        <option value="행정 부장">행정 부장</option>
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

              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "700" }}>입사일</label>
                <input
                  type="date"
                  className="user-selector"
                  style={{ width: "100%", padding: "0.4rem", color: "white" }}
                  value={editingMember.hireDate}
                  onChange={(e) => setEditingMember({ ...editingMember, hireDate: e.target.value })}
                />
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
    </div>
  );
}
