// File: components/layout/header.tsx
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/layout/button";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Politics", href: "/categories/politics" },
  { name: "Tech", href: "/categories/tech" },
  { name: "Business", href: "/categories/business" },
  { name: "Entertainment", href: "/categories/entertainment" },
  { name: "Sports", href: "/categories/sports" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Theme logic for Logo switching only (Toggle component handles the rest)
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch User Session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser({
              ...data.user,
              roles: data.roles || [],
              permissions: data.permissions || [],
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch user session", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Close mobile menu when path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      
      {/* Top Bar (Desktop Only) */}
      <div className="hidden md:block border-b border-border/40 bg-muted/20">
        <div className="container mx-auto px-4 h-9 flex items-center justify-between text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
          <time>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/advertise" className="hover:text-primary transition-colors">Advertise</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Mobile Menu Trigger & Logo Group */}
          <div className="flex items-center gap-2 lg:gap-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 rounded-md hover:bg-accent text-foreground"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link href="/" className="relative h-10 w-36 shrink-0 lg:mr-8">
              {mounted && (
                <Image
                  src={resolvedTheme === "dark" ? "/logo/dark.png" : "/logo/light.png"}
                  alt="The Tathya News"
                  fill
                  className="object-contain object-left"
                  priority
                />
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Section: Search, Theme, Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={cn(
                "h-9 w-9 flex items-center justify-center rounded-md transition-colors",
                searchOpen
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-border hidden sm:block mx-1" />

            {/* User Auth State */}
            {loading ? (
              <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
            ) : user ? (
              <UserMenu 
                user={user} 
                roles={user.roles} 
                permissions={user.permissions} 
              />
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/pricing">Subscribe</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="pb-4 animate-in slide-in-from-top-2 fade-in duration-200">
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search headlines, topics, or authors..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[calc(4rem+1px)] bg-background z-40 overflow-y-auto animate-in slide-in-from-left-5 duration-200">
          <div className="p-4 space-y-6">
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {!user && (
              <div className="grid gap-3 pt-6 border-t border-border">
                <Button asChild size="lg" className="w-full font-semibold">
                  <Link href="/pricing">Subscribe Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}