import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HERO_STAT_TONES, STAT_TONES } from "@/lib/stat-tones";

export default function PageHero({
  eyebrow,
  title,
  description,
  actions,
  stats,
  className,
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 px-5 py-8 text-white shadow-[0_28px_80px_-28px_rgba(30,27,75,0.65)] sm:px-8 lg:px-10",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_0%_-20%,rgba(14,165,233,0.45),transparent_55%),radial-gradient(ellipse_70%_60%_at_100%_110%,rgba(139,92,246,0.35),transparent_50%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -right-20 top-0 size-64 rounded-full bg-violet-500/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 left-1/4 size-72 rounded-full bg-sky-500/15 blur-3xl" aria-hidden />

      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl space-y-4">
          {eyebrow ? (
            <Badge className="border-sky-400/30 bg-sky-500/20 font-bold uppercase tracking-wide text-sky-100 hover:bg-sky-500/25">
              {eyebrow}
            </Badge>
          ) : null}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[2.125rem] lg:leading-tight">
              {title}
            </h1>
            {description ? (
              <p className="max-w-2xl text-sm font-medium leading-relaxed text-slate-300 sm:text-base">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2 pt-1">{actions}</div> : null}
        </div>

        {stats?.length ? (
          <div className="grid w-full gap-3 sm:grid-cols-3 xl:max-w-md xl:shrink-0">
            {stats.map((stat, index) => {
              const toneKey = stat.tone || HERO_STAT_TONES[index % HERO_STAT_TONES.length];
              const palette = STAT_TONES[toneKey] || STAT_TONES.sky;
              return (
                <div
                  key={stat.label}
                  className={cn(
                    "rounded-2xl border p-4 backdrop-blur-md",
                    palette.heroStat
                  )}
                >
                  <p
                    className={cn(
                      "text-2xl font-bold tabular-nums tracking-tight",
                      palette.heroValue
                    )}
                  >
                    {stat.value ?? "—"}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/60">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function HeroPrimaryButton({ children, className, ...props }) {
  return (
    <Button
      type="button"
      className={cn(
        "gap-2 bg-sky-400 font-bold text-slate-950 shadow-lg shadow-sky-500/30 hover:bg-sky-300",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export function HeroGhostButton({ children, className, ...props }) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "gap-2 border-white/25 bg-white/10 font-semibold text-white hover:border-white/40 hover:bg-white/20 hover:text-white",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
