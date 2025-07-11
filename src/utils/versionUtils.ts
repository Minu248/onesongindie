import { APP_VERSION } from '@/config/appVersion';

/**
 * 현재 앱 버전을 반환합니다.
 */
export const getCurrentAppVersion = (): string => {
  return APP_VERSION;
};

/**
 * 브라우저에 저장된 버전을 반환합니다.
 */
export const getStoredVersion = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('appVersion');
};

/**
 * 버전 업데이트가 필요한지 확인합니다.
 */
export const needsVersionUpdate = (): boolean => {
  const storedVersion = getStoredVersion();
  return storedVersion !== APP_VERSION;
};

/**
 * 버전 정보를 콘솔에 출력합니다. (개발용)
 */
export const logVersionInfo = (): void => {
  console.log('=== 앱 버전 정보 ===');
  console.log('현재 앱 버전:', getCurrentAppVersion());
  console.log('저장된 버전:', getStoredVersion());
  console.log('업데이트 필요:', needsVersionUpdate());
  console.log('==================');
};

/**
 * 개발 환경에서 버전을 강제로 설정합니다.
 */
export const setVersionForTesting = (version: string): void => {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'development') {
    console.warn('setVersionForTesting은 개발 환경에서만 사용할 수 있습니다.');
    return;
  }
  localStorage.setItem('appVersion', version);
  console.log(`테스트용 버전 설정: ${version}`);
};

/**
 * 모든 앱 데이터를 초기화합니다. (개발용)
 */
export const clearAllAppData = (): void => {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'development') {
    console.warn('clearAllAppData는 개발 환경에서만 사용할 수 있습니다.');
    return;
  }
  
  const keys = ['appVersion', 'lastRecommendationDate', 'recommendationCount', 'todayRecommendedSongs', 'todaySong', 'likedSongs'];
  keys.forEach(key => localStorage.removeItem(key));
  console.log('모든 앱 데이터가 초기화되었습니다.');
};

/**
 * 개발자 도구에서 사용할 수 있는 글로벌 함수들을 등록합니다.
 */
export const registerDevTools = (): void => {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'development') return;
  
  // @ts-ignore
  window.appVersionUtils = {
    getCurrentVersion: getCurrentAppVersion,
    getStoredVersion,
    needsUpdate: needsVersionUpdate,
    logInfo: logVersionInfo,
    setVersion: setVersionForTesting,
    clearAll: clearAllAppData,
    help: () => {
      console.log('=== 앱 버전 유틸리티 사용법 ===');
      console.log('window.appVersionUtils.getCurrentVersion() - 현재 버전 확인');
      console.log('window.appVersionUtils.getStoredVersion() - 저장된 버전 확인');
      console.log('window.appVersionUtils.needsUpdate() - 업데이트 필요 여부');
      console.log('window.appVersionUtils.logInfo() - 버전 정보 출력');
      console.log('window.appVersionUtils.setVersion("1.0.0") - 테스트용 버전 설정');
      console.log('window.appVersionUtils.clearAll() - 모든 데이터 초기화');
      console.log('================================');
    }
  };
  
  console.log('개발자 도구가 등록되었습니다. window.appVersionUtils.help()를 실행해보세요.');
}; 