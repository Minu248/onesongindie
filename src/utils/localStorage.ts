import { Song } from "@/types/song";
import { LOCAL_STORAGE_KEYS, MAX_RECOMMENDATION_PER_DAY } from "@/config/constants";
import { APP_VERSION } from "@/config/appVersion";

/**
 * 오늘 날짜를 문자열로 반환합니다
 */
export const getTodayString = (): string => {
  return new Date().toDateString();
};

/**
 * 모든 관련 데이터를 완전히 초기화합니다
 */
export const resetAllTodayData = (): void => {
  const today = getTodayString();
  localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_RECOMMENDATION_DATE, today);
  localStorage.setItem(LOCAL_STORAGE_KEYS.RECOMMENDATION_COUNT, "0");
  localStorage.setItem(LOCAL_STORAGE_KEYS.TODAY_RECOMMENDED_SONGS, JSON.stringify([]));
  localStorage.setItem(LOCAL_STORAGE_KEYS.TODAY_SONG, "");
  localStorage.setItem(LOCAL_STORAGE_KEYS.APP_VERSION, APP_VERSION);
};

/**
 * 앱 버전 체크를 통한 강제 초기화
 */
export const forceResetIfNeeded = (): boolean => {
  const storedVersion = localStorage.getItem(LOCAL_STORAGE_KEYS.APP_VERSION);
  if (storedVersion !== APP_VERSION) {
    console.log(`앱 버전이 업데이트되었습니다 (${storedVersion} -> ${APP_VERSION}). 데이터를 초기화합니다.`);
    resetAllTodayData();
    return true;
  }
  return false;
};

/**
 * 날짜 체크 및 필요시 초기화
 */
export const checkAndResetIfNeeded = (): boolean => {
  // 먼저 앱 버전 체크
  const wasForceReset = forceResetIfNeeded();
  if (wasForceReset) return true;
  
  // 날짜 체크
  const lastDate = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_RECOMMENDATION_DATE);
  const today = getTodayString();
  
  if (lastDate !== today) {
    resetAllTodayData();
    return true; // 초기화됨
  }
  return false; // 초기화되지 않음
};

/**
 * 추천 횟수를 가져옵니다
 */
export const getRecommendationCount = (): number => {
  checkAndResetIfNeeded();
  return parseInt(localStorage.getItem(LOCAL_STORAGE_KEYS.RECOMMENDATION_COUNT) || "0", 10);
};

/**
 * 추천 횟수를 증가시킵니다
 */
export const incrementRecommendationCount = (): void => {
  const count = getRecommendationCount() + 1;
  localStorage.setItem(LOCAL_STORAGE_KEYS.RECOMMENDATION_COUNT, count.toString());
};

/**
 * 추천을 받을 수 있는지 확인합니다
 */
export const canGetRecommendation = (): boolean => {
  const wasReset = checkAndResetIfNeeded();
  if (wasReset) return true;
  
  const count = parseInt(localStorage.getItem(LOCAL_STORAGE_KEYS.RECOMMENDATION_COUNT) || "0", 10);
  return count < MAX_RECOMMENDATION_PER_DAY;
};

/**
 * 추천을 사용했다고 표시합니다
 */
export const setRecommendationUsed = (): void => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_RECOMMENDATION_DATE, getTodayString());
};

/**
 * 오늘의 곡을 가져옵니다
 */
export const getStoredTodaySong = (): Song | null => {
  const wasReset = checkAndResetIfNeeded();
  if (wasReset) return null;
  
  const storedSong = localStorage.getItem(LOCAL_STORAGE_KEYS.TODAY_SONG);
  if (!storedSong) return null;
  
  try {
    return JSON.parse(storedSong);
  } catch (e) {
    console.error("todaySong 파싱 오류:", e);
    return null;
  }
};

/**
 * 오늘의 곡을 저장합니다
 */
export const setStoredTodaySong = (song: Song): void => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.TODAY_SONG, JSON.stringify(song));
};

/**
 * 오늘 추천받은 곡 리스트를 가져옵니다
 */
export const getTodayRecommendedSongs = (): Song[] => {
  const wasReset = checkAndResetIfNeeded();
  if (wasReset) return [];
  
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.TODAY_RECOMMENDED_SONGS) || "[]");
  } catch (e) {
    console.error("todayRecommendedSongs 파싱 오류:", e);
    return [];
  }
};

/**
 * 오늘의 추천 곡 리스트에 곡을 추가합니다
 */
export const addTodayRecommendedSong = (song: Song): void => {
  const list = getTodayRecommendedSongs();
  // 이미 동일한 링크가 있으면 추가하지 않음
  if (!list.find((s: Song) => s["링크"] === song["링크"])) {
    list.push(song);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TODAY_RECOMMENDED_SONGS, JSON.stringify(list));
  }
};

/**
 * 좋아요한 곡 리스트를 가져옵니다
 */
export const getLikedSongs = (): Song[] => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.LIKED_SONGS) || "[]");
  } catch (e) {
    console.error("likedSongs 파싱 오류:", e);
    return [];
  }
};

/**
 * 좋아요한 곡을 추가합니다
 */
export const addLikedSong = (song: Song): void => {
  const liked = getLikedSongs();
  if (!liked.find((s: Song) => s["링크"] === song["링크"])) {
    liked.push(song);
    localStorage.setItem(LOCAL_STORAGE_KEYS.LIKED_SONGS, JSON.stringify(liked));
  }
}; 