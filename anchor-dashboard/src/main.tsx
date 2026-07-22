import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// 💡 Vercel 신규 배포 시 구버전 세션의 JS 청크 로드 실패(Failed to load module script) 시 멈춤 방지 자동 새로고침
window.addEventListener('error', (event) => {
  const msg = event.message || '';
  if (msg.includes('Failed to load module script') || msg.includes('Loading chunk') || msg.includes('dynamically imported module')) {
    console.warn('🔄 최신 버전 배포 감지 - 페이지 자동 새로고침 진행');
    window.location.reload();
  }
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
