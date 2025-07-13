import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Song } from "@/types/song";
import { 
  getRecommendationCount, 
  canGetRecommendation, 
  getStoredTodaySong, 
  getTodayRecommendedSongs,
  incrementRecommendationCount,
  setStoredTodaySong,
  addTodayRecommendedSong,
  checkAndResetIfNeeded 
} from "@/utils/localStorage";
import { MAX_RECOMMENDATION_PER_DAY } from "@/config/constants";

export const useRecommendationManager = () => {
  const { data: session } = useSession();
  const [canRecommend, setCanRecommend] = useState(true);
  const [recommendCount, setRecommendCount] = useState(0);
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);

  // 컴포넌트 마운트 시 추천 상태 확인
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (session) {
      setCanRecommend(true);
      setRecommendCount(0); // 로그인 유저는 무제한
    } else {
      const todaySong = getStoredTodaySong();
      const count = getRecommendationCount();
      setRecommendCount(count);
      setCanRecommend(count < MAX_RECOMMENDATION_PER_DAY);
    }
  }, [session]);

  // 추천받은 곡 목록 로드
  const loadRecommendedSongs = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const wasReset = checkAndResetIfNeeded();
    
    if (wasReset) {
      setRecommendedSongs([]);
      setRecommendCount(0);
    } else {
      const songs = getTodayRecommendedSongs();
      const count = getRecommendationCount();
      setRecommendedSongs(songs);
      setRecommendCount(count);
    }
  }, []);

  // 추천 처리
  const processRecommendation = useCallback((songs: Song[]) => {
    if (songs.length === 0) return null;

    const random = songs[0];
    setStoredTodaySong(random);

    if (!session) {
      incrementRecommendationCount();
      
      // 10개의 곡을 모두 오늘의 추천 곡 목록에 추가
      songs.forEach(song => {
        addTodayRecommendedSong(song);
      });
      
      setRecommendCount(getRecommendationCount());
      setCanRecommend(getRecommendationCount() < MAX_RECOMMENDATION_PER_DAY);
    }

    return random;
  }, [session]);

  return {
    canRecommend,
    recommendCount,
    recommendedSongs,
    loadRecommendedSongs,
    processRecommendation,
  };
}; 