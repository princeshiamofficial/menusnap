"use client";

import TeamTrackerHero from "@/components/team-tracker/TeamTrackerHero";
import TeamTrackerCaseStudy from "@/components/team-tracker/TeamTrackerCaseStudy";
import TeamTrackerBookingForm from "@/components/team-tracker/TeamTrackerBookingForm";

export default function TeamTrackerPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <TeamTrackerHero />
      <TeamTrackerCaseStudy />
      <TeamTrackerBookingForm />
    </main>
  );
}



