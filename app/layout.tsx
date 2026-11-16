// File: app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "TheTathyaNews - Satirical News & Commentary",
  description:
    "Your source for satirical news, parody, and fictional commentary on current events.",
  keywords: [
    "satire",
    "news",
    "parody",
    "comedy",
    "fake news",
    "satirical journalism",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans bg-background text-foreground antialiased`}>
        <ThemeProvider>
          {children}
          
          <Toaster
            richColors
            position="top-right"
            toastOptions={{
              classNames: {
                toast: "glass border-border",
                title: "text-foreground font-semibold",
                description: "text-muted-foreground",
                actionButton: "bg-primary text-primary-foreground",
                cancelButton: "bg-secondary text-secondary-foreground",
                error: "bg-destructive text-destructive-foreground",
                success: "bg-primary text-primary-foreground",
                warning: "bg-primary/90 text-primary-foreground",
                info: "bg-secondary text-secondary-foreground",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}