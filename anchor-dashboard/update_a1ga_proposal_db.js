import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// .env 파일 직접 파싱 로더
const envPath = fs.existsSync(".env") ? ".env" : fs.existsSync("anchor-dashboard/.env") ? "anchor-dashboard/.env" : null;
if (!envPath) {
  console.error(".env 파일을 찾을 수 없습니다.");
  process.exit(1);
}
const envFile = fs.readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envFile
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const eqIdx = line.indexOf("=");
      if (eqIdx === -1) return [line.trim(), ""];
      return [line.substring(0, eqIdx).trim(), line.substring(eqIdx + 1).replace(/["\r]/g, "").trim()];
    })
);

const supabaseUrl = env.VITE_SUPABASE_URL || "https://qpojcgpdgvzlivjrhrhn.supabase.co";
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error("VITE_SUPABASE_ANON_KEY가 설정되지 않았습니다.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 프로그램 ID 마이그레이션 맵
const PROGRAM_ID_MIGRATION_MAP = {
  // 1차 마이그레이션 (원본 ID ➡️ 신규 42개 프로그램 ID)
  "A1가-01": "A1가-S1T1-1", "A1가-02": "A1가-S1T2-1", "A1가-03": "A1가-S1T2-2", "A1가-04": "A1가-S1T2-3", "A1가-05": "A1가-S1T2-4",
  "A1가-06": "A1가-S1T2-5", "A1가-07": "A1가-S1T2-6", "A1가-08": "A1가-S1T3-1", "A1가-09": "A1가-S2T4-1", "A1가-10": "A1가-S3T5-1",
  "A1가-11": "A1가-S3T6-1", "A1가-12": "A1가-S3T6-2", "A1가-13": "A1가-S3T7-1", "A1가-14": "A1가-S3T8-1", "A1가-15": "A1가-S3T8-2",
  "A1가-16": "A1가-S3T8-3", "A1가-17": "A1가-S4T9-1", "A1가-18": "A1가-S4T9-2", "A1가-19": "A1가-S4T9-3", "A1가-20": "A1가-S4T9-4",
  "A1가-21": "A1가-S4T9-5", "A1가-22": "A1가-S4T9-6", "A1가-23": "A1가-S4T9-7", "A1가-24": "A1가-S4T9-8", "A1가-25": "A1가-S4T9-9",
  "A1가-26": "A1가-S4T9-10", "A1가-27": "A1가-S4T9-11", "A1가-28": "A1가-S4T9-12", "A1가-29": "A1가-S4T9-13", "A1가-30": "A1가-S4T10-1",
  "A1가-31": "A1가-S4T11-1", "A1가-32": "A1가-S4T11-2", "A1가-33": "A1가-S4T11-3", "A1가-34": "A1가-S5T13-1", "A1가-35": "A1가-S5T13-2",
  "A1가-36": "A1가-S5T13-3", "A1가-37": "A1가-S5T13-4", "A1가-38": "A1가-S5T13-5", "A1가-39": "A1가-S5T13-6", "A1가-40": "A1가-S5T14-1",
  "A1가-41": "A1가-S5-S5T15-1", "A1가-42": "A1가-S5-S5T16-2",

  // 2차 구제 마이그레이션 (과거 잘못 저장된 v26 캐시 ID ➡️ 신규 42개 프로그램 ID)
  "A1가-S1T1-2": "A1가-S1T2-1", "A1가-S1T1-3": "A1가-S1T2-2", "A1가-S1T1-4": "A1가-S1T2-3", "A1가-S1T1-5": "A1가-S1T2-4",
  "A1가-S1T1-6": "A1가-S1T2-5", "A1가-S1T1-7": "A1가-S1T2-6", "A1가-S1T1-8": "A1가-S1T3-1", "A1가-S1T1-9": "A1가-S2T4-1",
  "A1가-S1T1-10": "A1가-S3T5-1", "A1가-S3T3-1": "A1가-S3T7-1", "A1가-S1T1-11": "A1가-S3T6-1", "A1가-S1T1-12": "A1가-S3T6-2",
  "A1가-S3T3-2": "A1가-S3T8-1", "A1가-S3T3-3": "A1가-S3T8-2", "A1가-S3T3-4": "A1가-S3T8-3", "A1가-S3T3-5": "A1가-S4T9-1",
  "A1가-S4T4-1": "A1가-S4T9-3", "A1가-S4T4-2": "A1가-S4T9-4", "A1가-S4T4-3": "A1가-S4T9-5", "A1가-S4T4-4": "A1가-S4T9-6",
  "A1가-S4T4-5": "A1가-S4T9-7", "A1가-S4T4-6": "A1가-S4T9-8", "A1가-S4T4-7": "A1가-S4T9-9", "A1가-S3T3-6": "A1가-S4T9-2",
  "A1가-S5T5-1": "A1가-S4T9-10", "A1가-S5T5-2": "A1가-S4T9-11", "A1가-S5T5-3": "A1가-S4T9-12", "A1가-S5T5-4": "A1가-S4T9-13",
  "A1가-S5T5-5": "A1가-S4T10-1", "A1가-S5T5-6": "A1가-S4T11-1", "A1가-S5T5-7": "A1가-S4T11-2", "A1가-S5T5-8": "A1가-S4T11-3",
  "A1가-S5T5-9": "A1가-S5T13-1", "A1가-S5T5-10": "A1가-S5T13-2", "A1가-S5T5-11": "A1가-S5T13-3", "A1가-S5T5-12": "A1가-S5T13-4",
  "A1가-S5T5-13": "A1가-S5T13-5", "A1가-S5T5-14": "A1가-S5T13-6", "A1가-S5T5-15": "A1가-S5-S5T15-1", "A1가-S5T5-16": "A1가-S5-S5T16-2",
  "A1가-S5T5-17": "A1가-S5T14-1",

  // 3차 구제 마이그레이션 (기존 35개 프로그램 ID ➡️ 신규 42개 프로그램 ID)
  "A1가-S2T5-1": "A1가-S2T4-1", "A1가-S3T6-1": "A1가-S3T5-1", "A1가-S3T7-1": "A1가-S3T6-1", "A1가-S3T7-2": "A1가-S3T6-2",
  "A1가-S3T8-1": "A1가-S3T7-1", "A1가-S3T9-1": "A1가-S3T8-1", "A1가-S3T9-2": "A1가-S3T8-2", "A1가-S3T9-3": "A1가-S3T8-3",
  "A1가-S4T10-1": "A1가-S4T9-1", "A1가-S4T10-2": "A1가-S4T9-2", "A1가-S4T10-3": "A1가-S4T9-3", "A1가-S4T10-4": "A1가-S4T9-4",
  "A1가-S4T11-1": "A1가-S4T10-1", "A1가-S4T12-1": "A1가-S4T11-1", "A1가-S4T12-2": "A1가-S4T11-2", "A1가-S4T12-3": "A1가-S4T11-3",
  "A1가-S5T13-7": "A1가-S5-S5T15-1", "A1가-S5T13-8": "A1가-S5-S5T16-2"
};

// 신규 42개 프로그램 명세 배열
const newA1gaProgramSpec = [
  { id: "A1가-S1T1-1", title: "UC-HYPER 교수법 개발(공학/비공학)", budget_2026: 12000000, budget_national: 12000000, budget_city: 0, assignee: "박기범 연구원", category: "교육∙연구 프로그램 개발∙운영비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S1T2-1", title: "주문식 교육과정 운영", budget_2026: 202000000, budget_national: 42000000, budget_city: 160000000, assignee: "정자윤 연구원", category: "교육∙연구 프로그램 개발∙운영비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S1T2-2", title: "주문식(지역맞춤형) 교육과정 개발 및 개편 보고서", budget_2026: 20000000, budget_national: 20000000, budget_city: 0, assignee: "정자윤 연구원", category: "교육∙연구 프로그램 개발∙운영비", defaultPdca: { p: "완료", d: "대기", c: "대기", a: "대기" } },
  { id: "A1가-S1T2-3", title: "주문식 교육과정 자체평가 보고서", budget_2026: 20000000, budget_national: 0, budget_city: 20000000, assignee: "정자윤 연구원", category: "교육∙연구 프로그램 개발∙운영비", defaultPdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
  { id: "A1가-S1T2-4", title: "과정평가형 교육과정개발(3개 학과)", budget_2026: 12000000, budget_national: 12000000, budget_city: 0, assignee: "정자윤 연구원", category: "교육∙연구 프로그램 개발∙운영비", defaultPdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
  { id: "A1가-S1T2-5", title: "학점교류 교과목 운영", budget_2026: 20000000, budget_national: 20000000, budget_city: 0, assignee: "서란 연구원/이은주 선임연구원", category: "교육∙연구 프로그램 개발∙운영비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S1T2-6", title: "학과별 실험실습재료비 지원", budget_2026: 100000000, budget_national: 100000000, budget_city: 0, assignee: "정자윤 연구원", category: "교육∙연구 프로그램 개발∙운영비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S1T3-1", title: "특화분야 자격증/전문가 과정 운영", budget_2026: 45000000, budget_national: 45000000, budget_city: 0, assignee: "정자윤 연구원", category: "교육∙연구 프로그램 개발∙운영비", defaultPdca: { p: "완료", d: "완료", c: "대기", a: "대기" } },
  { id: "A1가-S2T4-1", title: "지산학 페스티벌 운영 창의설계 경진대회", budget_2026: 6000000, budget_national: 6000000, budget_city: 0, assignee: "이은주 선임연구원", category: "교육∙연구 프로그램 개발∙운영비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S3T5-1", title: "개방형설계센터 전문가활용교육 개발 및 운영", budget_2026: 60000000, budget_national: 60000000, budget_city: 0, assignee: "서란 연구원/이은주 선임연구원", category: "교육∙연구 프로그램 개발∙운영비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S3T6-1", title: "울산형 데이터센터 기술인재 양성을 위한 자격증과정 운영", budget_2026: 15000000, budget_national: 0, budget_city: 15000000, assignee: "정자윤 연구원", category: "교육∙연구 프로그램 개발∙운영비", defaultPdca: { p: "완료", d: "완료", c: "대기", a: "대기" } },
  { id: "A1가-S3T6-2", title: "울산형 데이터센터 기술인재 양성을 위한 마이크로디그리 개발", budget_2026: 4000000, budget_national: 4000000, budget_city: 0, assignee: "박기범 연구원", category: "교육∙연구 프로그램 개발∙운영비", defaultPdca: { p: "완료", d: "완료", c: "대기", a: "대기" } },
  { id: "A1가-S3T7-1", title: "표준형 현장실습 교과목 운영", budget_2026: 50000000, budget_national: 0, budget_city: 50000000, assignee: "정자윤 연구원", category: "교육∙연구 프로그램 개발∙운영비", defaultPdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
  { id: "A1가-S3T8-1", title: "기업 PBL 문제해결 지원과제 운영", budget_2026: 90000000, budget_national: 90000000, budget_city: 0, assignee: "박기범 연구원", category: "교육∙연구 프로그램 개발∙운영비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S3T8-2", title: "전문기술석사과정 워크숍", budget_2026: 4000000, budget_national: 4000000, budget_city: 0, assignee: "박기범 연구원", category: "교육∙연구 프로그램 개발∙운영비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S3T8-3", title: "전공심화 산학 PBL과제 운영", budget_2026: 10000000, budget_national: 10000000, budget_city: 0, assignee: "박기범 연구원", category: "교육∙연구 프로그램 개발∙운영비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S4T9-1", title: "교육환경개선", budget_2026: 300000000, budget_national: 300000000, budget_city: 0, assignee: "이은주 선임연구원", category: "교육∙연구 환경개선비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S4T9-2", title: "생성형 AI 지원 플랫폼 구축", budget_2026: 50000000, budget_national: 50000000, budget_city: 0, assignee: "이은주 선임연구원", category: "교육∙연구 환경개선비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S4T9-3", title: "실시간 쌍방향 소통 수업 플랫폼 구축", budget_2026: 20000000, budget_national: 20000000, budget_city: 0, assignee: "이은주 선임연구원", category: "교육∙연구 환경개선비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S4T9-4", title: "기자재 및 실습장비 구축 (주문식 교과 기자재)", budget_2026: 150000000, budget_national: 150000000, budget_city: 0, assignee: "이은주 선임연구원", category: "실험∙실습장비 및 기자재 구입∙운영비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S4T9-5", title: "기자재 및 실습장비 구축 (환경시료 측정 장비)", budget_2026: 10000000, budget_national: 10000000, budget_city: 0, assignee: "이은주 선임연구원", category: "실험∙실습장비 및 기자재 구입∙운영비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S4T9-6", title: "기자재 및 실습장비 구축 (AI활용 빅데이터 분석)", budget_2026: 30000000, budget_national: 30000000, budget_city: 0, assignee: "이은주 선임연구원", category: "실험∙실습장비 및 기자재 구입∙운영비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S4T9-7", title: "기자재 및 실습장비 구축 (조선 설계 교육용 SW)", budget_2026: 40000000, budget_national: 40000000, budget_city: 0, assignee: "이은주 선임연구원", category: "실험∙실습장비 및 기자재 구입∙운영비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S4T9-8", title: "기자재 및 실습장비 구축 (Physical AI 데스크탑)", budget_2026: 222000000, budget_national: 222000000, budget_city: 0, assignee: "이은주 선임연구원", category: "실험∙실습장비 및 기자재 구입∙운영비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S4T9-9", title: "기자재 및 실습장비 구축 (Physical AI 모니터)", budget_2026: 15000000, budget_national: 15000000, budget_city: 0, assignee: "이은주 선임연구원", category: "실험∙실습장비 및 기자재 구입∙운영비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S4T9-10", title: "기자재 및 실습장비 구축 (Physical AI 매니풀레이터)", budget_2026: 20000000, budget_national: 20000000, budget_city: 0, assignee: "이은주 선임연구원", category: "실험∙실습장비 및 기자재 구입∙운영비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S4T9-11", title: "기자재 및 실습장비 구축 (디지털트윈 제작 3D 카메라)", budget_2026: 39000000, budget_national: 39000000, budget_city: 0, assignee: "이은주 선임연구원", category: "실험∙실습장비 및 기자재 구입∙운영비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S4T9-12", title: "기자재 및 실습장비 구축 (디지털트윈 SW 구독)", budget_2026: 10000000, budget_national: 10000000, budget_city: 0, assignee: "이은주 선임연구원", category: "실험∙실습장비 및 기자재 구입∙운영비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S4T9-13", title: "기자재 및 실습장비 구축 (드론 시뮬레이터)", budget_2026: 10000000, budget_national: 10000000, budget_city: 0, assignee: "이은주 선임연구원", category: "실험∙실습장비 및 기자재 구입∙운영비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S4T10-1", title: "ECC 플랫폼 구축(2단계)", budget_2026: 15000000, budget_national: 15000000, budget_city: 0, assignee: "이은주 선임연구원", category: "교육∙연구 환경개선비", defaultPdca: { p: "완료", d: "대기", c: "대기", a: "대기" } },
  { id: "A1가-S4T11-1", title: "특화분야 온라인 교육 콘텐츠 개발", budget_2026: 60000000, budget_national: 60000000, budget_city: 0, assignee: "서란 연구원/이은주 선임연구원", category: "교육∙연구 프로그램 개발∙운영비", defaultPdca: { p: "완료", d: "완료", c: "대기", a: "대기" } },
  { id: "A1가-S4T11-2", title: "AI리터러시 교과목 운영", budget_2026: 50000000, budget_national: 0, budget_city: 50000000, assignee: "정자윤 연구원", category: "교육∙연구 프로그램 개발∙운영비", defaultPdca: { p: "완료", d: "완료", c: "대기", a: "대기" } },
  { id: "A1가-S4T11-3", title: "전자연구노트 이용료", budget_2026: 0, budget_national: 0, budget_city: 0, assignee: "박기범 연구원", category: "교육∙연구 프로그램 개발∙운영비", defaultPdca: { p: "완료", d: "완료", c: "대기", a: "대기" } },
  { id: "A1가-S5T13-1", title: "이전 공공기관 합동 채용설명회 및 취업 아카데미 운영", budget_2026: 5000000, budget_national: 5000000, budget_city: 0, assignee: "김소연 연구원", category: "지역 연계∙협업 지원비", defaultPdca: { p: "완료", d: "대기", c: "대기", a: "대기" } },
  { id: "A1가-S5T13-2", title: "산학협력 간담회", budget_2026: 6000000, budget_national: 6000000, budget_city: 0, assignee: "정자윤 연구원", category: "기업 지원∙협력 활동비", defaultPdca: { p: "완료", d: "완료", c: "대기", a: "대기" } },
  { id: "A1가-S5T13-3", title: "정책연구과제 운영", budget_2026: 10000000, budget_national: 10000000, budget_city: 0, assignee: "박기범 연구원", category: "기업 지원∙협력 활동비", defaultPdca: { p: "완료", d: "완료", c: "대기", a: "대기" } },
  { id: "A1가-S5T13-4", title: "강소기업 현장견학 프로그램 운영", budget_2026: 10000000, budget_national: 10000000, budget_city: 0, assignee: "정자윤 연구원", category: "기업 지원∙협력 활동비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S5T13-5", title: "학과 전공 맞춤형 모듈식 취업캠프", budget_2026: 24000000, budget_national: 24000000, budget_city: 0, assignee: "정자윤 연구원", category: "기업 지원∙협력 활동비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S5T13-6", title: "시그니처 클래스 운영", budget_2026: 40000000, budget_national: 40000000, budget_city: 0, assignee: "정자윤 연구원", category: "기업 지원∙협력 활동비", defaultPdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
  { id: "A1가-S5T14-1", title: "벤치마킹", budget_2026: 14000000, budget_national: 14000000, budget_city: 0, assignee: "서란 연구원", category: "성과 활용∙확산 지원비", defaultPdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
  { id: "A1가-S5-S5T15-1", title: "교직원 역량강화 프로그램 운영", budget_2026: 40000000, budget_national: 0, budget_city: 40000000, assignee: "서란 연구원", category: "성과 활용∙확산 지원비", defaultPdca: { p: "대기", d: "대기", c: "대기", a: "대기" } },
  { id: "A1가-S5-S5T16-2", title: "장학금 지급", budget_2026: 240000000, budget_national: 240000000, budget_city: 0, assignee: "이은주 선임연구원/서란 연구원", category: "장학금", defaultPdca: { p: "대기", d: "대기", c: "대기", a: "대기" } }
];

function getStandardId(id) {
  if (!id) return id;
  let standard = id;
  if (standard.startsWith("A1-")) {
    standard = "A1가-" + standard.substring(3);
  }
  if (PROGRAM_ID_MIGRATION_MAP[standard]) {
    return PROGRAM_ID_MIGRATION_MAP[standard];
  }
  return standard;
}

// 하나의 projects_data 배열을 마이그레이션하는 공통 함수
function migrateDataArray(dataList, targetYear) {
  const aProj = dataList.find((p) => p.id === "A");
  const a1ga = aProj?.units?.find((u) => u.id === "A1가");

  if (!a1ga) {
    console.log("A1가 단위과제를 찾을 수 없습니다.");
    return dataList;
  }

  // 1. 기존 프로그램들의 데이터를 백업
  const oldProgramsMap = new Map();
  if (a1ga.programs && Array.isArray(a1ga.programs)) {
    a1ga.programs.forEach((prog) => {
      const stdId = getStandardId(prog.id);
      if (stdId) {
        oldProgramsMap.set(stdId, prog);
      }
    });
  }

  // 2. 신규 42개 프로그램 사양에 맞게 programs 재생성
  const newPrograms = newA1gaProgramSpec.map((spec) => {
    const oldProg = oldProgramsMap.get(spec.id);

    const newProg = {
      id: spec.id,
      title: spec.title,
      assignee: spec.assignee,
      pdca: oldProg?.pdca ? { ...oldProg.pdca } : { ...spec.defaultPdca },
      timeline: oldProg?.timeline || ",,,,,,,,,,,,",
      evalType: oldProg?.evalType || "대기",
      satisfaction: oldProg?.satisfaction !== undefined ? oldProg.satisfaction : 0,
      achievements: oldProg?.achievements || "",
      excellent: oldProg?.excellent || "",
      deficiency: oldProg?.deficiency || "",
      improvePlan: oldProg?.improvePlan || "",
      actionItem: oldProg?.actionItem || "",
      coopDept: oldProg?.coopDept || "",
      targetAudience: oldProg?.targetAudience || "",
      years: {}
    };

    [1, 2, 3, 4, 5].forEach((yr) => {
      const oldYrData = oldProg?.years?.[yr];

      if (yr === 2) {
        newProg.years[yr] = {
          budget_main: spec.budget_2026,
          budget_national: spec.budget_national,
          budget_city: spec.budget_city,
          budget_carry: 0,
          budget_carry_city: 0,
          budget_carry_national: 0,
          budget_carry_external: 0,
          budget_external: 0,
          spent_main: oldYrData?.spent_main || 0,
          spent_national: oldYrData?.spent_national || 0,
          spent_city: oldYrData?.spent_city || 0,
          spent_carry: oldYrData?.spent_carry || 0,
          spent_carry_city: oldYrData?.spent_carry_city || 0,
          spent_carry_national: oldYrData?.spent_carry_national || 0,
          spent_carry_external: oldYrData?.spent_carry_external || 0,
          spent_external: oldYrData?.spent_external || 0,
          budget_categories: [
            {
              category: spec.category,
              budget: spec.budget_2026,
              budget_national: spec.budget_national,
              budget_city: spec.budget_city,
              spent: oldYrData?.budget_categories?.[0]?.spent || 0,
              spent_national: oldYrData?.budget_categories?.[0]?.spent_national || 0,
              spent_city: oldYrData?.budget_categories?.[0]?.spent_city || 0
            }
          ]
        };
      } else {
        const budgetMain = oldYrData?.budget_main !== undefined ? oldYrData.budget_main : (spec.budget_2026 || 0);
        newProg.years[yr] = {
          budget_main: budgetMain,
          budget_national: budgetMain,
          budget_city: 0,
          budget_carry: oldYrData?.budget_carry || 0,
          budget_carry_city: 0,
          budget_carry_national: oldYrData?.budget_carry_national || oldYrData?.budget_carry || 0,
          budget_carry_external: 0,
          budget_external: 0,
          spent_main: oldYrData?.spent_main || 0,
          spent_national: oldYrData?.spent_national || oldYrData?.spent_main || 0,
          spent_city: 0,
          spent_carry: oldYrData?.spent_carry || 0,
          spent_carry_city: 0,
          spent_carry_national: oldYrData?.spent_carry_national || oldYrData?.spent_carry || 0,
          spent_carry_external: 0,
          spent_external: 0,
          budget_categories: [
            {
              category: spec.category,
              budget: budgetMain,
              budget_national: budgetMain,
              budget_city: 0,
              spent: oldYrData?.budget_categories?.[0]?.spent || 0,
              spent_national: oldYrData?.budget_categories?.[0]?.spent_national || 0,
              spent_city: 0
            }
          ]
        };
      }
    });

    return newProg;
  });

  a1ga.programs = newPrograms;

  if (!a1ga.years) a1ga.years = {};
  if (!a1ga.budgetDetails) a1ga.budgetDetails = {};

  [1, 2, 3, 4, 5].forEach((yr) => {
    a1ga.years[yr] = {
      budget_main: 0,
      budget_national: 0,
      budget_city: 0,
      budget_carry: 0,
      budget_external: 0,
      spent_main: 0,
      spent_national: 0,
      spent_city: 0,
      spent_carry: 0,
      spent_external: 0
    };

    const categories = [
      "인건비",
      "장학금",
      "교육∙연구 프로그램 개발∙운영비",
      "교육∙연구 환경개선비",
      "실험∙실습장비 및 기자재 구입∙운영비",
      "지역 연계∙협업 지원비",
      "기업 지원∙협력 활동비",
      "성과 활용∙확산 지원비",
      "그 밖의 사업운영경비",
      "간접비"
    ];

    categories.forEach((cat) => {
      if (!a1ga.budgetDetails[cat]) {
        a1ga.budgetDetails[cat] = {
          budget_2026: 0,
          spent_2026: 0,
          budget_2025_carry: 0,
          spent_2025_carry: 0,
          years: {}
        };
      }
      if (!a1ga.budgetDetails[cat].years) {
        a1ga.budgetDetails[cat].years = {};
      }
      a1ga.budgetDetails[cat].years[yr] = {
        budget_main: 0,
        budget_national: 0,
        budget_city: 0,
        budget_carry: 0,
        spent_main: 0,
        spent_national: 0,
        spent_city: 0,
        spent_carry: 0
      };
    });

    newPrograms.forEach((prog) => {
      const pYr = prog.years[yr];
      if (!pYr) return;

      a1ga.years[yr].budget_main += pYr.budget_main || 0;
      a1ga.years[yr].budget_national += pYr.budget_national || 0;
      a1ga.years[yr].budget_city += pYr.budget_city || 0;
      a1ga.years[yr].budget_carry += pYr.budget_carry || 0;
      a1ga.years[yr].spent_main += pYr.spent_main || 0;
      a1ga.years[yr].spent_national += pYr.spent_national || 0;
      a1ga.years[yr].spent_city += pYr.spent_city || 0;
      a1ga.years[yr].spent_carry += pYr.spent_carry || 0;

      if (pYr.budget_categories && Array.isArray(pYr.budget_categories)) {
        pYr.budget_categories.forEach((catObj) => {
          const catDetail = a1ga.budgetDetails[catObj.category];
          if (catDetail && catDetail.years?.[yr]) {
            const cYr = catDetail.years[yr];
            cYr.budget_main += catObj.budget || 0;
            cYr.budget_national += catObj.budget_national || 0;
            cYr.budget_city += catObj.budget_city || 0;
            cYr.spent_main += catObj.spent || 0;
            cYr.spent_national += catObj.spent_national || 0;
            cYr.spent_city += catObj.spent_city || 0;
          }
        });
      }
    });

    if (yr === 2) {
      categories.forEach((cat) => {
        const catDetail = a1ga.budgetDetails[cat];
        if (catDetail) {
          catDetail.budget_2026 = catDetail.years[2].budget_main;
          catDetail.spent_2026 = catDetail.years[2].spent_main;
        }
      });
    }
  });

  a1ga.budget = a1ga.years[targetYear]?.budget_main || a1ga.years[2]?.budget_main || 2100000000;
  a1ga.spent = a1ga.years[targetYear]?.spent_main || 0;
  a1ga.budget_2026 = a1ga.years[2]?.budget_main || 2100000000;
  a1ga.spent_2026 = a1ga.years[2]?.spent_main || 0;

  aProj.spent = 0;
  aProj.units.forEach((u) => {
    aProj.spent += u.spent || 0;
  });

  return dataList;
}

async function run() {
  console.log("--------------------------------------------------");
  console.log("A1가 (42개 프로그램) DB 및 로컬 파일 마이그레이션 시작");
  console.log("--------------------------------------------------");

  console.log("=== RLS 권한 획득을 위해 관리자 계정 로그인 시도 ===");
  let authRes = await supabase.auth.signInWithPassword({
    email: 'kysong@uc.ac.kr',
    password: env.VITE_SUPABASE_USER_PASSWORD ? env.VITE_SUPABASE_USER_PASSWORD.replace(/["\r]/g, '') : 'uc_anchor'
  });

  if (authRes.error) {
    console.log("kysong@uc.ac.kr 로그인 실패, director@anchor.ac.kr 계정으로 재시도...");
    authRes = await supabase.auth.signInWithPassword({
      email: 'director@anchor.ac.kr',
      password: 'uc_anchor'
    });
  }

  if (authRes.error) {
    console.error("로그인 실패! RLS 권한이 없어 DB 업데이트를 계속할 수 없습니다:", authRes.error.message);
    process.exit(1);
  }

  console.log("로그인 성공! RLS 권한을 확보하였습니다.");

  // 1. Supabase 원격 DB 마이그레이션
  console.log("Supabase 원격 projects_data 불러오는 중...");
  const { data: rows, error } = await supabase.from("projects_data").select("*");

  if (error) {
    console.error("DB 로드 실패:", error);
    process.exit(1);
  }

  console.log(`총 ${rows.length}개 연차 DB 레코드를 발견했습니다.`);

  for (const row of rows) {
    const list = row.data;
    if (!list || !Array.isArray(list)) continue;

    console.log(`[원격 DB] 연차 ${row.year} 레코드 마이그레이션 적용 중...`);
    const migratedList = migrateDataArray(list, row.year);

    const { error: updateError } = await supabase
      .from("projects_data")
      .update({ data: migratedList })
      .eq("year", row.year);

    if (updateError) {
      console.error(`❌ [원격 DB] 연차 ${row.year} 업데이트 실패:`, updateError);
    } else {
      console.log(`✅ [원격 DB] 연차 ${row.year} 업데이트 성공!`);
    }
  }

  // 2. 로컬 백업 JSON 파일 마이그레이션 (동일 디렉토리에 덮어쓰기)
  console.log("--------------------------------------------------");
  console.log("로컬 JSON 백업 파일 마이그레이션 적용 중...");
  
  const localFiles = [
    { year: 1, file: "projects_data_year_1.json" },
    { year: 2, file: "projects_data_year_2.json" },
    { year: 3, file: "projects_data_year_3.json" },
    { year: 4, file: "projects_data_year_4.json" },
    { year: 5, file: "projects_data_year_5.json" }
  ];

  for (const item of localFiles) {
    let filePath = path.join("anchor-dashboard", item.file);
    if (!fs.existsSync(filePath)) {
      filePath = item.file;
    }
    if (!fs.existsSync(filePath)) {
      console.log(`경고: 로컬 파일 ${filePath}이 존재하지 않습니다. 스킵합니다.`);
      continue;
    }

    console.log(`[로컬 파일] ${item.file} 로드 및 파싱 중...`);
    const rawData = fs.readFileSync(filePath, "utf8");
    let jsonList;
    try {
      jsonList = JSON.parse(rawData);
    } catch (e) {
      console.error(`❌ ${item.file} 파싱 실패:`, e);
      continue;
    }

    if (!Array.isArray(jsonList)) {
      console.error(`❌ ${item.file}의 최상위 데이터가 배열이 아닙니다.`);
      continue;
    }

    const migratedList = migrateDataArray(jsonList, item.year);
    fs.writeFileSync(filePath, JSON.stringify(migratedList, null, 2), "utf8");
    console.log(`✅ [로컬 파일] ${item.file} 마이그레이션 및 덮어쓰기 완료!`);
  }

  console.log("--------------------------------------------------");
  console.log("모든 마이그레이션 작업이 성공적으로 완료되었습니다.");
  console.log("--------------------------------------------------");
}

run();
