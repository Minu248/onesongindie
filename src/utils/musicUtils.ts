import { MUSIC_PLATFORM_URLS } from "@/config/constants";

/**
 * YouTube URL에서 비디오 ID를 추출합니다
 */
export const getYoutubeId = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/);
  return match ? match[1] : null;
};

/**
 * 각 음악 플랫폼 검색 URL을 생성합니다
 */
export const getYouTubeMusicUrl = (query: string): string => {
  return MUSIC_PLATFORM_URLS.YOUTUBE_MUSIC + encodeURIComponent(query);
};

export const getAppleMusicUrl = (query: string): string => {
  return MUSIC_PLATFORM_URLS.APPLE_MUSIC + encodeURIComponent(query);
};

export const getSpotifyUrl = (query: string): string => {
  return MUSIC_PLATFORM_URLS.SPOTIFY + encodeURIComponent(query);
};

export const getVibeUrl = (query: string): string => {
  return MUSIC_PLATFORM_URLS.VIBE + encodeURIComponent(query);
};

export const getMelonUrl = (query: string): string => {
  return MUSIC_PLATFORM_URLS.MELON + encodeURIComponent(query);
};

/**
 * 곡 제목과 아티스트를 조합하여 검색 쿼리를 만듭니다
 */
export const createSearchQuery = (title: string, artist: string): string => {
  return `${title} ${artist}`.trim();
};

/**
 * YouTube 썸네일 URL을 생성합니다
 */
export const getYouTubeThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

/**
 * 곡 정보를 URL 쿼리 파라미터로 변환합니다
 */
export const songToQueryParams = (title: string, artist: string, link: string): string => {
  return `title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&link=${encodeURIComponent(link)}`;
};

/**
 * 공유 URL을 생성합니다
 */
export const createShareUrl = (title: string, artist: string, link: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/shared?${songToQueryParams(title, artist, link)}`;
}; 