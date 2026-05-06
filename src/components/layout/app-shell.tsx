"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  LogOut,
  Menu,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";

import { mainNavigation } from "@/config/app";
import { theme } from "@/config/theme";
import { signOut } from "@/lib/supabase/auth";
import { Button } from "@/components/ui/button";

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

export function AppShell({ title, description, children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <main className={`relative overflow-hidden ${theme.app.background}`}>
      <section className={theme.app.shell}>
        <aside className={theme.sidebar.wrapper}>
          <Link href="/" className={theme.sidebar.brand}>
            <div className={theme.sidebar.brandIcon}>
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className={theme.sidebar.brandKicker}>Impulso</p>
              <p className={theme.sidebar.brandTitle}>Centro de enfoque</p>
            </div>
          </Link>

          <Link href="/nueva-idea" className="mt-5 block">
            <Button className="h-12 w-full rounded-2xl bg-blue-600 text-sm font-black text-white shadow-sm hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Nueva idea
            </Button>
          </Link>

          <div className={theme.sidebar.navBox}>
            <div className={theme.sidebar.navLabel}>
              <Search className="h-4 w-4" />
              Navegación
            </div>

            <nav className="space-y-1">
              {mainNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActiveRoute(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${theme.sidebar.navItem} ${
                      active
                        ? theme.sidebar.navItemActive
                        : theme.sidebar.navItemInactive
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`${theme.sidebar.navIcon} ${
                          active
                            ? theme.sidebar.navIconActive
                            : theme.sidebar.navIconInactive
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>

                      <span>{item.title}</span>
                    </span>

                    {active ? <ArrowUpRight className="h-4 w-4" /> : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className={theme.sidebar.infoBox}>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">
              Flujo
            </p>

            <p className="mt-2 text-sm font-semibold leading-6 text-blue-950">
              Captura ideas, conviértelas en objetivos y aterrízalas en tareas
              con fecha.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-5 h-11 w-full rounded-2xl border-rose-100 bg-white text-sm font-bold text-rose-700 shadow-sm hover:bg-rose-50"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Salir
          </Button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className={theme.header.wrapper}>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className={theme.button.icon}
                onClick={() => setMenuOpen(true)}
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={theme.header.statusDot} />
                  <p className={theme.header.kicker}>Panel activo</p>
                </div>

                <h1 className={theme.header.title}>{title}</h1>

                {description ? (
                  <p className={theme.header.description}>{description}</p>
                ) : null}
              </div>

              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                <Link href="/nueva-idea">
                  <Button className={theme.button.primary}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva idea
                  </Button>
                </Link>

                <Button
                  type="button"
                  variant="outline"
                  className={theme.button.danger}
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Salir
                </Button>
              </div>
            </div>
          </header>

          {menuOpen ? (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                className={theme.drawer.overlay}
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
              />

              <aside className={theme.drawer.panel}>
                <div className="flex items-center justify-between">
                  <Link
                    href="/"
                    className="flex items-center gap-3"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                      <Sparkles className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-500">
                        Impulso
                      </p>

                      <p className="text-sm font-black text-slate-950">
                        Menú principal
                      </p>
                    </div>
                  </Link>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-10 rounded-2xl border-slate-200 bg-white p-0 text-slate-700 hover:bg-slate-50"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Cerrar menú"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <Link
                  href="/nueva-idea"
                  className="mt-5 block"
                  onClick={() => setMenuOpen(false)}
                >
                  <Button className="h-12 w-full rounded-2xl bg-blue-600 text-sm font-black text-white hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva idea
                  </Button>
                </Link>

                <nav className="mt-5 space-y-1 rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-sm">
                  {mainNavigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveRoute(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 text-sm font-bold transition ${
                          active
                            ? "bg-blue-600 text-white"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    );
                  })}
                </nav>

                <Button
                  type="button"
                  variant="outline"
                  className="mt-5 h-11 w-full rounded-2xl border-rose-100 bg-white text-sm font-bold text-rose-700 hover:bg-rose-50"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Salir
                </Button>
              </aside>
            </div>
          ) : null}

          <div className="flex-1 px-4 py-5 md:px-6 md:py-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1500px]">
              <div className={theme.app.content}>{children}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}