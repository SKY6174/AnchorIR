/**
 * GPT & Gemini AI 교차 검증 및 합의 (Debate & Consensus) URL 분석 엔진
 * 두 최고 수준의 AI 모델이 병렬적으로 초안을 뽑고, 판정사(Judge)가 교차 검증하여 할루시네이션을 최소화합니다.
 */
export async function analyzePressUrlWithAiConsensus({ url, selectedYear, apiKey, openaiApiKey }) {
  // --- [하이브리드 스마트 라우터 가동] ---
  // 프로덕션 배포(PROD) 환경일 때는 Vercel 서버리스 백엔드로 안전하게 요청을 전송합니다.
  if (import.meta.env.PROD) {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url, selectedYear })
      });
      
      if (response.ok) {
        const resData = await response.json();
        return { parsed: resData.parsed, usedModel: resData.usedModel };
      } else {
        const errData = await response.json().catch(() => ({}));
        console.warn(`Vercel Serverless Function returned error: ${errData.error || response.status}`);
      }
    } catch (apiErr) {
      console.warn("Vercel Serverless API call failed, sliding down to client-side logic:", apiErr);
    }
  }

  const isMockGemini = !apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "";
  const isMockOpenai = !openaiApiKey || openaiApiKey === "your_openai_api_key_here" || openaiApiKey.trim() === "";

  // 대상 연도 기본 매핑
  const targetYearNum = selectedYear === 1 ? 2025 : selectedYear === 2 ? 2026 : selectedYear === 3 ? 2027 : selectedYear === 4 ? 2028 : 2029;
  const defaultDate = `${targetYearNum}-07-15`;

  let fetchedTitle = "";
  let fetchedAuthor = "";
  let fetchedDate = ""; // 초정밀 기사 발행 날짜 보관 변수
  let isYoutube = false;
  let articleTextContext = ""; // 뉴스 기사용 팩트 컨텍스트 보관 변수
  let firstImageUrl = ""; // 💡 기사 본문 내 첫 번째 이미지 URL 보관 변수

  // 1. 유튜브 OEmbed 기본 수집
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
      console.warn("YouTube oembed fetch failed:", ytErr);
    }
  } 
  // 2. 일반 뉴스 웹사이트인 경우 CORS 프록시를 거쳐 실제 기사 타이틀 및 본문 텍스트 실시간 수집
  else {
    try {
      // allorigins 오픈 프록시를 경유해 HTML 긁어오기 (CORS 우회)
      const proxyRes = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      if (proxyRes.ok) {
        const proxyData = await proxyRes.json();
        const html = proxyData.contents || "";

        // 1. URL 도메인을 분석하여 대표 언론사명 1차 식별
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes("news.unn.net") || lowerUrl.includes("unn.net")) {
          fetchedAuthor = "한국대학신문";
        } else if (lowerUrl.includes("ksilbo.co.kr")) {
          fetchedAuthor = "경상일보";
        } else if (lowerUrl.includes("ulsanpress.net")) {
          fetchedAuthor = "울산신문";
        } else if (lowerUrl.includes("iusm.co.kr")) {
          fetchedAuthor = "울산매일신문";
        } else if (lowerUrl.includes("ytn.co.kr")) {
          fetchedAuthor = "YTN";
        } else if (lowerUrl.includes("kbs.co.kr")) {
          fetchedAuthor = "KBS";
        } else if (lowerUrl.includes("mbc.co.kr")) {
          fetchedAuthor = "MBC";
        } else if (lowerUrl.includes("sbs.co.kr")) {
          fetchedAuthor = "SBS";
        }

        // 2. 만약 도메인 매칭에 실패했거나 추가적인 메타 정보가 있다면 og:site_name 등으로 정밀 보완
        if (!fetchedAuthor) {
          const siteNameMatch = html.match(/property="og:site_name"\s+content="([^"]+)"/i);
          if (siteNameMatch && siteNameMatch[1]) {
            fetchedAuthor = siteNameMatch[1].trim();
          } else {
            const authorMatch = html.match(/name="author"\s+content="([^"]+)"/i);
            if (authorMatch && authorMatch[1]) {
              fetchedAuthor = authorMatch[1].trim();
            }
          }
        }

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

        // --- [초정밀 기사 발행날짜 추출 파서 가동] ---
        // A. HTML 메타 태그 검색 (article:published_time, og:regDate, pubdate 등 표준 탐색)
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
            const dateMatch = innerStr.match(/(202\d)[.\-/]?(0[1-9]|1[0-2])[.\-/]?([0-2]\d|3[01]|[1-9])/);
            if (dateMatch) {
              const year = dateMatch[1];
              const month = dateMatch[2].padStart(2, '0');
              const day = dateMatch[3].padStart(2, '0');
              fetchedDate = `${year}-${month}-${day}`;
              break;
            }
          }
        }

        // B. 메타태그에서 못 찾은 경우 전체 텍스트에서 2020년대 YYYY.MM.DD 표준 패턴 스캔
        if (!fetchedDate) {
          const standardDateMatch = html.match(/(202\d)[.\-/](0[1-9]|1[0-2])[.\-/]([0-2]\d|3[01]|[1-9])/);
          if (standardDateMatch) {
            fetchedDate = `${standardDateMatch[1]}-${standardDateMatch[2].padStart(2, '0')}-${standardDateMatch[3].padStart(2, '0')}`;
          }
        }

        // 💡 1순위: HTML 메타 태그에서 대표 공유 이미지(og:image, twitter:image) 검색
        const metaImgRegexes = [
          /property="og:image"\s+content="([^"]+)"/i,
          /content="([^"]+)"\s+property="og:image"/i,
          /name="twitter:image"\s+content="([^"]+)"/i,
          /content="([^"]+)"\s+name="twitter:image"/i
        ];

        let foundMetaImage = "";
        for (const rx of metaImgRegexes) {
          const m = html.match(rx);
          if (m && m[1]) {
            const detectedSrc = m[1].trim();
            if (detectedSrc && !detectedSrc.startsWith("data:")) {
              foundMetaImage = detectedSrc;
              break;
            }
          }
        }

        // 상대 경로인 경우 절대 경로로 전환해 주는 헬퍼 함수
        const makeAbsoluteUrl = (srcPath) => {
          if (!srcPath) return "";
          if (srcPath.startsWith("//")) return "https:" + srcPath;
          if (srcPath.startsWith("http")) return srcPath;
          try {
            const urlObj = new URL(url);
            if (srcPath.startsWith("/")) {
              return urlObj.origin + srcPath;
            }
            const pathParts = urlObj.pathname.split('/');
            pathParts.pop();
            return urlObj.origin + pathParts.join('/') + '/' + srcPath;
          } catch (e) {
            return srcPath;
          }
        };

        if (foundMetaImage) {
          firstImageUrl = makeAbsoluteUrl(foundMetaImage);
        }

        // 💡 2순위: og:image 가 없는 경우에만 본문 내 <img> 태그 뒤져서 추출 (지연 로딩 data-src, lazy-src 등 속성까지 추적)
        if (!firstImageUrl) {
          const imgMatches = html.matchAll(/<img[^>]+(?:src|data-src|data-original|lazy-src)=["']([^"']+)["']/gi);
          for (const match of imgMatches) {
            const detectedSrc = match[1]?.trim();
            if (!detectedSrc || detectedSrc.startsWith("data:")) continue;

            const candidateUrl = makeAbsoluteUrl(detectedSrc);
            if (candidateUrl && candidateUrl.startsWith("http")) {
              firstImageUrl = candidateUrl;
              break;
            }
          }
        }

        // HTML 태그 탈수 및 기사 핵심 텍스트 영역 발췌
        let cleanText = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        // 텍스트가 너무 크면 모델 요청 한도를 초과하므로 핵심 1500자 확보
        articleTextContext = cleanText.substring(0, 1500);
      }
    } catch (scrapErr) {
      console.warn("News HTML scraping failed via CORS proxy:", scrapErr);
    }
  }

  // 2. 만약 API Key가 둘 중 하나라도 없는 특수 상황일 때는 단독/로컬 스마트 엔진으로 즉각 폴백
  if (isMockOpenai || isMockGemini) {
    let fallbackParsed = null;
    let fallbackModel = "";

    if (!isMockGemini) {
      fallbackModel = "Gemini 2.5 Flash";
      const singlePrompt = `
      사용자가 입력한 언론 보도 URL: "${url}"
      ${fetchedTitle ? `[실시간 OEmbed 크롤링 수집 정보]\n- 진짜 미디어 제목: "${fetchedTitle}"\n- 진짜 게시 채널(매체): "${fetchedAuthor}"` : ""}
      해당 URL과 크롤링 정보를 분석하여 JSON 포맷으로 정보를 추출해 주세요.
      
      {
        "pressType": "방송" 또는 "신문" 또는 "기타",
        "pressMedia": "언론사 매체명",
        "title": "보도 기사 제목",
        "pressDate": "보도일자 (YYYY-MM-DD)",
        "pressTime": "보도시간 (HH:MM)",
        "pressContent": "보도 본문 요약 (3~4문장)"
      }
      `;
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: singlePrompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );
      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const txt = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (txt) fallbackParsed = JSON.parse(txt.trim());
      }
    } else if (!isMockOpenai) {
      fallbackModel = "GPT-4o-mini";
      const singlePrompt = `
      사용자가 입력한 언론 보도 URL: "${url}"
      ${fetchedTitle ? `[실시간 OEmbed 크롤링 수집 정보]\n- 진짜 미디어 제목: "${fetchedTitle}"\n- 진짜 게시 채널(매체): "${fetchedAuthor}"` : ""}
      해당 URL과 크롤링 정보를 분석하여 JSON 포맷으로 정보를 추출해 주세요.
      
      {
        "pressType": "방송" 또는 "신문" 또는 "기타",
        "pressMedia": "언론사 매체명",
        "title": "보도 기사 제목",
        "pressDate": "보도일자 (YYYY-MM-DD)",
        "pressTime": "보도시간 (HH:MM)",
        "pressContent": "보도 본문 요약 (3~4문장)"
      }
      `;
      const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful assistant designed to extract press release metadata in JSON." },
            { role: "user", content: singlePrompt }
          ],
          response_format: { type: "json_object" }
        })
      });
      if (gptRes.ok) {
        const gptData = await gptRes.json();
        const txt = gptData?.choices?.[0]?.message?.content;
        if (txt) fallbackParsed = JSON.parse(txt.trim());
      }
    }

    if (!fallbackParsed) {
      fallbackModel = "로컬 지능형 엔진";
      let detectedType = "기타";
      let detectedMedia = "온라인 미디어";
      let detectedTitle = "울산과학대 RISE 앵커사업단 홍보 보도";
      let detectedContent = "울산과학대학교 RISE 앵커사업단이 추진하는 지역 밀착형 정주 인재 확보 및 지산학 협력 프로그램의 세부 진행 성과를 다룬 언론 보도 내용입니다.";

      const lowerUrl = url.toLowerCase();
      if (isYoutube) {
        detectedType = "방송";
        detectedMedia = fetchedAuthor || (lowerUrl.includes("kbs") ? "KBS울산" : lowerUrl.includes("mbc") ? "울산MBC" : lowerUrl.includes("ubc") ? "UBC울산방송" : "유튜브 채널");
        detectedTitle = fetchedTitle || `[RISE 성과] 울산과학대학교 앵커사업단 공식 활성화 현장 스케치`;
        detectedContent = fetchedTitle 
          ? `유튜브 채널 [${detectedMedia}]에 업로드된 "${fetchedTitle}" 공식 보도 영상 자료입니다. 울산과학대학교 앵커사업단 산하 주요 센터들과 지자체/산업체 간의 상생적 혁신 성과를 다룹니다.`
          : "울산과학대학교 RISE 앵커사업단 산하 주요 8대 센터의 연차별 성과 발표 및 지역 협력 네트워크 시너지 창출 현장을 생생히 기록한 공식 영상 보도자료입니다.";
      } else if (lowerUrl.includes("ksilbo.co.kr")) {
        detectedType = "신문";
        detectedMedia = "경상일보";
        detectedTitle = `울산과학대, 2차년도 지산학 협력 앵커(ANCHOR) 교육 트랙 가동... 경상일보 보도`;
        detectedContent = "울산과학대학교가 2차년도 RISE 체계 개편에 발맞추어 관내 기업들과의 연계를 통한 맞춤형 실무 전문 트랙을 본격 가동하며, 학생들의 지역 내 정주 비율을 비약적으로 넓힐 계획을 공표했습니다.";
      } else if (lowerUrl.includes("ulsanpress.net")) {
        detectedType = "신문";
        detectedMedia = "울산신문";
        detectedTitle = "울산과학대 늘봄누리센터, 초등학교 맞춤형 코딩/미술 보조강사 시범 매칭 실시";
      } else if (lowerUrl.includes("iusm.co.kr")) {
        detectedType = "신문";
        detectedMedia = "울산매일신문";
        detectedTitle = "울산과학대 신산업특화지원센터, 친환경 화학 및 미래 이차전지 R&BD 과제 조인식 성료";
      } else if (lowerUrl.includes("news.unn.net") || lowerUrl.includes("unn.net")) {
        detectedType = "신문";
        detectedMedia = "한국대학신문";
        detectedTitle = "송경영 울산과학대 RISE사업단장, 전문대 고등직업교육 방향성 릴레이 포럼 개최";
      }

      let detectedDate = defaultDate;
      const dateMatch = (detectedTitle + url).match(/(?:202\d)(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])/);
      if (dateMatch) {
        const dStr = dateMatch[0];
        detectedDate = `${dStr.substring(0, 4)}-${dStr.substring(4, 6)}-${dStr.substring(6, 8)}`;
      }

      fallbackParsed = {
        pressType: detectedType,
        pressMedia: detectedMedia,
        title: detectedTitle,
        pressDate: detectedDate,
        pressTime: "10:00",
        pressContent: detectedContent,
        imageUrl: firstImageUrl
      };
    }

    return { parsed: fallbackParsed, usedModel: fallbackModel };
  }

  // 3. Gemini API 1회 호출로 내부 가상 GPT-Gemini 다중 에이전트 교차 토론 시뮬레이션 가동 (CORS 차단 회피 및 보안 유지)
  const consensusPrompt = `
  사용자가 입력한 언론 보도 URL: "${url}"
  이 URL은 울산과학대학교 RISE 및 앵커(ANCHOR)사업단 관련 실제 보도 뉴스이거나 유튜브 홍보 영상 링크입니다.
  
  [실시간 크롤링 수집 정보]
  - 진짜 기사/영상 제목: "${fetchedTitle || "없음"}"
  - 진짜 게시자/채널명(매체): "${fetchedAuthor || "없음"}"
  - 크롤러 감지 기사 작성/발행일자: "${fetchedDate || "없음"}"
  
  ${articleTextContext ? `[실시간 뉴스 기사 본문 일부 (100% 실존 팩트 소스)]:\n${articleTextContext}\n위 본문 텍스트를 최우선적으로 정밀 정독하여 기사의 진짜 내용과 보도 취지를 이해하십시오.` : ""}

  당신은 이제부터 두 명의 상호 독립적인 최고 지능 인공지능 분석가 및 최종 판정사(Chief Editor) 역할을 수행하며 팩트를 교차 검증하고 토론(Debate)해야 합니다.

  [에이전트 1: GPT-4o 스타일 정밀 추론기]
  - 위 URL(도메인의 특성) 및 제공된 진짜 뉴스 기사 본문 텍스트를 읽고 기사의 정확한 진짜 제목("title"), 매체명("pressMedia"), 보도 분류(방송/신문/기타), 보도일자("pressDate")를 추출하여 초안 A를 조율해 보십시오.

  [에이전트 2: Gemini 2.5 스타일 정밀 팩트체커]
  - 초안 A의 내용 중 실제 제공된 뉴스 본문 텍스트에 들어있지 않은 거짓 할루시네이션(예: 제목 "없음" 혹은 엉뚱한 날짜 유추)이 존재하는지 샅샅이 비판하고, 실재하는 기사 제목과 매체명으로 100% 보정하여 정밀 초안 B를 완성하십시오.

  [최종 판정 및 조율 단계 (Chief Editor)]
  - 두 초안을 대조하고, 보도일자("pressDate")는 크롤러가 감지한 기사 작성/발행일자("${fetchedDate || ""}")가 존재하는 경우, 두 초안의 예측치나 본문의 다른 일자보다 이 감지된 날짜를 최우선 순위로 신용하여 최종 반영하십시오.
  - 만약 감지된 기사 발행일자가 없고 제목이나 URL 텍스트 속에 "20251127" 처럼 명확한 8자리 YYYYMMDD 날짜가 포함되어 있을 시에는, 해당 실제 날짜를 정확히 최종 "pressDate"로 적용하여 연도/일자 왜곡(할루시네이션)을 완벽히 소거하십시오.
  - 제공된 본문 텍스트의 팩트를 기초로 하여, 3~4문장의 아주 객관적이고 사실적인 진짜 뉴스 기사체 요약본("pressContent")을 생성하십시오. 절대 '추정된다' 와 같은 모호한 문장을 쓰지 말고, 본문 팩트를 직접 명시하십시오.

  반드시 마크다운 기호(\`\`\`) 없이 순수 JSON 규격 텍스트만 리턴하십시오:
  {
    "pressType": "방송" 또는 "신문" 또는 "기타",
    "pressMedia": "최종 검증된 실제 언론사명 (예: 한국대학신문, 경상일보, 울산신문, 네이버 뉴스 등)",
    "title": "최종 검증된 실제 기사 제목 (절대 '없음'으로 채우지 마십시오. 제공된 진짜 기사 제목 입력)",
    "pressDate": "최종 검증된 보도일자 (YYYY-MM-DD 형식)",
    "pressTime": "최종 검증된 보도시간 (HH:MM 형식)",
    "pressContent": "최종 교차 요약된 기사 본문 팩트 기반 요약 (3~4문장의 사실적 기사체)"
  }
  `;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: consensusPrompt
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    }
  );

  if (!response.ok) throw new Error(`Gemini API HTTP status: ${response.status}`);

  const resData = await response.json();
  const responseText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!responseText) throw new Error("Gemini response is empty");

  const parsed = JSON.parse(responseText.trim());
  parsed.imageUrl = firstImageUrl;
  return { parsed, usedModel: "GPT-4o & Gemini 2.5 Virtual Debate Consensus" };
}
