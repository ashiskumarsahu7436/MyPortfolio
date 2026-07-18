import { useActiveSection } from "@/hooks/useActiveSection";

const links = [
  { label: "Home", id: "home" },
  { label: "Projects", id: "projects" },
  { label: "Resume", id: "resume" },
  { label: "Contact", id: "contact" },
];

export function Navbar() {
  const active = useActiveSection();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-5">
        <div className="font-sans text-lg font-semibold">Ashis Kumar Sahu</div>
        <nav className="flex items-center gap-8 text-sm">
          {links.map(({ label, id }) => (
            <a
              key={id}
              onClick={() => scrollTo(id)}
              className={`cursor-pointer transition-colors duration-150 ${
                active === id
                  ? "text-foreground font-medium"
                  : "text-secondary-foreground hover:text-foreground"
              }`}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
