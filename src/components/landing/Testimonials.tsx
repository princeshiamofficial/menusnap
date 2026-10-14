import { Container, SectionHeading } from "@/components/landing/ui";
import { Reveal } from "@/components/landing/Reveal";
import { CheckIcon, ShieldIcon } from "@/components/landing/icons";

/**
 * Testimonial architecture.
 *
 * We deliberately do NOT ship fake testimonials. This section renders an
 * honest "coming soon" state. Once real, verified reviews are available,
 * replace <EmptyTestimonials /> with a grid of <TestimonialCard /> entries.
 */

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  business: string;
  initials: string;
};

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-3xl border border-line bg-white p-7 shadow-card">
      <span className="text-5xl font-extrabold leading-none text-accent" aria-hidden="true">
        “
      </span>
      <blockquote className="mt-2 flex-1 text-[15px] leading-relaxed text-ink">
        {testimonial.quote}
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-sm font-extrabold text-accent-deep">
          {testimonial.initials}
        </span>
        <span>
          <span className="block text-sm font-extrabold text-ink">{testimonial.name}</span>
          <span className="block text-xs text-muted">
            {testimonial.role} · {testimonial.business}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

function EmptyTestimonials() {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-line bg-white p-8 text-center shadow-card sm:p-12">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent-deep">
        <ShieldIcon className="h-7 w-7" />
      </span>
      <p className="mt-6 text-[clamp(1.4rem,3vw,2.1rem)] font-extrabold tracking-tight text-ink">
        Built for people who build food businesses.
      </p>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
        We only publish verified customer reviews — no fake testimonials. Real stories from
        restaurant owners, café founders and agencies will appear here as MenuSnap grows.
      </p>
      <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-semibold text-muted">
        <li className="flex items-center gap-1.5">
          <CheckIcon className="h-3.5 w-3.5 text-success" /> Reviews verified
        </li>
        <li className="flex items-center gap-1.5">
          <CheckIcon className="h-3.5 w-3.5 text-success" /> Real customers only
        </li>
        <li className="flex items-center gap-1.5">
          <CheckIcon className="h-3.5 w-3.5 text-success" /> Updated as we grow
        </li>
      </ul>
    </div>
  );
}

export function Testimonials() {
  return (
    <section id="testimonials" className="section-pad bg-cream">
      <Container>
        <SectionHeading
          eyebrow="Testimonials"
          title="কাস্টমারদের অভিজ্ঞতা শীঘ্রই আসছে।"
          description="Verified stories only — we don't use fake reviews."
        />
        <Reveal className="mt-12">
          <EmptyTestimonials />
        </Reveal>
      </Container>
    </section>
  );
}