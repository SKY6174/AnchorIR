const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// 1. .env 파일 파싱하여 환경 변수 획득
const envFilePath = "./anchor-dashboard/.env";
let env = {};
if (fs.existsSync(envFilePath)) {
  const envFile = fs.readFileSync(envFilePath, "utf8");
  env = Object.fromEntries(
    envFile.split("\n")
      .filter(line => line && !line.startsWith("#"))
      .map(line => {
        const idx = line.indexOf("=");
        if (idx === -1) return [];
        return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
      })
      .filter(arr => arr.length === 2)
  );
} else {
  console.error("오류: .env 파일을 찾을 수 없습니다. (경로: " + envFilePath + ")");
  process.exit(1);
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY.replace(/["\r]/g, "");
const openaiKey = env.VITE_OPENAI_API_KEY.replace(/["\r]/g, "");

if (!openaiKey) {
  console.error("오류: VITE_OPENAI_API_KEY가 .env 파일에 등록되어 있지 않습니다.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. OpenAI Embedding API 호출 함수 (text-embedding-3-small, 1536차원)
async function getEmbedding(text) {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiKey}`
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-3-small"
    })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI Embedding API 에러: ${response.status} - ${errText}`);
  }
  const data = await response.json();
  return data?.data?.[0]?.embedding;
}

// 3. 지침서 및 기획서 맞춤형 마크다운 청크 분할기 (조항 또는 헤더 단위 분할)
function splitMarkdownIntoChunks(markdownText, filename) {
  const lines = markdownText.split("\n");
  const chunks = [];
  let currentChunk = "";
  let currentHeader = "일반 지식";
  let articleTitle = filename;
  
  // 파일명 분석하여 연차(year) 및 대과제 번호(unit) 도출
  let yearVal = 2; // 기본 2차년도
  if (filename.includes("1차년도") || filename.includes("2025")) {
    yearVal = 1;
  }
  
  let unitVal = "Common";
  if (filename.includes("A1가")) unitVal = "A1가";
  else if (filename.includes("A1나")) unitVal = "A1나";
  else if (filename.includes("A2")) unitVal = "A2";
  else if (filename.includes("B1")) unitVal = "B1";
  else if (filename.includes("C1")) unitVal = "C1";
  else if (filename.includes("D1")) unitVal = "D1";

  for (const line of lines) {
    // ## 또는 ### 헤더를 만나면 단락 분할 조건으로 활용
    if (line.startsWith("#")) {
      if (currentChunk.trim().length > 100) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: {
            title: currentHeader,
            unit: unitVal,
            category: "지식",
            year: yearVal,
            source: filename
          }
        });
        currentChunk = "";
      }
      currentHeader = line.replace(/#/g, "").trim();
    }
    
    // 지침서 내의 '제N조(목적)' 등을 만나면 새로운 청크로 취급하여 분할 성능 극대화
    if (line.match(/^제\d+조\s*\(/)) {
      if (currentChunk.trim().length > 100) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: {
            title: currentHeader,
            unit: unitVal,
            category: "사업비지침",
            year: yearVal,
            source: filename
          }
        });
        currentChunk = "";
      }
      currentHeader = line.trim();
    }

    currentChunk += line + "\n";

    // 800자 이상 비대해지면 단락 분리
    if (currentChunk.length >= 800) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: {
          title: currentHeader,
          unit: unitVal,
          category: filename.includes("지침") ? "사업비지침" : "일반",
          year: yearVal,
          source: filename
        }
      });
      currentChunk = "";
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      metadata: {
        title: currentHeader,
        unit: unitVal,
        category: filename.includes("지침") ? "사업비지침" : "일반",
        year: yearVal,
        source: filename
      }
    });
  }

  return chunks;
}

async function run() {
  console.log("=== RLS 권한 획득을 위해 관리자 계정 로그인 ===");
  const authRes = await supabase.auth.signInWithPassword({
    email: "director@anchor.ac.kr",
    password: "uc_anchor"
  });

  if (authRes.error) {
    console.error("오류: Supabase 인증에 실패했습니다:", authRes.error.message);
    return;
  }

  console.log("로그인 성공! 계정:", authRes.data.user.email);
  const sessionToken = authRes.data.session.access_token;
  const authSupabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${sessionToken}`
      }
    }
  });

  const docsDir = "./data/documents";
  const files = [
    "00_Ulsan_RISE_Guideline_20260701.md",
    "00_Ulsan_RISE_Guideline_20260415.md",
    "00_Ulsan_RISE_Guideline_20260401_draft.md",
    "2025_Consortium_Agreement_Namgu_Modified.md",
    "2025_Consortium_Agreement_Namgu.md",
    "University_Status.md",
    "해외_벤치마킹_일정표.md",
    "RISE_지원전략.md",
    "붙임_울산과학대학교_RISE사업_사업비_관리_지침.md",
    "단위과제별_특이지침_및_개요.md",
    "산학연협력협약_목록.md"
  ];

  console.log("=== 지식 문서 데이터 Chunking 및 임베딩 처리 시작 ===");
  
  let totalChunks = [];
  
  for (const filename of files) {
    const filePath = path.join(docsDir, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`[경고] 파일이 존재하지 않아 건너뜁니다: ${filename}`);
      continue;
    }
    
    console.log(`\n파일 파싱 중: ${filename}`);
    const mdText = fs.readFileSync(filePath, "utf8");
    const docChunks = splitMarkdownIntoChunks(mdText, filename);
    console.log(`분할 완료: ${docChunks.length}개 청크 추출됨`);
    totalChunks = totalChunks.concat(docChunks);
  }

  console.log(`\n총 처리할 청크 개수: ${totalChunks.length}개`);
  
  // DB 테이블 초기 청소 (중복 적재 방지)
  console.log("\n기존 RAG 지식 데이터 초기화 중...");
  const { error: clearErr } = await authSupabase.from("rag_documents").delete().neq("id", 0);
  if (clearErr) {
    console.warn("경고: 기존 테이블 청소 중 에러가 발생했으나 계속 진행합니다:", clearErr.message);
  }

  // 루프를 돌며 OpenAI 임베딩 변환 및 Supabase 업서트 실행
  for (let i = 0; i < totalChunks.length; i++) {
    const chunk = totalChunks[i];
    process.stdout.write(`\r진행률: [${i + 1}/${totalChunks.length}] 임베딩 변환 중...`);
    
    try {
      const embedding = await getEmbedding(chunk.content);
      
      const { error: insErr } = await authSupabase.from("rag_documents").insert({
        content: chunk.content,
        embedding: embedding,
        metadata: chunk.metadata
      });
      
      if (insErr) {
        console.error(`\n[에러] 청크 ${i + 1} 저장 실패:`, insErr.message);
      }
    } catch (e) {
      console.error(`\n[에러] 청크 ${i + 1} 임베딩 생성 오류:`, e.message);
    }
    
    // OpenAI API 속도 제어를 위해 약간의 텀(delay)을 둡니다.
    await new Promise(res => setTimeout(res, 80));
  }

  console.log("\n\n🎉 === RAG 지식 임베딩 적재가 완벽하게 완료되었습니다! ===");
}

run();
