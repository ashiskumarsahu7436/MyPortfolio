export function Hero() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="grid grid-cols-1 gap-12 border-b border-border py-24 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="flex flex-col justify-center gap-8 fade-up anim-in">
        <div className="inline-flex w-fit items-center rounded-full border border-border bg-secondary px-4 py-2 text-xs text-secondary-foreground">
          <span className="font-mono">React • TypeScript • Node.js • AI Integration</span>
        </div>
        <div className="space-y-6">
          <h1 className="text-2xl font-sans font-bold tracking-tight sm:text-6xl lg:text-7xl">Ashis Kumar Sahu</h1>
          <p className="max-w-2xl text-xl leading-relaxed text-secondary-foreground">
            I design and build scalable web applications, AI-powered tools, and developer-focused software with an emphasis on clean architecture.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => scrollTo('projects')}
            className="min-h-11 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md"
          >
            View Projects
          </button>
          <button
            onClick={() => scrollTo('resume')}
            className="min-h-11 rounded-xl border border-border bg-secondary px-6 py-3 text-sm font-semibold text-foreground"
          >
            My Resume
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center fade-up anim-in" style={{ transitionDelay: "150ms" }}>
        <div className="w-full max-w-md rounded-[20px] border border-border bg-card p-6 shadow-md">
          {/* Avatar placeholder with initials */}
          <div className="aspect-[4/5] rounded-[20px] border border-border bg-muted flex flex-col items-center justify-center gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"></div>
            <div className="w-24 h-24 rounded-full bg-secondary border border-border flex items-center justify-center relative z-10">
              <span className="font-mono text-2xl font-bold text-foreground tracking-widest">AKS</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono relative z-10">Add your photo</p>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-foreground">Current focus</p>
              <p className="mt-2 text-lg font-semibold">AI products, case-study quality execution, and polished developer tooling.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
