"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// YouTube IFrame API 타입 정의
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface Song {
  "곡 제목": string;
  "아티스트": string;
  "링크": string;
}

export default function SharedSongContent() {
  const searchParams = useSearchParams();
  const [song, setSong] = useState<Song | null>(null);
  const [toast, setToast] = useState("");
  const [isYouTubeAPIReady, setIsYouTubeAPIReady] = useState(false);

  // YouTube IFrame API 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 이미 로드된 경우
    if (window.YT && window.YT.Player) {
      setIsYouTubeAPIReady(true);
      return;
    }
    
    // API 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    document.head.appendChild(script);
    
    // API 준비 완료 콜백
    window.onYouTubeIframeAPIReady = () => {
      setIsYouTubeAPIReady(true);
    };
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // URL 파라미터에서 곡 정보 가져오기
  useEffect(() => {
    const title = searchParams.get("title");
    const artist = searchParams.get("artist");
    const link = searchParams.get("link");
    
    if (title && artist && link) {
      setSong({
        "곡 제목": title,
        "아티스트": artist,
        "링크": link,
      });
    }
  }, [searchParams]);

  // 유튜브 ID 추출 함수
  const getYoutubeId = (url: string) => {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/);
    return match ? match[1] : null;
  };



  if (!song) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#FF2A68] via-[#A033FF] to-[#0B63F6] px-4">
        <div className="text-white text-center">
          <div className="text-2xl mb-4">🎵</div>
          <div className="text-lg">곡 정보를 불러오는 중...</div>
        </div>
      </main>
    );
  }

  const youtubeId = getYoutubeId(song["링크"]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#FF2A68] via-[#A033FF] to-[#0B63F6] px-4 py-8">
      {/* 메시지 */}
      <div className="text-center mb-6">
        <div className="text-lg text-white/90 mb-2">✉️ 친구가 추천한 곡이 도착했어요.</div>
      </div>

      {/* 곡 정보 */}
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-white mb-2">{song["곡 제목"]}</div>
        <div className="text-xl text-white/90">{song["아티스트"]}</div>
      </div>

      {/* YouTube 플레이어 */}
      <div className="w-full max-w-2xl aspect-[16/9] mb-8 rounded-lg overflow-hidden shadow-lg">
        {youtubeId && isYouTubeAPIReady ? (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={`${song["곡 제목"]} - ${song["아티스트"]}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full bg-black/20 flex items-center justify-center">
            <div className="text-white">플레이어 로딩 중...</div>
          </div>
        )}
      </div>

      {/* CTA 버튼 */}
      <Link href="/" className="w-full max-w-xs">
        <button className="w-full bg-white/20 hover:bg-white/30 text-white rounded-full px-6 py-4 shadow-lg transition text-lg font-semibold backdrop-blur border border-white/30">
          나도 오늘의 곡 추천받기
        </button>
      </Link>

      {/* 토스트 메시지 */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg text-sm z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </main>
  );
} 