"use client";

import { FreeDesignHero } from "@/components/free-design/FreeDesignHero";
import { FreeDesignFeatures } from "@/components/free-design/FreeDesignFeatures";
import { FreeDesignSolution } from "@/components/free-design/FreeDesignSolution";
import { FreeDesignServices } from "@/components/free-design/FreeDesignServices";
import { FreeDesignComparison } from "@/components/free-design/FreeDesignComparison";
import { FreeDesignTestimonials } from "@/components/free-design/FreeDesignTestimonials";
import { FreeDesignBookingForm } from "@/components/free-design/FreeDesignBookingForm";

import { ClientGate } from "@/components/auth/ClientGate";

export default function FreeDesignPage() {
  return (
    <ClientGate>
      <main className="min-h-screen bg-white overflow-hidden">
        {/* Hero Section */}
        <FreeDesignHero />

        {/* Features Section */}
        <FreeDesignFeatures />

        {/* Solution Section */}
        <FreeDesignSolution />

        {/* Services Section */}
        <FreeDesignServices />

        {/* Comparison Section */}
        <FreeDesignComparison />

        {/* Testimonials Section */}
        <FreeDesignTestimonials />

        {/* Booking Form Section */}
        <FreeDesignBookingForm />
      </main>
    </ClientGate>
  );
}

