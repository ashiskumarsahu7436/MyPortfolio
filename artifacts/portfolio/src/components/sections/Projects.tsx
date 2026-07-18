const projects = [
  {
    status: "Completed",
    title: "Portfolio CMS",
    desc: "A structured content system for building and publishing recruiter-friendly portfolio case studies through reusable blocks and dynamic rendering.",
    tech: ["React", "TypeScript", "Supabase", "Node.js", "AI"],
    gradient: "from-blue-500/10 via-blue-400/5 to-transparent",
    label: "CMS",
  },
  {
    status: "In Progress",
    title: "AI Project Builder",
    desc: "A visual project builder designed to turn structured content into polished public case studies with consistent presentation and fast workflows.",
    tech: ["React", "TypeScript", "Tailwind", "Vite", "Supabase"],
    gradient: "from-violet-500/10 via-violet-400/5 to-transparent",
    label: "AI",
  },
  {
    status: "Completed",
    title: "Voice Emotion Recognition",
    desc: "An AI-driven full stack application exploring audio classification, emotion detection, and structured analysis workflows.",
    tech: ["Python", "TensorFlow", "Node.js", "React"],
    gradient: "from-emerald-500/10 via-emerald-400/5 to-transparent",
    label: "ML",
  },
];

export function Projects() {
  return (
    <section id="projects" className="border-b border-border py-24">
      <div className="mb-12 flex items-end justify-between gap-6 fade-up">
        <div>
          <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">02 — Projects</p>
          <h2 className="mt-4 text-4xl font-sans font-bold tracking-tight">Selected work</h2>
          <p className="mt-4 max-w-2xl text-lg text-secondary-foreground">A focused set of end-to-end projects with clear technical decisions, execution details, and public links.</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {projects.map((project, index) => (
          <article
            key={index}
            className="rounded-3xl border border-border bg-card p-6 shadow-md transition duration-200 hover:-translate-y-0.5 hover:border-foreground/20 fade-up"
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.95fr]">
              {/* Styled thumbnail */}
              <div className="overflow-hidden rounded-[20px] border border-border bg-muted relative">
                <div className={`aspect-video w-full bg-gradient-to-br ${project.gradient} bg-secondary relative flex items-center justify-center`}>
                  <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage: `repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px),
                        repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px)`
                    }}
                  ></div>
                  <span className="font-mono text-5xl font-bold text-foreground/5 select-none">{project.label}</span>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground">{project.status}</span>
                  </div>
                  <h3 className="text-2xl font-sans font-semibold">{project.title}</h3>
                  <p className="text-base leading-8 text-secondary-foreground">{project.desc}</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {project.tech.map((t) => (
                      <span key={t} className="rounded-full bg-muted px-3 py-2 text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="min-h-11 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-medium">GitHub</button>
                  <button className="min-h-11 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-medium">Live Demo</button>
                  <button className="min-h-11 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">View Case Study</button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
