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

  useEffect(() => {
    const todaySongs: Song[] = JSON.parse(localStorage.getItem("todayRecommendedSongs") || "[]");
    // 중복 제거 (링크 기준)
    const unique = todaySongs.filter((v, i, arr) => arr.findIndex(s => s["링크"] === v["링크"]) === i);
    setSongs(unique);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#FF2A68] via-[#A033FF] to-[#0B63F6] px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-white drop-shadow">오늘 추천 받은 곡</h1>
      {songs.length === 0 ? (
        <div className="text-white/80 mb-8">오늘 추천받은 곡이 없습니다.</div>
      ) : (
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
                  <button onClick={() => window.open(`https://music.youtube.com/search?q=${encodeURIComponent(song["곡 제목"] + ' ' + song["아티스트"])}&utm_source=onesongindie.com&utm_medium=button&utm_campaign=music_search`, '_blank')} className="w-8 h-8 p-0.5 rounded-[10px] focus:outline-none">
                    <img src="/youtube_music.png" alt="YouTube Music" className="w-full h-full object-contain rounded-[10px]" />
                  </button>
                  {/* Apple Music */}
                  <button onClick={() => window.open(`https://music.apple.com/kr/search?term=${encodeURIComponent(song["곡 제목"] + ' ' + song["아티스트"])}&utm_source=onesongindie.com&utm_medium=button&utm_campaign=music_search`, '_blank')} className="w-8 h-8 p-0.5 rounded-[10px] focus:outline-none">
                    <img src="/apple_music.png" alt="Apple Music" className="w-full h-full object-contain rounded-[10px]" />
                  </button>
                  {/* Melon */}
                  <button onClick={() => window.open(getMelonUrl(song["곡 제목"] + ' ' + song["아티스트"]), '_blank')} className="w-8 h-8 p-0.5 rounded-[10px] focus:outline-none">
                    <img src="/melon.png" alt="Melon" className="w-full h-full object-contain rounded-[10px]" />
                  </button>
                  {/* Vibe */}
                  <button onClick={() => window.open(`https://vibe.naver.com/search?query=${encodeURIComponent(song["곡 제목"] + ' ' + song["아티스트"])}&utm_source=onesongindie.com&utm_medium=button&utm_campaign=music_search`, '_blank')} className="w-8 h-8 p-0.5 rounded-[10px] focus:outline-none">
                    <img src="/vibe.png" alt="Vibe" className="w-full h-full object-contain rounded-[10px]" />
                  </button>
                </div>
              </div>
            ))}
        </div>
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