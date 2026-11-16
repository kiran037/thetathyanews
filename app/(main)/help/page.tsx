// File: app/(main)/help/page.tsx
import Link from "next/link";
import { HelpCircle, User, BookOpen, CreditCard, MessageSquare, Shield, KeyRound, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Help Center - TheTathyaNews",
  description: "Guides, tutorials, and assistance for using TheTathyaNews accounts, bookmarks, and subscriptions.",
};

export default function HelpPage() {
  const categories = [
    {
      title: "Account & Login",
      icon: User,
      topics: [
        { q: "How do I create an account?", a: "Click Sign Up in the top navigation bar, enter your name, email, and password. An OTP code will be sent to verify your address." },
        { q: "What if I forgot my password?", a: "Visit the Forgot Password page, enter your email, and follow the password reset link or enter the verification code sent to your inbox." },
        { q: "How do I change my profile or preferences?", a: "Navigate to Account > Preferences or Profile from the top user avatar menu to update your information." },
      ],
    },
    {
      title: "Reading & Library",
      icon: BookOpen,
      topics: [
        { q: "How do Bookmarks and Collections work?", a: "Click the Bookmark button on any article. You can categorize bookmarks into custom folders under your Library > Collections." },
        { q: "What is Continue Reading?", a: "Articles you started reading are automatically tracked. You can resume them anytime under Library > Continue Reading." },
        { q: "Can I read without an account?", a: "Yes! All standard articles are freely accessible to guests with temporary reading progress saved locally in your browser." },
      ],
    },
    {
      title: "Subscriptions & Billing",
      icon: CreditCard,
      topics: [
        { q: "What benefits does Pro membership include?", a: "Pro members enjoy an ad-free reading experience, unlimited access to archived pieces, verified comment badges, and offline library downloads." },
        { q: "How can I manage or cancel my subscription?", a: "Visit Account > Subscription to view your current plan, renewal date, and cancel anytime before the next billing period." },
      ],
    },
    {
      title: "Community & Comments",
      icon: MessageSquare,
      topics: [
        { q: "Who can post comments?", a: "Any registered and email-verified reader can participate in article comment discussions." },
        { q: "Why was my comment removed?", a: "Comments containing abusive language, spam links, or personal attacks are removed per our Editorial Guidelines." },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
          <HelpCircle className="h-3.5 w-3.5" />
          Support Center
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          How can we <span className="gradient-text">help you?</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Guides and clear answers to help you navigate accounts, reading features, and subscriptions.
        </p>
      </div>

      {/* Guide Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div key={cat.title} className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <cat.icon className="h-4 w-4" />
              </div>
              <h2 className="font-bold text-lg">{cat.title}</h2>
            </div>

            <div className="space-y-4">
              {cat.topics.map((t) => (
                <div key={t.q} className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">{t.q}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Still Need Assistance Banner */}
      <div className="rounded-2xl border border-border bg-card/60 p-8 text-center space-y-3">
        <h3 className="text-xl font-bold">Still need personalized assistance?</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Our support desk is on hand to resolve account glitches, email delivery issues, or billing inquiries.
        </p>
        <div className="pt-2">
          <Link href="/contact" className="btn-primary text-xs px-6 py-2.5 inline-flex items-center gap-2">
            Submit Support Request <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
