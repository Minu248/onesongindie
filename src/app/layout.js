import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "들어볼래? 한 곡 Indie",
  description: "당신의 하루를 바꿔줄 오늘 한 곡",
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
  icons: {
    icon: "/favicon.png"
  },
  manifest: "/manifest.json",
  metadataBase: new URL('https://onesongindie.com'),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
