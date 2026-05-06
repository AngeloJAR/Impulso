export const theme = {
  app: {
    background:
      "min-h-screen bg-[radial-gradient(circle_at_top_left,#DBEAFE,transparent_32%),radial-gradient(circle_at_top_right,#EDE9FE,transparent_30%),linear-gradient(135deg,#F8FAFC,#EEF2FF,#F8FAFC)] text-slate-950",
    shell: "relative z-10 flex min-h-screen",
    content:
      "mx-auto w-full max-w-[1500px] rounded-[2rem] border border-slate-200/80 bg-white/75 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-4",
  },

  sidebar: {
    wrapper:
      "hidden w-[292px] shrink-0 border-r border-slate-200/80 bg-white/80 px-4 py-5 shadow-[20px_0_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl lg:block",
    brand:
      "group flex items-center gap-3 rounded-[1.7rem] border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/60",
    brandIcon:
      "flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm transition group-hover:scale-105",
    brandKicker:
      "text-[10px] font-black uppercase tracking-[0.28em] text-slate-500",
    brandTitle: "truncate text-base font-black text-slate-950",
    navBox: "mt-5 rounded-[1.6rem] border border-slate-200 bg-white p-2 shadow-sm",
    navLabel:
      "mb-2 flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500",
    navItem:
      "group flex min-h-11 items-center justify-between rounded-2xl px-3 py-2 text-sm font-bold transition",
    navItemActive: "bg-blue-600 text-white shadow-sm",
    navItemInactive: "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
    navIcon:
      "flex h-8 w-8 items-center justify-center rounded-xl transition",
    navIconActive: "bg-white/15 text-white",
    navIconInactive:
      "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-700",
    infoBox:
      "mt-5 rounded-[1.6rem] border border-blue-100 bg-blue-50 p-4 text-blue-950",
  },

  header: {
    wrapper:
      "sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 px-4 py-3 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:px-6 lg:px-8",
    kicker:
      "text-[10px] font-black uppercase tracking-[0.26em] text-slate-500",
    title:
      "mt-1 truncate text-2xl font-black tracking-tight text-slate-950 md:text-3xl",
    description:
      "mt-1 hidden max-w-3xl truncate text-sm font-medium text-slate-600 md:block",
    statusDot: "h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.65)]",
  },

  drawer: {
    overlay: "absolute inset-0 bg-slate-950/30 backdrop-blur-sm",
    panel:
      "absolute left-0 top-0 h-full w-[86%] max-w-[360px] border-r border-slate-200 bg-white p-4 shadow-2xl",
  },

  card: {
    base: "rounded-[2rem] border border-slate-200 bg-white p-5 text-slate-950 shadow-sm md:p-6",
    soft: "rounded-[2rem] border border-slate-200 bg-white/80 p-5 text-slate-950 shadow-sm backdrop-blur-xl md:p-6",
    hero: "overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-0 text-slate-950 shadow-sm",
    inner:
      "rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-slate-700",
    empty:
      "rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center",
  },

  hero: {
    wrapper: "relative p-6 md:p-8",
    glow:
      "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(37,99,235,0.16),transparent_28%),radial-gradient(circle_at_86%_14%,rgba(124,58,237,0.13),transparent_26%),radial-gradient(circle_at_55%_100%,rgba(16,185,129,0.11),transparent_34%)]",
    content: "relative z-10",
    badge:
      "inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.22em] text-blue-700",
    title:
      "mt-5 max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl",
    description:
      "mt-4 max-w-3xl text-base font-medium leading-7 text-slate-600",
  },

  text: {
    kicker: "text-xs font-black uppercase tracking-[0.22em] text-slate-500",
    title: "text-2xl font-black text-slate-950",
    subtitle: "text-xl font-black text-slate-950",
    body: "text-sm font-medium leading-6 text-slate-600",
    muted: "text-sm font-medium text-slate-500",
    smallMuted: "text-xs font-medium leading-5 text-slate-500",
  },

  button: {
    primary:
      "h-11 rounded-2xl bg-blue-600 px-4 text-sm font-black text-white shadow-sm hover:bg-blue-700",
    primaryLarge:
      "h-12 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-sm hover:bg-blue-700",
    secondary:
      "h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-950",
    secondaryLarge:
      "h-12 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-950",
    danger:
      "h-11 rounded-2xl border border-rose-100 bg-white px-4 text-sm font-bold text-rose-700 shadow-sm hover:bg-rose-50",
    icon:
      "h-11 w-11 rounded-2xl border border-slate-200 bg-white p-0 text-slate-700 shadow-sm hover:bg-slate-50",
  },

  input: {
    base: "h-12 rounded-2xl border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 shadow-sm focus-visible:ring-blue-200",
    textarea:
      "min-h-28 rounded-2xl border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 shadow-sm focus-visible:ring-blue-200",
    select:
      "h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60",
    search:
      "h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100",
  },

  badge: {
    base: "rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ring-1",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
  },

  states: {
    objetivo: {
      activo: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      pausado: "bg-amber-50 text-amber-700 ring-amber-100",
      completado: "bg-sky-50 text-sky-700 ring-sky-100",
      abandonado: "bg-rose-50 text-rose-700 ring-rose-100",
    },
    tarea: {
      pendiente: "bg-slate-100 text-slate-700 ring-slate-200",
      hoy: "bg-sky-50 text-sky-700 ring-sky-100",
      en_proceso: "bg-violet-50 text-violet-700 ring-violet-100",
      bloqueada: "bg-rose-50 text-rose-700 ring-rose-100",
      terminada: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    },
    prioridad: {
      baja: "bg-slate-100 text-slate-700 ring-slate-200",
      media: "bg-amber-50 text-amber-700 ring-amber-100",
      alta: "bg-rose-50 text-rose-700 ring-rose-100",
    },
    proyecto: {
      activo: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      pausado: "bg-amber-50 text-amber-700 ring-amber-100",
      completado: "bg-sky-50 text-sky-700 ring-sky-100",
      archivado: "bg-slate-100 text-slate-700 ring-slate-200",
    },
  },

  alerts: {
    error:
      "rounded-[1.4rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700",
    success:
      "rounded-[1.4rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700",
    warning:
      "rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700",
    info: "rounded-[1.4rem] border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700",
  },

  progress: {
    track: "h-4 rounded-full bg-slate-100 ring-1 ring-slate-200",
    bar: "h-4 rounded-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.28)]",
    trackSmall: "h-3 rounded-full bg-slate-100 ring-1 ring-slate-200",
    barSmall: "h-3 rounded-full bg-blue-600 shadow-[0_0_18px_rgba(37,99,235,0.24)]",
  },
} as const;

export type AppTheme = typeof theme;