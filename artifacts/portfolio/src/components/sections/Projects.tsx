import { useState, useEffect } from "react";
import { publicApi, type Project } from "@/lib/adminApi";

const LABEL_GRADIENT: Record<string, string> = {
  "CMS":  "from-blue-500/10 via-blue-400/5 to-transparent",
  "AI":   "from-violet-500/10 via-violet-400/5 to-transparent",
  "ML":   "from-emerald-500/10 via-emerald-400/5 to-transparent",
  "WEB":  "from-orange-500/10 via-orange-400/5 to-transparent",
  "TOOL": "from-pink-500/10 via-pink-400/5 to-transparent",
  "APP":  "from-cyan-500/10 via-cyan-400/5 to-transparent",
};
const DEFAULT_GRADIENT = "from-slate-500/10 via-slate-400/5 to-transparent";

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    publicApi.projects()
      .then(ps => { if (!cancelled) setProjects(ps); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <section id="projects" className="border-b border-border py-24">
      <div className="mb-12 flex items-end justify-between gap-6 fade-up">
        <div>
          <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">02 — Projects</p>
          <h2 className="mt-4 text-4xl font-sans font-bold tracking-tight">Selected work</h2>
          <p className="mt-4 max-w-2xl text-lg text-secondary-foreground">
            A focused set of end-to-end projects with clear technical decisions, execution details, and public links.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-3xl border border-border bg-card p-6 h-64 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
          <p className="text-muted-foreground">No projects yet. Add some from the admin panel.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {projects.map((project, index) => {
            const gradient = LABEL_GRADIENT[project.label?.toUpperCase()] ?? DEFAULT_GRADIENT;
            const label    = project.label || "•";
            return (
              <article
                key={project.id}
                className="rounded-3xl border border-border bg-card p-6 shadow-md transition duration-200 hover:-translate-y-0.5 hover:border-foreground/20 fade-up"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.95fr]">
                  {/* Thumbnail */}
                  <div className="overflow-hidden rounded-[20px] border border-border bg-muted relative">
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="aspect-video w-full object-cover"
                        onError={e => {
                          const el = e.currentTarget;
                          el.style.display = "none";
                          el.parentElement?.classList.add("show-fallback");
                        }}
                      />
                    ) : null}
                    <div
                      className={`aspect-video w-full bg-gradient-to-br ${gradient} bg-secondary relative flex items-center justify-center ${project.thumbnail ? "hidden show-fallback:flex" : ""}`}
                    >
                      <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                          backgroundImage: `repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px),
                            repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px)`,
                        }}
                      />
                      <span className="font-mono text-5xl font-bold text-foreground/5 select-none">{label}</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                          {project.status}
                        </span>
                      </div>
                      <h3 className="text-2xl font-sans font-semibold">{project.title}</h3>
                      <p className="text-base leading-8 text-secondary-foreground">{project.description}</p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {project.tech_stack.map(t => (
                          <span key={t} className="rounded-full bg-muted px-3 py-2 text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="min-h-11 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-medium inline-flex items-center gap-1.5"
                        >
                          GitHub
                        </a>
                      )}
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noreferrer"
                          className="min-h-11 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-medium inline-flex items-center gap-1.5"
                        >
                          Live Demo
                        </a>
                      )}
                      {!project.github_url && !project.live_url && (
                        <span className="text-sm text-muted-foreground">Links coming soon</span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
