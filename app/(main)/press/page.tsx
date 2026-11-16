// File: app/(main)/press/page.tsx
import Link from "next/link";
import { Newspaper, Download, Mail, ExternalLink, Sparkles, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Press Room & Media Assets - TheTathyaNews",
  description: "Official press releases, media kits, brand guidelines, and journalist contacts for TheTathyaNews.",
};

export default function PressPage() {
  const assets = [
    {
      name: "Primary Logomark & Wordmark",
      desc: "High-resolution vector SVG and PNG formats in dark and light versions.",
      size: "Vector SVG / PNG",
    },
    {
      name: "Brand Color Palette & Guidelines",
      desc: "Hex, RGB, and HSL specifications for primary orange and neutral dark tokens.",
      size: "Design Tokens",
    },
    {
      name: "Editorial Boilerplate & Executive Bios",
      desc: "Standard publication overview copy for media citations and articles.",
      size: "PDF / Markdown",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
          <Newspaper className="h-3.5 w-3.5" />
          Press Room
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Media & <span className="gradient-text">Press Kit</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Official resources, brand identity assets, and contact information for journalists, podcast producers, and media professionals.
        </p>
      </div>

      {/* Official Boilerplate */}
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-3">
        <h2 className="text-xl font-bold">About TheTathyaNews (Boilerplate)</h2>
        <div className="text-muted-foreground text-sm leading-relaxed space-y-3">
          <p>
            TheTathyaNews is a premier digital satire publication delivering witty commentary, parody journalism, and speculative analysis of political, corporate, and cultural affairs.
          </p>
          <p>
            Founded on the principle that absurdity is best dissected with precision, TheTathyaNews serves an international readership seeking critical humor and sharp observation.
          </p>
        </div>
      </div>

      {/* Media Assets Download */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Brand Identity Assets</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div key={asset.name} className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                  {asset.size}
                </span>
                <h3 className="font-bold text-base text-foreground">{asset.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{asset.desc}</p>
              </div>

              <Link
                href="/favicon.ico"
                target="_blank"
                className="btn-secondary text-xs px-3 py-2 inline-flex items-center justify-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Download Asset
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Media Inquiries Box */}
      <div className="rounded-2xl border border-border bg-card/60 p-8 space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1 max-w-md">
          <h3 className="text-lg font-bold">Media & Interview Requests</h3>
          <p className="text-xs text-muted-foreground">
            For interview inquiries, editorial commentary, or fact-checking statements regarding our fictional dispatches:
          </p>
        </div>

        <Link href="/contact" className="btn-primary text-xs px-6 py-2.5 inline-flex items-center gap-1.5 flex-shrink-0">
          Contact Press Desk <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
