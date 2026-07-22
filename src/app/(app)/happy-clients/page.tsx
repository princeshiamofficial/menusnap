"use client";

import { useState, useEffect, useMemo } from 'react';
import { TeamCarousel, TeamMember } from "@/components/ui/team-carousel";
import { SocialsGallery } from "@/components/ui/socials-gallery";
import { getTestimonials } from '@/app/actions/testimonials';

const FALLBACK_SPOTLIGHT_CLIENTS: TeamMember[] = [
  {
    id: '1',
    name: 'Sultan\'s Dine',
    role: 'Traditional Kacchi & Biryani • Dhaka',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    bio: 'Serving over 50,000+ happy diners monthly with instant digital table menus and zero order bottlenecks.'
  },
  {
    id: '2',
    name: 'North End Coffee',
    role: 'Specialty Roastery & Cafe • Gulshan',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    bio: 'Dynamic seasonal menu updates published in real-time across 12 outlets in Bangladesh.'
  },
  {
    id: '3',
    name: 'Chillox Gourmet Burgers',
    role: 'Fast Casual Dining • Banani',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    bio: 'Processing over 80,000+ digital orders with lightning-fast QR code table scans and customizable toppings.'
  },
  {
    id: '4',
    name: 'Secret Recipe',
    role: 'Fine Cakes & Western Cuisine • Uttara',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    bio: 'Streamlined WhatsApp order dispatch and table reservation sync for seamless peak-hour turnover.'
  },
  {
    id: '5',
    name: 'The Garden Bistro',
    role: 'Continental Fine Dining • Sylhet',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    bio: 'Delighting guests with glassmorphism digital menus that perfectly complement the luxury dining vibe.'
  }
];

export default function HappyClientsPage() {
  const [spotlightMembers, setSpotlightMembers] = useState<TeamMember[]>(FALLBACK_SPOTLIGHT_CLIENTS);

  useEffect(() => {
    async function loadTestimonialsData() {
      const res = await getTestimonials();
      if (res.success && res.data && res.data.length > 0) {
        const members: TeamMember[] = res.data.map(item => ({
          id: item.id || Date.now().toString(),
          name: item.name,
          role: item.categoryLabel || item.location || 'HAPPY CLIENT',
          bio: item.review,
          image: item.image || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
        }));
        setSpotlightMembers(members);
      }
    }
    loadTestimonialsData();
  }, []);

  return (
    <div className="min-h-full bg-background p-0 pt-2 sm:pt-4 flex flex-col justify-center items-center overflow-hidden">
      {/* Featured Spotlight Team Carousel */}
      <div className="w-full max-w-6xl">
        <TeamCarousel 
          members={spotlightMembers} 
          title="HAPPY CLIENTS"
          titleColor="rgba(245, 158, 11, 0.8)"
          cardWidth={300}
          cardHeight={400}
          autoPlay={0}
          infoTextColor="hsl(var(--foreground))"
          infoPosition="bottom"
          className="min-h-0 py-6"
        />
      </div>

      {/* Socials Gallery Grid Section */}
      <div className="w-full">
        <SocialsGallery />
      </div>
    </div>
  );
}
