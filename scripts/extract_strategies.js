const fs = require('fs');
const path = require('path');

const rootDir = '/Users/thomas/Documents/AnchorIR';
const targetDir = path.join(rootDir, 'docs/2nd_year');
const files = fs.readdirSync(targetDir).filter(f => f.startsWith('anchor_2nd_year_unit_') && f.endsWith('_proposal.md'));

const result = {};

files.forEach(file => {
  const wsIdMatch = file.match(/unit_([a-z0-9]+)_proposal\.md/);
  if (!wsIdMatch) return;
  const wsIdRaw = wsIdMatch[1];
  
  // A1인 경우, A1가 / A1나 구분
  let wsId = wsIdRaw.toUpperCase();
  if (wsId === 'A1') {
    // a1 proposal을 파싱할 때 파일 제목이나 내용을 보고 판별하거나 둘 다 뽑아냄
    wsId = 'A1';
  }

  const content = fs.readFileSync(path.join(targetDir, file), 'utf-8');
  const lines = content.split('\n');
  
  let strategies = [];
  let currentSection = '';
  
  // 1. 추진전략 추출
  let inStrategy = false;
  let inTasks = false;
  let tasks = []; // { strat: '', taskList: [] }
  let currentStrat = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('## 1. 추진전략')) {
      inStrategy = true;
      continue;
    }
    if (line.startsWith('## 2.')) {
      inStrategy = false;
      inTasks = true;
      continue;
    }
    if (line.startsWith('## 3.') || line.startsWith('## 4.')) {
      inTasks = false;
      continue;
    }

    if (inStrategy) {
      // > **[S1] ...** 형태 파싱
      const match = line.match(/\[(S\d+)\]\s*(.+)/);
      if (match) {
        strategies.push({
          id: match[1],
          title: match[2].replace(/\*\*|>/g, '').trim()
        });
      }
    }

    if (inTasks) {
      // ### 📌 [추진전략 S1] ...
      const stratMatch = line.match(/###\s*📌\s*\[추진전략\s*(S\d+)\]\s*(.+)/);
      if (stratMatch) {
        currentStrat = stratMatch[1];
      }
      
      // #### 1) [추진과제 1-1] ...
      const taskMatch = line.match(/####\s*\d+\)\s*\[추진과제\s*([\d\-가-힣]+)\]\s*(.+)/);
      if (taskMatch) {
        tasks.push({
          strat: currentStrat,
          id: taskMatch[1],
          title: taskMatch[2].trim()
        });
      }
    }
  }

  // A1의 경우 A1가, A1나 분기 처리
  if (wsId === 'A1') {
    // A-1 proposal의 파일명을 보면, A1가와 A1나에 대한 추진내용이 섞여있거나 나뉘어 있음.
    // 일단 A1으로 수집
    result['A1'] = { strategies, tasks };
  } else {
    result[wsId] = { strategies, tasks };
  }
});

fs.writeFileSync(path.join(rootDir, 'scripts/extracted_result.json'), JSON.stringify(result, null, 2), 'utf-8');
console.log("Successfully extracted to scripts/extracted_result.json");
