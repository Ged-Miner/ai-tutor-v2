import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    Google({
      clientId: process.env.NEXTAUTH_GOOGLE_ID!,
      clientSecret: process.env.NEXTAUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          teacherCode: user.teacherCode,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {

      // For OAuth providers (Google), ensure user has STUDENT role
      if (account?.provider === "google") {
        // Check if this is a new user (user was just created by adapter)
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        // If user exists but has no role set, update to STUDENT
        if (existingUser && !existingUser.role) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { role: "STUDENT" },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;

        // For OAuth users, fetch role from database
        if (account?.provider === "google") {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true, teacherCode: true },
          });

          if (dbUser) {
            token.role = dbUser.role;
            token.teacherCode = dbUser.teacherCode;
          }
        } else {
          // For credentials users, role comes from authorize function
          token.role = user.role;
          token.teacherCode = user.teacherCode;
        }
      }

      // Update token if session is updated
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.teacherCode = token.teacherCode as string | null;
      }
      return session;
    },
  },
});

export const { GET, POST } = handlers;
