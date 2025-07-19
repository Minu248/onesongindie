import { useState, useEffect, useCallback } from 'react';
import { Song } from '@/types/song';
import { 
  checkAndResetIfNeeded,
  getTodayRecommendedSongs,
  getRecommendationCount 
} from '@/utils/localStorage';

/**
 * 앱의 데이터 상태와 초기화를 관리하는 커스텀 훅
 * 
 * @returns {Object} 데이터 상태와 관리 함수들
 * @returns {Song[]} recommendedSongs - 오늘 추천받은 곡 목록
 * @returns {number} recommendCount - 추천받은 횟수
 * @returns {boolean} isDataLoaded - 데이터 로딩 완료 여부
 * @returns {boolean} wasReset - 데이터가 초기화되었는지 여부
 * @returns {Function} refreshData - 데이터를 다시 로드하는 함수
 */
export const useDataManager = () => {
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [recommendCount, setRecommendCount] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [wasReset, setWasReset] = useState(false);

  /**
   * localStorage에서 데이터를 로드하고 필요시 초기화
   */
  const loadData = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // 통합된 초기화 체크
      const resetOccurred = checkAndResetIfNeeded();
      setWasReset(resetOccurred);
      
      if (resetOccurred) {
        // 초기화된 경우
        setRecommendedSongs([]);
        setRecommendCount(0);
      } else {
        // 기존 데이터 로드
        const songs = getTodayRecommendedSongs();
        const count = getRecommendationCount();
        
        // 중복 제거 (링크 기준)
        const uniqueSongs = songs.filter((song, index, array) => 
          array.findIndex(s => s["링크"] === song["링크"]) === index
        );
        
        setRecommendedSongs(uniqueSongs);
        setRecommendCount(count);
      }
    } catch (error) {
      console.error('데이터 로드 중 오류 발생:', error);
      // 오류 발생 시 기본값으로 설정
      setRecommendedSongs([]);
      setRecommendCount(0);
    } finally {
      setIsDataLoaded(true);
    }
  }, []);

  /**
   * 데이터를 다시 로드하는 함수
   */
  const refreshData = useCallback(() => {
    setIsDataLoaded(false);
    loadData();
  }, [loadData]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 주기적 데이터 체크 (1분마다)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const interval = setInterval(() => {
      const resetOccurred = checkAndResetIfNeeded();
      if (resetOccurred) {
        setWasReset(true);
        setRecommendedSongs([]);
        setRecommendCount(0);
      }
    }, 60 * 1000); // 1분마다 체크
    
    return () => clearInterval(interval);
  }, []);

  return {
    recommendedSongs,
    recommendCount,
    isDataLoaded,
    wasReset,
    refreshData
  };
}; 