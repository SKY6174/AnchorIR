import re

def summarize_pdf_output():
    filepath = "/Users/thomas/Documents/AnchorIR/scripts/parse_pdf_output.txt"
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    files = content.split("=== FILE: ")
    
    # ID 매칭 정규식 (B1가, B2가, B3, B4가, C1가, C2, D1가, D2가, D3가 등)
    # B1가-S1T1-1, C2-S1T1-1, D3가-S2T3-1 등
    id_pattern = re.compile(r'([B-D]\d(?:가|나)?-S\dT\d-\d+)')

    # 한글 이름 매칭 (예: "정자윤", "이은주", "김나희", "최주명", "이혜성" 등)
    # 2자 ~ 4자 한글 이름
    name_pattern = re.compile(r'([가-힣]{2,4})')

    for file_data in files:
        if not file_data.strip():
            continue
        lines = file_data.split("\n")
        filename = lines[0].strip()
        
        # B, C, D 파일들만 요약
        if not any(x in filename for x in ["B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3"]):
            continue
            
        print(f"\n========================================\nFILE: {filename}\n========================================")
        
        programs = {}
        for line in lines:
            # 1. Program ID 매칭
            match_ids = id_pattern.findall(line)
            if not match_ids:
                continue
                
            for prog_id in match_ids:
                # 2. 예산 매칭
                # 천원 단위의 금액이 나옴 (예: 12,000 이나 30,000 등)
                # 라인 내에서 쉼표가 포함된 큰 숫자들을 찾아봄
                budget_candidates = re.findall(r'(\d{1,3}(?:,\d{3})+)', line)
                budget = 0
                if budget_candidates:
                    # 마지막에 나온 쉼표 숫자를 예산으로 가정 (보통 행 끝부분에 예산이 기재됨)
                    # 단, e나라 비목 코드 등 다른 쉼표 숫자가 섞일 수 있으므로 주의
                    for val in reversed(budget_candidates):
                        val_int = int(val.replace(",", ""))
                        # 예산 범위가 대개 1,000 (100만) ~ 500,000 (5억) 수준이므로 필터링
                        if 1000 <= val_int <= 1000000:
                            budget = val_int * 1000
                            break
                            
                # 3. 담당자 매칭
                # 담당자 목록에 등록된 알려진 이름(이은주, 서란, 정자윤, 박기범, 김소연, 김나희, 정호성 등)을 우선 매칭하고, 
                # 그 외 한글 이름을 추출함.
                assignee = "미지정"
                names = name_pattern.findall(line)
                known_names = ["이은주", "서란", "정자윤", "박기범", "김소연", "김나희", "정호성", "최주명", "이혜성", "박인숙", "이혜민", "김현수", "이동은", "홍진숙", "현용환"]
                
                # 라인에서 알려진 이름이 있는지 먼저 검사
                found_known = []
                for kn in known_names:
                    if kn in line:
                        found_known.append(kn)
                
                if found_known:
                    assignee = found_known[0]
                elif names:
                    # e나라 비목 등 한글 단어가 많으므로, 단어 중 3자 한글 이름을 추출해봄
                    # 단, "수용비", "용역비", "기계기" 등은 제외
                    for name in names:
                        if name not in ["수용", "용역", "기계", "재료", "인건", "기타", "국비", "시비", "예산", "항목", "회계", "계정", "비목", "구축", "운영", "기반", "지원", "교육", "센터", "분야", "사업", "추진", "전략", "과제", "프로"]:
                            if len(name) >= 3:
                                assignee = name
                                break
                
                # 4. 프로그램 제목 매칭
                # 라인에서 ID 이전의 텍스트 영역을 프로그램 제목으로 유추
                title = "제목 없음"
                # ID가 나오는 지점 이전의 문자열
                idx_id = line.find(prog_id)
                if idx_id != -1:
                    pre_text = line[:idx_id].strip()
                    # 전략코드나 과제코드(S1T1 등)가 있으면 제거
                    pre_text = re.sub(r'^.*?S\dT\d[가-힣\w\s]*', '', pre_text)
                    # 숫자 제거
                    pre_text = re.sub(r'^\d+\s*', '', pre_text)
                    if pre_text:
                        title = pre_text
                
                # 저장
                if prog_id not in programs:
                    programs[prog_id] = {
                        "titles": [title] if title != "제목 없음" else [],
                        "budget": budget,
                        "assignee": assignee if assignee != "미지정" else ""
                    }
                else:
                    if budget > 0:
                        # 이미 예산이 있으면 더 큰 예산으로 갱신(혹은 합산할 수도 있으나, 
                        # 동일 행에 AP가 여러 개 쪼개진 경우 합산하는 게 맞음)
                        programs[prog_id]["budget"] += budget
                    if title != "제목 없음" and title not in programs[prog_id]["titles"]:
                        programs[prog_id]["titles"].append(title)
                    if assignee != "미지정" and not programs[prog_id]["assignee"]:
                        programs[prog_id]["assignee"] = assignee

        # 최종 가공 및 출력
        for p_id, p_info in sorted(programs.items()):
            # 타이틀 정밀 클리닝
            # 중복 타이틀 중 가장 적절한 것 선택
            title = "제목 없음"
            if p_info["titles"]:
                # 가장 긴 타이틀 혹은 쓸모없는 단어가 들어있지 않은 것을 고름
                valid_titles = [t for t in p_info["titles"] if len(t) > 2 and "전략" not in t and "조성" not in t]
                if valid_titles:
                    title = max(valid_titles, key=len)
                else:
                    title = p_info["titles"][0]
            
            # 특수 기호 정리
            title = re.sub(r'^[^\w\s가-힣]+', '', title).strip()
            title = re.sub(r'\s*AP\d+.*$', '', title).strip()
            title = re.sub(r'\s*\d+$', '', title).strip()
            
            assignee = p_info["assignee"]
            if assignee:
                if not any(x in assignee for x in ["연구원", "센터장", "팀장"]):
                    assignee = assignee + " 연구원"
            else:
                assignee = "미지정"
                
            print(f"  - ID: {p_id} | Title: {title} | Budget: {p_info['budget']:,}원 | Assignee: {assignee}")

if __name__ == "__main__":
    summarize_pdf_output()
