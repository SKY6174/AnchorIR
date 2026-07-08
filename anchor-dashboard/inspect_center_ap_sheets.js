import * as XLSX from 'xlsx';
import fs from 'fs';

function inspectWorkbook(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    console.log(`\n=== [${filePath.split('/').pop()}] 시트 목록 ===`);
    console.log("시트 이름:", workbook.SheetNames);
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (rows.length > 0) {
        console.log(`  - ${sheetName}: 행 개수 ${rows.length}`);
      }
    }
  } catch (e) {
    // console.error(e);
  }
}

const dir = '/Users/thomas/Downloads/06 2026앵커_프로그램ID관리파일';
inspectWorkbook(`${dir}/01 ECC_AP파일_260701.xlsx`);
inspectWorkbook(`${dir}/02 신산업특화센터_AP파일_260701.xlsx`);
inspectWorkbook(`${dir}/03 ICC_AP파일_260701.xlsx`);
inspectWorkbook(`${dir}/04 AIDX_AP파일_260701.xlsx`);
inspectWorkbook(`${dir}/05 RCC_AP파일_260701.xlsx`);
inspectWorkbook(`${dir}/06 울산늘봄누리센터_AP파일_260701.xlsx`);
