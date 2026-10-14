import { Container } from "@/components/landing/ui";
import { Logo } from "@/components/landing/Logo";
import { FOOTER_COLUMNS, SITE_TAGLINE } from "@/lib/data";

export function Footer() {
  return (
    <footer className="border-t border-line bg-cream">
      <Container className="py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="flex max-w-sm flex-col gap-4">
            <Logo />
            <p className="text-[15px] font-semibold text-ink">{SITE_TAGLINE}</p>
            <p className="text-sm leading-relaxed text-muted">
              MenuSnap is a restaurant menu research &amp; menu building platform for
              Bangladesh — explore 500+ menu references, research items and prices, and
              build your own menu in one organized workspace.
            </p>
            <p className="text-sm text-muted">Made in Bangladesh 🇧🇩</p>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="inline-block rounded text-[15px] text-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Legal microcopy */}
        <div className="mt-12 border-t border-line pt-6">
          <p className="max-w-3xl text-xs leading-relaxed text-muted/90">
            Menu references shown on MenuSnap are research information. Restaurant names,
            brands and menu content belong to their respective owners; MenuSnap is not
            affiliated with or endorsed by the restaurants referenced. Listed prices are
            references only, may change, and are not recommendations or guarantees.
          </p>
          <div className="mt-6 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              © 2026 MenuSnap. All rights reserved.
            </p>
            <p className="text-sm font-semibold text-ink">{SITE_TAGLINE}</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}