import fs from 'fs';

const filePath = './projects_data_year_2.json';
console.log("=== D3 단위과제 담당자 오영경 정정 스크립트 실행 ===");

try {
  if (!fs.existsSync(filePath)) {
    console.error(`오류: ${filePath} 파일이 존재하지 않습니다.`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(rawData);

  let modifiedCount = 0;

  data.forEach(strat => {
    if (strat.units) {
      strat.units.forEach(unit => {
        if (unit.id === "D3") {
          // D3 단위과제의 매니저도 확인
          if (unit.manager !== "현용환 RCC센터장") {
            unit.manager = "현용환 RCC센터장";
            console.log("  - D3 단위과제 매니저를 현용환 RCC센터장으로 정정 완료");
          }
          if (unit.programs) {
            unit.programs.forEach(prog => {
              if (prog.id.startsWith("D3-") && prog.assignee === "오영경 연구원") {
                prog.assignee = "오영경";
                modifiedCount++;
                console.log(`  - 프로그램 ${prog.id} 담당자를 '오영경'으로 정정 완료`);
              }
            });
          }
        }
      });
    }
  });

  if (modifiedCount > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`\n=== D3 담당자 정정 완료! (정정 개수: ${modifiedCount}개) ===`);
  } else {
    console.log("\n정정할 대상이 없습니다.");
  }

} catch (err) {
  console.error("오류 발생:", err);
}
