// File: app/(main)/contact/contact-form.tsx
"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "editorial",
    subject: "",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message");
      }

      setSubmitted(true);
      toast.success("Message dispatched successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit message");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-2xl font-bold">Message Dispatched</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Thank you for reaching out to TheTathyaNews. Your correspondence has arrived at our desk and our editorial or support staff will reply shortly.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setFormData({
              name: "",
              email: "",
              category: "editorial",
              subject: "",
              message: "",
            });
          }}
          className="btn-secondary text-xs px-4 py-2 mt-4"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Your Name</label>
          <input
            type="text"
            required
            placeholder="Jane Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email Address</label>
          <input
            type="email"
            required
            placeholder="jane@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Inquiry Department</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="editorial">Editorial & Content Pitch</option>
            <option value="advertising">Advertising & Media Kit</option>
            <option value="press">Press & Media Relations</option>
            <option value="support">Subscription & Account Support</option>
            <option value="general">General Inquiries</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Subject Line</label>
          <input
            type="text"
            required
            placeholder="Brief topic summary"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Your Message</label>
        <textarea
          rows={6}
          required
          placeholder="Please articulate your query, satirical idea, or support inquiry with clarity..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full sm:w-auto px-8 py-2.5 inline-flex items-center justify-center gap-2 text-sm font-semibold"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Dispatch Inquiry
      </button>
    </form>
  );
}
