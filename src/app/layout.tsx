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
  icons: {
    icon: "/favicon.png"
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WZG8FFM5');
          `
        }} />
        {/* End Google Tag Manager */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WZG8FFM5"
            height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {children}
      </body>
    </html>
  );
} 