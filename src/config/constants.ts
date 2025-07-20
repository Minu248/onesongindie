/**
 * 애플리케이션 전체에서 사용되는 상수들
 */

// 추천 관련 상수
export const MAX_RECOMMENDATION_PER_DAY = 1;

// 토스트 메시지 상수
export const TOAST_MESSAGES = {
  ALREADY_RECOMMENDED: "오늘은 이미 추천을 받았어요! 내일 다시 와주세요 😊",
  NO_MORE_SONGS: "더 이상 추천할 곡이 없습니다!",
  FETCH_ERROR: "곡을 불러오는 중 오류가 발생했습니다",
  SAVED_TO_PLAYLIST: "플레이리스트에 저장했어요❤️",
  LINK_COPIED: "링크가 복사되었어요!",
  FINDING_MUSIC: "지금까지 들어본 적 없는 새로운 음악을 찾고 있어요",
} as const;

// 로컬 스토리지 키 상수
export const LOCAL_STORAGE_KEYS = {
  LAST_RECOMMENDATION_DATE: "lastRecommendationDate",
  RECOMMENDATION_COUNT: "recommendationCount",
  TODAY_RECOMMENDED_SONGS: "todayRecommendedSongs",
  TODAY_SONG: "todaySong",
  LIKED_SONGS: "likedSongs",
  APP_VERSION: "appVersion",
} as const;

// 애니메이션 타이밍 상수
export const ANIMATION_TIMING = {
  LOADING_SCREEN_DURATION: 4000,
  TOAST_DISPLAY_DURATION: 3000,
  SLIDER_LOAD_DELAY: 800,
  FADE_IN_DURATION: 300,
} as const;

// 터치/드래그 상수
export const TOUCH_SETTINGS = {
  MIN_SWIPE_DISTANCE: 50,
  MIN_DRAG_DISTANCE: 50,
  WHEEL_SENSITIVITY: 50,
} as const;

// 음악 플랫폼 URL 템플릿
export const MUSIC_PLATFORM_URLS = {
  YOUTUBE_MUSIC: "https://music.youtube.com/search?q=",
  APPLE_MUSIC: "https://music.apple.com/search?term=",
  VIBE: "https://vibe.naver.com/search?query=",
} as const;

// Spotify 플랫폼 URL (PC/모바일 분리)
export const SPOTIFY_URLS = {
  PC: "https://open.spotify.com/search/",
  MOBILE: "https://open.spotify.com/search/results/",
} as const;

// Bugs 플랫폼 URL (PC/모바일 분리)
export const BUGS_URLS = {
  PC: "https://music.bugs.co.kr/search/integrated?q=",
  MOBILE: "https://m.bugs.co.kr/search/track?q=",
} as const;

// Melon 플랫폼 URL (PC/모바일 분리)
export const MELON_URLS = {
  PC: "https://www.melon.com/search/total/index.htm?q=",
  MOBILE: "https://search.melon.com/search/searchMcom.htm?s=",
} as const;


// API 엔드포인트
export const API_ENDPOINTS = {
  SONGS_DATA: "https://api.sheetbest.com/sheets/88c2b9c7-8d30-462b-ae7c-a4859aaf6955",
  FORM_SUBMIT: "https://forms.gle/zQTC3ab4sgzJEPEY6",
} as const; 