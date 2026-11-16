///app/(main)/maintenance/page.tsx
import { Construction, Clock, Twitter, Mail } from "lucide-react";

export const metadata = {
  title: "Maintenance Mode - TheTathyaNews",
  description: "Site under maintenance",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6 animate-pulse">
            <Construction className="h-12 w-12 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Under Maintenance
          </h1>
          
          <p className="text-lg text-muted-foreground mb-6">
            We're currently performing scheduled maintenance to improve your experience.
            We'll be back shortly with even better satire!
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
            <Clock className="h-4 w-4" />
            <span>Estimated downtime: 2-3 hours</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary/60 animate-pulse w-2/3" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Maintenance in progress...
          </p>
        </div>

        {/* What's Being Updated */}
        <div className="rounded-lg border border-border bg-card p-6 text-left mb-8">
          <h3 className="font-semibold mb-3">What we're working on:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Upgrading our satirical content delivery system</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Improving database performance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Adding new features and enhancements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Security updates and optimizations</span>
            </li>
          </ul>
        </div>

        {/* Stay Updated */}
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Stay updated on our progress:
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://twitter.com/thetathyanews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              <Twitter className="h-4 w-4" />
              Follow on Twitter
            </a>
            
            <a
              href="mailto:support@thetathyanews.com"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              <Mail className="h-4 w-4" />
              Email Support
            </a>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          Thank you for your patience. We appreciate your support!
        </p>
      </div>
    </div>
  );
}