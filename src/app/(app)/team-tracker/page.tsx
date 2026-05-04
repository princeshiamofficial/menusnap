"use client";

import TeamTrackerHero from "@/components/team-tracker/TeamTrackerHero";
import TeamTrackerCaseStudy from "@/components/team-tracker/TeamTrackerCaseStudy";
import TeamTrackerBookingForm from "@/components/team-tracker/TeamTrackerBookingForm";

import { ClientGate } from "@/components/auth/ClientGate";

export default function TeamTrackerPage() {
  return (
    <ClientGate>
      <main className="min-h-screen bg-white dark:bg-slate-950">
        <TeamTrackerHero />
        <TeamTrackerCaseStudy />
        <TeamTrackerBookingForm />
      </main>
    </ClientGate>
  );
}



