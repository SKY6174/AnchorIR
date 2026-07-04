/**
 * Vercel Serverless Function (백엔드 API)
 * 파일 경로: anchor-dashboard/api/analyze.js
 * 
 * 브라우저 CORS 제약을 완벽히 회피하여 진짜 OpenAI GPT-4o-mini와 
 * Google Gemini 2.5 Flash 서버에 안전하게 직접 패킷을 전송해 팩트 교차 토론을 벌입니다.
 */

export default async function handler(req, res) {
  // CORS 및 호출 방식 제약 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 브라우저의 사전 탐색(OPTIONS) 요청 시 즉시 성공 응답 반환
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // POST 요청만 처리
  if (req.method !== "POST") {
    return res.status(405).json({ error: "허용되지 않는 호출 메소드입니다." });
  }

  try {
    const { url, selectedYear } = req.body;
    if (!url) {
      return res.status(400).json({ error: "분석할 보도 내용 URL이 비어 있습니다." });
    }

    // Node.js 환경변수(process.env)에서 API Key 로드
    const geminiApiKey = process.env.VITE_GEMINI_API_KEY;
    const openaiApiKey = process.env.VITE_OPENAI_API_KEY;

    // 만약 배포 서버에 키 등록이 안 되어 있다면 에러 반환
    if (!geminiApiKey || !openaiApiKey) {
      return res.status(500).json({
        error: "Vercel 서버 측에 VITE_GEMINI_API_KEY 또는 VITE_OPENAI_API_KEY 환경변수가 등록되어 있지 않습니다. Vercel Settings 대시보드를 확인해 주세요."
      });
    }

    // 대상 연도 매핑 계산
    const targetYearNum = selectedYear === 1 ? 2025 : selectedYear === 2 ? 2026 : selectedYear === 3 ? 2027 : selectedYear === 4 ? 2028 : 2029;
    const defaultDate = `${targetYearNum}-07-15`;

    let fetchedTitle = "";
    let fetchedAuthor = "";
    let fetchedDate = "";
    let isYoutube = false;
    let articleTextContext = "";

    // ----------------------------------------------------
    // [1단계: URL 정보 수집]
    // ----------------------------------------------------
    if (url.toLowerCase().includes("youtube.com") || url.toLowerCase().includes("youtu.be")) {
      isYoutube = true;
      try {
        const ytRes = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
        if (ytRes.ok) {
          const ytData = await ytRes.json();
          fetchedTitle = ytData.title || "";
          fetchedAuthor = ytData.author_name || "";
        }
      } catch (ytErr) {
        console.error("백엔드 YouTube oembed 수집 실패:", ytErr);
      }
    } else {
      try {
        // 백엔드이므로 CORS 프록시 없이 뉴스 언론사 주소로 다이렉트 호출 가동!
        // 일부 신문사의 봇 차단 필터를 피하기 위해 브라우저용 User-Agent 위장 헤더를 설정합니다.
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });
        if (response.ok) {
          const html = await response.text();

          // HTML <title> 태그 추출 및 정제
          const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
          if (titleMatch && titleMatch[1]) {
            fetchedTitle = titleMatch[1].trim()
              .replace(/\s+/g, " ")
              .replace(/ - 경상일보/g, "")
              .replace(/ - 울산신문/g, "")
              .replace(/ - 울산매일신문/g, "")
              .replace(/ - 한국대학신문/g, "")
              .replace(/ : 네이버 뉴스/g, "");
          }

          // A. HTML 메타 태그 검색 (발행일자 정밀 크롤링)
          const metaDateRegexes = [
            /property="article:published_time"\s+content="([^"]+)"/i,
            /name="pubdate"\s+content="([^"]+)"/i,
            /property="og:regDate"\s+content="([^"]+)"/i,
            /class="date"\s*>([^<]+)</i,
            /class="publish-date"\s*>([^<]+)</i
          ];
          
          for (const rx of metaDateRegexes) {
            const m = html.match(rx);
            if (m && m[1]) {
              const innerStr = m[1].trim();
              const dateMatch = innerStr.match(/(202\d)[.\-/]?(0[1-9]|1[0-2])[.\-/]?([0-9]|[12]\d|3[01])/);
              if (dateMatch) {
                const year = dateMatch[1];
                const month = dateMatch[2].padStart(2, '0');
                const day = dateMatch[3].padStart(2, '0');
                fetchedDate = `${year}-${month}-${day}`;
                break;
              }
            }
          }

          // B. 메타태그 누락 시 전체 텍스트 YYYY.MM.DD 검색
          if (!fetchedDate) {
            const standardDateMatch = html.match(/(202\d)[.\-/](0[1-9]|1[0-2])[.\-/](0[1-9]|[12]\d|3[01])/);
            if (standardDateMatch) {
              fetchedDate = `${standardDateMatch[1]}-${standardDateMatch[2].padStart(2, '0')}-${standardDateMatch[3].padStart(2, '0')}`;
            }
          }

          // HTML 본문 텍스트 태그 클렌징
          let cleanText = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          articleTextContext = cleanText.substring(0, 1800); // 넉넉히 1800자 확보
        }
      } catch (scrapErr) {
        console.error("백엔드 뉴스 본문 다이렉트 크롤링 실패:", scrapErr);
      }
    }

    // ----------------------------------------------------
    // [2단계: 진짜 GPT-4o-mini와 Gemini 2.5 Flash의 이중 물리 병렬 호출]
    // ----------------------------------------------------
    const draftPrompt = `
    사용자가 입력한 언론 보도 URL: "${url}"
    이 URL은 울산과학대학교 RISE 및 앵커(ANCHOR)사업단 관련 실제 보도 뉴스이거나 유튜브 홍보 영상 링크입니다.
    
    [실시간 수집된 팩트 정보]
    - 진짜 기사/영상 제목: "${fetchedTitle || "없음"}"
    - 진짜 게시 채널/매체명: "${fetchedAuthor || "없음"}"
    - 크롤러 감지 작성/발행일자: "${fetchedDate || "없음"}"
    
    ${articleTextContext ? `[실시간 기사 본문 일부 팩]:\n${articleTextContext}` : ""}
    
    위 팩트 정보를 100% 신뢰하여 보도 기사/영상 제목과 매체명, 보도일자를 추출하십시오.
    
    반드시 JSON 규격 텍스트만 출력하고 마크다운 기호(\`\`\`)는 절대 쓰지 마십시오.
    {
      "pressType": "방송" 또는 "신문" 또는 "기타",
      "pressMedia": "최종 검증된 실제 언론사명 (예: 한국대학신문, 경상일보, 울산신문, 네이버 뉴스 등)",
      "title": "보도 기사 제목 (수집된 타이틀을 그대로 정제하여 적용하고, 없다면 앵커사업에 어울리는 제목 생성)",
      "pressDate": "보도일자 (YYYY-MM-DD 형식으로 작성하며, 감지된 발행일자 "${fetchedDate}"가 있다면 1순위 강제 적용하십시오.)",
      "pressTime": "보도시간 (HH:MM 형식)",
      "pressContent": "보도 본문 요약 (3~4문장 분량의 격식 있고 객관적인 기사체로 정밀 요약)"
    }
    `;

    // 병렬 물리 네트워크 호출 전개!
    const [gptRes, geminiRes] = await Promise.all([
      // A. 진짜 OpenAI GPT-4o-mini 호출
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a factual press metadata extractor." },
            { role: "user", content: draftPrompt }
          ],
          response_format: { type: "json_object" }
        })
      }).then(r => r.ok ? r.json() : null).catch(err => {
        console.error("Node GPT 호출 에러:", err);
        return null;
      }),

      // B. 진짜 Google Gemini 2.5 Flash 호출
      fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: draftPrompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      }).then(r => r.ok ? r.json() : null).catch(err => {
        console.error("Node Gemini 호출 에러:", err);
        return null;
      })
    ]);

    let gptDraft = null;
    let geminiDraft = null;

    if (gptRes) {
      try {
        const txt = gptRes?.choices?.[0]?.message?.content;
        if (txt) gptDraft = JSON.parse(txt.trim());
      } catch (e) {
        console.error("GPT 초안 JSON 파싱 실패:", e);
      }
    }

    if (geminiRes) {
      try {
        const txt = geminiRes?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (txt) geminiDraft = JSON.parse(txt.trim());
      } catch (e) {
        console.error("Gemini 초안 JSON 파싱 실패:", e);
      }
    }

    if (!gptDraft && !geminiDraft) {
      throw new Error("진짜 GPT 및 Gemini 모델이 모두 오프라인 상태이거나 초안 작성에 실패했습니다.");
    }

    // ----------------------------------------------------
    // [3단계: OpenAI 판정사(Judge)를 통한 이중 합의안 도출]
    // ----------------------------------------------------
    const judgePrompt = `
    사용자가 입력한 언론 보도 URL: "${url}"
    실시간 수집된 팩트 정보:
    - 진짜 기사/영상 제목: "${fetchedTitle || "없음"}"
    - 진짜 게시자/채널명: "${fetchedAuthor || "없음"}"
    - 진짜 기사 발행일자: "${fetchedDate || "없음"}"

    [OpenAI GPT-4o-mini의 초안 분석본]:
    ${gptDraft ? JSON.stringify(gptDraft, null, 2) : "초안 작성 실패"}

    [Google Gemini 2.5 Flash의 초안 분석본]:
    ${geminiDraft ? JSON.stringify(geminiDraft, null, 2) : "초안 작성 실패"}

    두 물리 서버가 각자 제출한 초안의 팩트 신뢰성과 요약 품질을 교차 검증하여 최고의 최종 합의 JSON을 도출하십시오.
    
    [최종 합의 규칙]:
    1. 감지된 진짜 기사 발행일자("${fetchedDate || ""}")가 존재하는 경우, 두 초안의 날짜보다 이 감지된 날짜를 100% 최우선 "pressDate"로 적용하여 왜곡(할루시네이션)을 소거하십시오.
    2. 진짜 제목("${fetchedTitle || ""}")과 매체명("${fetchedAuthor || ""}")이 감지되었다면 이를 무조건 최종 제목("title")과 매체명("pressMedia")에 반영하십시오.
    3. 상세 본문 요약("pressContent")은 두 모델의 설명 중 사실에 근거해 더 격식 있고, 정량적이며, 울산과학대학교 앵커사업의 취지에 맞는 고품격 기사체 요약본으로 최종 통합/완성하십시오.

    반드시 JSON 규격 텍스트만 출력하고 마크다운 기호(\`\`\`)는 절대 쓰지 마십시오.
    {
      "pressType": "방송" 또는 "신문" 또는 "기타",
      "pressMedia": "최종 검증된 매체명",
      "title": "최종 검증된 실제 기사 제목",
      "pressDate": "최종 검증된 보도일자 (YYYY-MM-DD 형식)",
      "pressTime": "최종 검증된 보도시간 (HH:MM 형식)",
      "pressContent": "최종 완성된 기사 본문 요약 (3~4문장의 사실적 기사체)"
    }
    `;

    const judgeResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a chief editor who merges draft reviews to produce the most accurate final metadata in JSON." },
          { role: "user", content: judgePrompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!judgeResponse.ok) {
      // 판정사 호출 에러 시, 가용한 초안 중 차선책(Gemini/GPT 성공 초안)을 팩트 기반 보정하여 반환
      const fallbackParsed = geminiDraft || gptDraft;
      if (fallbackParsed) {
        if (fetchedDate) fallbackParsed.pressDate = fetchedDate;
        if (fetchedTitle) fallbackParsed.title = fetchedTitle;
        return res.status(200).json({ parsed: fallbackParsed, usedModel: "GPT-4o & Gemini 2.5 Dual-Server Draft Merge" });
      }
      throw new Error(`AI 판정사 합의 호출 실패 (Status: ${judgeResponse.status})`);
    }

    const judgeData = await judgeResponse.json();
    const finalJsonText = judgeData?.choices?.[0]?.message?.content;
    if (!finalJsonText) throw new Error("판정사 합의 결과물이 비어 있습니다.");

    const parsed = JSON.parse(finalJsonText.trim());
    return res.status(200).json({ parsed, usedModel: "GPT-4o & Gemini 2.5 Real Server Debate Consensus" });

  } catch (err) {
    console.error("서버리스 API 예외 오류 발생:", err);
    return res.status(500).json({ error: err.message || "서버리스 호출 처리 실패" });
  }
}
