'use client';

import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <button className="bg-gray-400 text-white rounded-full px-6 py-3 shadow-md transition text-base font-semibold">
        로딩 중...
      </button>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-white text-sm">
          안녕하세요, {session.user?.name || '사용자'}님! 🎵
        </div>
        <button
          onClick={() => signOut()}
          className="bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-2 shadow-md transition text-sm font-semibold"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("kakao")}
      className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-full px-6 py-3 shadow-md transition text-base font-semibold flex items-center gap-2"
    >
      <span>카카오로 시작하기</span>
      <span>💬</span>
    </button>
  );
} 