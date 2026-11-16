// File: lib/env.ts
/**
 * Server-side Environment Configuration & Validation Helper.
 * Validates critical environment variables in production without breaking build-time static generation.
 */

export const env = {
  get DATABASE_URL(): string {
    const url = process.env.DATABASE_URL;
    if (!url && process.env.NODE_ENV === "production") {
      throw new Error("Missing required environment variable: DATABASE_URL");
    }
    return url || "";
  },

  get SESSION_SECRET(): string {
    const secret = process.env.SESSION_SECRET;
    if (!secret && process.env.NODE_ENV === "production") {
      console.warn("WARNING: SESSION_SECRET is not defined. Using an unstable fallback in production is dangerous.");
    }
    return secret || "thetathyanews-fallback-dev-secret";
  },

  get NODE_ENV(): "development" | "production" | "test" {
    return (process.env.NODE_ENV as any) || "development";
  },

  get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  },

  get APP_URL(): string {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  },
};
