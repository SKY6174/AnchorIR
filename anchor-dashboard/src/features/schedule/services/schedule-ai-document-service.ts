import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const extractScheduleFilesText = async (
  files: File[],
  onProgress: (message: string) => void
) => {
  let combinedRawText = "";

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    let fileText = "";

    onProgress(`📄 [${index + 1}/${files.length}] ${file.name} 텍스트 추출 중...`);

    if (
      file.type.match("text.*") ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".csv")
    ) {
      fileText = await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = event =>
          resolve(typeof event.target?.result === "string" ? event.target.result : "");
        reader.readAsText(file);
      });
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let pdfText = "";

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || "")
          .join(" ");
        pdfText += `[Page ${pageNumber}]\n${pageText}\n\n`;
      }
      fileText = pdfText;
    } else {
      fileText =
        `[⚠️ ${file.name}은 직접 텍스트 추출이 불가능한 파일 포맷입니다. ` +
        "본문을 복사하여 직접 입력란에 보충해 주세요.]";
    }

    combinedRawText +=
      `--- 파일 ${index + 1}: ${file.name} ---\n${fileText.trim()}\n\n`;
  }

  return combinedRawText;
};

export const convertRawTextToMarkdown = async (rawText: string): Promise<string> => {
  let apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";
  if (!apiKey || !apiKey.startsWith("sk-")) {
    apiKey = localStorage.getItem("user_openai_api_key") || "";
  }
  if (!apiKey) {
    return rawText;
  }

  try {
    const prompt = `
너는 대학교 RISE 사업단의 서류 정돈 전문가이다.
제공된 원본 텍스트는 PDF 문서에서 가공 없이 추출된 날것의 줄글 텍스트이다.
이 텍스트의 내용을 절대로 요약하거나 임의로 축소, 생략하지 말고 모든 세부 안건, 보고사항, 수치, 애로사항, 그리고 참석자 명단 및 서명록 이름들을 그대로 온전히 수용하여 가독성 높고 구조화된 마크다운(Markdown) 문서로 변환해라.
특히 본문에 기재된 모든 사람의 이름(참석 위원, 서명한 인원 등)은 한 명도 생략하지 말고 그대로 보존해라.
다른 군더더기 설명 없이 오직 마크다운 내용만을 텍스트로 즉시 반환해라.

원본 텍스트:
${rawText}
    `.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1
      })
    });

    if (!response.ok) return rawText;

    const responseData = await response.json();
    let markdownText = responseData?.choices?.[0]?.message?.content || rawText;

    const markdownMatch =
      markdownText.match(/```markdown\s*([\s\S]*?)\s*```/) ||
      markdownText.match(/```\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
      markdownText = markdownMatch[1];
    }

    return markdownText.trim();
  } catch (error) {
    console.error("Markdown 변환 실패:", error);
    return rawText;
  }
};
