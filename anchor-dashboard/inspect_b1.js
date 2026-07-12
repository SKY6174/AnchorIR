import fs from 'fs';

const raw = fs.readFileSync('projects_data_year_2.json', 'utf8');
const data = JSON.parse(raw);

let b1Unit = null;
for (const strategy of data) {
  if (strategy.units) {
    const found = strategy.units.find(u => u.id === 'B1');
    if (found) {
      b1Unit = found;
      break;
    }
  }
}

if (b1Unit) {
  console.log("=== B1 단위과제 정보 ===");
  console.log("Title:", b1Unit.title);
  console.log("Years 2 Budget Info:", b1Unit.years?.['2']);
  console.log(`Programs 개수: ${b1Unit.programs?.length}`);
  
  b1Unit.programs.forEach((p, i) => {
    console.log(`[${i+1}] ID: ${p.id} | Title: ${p.title} | Years 2 Budget: ${p.years?.['2'] ? '존재' : '없음'}`);
  });
} else {
  console.log("B1 단위과제를 찾지 못했습니다.");
}
