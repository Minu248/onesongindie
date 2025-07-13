import { Metadata } from "next";

export const metadata: Metadata = {
  title: "오늘의 인디 음악 추천 | 한곡인디",
  description: "매일 업데이트 되는 인디 음악 플레이리스트를 확인하세요.",
};

export default function TodayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 