"use client";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

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

const MAX_RECOMMENDATION_PER_DAY = 10;
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
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const artist = searchParams.get("artist");
  const link = searchParams.get("link");
  const [toast, setToast] = useState("");
  const recommendCount = getRecommendationCount();
  const router = useRouter();
  const [showPlatformPopup, setShowPlatformPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // 팝업 바깥 클릭 시 닫힘
  useEffect(() => {
    if (!showPlatformPopup) return;
    const handleClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowPlatformPopup(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowPlatformPopup(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [showPlatformPopup]);

  if (!title || !artist || !link) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#FF2A68] via-[#A033FF] to-[#0B63F6] px-4">
        <div className="text-white text-xl font-bold mb-4">추천받은 곡 정보가 없습니다.</div>
        <Link href="/" className="text-[#A033FF] underline">홈으로 돌아가기</Link>
      </main>
    );
  }

  // 유튜브 ID 추출 함수
  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/);
    return match ? match[1] : null;
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

  // 플랫폼별 검색 URL 생성
  const getSearchQuery = () => `${title} ${artist}`;
  const getYoutubeMusicUrl = () => `https://music.youtube.com/search?q=${encodeURIComponent(getSearchQuery())}&utm_source=onesongindie.com&utm_medium=button&utm_campaign=music_search`;
  const getAppleMusicUrl = () => `https://music.apple.com/kr/search?term=${encodeURIComponent(getSearchQuery())}&utm_source=onesongindie.com&utm_medium=button&utm_campaign=music_search`;
  const getMelonUrl = () => `https://www.melon.com/search/total/index.htm?q=${encodeURIComponent(getSearchQuery())}&section=&mwkLogType=T&utm_source=onesongindie.com&utm_medium=button&utm_campaign=music_search`;
  const getVibeUrl = () => `https://vibe.naver.com/search?query=${encodeURIComponent(getSearchQuery())}&utm_source=onesongindie.com&utm_medium=button&utm_campaign=music_search`;

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
      const random = songs[Math.floor(Math.random() * songs.length)];
      localStorage.setItem("todaySong", JSON.stringify(random));
      // 카운트 증가
      const count = getRecommendationCount() + 1;
      localStorage.setItem("recommendationCount", count.toString());
      // 추천곡 중복 관리 (곡 전체 객체 누적)
      recommendedSongs.push(random);
      localStorage.setItem("todayRecommendedSongs", JSON.stringify(recommendedSongs));
      // /today로 이동
      router.push(`/today?title=${encodeURIComponent(random["곡 제목"])}&artist=${encodeURIComponent(random["아티스트"])}&link=${encodeURIComponent(random["링크"])}${searchParams.get("login") ? '&login=1' : ''}`);
    } catch (error) {
      setToast("곡을 불러오는 중 오류가 발생했습니다");
      setTimeout(() => setToast(""), 3000);
    }
  };

  // 추천 가능 여부 (홈과 동일하게)
  const canRecommend = recommendCount < MAX_RECOMMENDATION_PER_DAY;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#FF2A68] via-[#A033FF] to-[#0B63F6] px-4">
      <div className="text-center mb-8">
        <div className="text-lg text-white/90 mb-2">들어볼래?</div>
        <div className="text-5xl font-bold text-white drop-shadow">한 곡 Indie</div>
      </div>
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
      <div className="mb-2 text-white/90 text-base text-center font-medium">
        당신의 하루를 바꿔줄 한국 인디 음악을 발견하세요
      </div>
      <div className="mb-4 text-white/90 text-base text-center font-medium">
        하루에 10곡의 음악을 추천 받을 수 있어요
      </div>
      <div className="w-full max-w-2xl bg-white/80 rounded-xl shadow-lg p-6 flex flex-col items-center backdrop-blur-md overflow-hidden mb-6">
        <div className="mb-2 text-lg font-semibold text-[#A033FF]">{title}</div>
        <div className="mb-4 text-gray-700">{artist}</div>
        {getYoutubeId(link) && (
          <div className="w-full max-w-xl mx-auto aspect-[16/9] mb-4">
            <iframe
              className="w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${getYoutubeId(link)}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
        <div className="mb-4 text-[#A033FF]">오늘의 추천곡이에요 🎧</div>
        <div className="flex gap-4 mb-2 relative">
          <button
            className="w-14 h-14 rounded-[10px] bg-white/60 hover:bg-white/80 shadow border border-[#FF0000] flex items-center justify-center"
            onClick={() => setShowPlatformPopup(v => !v)}
            aria-label="음원 플랫폼에서 검색"
            type="button"
          >
            <img 
              src="/youtube_music.png" 
              alt="YouTube Music" 
              className="w-6 h-6 object-contain" 
            />
          </button>
          <button
            className="w-14 h-14 rounded-[10px] text-2xl flex items-center justify-center bg-white/60 hover:bg-white/80 shadow border border-[#FF2A68] text-[#FF2A68]"
            onClick={likeSong}
            aria-label="좋아요"
          >
            ❤️
          </button>
          <button
            className="w-14 h-14 rounded-[10px] text-2xl flex items-center justify-center bg-white/60 hover:bg-white/80 shadow border border-[#0B63F6] text-[#0B63F6]"
            onClick={shareSong}
            aria-label="공유"
          >
            🔗
          </button>
          {/* 플랫폼 선택 팝업 */}
          {showPlatformPopup && (
            <div ref={popupRef} className="absolute left-1/2 -translate-x-1/2 top-12 z-50 w-[340px] max-w-[calc(100vw-32px)] bg-[#A033FF]/90 rounded-xl shadow-lg px-6 py-4 flex gap-4 items-center border border-gray-200 animate-fade-in">
              {/* YouTube Music */}
              <button onClick={() => { window.open(getYoutubeMusicUrl(), '_blank'); setShowPlatformPopup(false); }} className="w-14 h-14 p-1 flex items-center justify-center rounded-[10px] focus:outline-none">
                <img src="/youtube_music.png" alt="YouTube Music" className="w-full h-full object-contain max-w-full max-h-full" />
              </button>
              {/* Apple Music */}
              <button onClick={() => { window.open(getAppleMusicUrl(), '_blank'); setShowPlatformPopup(false); }} className="w-14 h-14 p-1 flex items-center justify-center rounded-[10px] focus:outline-none">
                <img src="/apple_music.png" alt="Apple Music" className="w-full h-full object-contain max-w-full max-h-full" />
              </button>
              {/* Melon */}
              <button onClick={() => { window.open(getMelonUrl(), '_blank'); setShowPlatformPopup(false); }} className="w-14 h-14 p-1 flex items-center justify-center rounded-[10px] focus:outline-none">
                <img src="/melon.png" alt="Melon" className="w-full h-full object-contain max-w-full max-h-full" />
              </button>
              {/* Vibe */}
              <button onClick={() => { window.open(getVibeUrl(), '_blank'); setShowPlatformPopup(false); }} className="w-14 h-14 p-1 flex items-center justify-center rounded-[10px] focus:outline-none">
                <img src="/vibe.png" alt="Vibe" className="w-full h-full object-contain max-w-full max-h-full" />
              </button>
            </div>
          )}
        </div>
        <Link
          href="/playlist"
          className="text-[#A033FF] underline mt-2"
        >
          내 플레이리스트 보기
        </Link>
        <div className="w-full flex flex-col gap-4 mt-6">
          <Link href="/today/songs" className="w-full flex justify-center">
            <button className="w-full bg-[#A033FF] text-white rounded-full px-6 py-3 shadow-md hover:bg-[#7c25c9] transition text-base font-semibold">
              오늘 추천 받은 곡 보기
            </button>
          </Link>
          <a
            href="https://forms.gle/zQTC3ab4sgzJEPEY6"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex justify-center"
          >
            <button
              className="w-full bg-[#fc26d5] text-white rounded-full px-6 py-3 shadow-md hover:bg-[#7c25c9] transition text-base font-semibold"
              type="button"
            >
              나만 알고 있는 인디 노래를 추천해주세요
            </button>
          </a>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg text-sm z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </main>
  );
} 