"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartHandshake, 
  Star, 
  MapPin, 
  Building2, 
  UtensilsCrossed, 
  Coffee, 
  Cake, 
  Sparkles, 
  Search, 
  Quote, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Award,
  Crown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TeamCarousel, TeamMember } from "@/components/ui/team-carousel";

interface HappyClient {
  id: string;
  name: string;
  category: 'restaurant' | 'cafe' | 'bakery' | 'fast-food' | 'fine-dining';
  categoryLabel: string;
  location: string;
  rating: number;
  ordersCount: string;
  joinedYear: string;
  review: string;
  ownerName: string;
  logoBg: string;
  accentColor: string;
  tags: string[];
}

const SPOTLIGHT_CLIENTS: TeamMember[] = [
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

const HAPPY_CLIENTS: HappyClient[] = [
  {
    id: '1',
    name: 'Sultan\'s Dine',
    category: 'restaurant',
    categoryLabel: 'Restaurant',
    location: 'Dhanmondi, Dhaka',
    rating: 4.9,
    ordersCount: '50K+',
    joinedYear: '2023',
    review: 'MenuSnap completely transformed our table ordering process. Customers love scanning the QR codes and exploring our digital menu with rich imagery!',
    ownerName: 'Tanvir Hossain (Operations Head)',
    logoBg: 'from-amber-500 to-amber-700',
    accentColor: 'text-amber-500',
    tags: ['Kacchi Biryani', 'Traditional', 'QR Menu']
  },
  {
    id: '2',
    name: 'North End Coffee Roasters',
    category: 'cafe',
    categoryLabel: 'Cafe & Coffee',
    location: 'Gulshan 2, Dhaka',
    rating: 5.0,
    ordersCount: '35K+',
    joinedYear: '2023',
    review: 'The real-time menu updater and sleek mobile UI saved us thousands in printed menu re-runs every time seasonal blends change.',
    ownerName: 'Rick Hubbard (Founder)',
    logoBg: 'from-amber-800 to-yellow-900',
    accentColor: 'text-amber-600',
    tags: ['Specialty Coffee', 'Bakery', 'Digital Tabs']
  },
  {
    id: '3',
    name: 'Secret Recipe',
    category: 'bakery',
    categoryLabel: 'Bakery & Dining',
    location: 'Uttara, Dhaka',
    rating: 4.8,
    ordersCount: '42K+',
    joinedYear: '2024',
    review: 'Fast setup and extremely responsive interface. Managing orders via WhatsApp and digital table menus has doubled our peak-hour turnover.',
    ownerName: 'Sharmin Akter (Branch Manager)',
    logoBg: 'from-red-500 to-rose-700',
    accentColor: 'text-rose-500',
    tags: ['Cakes', 'Western Cuisine', 'WhatsApp Sync']
  },
  {
    id: '4',
    name: 'Chillox',
    category: 'fast-food',
    categoryLabel: 'Fast Food',
    location: 'Banani, Dhaka',
    rating: 4.9,
    ordersCount: '80K+',
    joinedYear: '2023',
    review: 'MenuSnap is lighting fast for our burger-hungry youth crowd. The order customization options and instantaneous loading are top-notch.',
    ownerName: 'Jubair Ahmed (Co-founder)',
    logoBg: 'from-red-600 to-orange-600',
    accentColor: 'text-red-500',
    tags: ['Gourmet Burgers', 'Shakes', 'Instant QR']
  },
  {
    id: '5',
    name: 'The Garden Bistro',
    category: 'fine-dining',
    categoryLabel: 'Fine Dining',
    location: 'Sylhet Sadar, Sylhet',
    rating: 5.0,
    ordersCount: '20K+',
    joinedYear: '2024',
    review: 'The dark-mode glassmorphism aesthetics perfectly align with our high-end restaurant ambiance. Our guests frequently compliment the menu design.',
    ownerName: 'Dr. Faisal Rahman (Owner)',
    logoBg: 'from-emerald-600 to-teal-800',
    accentColor: 'text-emerald-500',
    tags: ['Continental', 'Romantic Dining', 'Custom Branding']
  },
  {
    id: '6',
    name: 'Handi Restaurant',
    category: 'restaurant',
    categoryLabel: 'Restaurant',
    location: 'GEC Circle, Chattogram',
    rating: 4.8,
    ordersCount: '65K+',
    joinedYear: '2023',
    review: 'Managing high-volume orders across multiple floors was a challenge until we adopted MenuSnap. Unbelievably smooth multi-device sync.',
    ownerName: 'Mohammad Rahim (General Manager)',
    logoBg: 'from-orange-500 to-red-700',
    accentColor: 'text-orange-500',
    tags: ['Indian Cuisine', 'Family Dining', 'Multi-Floor']
  }
];

export default function HappyClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredClients = useMemo(() => {
    return HAPPY_CLIENTS.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            client.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            client.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || client.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-full bg-background p-0 pt-2 sm:pt-4 flex flex-col justify-center items-center overflow-hidden">
      {/* Featured Spotlight Team Carousel */}
      <div className="w-full max-w-6xl">
        <TeamCarousel 
          members={SPOTLIGHT_CLIENTS} 
          title="HAPPY CLIENTS"
          titleColor="rgba(245, 158, 11, 0.8)"
          cardWidth={300}
          cardHeight={400}
          autoPlay={4000}
          infoTextColor="hsl(var(--foreground))"
          infoPosition="bottom"
          className="min-h-0 py-6"
        />
      </div>
    </div>
  );
}
