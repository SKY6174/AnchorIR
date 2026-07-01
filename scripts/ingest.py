import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

# 1. .env 파일 로드
load_dotenv()

# 2. 경로 설정
DOCUMENTS_DIR = "../data/documents/"
VECTOR_DB_DIR = "../data/vector_store/"

def run_document_ingestion():
    os.makedirs(VECTOR_DB_DIR, exist_ok=True)
    os.makedirs(DOCUMENTS_DIR, exist_ok=True)
    
    pdf_files = [f for f in os.listdir(DOCUMENTS_DIR) if f.endswith(".pdf")]
    
    if not pdf_files:
        print("data/documents/ 폴더에 가공할 PDF 파일이 존재하지 않습니다. 성과보고서.pdf를 배치해 주세요.")
        return
        
    target_pdf = os.path.join(DOCUMENTS_DIR, pdf_files[0])
    print(f"[{pdf_files[0]}] 분석 및 추출 작업을 시작합니다.")
    
    loader = PyPDFLoader(target_pdf)
    pages = loader.load()
    print(f"성공: 총 {len(pages)} 페이지 분량의 원시 데이터를 추출했습니다.")
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_documents(pages)
    print(f"성공: 총 {len(chunks)}개의 AI 학습용 텍스트 조각(Chunk)으로 단락 분할을 마쳤습니다.")
    
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small"
    )
    
    print("ChromaDB 로컬 데이터베이스에 벡터 임베딩 변환 및 저장을 시작합니다...")
    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=VECTOR_DB_DIR
    )
    
    vector_store.persist()
    print("축하합니다! 앵커 RAG Wiki를 위한 데이터베이스 적재 설정이 최종 완수되었습니다.")

if __name__ == "__main__":
    run_document_ingestion()
