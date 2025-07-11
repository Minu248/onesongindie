export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import SharedSongContent from './SharedSongContent';

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const title = params?.title;
  const artist = params?.artist;
  
  if (title && artist) {
    return {
      title: `${title} - ${artist} | 친구가 추천한 곡 | 들어볼래? 한 곡 Indie`,
      description: `친구가 추천한 한국 인디 노래: ${title} - ${artist}. 지금 바로 들어보세요!`,
      metadataBase: new URL('https://onesongindie.com'),
      openGraph: {
        title: `${title} - ${artist}`,
        description: `친구가 추천한 한국 인디 노래: ${title} - ${artist}`,
        url: `https://onesongindie.com/shared`,
        type: "website",
        siteName: "들어볼래? 한 곡 Indie",
        images: [
          {
            url: "https://onesongindie.com/og-image.png",
            width: 885,
            height: 460,
            alt: `${title} - ${artist} 친구 추천 곡`
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
    title: "친구가 추천한 곡 | 들어볼래? 한 곡 Indie",
    description: "친구가 추천한 한국 인디 음악을 들어보세요!",
    metadataBase: new URL('https://onesongindie.com'),
    openGraph: {
      title: "친구가 추천한 곡 | 들어볼래? 한 곡 Indie",
      description: "친구가 추천한 한국 인디 음악을 들어보세요!",
      url: "https://onesongindie.com/shared",
      type: "website",
      siteName: "들어볼래? 한 곡 Indie",
      images: [
        {
          url: "https://onesongindie.com/og-image.png",
          width: 885,
          height: 460,
          alt: "친구가 추천한 곡 - 들어볼래? 한 곡 Indie"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: "친구가 추천한 곡 | 들어볼래? 한 곡 Indie",
      description: "친구가 추천한 한국 인디 음악을 들어보세요!",
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

export default function SharedPage() {
  return (
    <Suspense fallback={<div />}>
      <SharedSongContent />
    </Suspense>
  );
} 