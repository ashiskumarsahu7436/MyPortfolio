import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Projects } from "@/components/sections/Projects";
import { Resume } from "@/components/sections/Resume";
import { Contact } from "@/components/sections/Contact";
import { AdminModal } from "@/components/AdminModal";

export default function Home() {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col relative font-sans text-foreground">
      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-8 pb-24">
        <Hero />
        <About />
        <Projects />
        <Resume />
        <Contact />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-8 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© 2026 Ashis Kumar Sahu</p>
          <p className="flex items-center gap-2">
            <span>Built by Ashis Kumar Sahu</span>
            <span className="mx-1 opacity-30">·</span>
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="text-xs opacity-30 hover:opacity-60 cursor-pointer transition-opacity bg-transparent border-none p-0"
            >
              admin
            </button>
          </p>
        </div>
      </footer>

      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onAuthenticated={(token) => {
          console.info("Admin authenticated", token.slice(0, 10) + "…");
          setIsAdminModalOpen(false);
          // TODO: navigate to /admin panel once built
        }}
      />
    </div>
  );
}
