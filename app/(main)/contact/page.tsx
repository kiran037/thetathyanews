// File: app/(main)/contact/page.tsx
import { Mail, MessageSquare, Building2, HelpCircle } from "lucide-react";
import Link from "next/link";
import { ContactForm } from "./contact-form";

export const metadata = {
  title: "Contact Us - TheTathyaNews",
  description: "Get in touch with TheTathyaNews editorial desk, advertising team, or customer support.",
};

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 py-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Contact <span className="gradient-text">TheTathyaNews</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Have an editorial tip, speculative satire pitch, advertising inquiry, or subscription question? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-bold text-lg">Department Channels</h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Editorial Wire Desk</p>
                  <p className="text-xs text-muted-foreground">editorial@thetathyanews.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Advertising & Partnerships</p>
                  <p className="text-xs text-muted-foreground">advertise@thetathyanews.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Press & Media Relations</p>
                  <p className="text-xs text-muted-foreground">press@thetathyanews.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Reader & Subscriber Support</p>
                  <p className="text-xs text-muted-foreground">support@thetathyanews.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-6 space-y-3 text-xs text-muted-foreground">
            <h3 className="font-semibold text-foreground text-sm">Need immediate answers?</h3>
            <p>Check our extensive Help Center and Frequently Asked Questions for self-service solutions regarding accounts and subscriptions.</p>
            <div className="pt-1 flex gap-2">
              <Link href="/help" className="text-primary hover:underline font-medium">Help Center</Link>
              <span>·</span>
              <Link href="/faq" className="text-primary hover:underline font-medium">FAQ</Link>
            </div>
          </div>
        </div>

        {/* Form Main Area */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
