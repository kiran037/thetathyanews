// File: app/(main)/advertise/page.tsx
import Link from "next/link";
import { Megaphone, Target, BarChart2, Mail, CheckCircle, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Advertise With Us - TheTathyaNews",
  description: "Reach an engaged, educated, and culturally literate audience through TheTathyaNews media placements and newsletter sponsorships.",
};

export default function AdvertisePage() {
  const formats = [
    {
      title: "Display Ad Units",
      desc: "Prominent placement throughout high-traffic desktop and mobile article archives, category feeds, and homepage sections.",
    },
    {
      title: "Newsletter Sponsorships",
      desc: "Exclusive header and dedicated brand features delivered directly to our opted-in subscriber base.",
    },
    {
      title: "Sponsored Satirical Features",
      desc: "Custom creative satirical formats developed alongside our editorial writers to celebrate brand humor and authenticity.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
          <Megaphone className="h-3.5 w-3.5" />
          Brand Partnerships
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Advertise on <span className="gradient-text">TheTathyaNews</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Connect your brand with culturally aware, tech-savvy readers who value intelligent humor, clear prose, and creative distinction.
        </p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Target className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base">High-Intent Readership</h3>
          <p className="text-xs text-muted-foreground">
            Thought leaders, technology innovators, policy observers, and media professionals.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <BarChart2 className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base">Exceptional Engagement</h3>
          <p className="text-xs text-muted-foreground">
            High dwell times per article and passionate community dialogue.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base">Dedicated Newsletters</h3>
          <p className="text-xs text-muted-foreground">
            Direct access to inboxes with strong open and click-through benchmarks.
          </p>
        </div>
      </div>

      {/* Advertising Packages */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Partnership Formats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {formats.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h3 className="font-bold text-base text-foreground">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold">Request a Media Kit & Rate Card</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Contact our commercial partnerships team to discuss custom campaigns, technical specifications, and scheduled availability.
        </p>
        <div className="pt-2">
          <Link href="/contact" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold">
            Contact Advertising Desk <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
