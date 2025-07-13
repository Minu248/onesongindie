"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { APP_VERSION } from "@/config/appVersion";

// YouTube IFrame API 타입 정의
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

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

// 통합된 초기화 함수 - 모든 관련 데이터를 완전히 초기화
const resetAllTodayData = () => {
  const today = getTodayString();
  localStorage.setItem("lastRecommendationDate", today);
  localStorage.setItem("recommendationCount", "0");
  localStorage.setItem("todayRecommendedSongs", JSON.stringify([]));
  localStorage.setItem("todaySong", ""); // 빈 문자열로 초기화
  localStorage.setItem("appVersion", APP_VERSION); // 앱 버전 저장
};

// 앱 버전 체크를 통한 강제 초기화
const forceResetIfNeeded = () => {
  const storedVersion = localStorage.getItem("appVersion");
  if (storedVersion !== APP_VERSION) {
    console.log(`앱 버전이 업데이트되었습니다 (${storedVersion} -> ${APP_VERSION}). 데이터를 초기화합니다.`);
    resetAllTodayData();
    return true;
  }
  return false;
};

// 날짜 체크 및 필요시 초기화
const checkAndResetIfNeeded = () => {
  // 먼저 앱 버전 체크
  const wasForceReset = forceResetIfNeeded();
  if (wasForceReset) return true;
  
  // 날짜 체크
  const lastDate = localStorage.getItem("lastRecommendationDate");
  const today = getTodayString();
  
  if (lastDate !== today) {
    resetAllTodayData();
    return true; // 초기화됨
  }
  return false; // 초기화되지 않음
};

const getRecommendationCount = () => {
  checkAndResetIfNeeded();
  return parseInt(localStorage.getItem("recommendationCount") || "0", 10);
};

// 오늘 추천받은 곡 리스트 관리
const getTodayRecommendedSongs = () => {
  const wasReset = checkAndResetIfNeeded();
  if (wasReset) return [];
  
  try {
    return JSON.parse(localStorage.getItem("todayRecommendedSongs") || "[]");
  } catch (e) {
    console.error("todayRecommendedSongs 파싱 오류:", e);
    return [];
  }
};

interface Song {
  "곡 제목": string;
  "아티스트": string;
  "링크": string;
}

export default function TodayPageContent() {
  const router = useRouter();
  const [toast, setToast] = useState("");
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
    }, 800); // 800ms 후 슬라이드 애니메이션 시작 (텍스트 애니메이션과 조화)
    
    return () => clearTimeout(timer);
  }, []);

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
    const url = window.location.origin + `/shared?title=${encodeURIComponent(song["곡 제목"])}&artist=${encodeURIComponent(song["아티스트"])}&link=${encodeURIComponent(song["링크"])}`;
    navigator.clipboard.writeText(url);
    setToast("링크가 복사되었어요!");
    setTimeout(() => setToast(""), 1500);
  };

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

  // 3D 커버플로우 슬라이더 컴포넌트
  const SongSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const slidesRef = useRef<HTMLDivElement[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const playersRef = useRef<{[key: number]: any}>({});
    const playerContainerRefs = useRef<{[key: number]: HTMLDivElement | null}>({});


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
        
        // 로드 애니메이션 적용
        if (isLoaded) {
          slide.classList.add("loaded");
        }
      });
    }, [currentIndex, songs.length, isLoaded]);

    const prevSlide = () => {
      const len = songs.length;
      setCurrentIndex((prev) => (prev - 1 + len) % len);
    };
    const nextSlide = () => {
      const len = songs.length;
      setCurrentIndex((prev) => (prev + 1) % len);
    };

    // YouTube 플레이어 생성 함수
    const createYouTubePlayer = useCallback((index: number, videoId: string) => {
      if (!isYouTubeAPIReady || !window.YT || !playerContainerRefs.current[index]) return;
      
      // 기존 플레이어가 있다면 제거
      if (playersRef.current[index]) {
        try {
          playersRef.current[index].destroy();
        } catch (e) {
          console.warn('플레이어 제거 중 오류:', e);
        }
      }

      const containerId = `youtube-player-${index}`;
      const container = playerContainerRefs.current[index];
      if (!container) return;

      // 컨테이너 내용 초기화
      container.innerHTML = `<div id="${containerId}"></div>`;

      try {
        playersRef.current[index] = new window.YT.Player(containerId, {
          videoId: videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            mute: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            fs: 1,
            cc_load_policy: 0,
            iv_load_policy: 3,
            autohide: 0
          },
          events: {
            onReady: (event: any) => {
              console.log(`플레이어 ${index} 준비 완료`);
            },
            onStateChange: (event: any) => {
              // 재생 종료 시 (0 = ended) 다음 곡으로 이동
              if (event.data === 0) {
                console.log(`곡 ${index} 재생 종료, 다음 곡으로 이동`);
                
                setTimeout(() => {
                  const len = songs.length;
                  setCurrentIndex((prev) => (prev + 1) % len);
                }, 1000); // 1초 후 다음 슬라이드로 이동
              }
            },
            onError: (event: any) => {
              console.error(`플레이어 ${index} 오류:`, event.data);
            }
          }
        });
      } catch (error) {
        console.error('YouTube 플레이어 생성 오류:', error);
      }
    }, [isYouTubeAPIReady, songs.length]);

    // 플레이어 정리 함수
    const destroyPlayer = useCallback((index: number) => {
      if (playersRef.current[index]) {
        try {
          playersRef.current[index].destroy();
          delete playersRef.current[index];
        } catch (e) {
          console.warn('플레이어 제거 중 오류:', e);
        }
      }
    }, []);

    // 현재 슬라이드 변경 시 플레이어 관리
    useEffect(() => {
      if (!isYouTubeAPIReady) return;

      // 모든 플레이어 정리
      Object.keys(playersRef.current).forEach(key => {
        const index = parseInt(key);
        if (index !== currentIndex) {
          destroyPlayer(index);
        }
      });

      // 현재 슬라이드의 플레이어 생성
      const currentSong = songs[currentIndex];
      const videoId = getYoutubeId(currentSong["링크"]);
      
      if (videoId) {
        setTimeout(() => {
          createYouTubePlayer(currentIndex, videoId);
        }, 100);
      }
    }, [currentIndex, isYouTubeAPIReady, songs, createYouTubePlayer, destroyPlayer]);

    // 컴포넌트 언마운트 시 모든 플레이어 정리
    useEffect(() => {
      return () => {
        Object.keys(playersRef.current).forEach(key => {
          destroyPlayer(parseInt(key));
        });
      };
    }, [destroyPlayer]);

    // 터치/마우스/휠 이벤트 핸들러
    const [touchStartY, setTouchStartY] = useState(0);
    const [touchEndY, setTouchEndY] = useState(0);
    
    const handleTouchStart = (e: React.TouchEvent) => {
      setTouchStart(e.targetTouches[0].clientX);
      setTouchEnd(e.targetTouches[0].clientX);
      setTouchStartY(e.targetTouches[0].clientY);
      setTouchEndY(e.targetTouches[0].clientY);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
      setTouchEndY(e.targetTouches[0].clientY);
      
      // 가로 스와이프가 감지되면 기본 스크롤 방지
      const swipeDistanceX = Math.abs(e.targetTouches[0].clientX - touchStart);
      const swipeDistanceY = Math.abs(e.targetTouches[0].clientY - touchStartY);
      
      if (swipeDistanceX > swipeDistanceY && swipeDistanceX > 20) {
        e.preventDefault();
      }
    };
    const handleTouchEnd = () => {
      const swipeDistanceX = Math.abs(touchStart - touchEnd);
      const swipeDistanceY = Math.abs(touchStartY - touchEndY);
      const minSwipeDistance = 50;
      
      // 세로 스크롤이 가로 스와이프보다 크면 스와이프 무시
      if (swipeDistanceY > swipeDistanceX) {
        return;
      }
      
      // 가로 스와이프만 처리
      if (swipeDistanceX >= minSwipeDistance) {
        if (touchStart - touchEnd > 0) {
          nextSlide(); // 오른쪽에서 왼쪽으로 스와이프 (다음 슬라이드)
        } else {
          prevSlide(); // 왼쪽에서 오른쪽으로 스와이프 (이전 슬라이드)
        }
      }
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
      const minDragDistance = 50; // 100px에서 50px로 민감도 향상
      
      if (Math.abs(dragDistance) >= minDragDistance) {
        if (dragDistance < 0) {
          nextSlide(); // 오른쪽에서 왼쪽으로 드래그 (다음 슬라이드)
        } else {
          prevSlide(); // 왼쪽에서 오른쪽으로 드래그 (이전 슬라이드)
        }
      }
      setIsDragging(false);
    };
    const handleWheel = useCallback((e: WheelEvent) => {
      // 모바일에서는 휠 이벤트 무시
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return;
      }
      
      // 가로 스크롤만 처리 (세로 스크롤 무시)
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
        return;
      }
      
      const delta = e.deltaX;
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
        className="slider-container relative w-full h-full perspective-1000 overflow-visible"
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
                    <div 
                      ref={(el) => { playerContainerRefs.current[index] = el; }}
                      className="w-full h-full rounded-lg overflow-hidden"
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
      <div className={`text-center mb-4 transition-all duration-800 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <div className="text-lg text-white/90 mt-4 mb-2">들어볼래?</div>
        <div className="text-4xl font-bold text-white drop-shadow">한 곡 Indie</div>
      </div>
      <div className={`mb-2 text-white/90 text-base text-center font-medium transition-all duration-800 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`} style={{ transitionDelay: '200ms' }}>당신의 하루를 바꿔줄 한국 인디 음악을 발견하세요</div>
      <div className={`mb-8 md:mb-2 text-white/90 text-base text-center font-medium transition-all duration-800 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`} style={{ transitionDelay: '400ms' }}>하루에 한 번 10곡의 음악을 추천 받을 수 있어요</div>
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