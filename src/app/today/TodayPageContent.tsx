"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Song, SongSliderProps } from "@/types/song";
import { 
  TOAST_MESSAGES, 
  ANIMATION_TIMING, 
  TOUCH_SETTINGS, 
  API_ENDPOINTS 
} from "@/config/constants";
import { 
  getRecommendationCount, 
  getTodayRecommendedSongs, 
  checkAndResetIfNeeded 
} from "@/utils/localStorage";
import { 
  getYoutubeId, 
  getYouTubeMusicUrl, 
  getAppleMusicUrl, 
  getSpotifyUrl, 
  getVibeUrl,
  getYouTubeThumbnailUrl,
  createSearchQuery,
  createShareUrl
} from "@/utils/musicUtils";
import { useToast } from "@/utils/hooks/useToast";
import { Toast } from "@/app/components/Toast";
import { LpIcon } from "@/app/components/LpIcon";
import { Footer } from "@/app/components/Footer";
import { SongSlider } from "@/app/components/SongSlider";

// YouTube IFrame API 타입 정의
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}



export default function TodayPageContent() {
  const router = useRouter();
  const { toastMessage, showToast, isVisible } = useToast();
  const [recommendCount, setRecommendCount] = useState(0);
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [isYouTubeAPIReady, setIsYouTubeAPIReady] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

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
      document.head.removeChild(script);
    };
  }, []);

  // 컴포넌트 로드 애니메이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, ANIMATION_TIMING.SLIDER_LOAD_DELAY);
    
    return () => clearTimeout(timer);
  }, []);

  // 슬라이더에서 좋아요 버튼 클릭 시 - useCallback으로 최적화
  const likeSongFromSlider = useCallback((song: Song) => {
    if (!song["링크"]) return;
    const liked = JSON.parse(localStorage.getItem("likedSongs") || "[]");
    if (!liked.find((s: any) => s["링크"] === song["링크"])) {
      liked.push(song);
      localStorage.setItem("likedSongs", JSON.stringify(liked));
    }
    showToast(TOAST_MESSAGES.SAVED_TO_PLAYLIST, 1500);
  }, [showToast]);

  // 슬라이더에서 공유 버튼 클릭 시 - useCallback으로 최적화
  const shareSongFromSlider = useCallback((song: Song) => {
    if (!song["곡 제목"] || !song["아티스트"] || !song["링크"]) return;
    const url = createShareUrl(song["곡 제목"], song["아티스트"], song["링크"]);
    navigator.clipboard.writeText(url);
    showToast(TOAST_MESSAGES.LINK_COPIED, 1500);
  }, [showToast]);



  // 날짜 체크 및 데이터 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 통합된 초기화 체크
    const wasReset = checkAndResetIfNeeded();
    
    if (wasReset) {
      // 초기화된 경우
      setRecommendedSongs([]);
      setRecommendCount(0);
    } else {
      // 같은 날이면 기존 데이터 불러오기
      const songs = getTodayRecommendedSongs();
      const count = getRecommendationCount();
      setRecommendedSongs(songs);
      setRecommendCount(count);
    }
  }, []);

  // 추천받은 곡이 없을 때 홈으로 리디렉션
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 컴포넌트가 로드되고 데이터가 확인된 후에만 리디렉션 체크
    const timer = setTimeout(() => {
      if (recommendedSongs.length === 0) {
        router.push('/');
      }
    }, 100); // 데이터 로드 완료를 기다림
    
    return () => clearTimeout(timer);
  }, [recommendedSongs, router]);

  return (
    <main className="relative min-h-screen flex flex-col items-center bg-gradient-to-b from-[#FF2A68] via-[#A033FF] to-[#0B63F6] px-4 overflow-x-hidden">
      <div className="flex-grow w-full flex flex-col items-center justify-center">
        <div className={`text-center mb-4 transition-all duration-800 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
          <div className="text-lg text-white/90 mt-4 mb-2">들어볼래?</div>
          <div className="text-4xl font-bold text-white drop-shadow">한곡인디</div>
        </div>
        <div className={`mb-2 text-white/90 text-base text-center font-medium transition-all duration-800 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`} style={{ transitionDelay: '200ms' }}>당신의 하루를 바꿔줄 한국 인디 음악을 발견하세요</div>
        <div className={`mb-8 md:mb-2 text-white/90 text-base text-center font-medium transition-all duration-800 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`} style={{ transitionDelay: '400ms' }}>하루에 한 번 10곡의 음악을 추천 받을 수 있어요</div>
        <div className="w-full max-w-2xl mb-6 mt-10 md:mb-16 md:mt-32 relative h-[650px] z-20">
          <SongSlider 
            songsData={recommendedSongs}
            isYouTubeAPIReady={isYouTubeAPIReady}
            onLike={likeSongFromSlider}
            onShare={shareSongFromSlider}
          />
        </div>
      </div>
      
      <Footer />
      
      {/* 홈으로 돌아가기 버튼 */}
      <Link href="/" className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30">
        <button 
          className="w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 border border-white/40 backdrop-blur-sm"
          aria-label="홈으로 돌아가기"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
          >
            <path 
              d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <polyline 
              points="9,22 9,12 15,12 15,22" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </Link>
      
      <Toast message={toastMessage} isVisible={isVisible} />
      <style jsx global>{`
        .slider-track { 
          transform-style: preserve-3d; 
          will-change: transform;
        }
        .slide {
          position: absolute;
          top: 30%; left: 50%;
          width: 100%;
          max-width: 36rem;
          height: auto;
          transform-origin: center top;
          backface-visibility: hidden;
          transition: transform 0.8s ease-in-out, filter 0.8s ease-in-out, opacity 1s ease-out;
          will-change: transform;
          transform: translate3d(-50%, 0, -200px) scale(0.6) rotateY(0deg);
          filter: blur(6px);
          z-index: 1;
          opacity: 0;
        }
        .slide.loaded {
          opacity: 1;
        }
        .song-detail-box {
          width: 100%;
          max-width: 36rem;
          height: auto;
          overflow-y: auto;
        }
        .slide.current { transform: translate3d(-50%, -8%, 120px) scale(1) rotateY(0deg); filter: blur(0px); z-index: 10; }
        .slide.previous { transform: translate3d(calc(-50% - 360px), 0, 60px) scale(0.8) rotateY(30deg); filter: blur(3px); z-index: 5; }
        .slide.next { transform: translate3d(calc(-50% + 360px), 0, 60px) scale(0.8) rotateY(-30deg); filter: blur(3px); z-index: 5; }
        .slide.idle { transform: translate3d(-50%, 0, -200px) scale(0.6) rotateY(0deg); filter: blur(6px); z-index: 1; }
        @media (min-width: 768px) {
          .slide.current { transform: translate3d(-50%, -15%, 120px) scale(1) rotateY(0deg); filter: blur(0px); z-index: 10; }
          .slide.previous { transform: translate3d(calc(-50% - 420px), -8%, 60px) scale(0.8) rotateY(30deg); }
          .slide.next { transform: translate3d(calc(-50% + 420px), -8%, 60px) scale(0.8) rotateY(-30deg); }
        }
        .slider-container,
        .slider-container *,
        .song-detail-box {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .slider-container::-webkit-scrollbar,
        .song-detail-box::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  );
} 