import os
import glob
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document

# 1. 로컬 환경 변수 로드
load_dotenv()

# 2. 입출력 경로 지정
DOCUMENTS_DIR = "../data/documents/"
VECTOR_DB_DIR = "../data/vector_store/"

def run_document_ingestion():
    os.makedirs(VECTOR_DB_DIR, exist_ok=True)
    os.makedirs(DOCUMENTS_DIR, exist_ok=True)
    
    # data/documents 디렉토리 하위의 모든 파일들을 재귀적으로 수집합니다.
    all_documents = []
    
    # (1) PDF 파일 수집 및 파싱
    pdf_pattern = os.path.join(DOCUMENTS_DIR, "**/*.pdf")
    pdf_files = glob.glob(pdf_pattern, recursive=True)
    print(f"발견된 PDF 문서 수: {len(pdf_files)}개")
    for pdf_path in pdf_files:
        filename = os.path.basename(pdf_path)
        try:
            print(f"  - [{filename}] 텍스트 추출 중...")
            loader = PyPDFLoader(pdf_path)
            pages = loader.load()
            all_documents.extend(pages)
        except Exception as e:
            print(f"  - 에러: {filename} 파싱 실패 - {str(e)}")
            
    # (2) 텍스트(.txt) 및 마크다운(.md) 파일 수집 및 파싱 (HWP 등에서 추출해 둔 텍스트 백업 파일 처리용)
    text_extensions = ["**/*.txt", "**/*.md"]
    text_files = []
    for ext in text_extensions:
        pattern = os.path.join(DOCUMENTS_DIR, ext)
        text_files.extend(glob.glob(pattern, recursive=True))
        
    print(f"발견된 텍스트 및 마크다운 문서 수: {len(text_files)}개")
    for txt_path in text_files:
        filename = os.path.basename(txt_path)
        try:
            print(f"  - [{filename}] 텍스트 읽는 중...")
            with open(txt_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            # LangChain Document 규격에 맞게 래핑합니다.
            doc = Document(page_content=content, metadata={"source": filename})
            all_documents.append(doc)
        except Exception as e:
            print(f"  - 에러: {filename} 읽기 실패 - {str(e)}")
            
    if not all_documents:
        print("경고: 가공할 문건이 존재하지 않습니다. data/documents/ 폴더에 관련 문건(.pdf, .txt, .md)을 배치해 주세요.")
        return
        
    print(f"\n총 {len(all_documents)}개의 원시 문서 페이지/텍스트가 적재 대상입니다.")
    
    # 3. 텍스트 청킹 (1,000자 단위 분할, 200자 겹침 지침 적용)
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_documents(all_documents)
    print(f"성공: 총 {len(chunks)}개의 AI 청크(Chunk) 조각으로 분리 완료!")
    
    # 4. 임베딩 가동 (OpenAI 또는 지침에 대응하는 설정)
    # VITE_OPENAI_API_KEY 또는 OPENAI_API_KEY 중 등록된 값을 활용합니다.
    api_key = os.getenv("VITE_OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key or "your_openai_api_key" in api_key:
        print("\n[알림] API Key 설정이 완료되지 않았습니다. 실서버 벡터 DB 생성을 위해 .env 파일에 실제 OpenAI API Key를 기입해 주십시오.")
        return
        
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small",
        openai_api_key=api_key
    )
    
    # 5. ChromaDB 벡터 DB 저장소에 적재
    print("ChromaDB 로컬 데이터베이스에 벡터 변환 및 적재 진행 중...")
    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=VECTOR_DB_DIR
    )
    
    vector_store.persist()
    print("\n축하합니다! 로컬 앵커 RAG 지식 DB ChromaDB 빌드가 안전하게 완료되었습니다.")

if __name__ == "__main__":
    run_document_ingestion()
