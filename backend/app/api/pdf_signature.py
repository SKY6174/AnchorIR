from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from io import BytesIO
from app.services.signature_service import sign_pdf_with_cert

router = APIRouter(prefix="/pdf", tags=["pdf"])

@router.post("/sign-pdf")
async def sign_pdf_endpoint(file: UploadFile = File(...)):
    """
    회의결과보고서 PDF를 전달받아 울산과학대학교 앵커사업단 서명키로 
    암호학적 디지털 서명을 결합하여 돌려주는 API (한글 주석)
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="PDF 파일 포맷만 서명 서포트가 지원됩니다.")
        
    try:
        # 1. PDF 바이너리 바이트 읽기
        pdf_bytes = await file.read()
        
        # 2. 서명 및 봉인 서비스 레이어 호출
        signed_pdf_bytes = sign_pdf_with_cert(pdf_bytes)
        
        # 3. 파일 스트림 형식으로 다이렉트 스트리밍 반환
        return StreamingResponse(
            BytesIO(signed_pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=signed_{file.filename}"
            }
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"디지털 서명 암호연산 처리 중 서버에 장애가 발생했습니다: {str(e)}")
