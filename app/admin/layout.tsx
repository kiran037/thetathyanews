///app/admin/layout.tsx
import { requireAdmin } from "@/lib/auth-server";
import { getUserRoles, getUserPermissions } from "@/lib/middleware";
import Link from "next/link";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings,
  LogOut 
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to login if not authenticated or not admin
  const user = await requireAdmin();
  
  // Get user roles and permissions for display
  const roles = await getUserRoles(user.id);
  const permissions = await getUserPermissions(user.id);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Articles", href: "/admin/articles", icon: FileText },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-border bg-card">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/admin" className="text-xl font-bold gradient-text">
            Admin Panel
          </Link>
        </div>

        <nav className="space-y-1 p-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <div className="mb-2">
            <p className="text-sm font-medium">{user.displayName || user.email}</p>
            <p className="text-xs text-muted-foreground">
              {roles.join(", ")}
            </p>
          </div>
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}