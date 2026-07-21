/**
 * 💡 대칭키 데이터 암복호화 유틸리티 (crypto.ts)
 * 
 * [프로젝트 보안 규칙 8 준수]:
 * 사용자의 민감 데이터(주민등록번호, 은행 계좌번호, 전자서명 이미지 Canvas DataURL 등)를
 * 데이터베이스에 전달 및 저장하기 전에 AES 대칭키 알고리즘으로 안전하게 암호화 및 복호화합니다.
 */

import CryptoJS from 'crypto-js';

/** 암호화에 사용되는 전역 대칭키 (보안 환경 변수 연동) */
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_SECRET || 'anchor_instructor_secure_encryption_key_2026';

/**
 * 텍스트 또는 캔버스 이미지 데이터를 AES 대칭키로 암호화합니다.
 * 
 * @param plainText 평문 텍스트 또는 base64 서명 이미지 DataURL
 * @returns 암호화된 AES 문자열 (입력값이 없을 경우 빈 문자열 반환)
 */
export function encryptData(plainText: string | null | undefined): string {
  if (!plainText) return '';
  try {
    return CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();
  } catch (error) {
    console.error('Data Encryption Error:', error);
    return '';
  }
}

/**
 * AES 암호화된 문자열을 원본 데이터로 복호화합니다.
 * 
 * @param cipherText 암호화된 AES 문자열
 * @returns 복호화된 원본 평문 (복호화 실패 시 빈 문자열 반환)
 */
export function decryptData(cipherText: string | null | undefined): string {
  if (!cipherText) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  } catch (error) {
    console.error('Data Decryption Error:', error);
    return '';
  }
}

/**
 * 전자서명 (Canvas base64 DataURL) 암호화 래퍼 함수
 */
export function encryptSignature(canvasDataUrl: string): string {
  return encryptData(canvasDataUrl);
}

/**
 * 전자서명 (Canvas base64 DataURL) 복호화 래퍼 함수
 */
export function decryptSignature(encryptedSignature: string): string {
  return decryptData(encryptedSignature);
}
