import type { AiSurveyData } from "../satisfaction-types";

// [교육용 주석] 만족도 조사의 초안을 OpenAI GPT-4o-mini API를 활용해 생성하는 헬퍼 함수
export const callOpenAiGptForSatisfaction = async (rawText: string): Promise<AiSurveyData> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API Key가 설정되지 않았습니다.");

  const prompt = `당신은 대학 RISE(앵커) 사업 만족도 조사 분석가(GPT-4o)입니다.
    다음 만족도 조사 텍스트를 정밀 분석하여 아래 JSON 스키마를 만족하는 분석 요약본을 출력하십시오.
    응답은 반드시 마크다운(예: \`\`\`json 등)이나 불필요한 사설 없이 순수 JSON 객체만 반환해야 합니다.

    [JSON 스키마]:
    {
      "title": "설문조사 혹은 보고서의 공식 제목",
      "target": "조사 대상 (예: 울산지역 혁신기관 임직원 및 교수 30명)",
      "startDate": "시작일 (YYYY-MM-DD 형식, 본문에 명시되지 않았으면 오늘 날짜 기준으로 가상 생성)",
      "endDate": "종료일 (YYYY-MM-DD 형식, 본문에 명시되지 않았으면 시작일로부터 5일 뒤로 가상 생성)",
      "purpose": "설문조사 목적",
      "responsesCount": 응답자수 (정수형 숫자),
      "averageScore": 만족도 평균점수 (100점 만점 기준 실수형 숫자. 만약 5점 만점 등 다른 기준이라면 100점 만점으로 자동 환산할 것),
      "comments": ["대표적인 주관식 피드백 의견 2~4개"],
      "gptOpinion": "GPT-4o가 작성한 분석 및 파싱 검토 의견 (예: '텍스트에서 응답자 30명과 평균점수 92.8%를 정확히 추출하여 요약 초안을 작성했습니다. 날짜 형식을 표준 YYYY-MM-DD로 검증했습니다.')"
    }

    [텍스트 내용]:
    ${rawText}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful AI assistant that always replies in JSON format according to the user schema." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API HTTP Error! Status: ${response.status}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content) as AiSurveyData;
};

// [교육용 주석] 만족도 조사의 초안을 Google Gemini API를 활용해 검토 및 보완 의견을 도출하는 헬퍼 함수
export const callGeminiApiForSatisfaction = async (
  rawText: string,
  gptDraft: AiSurveyData
): Promise<AiSurveyData> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API Key가 설정되지 않았습니다.");

  const prompt = `당신은 대학 RISE(앵커) 사업 만족도 조사 분석 전문가(Google Gemini)입니다.
    다음 만족도 조사 원본 텍스트와 파트너 AI(GPT-4o)가 1차로 분석한 요약 초안 JSON을 제공합니다.
    두 데이터를 정밀 대조하여 날짜 오차, 응답자수 계산 착오, 주관식 의견 왜곡 등 오류가 없는지 팩트체크를 하십시오.
    그 검토 및 보완 의견을 작성하고, 수정이 완료된 최종 JSON 데이터를 출력해 주십시오.
    응답은 반드시 마크다운이나 불필요한 사설 없이 순수 JSON 객체만 반환해야 합니다.

    [원본 텍스트]:
    ${rawText}

    [GPT-4o 초안 JSON]:
    ${JSON.stringify(gptDraft)}

    [출력 JSON 스키마]:
    {
      "title": "보완 조율된 조사 제목",
      "target": "보완 조율된 조사 대상",
      "startDate": "보완 조율된 시작일 (YYYY-MM-DD)",
      "endDate": "보완 조율된 종료일 (YYYY-MM-DD)",
      "purpose": "보완 조율된 설문 목적",
      "responsesCount": 보완 조율된 응답자수 (정수형 숫자),
      "averageScore": 보완 조율된 평균점수 (100점 만점 기준 실수형 숫자),
      "comments": ["보완 조율된 대표 의견 리스트"],
      "geminiOpinion": "Google Gemini가 작성한 반론 및 팩트체크 검토 의견 (예: 'GPT의 초안을 검증한 결과 응답자 수와 평균 점수는 모두 원본과 일치합니다. 다만, 원본 일정표 기준 시작일이 2026-05-10이 맞는지 팩트 확인을 거쳐 조율안을 확정했습니다.')"
    }`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API HTTP Error! Status: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini response is empty");
  return JSON.parse(text) as AiSurveyData;
};

// [교육용 주석] GPT-4o와 Gemini의 검토 의견을 종합하여 최종 합의(Consensus) 데이터를 도출하는 헬퍼 함수
export const callConsensusCompilerForSatisfaction = async (
  gptDraft: AiSurveyData,
  geminiDraft: AiSurveyData
): Promise<AiSurveyData> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API Key가 설정되지 않았습니다.");

  const prompt = `당신은 최종 조율 위원장 AI입니다.
    만족도 조사 데이터 요약 및 검토를 거친 GPT-4o의 초안과 Google Gemini의 보완 검토안을 제공합니다.
    두 모델 간의 의견과 데이터를 최종 비교 분석하여, 이견을 매끄럽게 조율하고 모순이 없는 완벽한 만족도 조사 최종 합의 JSON을 도출해 주십시오.
    최종 조율 결과 요약 의견을 \`consensusOpinion\` 필드에 기술하고, 마크다운이나 사설 없이 순수 JSON 형식으로만 응답해 주십시오.

    [GPT-4o 초안]:
    ${JSON.stringify(gptDraft)}

    [Gemini 검토안]:
    ${JSON.stringify(geminiDraft)}

    [최종 합의 JSON 스키마]:
    {
      "title": "최종 합의된 조사 제목",
      "target": "최종 합의된 조사 대상",
      "startDate": "최종 합의된 시작일 (YYYY-MM-DD)",
      "endDate": "최종 합의된 종료일 (YYYY-MM-DD)",
      "purpose": "최종 합의된 설문 목적",
      "responsesCount": 최종 합의된 응답자수 (정수형 숫자),
      "averageScore": 최종 합의된 평균점수 (100점 만점 기준 실수형 숫자),
      "comments": ["최종 합의된 대표 의견 리스트"],
      "consensusOpinion": "최종 조율 위원장 AI의 합의 서머리 의견 (예: '두 모델의 분석 데이터를 종합하고, 날짜 및 응답자 수의 정합성을 최종 확정하여 완벽히 합의된 만족도 조사 결과를 컴파일 완료했습니다.')"
    }`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a master consensus compiler that output JSON format." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API HTTP Error! Status: ${response.status}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content) as AiSurveyData;
};
