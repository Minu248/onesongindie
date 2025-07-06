import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";

const handler = NextAuth({
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }: any) {
      // 카카오 로그인 시 추가 정보 저장
      if (account?.provider === "kakao") {
        token.provider = "kakao";
        token.kakaoId = profile?.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      // 세션에 사용자 정보 추가
      if (token) {
        session.user.id = token.sub;
        session.user.provider = token.provider;
        session.user.kakaoId = token.kakaoId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});

export { handler as GET, handler as POST }; 