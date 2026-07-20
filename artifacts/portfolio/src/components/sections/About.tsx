import { useState, useEffect } from "react";
import { publicApi, type Profile } from "@/lib/adminApi";

const TECH_COLORS: Record<string, string> = {
  "React": "#61DAFB", "TypeScript": "#3178C6", "JavaScript": "#F7DF1E",
  "Node.js": "#68A063", "Python": "#3776AB", "Vite": "#646CFF",
  "Tailwind CSS": "#38BDF8", "Tailwind": "#38BDF8", "PostgreSQL": "#336791",
  "OpenAI API": "#10A37F", "OpenAI": "#10A37F", "Vercel": "#888888",
  "Docker": "#2496ED", "Supabase": "#3ECF8E", "TensorFlow": "#FF6F00",
  "Next.js": "#ffffff", "MongoDB": "#47A248", "Redis": "#DC382D",
  "AWS": "#FF9900", "Git": "#F05032", "Express": "#68A063",
  "Prisma": "#2D3748", "GraphQL": "#E10098", "Vue": "#42B883",
  "Angular": "#DD0031", "Go": "#00ADD8", "Rust": "#CE4A00",
};

function techColor(name: string) {
  return TECH_COLORS[name] ?? "#64748b";
}

const FALLBACK_STACK = [
  "React", "TypeScript", "Node.js", "Supabase", "Vite",
  "Tailwind CSS", "PostgreSQL", "OpenAI API", "Vercel", "Docker",
];

export function About() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let cancelled = false;
    publicApi.profile()
      .then(p => { if (!cancelled) setProfile(p); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const bio         = profile?.bio         || "I am a full stack developer focused on building software that feels complete, structured, and thoughtful from both the product and engineering sides.";
  const focus       = profile?.focus       || "I am currently focused on AI-powered applications, robust content systems, and user experiences that communicate technical quality immediately.";
  const philosophy  = profile?.philosophy  || "I care about systems that are scalable, maintainable, and understandable—software that proves quality through structure, not decoration.";
  const techStack   = (profile?.tech_stack?.length ?? 0) > 0 ? profile!.tech_stack : FALLBACK_STACK;

  return (
    <section id="about" className="grid grid-cols-1 gap-10 border-b border-border py-24 lg:grid-cols-[0.7fr_1.3fr]">
      <div className="fade-up">
        <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">01 — About</p>
        <h2 className="mt-4 text-4xl font-sans font-bold tracking-tight">Engineering-first portfolio built for clarity.</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-md fade-up">
          <h3 className="text-2xl font-sans font-semibold">Who I am</h3>
          <p className="mt-4 text-base leading-8 text-secondary-foreground">{bio}</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-md fade-up" style={{ transitionDelay: "80ms" }}>
          <h3 className="text-2xl font-sans font-semibold">Current focus</h3>
          <p className="mt-4 text-base leading-8 text-secondary-foreground">{focus}</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-md fade-up" style={{ transitionDelay: "160ms" }}>
          <h3 className="text-2xl font-sans font-semibold">Technologies</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {techStack.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-mono text-secondary-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: techColor(t) }} />
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-md fade-up" style={{ transitionDelay: "240ms" }}>
          <h3 className="text-2xl font-sans font-semibold">Engineering philosophy</h3>
          <p className="mt-4 text-base leading-8 text-secondary-foreground">{philosophy}</p>
        </div>
      </div>
    </section>
  );
}
