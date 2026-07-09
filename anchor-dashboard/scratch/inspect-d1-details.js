import fs from 'fs';

const filePath = './projects_data_year_2.json';
const raw = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(raw);

const d1 = data.flatMap(s => s.units || []).find(u => u.id === 'D1');

if (!d1) {
  console.log("D1 단위과제를 찾을 수 없습니다.");
} else {
  console.log("=== 현재 D1 하위 프로그램 리스트 ===");
  if (d1.programs) {
    d1.programs.forEach((p, idx) => {
      const yr2 = p.years?.["2"] || {};
      console.log(`[${idx + 1}] ID: ${p.id} | Title: ${p.title}`);
      console.log(`    - 담당자: ${p.assignee} (years.2: ${p.assignees?.["2"]})`);
      console.log(`    - 예산 (Main): ${yr2.budget_main} | 국비: ${yr2.budget_national} | 시비: ${yr2.budget_city}`);
      if (p.budget_categories) {
        console.log(`    - 비목 카테고리:`, p.budget_categories);
      } else if (yr2.budget_categories) {
        console.log(`    - years.2 비목 카테고리:`, yr2.budget_categories);
      }
    });
  } else {
    console.log("D1 하위에 프로그램이 없습니다.");
  }
}
