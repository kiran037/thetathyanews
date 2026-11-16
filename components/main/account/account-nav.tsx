///components/main/account/account-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Shield,
  Monitor,
  Bell,
  Settings,
  Lock,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    name: "Overview",
    href: "/account",
    icon: User,
    description: "Account dashboard",
  },
  {
    name: "Profile",
    href: "/account/profile",
    icon: User,
    description: "Personal information",
  },
  {
    name: "Security",
    href: "/account/security",
    icon: Shield,
    description: "Password & security",
  },
  {
    name: "Sessions",
    href: "/account/sessions",
    icon: Monitor,
    description: "Active sessions",
  },
  {
    name: "Notifications",
    href: "/account/notifications",
    icon: Bell,
    description: "Notification preferences",
  },
  {
    name: "Preferences",
    href: "/account/preferences",
    icon: Settings,
    description: "App preferences",
  },
  {
    name: "Privacy",
    href: "/account/privacy",
    icon: Lock,
    description: "Privacy settings",
  },
  {
    name: "Delete Account",
    href: "/account/delete",
    icon: Trash2,
    description: "Close your account",
    danger: true,
  },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : item.danger
                ? "text-destructive hover:bg-destructive/10"
                : "hover:bg-accent"
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div>{item.name}</div>
              <div
                className={cn(
                  "text-xs",
                  isActive
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground"
                )}
              >
                {item.description}
              </div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}