import { Metadata } from "next";

export const metadata: Metadata = {
  title: "오늘의 추천곡 | One Song Indie",
  description: "오늘의 인디 추천곡을 확인하세요.",
};

export default function TodayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 