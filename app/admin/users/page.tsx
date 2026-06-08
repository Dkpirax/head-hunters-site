import type { Metadata } from "next";
import { getAdminUsers } from "@/app/actions/users";
import { auth } from "@/lib/auth";
import UserAdminClient from "./UserAdminClient";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const session = await auth();
  const currentUserEmail = session?.user?.email || "admin@headhunters.com.au";

  // Fetch admin logins from SQLite
  const rawUsers = await getAdminUsers();
  
  // Format dates so they can be passed as props safely to Client Component
  const formattedUsers = rawUsers.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  }));

  return <UserAdminClient initialUsers={formattedUsers} currentUserEmail={currentUserEmail} />;
}
