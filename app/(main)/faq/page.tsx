// File: app/(main)/faq/page.tsx
import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";
import { FaqAccordion } from "./faq-accordion";

export const metadata = {
  title: "Frequently Asked Questions - TheTathyaNews",
  description: "Find fast answers to common questions about TheTathyaNews, our satirical reporting, and platform features.",
};

export default function FaqPage() {
  const faqGroups = [
    {
      group: "Satirical Content & Editorial",
      items: [
        {
          q: "Are the stories on TheTathyaNews real?",
          a: "No. TheTathyaNews is 100% satirical. All articles, quotes, events, and scenarios are fictional works designed for comedic entertainment, cultural critique, and parody.",
        },
        {
          q: "Can I quote or share TheTathyaNews articles?",
          a: "Absolutely! You are encouraged to share links and brief excerpts on social media and personal blogs, provided you include proper attribution and acknowledge its satirical origin.",
        },
        {
          q: "How can I pitch an article idea?",
          a: "Visit our Careers & Contributing page or reach out through our Contact form with your headline ideas and writing samples.",
        },
      ],
    },
    {
      group: "Subscriptions & Memberships",
      items: [
        {
          q: "What subscription plans are available?",
          a: "We offer Free access (with ad support and standard library tools), Pro Monthly ($4.99/mo), and Pro Annual ($49.99/yr, providing two months free).",
        },
        {
          q: "Can I cancel my subscription at any time?",
          a: "Yes. You can cancel your subscription from your Account > Subscription dashboard at any point. You will retain Pro access until the end of your prepaid billing cycle.",
        },
        {
          q: "Are payments secure?",
          a: "Yes. Payment processing is handled via PCI-compliant infrastructure. TheTathyaNews never stores your raw payment credentials or credit card numbers.",
        },
      ],
    },
    {
      group: "Accounts & Privacy",
      items: [
        {
          q: "Do I have to create an account to read?",
          a: "No. You can read articles without an account. Creating a free account enables you to save bookmarks, sync your reading history across devices, and post comments.",
        },
        {
          q: "How do you protect my personal data?",
          a: "We adhere strictly to data minimization. We only collect the information needed to maintain your account and reading progress, and we never sell your information to third-party data brokers.",
        },
      ],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-12 py-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
          <HelpCircle className="h-3.5 w-3.5" />
          Got Questions?
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Everything you need to know about our satirical newsroom, subscriptions, and reader features.
        </p>
      </div>

      {/* Accordion list */}
      <FaqAccordion groups={faqGroups} />

      {/* Footer Contact Prompt */}
      <div className="rounded-xl border border-border bg-card/60 p-6 text-center space-y-2">
        <p className="font-semibold text-sm">Have a question that isn&apos;t answered here?</p>
        <p className="text-xs text-muted-foreground">Our editorial and support teams are happy to help.</p>
        <Link href="/contact" className="text-primary text-xs font-semibold hover:underline inline-flex items-center gap-1 pt-1">
          Contact Support Desk <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
