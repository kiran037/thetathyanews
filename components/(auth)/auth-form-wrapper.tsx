///components/(auth)/auth-form-wrapper.tsx
import Link from "next/link";

interface AuthFormWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackToHome?: boolean;
}

export function AuthFormWrapper({
  children,
  title,
  subtitle,
  showBackToHome = true,
}: AuthFormWrapperProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold gradient-text">
              TheTathya<span className="text-primary">News</span>
            </span>
          </Link>
          {showBackToHome && (
            <p className="mt-2 text-sm text-muted-foreground">
              <Link href="/" className="link">
                ← Back to home
              </Link>
            </p>
          )}
        </div>

        {/* Form Card */}
        <div className="glass rounded-lg border border-border p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {children}
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="link">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="link">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}