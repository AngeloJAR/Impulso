"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail, Sparkles } from "lucide-react";

import { signInWithEmail } from "@/lib/supabase/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await signInWithEmail(email.trim(), password);
      router.push("/");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo iniciar sesión. Revisa tus datos.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm lg:grid-cols-[1fr_420px]">
        <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:block">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-sky-300/20 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between gap-10">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300">
                <Sparkles className="h-4 w-4" />
                Impulso
              </div>

              <h1 className="max-w-md text-4xl font-bold tracking-tight">
                Tu sistema personal para no perder ideas importantes.
              </h1>

              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                Captura ideas, organízalas por proyecto, conviértelas en tareas
                y revisa lo importante cada semana.
              </p>
            </div>

            <Card className="rounded-[2rem] border-white/10 bg-white/5 p-5 text-white shadow-none">
              <p className="text-sm font-medium text-slate-400">
                Flujo principal
              </p>
              <p className="mt-2 text-lg font-semibold">
                Idea → Proyecto → Objetivo → Tarea
              </p>
            </Card>
          </div>
        </section>

        <section className="p-6 sm:p-8">
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <LockKeyhole className="h-5 w-5" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Iniciar sesión
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Entra con tu cuenta de Supabase Auth para usar Impulso.
            </p>
          </div>

          <form onSubmit={handleLogin} className="grid gap-5">
            <div className="grid gap-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-slate-700"
              >
                Email
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="rounded-2xl pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-700"
              >
                Contraseña
              </label>

              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl"
                required
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="rounded-2xl"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="text-sm leading-6 text-slate-500">
              Si todavía no tienes usuario, créalo desde Supabase en
              Authentication → Users.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}