"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

// LP 아이콘 컴포넌트
const LpIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <circle cx="16" cy="16" r="15" fill="#111" stroke="#222" strokeWidth="2" />
    <circle cx="16" cy="16" r="7" fill="#F55" />
    <circle cx="16" cy="16" r="2" fill="#FDD" />
    <path d="M8 8a12 12 0 0 1 16 0" stroke="#333" strokeWidth="2" />
    <path d="M8 24a12 12 0 0 0 16 0" stroke="#333" strokeWidth="2" />
  </svg>
);

const MAX_RECOMMENDATION_PER_DAY = 1;
const getTodayString = () => new Date().toDateString();
const getRecommendationCount = () => {
  const lastDate = localStorage.getItem("lastRecommendationDate");
  const today = getTodayString();
  if (lastDate !== today) {
    localStorage.setItem("lastRecommendationDate", today);
    localStorage.setItem("recommendationCount", "0");
    return 0;
  }
  return parseInt(localStorage.getItem("recommendationCount") || "0", 10);
};

interface Song {
  "곡 제목": string;
  "아티스트": string;
  "링크": string;
}

export default function TodayPageContent() {
  const [toast, setToast] = useState("");
  const [recommendCount, setRecommendCount] = useState(0);
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);

  // 유튜브 ID 추출 함수
  const getYoutubeId = (url: string) => {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/);
    return match ? match[1] : null;
  };

  // 각 음악 플랫폼 검색 URL 생성 함수들
  const getYouTubeMusicUrl = (query: string) => `https://music.youtube.com/search?q=${encodeURIComponent(query)}`;
  const getAppleMusicUrl = (query: string) => `https://music.apple.com/search?term=${encodeURIComponent(query)}`;
  const getSpotifyUrl = (query: string) => `https://open.spotify.com/search/${encodeURIComponent(query)}`;
  const getVibeUrl = (query: string) => `https://vibe.naver.com/search?query=${encodeURIComponent(query)}`;

  // 슬라이더에서 좋아요 버튼 클릭 시
  const likeSongFromSlider = (song: Song) => {
    if (!song["링크"]) return;
    const liked = JSON.parse(localStorage.getItem("likedSongs") || "[]");
    if (!liked.find((s: any) => s["링크"] === song["링크"])) {
      liked.push(song);
      localStorage.setItem("likedSongs", JSON.stringify(liked));
    }
    setToast("플레이리스트에 저장했어요!");
    setTimeout(() => setToast(""), 1500);
  };

  // 슬라이더에서 공유 버튼 클릭 시
  const shareSongFromSlider = (song: Song) => {
    if (!song["곡 제목"] || !song["아티스트"] || !song["링크"]) return;
    const url = window.location.origin + `/today?title=${encodeURIComponent(song["곡 제목"])}&artist=${encodeURIComponent(song["아티스트"])}&link=${encodeURIComponent(song["링크"])}`;
    navigator.clipboard.writeText(url);
    setToast("링크가 복사되었어요!");
    setTimeout(() => setToast(""), 1500);
  };

  useEffect(() => {
    // localStorage에서 오늘 추천받은 곡 목록 불러오기
    const songs: Song[] = JSON.parse(typeof window !== 'undefined' ? (localStorage.getItem("todayRecommendedSongs") || "[]") : "[]");
    setRecommendedSongs(songs);
    // 추천 카운트도 localStorage에서 불러오기
    const getTodayString = () => new Date().toDateString();
    const getRecommendationCount = () => {
      const lastDate = typeof window !== 'undefined' ? localStorage.getItem("lastRecommendationDate") : null;
      const today = getTodayString();
      if (lastDate !== today) {
        if (typeof window !== 'undefined') {
          localStorage.setItem("lastRecommendationDate", today);
          localStorage.setItem("recommendationCount", "0");
        }
        return 0;
      }
      return typeof window !== 'undefined' ? parseInt(localStorage.getItem("recommendationCount") || "0", 10) : 0;
    };
    setRecommendCount(getRecommendationCount());
  }, []);

  // 3D 커버플로우 슬라이더 컴포넌트
  const SongSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const slidesRef = useRef<HTMLDivElement[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);

    const songs = recommendedSongs.length > 0 ? recommendedSongs : Array(10).fill({
      "곡 제목": "예시 곡 제목",
      "아티스트": "아티스트명",
      "링크": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    });

    // 슬라이드 상태 업데이트 함수
    const updateSlides = useCallback(() => {
      slidesRef.current.forEach((slide, i) => {
        if (!slide) return;
        slide.classList.remove("current", "previous", "next", "idle");
        if (i === currentIndex) slide.classList.add("current");
        else if (i === currentIndex - 1 || (currentIndex === 0 && i === songs.length - 1)) slide.classList.add("previous");
        else if (i === currentIndex + 1 || (currentIndex === songs.length - 1 && i === 0)) slide.classList.add("next");
        else slide.classList.add("idle");
      });
    }, [currentIndex, songs.length]);

    const prevSlide = () => {
      const len = songs.length;
      setCurrentIndex((prev) => (prev - 1 + len) % len);
    };
    const nextSlide = () => {
      const len = songs.length;
      setCurrentIndex((prev) => (prev + 1) % len);
    };

    // 터치/마우스/휠 이벤트 핸들러
    const handleTouchStart = (e: React.TouchEvent) => {
      setTouchStart(e.targetTouches[0].clientX);
      setTouchEnd(e.targetTouches[0].clientX);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };
    const handleTouchEnd = () => {
      if (touchStart - touchEnd > 100) nextSlide();
      if (touchStart - touchEnd < -100) prevSlide();
    };
    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStartX(e.clientX);
    };
    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
    };
    const handleMouseUp = (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dragDistance = e.clientX - dragStartX;
      if (dragDistance < -100) nextSlide();
      else if (dragDistance > 100) prevSlide();
      setIsDragging(false);
    };
    const handleWheel = useCallback((e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const sensitivity = 50;
      if (delta > sensitivity) nextSlide();
      else if (delta < -sensitivity) prevSlide();
    }, []);
    const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return (...args: Parameters<F>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    };
    const debouncedHandleWheel = useCallback(
      debounce((e: WheelEvent) => handleWheel(e), 200),
      [handleWheel]
    );
    useEffect(() => { updateSlides(); }, [currentIndex, updateSlides]);
    useEffect(() => {
      updateSlides();
      const container = containerRef.current;
      if (container) container.addEventListener('wheel', debouncedHandleWheel, { passive: false });
      return () => { if (container) container.removeEventListener('wheel', debouncedHandleWheel); };
    }, [updateSlides, debouncedHandleWheel]);

    return (
      <div 
        ref={containerRef}
        className="slider-container relative w-full h-full perspective-1000 overflow-visible pt-64"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="slider-track relative will-change-transform transition-transform duration-700 ease-in-out">
          {songs.map((song, index) => (
            <div 
              key={index}
              ref={(el) => { if (el) slidesRef.current[index] = el; }}
              className="slide bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 flex flex-col items-center"
            >
              <div className="text-lg font-semibold text-[#A033FF] mb-2">{song["곡 제목"] || "제목 없음"}</div>
              <div className="text-gray-700 mb-4">{song["아티스트"] || "아티스트 없음"}</div>
              <div className="w-full aspect-[16/9] mb-4">
                {index === currentIndex ? (
                  getYoutubeId(song["링크"]) ? (
                    <iframe
                      className="w-full h-full rounded-lg"
                      src={`https://www.youtube.com/embed/${getYoutubeId(song["링크"])}?autoplay=1&mute=0&controls=1`}
                      title="YouTube video player"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">동영상을 불러올 수 없습니다</span>
                    </div>
                  )
                ) : (
                  getYoutubeId(song["링크"]) ? (
                    <img 
                      src={`https://img.youtube.com/vi/${getYoutubeId(song["링크"])}/hqdefault.jpg`} 
                      alt={`${song["곡 제목"]} 썸네일`} 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">썸네일을 불러올 수 없습니다</span>
                    </div>
                  )
                )}
              </div>
              <div className="flex gap-3 justify-center mb-4">
                <button onClick={() => window.open(getYouTubeMusicUrl((song["곡 제목"] || "") + ' ' + (song["아티스트"] || "")), '_blank')} className="w-10 h-10 p-1 rounded-[10px] focus:outline-none">
                  <img src="/youtube_music.png" alt="YouTube Music" className="w-full h-full object-contain rounded-[10px]" />
                </button>
                <button onClick={() => window.open(getAppleMusicUrl((song["곡 제목"] || "") + ' ' + (song["아티스트"] || "")), '_blank')} className="w-10 h-10 p-1 rounded-[10px] focus:outline-none">
                  <img src="/apple_music.png" alt="Apple Music" className="w-full h-full object-contain rounded-[10px]" />
                </button>
                <button onClick={() => window.open(getSpotifyUrl((song["곡 제목"] || "") + ' ' + (song["아티스트"] || "")), '_blank')} className="w-10 h-10 p-1 rounded-[10px] focus:outline-none">
                  <img src="/spotify.png" alt="Spotify" className="w-full h-full object-contain rounded-[10px]" />
                </button>
                <button onClick={() => window.open(getVibeUrl((song["곡 제목"] || "") + ' ' + (song["아티스트"] || "")), '_blank')} className="w-10 h-10 p-1 rounded-[10px] focus:outline-none">
                  <img src="/vibe.png" alt="Vibe" className="w-full h-full object-contain rounded-[10px]" />
                </button>
              </div>
              <div className="flex gap-4 mb-2 relative">
                <button onClick={() => likeSongFromSlider(song)} className="w-14 h-14 rounded-[10px] text-2xl flex items-center justify-center bg-white/60 hover:bg-white/80 shadow border border-[#FF2A68] text-[#FF2A68]">❤️</button>
                <button onClick={() => shareSongFromSlider(song)} className="w-14 h-14 rounded-[10px] text-2xl flex items-center justify-center bg-white/60 hover:bg-white/80 shadow border border-[#0B63F6] text-[#0B63F6]">🔗</button>
              </div>
              <Link href="/playlist" className="text-[#A033FF] underline mt-2">내 플레이리스트 보기</Link>
              <div className="w-full flex flex-col gap-4 mt-6">
                <Link href="/today/songs" className="w-full">
                  <button className="w-full bg-[#A033FF] text-white rounded-full px-6 py-3 shadow-md hover:bg-[#7c25c9] transition text-base font-semibold">오늘 추천 받은 곡 보기</button>
                </Link>
                <a href="https://forms.gle/zQTC3ab4sgzJEPEY6" target="_blank" rel="noopener noreferrer" className="w-full">
                  <button className="w-full bg-[#fc26d5] text-white rounded-full px-6 py-3 shadow-md hover:bg-[#7c25c9] transition text-base font-semibold">나만 알고 있는 인디 노래 제보하기</button>
                </a>
              </div>
            </div>
          ))}
        </div>
        <button onClick={prevSlide} className="prev-btn absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-[#fc1eaf]/70 hover:bg-white text-white rounded-full w-12 h-12 flex items-center justify-center shadow transition md:block hidden" aria-label="이전 슬라이드">◀</button>
        <button onClick={nextSlide} className="next-btn absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-[#fc1eaf]/70 hover:bg-white text-white rounded-full w-12 h-12 flex items-center justify-center shadow transition md:block hidden" aria-label="다음 슬라이드">▶</button>
        <div className="flex justify-center gap-2 absolute bottom-26 md:bottom-12 left-0 right-0">
          {songs.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentIndex(idx)} className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex ? 'bg-white' : 'bg-white/30'}`} aria-label={`${idx + 1}번 슬라이드로 이동`} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#FF2A68] via-[#A033FF] to-[#0B63F6] px-4 overflow-x-hidden">
      <div className="text-center mb-4">
        <div className="text-lg text-white/90 mt-4 mb-2">들어볼래?</div>
        <div className="text-4xl font-bold text-white drop-shadow">한 곡 Indie</div>
      </div>
      <div className="mb-2 text-white/90 text-base text-center font-medium">당신의 하루를 바꿔줄 한국 인디 음악을 발견하세요</div>
      <div className="mb-8 md:mb-2 text-white/90 text-base text-center font-medium">하루에 한 번 10곡의 음악을 추천 받을 수 있어요</div>
      <div className="w-full max-w-2xl mb-6 mt-10 md:mb-16 md:mt-32 relative h-[700px] z-20">
        <SongSlider />
      </div>
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg text-sm z-50 animate-fade-in">{toast}</div>
      )}
      <style jsx global>{`
        .slider-track { 
          transform-style: preserve-3d; 
          will-change: transform;
        }
        .slide {
          position: absolute;
          top: 85%; left: 50%;
          width: 100%;
          max-width: 36rem;
          height: auto;
          transform-origin: center center;
          backface-visibility: hidden;
          transition: transform 0.8s ease-in-out, filter 0.8s ease-in-out;
          will-change: transform;
        }
        .song-detail-box {
          width: 100%;
          max-width: 36rem;
          height: auto;
          overflow-y: auto;
        }
        .slide.current { transform: translate3d(-50%, -50%, 120px) scale(1) rotateY(0deg); filter: blur(0px); z-index: 10; }
        .slide.previous { transform: translate3d(calc(-50% - 360px), -50%, 60px) scale(0.8) rotateY(30deg); filter: blur(3px); z-index: 5; }
        .slide.next { transform: translate3d(calc(-50% + 360px), -50%, 60px) scale(0.8) rotateY(-30deg); filter: blur(3px); z-index: 5; }
        .slide.idle { transform: translate3d(-50%, -50%, -200px) scale(0.6) rotateY(0deg); filter: blur(6px); z-index: 1; }
        @media (min-width: 768px) {
          .slide.previous { transform: translate3d(calc(-50% - 420px), -50%, 60px) scale(0.8) rotateY(30deg); }
          .slide.next { transform: translate3d(calc(-50% + 420px), -50%, 60px) scale(0.8) rotateY(-30deg); }
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