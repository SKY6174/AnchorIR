from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from app.api.pdf_signature import router as pdf_router

app = FastAPI(title="ANCHOR Wiki RAG API Portal")
app.include_router(pdf_router, prefix="/api")

# React 프론트엔드 교차 출처(CORS) 요청 허용 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

@app.get("/")
def read_root():
    return {"message": "ANCHOR Wiki RAG API Server is running!"}

@app.post("/api/chat")
def handle_chat(request: QueryRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    # RAG 검색 시뮬레이션 폴백
    query_text = request.query.lower()
    
    # 1차년도 성과보고서 RAG 매칭 로직 탑재 구역
    # 실제 구현 시 ChromaDB에서 유의미한 청크들을 꺼내어 GPT/Gemini로 프롬프트를 쏘는 구문이 위치하게 됩니다.
    return {
        "answer": f"입력하신 질문 '{request.query}'에 대한 로컬 RAG 시뮬레이션 응답입니다. 백엔드 연동 구성이 잘 완료되었습니다.",
        "sources": [
            {"id": "doc-01", "title": "1차년도 성과보고서 기본계획", "unit": "D3", "category": "참고자료"}
        ]
    }
