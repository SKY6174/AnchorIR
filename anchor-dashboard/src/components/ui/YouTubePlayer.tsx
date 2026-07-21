import React from "react";

/**
 * 💡 YouTubePlayerProps - 유튜브 플레이어 컴포넌트의 입력 속성(Props) 타입 정의
 */
export interface YouTubePlayerProps {
  /** 유튜브 동영상의 고유 ID (예: 'n2u5rXgGHDg') */
  videoId: string;
}

/**
 * 💡 YouTubePlayer - 유튜브 비디오 플레이어 공통 TSX UI 컴포넌트
 * 
 * [설계 의도]
 * 1. 초보자분들도 이해하기 쉽도록 Props 타입 정의와 주석을 상세히 달았습니다.
 * 2. Tailwind CSS의 'aspect-video' 클래스를 활용하여 16:9 비율이 자동으로 반응형 연산됩니다.
 * 3. 프리미엄 다크 테마(DESIGN.md) 디자인 사상에 따라 미세 반투명 테두리와 그림자 효과를 적용했습니다.
 */
export default function YouTubePlayer({ videoId }: YouTubePlayerProps): React.JSX.Element {
  
  // 1. 방어 코드 (Safety Check)
  // 부모 컴포넌트에서 비디오 ID를 누락했거나 빈 문자열일 때 발생할 수 있는 에러를 예방합니다.
  if (!videoId) {
    return (
      <div className="w-full aspect-video rounded-md bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center text-zinc-500 text-sm gap-2">
        <span>⚠️ 재생할 영상 ID가 지정되지 않았습니다.</span>
        <span className="text-xs text-zinc-600">(videoId props를 전달했는지 확인해 주세요)</span>
      </div>
    );
  }

  // 2. 유튜브 임베드 표준 URL 생성
  const embedUrl = `https://www.youtube.com/embed/${videoId}?feature=oembed&enablejsapi=1`;

  return (
    <div className="w-full aspect-video rounded-md overflow-hidden border border-white/10 shadow-lg">
      <iframe
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
