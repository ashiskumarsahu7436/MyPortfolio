const techStack = [
  { name: "React", color: "#61DAFB" },
  { name: "TypeScript", color: "#3178C6" },
  { name: "Node.js", color: "#68A063" },
  { name: "Supabase", color: "#3ECF8E" },
  { name: "Vite", color: "#646CFF" },
  { name: "Tailwind CSS", color: "#38BDF8" },
  { name: "PostgreSQL", color: "#336791" },
  { name: "OpenAI API", color: "#10A37F" },
  { name: "Vercel", color: "#888888" },
  { name: "Docker", color: "#2496ED" },
];

export function About() {
  return (
    <section id="about" className="grid grid-cols-1 gap-10 border-b border-border py-24 lg:grid-cols-[0.7fr_1.3fr]">
      <div className="fade-up">
        <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">01 — About</p>
        <h2 className="mt-4 text-4xl font-sans font-bold tracking-tight">Engineering-first portfolio built for clarity.</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-md fade-up">
          <h3 className="text-2xl font-sans font-semibold">Who I am</h3>
          <p className="mt-4 text-base leading-8 text-secondary-foreground">I am a full stack developer focused on building software that feels complete, structured, and thoughtful from both the product and engineering sides.</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-md fade-up" style={{ transitionDelay: "80ms" }}>
          <h3 className="text-2xl font-sans font-semibold">Current focus</h3>
          <p className="mt-4 text-base leading-8 text-secondary-foreground">I am currently focused on AI-powered applications, robust content systems, and user experiences that communicate technical quality immediately.</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-md fade-up" style={{ transitionDelay: "160ms" }}>
          <h3 className="text-2xl font-sans font-semibold">Technologies</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {techStack.map((t) => (
              <span
                key={t.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-mono text-secondary-foreground"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: t.color }}
                ></span>
                {t.name}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-md fade-up" style={{ transitionDelay: "240ms" }}>
          <h3 className="text-2xl font-sans font-semibold">Engineering philosophy</h3>
          <p className="mt-4 text-base leading-8 text-secondary-foreground">I care about systems that are scalable, maintainable, and understandable—software that proves quality through structure, not decoration.</p>
        </div>
      </div>
    </section>
  );
}
