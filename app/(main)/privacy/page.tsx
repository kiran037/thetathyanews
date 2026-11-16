// File: app/(main)/privacy/page.tsx
import Link from "next/link";
import { Shield, Lock } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - TheTathyaNews",
  description: "Learn how TheTathyaNews collects, processes, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div>
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
          <Shield className="h-4 w-4" />
          Data Protection
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground mt-2">Effective Date: January 1, 2026 · Last Updated: September 2026</p>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">1. Overview & Commitment</h2>
          <p>
            At TheTathyaNews, we respect your personal privacy. This Privacy Policy details the types of information we collect when you visit our website, register for an account, subscribe to our newsletter or Pro memberships, and how we handle that data responsibly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Information:</strong> Name, email address, password hash (salted using bcrypt), and profile bio when you create an account.</li>
            <li><strong>Reading Progress & Activity:</strong> Articles viewed, bookmarks saved, reading percentage, and time spent on articles to support your personal Library and Continue Reading features.</li>
            <li><strong>Comments & Submissions:</strong> Content, timestamps, and account identity associated with public comments you post.</li>
            <li><strong>Subscription Data:</strong> Billing status, plan tier, and payment confirmation IDs. We never store credit card numbers on our servers.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">3. How We Use Information</h2>
          <p>We use the information collected exclusively to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide, maintain, and personalize your reading experience.</li>
            <li>Authenticate sessions securely using encrypted session tokens and one-time passwords (OTPs).</li>
            <li>Process subscription transactions and deliver ad-free reading features.</li>
            <li>Send periodic newsletter dispatches via our verified email service provider (Brevo) when you opt in.</li>
            <li>Detect and prevent spam, fraud, and abusive commentary.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">4. Cookies & Session Storage</h2>
          <p>
            We use essential HTTP-only cookies (`session_token`) to maintain authenticated sessions and local browser storage to retain guest reading progress and theme preferences (`next-themes`). For details, please consult our dedicated <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">5. Data Sharing & Third Parties</h2>
          <p>
            We do not sell, rent, or trade your personal data to third-party data brokers. We share data strictly with trusted infrastructure providers required to operate our service (such as Supabase PostgreSQL database hosting, Brevo email services, and payment gateway infrastructure).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">6. Your Rights & Account Deletion</h2>
          <p>
            You may review and update your profile information at any time via your <Link href="/account/profile" className="text-primary hover:underline">Account Settings</Link>. You can also request complete account and data erasure via the Delete Account option in your account dashboard.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">7. Contact Information</h2>
          <p>
            If you have questions about this Privacy Policy or your personal data, please contact our privacy desk through our <Link href="/contact" className="text-primary hover:underline">Contact Form</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
