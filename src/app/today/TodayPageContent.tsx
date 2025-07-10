"use client";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";

// LP 아이콘 컴포넌트 복사
const LpIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <circle cx="16" cy="16" r="15" fill="#111" stroke="#222" strokeWidth="2" />
    <circle cx="16" cy="16" r="7" fill="#F55" />
    <circle cx="16" cy="16" r="2" fill="#FDD" />
    <path d="M8 8a12 12 0 0 1 16 0" stroke="#333" strokeWidth="2" />
    <path d="M8 24a12 12 0 0 0 16 0" stroke="#333" strokeWidth="2" />
  </svg>
);

// SongSlideBox 컴포넌트 제거

const MAX_RECOMMENDATION_PER_DAY = 1; // 하루 최대 추천 횟수를 10에서 1로 변경
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

// Song 타입 정의 추가
interface Song {
  "곡 제목": string;
  "아티스트": string;
  "링크": string;
}

export default function TodayPageContent() {
  // 쿼리 파라미터 제거: title, artist, link를 사용하지 않고 localStorage의 todayRecommendedSongs만 사용
  // const searchParams = useSearchParams();
  // const title = searchParams.get("title");
  // const artist = searchParams.get("artist");
  // const link = searchParams.get("link");
  const [toast, setToast] = useState("");
  const recommendCount = getRecommendationCount();
  const router = useRouter();
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  
  // 유튜브 ID 추출 함수
  const getYoutubeId = (url: string) => {
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
    const url = window.location.origin + `/today?title=${encodeURIComponent(song["곡 제목"])}&artist=${encodeURIComponent(song["아티스트"])}&link=${encodeURIComponent(song["링크"])}`;
    navigator.clipboard.writeText(url);
    setToast("링크가 복사되었어요!");
    setTimeout(() => setToast(""), 1500);
  };

  // 좋아요(플레이리스트 저장)
  const likeSong = () => {
    const song = { "곡 제목": title, "아티스트": artist, "링크": link };
    const liked = JSON.parse(localStorage.getItem("likedSongs") || "[]");
    if (!liked.find((s: any) => s["링크"] === song["링크"])) {
      liked.push(song);
      localStorage.setItem("likedSongs", JSON.stringify(liked));
    }
    setToast("플레이리스트에 저장했어요!");
    setTimeout(() => setToast(""), 1500);
  };

  // 공유
  const shareSong = () => {
    const url = window.location.origin + `/today?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&link=${encodeURIComponent(link)}`;
    navigator.clipboard.writeText(url);
    setToast("링크가 복사되었어요!");
    setTimeout(() => setToast(""), 1500);
  };
  
  // 추천곡 목록 불러오기
  useEffect(() => {
    // localStorage에서 오늘 추천받은 곡 목록 불러오기
    const loadRecommendedSongs = () => {
      const songs: Song[] = JSON.parse(localStorage.getItem("todayRecommendedSongs") || "[]");
      setRecommendedSongs(songs);
    };
    
    loadRecommendedSongs();
  }, []);

  // 곡 추천 버튼 동작 (홈과 동일)
  const fetchSongAndRedirect = async () => {
    try {
      const res = await fetch("https://api.sheetbest.com/sheets/88c2b9c7-8d30-462b-ae7c-a4859aaf6955");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      let songs = await res.json();
      if (songs.length === 0) throw new Error("곡 데이터가 없습니다");
      const recommendedSongs: Song[] = JSON.parse(localStorage.getItem("todayRecommendedSongs") || "[]");
      songs = songs.filter((song: Song) => !recommendedSongs.find(s => s["링크"] === song["링크"]));
      if (songs.length === 0) {
        setToast("더 이상 추천할 곡이 없습니다!");
        setTimeout(() => setToast(""), 3000);
        return;
      }
      
      // 랜덤으로 10개의 곡 선택 (또는 남은 곡이 10개 미만이면 모두 선택)
      const randomSongs: Song[] = [];
      const tempSongs = [...songs]; // 원본 배열 복사
      const selectionCount = Math.min(10, tempSongs.length);
      
      for (let i = 0; i < selectionCount; i++) {
        const randomIndex = Math.floor(Math.random() * tempSongs.length);
        randomSongs.push(tempSongs[randomIndex]);
        tempSongs.splice(randomIndex, 1); // 선택된 곡은 제거하여 중복 방지
      }
      
      const random = randomSongs[0];
      localStorage.setItem("todaySong", JSON.stringify(random));
      // 카운트 증가
      const count = getRecommendationCount() + 1;
      localStorage.setItem("recommendationCount", count.toString());
      // 추천곡 중복 관리 (곡 전체 객체 누적)
      localStorage.setItem("todayRecommendedSongs", JSON.stringify(randomSongs));
      // /today로 이동
      router.push(`/today?title=${encodeURIComponent(random["곡 제목"])}&artist=${encodeURIComponent(random["아티스트"])}&link=${encodeURIComponent(random["링크"])}${searchParams.get("login") ? '&login=1' : ''}`);
    } catch (error) {
      setToast("곡을 불러오는 중 오류가 발생했습니다");
      setTimeout(() => setToast(""), 3000);
    }
  };

  // 추천 가능 여부 (홈과 동일하게)
  const canRecommend = recommendCount < MAX_RECOMMENDATION_PER_DAY;
  
  // 3D 커버플로우 슬라이더 컴포넌트
  const SongSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const slidesRef = useRef<HTMLDivElement[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    
    // 테스트용 곡 데이터는 실제 추천 곡으로 대체
    const songs = recommendedSongs.length > 0 ? recommendedSongs : Array(10).fill({
      "곡 제목": "예시 곡 제목",
      "아티스트": "아티스트명",
      "링크": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    });
    
    // 슬라이드 상태 업데이트 함수
    const updateSlides = useCallback(() => {
      slidesRef.current.forEach((slide, i) => {
        if (!slide) return;
        
        // 모든 상태 클래스 제거
        slide.classList.remove("current", "previous", "next", "idle");
        
        // 상태 클래스 추가
        if (i === currentIndex) slide.classList.add("current");
        else if (i === currentIndex - 1 || (currentIndex === 0 && i === songs.length - 1)) slide.classList.add("previous");
        else if (i === currentIndex + 1 || (currentIndex === songs.length - 1 && i === 0)) slide.classList.add("next");
        else slide.classList.add("idle");
      });
    }, [currentIndex, songs.length]);
    
    // 이전 슬라이드로 이동
    const prevSlide = () => {
      const len = songs.length;
      setCurrentIndex((prev) => (prev - 1 + len) % len);
    };
    
    // 다음 슬라이드로 이동
    const nextSlide = () => {
      const len = songs.length;
      setCurrentIndex((prev) => (prev + 1) % len);
    };
    
    // 터치 이벤트 핸들러
    const handleTouchStart = (e: React.TouchEvent) => {
      setTouchStart(e.targetTouches[0].clientX);
      setTouchEnd(e.targetTouches[0].clientX);
    };
    
    const handleTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };
    
    const handleTouchEnd = () => {
      if (touchStart - touchEnd > 100) {
        // 왼쪽으로 스와이프 - 다음 슬라이드
        nextSlide();
      }
      
      if (touchStart - touchEnd < -100) {
        // 오른쪽으로 스와이프 - 이전 슬라이드
        prevSlide();
      }
    };
    
    // 마우스 이벤트 핸들러
    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStartX(e.clientX);
    };
    
    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      
      const dragDistance = e.clientX - dragStartX;
      
      // 드래그 거리에 따라 슬라이드 미리보기 효과를 줄 수도 있음
      // 여기서는 생략
    };
    
    const handleMouseUp = (e: React.MouseEvent) => {
      if (!isDragging) return;
      
      const dragDistance = e.clientX - dragStartX;
      
      if (dragDistance < -100) {
        // 왼쪽으로 드래그 - 다음 슬라이드
        nextSlide();
      } else if (dragDistance > 100) {
        // 오른쪽으로 드래그 - 이전 슬라이드
        prevSlide();
      }
      
      setIsDragging(false);
    };
    
    // 휠 이벤트 핸들러
    const handleWheel = useCallback((e: WheelEvent) => {
      // 수평 스크롤이 있으면 그것을 사용, 없으면 수직 스크롤 사용
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      
      // 스크롤 감도 조절 (값이 클수록 스크롤에 덜 민감)
      const sensitivity = 50;
      
      if (delta > sensitivity) {
        nextSlide();
      } else if (delta < -sensitivity) {
        prevSlide();
      }
    }, []);
    
    // 디바운스 함수
    const debounce = <F extends (...args: any[]) => any>(
      func: F,
      delay: number
    ) => {
      let timeoutId: NodeJS.Timeout;
      return (...args: Parameters<F>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    };
    
    // 디바운스된 휠 이벤트 핸들러
    const debouncedHandleWheel = useCallback(
      debounce((e: WheelEvent) => handleWheel(e), 200),
      [handleWheel]
    );
    
    // 상태 변경 시 슬라이드 업데이트
    useEffect(() => {
      updateSlides();
    }, [currentIndex, updateSlides]);
    
    // 초기 마운트 시 슬라이드 업데이트 및 이벤트 리스너 등록
    useEffect(() => {
      updateSlides();
      
      // 휠 이벤트 리스너 등록
      const container = containerRef.current;
      if (container) {
        container.addEventListener('wheel', debouncedHandleWheel, { passive: false });
      }
      
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      return () => {
        if (container) {
          container.removeEventListener('wheel', debouncedHandleWheel);
        }
      };
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
          {/* 슬라이드 아이템들 */}
          {songs.map((song, index) => (
            <div 
              key={index}
              ref={(el) => { if (el) slidesRef.current[index] = el; }}
              className="slide bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 flex flex-col items-center"
            >
              <div className="text-lg font-semibold text-[#A033FF] mb-2">{song["곡 제목"]}</div>
              <div className="text-gray-700 mb-4">{song["아티스트"]}</div>
              
              <div className="w-full aspect-[16/9] mb-4">
                <iframe
                  className="w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${getYoutubeId(song["링크"])}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              
              {/* 플랫폼 아이콘 버튼 */}
              <div className="flex gap-3 justify-center mb-4">
                <button 
                  onClick={() => window.open(getYouTubeMusicUrl(song["곡 제목"] + ' ' + song["아티스트"]), '_blank')}
                  className="w-10 h-10 p-1 rounded-[10px] focus:outline-none"
                >
                  <img src="/youtube_music.png" alt="YouTube Music" className="w-full h-full object-contain rounded-[10px]" />
                </button>
                <button 
                  onClick={() => window.open(getAppleMusicUrl(song["곡 제목"] + ' ' + song["아티스트"]), '_blank')}
                  className="w-10 h-10 p-1 rounded-[10px] focus:outline-none"
                >
                  <img src="/apple_music.png" alt="Apple Music" className="w-full h-full object-contain rounded-[10px]" />
                </button>
                <button 
                  onClick={() => window.open(getSpotifyUrl(song["곡 제목"] + ' ' + song["아티스트"]), '_blank')}
                  className="w-10 h-10 p-1 rounded-[10px] focus:outline-none"
                >
                  <img src="/spotify.png" alt="Spotify" className="w-full h-full object-contain rounded-[10px]" />
                </button>
                <button 
                  onClick={() => window.open(getVibeUrl(song["곡 제목"] + ' ' + song["아티스트"]), '_blank')}
                  className="w-10 h-10 p-1 rounded-[10px] focus:outline-none"
                >
                  <img src="/vibe.png" alt="Vibe" className="w-full h-full object-contain rounded-[10px]" />
                </button>
              </div>
              
              <div className="flex gap-4 mb-2 relative">
                <button 
                  onClick={() => likeSongFromSlider(song)}
                  className="w-14 h-14 rounded-[10px] text-2xl flex items-center justify-center bg-white/60 hover:bg-white/80 shadow border border-[#FF2A68] text-[#FF2A68]"
                >
                  ❤️
                </button>
                <button 
                  onClick={() => shareSongFromSlider(song)}
                  className="w-14 h-14 rounded-[10px] text-2xl flex items-center justify-center bg-white/60 hover:bg-white/80 shadow border border-[#0B63F6] text-[#0B63F6]"
                >
                  🔗
                </button>
              </div>
              
              <Link href="/playlist" className="text-[#A033FF] underline mt-2">
                내 플레이리스트 보기
              </Link>
              
              <div className="w-full flex flex-col gap-4 mt-6">
                <Link href="/today/songs" className="w-full">
                  <button className="w-full bg-[#A033FF] text-white rounded-full px-6 py-3 shadow-md hover:bg-[#7c25c9] transition text-base font-semibold">
                    오늘 추천 받은 곡 보기
                  </button>
                </Link>
                <a href="https://forms.gle/zQTC3ab4sgzJEPEY6" target="_blank" rel="noopener noreferrer" className="w-full">
                  <button className="w-full bg-[#fc26d5] text-white rounded-full px-6 py-3 shadow-md hover:bg-[#7c25c9] transition text-base font-semibold">
                    나만 알고 있는 인디 노래 제보하기
                  </button>
                </a>
              </div>
            </div>
          ))}
        </div>
        
        {/* 좌우 버튼 - 모바일에서는 숨김 처리 */}
        <button
          onClick={prevSlide}
          className="prev-btn absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-[#fc1eaf]/70 hover:bg-white text-white rounded-full w-12 h-12 flex items-center justify-center shadow transition md:block hidden"
          aria-label="이전 슬라이드"
        >
          ◀
        </button>
        <button
          onClick={nextSlide}
          className="next-btn absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-[#fc1eaf]/70 hover:bg-white text-white rounded-full w-12 h-12 flex items-center justify-center shadow transition md:block hidden"
          aria-label="다음 슬라이드"
        >
          ▶
        </button>
        
        {/* 인덱스 표시 (도트 네비게이션) - 위치 조정 */}
        <div className="flex justify-center gap-2 absolute bottom-26 md:bottom-12 left-0 right-0">
          {songs.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex ? 'bg-white' : 'bg-white/30'}`}
              aria-label={`${idx + 1}번 슬라이드로 이동`}
            />
          ))}
        </div>
        
        {/* 슬라이드 번호 표시 - 위치 조정 */}
        
        
        {/* 스와이프/스크롤 힌트 텍스트 */}
      </div>
    );
  };

  // 쿼리 파라미터가 없어도 에러 화면이 뜨지 않게 수정
  // if (!title || !artist || !link) {
  //   return (
  //     <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#FF2A68] via-[#A033FF] to-[#0B63F6] px-4">
  //       <div className="text-white text-xl font-bold mb-4">추천받은 곡 정보가 없습니다.</div>
  //       <Link href="/" className="text-[#A033FF] underline">홈으로 돌아가기</Link>
  //     </main>
  //   );
  // }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#FF2A68] via-[#A033FF] to-[#0B63F6] px-4 overflow-x-hidden">
      <div className="text-center mb-8">
        <div className="text-lg text-white/90 mt-4 mb-2">들어볼래?</div>
        <div className="text-5xl font-bold text-white drop-shadow">한 곡 Indie</div>
      </div>
      {/* 곡 추천 버튼, LP아이콘, 곡 카운트 표시 제거 */}
      {/*
      <button
        className={`w-16 h-16 ${canRecommend ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-400/20 hover:bg-gray-400/30'} text-white rounded-full shadow-lg transition mb-4 flex items-center justify-center text-2xl border-2 border-white/40 backdrop-blur`}
        onClick={fetchSongAndRedirect}
        aria-label="오늘의 인디 한 곡 추천받기"
        disabled={!canRecommend}
      >
        {canRecommend ? '🎵' : '⏰'}
      </button>
      <div className="flex items-center justify-center mb-4">
        <LpIcon />
        <span className="text-2xl font-bold text-white">{recommendCount}/{MAX_RECOMMENDATION_PER_DAY}</span>
      </div>
      */}
      <div className="mb-2 text-white/90 text-base text-center font-medium">
        당신의 하루를 바꿔줄 한국 인디 음악을 발견하세요
      </div>
      <div className="mb-8 text-white/90 text-base text-center font-medium">
        하루에 한 번 10곡의 음악을 추천 받을 수 있어요
      </div>
      
      {/* 슬라이드 컴포넌트 - 더 큰 마진 추가 */}
      <div className="w-full max-w-2xl mb-6 mt-10 md:mb-16 md:mt-32 relative h-[700px] z-20">
        <SongSlider />
      </div>
      
      {/* 아래 영역의 박스 - 슬라이드 박스와 동일한 크기로 설정 (주석 처리) */}
      {false && (
        <div className="song-detail-box bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 mb-8 flex flex-col items-center">
          {/* (기존 박스 내용 전체 삭제) */}
        </div>
      )}
      
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg text-sm z-50 animate-fade-in">
          {toast}
        </div>
      )}
      
      {/* 전역 스타일 추가 */}
      <style jsx global>{`
        /* 슬라이드 트랙 3D 보존 */
        .slider-track {
          transform-style: preserve-3d;
        }
        /* 공통 UI */
        .slide {
          position: absolute;
          top: 85%; left: 50%;
          width: 100%;
          max-width: 36rem; /* max-w-xl과 동일 (36rem) */
          height: auto;
          transform-origin: center center;
          backface-visibility: hidden;
          transition: transform 0.8s ease-in-out, filter 0.8s ease-in-out;
        }
        
        /* 아래 영역 박스 크기 */
        .song-detail-box {
          width: 100%;
          max-width: 36rem; /* max-w-xl과 동일 (36rem) */
          height: auto;
          overflow-y: auto;
        }
        
        /* 상태별 transform·filter */
        .slide.current {
          transform: translate3d(-50%, -50%, 120px) scale(1) rotateY(0deg);
          filter: blur(0px);
          z-index: 10;
        }
        .slide.previous {
          transform: translate3d(calc(-50% - 360px), -50%, 60px) scale(0.8) rotateY(30deg);
          filter: blur(3px);
          z-index: 5;
        }
        .slide.next {
          transform: translate3d(calc(-50% + 360px), -50%, 60px) scale(0.8) rotateY(-30deg);
          filter: blur(3px);
          z-index: 5;
        }
        .slide.idle {
          transform: translate3d(-50%, -50%, -200px) scale(0.6) rotateY(0deg);
          filter: blur(6px);
          z-index: 1;
        }
        
        /* PC에서는 더 넓은 간격으로 배치 */
        @media (min-width: 768px) {
          .slide.previous {
            transform: translate3d(calc(-50% - 420px), -50%, 60px) scale(0.8) rotateY(30deg);
          }
          .slide.next {
            transform: translate3d(calc(-50% + 420px), -50%, 60px) scale(0.8) rotateY(-30deg);
          }
        }
        
        /* 슬라이더 내부 스크롤바 완전 숨기기 */
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