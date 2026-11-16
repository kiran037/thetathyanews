// File: app/(main)/terms/page.tsx
import Link from "next/link";
import { FileText, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Terms of Service - TheTathyaNews",
  description: "Terms and conditions governing the access and use of TheTathyaNews website, content, and services.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div>
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
          <FileText className="h-4 w-4" />
          Legal Agreement
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="text-xs text-muted-foreground mt-2">Effective Date: January 1, 2026 · Last Updated: September 2026</p>
      </div>

      {/* Primary Satirical Content Notice */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h2 className="font-bold text-foreground">Important Satire & Parody Disclaimer</h2>
          <p className="text-muted-foreground leading-relaxed">
            TheTathyaNews publishes satirical and parody news articles. All headlines, articles, quotations, and described events are works of fiction intended exclusively for entertainment and social critique. Do not treat any article on this website as literal truth or factual news reporting.
          </p>
        </div>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using TheTathyaNews (&ldquo;the Site&rdquo;), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you must immediately discontinue using our services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">2. User Accounts & Security</h2>
          <p>
            When registering for an account, you agree to provide truthful, accurate, and current information. You are solely responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account. You must promptly notify us of any unauthorized account use.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">3. User Conduct & Community Comments</h2>
          <p>
            TheTathyaNews permits readers to comment on articles. You agree not to post content that is unlawful, defamatory, harassing, sexually explicit, fraudulent, or promotes hate speech. We reserve the right to review, moderate, reject, or remove any comment at our sole discretion.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">4. Intellectual Property Rights</h2>
          <p>
            All content, including headlines, articles, text, design, logos, graphics, and code, is the property of TheTathyaNews and protected by applicable copyright, trademark, and unfair competition laws. You may share links to our articles and excerpt brief passages with attribution for non-commercial commentary.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">5. Subscriptions & Billing</h2>
          <p>
            Paid subscriptions provide ad-free access, unlimited library features, and bonus satirical archives. Subscriptions renew automatically at the specified monthly or annual interval unless canceled prior to the renewal date via your Account Settings. All prices are stated in U.S. Dollars unless otherwise noted.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, TheTathyaNews and its contributors shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from your use of the website or belief in any fictional satirical premise published herein.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">7. Contact & Inquiries</h2>
          <p>
            For legal inquiries or questions regarding these Terms, please contact our administrative desk through our <Link href="/contact" className="text-primary hover:underline">Contact Page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
