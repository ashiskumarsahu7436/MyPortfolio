import { useState, useEffect } from "react";
import { publicApi, type Certification } from "@/lib/adminApi";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function Certifications() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    publicApi.certifications()
      .then(cs => { if (!cancelled) setCerts(cs); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Don't render section at all when there are no published certifications
  if (!loading && certs.length === 0) return null;

  return (
    <section id="certifications" className="border-b border-border py-24">
      <div className="mb-12 fade-up">
        <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">03 — Certifications &amp; Licenses</p>
        <h2 className="mt-4 text-4xl font-sans font-bold tracking-tight">Credentials</h2>
        <p className="mt-4 max-w-2xl text-lg text-secondary-foreground">
          Verified certifications and professional licenses from leading platforms and organisations.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 h-40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certs.map((cert, index) => (
            <article
              key={cert.id}
              className="group rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 transition duration-200 hover:-translate-y-0.5 hover:border-foreground/20 fade-up"
              style={{ transitionDelay: `${index * 60}ms` }}
            >
              {/* Badge */}
              <div className="flex items-start gap-4">
                {cert.badge_url ? (
                  <img
                    src={cert.badge_url}
                    alt={`${cert.title} badge`}
                    className="w-12 h-12 rounded-xl object-contain flex-shrink-0 bg-secondary"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{cert.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground truncate">{cert.issuer}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                {cert.issue_date && (
                  <span>Issued {formatDate(cert.issue_date)}</span>
                )}
                {cert.issue_date && cert.expiry_date && (
                  <span className="opacity-40">·</span>
                )}
                {cert.expiry_date && (
                  <span>Expires {formatDate(cert.expiry_date)}</span>
                )}
                {!cert.issue_date && !cert.expiry_date && (
                  <span className="opacity-0 select-none">—</span>
                )}
              </div>

              {/* Verify link */}
              {cert.credential_url && (
                <a
                  href={cert.credential_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  Verify credential
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
