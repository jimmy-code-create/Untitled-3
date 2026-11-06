import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import { verifyOtp } from "./otp";
import { findOrCreateUserByPhone, verifyAdminPassword, upsertGoogleUser } from "./users";

export const authSecret = process.env.NEXTAUTH_SECRET || "jmd-gems-dev-secret-change-me-in-env";

const phoneSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, "10-digit mobile number required"),
  code: z.string().min(4, "OTP required"),
});

const adminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Mobile number", type: "text" },
        code: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const parsed = phoneSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const result = verifyOtp(parsed.data.phone, parsed.data.code);
        if (!result.ok) throw new Error(result.reason);
        const user = await findOrCreateUserByPhone(parsed.data.phone);
        return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
      },
    }),
    CredentialsProvider({
      id: "admin",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = adminSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await verifyAdminPassword(parsed.data.email, parsed.data.password);
        if (!user || user.role !== "ADMIN") return null;
        return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const dbUser = await upsertGoogleUser(user.email, user.name ?? "JMD Customer", user.image ?? undefined);
        (user as any).id = dbUser.id;
        (user as any).role = dbUser.role;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role ?? "USER";
        token.phone = (user as any).phone ?? "";
      }
      if (!token.role && token.email) {
        const { findUserByEmail } = await import("./users");
        const dbUser = await findUserByEmail(token.email);
        token.role = dbUser?.role ?? "USER";
        token.id = dbUser?.id ?? token.sub;
        token.phone = dbUser?.phone ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "";
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
        session.user.phone = (token.phone as string) ?? "";
      }
      return session;
    },
  },
};
