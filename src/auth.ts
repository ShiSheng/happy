import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { getAuthSecret } from "@/lib/auth-secret";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: getAuthSecret(),
  providers: [
    Credentials({
      name: "口令",
      credentials: {
        secret: { label: "登录口令", type: "password" },
      },
      authorize: async (credentials) => {
        if (process.env.AUTH_ENABLED !== "true") return null;
        const expected = process.env.DEMO_LOGIN_SECRET;
        if (!expected || credentials?.secret !== expected) return null;
        const u = await prisma.user.findFirst({
          orderBy: { createdAt: "asc" },
        });
        if (!u) return null;
        return { id: u.id, name: u.email ?? "用户" };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
