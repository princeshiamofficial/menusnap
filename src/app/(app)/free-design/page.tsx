"use client";

import { FreeDesignNavbar } from "@/components/free-design/FreeDesignNavbar";
import { FreeDesignHero } from "@/components/free-design/FreeDesignHero";
import { FreeDesignHappyClient } from "@/components/free-design/FreeDesignHappyClient";
import { FreeDesignClientReview } from "@/components/free-design/FreeDesignClientReview";
import { FreeDesignFeatures } from "@/components/free-design/FreeDesignFeatures";
import { FreeDesignCoverage } from "@/components/free-design/FreeDesignCoverage";
import { FreeDesignQuantity } from "@/components/free-design/FreeDesignQuantity";
import { FreeDesignAddReview } from "@/components/free-design/FreeDesignAddReview";
import { FreeDesignBookingCalendar } from "@/components/free-design/FreeDesignBookingCalendar";

import { ClientGate } from "@/components/auth/ClientGate";

export default function FreeDesignPage() {
  return (
    <ClientGate>
      <main className="min-h-screen bg-white">
        {/* Navbar */}
        <FreeDesignNavbar />

        {/* Hero Section */}
        <FreeDesignHero />

        {/* Happy Client Section */}
        <FreeDesignHappyClient />

        {/* Client Review Section */}
        <FreeDesignClientReview />

        {/* Features Section */}
        <FreeDesignFeatures />

        {/* Coverage Section */}
        <FreeDesignCoverage />

        {/* Quantity Info Section */}
        <FreeDesignQuantity />

        {/* Add Review Section */}
        <FreeDesignAddReview />

        {/* Slot Booking Calendar Section */}
        <FreeDesignBookingCalendar />
      </main>
    </ClientGate>
  );
}

