import React from "react";

/**
 * YouTubePlayer - 유튜브 비디오 플레이어 공통 UI 컴포넌트
 * 
 * [설계 의도]
 * 1. 초보자분들도 이해하기 쉽도록 주석을 상세히 달아 가독성을 높였습니다.
 * 2. Tailwind CSS의 'aspect-video' 클래스를 활용하여 브라우저 창 너비에 맞춰 16:9 비율이 자동으로 계산되도록 반응형으로 설계했습니다.
 * 3. Ulsan Anchor 대시보드의 다크 테마 및 프리미엄 글래스모피즘(DESIGN.md) 디자인 사상에 부합하도록 테두리에 미세한 흰색 반투명 경계와 그림자 효과를 주었습니다.
 * 
 * @param {Object} props
 * @param {string} props.videoId - 유튜브 동영상의 고유 ID (예: 'n2u5rXgGHDg')
 */
export default function YouTubePlayer({ videoId }) {
  
  // 1. 방어 코드 (Safety Check)
  // 부모 컴포넌트에서 비디오 ID를 누락하거나 넘겨주지 않았을 때 발생할 수 있는 에러를 방지합니다.
  if (!videoId) {
    return (
      <div className="w-full aspect-video rounded-md bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center text-zinc-500 text-sm gap-2">
        <span>⚠️ 재생할 영상 ID가 지정되지 않았습니다.</span>
        <span className="text-xs text-zinc-600">(videoId props를 전달했는지 확인해 주세요)</span>
      </div>
    );
  }

  // 2. 유튜브 임베드 표준 URL 생성
  // 외부 사이트에서 유튜브 비디오를 iframe으로 안전하게 삽입하기 위해 필요한 파라미터들을 설정합니다.
  // - enablejsapi=1: 플레이어를 제어할 수 있는 자바스크립트 API 활성화
  const embedUrl = `https://www.youtube.com/embed/${videoId}?feature=oembed&enablejsapi=1`;

  return (
    // 3. 레이아웃 및 스타일링
    // - w-full: 부모 요소 너비에 맞게 꽉 차도록 지정
    // - aspect-video: 16:9 화면 비율 고정
    // - rounded-md: 모서리를 둥글게 깎음
    // - overflow-hidden: 내부 iframe의 모서리가 둥글게 깎인 영역 밖으로 튀어나가지 않도록 감춤
    // - border border-white/10: 은은한 미세 하이라이팅 테두리 (DESIGN.md 다크모드 규격)
    // - shadow-lg: 공중에 떠 있는 듯한 입체적인 그림자 효과 부여
    <div className="w-full aspect-video rounded-md overflow-hidden border border-white/10 shadow-lg">
      <iframe
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        // accelerometer, gyroscope 등: 모바일 및 디바이스 가속도계 지원
        // clipboard-write, picture-in-picture, allowFullScreen: 전체 화면 및 공유 기능 허용
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        // strict-origin-when-cross-origin: 보안상 동일 도메인 또는 인가된 크로스 도메인에 대한 헤더 제어 보안 등급 적용
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
