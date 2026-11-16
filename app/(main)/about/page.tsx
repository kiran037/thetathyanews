// File: app/(main)/about/page.tsx
import Link from "next/link";
import { Newspaper, Compass, Award, ShieldAlert, Users, Sparkles, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About Us - TheTathyaNews",
  description: "Learn about TheTathyaNews, our satirical mission, editorial philosophy, and dedication to parody journalism.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          The Truth Behind The Satire
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Reporting Tomorrow&apos;s Absurdities <span className="gradient-text">Today</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          TheTathyaNews is an independent satirical news publication dedicated to piercing political theater, corporate doublespeak, and cultural paradoxes through sharp, unapologetic parody.
        </p>
      </div>

      {/* Satire Disclaimer Notice */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 flex items-start gap-4">
        <ShieldAlert className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm">
          <h2 className="font-bold text-foreground">Clear Satirical Notice</h2>
          <p className="text-muted-foreground leading-relaxed">
            All stories, quotes, characters, and events published by TheTathyaNews are entirely fictional and produced strictly for humorous, satirical, and critical commentary. Any resemblance to real persons, living or dead, or actual political declarations is purely a coincidence of timeline convergence.
          </p>
        </div>
      </div>

      {/* Core Mission & Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Newspaper className="h-5 w-5" />
          </div>
          <h2 className="font-bold text-lg">Journalistic Rigor</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We follow strict editorial structures mimicking legacy broadsheets and global wires to highlight the surreal contrast between standard media decorum and global reality.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Compass className="h-5 w-5" />
          </div>
          <h2 className="font-bold text-lg">Uncompromising Wit</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            From alternate-reality geopolitics to dystopian office memo leaks, our commentary exposes hypocrisy and institutional vanity without partisan allegiance.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <h2 className="font-bold text-lg">Community-Powered</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our readers participate through thoughtful discussions, verified contributor columns, and dedicated subscription tiers supporting autonomous digital satire.
          </p>
        </div>
      </div>

      {/* Editorial Philosophy */}
      <div className="rounded-2xl border border-border bg-card/60 p-8 space-y-4">
        <h2 className="text-2xl font-bold">Our Editorial Philosophy</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
          <p>
            In an era where real news frequently surpasses the boundaries of fiction, our objective is not to deceive, but to illuminate. Satire has historically provided societies with a mirror capable of questioning power, dissecting rhetoric, and providing relief through laughter.
          </p>
          <p>
            TheTathyaNews adheres to ethical guidelines prohibiting genuine defamation, malicious falsehoods, and unlabelled deception. Every dispatch is created with deliberate hyperbole to ensure readers recognize its satirical nature.
          </p>
        </div>

        <div className="pt-4 flex flex-wrap gap-4 items-center">
          <Link href="/guidelines" className="btn-secondary text-sm px-4 py-2 inline-flex items-center gap-1.5">
            Editorial Guidelines <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/contact" className="btn-ghost text-sm px-4 py-2">
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
