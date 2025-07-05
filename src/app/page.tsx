import HomeContent from './HomeContent';
import { Suspense } from 'react';

export async function generateMetadata({ searchParams }) {
  const title = searchParams?.title;
  const artist = searchParams?.artist;
  
  if (title && artist) {
    return {
      title: `${title} - ${artist} | 들어볼래? 한 곡 Indie`,
      description: `친구가 추천한 한국 인디 노래: ${title} - ${artist}`,
      metadataBase: new URL('https://onesongindie.com'),
      openGraph: {
        title: `${title} - ${artist}`,
        description: `친구가 추천한 한국 인디 노래: ${title} - ${artist}`,
        url: "https://onesongindie.com",
        type: "website",
        siteName: "들어볼래? 한 곡 Indie",
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
    };
  }
  
  return {
    title: "들어볼래? 한 곡 Indie",
    description: "당신의 하루를 바꿔줄 오늘 한 곡",
    metadataBase: new URL('https://onesongindie.com'),
    openGraph: {
      title: "들어볼래? 한 곡 Indie",
      description: "당신의 하루를 바꿔줄 오늘 한 곡",
      url: "https://onesongindie.com",
      type: "website",
      siteName: "들어볼래? 한 곡 Indie",
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
      title: "들어볼래? 한 곡 Indie",
      description: "당신의 하루를 바꿔줄 오늘 한 곡",
      images: ["https://onesongindie.com/og-image.png"],
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