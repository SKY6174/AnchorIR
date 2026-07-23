import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import YouTubePlayer from "./ui/YouTubePlayer";
import { Clock, Play, BookOpen } from "lucide-react";

/**
 * 💡 VideoItem - 교육 비디오 객체 타입 정의
 */
export interface VideoItem {
  id: string | number;
  title: string;
  description?: string | null;
  video_id?: string | null;
  youtube_url?: string | null;
  created_at: string | null;
}

export interface VideoDashboardProps {
  /** 회의 또는 비디오 필터 아이디 (옵션) */
  initialVideoId?: string;
}

/**
 * 💡 VideoDashboard - 지산학 앵커사업 교육 및 홍보 동영상 대시보드 TSX 컴포넌트
 */
export default function VideoDashboard({ initialVideoId }: VideoDashboardProps = {}): React.JSX.Element {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 유튜브 URL에서 11자리 비디오 ID만 추출하는 안전장치 함수
  const extractVideoId = (input?: string): string => {
    if (!input) return "";
    const trimmed = input.trim();

    if (trimmed.includes("v=")) {
      return trimmed.split("v=")[1]?.split("&")[0] || "";
    } else if (trimmed.includes("youtu.be/")) {
      return trimmed.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (trimmed.includes("embed/")) {
      return trimmed.split("embed/")[1]?.split("?")[0] || "";
    }

    return trimmed;
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("educational_videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      const videoList: VideoItem[] = data || [];
      setVideos(videoList);

      if (videoList.length > 0) {
        if (initialVideoId) {
          const matched = videoList.find(v => String(v.id) === String(initialVideoId));
          setSelectedVideo(matched || videoList[0]);
        } else {
          setSelectedVideo(videoList[0]);
        }
      }
    } catch (err: any) {
      console.error("동영상 데이터를 가져오는 과정에서 실패했습니다:", err.message);
      setError("데이터베이스 연결에 실패했습니다. 관리자 설정을 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div style={{ padding: "1.5rem", color: "var(--text-primary)" }}>
      {/* 타이틀 영역 */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <BookOpen size={24} style={{ color: "var(--accent-color)" }} />
          지산학 앵커사업 교육 및 홍보 자료실
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
          Supabase 데이터베이스와 실시간 연동되어 관리자가 등록한 최신 유튜브 교육 영상을 확인하실 수 있습니다.
        </p>
      </div>

      {/* 로딩 중 화면 */}
      {loading && (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
          데이터를 불러오는 중입니다...
        </div>
      )}

      {/* 에러 발생 시 알림 화면 */}
      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "1rem", borderRadius: "8px", color: "#EF4444", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {/* 메인 데이터 화면 */}
      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "4fr 6fr", gap: "1.5rem", alignItems: "start" }}>

          {/* [좌측]: 비디오 리스트 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "70vh", overflowY: "auto", paddingRight: "0.5rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
              📹 전체 교육자료 목록 ({videos.length}개)
            </h3>

            {videos.length > 0 ? (
              videos.map((video) => {
                const isActive = selectedVideo && selectedVideo.id === video.id;
                return (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    style={{
                      padding: "1rem",
                      borderRadius: "8px",
                      background: isActive ? "rgba(59, 130, 246, 0.08)" : "rgba(255,255,255,0.02)",
                      border: isActive ? "1px solid var(--accent-color)" : "1px solid var(--border-color)",
                      boxShadow: isActive ? "0 0 10px rgba(59, 130, 246, 0.2)" : "none",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                      <span style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", borderRadius: "4px", background: "rgba(59, 130, 246, 0.15)", color: "#60A5FA", fontWeight: "800" }}>
                        교육자료
                      </span>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Clock size={11} />
                        {new Date(video.created_at ?? 0).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "800", color: isActive ? "white" : "var(--text-primary)", lineHeight: "1.4" }}>
                      {video.title}
                    </h4>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "3rem 1rem", textAlign: "center", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-secondary)" }}>
                등록된 동영상이 없습니다.
              </div>
            )}
          </div>

          {/* [우측]: 플레이어 및 상세 설명 */}
          <div style={{ minHeight: "450px" }}>
            {selectedVideo ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <YouTubePlayer videoId={extractVideoId(selectedVideo.video_id || selectedVideo.youtube_url || undefined)} />

                <div
                  style={{
                    padding: "1.5rem",
                    borderRadius: "10px",
                    background: "var(--panel-bg)",
                    border: "1px solid var(--border-color)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                  }}
                >
                  <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1.1rem", fontWeight: "800" }}>
                    {selectedVideo.title}
                  </h3>

                  {selectedVideo.description && (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.75rem" }}>
                      <strong style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>
                        📋 상세 설명
                      </strong>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                        {selectedVideo.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ height: "100%", minHeight: "450px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "10px", color: "var(--text-secondary)" }}>
                <Play size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                <h4>동영상 재생 준비 완료</h4>
                <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>왼쪽 목록에서 보고 싶은 영상을 선택해 주세요.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
