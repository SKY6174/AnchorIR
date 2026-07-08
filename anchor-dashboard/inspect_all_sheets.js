import * as XLSX from 'xlsx';
import fs from 'fs';

function inspectWorkbook(filePath) {
  console.log(`\n=== 엑셀 모든 시트 검사 [${filePath}] ===`);
  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  
  console.log("시트 목록:", workbook.SheetNames);
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`  - 시트 [${sheetName}] -> 행 개수: ${rows.length}`);
    if (rows.length > 1) {
      console.log(`    * 헤더:`, rows[0]);
      console.log(`    * 샘플:`, rows[1]);
    }
  }
}

try {
  inspectWorkbook('/Users/thomas/Downloads/상장_이수증_2년차.xlsx');
  inspectWorkbook('/Users/thomas/Downloads/상장_이수증_2년차 (1).xlsx');
  inspectWorkbook('/Users/thomas/Downloads/상장_이수증_2년차 (2).xlsx');
  inspectWorkbook('/Users/thomas/Downloads/상장_이수증_2년차 (3).xlsx');
  inspectWorkbook('/Users/thomas/Downloads/UC_ANCHOR_이수증_업로드_서식.xlsx');
} catch (e) {
  console.error("Error inspecting sheets:", e);
}
