import type { Metadata } from "next";
import { getAdminUsers, getPermissionsList } from "@/app/actions/users";
import { auth } from "@/lib/auth";
import UserAdminClient from "./UserAdminClient";
import { checkPermission } from "@/lib/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const hasAccess = await checkPermission("manage_users");
  if (!hasAccess) {
    return <AccessDenied permission="manage_users" />;
  }

  const session = await auth();
  const currentUserEmail = session?.user?.email || "admin@headhunters.com.au";

  // Fetch admin logins and available permissions
  const rawUsers = await getAdminUsers();
  const rawPermissions = await getPermissionsList();
  
  // Format dates and map user permissions safely to pass to Client Component
  const formattedUsers = rawUsers.map((u: any) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    permissions: u.permissions.map((up: any) => up.permission.name),
  }));

  const allPermissions = rawPermissions.map((p: any) => p.name);

  return (
    <UserAdminClient
      initialUsers={formattedUsers}
      currentUserEmail={currentUserEmail}
      allPermissions={allPermissions}
    />
  );
}
