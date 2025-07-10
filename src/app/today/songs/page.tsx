"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Song {
  "곡 제목": string;
  "아티스트": string;
  "링크": string;
}

export default function TodaySongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [hasRecommendedToday, setHasRecommendedToday] = useState(false);

  useEffect(() => {
    // 날짜 체크 및 초기화 함수
    const checkAndResetSongs = () => {
      const lastDate = localStorage.getItem("lastRecommendationDate");
      const today = new Date().toDateString();
      if (lastDate !== today) {
        localStorage.setItem("lastRecommendationDate", today);
        localStorage.setItem("todayRecommendedSongs", JSON.stringify([]));
        setSongs([]);
        setHasRecommendedToday(false);
        return;
      }
      
      const recommendCount = parseInt(localStorage.getItem("recommendationCount") || "0", 10);
      setHasRecommendedToday(recommendCount > 0);
      
      const todaySongs: Song[] = JSON.parse(localStorage.getItem("todayRecommendedSongs") || "[]");
      // 중복 제거 (링크 기준)
      const unique = todaySongs.filter((v, i, arr) => arr.findIndex(s => s["링크"] === v["링크"]) === i);
      setSongs(unique);
    };

    checkAndResetSongs();
    // 1분마다 날짜 체크
    const interval = setInterval(checkAndResetSongs, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#FF2A68] via-[#A033FF] to-[#0B63F6] px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-white drop-shadow">오늘 추천 받은 곡</h1>
      {songs.length === 0 ? (
        <div className="text-white/80 mb-8 text-center">
          <p className="mb-2">오늘 추천받은 곡이 없습니다.</p>
          <p>홈으로 돌아가서 음악 추천 버튼을 눌러보세요!</p>
          <p className="mt-4 text-sm">하루에 한 번 10곡의 음악을 추천 받을 수 있어요.</p>
        </div>
      ) : (
        <>
          <p className="text-white/80 mb-4 text-center">하루에 한 번 10곡의 음악을 추천 받을 수 있어요.</p>
          <div className="w-full max-w-2xl flex flex-col gap-6">
            {songs
              .filter(song => song["곡 제목"] && song["아티스트"] && song["링크"])
              .map((song, idx) => (
                <div key={idx} className="bg-white/80 rounded-xl shadow-lg p-5 flex flex-col items-center backdrop-blur-md overflow-hidden">
                  <div className="mb-1 text-lg font-semibold text-[#A033FF]">{song["곡 제목"]}</div>
                  <div className="mb-3 text-gray-700">{song["아티스트"]}</div>
                  {song["링크"] && song["링크"].includes("youtu") && (
                    <div className="w-full max-w-xl mx-auto aspect-[16/9] mb-2">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${getYoutubeId(song["링크"])}?autoplay=0`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {/* 플랫폼 아이콘 버튼 */}
                  <div className="flex gap-3 mt-2">
                    {/* YouTube Music */}
                    <button onClick={() => window.open(getYouTubeMusicUrl(song["곡 제목"] + ' ' + song["아티스트"]), '_blank')} className="w-8 h-8 p-0.5 rounded-[10px] focus:outline-none">
                      <img src="/youtube_music.png" alt="YouTube Music" className="w-full h-full object-contain rounded-[10px]" />
                    </button>
                    {/* Apple Music */}
                    <button onClick={() => window.open(getAppleMusicUrl(song["곡 제목"] + ' ' + song["아티스트"]), '_blank')} className="w-8 h-8 p-0.5 rounded-[10px] focus:outline-none">
                      <img src="/apple_music.png" alt="Apple Music" className="w-full h-full object-contain rounded-[10px]" />
                    </button>
                    {/* Spotify */}
                    <button onClick={() => window.open(getSpotifyUrl(song["곡 제목"] + ' ' + song["아티스트"]), '_blank')} className="w-8 h-8 p-0.5 rounded-[10px] focus:outline-none">
                      <img src="/spotify.png" alt="Spotify" className="w-full h-full object-contain rounded-[10px]" />
                    </button>
                    {/* Vibe */}
                    <button onClick={() => window.open(getVibeUrl(song["곡 제목"] + ' ' + song["아티스트"]), '_blank')} className="w-8 h-8 p-0.5 rounded-[10px] focus:outline-none">
                      <img src="/vibe.png" alt="Vibe" className="w-full h-full object-contain rounded-[10px]" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
      <Link href="/" className="mt-8 flex justify-center w-full">
        <button className="w-full max-w-xs bg-[#A033FF] text-white rounded-full px-6 py-3 shadow-md hover:bg-[#7c25c9] transition text-base font-semibold border-2 border-white/80">
          홈으로 돌아가기
        </button>
      </Link>
    </main>
  );
}

function getYoutubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/);
  return match ? match[1] : null;
}

function isMobile() {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function getMelonUrl(query: string) {
  if (isMobile()) {
    return `https://search.melon.com/search/searchMcom.htm?s=${encodeURIComponent(query)}&kkoSpl=Y&kkoDpType=&mwkLogType=C`;
  } else {
    return `https://www.melon.com/search/total/index.htm?q=${encodeURIComponent(query)}&section=&mwkLogType=T`;
  }
}

// 플랫폼별 검색 URL 생성 함수
function getYouTubeMusicUrl(query: string) {
  return `https://music.youtube.com/search?q=${encodeURIComponent(query)}&utm_source=onesongindie.com&utm_medium=wkdalsdn5656_gmail&utm_campaign=music_search`;
}
function getAppleMusicUrl(query: string) {
  return `https://music.apple.com/kr/search?term=${encodeURIComponent(query)}&utm_source=onesongindie.com&utm_medium=wkdalsdn5656_gmail&utm_campaign=music_search`;
}
function getSpotifyUrl(query: string) {
  return `https://open.spotify.com/search/results/${encodeURIComponent(query)}?utm_source=onesongindie.com&utm_medium=wkdalsdn5656_gmail&utm_campaign=music_search`;
}
function getVibeUrl(query: string) {
  return `https://vibe.naver.com/search?query=${encodeURIComponent(query)}&utm_source=onesongindie.com&utm_medium=wkdalsdn5656_gmail&utm_campaign=music_search`;
} 