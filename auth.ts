import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";

const ADMIN_LOGIN = process.env.ADMIN_GITHUB_LOGIN?.toLowerCase();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [GitHub],
  // The Prisma adapter stores sessions in the database, but the admin check
  // below runs on every request, so JWT sessions keep it to zero extra queries.
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  callbacks: {
    /**
     * Single-tenant admin: this site has exactly one legitimate operator, so
     * anyone whose GitHub login isn't the configured one is refused at sign-in
     * rather than being let in and blocked later.
     */
    async signIn({ profile }) {
      if (!ADMIN_LOGIN) return false;
      const login = (profile as { login?: string } | undefined)?.login;
      return login?.toLowerCase() === ADMIN_LOGIN;
    },
    async jwt({ token, profile }) {
      if (profile && "login" in profile) {
        token.githubLogin = (profile as { login?: string }).login;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.githubLogin = token.githubLogin as string | undefined;
      return session;
    },
  },
});
