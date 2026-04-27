import type { NextAuthOptions } from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "cms-login",
      name: "CMS Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.username === process.env.CMS_USERNAME &&
          credentials?.password === process.env.CMS_PASSWORD
        ) {
          return { id: "cms-admin", name: "Admin", role: "admin" };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, profile }) {
      if (profile) {
        token.name = profile.name;
        token.facebookLink = `https://facebook.com/${(profile as any).id}`;
      }
      if (user && (user as any).role === "admin") {
        token.role = "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string;
        (session as any).facebookLink = token.facebookLink as string;
      }
      (session as any).role = token.role;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/cms/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
