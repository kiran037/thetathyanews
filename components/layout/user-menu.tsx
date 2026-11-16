
// File: components/layout/user-menu.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  LayoutDashboard, 
  Library, 
  CreditCard,
  ChevronDown
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserMenuProps {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    firstName?: string | null;
  };
  roles?: string[];
  permissions?: string[];
}

export function UserMenu({ user, roles, permissions }: UserMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasAdminAccess = roles?.includes("admin") || roles?.includes("super_admin") || permissions?.includes("admin.access");

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (response.ok) {
        // Force hard refresh to clear client states
        window.location.href = "/"; 
      }
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      setLoading(false);
    } 
  };

  const getInitials = () => {
    if (user.displayName) return user.displayName.substring(0, 2).toUpperCase();
    if (user.email) return user.email.substring(0, 2).toUpperCase();
    return "U";
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full border border-border p-1 pl-3 pr-1 transition-all duration-200 ${isOpen ? 'bg-accent ring-2 ring-primary/20' : 'bg-background hover:bg-accent/50'}`}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="flex flex-col items-end mr-1 hidden sm:flex">
          <span className="text-xs font-semibold leading-none truncate max-w-[100px]">
            {user.displayName || "User"}
          </span>
          <span className="text-[10px] text-muted-foreground leading-none mt-1 truncate max-w-[100px]">
            {roles?.[0] || "Member"}
          </span>
        </div>
        
        <Avatar className="h-8 w-8 transition-transform">
          <AvatarImage src={user.avatarUrl || ""} alt={user.displayName || ""} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <ChevronDown className={`h-3 w-3 text-muted-foreground mr-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl animate-in fade-in zoom-in-95 duration-200 z-50">
          <div className="flex flex-col space-y-1 p-4 border-b border-border bg-muted/30 rounded-t-xl">
            <p className="font-semibold text-sm leading-none">{user.displayName || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>

          <div className="p-2 space-y-1">
            {hasAdminAccess && (
              <div className="pb-1 mb-1 border-b border-border/50">
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Link>
              </div>
            )}

            <Link
              href="/account"
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4 text-muted-foreground" />
              Profile
            </Link>
            
            <Link
              href="/library"
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Library className="h-4 w-4 text-muted-foreground" />
              My Library
            </Link>

            <Link
              href="/account/billing"
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Billing
            </Link>

            <Link
              href="/account/preferences"
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Settings
            </Link>
          </div>

          <div className="p-2 border-t border-border">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-destructive rounded-md hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {loading ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}