// File: app/(main)/careers/page.tsx
import Link from "next/link";
import { Briefcase, Feather, Sparkles, ShieldCheck, ArrowRight, Compass } from "lucide-react";

export const metadata = {
  title: "Careers & Contributing - TheTathyaNews",
  description: "Explore speculative writing and editorial opportunities at TheTathyaNews.",
};

export default function CareersPage() {
  const roles = [
    {
      title: "Speculative Satire Columnist",
      type: "Remote · Contributor",
      description: "Craft biting dispatches predicting improbable political maneuvers, global summit deadlocks, and bureaucratic triumphs.",
    },
    {
      title: "Corporate doublespeak Analyst",
      type: "Remote · Part-time",
      description: "Translate modern quarterly shareholder calls and Silicon Valley buzzword announcements into painfully truthful parodies.",
    },
    {
      title: "Cultural Irony Investigator",
      type: "Remote · Freelance",
      description: "Cover social phenomena, algorithmic absurdities, and consumer trends through narrative satire and mock investigative reports.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
          <Briefcase className="h-3.5 w-3.5" />
          Join The Wire
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Write For <span className="gradient-text">TheTathyaNews</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          We are always searching for writers, satirists, and parody journalists with an acute ear for the absurd and a dedication to sharp prose.
        </p>
      </div>

      {/* Editorial Culture Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-2.5">
          <Feather className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-base">Uncensored Creative Wit</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Pitch the stories legacy outlets are too polite to print. We reward intellectual daring, stylistic flair, and originality.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-2.5">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-base">Ethical Parody Standard</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Our newsroom strictly separates satirical commentary from malicious disinformation. We hold parody to the highest stylistic benchmarks.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-2.5">
          <Compass className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-base">Global Audience Reach</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Distribute your pieces across thousands of daily readers, verified community discussions, and digital archives.
          </p>
        </div>
      </div>

      {/* Open Contributor Tracks */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Open Contributor Tracks</h2>
        <div className="space-y-4">
          {roles.map((role) => (
            <div
              key={role.title}
              className="rounded-xl border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-base">{role.title}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                    {role.type}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>

              <Link
                href="/contact"
                className="btn-secondary text-xs px-4 py-2 flex-shrink-0 inline-flex items-center gap-1 self-start sm:self-center"
              >
                Pitch Desk <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Submission Guidelines Notice */}
      <div className="rounded-xl border border-border bg-muted/30 p-6 space-y-3">
        <h3 className="font-semibold text-sm">How to submit a pitch</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Please provide 3 sample headlines, a 2-paragraph draft excerpt, and a brief description of your writing background through our editorial contact portal. We review submissions on a rolling basis.
        </p>
        <Link href="/contact" className="text-primary text-xs font-semibold hover:underline inline-block pt-1">
          Submit Pitch via Editorial Portal →
        </Link>
      </div>
    </div>
  );
}
