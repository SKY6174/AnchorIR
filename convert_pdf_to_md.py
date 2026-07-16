import os
from pypdf import PdfReader

pdfs = [
    {
        "input": "./data/documents/해외 벤치마킹 일정표.pdf",
        "output": "./data/documents/해외_벤치마킹_일정표.md"
    },
    {
        "input": "./data/documents/RISE지원전략.pdf",
        "output": "./data/documents/RISE_지원전략.md"
    },
    {
        "input": "./data/documents/붙임. ★ 울산과학대학교 RISE사업 사업비 관리 지침.pdf",
        "output": "./data/documents/붙임_울산과학대학교_RISE사업_사업비_관리_지침.md"
    },
    {
        "input": "./data/documents/지산학이음세미나/1. [RISE사업_A1] 2026년 제4차 지산학 이음 세미나 개최 결과보고.pdf",
        "output": "./data/documents/지산학이음세미나/1. [RISE사업_A1] 2026년 제4차 지산학 이음 세미나 개최 결과보고.md"
    },
    {
        "input": "./data/documents/지산학이음세미나/1. [RISE사업_A1] 2026년 제5차 지산학 이음 세미나 개최 결과보고.pdf",
        "output": "./data/documents/지산학이음세미나/1. [RISE사업_A1] 2026년 제5차 지산학 이음 세미나 개최 결과보고.md"
    }
]

print("=== PDF ➔ Markdown 텍스트 변환 시작 (Python) ===")
for item in pdfs:
    if not os.path.exists(item["input"]):
        print(f"[경고] 파일 없음: {item['input']}")
        continue
        
    if os.path.exists(item["output"]):
        print(f"[정보] 이미 변환됨: {item['output']}")
        continue
        
    print(f"변환 중: {item['input']} ➔ {item['output']}")
    try:
        reader = PdfReader(item["input"])
        text = ""
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text += f"\n\n## Page {i+1}\n{page_text}"
        
        base_name = os.path.basename(item["input"])
        md_content = f"# {base_name}\n{text}"
        
        with open(item["output"], "w", encoding="utf-8") as f:
            f.write(md_content)
        print(f"성공적으로 변환 완료: {item['output']} ({len(reader.pages)}페이지)")
    except Exception as e:
        print(f"[에러] {item['input']} 변환 실패: {str(e)}")

print("=== PDF 변환 작업 완료 (Python) ===")
