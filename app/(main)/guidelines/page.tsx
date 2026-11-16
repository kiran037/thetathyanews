// File: app/(main)/guidelines/page.tsx
import Link from "next/link";
import { BookOpen, AlertCircle, CheckCircle2, MessageSquare, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Editorial & Community Guidelines - TheTathyaNews",
  description: "Guidelines governing satirical commentary standards and reader discussion moderation.",
};

export default function GuidelinesPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div>
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
          <BookOpen className="h-4 w-4" />
          Editorial Standards
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Editorial & Community Guidelines</h1>
        <p className="text-xs text-muted-foreground mt-2">Standards for satirical integrity and respectful dialogue</p>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">1. The Satirical Code</h2>
          <p>
            The purpose of satire is to challenge power, expose logical fallacies, and mock institutional hubris. Our writers and guest contributors operate under four fundamental principles:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Obvious Parody:</strong> Articles must employ hyperbole and tone so that a reasonable reader recognizes them as satirical fiction rather than factual news.</li>
            <li><strong>No Defamatory Smears:</strong> We parody public actions, statements, and societal trends, not private individuals or medical vulnerabilities.</li>
            <li><strong>Universal Accountability:</strong> No political faction, tech titan, or corporate conglomerate is exempt from scrutiny.</li>
            <li><strong>Clear Separation:</strong> Fiction must remain distinctly identified through site-wide satire notices and disclaimers.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">2. Community Discussion Standards</h2>
          <p>
            We welcome robust debate, witty banter, and lively critique in our article comment sections. To ensure productive discussion, we enforce the following community rules:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1.5">
              <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                <CheckCircle2 className="h-4 w-4" /> Allowed & Encouraged
              </span>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                <li>Humorous responses extending the satirical joke</li>
                <li>Critiques of the article&apos;s premise or comedic execution</li>
                <li>Respectful civil disagreement on politics or culture</li>
                <li>Sharing relevant comedic insights and references</li>
              </ul>
            </div>

            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 space-y-1.5">
              <span className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" /> Prohibited & Removed
              </span>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                <li>Hate speech, bigotry, and discrimination</li>
                <li>Targeted harassment or personal threats against readers</li>
                <li>Spam, promotional affiliate links, and bot content</li>
                <li>Doxxing or revealing private personal information</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">3. Comment Moderation Workflow</h2>
          <p>
            Comments are subject to automated spam filtering and human moderation by our editorial team. Violating comments will be edited or removed, and accounts repeatedly disregarding these guidelines will be suspended.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">4. Reporting Violations</h2>
          <p>
            If you encounter a comment that violates these standards, or if you have concerns regarding an article&apos;s parody boundaries, please submit a report through our <Link href="/contact" className="text-primary hover:underline">Contact Desk</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
