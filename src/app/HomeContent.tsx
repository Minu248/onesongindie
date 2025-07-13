'use client';
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { APP_VERSION } from "@/config/appVersion";

const LpIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <circle cx="16" cy="16" r="15" fill="#111" stroke="#222" strokeWidth="2" />
    <circle cx="16" cy="16" r="7" fill="#F55" />
    <circle cx="16" cy="16" r="2" fill="#FDD" />
    <path d="M8 8a12 12 0 0 1 16 0" stroke="#333" strokeWidth="2" />
    <path d="M8 24a12 12 0 0 0 16 0" stroke="#333" strokeWidth="2" />
  </svg>
);

interface Song {
  "곡 제목": string;
  "아티스트": string;
  "링크": string;
}

// 하루에 최대 추천 횟수
const MAX_RECOMMENDATION_PER_DAY = 1;

const getTodayString = () => {
  return new Date().toDateString();
};

// 통합된 초기화 함수 - 모든 관련 데이터를 완전히 초기화
const resetAllTodayData = () => {
  const today = getTodayString();
  localStorage.setItem("lastRecommendationDate", today);
  localStorage.setItem("recommendationCount", "0");
  localStorage.setItem("todayRecommendedSongs", JSON.stringify([]));
  localStorage.setItem("todaySong", ""); // 빈 문자열로 초기화
  localStorage.setItem("appVersion", APP_VERSION); // 앱 버전 저장
};

// 앱 버전 체크를 통한 강제 초기화
const forceResetIfNeeded = () => {
  const storedVersion = localStorage.getItem("appVersion");
  if (storedVersion !== APP_VERSION) {
    console.log(`앱 버전이 업데이트되었습니다 (${storedVersion} -> ${APP_VERSION}). 데이터를 초기화합니다.`);
    resetAllTodayData();
    return true;
  }
  return false;
};

// 날짜 체크 및 필요시 초기화
const checkAndResetIfNeeded = () => {
  // 먼저 앱 버전 체크
  const wasForceReset = forceResetIfNeeded();
  if (wasForceReset) return true;
  
  // 날짜 체크
  const lastDate = localStorage.getItem("lastRecommendationDate");
  const today = getTodayString();
  
  if (lastDate !== today) {
    resetAllTodayData();
    return true; // 초기화됨
  }
  return false; // 초기화되지 않음
};

const getRecommendationCount = () => {
  checkAndResetIfNeeded();
  return parseInt(localStorage.getItem("recommendationCount") || "0", 10);
};

const incrementRecommendationCount = () => {
  const count = getRecommendationCount() + 1;
  localStorage.setItem("recommendationCount", count.toString());
};

const canGetRecommendation = () => {
  const wasReset = checkAndResetIfNeeded();
  if (wasReset) return true;
  
  const count = parseInt(localStorage.getItem("recommendationCount") || "0", 10);
  return count < MAX_RECOMMENDATION_PER_DAY;
};

const setRecommendationUsed = () => {
  localStorage.setItem("lastRecommendationDate", getTodayString());
};

const getStoredTodaySong = (): Song | null => {
  const wasReset = checkAndResetIfNeeded();
  if (wasReset) return null;
  
  const storedSong = localStorage.getItem("todaySong");
  if (!storedSong) return null;
  
  try {
    return JSON.parse(storedSong);
  } catch (e) {
    console.error("todaySong 파싱 오류:", e);
    return null;
  }
};

const setStoredTodaySong = (song: Song) => {
  localStorage.setItem("todaySong", JSON.stringify(song));
};

// 오늘 추천받은 곡 리스트 관리
const getTodayRecommendedSongs = (): Song[] => {
  const wasReset = checkAndResetIfNeeded();
  if (wasReset) return [];
  
  try {
    return JSON.parse(localStorage.getItem("todayRecommendedSongs") || "[]");
  } catch (e) {
    console.error("todayRecommendedSongs 파싱 오류:", e);
    return [];
  }
};

const addTodayRecommendedSong = (song: Song) => {
  const list = getTodayRecommendedSongs();
  // 이미 동일한 링크가 있으면 추가하지 않음
  if (!list.find((s: Song) => s["링크"] === song["링크"])) {
    list.push(song);
    localStorage.setItem("todayRecommendedSongs", JSON.stringify(list));
  }
};

export default function HomeContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [toast, setToast] = useState("");
  const [isSharedMode, setIsSharedMode] = useState(false);
  const [canRecommend, setCanRecommend] = useState(true);
  const [recommendCount, setRecommendCount] = useState(0);

  // 컴포넌트 마운트 시 오늘의 곡이 이미 있는지 확인
  useEffect(() => {
    if (session) {
      setCanRecommend(true);
      setRecommendCount(0); // 로그인 유저는 무제한이므로 카운트 표시 X
    } else {
      const todaySong = getStoredTodaySong();
      const count = getRecommendationCount();
      setRecommendCount(count);
      if (todaySong) {
        setCanRecommend(count < MAX_RECOMMENDATION_PER_DAY);
      } else {
        setCanRecommend(count < MAX_RECOMMENDATION_PER_DAY);
      }
    }
  }, [session]);

  // URL 파라미터에서 공유된 곡 정보 확인
  useEffect(() => {
    const title = searchParams.get("title");
    const artist = searchParams.get("artist");
    const link = searchParams.get("link");
    
    if (title && artist && link) {
      setIsSharedMode(true);
    }
  }, [searchParams]);

  const fetchSongAndRedirect = async () => {
    try {
      const res = await fetch("https://api.sheetbest.com/sheets/88c2b9c7-8d30-462b-ae7c-a4859aaf6955");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      let songs: Song[] = await res.json();
      if (songs.length === 0) throw new Error("곡 데이터가 없습니다");
      
      // 이미 추천된 곡 필터링
      if (!session) {
        const recommendedSongs = getTodayRecommendedSongs();
        songs = songs.filter(song => !recommendedSongs.find(s => s["링크"] === song["링크"]));
        if (songs.length === 0) {
          setToast("더 이상 추천할 곡이 없습니다!");
          setTimeout(() => setToast(""), 3000);
          return;
        }
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
      
      // 첫 번째 곡을 현재 추천 곡으로 설정
      const random = randomSongs[0];
      setStoredTodaySong(random);
      
      if (!session) {
        incrementRecommendationCount();
        
        // 10개의 곡을 모두 오늘의 추천 곡 목록에 추가
        const existingRecommendedSongs = getTodayRecommendedSongs();
        const newRecommendedSongs = [...existingRecommendedSongs];
        
        randomSongs.forEach(song => {
          // 이미 추천 목록에 없는 곡만 추가
          if (!newRecommendedSongs.find(s => s["링크"] === song["링크"])) {
            newRecommendedSongs.push(song);
          }
        });
        
        // 업데이트된 추천 목록 저장
        localStorage.setItem("todayRecommendedSongs", JSON.stringify(newRecommendedSongs));
        setRecommendCount(getRecommendationCount());
      }
      
      setCanRecommend(session ? true : getRecommendationCount() < MAX_RECOMMENDATION_PER_DAY);
      setIsSharedMode(false);
      
      // 곡 정보 쿼리 파라미터로 /today로 이동
      router.push(`/today`);
    } catch (error) {
      console.error("fetchSong 에러:", error);
      setToast("곡을 불러오는 중 오류가 발생했습니다");
      setTimeout(() => setToast(""), 3000);
    }
  };

  const handleRecommendClick = () => {
    if (!session && !canRecommend) {
      setToast(`오늘은 이미 추천을 받았어요! 내일 다시 와주세요 😊`);
      setTimeout(() => setToast(""), 3000);
      return;
    }
    fetchSongAndRedirect();
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#FF2A68] via-[#A033FF] to-[#0B63F6] px-4">
      <div className="text-center mb-8">
        <div className="text-lg text-white/90 mb-2">들어볼래?</div>
        <div className="text-5xl font-bold text-white drop-shadow">한곡인디</div>
      </div>
      <button
        className={`w-32 h-32 ${canRecommend ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-400/20 hover:bg-gray-400/30'} text-white rounded-full shadow-lg transition mb-4 flex items-center justify-center text-4xl border-2 border-white/40 backdrop-blur`}
        onClick={handleRecommendClick}
        aria-label="오늘의 인디 한 곡 추천받기"
      >
        {canRecommend ? '🎵' : '⏰'}
      </button>
      {/* 카운트 숫자 + LP판 아이콘 */}
      {/* <div className="flex items-center justify-center mb-4">
        {!session && <LpIcon />}
        {!session && <span className="text-2xl font-bold text-white">{recommendCount}/{MAX_RECOMMENDATION_PER_DAY}</span>}
      </div> */}
      <div className="mt-1 mb-2 text-white/90 text-base text-center font-medium">
        당신의 하루를 바꿔줄 한국 인디 음악을 발견하세요
      </div>
      <div className="mb-6 text-white/90 text-base text-center font-medium">
        하루에 한 번 10곡의 음악을 추천 받을 수 있어요
      </div>
      {recommendCount > 0 && (
        <Link href="/today" className="w-full flex justify-center mb-4">
          <button className="w-full max-w-xs bg-[#A033FF] text-white rounded-full px-6 py-3 shadow-md hover:bg-[#7c25c9] transition text-base font-semibold">
            오늘 추천 받은 곡 보기
          </button>
        </Link>
      )}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg text-sm z-50 animate-fade-in">
          {toast}
        </div>
      )}
      {session && (
        <button
          onClick={() => signOut()}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 text-xs rounded-full bg-gray-200 text-gray-700 shadow z-50"
          style={{ minWidth: 80 }}
        >
          로그아웃
        </button>
      )}
    </main>
  );
} 