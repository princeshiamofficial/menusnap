import {
  UtensilsCrossed,
  Sandwich,
  Coffee,
  Store,
  Croissant,
  Palette,
  Building2,
  Rocket,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button, Container, SectionHeading } from "@/components/landing/ui";
import { Reveal } from "@/components/landing/Reveal";

const AUDIENCE_CARDS = [
  {
    icon: UtensilsCrossed,
    title: "New Restaurant",
    tag: "নতুন রেস্টুরেন্ট",
    desc: "Start with a researched menu plan, staple items, and benchmarked pricing instead of guessing.",
    action: "Plan Restaurant Menu",
    badgeColor: "bg-orange-50 text-orange-600 border-orange-200/80 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500",
  },
  {
    icon: Sandwich,
    title: "Fast Food Joints",
    tag: "ফাস্ট ফুড শপ",
    desc: "Compare burger, fried chicken, fries, and combo snack references with fast market insights.",
    action: "Explore Fast Food",
    badgeColor: "bg-rose-50 text-rose-600 border-rose-200/80 group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500",
  },
  {
    icon: Coffee,
    title: "Café & Coffee Shops",
    tag: "ক্যাফে ও কফি",
    desc: "Curate specialty espresso lineups, iced beverages, and high-margin dessert pairing items.",
    action: "Curate Café Menu",
    badgeColor: "bg-amber-100/70 text-amber-800 border-amber-200 group-hover:bg-amber-800 group-hover:text-white group-hover:border-amber-800",
  },
  {
    icon: Store,
    title: "Cloud Kitchens",
    tag: "ক্লাউড কিচেন",
    desc: "Design lean, high-velocity delivery menus optimized for online orders and competitive packaging.",
    action: "Delivery Menu Plan",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-200/80 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600",
  },
  {
    icon: Croissant,
    title: "Bakery & Pastry",
    tag: "বেকারি ও পেস্ট্রি",
    desc: "Organize cakes, pastries, savories, and price bands for custom bakes cleanly in one place.",
    action: "Bakery Menu Setup",
    badgeColor: "bg-pink-50 text-pink-600 border-pink-200/80 group-hover:bg-pink-600 group-hover:text-white group-hover:border-pink-600",
  },
  {
    icon: Palette,
    title: "Menu Designers",
    tag: "মেন্যু ডিজাইনার",
    desc: "Get verified item descriptions, spelling, and categorized lists for client design projects.",
    action: "Design References",
    badgeColor: "bg-purple-50 text-purple-600 border-purple-200/80 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600",
  },
  {
    icon: Building2,
    title: "Agencies & Consultants",
    tag: "কনসালটেন্ট ও এজেন্সি",
    desc: "Manage multiple client menus, conduct in-depth competitive audits, and export polished lists.",
    action: "Agency Workspace",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200/80 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600",
  },
];

export function Audience() {
  return (
    <section id="audience" className="section-pad bg-cream/50 relative overflow-hidden">
      <Container>
        <SectionHeading
          eyebrow="Who It's For"
          title="MenuSnap কার জন্য?"
          description="From your first restaurant to a full agency practice — if you build menus, MenuSnap helps you plan them."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCE_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.title} delay={(i % 4) * 80}>
                <a
                  href="#pricing"
                  className="group relative flex h-full flex-col justify-between rounded-3xl border border-line bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-lift overflow-hidden"
                >
                  {/* Subtle hover gradient wash */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative z-10 flex flex-col flex-1">
                    {/* Top Row: Icon Badge & Category Tag */}
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:scale-105 shadow-sm ${card.badgeColor}`}
                        aria-hidden="true"
                      >
                        <Icon className="h-5 w-5 transition-transform duration-300" />
                      </div>
                      <span className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-bold text-muted transition-colors group-hover:bg-accent-soft group-hover:text-accent-deep">
                        {card.tag}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="mt-5 text-lg font-extrabold tracking-tight text-ink transition-colors group-hover:text-accent-deep">
                      {card.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted font-normal">
                      {card.desc}
                    </p>
                  </div>

                  {/* Bottom Action */}
                  <div className="relative z-10 mt-5 flex items-center justify-between border-t border-line/60 pt-3.5 text-[13px] font-bold text-accent-deep transition-colors group-hover:text-accent">
                    <span>{card.action}</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </a>
              </Reveal>
            );
          })}

          {/* 8th Highlight Card — High-Conversion Centerpiece */}
          <Reveal delay={80}>
            <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-950 via-[#18181b] to-black p-6 sm:p-7 shadow-lift transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-gray-700">
              {/* Ambient Glows */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-accent/25 blur-3xl transition-opacity group-hover:opacity-100" />
              <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-orange-500/15 blur-2xl" />

              <div className="relative z-10 flex flex-col flex-1">
                {/* Top Row */}
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-orange-600 text-white shadow-lg shadow-accent/30 transition-transform duration-300 group-hover:scale-110">
                    <Rocket className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-accent/40 bg-accent/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-orange-300">
                    Not Sure Yet?
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-extrabold leading-snug text-white">
                  আপনার Business-এর জন্য নিজের Menu তৈরি করুন।
                </h3>
                <p className="mt-2.5 text-xs text-gray-400 leading-relaxed font-normal flex-1">
                  500+ রেস্টুরেন্ট মেনু রেফারেন্স Explore করুন এবং কয়েক মিনিটে আপনার ব্র্যান্ডের উপযোগী মেনু লিস্ট সাজান।
                </p>
              </div>

              <div className="relative z-10 mt-6 pt-3.5 border-t border-white/10">
                <Button
                  href="#pricing"
                  variant="primary"
                  withArrow
                  className="w-full justify-center shadow-lg shadow-accent/30 font-bold"
                >
                  Find Your Menu
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}