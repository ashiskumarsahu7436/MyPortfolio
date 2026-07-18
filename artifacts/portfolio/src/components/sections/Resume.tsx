export function Resume() {
  return (
    <section id="resume" className="grid grid-cols-1 gap-8 border-b border-border py-24 lg:grid-cols-[0.7fr_1.3fr]">
      <div className="fade-up">
        <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">03 — Resume</p>
        <h2 className="mt-4 text-4xl font-sans font-bold tracking-tight">Current resume</h2>
      </div>
      <div className="rounded-3xl border border-border bg-card p-8 shadow-md fade-up" style={{ transitionDelay: "80ms" }}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[20px] border border-border bg-background p-4">
            <div className="aspect-[3/4] rounded-[20px] border border-border bg-muted flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
              <div className="flex flex-col items-center gap-3 relative z-10">
                <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30"></div>
                <div className="w-16 h-1.5 rounded-full bg-muted-foreground/20"></div>
                <div className="w-14 h-1.5 rounded-full bg-muted-foreground/20"></div>
                <div className="mt-2 w-10 h-1 rounded-full bg-muted-foreground/15"></div>
                <div className="w-16 h-1 rounded-full bg-muted-foreground/15"></div>
                <div className="w-12 h-1 rounded-full bg-muted-foreground/15"></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-sans font-semibold">Resume Preview</h3>
              <p className="text-base leading-8 text-secondary-foreground">Download the current public resume with the latest experience, technical work, and project highlights.</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-2xl border border-border bg-secondary p-4">
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="mt-2 font-mono text-foreground">July 2026</p>
                </div>
                <div className="rounded-2xl border border-border bg-secondary p-4">
                  <p className="text-muted-foreground">File Size</p>
                  <p className="mt-2 font-mono text-foreground">248 KB</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="min-h-11 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Download Resume</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
