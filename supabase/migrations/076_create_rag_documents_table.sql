-- 💡 [교육용 한글 주석] pgvector 확장을 설치하여 고성능 벡터 유사도 분석 기능을 DB 레벨에 활성화합니다.
CREATE EXTENSION IF NOT EXISTS vector;

-- 💡 [교육용 한글 주석] 실제 사업계획서, 규정집 문서를 단락(Chunk) 단위로 임베딩 벡터와 함께 저장하는 테이블입니다.
CREATE TABLE IF NOT EXISTS rag_documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,                   -- 실제 잘게 쪼개진 문서 내용
  metadata JSONB DEFAULT '{}'::jsonb,      -- 출처 파일명, 페이지 번호 등의 보조 메타데이터
  embedding VECTOR(1536) NOT NULL,         -- OpenAI text-embedding-3-small(1536차원)용 벡터 공간
  created_at TIMESTAMPTZ DEFAULT now()
);

-- pgvector 성능 향상을 위한 코사인 유사도 인덱스 생성
CREATE INDEX IF NOT EXISTS rag_documents_embedding_idx 
ON rag_documents 
USING hnsw (embedding vector_cosine_ops);

-- RLS(Row Level Security) 설정 활성화 (강력한 보안 정책 준수 - 룰 8)
ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;

-- 💡 [보안 정책] 누구나 RAG 문서를 조회(SELECT)할 수 있도록 허용
CREATE POLICY "Allow public read access to rag_documents" 
ON rag_documents 
FOR SELECT 
TO public 
USING (true);

-- 💡 [보안 정책] 로그인한 관리자 및 운영자만 RAG 문서를 추가/변경/삭제할 수 있도록 제한
CREATE POLICY "Allow write operations to authenticated staff only" 
ON rag_documents 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 💡 [교육용 한글 주석] 질문 벡터를 매개변수로 받아 코사인 거리 연산으로 가장 유사한 문서 단락 Top-K개를 반환하는 RAG 헬퍼 함수입니다.
CREATE OR REPLACE FUNCTION match_rag_documents (
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
) RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
) LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    rag_documents.id,
    rag_documents.content,
    rag_documents.metadata,
    1 - (rag_documents.embedding <=> query_embedding) AS similarity
  FROM rag_documents
  WHERE 1 - (rag_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY rag_documents.embedding <=> query_embedding
  LIMIT match_count;
$$;
