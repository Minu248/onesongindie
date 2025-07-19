import { useState, useEffect } from 'react';

// YouTube IFrame API 타입 정의
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

/**
 * YouTube IFrame API를 로드하고 준비 상태를 관리하는 커스텀 훅
 * 
 * @returns {Object} YouTube API 준비 상태와 관련 정보
 * @returns {boolean} isYouTubeAPIReady - YouTube API가 준비되었는지 여부
 * @returns {boolean} isLoading - API 로딩 중인지 여부
 * @returns {Error | null} error - 로딩 중 발생한 오류
 */
export const useYouTubeAPI = () => {
  const [isYouTubeAPIReady, setIsYouTubeAPIReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 서버 사이드 렌더링 환경에서는 실행하지 않음
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }
    
    // 이미 로드된 경우
    if (window.YT && window.YT.Player) {
      setIsYouTubeAPIReady(true);
      setIsLoading(false);
      return;
    }
    
    try {
      // API 스크립트가 이미 로드 중인지 확인
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (existingScript) {
        // 이미 로드 중이면 콜백만 설정
        window.onYouTubeIframeAPIReady = () => {
          setIsYouTubeAPIReady(true);
          setIsLoading(false);
        };
        return;
      }

      // API 스크립트 로드
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      
      // 스크립트 로딩 오류 처리
      script.onerror = () => {
        setError(new Error('YouTube API 스크립트 로드에 실패했습니다.'));
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
      
      // API 준비 완료 콜백
      window.onYouTubeIframeAPIReady = () => {
        setIsYouTubeAPIReady(true);
        setIsLoading(false);
      };
      
      // 컴포넌트 언마운트 시 정리
      return () => {
        // 스크립트는 한 번만 로드되므로 제거하지 않음
        // 대신 콜백만 정리
        if (window.onYouTubeIframeAPIReady) {
          delete window.onYouTubeIframeAPIReady;
        }
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('YouTube API 로드 중 알 수 없는 오류가 발생했습니다.'));
      setIsLoading(false);
    }
  }, []);

  return {
    isYouTubeAPIReady,
    isLoading,
    error
  };
}; 