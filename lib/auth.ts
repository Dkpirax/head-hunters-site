import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { adminUser } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).toLowerCase();
        const password = String(credentials.password);

        // 1. Try to find the user in the database
        const users = await db.select().from(adminUser).where(eq(adminUser.email, email));
        let user = users[0];

        // 2. Fallback auto-seeding if no admin users exist in the database yet
        if (!user) {
          const allUsers = await db.select({ id: adminUser.id }).from(adminUser);
          const count = allUsers.length;
          if (count === 0) {
            const fallbackEmail = (process.env.ADMIN_EMAIL ?? "admin@headhunters.com.au").toLowerCase();
            const fallbackPassword = process.env.ADMIN_PASSWORD ?? "headhunters2024";

            if (email === fallbackEmail && password === fallbackPassword) {
              const passwordHash = await bcrypt.hash(fallbackPassword, 10);
              await db.insert(adminUser).values({
                email: fallbackEmail,
                passwordHash,
                name: "Head Hunters Admin",
                role: "SUPER_ADMIN",
              });
              const newUsers = await db.select().from(adminUser).where(eq(adminUser.email, fallbackEmail));
              user = newUsers[0];
            } else {
              return null; // Don't let random people in, only fallback matches
            }
          } else {
            return null; // DB has admins, so they must match an existing one
          }
        } else {
          // Normal password check
          const match = await bcrypt.compare(password, user.passwordHash);
          if (!match) return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
});
