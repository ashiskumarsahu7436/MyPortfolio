import { useState, useEffect } from "react";
import { publicApi, type Profile } from "@/lib/adminApi";

export function Hero() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let cancelled = false;
    publicApi.profile()
      .then(p => { if (!cancelled) setProfile(p); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const name       = profile?.full_name  || "Ashis Kumar Sahu";
  const tagline    = profile?.tagline    || "I design and build scalable web applications, AI-powered tools, and developer-focused software with an emphasis on clean architecture.";
  const focus      = profile?.focus      || "AI products, case-study quality execution, and polished developer tooling.";
  const techStack  = profile?.tech_stack ?? [];
  const badgeText  = techStack.length > 0
    ? techStack.slice(0, 4).join(" • ")
    : "React • TypeScript • Node.js • AI Integration";
  const initials   = name.split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase();
  const photoUrl   = profile?.photo_url || "";

  return (
    <section id="home" className="grid grid-cols-1 gap-12 border-b border-border py-24 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="flex flex-col justify-center gap-8 fade-up anim-in">
        <div className="inline-flex w-fit items-center rounded-full border border-border bg-secondary px-4 py-2 text-xs text-secondary-foreground">
          <span className="font-mono">{badgeText}</span>
        </div>
        <div className="space-y-6">
          <h1 className="text-2xl font-sans font-bold tracking-tight sm:text-6xl lg:text-7xl">{name}</h1>
          <p className="max-w-2xl text-xl leading-relaxed text-secondary-foreground">{tagline}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => scrollTo("projects")}
            className="min-h-11 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md"
          >
            View Projects
          </button>
          <button
            onClick={() => scrollTo("resume")}
            className="min-h-11 rounded-xl border border-border bg-secondary px-6 py-3 text-sm font-semibold text-foreground"
          >
            My Resume
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center fade-up anim-in" style={{ transitionDelay: "150ms" }}>
        <div className="w-full max-w-md rounded-[20px] border border-border bg-card p-6 shadow-md">
          <div className="aspect-[4/5] rounded-[20px] border border-border bg-muted flex flex-col items-center justify-center gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={name}
                className="absolute inset-0 w-full h-full object-cover rounded-[20px]"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <>
                <div className="w-24 h-24 rounded-full bg-secondary border border-border flex items-center justify-center relative z-10">
                  <span className="font-mono text-2xl font-bold text-foreground tracking-widest">{initials}</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono relative z-10">Add your photo</p>
              </>
            )}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-foreground">Current focus</p>
              <p className="mt-2 text-lg font-semibold">{focus}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
