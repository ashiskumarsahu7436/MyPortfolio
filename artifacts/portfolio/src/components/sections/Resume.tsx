import { useState, useEffect } from "react";
import { publicApi, type Resume as ResumeData } from "@/lib/adminApi";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function Resume() {
  const [resume, setResume] = useState<ResumeData | null>(null);

  useEffect(() => {
    let cancelled = false;
    publicApi.resume()
      .then(r => { if (!cancelled) setResume(r); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const fileUrl     = resume?.file_url     || "";
  const lastUpdated = formatDate(resume?.last_updated);

  return (
    <section id="resume" className="grid grid-cols-1 gap-8 border-b border-border py-24 lg:grid-cols-[0.7fr_1.3fr]">
      <div className="fade-up">
        <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">03 — Resume</p>
        <h2 className="mt-4 text-4xl font-sans font-bold tracking-tight">Current resume</h2>
      </div>
      <div className="rounded-3xl border border-border bg-card p-8 shadow-md fade-up" style={{ transitionDelay: "80ms" }}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Preview graphic */}
          <div className="rounded-[20px] border border-border bg-background p-4">
            <div className="aspect-[3/4] rounded-[20px] border border-border bg-muted flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
              <div className="flex flex-col items-center gap-3 relative z-10">
                <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
                <div className="w-16 h-1.5 rounded-full bg-muted-foreground/20" />
                <div className="w-14 h-1.5 rounded-full bg-muted-foreground/20" />
                <div className="mt-2 w-10 h-1 rounded-full bg-muted-foreground/15" />
                <div className="w-16 h-1 rounded-full bg-muted-foreground/15" />
                <div className="w-12 h-1 rounded-full bg-muted-foreground/15" />
                <div className="mt-1 w-14 h-1 rounded-full bg-muted-foreground/10" />
                <div className="w-10 h-1 rounded-full bg-muted-foreground/10" />
              </div>
              {fileUrl && (
                <div className="absolute bottom-3 right-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-sans font-semibold">Resume Preview</h3>
              <p className="text-base leading-8 text-secondary-foreground">
                Download the current public resume with the latest experience, technical work, and project highlights.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-2xl border border-border bg-secondary p-4">
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="mt-2 font-mono text-foreground">{lastUpdated}</p>
                </div>
                <div className="rounded-2xl border border-border bg-secondary p-4">
                  <p className="text-muted-foreground">Format</p>
                  <p className="mt-2 font-mono text-foreground">PDF</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {fileUrl ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="min-h-11 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download Resume
                </a>
              ) : (
                <button disabled className="min-h-11 rounded-xl bg-secondary px-5 py-3 text-sm font-semibold text-muted-foreground cursor-not-allowed">
                  Resume not uploaded yet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
