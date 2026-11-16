// File: app/admin/users/page.tsx
import { Search, Shield, UserCheck, UserX, CheckCircle, Clock } from "lucide-react";
import { getAdminUsers } from "@/lib/data/admin";
import { Pagination } from "@/components/ui/pagination";
import { AdminUserActions } from "./actions-client";

export const metadata = {
  title: "User Management - TheTathyaNews Admin",
  description: "Inspect accounts, roles, and status",
};

interface AdminUsersProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
  }>;
}

export default async function AdminUsersPage(props: AdminUsersProps) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || "1");
  const query = searchParams.q || "";
  const status = searchParams.status || "all";

  const usersData = await getAdminUsers({ page, limit: 15, query, status });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">User Accounts</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Total {usersData.total} registered users in the platform database
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <form method="GET" className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by email or name..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            <select
              name="status"
              defaultValue={status}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending_verification">Pending Verification</option>
            </select>

            <button type="submit" className="btn-secondary px-4 py-2 text-sm">
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase">
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Roles</th>
                <th className="py-3 px-4 font-semibold">Verification</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Registered</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usersData.users.length > 0 ? (
                usersData.users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {(u.displayName || u.email).slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {u.displayName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Reader"}
                          </p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                              r === "admin"
                                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                : r === "editor"
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                : r === "writer"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                      {u.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                          <Clock className="h-3.5 w-3.5" />
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          u.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <AdminUserActions
                        userId={u.id}
                        currentStatus={u.status}
                        currentRole={u.roles[0] || "reader"}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No users found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {usersData.totalPages > 1 && (
          <div className="p-4 border-t border-border flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={usersData.totalPages}
              baseUrl={`/admin/users?q=${encodeURIComponent(query)}&status=${status}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
