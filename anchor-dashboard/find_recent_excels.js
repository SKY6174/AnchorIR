import fs from 'fs';
import path from 'path';

function findRecentExcels(dirPath) {
  console.log(`=== 최근 수정된 엑셀 파일 검색 (7일 이내) [${dirPath}] ===`);
  const filesList = [];
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  
  function scan(dir) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        let stats;
        try {
          stats = fs.statSync(fullPath);
        } catch (e) {
          continue;
        }
        
        if (stats.isDirectory()) {
          if (file.startsWith('.') || file === 'Library' || file === 'node_modules' || file === '.git' || file === 'TestRAG') {
            continue;
          }
          scan(fullPath);
        } else {
          if (file.endsWith('.xlsx') || file.endsWith('.xls')) {
            const diff = now - stats.mtimeMs;
            if (diff <= sevenDaysMs) {
              filesList.push({
                name: file.normalize('NFC'),
                path: fullPath,
                mtime: stats.mtime,
                sizeKb: (stats.size / 1024).toFixed(1)
              });
            }
          }
        }
      }
    } catch (e) {}
  }
  
  scan(dirPath);
  
  // 수정 시간 역순 정렬
  filesList.sort((a, b) => b.mtime - a.mtime);
  
  for (const f of filesList) {
    console.log(`  - [최근] 이름: ${f.name} | 수정일: ${f.mtime.toLocaleString()} | 크기: ${f.sizeKb} KB | 경로: ${f.path}`);
  }
}

findRecentExcels('/Users/thomas/Downloads');
findRecentExcels('/Users/thomas/Documents');
findRecentExcels('/Users/thomas/Desktop');
