import type { NextAuthOptions } from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";

export const authOptions: NextAuthOptions = {
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.name = profile.name;
        token.facebookLink = `https://facebook.com/${(profile as any).id}`;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string;
        (session as any).facebookLink = token.facebookLink as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
