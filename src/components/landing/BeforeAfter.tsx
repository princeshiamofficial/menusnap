import { cn } from "@/lib/cn";
import { WITH_MENUSNAP, WITHOUT_MENUSNAP } from "@/lib/data";
import { Container } from "@/components/landing/ui";
import { Reveal } from "@/components/landing/Reveal";
import { ArrowRightIcon, CheckIcon, CloseIcon } from "@/components/landing/icons";

const SCRAMBLE = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3", "-rotate-2", "rotate-1", "rotate-2"];

export function BeforeAfter() {
  return (
    <section id="compare" className="section-pad bg-surface">
      <Container>
        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          {/* Without */}
          <Reveal>
            <div className="h-full rounded-3xl border border-line bg-white p-7 shadow-card sm:p-9">
              <div className="flex items-center justify-between border-b border-line pb-5">
                <h3 className="text-lg font-extrabold uppercase tracking-wide text-muted">
                  Without MenuSnap
                </h3>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-muted">
                  <CloseIcon className="h-4 w-4" />
                </span>
              </div>
              <ul className="mt-6 flex flex-wrap gap-3">
                {WITHOUT_MENUSNAP.map((item, i) => (
                  <li
                    key={item}
                    className={cn(
                      "rounded-xl border border-line bg-cream/80 px-4 py-2.5 text-sm font-semibold text-muted",
                      SCRAMBLE[i % SCRAMBLE.length],
                    )}
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-sm leading-relaxed text-muted/80">
                Scattered sources. Repeated research. Confusing references. Every new
                menu starts from zero — again.
              </p>
            </div>
          </Reveal>

          {/* With */}
          <Reveal delay={120}>
            <div className="relative h-full overflow-hidden rounded-3xl bg-night p-7 shadow-lift sm:p-9">
              <div className="bg-grid-dark absolute inset-0" aria-hidden="true" />
              <div className="relative">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <h3 className="text-lg font-extrabold uppercase tracking-wide text-white">
                    With MenuSnap
                  </h3>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success/20 text-success">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                </div>
                <ul className="mt-6 flex flex-col gap-3">
                  {WITH_MENUSNAP.map((item, i) => (
                    <li
                      key={item}
                      className="animate-slide-up flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5"
                      style={{ animationDelay: `${i * 70}ms` }}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent">
                        <CheckIcon className="h-3.5 w-3.5 text-white" />
                      </span>
                      <span className="text-[15px] font-bold text-white">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Statement */}
        <Reveal className="mt-14">
          <p className="text-center text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-tight text-ink">
            From <span className="text-muted">Menu Chaos</span>{" "}
            <ArrowRightIcon className="inline h-7 w-7 -translate-y-0.5 text-accent sm:h-9 sm:w-9" />{" "}
            <span className="text-accent">Menu Clarity</span>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}