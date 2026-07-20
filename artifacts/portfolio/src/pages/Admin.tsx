import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { authApi, session } from "@/lib/api";
import { ProfileEditor } from "@/components/admin/ProfileEditor";
import { ProjectsManager } from "@/components/admin/ProjectsManager";
import { ResumeManager } from "@/components/admin/ResumeManager";
import { PasswordReset } from "@/components/admin/PasswordReset";
import { CertificationsManager } from "@/components/admin/CertificationsManager";

type Tab = "profile" | "projects" | "certifications" | "resume" | "security";

const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    id: "projects",
    label: "Projects",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    id: "certifications",
    label: "Certifications",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    id: "resume",
    label: "Resume",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    id: "security",
    label: "Security",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
];

export default function Admin() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("profile");
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [authChecking, setAuthChecking] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const t = session.get();
    if (!t) { navigate("/admin/login"); return; }
    authApi
      .verify(t)
      .then(({ valid, userId: uid }) => {
        if (!valid) { session.clear(); navigate("/admin/login"); return; }
        setToken(t);
        setUserId(uid ?? "");
        setAuthChecking(false);
      })
      .catch(() => { session.clear(); navigate("/admin/login"); });
  }, [navigate]);

  const handleLogout = () => {
    session.clear();
    navigate("/admin/login");
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const NavItem = ({ item }: { item: (typeof NAV)[0] }) => (
    <button
      onClick={() => { setTab(item.id); setMobileOpen(false); }}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        tab === item.id
          ? "bg-primary/10 text-primary border border-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      }`}
    >
      {item.icon}
      {item.label}
    </button>
  );

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Portfolio CMS</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.filter(n => n.id !== "security").map(item => <NavItem key={item.id} item={item} />)}
        <div className="pt-4 mt-4 border-t border-border">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">Settings</p>
          {NAV.filter(n => n.id === "security").map(item => <NavItem key={item.id} item={item} />)}
        </div>
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-secondary/50">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary uppercase">{userId[0] ?? "A"}</span>
          </div>
          <p className="text-sm text-foreground font-medium truncate">{userId}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Sign out
        </button>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-all mt-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          View portfolio
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col fixed inset-y-0 left-0 border-r border-border bg-card/50 backdrop-blur-sm z-20">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 w-60 border-r border-border bg-card z-40 lg:hidden flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-10 flex items-center gap-4 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <p className="font-semibold text-foreground">
            {NAV.find(n => n.id === tab)?.label ?? "Admin"}
          </p>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 max-w-5xl w-full mx-auto">
          {tab === "profile"         && token && <ProfileEditor          token={token} />}
          {tab === "projects"        && token && <ProjectsManager        token={token} />}
          {tab === "certifications"  && token && <CertificationsManager  token={token} />}
          {tab === "resume"          && token && <ResumeManager          token={token} />}
          {tab === "security"        && token && <PasswordReset          token={token} onLogout={handleLogout} />}
        </main>
      </div>
    </div>
  );
}
