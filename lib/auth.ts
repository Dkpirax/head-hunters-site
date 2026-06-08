import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
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
        let user = await prisma.adminUser.findUnique({
          where: { email },
        });

        // 2. Fallback auto-seeding if no admin users exist in the database yet
        if (!user) {
          const count = await prisma.adminUser.count();
          if (count === 0) {
            const fallbackEmail = (process.env.ADMIN_EMAIL ?? "admin@headhunters.com.au").toLowerCase();
            const fallbackPassword = process.env.ADMIN_PASSWORD ?? "headhunters2024";

            if (email === fallbackEmail && password === fallbackPassword) {
              const passwordHash = await bcrypt.hash(fallbackPassword, 10);
              user = await prisma.adminUser.create({
                data: {
                  email: fallbackEmail,
                  passwordHash,
                  name: "Head Hunters Admin",
                  role: "SUPER_ADMIN",
                },
              });
            }
          }
        }

        if (!user) return null;

        // 3. Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? "Admin User",
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user)
        (session.user as { role?: string }).role = token.role as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
