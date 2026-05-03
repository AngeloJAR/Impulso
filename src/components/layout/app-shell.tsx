"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Plus, Sparkles } from "lucide-react";

import { mainNavigation } from "@/config/app";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/supabase/auth";

type AppShellProps = {
  title: string;
  description?: string;
  backgroundImage?: string;
  children: React.ReactNode;
};

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getDefaultBackground(pathname: string) {
  if (pathname === "/") return "/backgrounds/bg-dashboard.png";
  if (pathname.startsWith("/nueva-idea")) return "/backgrounds/bg-nueva-idea.png";
  if (pathname.startsWith("/proyectos")) return "/backgrounds/bg-proyectos.png";
  if (pathname.startsWith("/objetivos")) return "/backgrounds/bg-objetivos.png";
  if (pathname.startsWith("/tareas")) return "/backgrounds/bg-tareas.png";
  if (pathname.startsWith("/calendario")) return "/backgrounds/bg-calendario.png";
  if (pathname.startsWith("/recordatorios")) return "/backgrounds/bg-recordatorios.png";
  if (pathname.startsWith("/revision-semanal")) return "/backgrounds/bg-revision-semanal.png";

  return "/backgrounds/bg-dashboard.png";
}

function getPrimaryAction(pathname: string) {
  if (pathname.startsWith("/proyectos")) {
    return {
      href: "/nueva-idea",
      label: "Nueva idea",
    };
  }

  if (pathname.startsWith("/objetivos")) {
    return {
      href: "/nueva-idea",
      label: "Nuevo objetivo",
    };
  }

  if (pathname.startsWith("/tareas")) {
    return {
      href: "/nueva-idea",
      label: "Nueva tarea",
    };
  }

  return {
    href: "/nueva-idea",
    label: "Nueva idea",
  };
}

export function AppShell({ title, description, backgroundImage, children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const fondo = backgroundImage || getDefaultBackground(pathname);
  const primaryAction = getPrimaryAction(pathname);

  async function handleSignOut() {
    await signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-950"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(2, 6, 23, 0.72), rgba(2, 6, 23, 0.9)), url(${fondo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_34%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-slate-950/15 backdrop-blur-[1px]" />

      <section className="relative z-10 flex min-h-screen w-full min-w-0 flex-col">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 shadow-[0_18px_60px_rgba(2,6,23,0.36)] backdrop-blur-2xl">
          <div className="flex min-h-[64px] items-center gap-3 px-4 md:px-6">
            <Link
              href="/"
              aria-label="Ir al inicio"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm transition hover:scale-105 hover:bg-slate-100"
            >
              <Sparkles className="h-5 w-5" />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300">
                  Impulso
                </p>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.85)]" />
              </div>

              <h1 className="truncate text-lg font-black tracking-tight text-white md:text-2xl">
                {title}
              </h1>

              {description ? (
                <p className="hidden truncate text-sm text-slate-300 lg:block">{description}</p>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link href={primaryAction.href}>
                <Button className="h-10 rounded-2xl bg-white px-3 text-sm font-bold text-slate-950 shadow-sm hover:bg-slate-100 sm:px-4">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{primaryAction.label}</span>
                </Button>
              </Link>

              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-2xl border-white/15 bg-white/10 px-3 text-sm font-bold text-white shadow-sm backdrop-blur-xl hover:bg-red-500/15 hover:text-red-100 sm:px-4"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>

          <div className="border-t border-white/10 px-4 py-2 md:px-6">
            <nav className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {mainNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActiveRoute(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex h-10 shrink-0 items-center gap-2 rounded-2xl border px-3 text-xs font-bold transition ${
                      active
                        ? "border-white bg-white text-slate-950 shadow-sm"
                        : "border-white/10 bg-white/10 text-slate-200 backdrop-blur-xl hover:border-white/25 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 transition ${
                        active ? "text-slate-950" : "text-slate-300 group-hover:text-white"
                      }`}
                    />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <div className="flex-1 px-4 py-5 md:px-6 md:py-6">
          <div className="mx-auto max-w-[1500px] rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-sm md:p-4">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
