"use client";
import React, { useState } from "react";
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

export default function Home() {
  const [song, setSong] = useState<Song | null>(null);
  const [toast, setToast] = useState("");

  const fetchSong = async () => {
    const res = await fetch("/songs.json");
    const songs: Song[] = await res.json();
    const random = songs[Math.floor(Math.random() * songs.length)];
    setSong(random);
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
        <div className="text-lg text-white/80 mb-2">들어볼래</div>
        <div className="text-5xl font-bold text-white drop-shadow">한 곡 Indie</div>
      </div>
      <button
        className="w-16 h-16 bg-white/20 text-white rounded-full shadow-lg hover:bg-white/30 transition mb-8 flex items-center justify-center text-2xl border-2 border-white/40 backdrop-blur"
        onClick={fetchSong}
        aria-label="오늘의 인디 한 곡 추천받기"
      >
        🎵
      </button>
      {song && (
        <div className="w-full max-w-2xl bg-white/80 rounded-xl shadow-lg p-6 flex flex-col items-center backdrop-blur-md">
          <div className="mb-2 text-lg font-semibold text-[#A033FF]">{song["곡 제목"]}</div>
          <div className="mb-4 text-gray-700">{song["아티스트"]}</div>
          {getYoutubeId(song["링크"]) && (
            <iframe
              className="rounded-lg mb-4"
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${getYoutubeId(song["링크"])}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
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
          <Link href="/playlist" className="text-[#A033FF] underline mt-2">내 플레이리스트 보기</Link>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg text-sm z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </main>
  );
} 