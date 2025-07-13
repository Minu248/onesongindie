export const dynamic = "force-dynamic";

import HomeContent from './HomeContent';
import { Suspense } from 'react';

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const title = params?.title;
  const artist = params?.artist;
  
  if (title && artist) {
    return {
      title: `${title} - ${artist} | 들어볼래? 한곡인디`,
      description: `친구가 추천한 한국 인디 노래: ${title} - ${artist}`,
      metadataBase: new URL('https://onesongindie.com'),
      openGraph: {
        title: `${title} - ${artist}`,
        description: `친구가 추천한 한국 인디 노래: ${title} - ${artist}`,
        url: "https://onesongindie.com",
        type: "website",
        siteName: "들어볼래? 한곡인디",
        images: [
          {
            url: "https://onesongindie.com/og-image.png",
            width: 885,
            height: 460,
            alt: `${title} - ${artist} 오픈그래프 이미지`
          }
        ]
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} - ${artist}`,
        description: `친구가 추천한 한국 인디 노래: ${title} - ${artist}`,
        images: ["https://onesongindie.com/og-image.png"],
      },
      icons: {
        icon: [
          { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
          { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ],
        shortcut: '/favicon.png',
        apple: '/icon-512x512.png',
      },
    };
  }
  
  return {
    // SEO: 기본 타이틀과 메타디스크립션
    title: "한곡인디, 매일 새로운 인디음악 플레이리스트",
    description: "인디 음악 플레이리스 추천. 지금까지 몰랐던 한국 인디 음악을 매일 새롭게 발견하세요.",
    metadataBase: new URL('https://onesongindie.com'),
    openGraph: {
      title: "한곡인디, 매일 새로운 인디음악 플레이리스트",
      description: "인디 음악 플레이리스 추천. 지금까지 몰랐던 한국 인디 음악을 매일 새롭게 발견하세요.",
      url: "https://onesongindie.com",
      type: "website",
      siteName: "들어볼래? 한곡인디e",
      images: [
        {
          url: "https://onesongindie.com/og-image.png",
          width: 885,
          height: 460,
          alt: "들어볼래? 한 곡 Indie 오픈그래프 이미지"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: "한곡인디, 매일 새로운 인디음악 플레이리스트",
      description: "인디 음악 플레이리스 추천. 지금까지 몰랐던 한국 인디 음악을 매일 새롭게 발견하세요.",
      images: ["https://onesongindie.com/og-image.png"],
    },
    icons: {
      icon: [
        { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
        { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
      ],
      shortcut: '/favicon.png',
      apple: '/icon-512x512.png',
    },
  };
}

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <HomeContent />
    </Suspense>
  );
}