import os

def split_output():
    filepath = "/Users/thomas/Documents/AnchorIR/scripts/parse_pdf_output.txt"
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    parts = content.split("=== FILE: ")
    os.makedirs("/Users/thomas/Documents/AnchorIR/scripts/split_parts", exist_ok=True)
    
    for part in parts:
        if not part.strip():
            continue
        lines = part.split("\n")
        filename = lines[0].strip().replace(" ===", "").replace(" ", "_")
        body = "\n".join(lines[1:])
        
        # 줄바꿈이 없는 거대한 한 줄 텍스트가 있을 수 있으므로, 
        # 특정 키워드(예: 전략코드, S1, S2, [020, A1가-, B1가-, 등) 기준으로 줄바꿈을 좀 더 넣어주자
        # 표의 열 이름이나 구분자 기준으로 포맷팅
        body_formatted = body
        # Program ID나 AP코드 앞에 줄바꿈 넣기
        body_formatted = body_formatted.replace(" S1", "\nS1").replace(" S2", "\nS2").replace(" S3", "\nS3").replace(" S4", "\nS4").replace(" S5", "\nS5").replace(" S6", "\nS6").replace(" S7", "\nS7")
        body_formatted = body_formatted.replace(" A1가-", "\nA1가-").replace(" A1나-", "\nA1나-").replace(" A2가-", "\nA2가-").replace(" A3가-", "\nA3가-").replace(" B1가-", "\nB1가-").replace(" B2가-", "\nB2가-").replace(" B3가-", "\nB3가-").replace(" B4가-", "\nB4가-").replace(" C1가-", "\nC1가-").replace(" C2-", "\nC2-").replace(" D1가-", "\nD1가-").replace(" D2가-", "\nD2가-").replace(" D3가-", "\nD3가-")
        
        out_path = f"/Users/thomas/Documents/AnchorIR/scripts/split_parts/{filename}.txt"
        with open(out_path, "w", encoding="utf-8") as out_f:
            out_f.write(body_formatted)
        print(f"Saved {out_path}")

if __name__ == "__main__":
    split_output()
