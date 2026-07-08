import * as XLSX from 'xlsx';
import fs from 'fs';

function inspectWorkbook(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    console.log(`\n=== 엑셀 내용 정밀 검사 [${filePath}] ===`);
    console.log("시트 목록:", workbook.SheetNames);
  } catch (e) {
    console.error(e);
  }
}

inspectWorkbook('/Users/thomas/Documents/AnchorIR/data/documents/02-SKY/2025년/RISE2025-Evidence/RISE_EvidenceList_C1.xlsx');
inspectWorkbook('/Users/thomas/Documents/AnchorIR/data/documents/02-SKY/2025년/RISE2025-Evidence/RISE_EvidenceList_C3.xlsx');
