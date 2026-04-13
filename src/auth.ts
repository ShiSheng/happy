import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { getAuthSecret } from "@/lib/auth-secret";
import { verifyPassword } from "@/lib/password";
import { normalizeUsername } from "@/lib/username";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: getAuthSecret(),
  providers: [
    Credentials({
      name: "账号密码",
      credentials: {
        username: { label: "账号", type: "text" },
        password: { label: "密码", type: "password" },
      },
      authorize: async (credentials) => {
        if (process.env.AUTH_ENABLED !== "true") return null;
        const username = normalizeUsername(
          String(credentials?.username ?? ""),
        );
        const password = String(credentials?.password ?? "");
        if (!username || !password) return null;
        const u = await prisma.user.findUnique({
          where: { username },
        });
        if (!u || !(await verifyPassword(password, u.passwordHash))) {
          return null;
        }
        return {
          id: u.id,
          name: u.username ?? u.email ?? "用户",
        };
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
