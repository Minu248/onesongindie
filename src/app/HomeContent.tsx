'use client';
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const getYoutubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/);
  return match ? match[1] : null;
};

interface Song {
  "곡 제목": string;
  "아티스트": string;
  "링크": string;
}

// 하루에 한 번 제한을 위한 유틸리티 함수들
const getTodayString = () => {
  return new Date().toDateString();
};

const canGetRecommendation = () => {
  const lastRecommendationDate = localStorage.getItem("lastRecommendationDate");
  const today = getTodayString();
  
  if (!lastRecommendationDate || lastRecommendationDate !== today) {
    return true;
  }
  return false;
};

const setRecommendationUsed = () => {
  localStorage.setItem("lastRecommendationDate", getTodayString());
};

const getStoredTodaySong = (): Song | null => {
  const storedDate = localStorage.getItem("lastRecommendationDate");
  const today = getTodayString();
  
  if (storedDate === today) {
    const storedSong = localStorage.getItem("todaySong");
    return storedSong ? JSON.parse(storedSong) : null;
  }
  return null;
};

const setStoredTodaySong = (song: Song) => {
  localStorage.setItem("todaySong", JSON.stringify(song));
};

export default function HomeContent() {
  const searchParams = useSearchParams();
  const [song, setSong] = useState<Song | null>(null);
  const [toast, setToast] = useState("");
  const [isSharedMode, setIsSharedMode] = useState(false);
  const [canRecommend, setCanRecommend] = useState(true);

  // 컴포넌트 마운트 시 오늘의 곡이 이미 있는지 확인
  useEffect(() => {
    const todaySong = getStoredTodaySong();
    if (todaySong) {
      setSong(todaySong);
      setCanRecommend(false);
    } else {
      setCanRecommend(canGetRecommendation());
    }
  }, []);

  // URL 파라미터에서 공유된 곡 정보 확인
  useEffect(() => {
    const title = searchParams.get("title");
    const artist = searchParams.get("artist");
    const link = searchParams.get("link");
    
    if (title && artist && link) {
      const sharedSong = {
        "곡 제목": title,
        "아티스트": artist,
        "링크": link,
      };
      setSong(sharedSong);
      setIsSharedMode(true);
    }
  }, [searchParams]);

  const fetchSong = async () => {
    try {
      const res = await fetch("https://api.sheetbest.com/sheets/88c2b9c7-8d30-462b-ae7c-a4859aaf6955");
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const songs: Song[] = await res.json();
      
      if (songs.length === 0) {
        throw new Error("곡 데이터가 없습니다");
      }
      
      const random = songs[Math.floor(Math.random() * songs.length)];
      setSong(random);
      setStoredTodaySong(random);
      setRecommendationUsed();
      setCanRecommend(false);
      setIsSharedMode(false);
    } catch (error) {
      console.error("fetchSong 에러:", error);
      setToast("곡을 불러오는 중 오류가 발생했습니다");
      setTimeout(() => setToast(""), 3000);
    }
  };

  const handleRecommendClick = () => {
    if (!canRecommend) {
      setToast("오늘의 추천은 이미 받았어요! 내일 다시 와주세요 😊");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    fetchSong();
  };

  const likeSong = () => {
    if (!song) return;
    const liked = JSON.parse(localStorage.getItem("likedSongs") || "[]");
    if (!liked.find((s: Song) => s["링크"] === song["링크"])) {
      liked.push(song);
      localStorage.setItem("likedSongs", JSON.stringify(liked));
    }
    setToast("플레이리스트에 저장했어요!");
    setTimeout(() => setToast(""), 1500);
  };

  const shareSong = () => {
    if (!song) return;
    const url = window.location.origin + `/?title=${encodeURIComponent(song["곡 제목"])}&artist=${encodeURIComponent(song["아티스트"])}&link=${encodeURIComponent(song["링크"])}`;
    navigator.clipboard.writeText(url);
    setToast("링크가 복사되었어요!");
    setTimeout(() => setToast(""), 1500);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#FF2A68] via-[#A033FF] to-[#0B63F6] px-4">
      <div className="text-center mb-8">
        <div className="text-lg text-white/80 mb-2">들어볼래?</div>
        <div className="text-5xl font-bold text-white drop-shadow">한 곡 Indie</div>
      </div>
      
      {/* 공유 모드일 때 */}
      {isSharedMode && song ? (
        <div className="flex flex-col items-center mb-4 w-full">
          <div className="w-full max-w-2xl bg-white/80 rounded-xl shadow-lg p-6 flex flex-col items-center backdrop-blur-md overflow-hidden mb-6">
            <div className="mb-2 text-lg font-semibold text-[#A033FF]">{song["곡 제목"]}</div>
            <div className="mb-4 text-gray-700">{song["아티스트"]}</div>
            {getYoutubeId(song["링크"]) && (
              <div className="w-full max-w-xl mx-auto aspect-[16/9] mb-4">
                <iframe
                  className="w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${getYoutubeId(song["링크"])}?autoplay=1`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            <div className="text-center text-[#A033FF] font-medium mb-4">
              ✉️ 친구가 추천한 한국 인디 노래가 도착했어요
            </div>
          </div>
          <button
            className={`w-48 h-14 ${canRecommend ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-400/20 cursor-not-allowed'} text-white rounded-full shadow-lg transition mb-8 flex items-center justify-center text-lg border-2 border-white/40 backdrop-blur font-semibold`}
            onClick={handleRecommendClick}
            aria-label="오늘의 인디 한 곡 추천받기"
            disabled={!canRecommend}
          >
            {canRecommend ? '오늘의 곡 추천 받기' : '오늘은 이미 받았어요'}
          </button>
        </div>
      ) : (
        <>
          {/* 곡이 없을 때 (초기 상태) */}
          {!song ? (
            <>
              <button
                className={`w-32 h-32 ${canRecommend ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-400/20 hover:bg-gray-400/30'} text-white rounded-full shadow-lg transition mb-8 flex items-center justify-center text-4xl border-2 border-white/40 backdrop-blur`}
                onClick={handleRecommendClick}
                aria-label="오늘의 인디 한 곡 추천받기"
              >
                {canRecommend ? '🎵' : '⏰'}
              </button>
              <div className="mb-8 text-white/90 text-base text-center font-medium">
                당신의 하루를 바꿔줄 한국 인디 음악을 발견하세요
              </div>
            </>
          ) : (
            /* 곡이 있을 때 (랜덤 추천 모드) */
            <div className="flex flex-col items-center mb-4">
              <button
                className={`w-16 h-16 ${canRecommend ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-400/20 hover:bg-gray-400/30'} text-white rounded-full shadow-lg transition mb-8 flex items-center justify-center text-2xl border-2 border-white/40 backdrop-blur`}
                onClick={handleRecommendClick}
                aria-label="오늘의 인디 한 곡 추천받기"
              >
                {canRecommend ? '🎵' : '⏰'}
              </button>
              <div className="mb-8 text-white/90 text-base text-center font-medium">
                당신의 하루를 바꿔줄 한국 인디 음악을 발견하세요
              </div>
            </div>
          )}
          
          {/* 곡 정보 표시 */}
          {song && (
            <div className="w-full max-w-2xl bg-white/80 rounded-xl shadow-lg p-6 flex flex-col items-center backdrop-blur-md overflow-hidden">
              <div className="mb-2 text-lg font-semibold text-[#A033FF]">{song["곡 제목"]}</div>
              <div className="mb-4 text-gray-700">{song["아티스트"]}</div>
              {getYoutubeId(song["링크"]) && (
                <div className="w-full max-w-xl mx-auto aspect-[16/9] mb-4">
                  <iframe
                    className="w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/${getYoutubeId(song["링크"])}?autoplay=1`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              <div className="mb-4 text-[#A033FF]">오늘의 추천곡이에요 🎧</div>
              <div className="flex gap-4 mb-2">
                <button
                  className="text-2xl px-4 py-2 rounded-full bg-white/60 hover:bg-white/80 shadow border border-[#FF2A68] text-[#FF2A68]"
                  onClick={likeSong}
                  aria-label="좋아요"
                >
                  ❤️
                </button>
                <button
                  className="text-2xl px-4 py-2 rounded-full bg-white/60 hover:bg-white/80 shadow border border-[#0B63F6] text-[#0B63F6]"
                  onClick={shareSong}
                  aria-label="공유"
                >
                  🔗
                </button>
              </div>
              <Link
                href="/playlist"
                className="text-[#A033FF] underline mt-2"
              >
                내 플레이리스트 보기
              </Link>
              <a
                href="https://forms.gle/zQTC3ab4sgzJEPEY6"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full flex justify-center"
              >
                <button
                  className="bg-[#A033FF] text-white rounded-full px-6 py-3 shadow-md hover:bg-[#7c25c9] transition text-base font-semibold"
                  type="button"
                >
                  나만 알고 있는 인디 노래를 추천해주세요
                </button>
              </a>
            </div>
          )}
        </>
      )}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg text-sm z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </main>
  );
} 