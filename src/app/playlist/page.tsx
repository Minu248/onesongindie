"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

const getYoutubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/);
  return match ? match[1] : null;
};

interface Song {
  "곡 제목": string;
  "아티스트": string;
  "링크": string;
}

export default function Playlist() {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem("likedSongs") || "[]");
    setSongs(liked);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#FF2A68] via-[#A033FF] to-[#0B63F6] px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-white drop-shadow">내 플레이리스트</h1>
      {songs.length === 0 ? (
        <div className="text-white/90 mb-8">저장된 곡이 없어요.</div>
      ) : (
        <div className="w-full max-w-2xl flex flex-col gap-6">
          {songs.map((song, idx) => (
            <div key={idx} className="bg-white/80 rounded-xl shadow-lg p-5 flex flex-col items-center backdrop-blur-md overflow-hidden">
              <div className="mb-1 text-lg font-semibold text-[#A033FF]">{song["곡 제목"]}</div>
              <div className="mb-3 text-gray-700">{song["아티스트"]}</div>
              {getYoutubeId(song["링크"]) && (
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
            </div>
          ))}
        </div>
      )}
    <Link href="/" className="mt-8 flex justify-center w-full">
      <button 
          className="w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 border border-white/40 backdrop-blur-sm"
          aria-label="홈으로 돌아가기"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
          >
            <path 
              d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <polyline 
              points="9,22 9,12 15,12 15,22" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </Link>
    </main>
  );
} 