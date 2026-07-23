import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

function scanAllExcels(dirPath) {
  console.log(`=== [전체 기간] 상장/이수증 엑셀 파일 전수 조사 [${dirPath}] ===`);
  const matchedFiles = [];
  
  function scan(dir) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        let stats;
        try {
          stats = fs.statSync(fullPath);
        } catch {
          continue;
        }
        
        if (stats.isDirectory()) {
          if (file.startsWith('.') || file === 'Library' || file === 'node_modules' || file === '.git' || file === 'TestRAG') {
            continue;
          }
          scan(fullPath);
        } else {
          const normalized = file.normalize('NFC');
          if (normalized.endsWith('.xlsx') || normalized.endsWith('.xls')) {
            if (normalized.includes('상장') || normalized.includes('이수증') || normalized.includes('증서') || normalized.includes('수료') || normalized.includes('award') || normalized.includes('cert')) {
              matchedFiles.push({
                name: normalized,
                path: fullPath,
                size: stats.size
              });
            }
          }
        }
      }
    } catch {}
  }
  
  scan(dirPath);
  
  console.log(`발견된 대상 파일 수: ${matchedFiles.length}개`);
  for (const f of matchedFiles) {
    try {
      const fileBuffer = fs.readFileSync(f.path);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      console.log(`\n파일명: ${f.name} (크기: ${(f.size / 1024).toFixed(1)} KB)`);
      console.log(`  - 시트 목록:`, workbook.SheetNames);
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log(`    * [시트] ${sheetName} -> 행 개수: ${rows.length}`);
        if (rows.length > 1) {
          console.log(`      └ 헤더:`, rows[0].slice(0, 8));
          console.log(`      └ 1행 데이터:`, rows[1].slice(0, 8));
        }
      }
    } catch (e) {
      console.log(`  - [에러] ${f.name} 읽기 실패: ${e.message}`);
    }
  }
}

scanAllExcels('/Users/thomas/Downloads');
scanAllExcels('/Users/thomas/Documents');
scanAllExcels('/Users/thomas/Desktop');
