"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Song, SongSliderProps } from "@/types/song";
import { 
  ANIMATION_TIMING, 
  TOUCH_SETTINGS, 
  API_ENDPOINTS 
} from "@/config/constants";
import { 
  getYoutubeId, 
  getYouTubeMusicUrl, 
  getAppleMusicUrl, 
  getSpotifyUrl, 
  getVibeUrl,
  getYouTubeThumbnailUrl,
  createSearchQuery 
} from "@/utils/musicUtils";

// SongSlider 컴포넌트 - TodayPageContent에서 분리
export const SongSlider: React.FC<SongSliderProps> = ({ 
  songsData, 
  isYouTubeAPIReady, 
  onLike, 
  onShare 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSliderLoaded, setIsSliderLoaded] = useState(false); // 애니메이션을 위한 로컬 상태 추가
  const [isHydrated, setIsHydrated] = useState(false); // 하이드레이션 완료 확인
  const slidesRef = useRef<HTMLDivElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const playersRef = useRef<{[key: number]: any}>({});
  const playerContainerRefs = useRef<{[key: number]: HTMLDivElement | null}>({});

  // 클라이언트에서 마운트되면 isHydrated를 true로 설정
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const songs = songsData.length > 0 ? songsData : Array(10).fill({
    "곡 제목": "예시 곡 제목",
    "아티스트": "아티스트명",
    "링크": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  });

  // 애니메이션 타이머 설정 - 하이드레이션과 데이터 준비 완료 후 실행
  useEffect(() => {
    // 하이드레이션이 완료되지 않았다면 실행하지 않음
    if (!isHydrated) return;
    
    // requestAnimationFrame으로 브라우저가 렌더링할 준비가 될 때까지 기다림
    // 중첩해서 사용하면 렌더링 사이클이 완전히 안정된 후 실행되어 더 확실함
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const timer = setTimeout(() => {
          setIsSliderLoaded(true);
        }, 800); // 800ms 딜레이는 그대로 유지
        
        return () => clearTimeout(timer);
      });
    });
  }, [isHydrated, songsData]); // isHydrated와 songsData가 준비된 후에만 실행

  // 슬라이드 상태 업데이트 함수
  const updateSlides = useCallback(() => {
    slidesRef.current.forEach((slide, i) => {
      if (!slide) return;
      // 모든 위치 클래스를 먼저 제거합니다.
      slide.classList.remove("current", "previous", "next", "idle");

      // isSliderLoaded가 true일 때만 위치를 지정하고 애니메이션을 시작합니다.
      if (isSliderLoaded) {
        if (i === currentIndex) {
          slide.classList.add("current");
        } else if (i === currentIndex - 1 || (currentIndex === 0 && i === songs.length - 1)) {
          slide.classList.add("previous");
        } else if (i === currentIndex + 1 || (currentIndex === songs.length - 1 && i === 0)) {
          slide.classList.add("next");
        } else {
          slide.classList.add("idle");
        }
        
        // loaded 클래스를 추가하여 나타나게 합니다.
        slide.classList.add("loaded");
      }
    });
  }, [currentIndex, songs.length, isSliderLoaded]);

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
    
    // 세로 스크롤이 가로 스와이프보다 크면 스와이프 무시
    if (swipeDistanceY > swipeDistanceX) {
      return;
    }
    
    // 가로 스와이프만 처리
    if (swipeDistanceX >= TOUCH_SETTINGS.MIN_SWIPE_DISTANCE) {
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
    
    if (Math.abs(dragDistance) >= TOUCH_SETTINGS.MIN_DRAG_DISTANCE) {
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
    if (delta > TOUCH_SETTINGS.WHEEL_SENSITIVITY) nextSlide();
    else if (delta < -TOUCH_SETTINGS.WHEEL_SENSITIVITY) prevSlide();
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
                    src={getYouTubeThumbnailUrl(getYoutubeId(song["링크"])!)} 
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
              <button onClick={() => window.open(getYouTubeMusicUrl(createSearchQuery(song["곡 제목"] || "", song["아티스트"] || "")), '_blank')} className="w-10 h-10 p-1 rounded-[10px] focus:outline-none">
                <img src="/youtube_music.png" alt="YouTube Music" className="w-full h-full object-contain rounded-[10px]" />
              </button>
              <button onClick={() => window.open(getAppleMusicUrl(createSearchQuery(song["곡 제목"] || "", song["아티스트"] || "")), '_blank')} className="w-10 h-10 p-1 rounded-[10px] focus:outline-none">
                <img src="/apple_music.png" alt="Apple Music" className="w-full h-full object-contain rounded-[10px]" />
              </button>
              <button onClick={() => window.open(getSpotifyUrl(createSearchQuery(song["곡 제목"] || "", song["아티스트"] || "")), '_blank')} className="w-10 h-10 p-1 rounded-[10px] focus:outline-none">
                <img src="/spotify.png" alt="Spotify" className="w-full h-full object-contain rounded-[10px]" />
              </button>
              <button onClick={() => window.open(getVibeUrl(createSearchQuery(song["곡 제목"] || "", song["아티스트"] || "")), '_blank')} className="w-10 h-10 p-1 rounded-[10px] focus:outline-none">
                <img src="/vibe.png" alt="Vibe" className="w-full h-full object-contain rounded-[10px]" />
              </button>
            </div>
            <div className="flex gap-4 mb-2 relative">
              <button onClick={() => onLike(song)} className="w-14 h-14 rounded-[10px] text-2xl flex items-center justify-center bg-white/60 hover:bg-white/80 shadow border border-[#FF2A68] text-[#FF2A68]">❤️</button>
              <button onClick={() => onShare(song)} className="w-14 h-14 rounded-[10px] text-2xl flex items-center justify-center bg-white/60 hover:bg-white/80 shadow border border-[#0B63F6] text-[#0B63F6]">🔗</button>
            </div>
            <Link href="/playlist" className="text-[#A033FF] underline mt-2">내 플레이리스트 보기</Link>
            <div className="w-full flex flex-col gap-4 mt-6">
              <Link href="/today/songs" className="w-full">
                <button className="w-full bg-[#A033FF] text-white rounded-full px-6 py-3 shadow-md hover:bg-[#7c25c9] transition text-base font-semibold">오늘 추천 받은 곡 리스트</button>
              </Link>
              <a href={API_ENDPOINTS.FORM_SUBMIT} target="_blank" rel="noopener noreferrer" className="w-full">
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