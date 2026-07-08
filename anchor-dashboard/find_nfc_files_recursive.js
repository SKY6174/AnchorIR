import fs from 'fs';
import path from 'path';

function scanDirRecursive(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      
      // 권한 검사 및 예외 처리
      let stats;
      try {
        stats = fs.statSync(fullPath);
      } catch (e) {
        continue;
      }
      
      if (stats.isDirectory()) {
        // 권한 에러 유발 및 불필요한 시스템 디렉토리 스킵
        if (file.startsWith('.') || file === 'Library' || file === 'node_modules' || file === '.git' || file === 'TestRAG') {
          continue;
        }
        scanDirRecursive(fullPath);
      } else {
        const normalized = file.normalize('NFC');
        if (normalized.includes('상장') || normalized.includes('이수증') || normalized.includes('증서') || normalized.includes('수료') || normalized.includes('award') || normalized.includes('cert')) {
          if (normalized.endsWith('.xlsx') || normalized.endsWith('.xls') || normalized.endsWith('.csv')) {
            console.log(`  [발견] 이름: ${normalized} | 크기: ${(stats.size / 1024).toFixed(1)} KB | 경로: ${fullPath}`);
          }
        }
      }
    }
  } catch (e) {
    // 디렉토리 읽기 실패 시 무시
  }
}

console.log("=== 재귀적 NFC 정밀 스캔 시작 ===");
scanDirRecursive('/Users/thomas/Downloads');
scanDirRecursive('/Users/thomas/Documents');
scanDirRecursive('/Users/thomas/Desktop');
console.log("=== 스캔 종료 ===");
