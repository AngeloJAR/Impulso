"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Plus, Sparkles } from "lucide-react";

import { mainNavigation } from "@/config/app";
import { signOut } from "@/lib/supabase/auth";
import { Button } from "@/components/ui/button";

type AppShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ title, description, children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="flex min-h-screen w-full min-w-0 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="flex min-h-[68px] items-center gap-3 px-4 md:gap-4 md:px-7">
            <Link
              href="/"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm transition hover:scale-105"
              aria-label="Ir al inicio"
            >
              <Sparkles className="h-5 w-5" />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                  Impulso
                </p>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>

              <h1 className="truncate text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                {title}
              </h1>

              {description ? (
                <p className="hidden truncate text-sm text-slate-500 lg:block">
                  {description}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link href="/ideas">
                <Button className="h-10 rounded-2xl px-3 text-sm font-bold shadow-sm sm:px-4">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Nueva idea</span>
                </Button>
              </Link>

              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-2xl border-slate-200 bg-white px-3 text-sm font-bold shadow-sm hover:bg-red-50 hover:text-red-600 sm:px-4"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>

          <div className="border-t border-slate-100 px-4 py-2 md:px-7">
            <nav className="flex gap-2 overflow-x-auto">
              {mainNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActiveRoute(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex h-10 shrink-0 items-center gap-2 rounded-2xl border px-3 text-xs font-bold transition ${
                      active
                        ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <div className="flex-1 px-4 py-5 md:px-7 md:py-6">{children}</div>
      </section>
    </main>
  );
}