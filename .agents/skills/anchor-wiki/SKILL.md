---
name: anchor-wiki
description: 울산과학대학교 라이즈(앵커) 사업 대시보드 내 RAG AI 위키(앵커Wiki) 관리, 데이터 임베딩 인제스천 및 FastAPI 백엔드 운영을 전담 지원하는 스킬입니다.
---

# 앵커Wiki RAG AI 위키 운영 및 관리 매뉴얼

본 문서는 울산과학대학교 라이즈(앵커) 사업 대시보드에 내장된 대화형 RAG 지식 포털인 **"앵커Wiki"**의 폴더 설계, 로컬 데이터베이스 빌드(Ingestion), 백엔드 API 연동 및 UI 테마 통합을 유지보수하기 위한 표준 행동 지침입니다.

---

## 1. 전역 시스템 아키텍처 및 폴더 레이아웃
앵커Wiki는 **FastAPI (백엔드 웹 API) + ChromaDB (벡터 DB) + React (프론트엔드)**의 하이브리드 RAG 아키텍처로 구동됩니다.

```text
AnchorIR/
├── backend/                     # 파이썬 FastAPI 백엔드
│   ├── app/
│   │   ├── main.py              # CORS 설정 및 API 라우트 (/api/chat)
│   │   └── services/
│   └── requirements.txt         # 파이썬 패키지 의존성 정의
├── scripts/                     # 데이터 가공 및 임베딩 툴
│   └── ingest.py                # PDF, TXT, MD 파일 ChromaDB 변환 적재기
├── data/                        # 데이터베이스 영속화 공간
│   ├── documents/               # 원본 사업계획서, 성과보고서, 지침서 보관소
│   └── vector_store/            # 임베딩된 ChromaDB 바이너리 파일 저장소
└── anchor-dashboard/            # 프론트엔드 (Vite / React)
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx      # '앵커Wiki' 메뉴 연동 및 탭 분기 제어
    │   │   └── LLMWiki.jsx      # 실시간 AI 챗봇 대화창 및 출처 칩 렌더러
    │   └── data/
    │       └── mockWikiData.js  # 클라이언트용 오프라인 모의 RAG 데이터셋
    └── .env                     # 로컬 API Key 및 Supabase 세팅 파일
```

---

## 2. RAG 데이터 임베딩 및 빌드 절차 (Data Ingestion)
새로운 RISE 사업계획서 PDF나 사업비 지침서 한글 문서(HWP)가 업데이트되었을 때 지식베이스에 적재하는 표준 순서입니다.

1. **문서 덤프 및 배치**:
   - PDF 파일은 [data/documents/](file:///Users/thomas/Documents/AnchorIR/data/documents) 폴더에 직접 복사하여 배치합니다.
   - HWP/HWPX 문서의 경우 내부 텍스트 전체를 긁어 동일 디렉토리에 텍스트 파일(`.txt`, `.md`)로 저장합니다.
2. **임베딩 스크립트 가동**:
   - `scripts/` 폴더로 이동하여 `python3 ingest.py`를 실행합니다.
   - 이 스크립트는 한글 문서를 **1,000자 단위(오버랩 200자 룰)**로 정교하게 쪼갠 뒤, OpenAI `text-embedding-3-small` 모델을 거쳐 `data/vector_store/` 디렉토리에 ChromaDB 인덱스 파일들로 안전하게 구워냅니다.

---

## 3. 백엔드 및 프론트엔드 실행 규칙

### 백엔드 (FastAPI API Server)
- **실행 포트**: 로컬 개발 환경 기준 `8000`번 포트에서 가동합니다.
- **실행 명령어**:
  ```bash
  cd backend
  pip install -r requirements.txt
  uvicorn app.main:app --reload --port 8000
  ```

### 프론트엔드 (Vite / React Dev Server)
- **실행 포트**: 기본 `5173`번 포트에서 구동됩니다.
- **실행 명령어**:
  ```bash
  cd anchor-dashboard
  npm run dev
  ```
- **CORS 설정**: 백엔드 `main.py`에 프론트엔드 포트의 교차 출처(CORS) 허용 설정이 탑재되어 있어야 합니다.

---

## 4. UI 테마 및 가독성 통합 가이드
- **테마 변수 호환성 보장**:
  - 앵커Wiki UI 컴포넌트(`LLMWiki.jsx`) 및 사이드바(`Sidebar.jsx`) 디자인 시 색상은 절대로 `#ffffff` 나 `#000000`으로 하드코딩해서는 안 됩니다.
  - 가독성 버그 방지를 위해 반드시 `dashboard.css`의 글로벌 테마 변수인 `var(--text-primary)`, `var(--text-secondary)`, `var(--panel-bg)`, `var(--border-color)`를 연동해 라이트/다크 테마 스위칭 시 실시간 폰트 색상이 반전되도록 통제해야 합니다.
