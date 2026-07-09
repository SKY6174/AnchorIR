import fs from 'fs';

const filePath = './projects_data_year_2.json';
const raw = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(raw);

const d1 = data.flatMap(s => s.units || []).find(u => u.id === 'D1');

if (!d1) {
  console.log("D1 단위과제를 찾을 수 없습니다.");
} else {
  console.log("=== 현재 D1 하위 프로그램 심플 리스트 ===");
  if (d1.programs) {
    d1.programs.forEach((p, idx) => {
      const yr2 = p.years?.["2"] || {};
      console.log(`[${idx + 1}] ID: ${p.id} | Title: ${p.title} | Main Budget: ${yr2.budget_main} | Assignee: ${p.assignee}`);
    });
  } else {
    console.log("D1 하위에 프로그램이 없습니다.");
  }
}
