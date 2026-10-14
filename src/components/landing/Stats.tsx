import { Counter } from "@/components/landing/Counter";
import { Reveal } from "@/components/landing/Reveal";
import { Container } from "@/components/landing/ui";
import { STATS } from "@/lib/data";

export function Stats() {
  return (
    <section aria-label="MenuSnap in numbers" className="border-y border-line bg-surface">
      <Container>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-4 lg:py-14">
          {STATS.map((stat, i) => (
            <Reveal as="li" key={stat.label} delay={i * 90} className="text-center">
              <p className="text-[clamp(1.9rem,3.6vw,2.9rem)] font-extrabold leading-none tracking-tight text-ink">
                {stat.value !== undefined ? (
                  <Counter target={stat.value} suffix={stat.suffix ?? ""} />
                ) : (
                  <span className="text-accent">{stat.text}</span>
                )}
              </p>
              <p className="mt-2.5 text-sm font-medium text-muted">{stat.label}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}