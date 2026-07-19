import os
import datetime
from io import BytesIO
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
from pyhanko.sign import signers
from pyhanko.sign.fields import SigFieldSpec, append_signature_field
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.serialization import pkcs12, BestAvailableEncryption

CERT_FILENAME = "rise_signature.p12"
CERT_PASSWORD = b"ulsanrise123!"

def get_cert_path() -> str:
    """인증서 보관 절대경로 반환"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_dir, CERT_FILENAME)

def ensure_self_signed_certificate():
    """자가 서명 P12 인증서가 없을 경우 자동 생성"""
    cert_path = get_cert_path()
    if os.path.exists(cert_path):
        return

    print("⚠️ 울산과학대학교 앵커사업단 디지털 서명 인증서가 없어 자가 서명 인증서(.p12)를 자동 생성합니다...")
    # 1. 개인키 생성 (RSA 2048)
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048
    )

    # 2. 인증서 정보 구성 (한글 주석: 울산과학대학교 앵커사업단 CA 명의 지정)
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "KR"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Ulsan College"),
        x509.NameAttribute(NameOID.ORGANIZATIONAL_UNIT_NAME, "Anchor Project Group"),
        x509.NameAttribute(NameOID.COMMON_NAME, "Ulsan College Anchor Portal CA"),
    ])

    now = datetime.datetime.utcnow()
    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        issuer
    ).public_key(
        private_key.public_key()
    ).serial_number(
        x509.random_serial_number()
    ).not_valid_before(
        now - datetime.timedelta(days=1)
    ).not_valid_after(
        now + datetime.timedelta(days=3650) # 10년 유효
    ).add_extension(
        x509.BasicConstraints(ca=True, path_length=None), critical=True,
    ).sign(private_key, hashes.SHA256())

    # 3. PKCS#12 (.p12) 파일로 패키징
    p12_data = pkcs12.serialize_key_and_certificates(
        name=b"rise_signer",
        key=private_key,
        cert=cert,
        cas=None,
        encryption_algorithm=BestAvailableEncryption(CERT_PASSWORD)
    )

    # 4. 파일 쓰기
    with open(cert_path, "wb") as f:
        f.write(p12_data)
    print("✨ 자가 서명 인증서(.p12) 자동 생성이 완료되었습니다.")

def sign_pdf_with_cert(pdf_bytes: bytes) -> bytes:
    """PDF 바이너리에 디지털 서명을 추가하여 봉인된 PDF 바이너리 반환 (한글 주석)"""
    ensure_self_signed_certificate()
    cert_path = get_cert_path()

    # 1. PKCS12 인증서 및 개인키 로드 (pyHanko 내장 로더 활용)
    signer = signers.SimpleSigner.load_pkcs12(
        cert_path,
        passphrase=CERT_PASSWORD
    )

    # 2. 입출력 스트림 기반 증분 작성기 구동
    input_stream = BytesIO(pdf_bytes)
    output_stream = BytesIO()

    writer = IncrementalPdfFileWriter(input_stream)
    
    # 3. 서명 필드 추가 (보이지 않는 디지털 봉인용 서명 필드 지정)
    signature_field_name = "RISE_Signature"
    append_signature_field(
        writer,
        sig_field_spec=SigFieldSpec(sig_field_name=signature_field_name)
    )

    # 4. pyHanko로 디지털 봉인 서명 적용 및 해시 결합
    meta = signers.PdfSignatureMetadata(field_name=signature_field_name)
    signers.sign_pdf(
        writer,
        meta,
        signer,
        output=output_stream
    )

    return output_stream.getvalue()
