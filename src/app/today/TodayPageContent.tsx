"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

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

export default function TodayPageContent() {
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const artist = searchParams.get("artist");
  const link = searchParams.get("link");
  const [toast, setToast] = useState("");
  const recommendCount = getRecommendationCount();

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

  // 유튜브 뮤직 검색
  const openYouTubeMusic = () => {
    const searchQuery = `${title} ${artist}`;
    const youtubeMusicUrl = `https://music.youtube.com/search?q=${encodeURIComponent(searchQuery)}&utm_source=onesongindie.com&utm_medium=wkdalsdn5656_gmail`;
    window.open(youtubeMusicUrl, '_blank');
    setToast("YouTube Music에서 검색 중이에요!");
    setTimeout(() => setToast(""), 1500);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#FF2A68] via-[#A033FF] to-[#0B63F6] px-4">
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
        <div className="flex gap-4 mb-2">
          <button
            className="text-2xl px-4 py-2 rounded-full bg-white/60 hover:bg-white/80 shadow border border-[#FF2A68] text-[#FF2A68]"
            onClick={likeSong}
            aria-label="좋아요"
          >
            ❤️
          </button>
          <button
            className="px-4 py-2 rounded-full bg-white/60 hover:bg-white/80 shadow border border-[#FF0000] flex items-center justify-center"
            onClick={openYouTubeMusic}
            aria-label="YouTube Music에서 검색"
          >
            <img 
              src="/youtube_music.png" 
              alt="YouTube Music" 
              className="w-6 h-6"
            />
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
        <div className="w-full flex flex-col gap-4 mt-6">
          <a
            href="https://forms.gle/zQTC3ab4sgzJEPEY6"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex justify-center"
          >
            <button
              className="w-full bg-[#A033FF] text-white rounded-full px-6 py-3 shadow-md hover:bg-[#7c25c9] transition text-base font-semibold"
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