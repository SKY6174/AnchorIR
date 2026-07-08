import fs from 'fs';
import path from 'path';

function scanDir(dirPath) {
  console.log(`=== 디렉토리 NFC 정규화 정밀 검색 [${dirPath}] ===`);
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      // NFC 정규화
      const normalized = file.normalize('NFC');
      if (normalized.includes('상장') || normalized.includes('이수증') || normalized.includes('증서') || normalized.includes('수료')) {
        const fullPath = path.join(dirPath, file);
        const stats = fs.statSync(fullPath);
        console.log(`  [발견] 이름: ${normalized} | 크기: ${(stats.size / 1024).toFixed(1)} KB | 경로: ${fullPath}`);
      }
    }
  } catch (e) {
    console.error(`Error scanning ${dirPath}:`, e);
  }
}

scanDir('/Users/thomas/Downloads');
scanDir('/Users/thomas/Documents');
scanDir('/Users/thomas/Desktop');
