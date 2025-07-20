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
  getMelonUrl,
  getBugsUrl,
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
    if (isAnimating) return; // 애니메이션 중이면 중복 실행 방지
    const len = songs.length;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + len) % len);
    // 애니메이션 완료 후 상태 초기화
    setTimeout(() => setIsAnimating(false), 700); // transition duration과 동일
  };
  
  const nextSlide = () => {
    if (isAnimating) return; // 애니메이션 중이면 중복 실행 방지
    const len = songs.length;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % len);
    // 애니메이션 완료 후 상태 초기화
    setTimeout(() => setIsAnimating(false), 700); // transition duration과 동일
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
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
    setTouchEndY(e.targetTouches[0].clientY);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
    
    // 슬라이드 애니메이션 중이거나 가로 스와이프가 감지되면 모든 스크롤 방지
    const swipeDistanceX = Math.abs(e.targetTouches[0].clientX - touchStart);
    const swipeDistanceY = Math.abs(e.targetTouches[0].clientY - touchStartY);
    
    if (isAnimating || (swipeDistanceX > swipeDistanceY && swipeDistanceX > 20)) {
      e.preventDefault();
      e.stopPropagation();
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
    
    // 애니메이션 중이면 모든 스크롤 차단
    if (isAnimating) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // 가로 스크롤이 세로 스크롤보다 클 때만 슬라이드 전환
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault(); // 가로 스크롤만 차단
      const delta = e.deltaX;
      if (delta > TOUCH_SETTINGS.WHEEL_SENSITIVITY) nextSlide();
      else if (delta < -TOUCH_SETTINGS.WHEEL_SENSITIVITY) prevSlide();
    }
    // 세로 스크롤은 그대로 통과시킴 (preventDefault 호출하지 않음)
  }, [isAnimating, nextSlide, prevSlide]);
  useEffect(() => { updateSlides(); }, [currentIndex, updateSlides]);
  useEffect(() => {
    updateSlides();
    const container = containerRef.current;
    if (container) container.addEventListener('wheel', handleWheel, { passive: false });
    return () => { if (container) container.removeEventListener('wheel', handleWheel); };
  }, [updateSlides, handleWheel]);

  return (
    <div 
      ref={containerRef}
      className="slider-container relative w-full h-full perspective-1000 overflow-visible"
      style={{
        // 애니메이션 중 스크롤 방지
        ...(isAnimating && {
          overscrollBehavior: 'none',
          touchAction: 'none'
        })
      }}
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
            {/* 저장/공유 버튼 그룹 */}
            <div className="flex gap-2 justify-center mt-2 mb-6">
              {/*<button 
                onClick={() => onLike(song)} 
                className="flex items-center gap-2 bg-[#FF6B9D] hover:bg-[#FF5A8A] text-white px-6 py-3 rounded-full shadow-md transition-colors duration-200"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span className="font-medium">저장</span>
              </button>*/}
              <button 
                onClick={() => onShare(song)} 
                className="flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-3 rounded-full shadow-md transition-colors duration-200"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
                <span className="font-medium">공유</span>
              </button>
            </div>
            
            {/* 플랫폼 버튼 그룹 - 2x2 그리드 */}
            <div className="grid grid-cols-3 gap-2 w-full mb-0">
              <button 
                onClick={() => window.open(getYouTubeMusicUrl(createSearchQuery(song["곡 제목"] || "", song["아티스트"] || "")), '_blank')} 
                className="flex items-center justify-center gap-2 bg-[#FF0000] hover:bg-[#CC0000] text-white px-4 py-3 rounded-[5px] shadow-md transition-colors duration-200"
              >
                <img src="/youtube_music.png" alt="YouTube" className="w-4 h-4 rounded-[3px] object-contain" />
                <span className="font-medium text-sm">Youtube</span>
              </button>
              <button 
                onClick={() => window.open(getSpotifyUrl(createSearchQuery(song["곡 제목"] || "", song["아티스트"] || "")), '_blank')} 
                className="flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1AA34A] text-white px-4 py-3 rounded-[5px] shadow-md transition-colors duration-200"
              >
                <img src="/spotify.png" alt="Spotify" className="w-4 h-4 rounded-[3px] object-contain" />
                <span className="font-medium text-sm">Spotify</span>
              </button>
              <button 
                onClick={() => window.open(getAppleMusicUrl(createSearchQuery(song["곡 제목"] || "", song["아티스트"] || "")), '_blank')} 
                className="flex items-center justify-center gap-2 bg-[#000000] hover:bg-[#333333] text-white px-4 py-3 rounded-[5px] shadow-md transition-colors duration-200"
              >
                <img src="/apple_music.png" alt="Apple Music" className="w-4 h-4 rounded-[3px] object-contain" />
                <span className="font-medium text-sm">Apple</span>
              </button>
              <button 
                onClick={() => window.open(getVibeUrl(createSearchQuery(song["곡 제목"] || "", song["아티스트"] || "")), '_blank')} 
                className="flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-4 py-3 rounded-[5px] shadow-md transition-colors duration-200"
              >
                <img src="/vibe.png" alt="Vibe" className="w-4 h-4 rounded-[3px] object-contain" />
                <span className="font-medium text-sm">Vibe</span>
              </button>
              {/*<button 
                onClick={() => window.open(getMelonUrl(createSearchQuery(song["곡 제목"] || "", song["아티스트"] || "")), '_blank')} 
                className="flex items-center justify-center gap-2 bg-[#04E632] hover:bg-[#00b825] text-white px-4 py-3 rounded-[5px] shadow-md transition-colors duration-200"
              >
                <img src="/melon.png" alt="Melon" className="w-4 h-4 rounded-[3px] object-contain" />
                <span className="font-medium text-sm">Melon</span>
              </button>*/}
              <button 
                onClick={() => window.open(getBugsUrl(createSearchQuery(song["곡 제목"] || "", song["아티스트"] || "")), '_blank')} 
                className="flex items-center justify-center gap-2 bg-[#ED2653] hover:bg-[#c42146] text-white px-4 py-3 rounded-[5px] shadow-md transition-colors duration-200"
              >
                <img src="/bugs.png" alt="Bugs" className="w-4 h-4 rounded-[3px] object-contain" />
                <span className="font-medium text-sm">Bugs</span>
              </button>
            </div>
            {/*<Link href="/playlist" className="text-[#A033FF] underline mt-2">내 플레이리스트 보기</Link>
            {/* 버튼들 숨김 처리*/}
            <div className="w-full flex flex-col gap-4 mt-2">
              {/*<Link href="/today/songs" className="w-full">
                <button className="w-full bg-[#A033FF] text-white rounded-full px-6 py-3 shadow-md hover:bg-[#7c25c9] transition text-base font-semibold">오늘 추천 받은 곡 리스트</button>
              </Link>
            */}
              <a href={API_ENDPOINTS.FORM_SUBMIT} target="_blank" rel="noopener noreferrer" className="w-full">
                <button className="w-full bg-[#EC3C89] text-white rounded-[5px] px-6 py-3 shadow-md hover:bg-[#e32075] transition text-base font-medium">📫나만 알고 있는 인디 노래 제보하기</button>
              </a>
            </div>
          </div>
        ))}
      </div>
      <button onClick={prevSlide} className="prev-btn absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-[#fc1eaf]/70 hover:bg-white text-white rounded-full w-12 h-12 flex items-center justify-center shadow transition md:block hidden" aria-label="이전 슬라이드">◀</button>
      <button onClick={nextSlide} className="next-btn absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-[#fc1eaf]/70 hover:bg-white text-white rounded-full w-12 h-12 flex items-center justify-center shadow transition md:block hidden" aria-label="다음 슬라이드">▶</button>
      <div className="flex justify-center gap-2 absolute bottom-26 md:bottom-12 left-0 right-0">
        {songs.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => {
              if (isAnimating || idx === currentIndex) return; // 애니메이션 중이거나 현재 슬라이드면 무시
              setIsAnimating(true);
              setCurrentIndex(idx);
              setTimeout(() => setIsAnimating(false), 700);
            }} 
            className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex ? 'bg-white' : 'bg-white/30'}`} 
            aria-label={`${idx + 1}번 슬라이드로 이동`} 
          />
        ))}
      </div>
    </div>
  );
}; 