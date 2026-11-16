import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail } from "lucide-react";

const footerSections = [
  {
    title: "Categories",
    links: [
      { name: "Politics", href: "/categories/politics" },
      { name: "Technology", href: "/categories/tech" },
      { name: "Business", href: "/categories/business" },
      { name: "Entertainment", href: "/categories/entertainment" },
      { name: "Sports", href: "/categories/sports" },
      { name: "Science", href: "/categories/science" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Careers", href: "/careers" },
      { name: "Advertise", href: "/advertise" },
      { name: "Press", href: "/press" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Terms of Service", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "Editorial Guidelines", href: "/guidelines" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", href: "/help" },
      { name: "FAQ", href: "/faq" },
      { name: "Subscribe", href: "/pricing" },
      { name: "Manage Subscription", href: "/account/subscription" },
    ],
  },
];

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "https://facebook.com" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      {/* Newsletter Section */}
      <div className="border-b border-border">
        <div className="container-custom py-12">
          <div className="max-w-2xl mx-auto text-center">
            <Mail className="h-10 w-10 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h3>
            <p className="text-muted-foreground mb-6">
              Get the latest satirical news and exclusive content delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="newsletter-input flex-1"
              />
              <button className="btn-primary px-8 py-2">Subscribe</button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              By subscribing, you agree to our Privacy Policy and consent to receive updates.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-bold gradient-text">
                TheTathya<span className="text-primary">News</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Your source for satirical news and commentary. All stories are fictional and intended for entertainment.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-md border border-border bg-background hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TheTathyaNews. All rights reserved.</p>
          <p className="text-center md:text-right">
            Satirical content for entertainment purposes only. Not real news.
          </p>
        </div>
      </div>
    </footer>
  );
}