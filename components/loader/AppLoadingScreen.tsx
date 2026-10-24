import { Sprout } from "lucide-react";

export default function AppLoadingScreen() {
  return (
    <div
      role="status"
      aria-atomic="true"
      lang="uk"
      className="relative grid min-h-dvh w-full place-items-center overflow-hidden bg-background px-6 text-foreground"
    >
      <div className="relative flex flex-col items-center text-center">
        <div aria-hidden="true" className="pointer-events-none absolute -top-16 size-56 rounded-full bg-primary/8 blur-3xl" />
        <div aria-hidden="true" className="relative mb-5 grid size-14 place-items-center rounded-2xl border border-primary/15 bg-primary/5 text-primary shadow-surface">
          <Sprout className="size-6" strokeWidth={1.5} />
        </div>
        <p className="relative text-3xl font-semibold tracking-tight">Nomly</p>
        <p className="mt-2 text-sm text-muted-foreground">Завантажуємо…</p>
        <div aria-hidden="true" className="mt-7 h-0.5 w-28 overflow-hidden rounded-full bg-primary/10">
          <div className="app-loading-line h-full w-1/3 rounded-full bg-primary/70" />
        </div>
      </div>
    </div>
  );
}
