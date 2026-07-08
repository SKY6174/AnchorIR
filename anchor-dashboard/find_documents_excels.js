import fs from 'fs';
import path from 'path';

function scanDirRecursive(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      let stats;
      try {
        stats = fs.statSync(fullPath);
      } catch (e) {
        continue;
      }
      
      if (stats.isDirectory()) {
        scanDirRecursive(fullPath);
      } else {
        const normalized = file.normalize('NFC');
        if (normalized.endsWith('.xlsx') || normalized.endsWith('.xls') || normalized.endsWith('.csv')) {
          console.log(`  [문서 폴더 발견] 이름: ${normalized} | 크기: ${(stats.size / 1024).toFixed(1)} KB | 경로: ${fullPath}`);
        }
      }
    }
  } catch (e) {}
}

console.log("=== documents 폴더 내 모든 엑셀 스캔 시작 ===");
scanDirRecursive('/Users/thomas/Documents/AnchorIR/data/documents');
console.log("=== 스캔 종료 ===");
