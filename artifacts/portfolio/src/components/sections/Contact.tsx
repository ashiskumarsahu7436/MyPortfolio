import { useState } from "react";

export function Contact() {
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const copyEmail = () => {
    navigator.clipboard.writeText("ashis@example.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Message from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.open(`mailto:ashis@example.com?subject=${subject}&body=${body}`);
  };

  return (
    <section id="contact" className="py-24">
      <div className="mb-12 fade-up">
        <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">04 — Contact</p>
        <h2 className="mt-4 text-4xl font-sans font-bold tracking-tight">Let's keep it direct.</h2>
        <p className="mt-4 max-w-2xl text-lg text-secondary-foreground">If you want to review my work, source code, or connect professionally, use the links below.</p>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-md fade-up">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="mt-4 text-xl font-semibold">ashis@example.com</p>
          <button
            onClick={copyEmail}
            className="mt-6 min-h-11 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-medium"
          >
            {copied ? "Copied!" : "Copy Email"}
          </button>
        </div>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-md fade-up" style={{ transitionDelay: "80ms" }}>
          <p className="text-sm text-muted-foreground">GitHub</p>
          <p className="mt-4 text-xl font-semibold">github.com/ashis</p>
          <a
            href="https://github.com/ashis"
            target="_blank"
            rel="noreferrer"
            className="mt-6 min-h-11 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-medium inline-flex items-center"
          >
            Visit GitHub
          </a>
        </div>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-md fade-up" style={{ transitionDelay: "160ms" }}>
          <p className="text-sm text-muted-foreground">LinkedIn</p>
          <p className="mt-4 text-xl font-semibold">linkedin.com/in/ashis</p>
          <a
            href="https://linkedin.com/in/ashis"
            target="_blank"
            rel="noreferrer"
            className="mt-6 min-h-11 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-medium inline-flex items-center"
          >
            Open LinkedIn
          </a>
        </div>
      </div>

      {/* Contact form */}
      <div className="rounded-3xl border border-border bg-card p-8 shadow-md fade-up" style={{ transitionDelay: "240ms" }}>
        <h3 className="text-2xl font-sans font-semibold mb-1">Send a message</h3>
        <p className="text-sm text-muted-foreground mb-8">Prefer to write directly? Fill out the form and it will open in your email client.</p>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">Your name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Smith"
              className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">Your email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jane@company.com"
              className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm text-muted-foreground">Message</label>
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Hi Ashis, I'd like to discuss..."
              className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="min-h-11 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
