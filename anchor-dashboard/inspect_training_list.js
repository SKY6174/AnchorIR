import * as XLSX from 'xlsx';
import fs from 'fs';

function inspectWorkbook(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    console.log(`\n=== 엑셀 내용 정밀 검사 [${filePath}] ===`);
    console.log("시트 목록:", workbook.SheetNames);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`행 개수: ${rows.length}`);
    if (rows.length > 0) {
      console.log("첫 5행 데이터:");
      console.log(rows.slice(0, 5));
    }
  } catch (e) {
    console.error(e);
  }
}

inspectWorkbook('/Users/thomas/Downloads/앵커 연수 신청자 명단.xlsx');
