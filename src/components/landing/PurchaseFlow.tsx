import { PURCHASE_NOTE, PURCHASE_STEPS } from "@/lib/data";
import { Container, SectionHeading } from "@/components/landing/ui";
import { Reveal } from "@/components/landing/Reveal";
import { LockIcon } from "@/components/landing/icons";

export function PurchaseFlow() {
  return (
    <section id="purchase" className="section-pad bg-surface">
      <Container>
        <SectionHeading
          eyebrow="Purchase Flow"
          title="Payment-এর পর কী হবে?"
          description="A secure, predictable onboarding path — from plan selection to your first login."
        />

        <div className="relative mt-14">
          {/* Connecting line (desktop) */}
          <div
            className="absolute left-0 right-0 top-[26px] hidden h-px bg-line lg:block"
            aria-hidden="true"
          />
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
            {PURCHASE_STEPS.map((step, i) => (
              <Reveal as="li" key={step.n} delay={i * 100} className="relative">
                <div className="flex flex-col items-start lg:items-center lg:text-center">
                  <span className="relative z-10 flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-line bg-white text-base font-extrabold text-accent-deep shadow-card">
                    {step.n}
                  </span>
                  <h3 className="mt-4 text-base font-extrabold text-ink">{step.title}</h3>
                  <p className="mt-1.5 max-w-[220px] text-sm leading-relaxed text-muted">
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        {/* Secure note */}
        <Reveal className="mt-12">
          <div className="mx-auto flex max-w-2xl items-start gap-3.5 rounded-2xl border border-line bg-cream px-5 py-4">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-deep">
              <LockIcon className="h-4 w-4" />
            </span>
            <p className="text-sm leading-relaxed text-muted">
              <span className="font-bold text-ink">Secure by design: </span>
              {PURCHASE_NOTE} Payment verification happens server-side — accounts are never
              activated from a client-side “payment successful” state.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}