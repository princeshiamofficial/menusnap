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
    <div className="min-h-full bg-background p-4 sm:p-6 lg:p-8 space-y-8">

      {/* Featured Spotlight Team Carousel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Featured Partners Spotlight</h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Swipe or click to explore our flagship restaurant partners</p>
          </div>
        </div>

        <div className="bg-card/40 border border-border rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
          <TeamCarousel 
            members={SPOTLIGHT_CLIENTS} 
            title="SPOTLIGHT"
            titleColor="rgba(245, 158, 11, 0.8)"
            cardWidth={280}
            cardHeight={360}
            autoPlay={4000}
            infoTextColor="hsl(var(--foreground))"
            infoPosition="bottom"
            className="min-h-0 py-6"
          />
        </div>
      </div>

      {/* Controls & Category Filter Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search by client name, city, tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-card border-border text-sm"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
            {[
              { id: 'all', label: 'All Clients', icon: Users },
              { id: 'restaurant', label: 'Restaurants', icon: UtensilsCrossed },
              { id: 'cafe', label: 'Cafes', icon: Coffee },
              { id: 'bakery', label: 'Bakeries', icon: Cake },
              { id: 'fast-food', label: 'Fast Food', icon: Sparkles },
              { id: 'fine-dining', label: 'Fine Dining', icon: Award },
            ].map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <Button
                  key={cat.id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-xl text-xs px-3.5 h-9 whitespace-nowrap transition-all ${
                    isSelected ? 'shadow-md shadow-primary/20 font-semibold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 mr-1.5" />
                  {cat.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Clients Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredClients.map((client, idx) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full flex flex-col justify-between overflow-hidden border-border bg-card hover:shadow-xl hover:border-primary/40 transition-all rounded-2xl group">
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Logo Emblem */}
                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${client.logoBg} flex items-center justify-center text-white font-black text-lg shadow-md shrink-0`}>
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                            {client.name}
                          </CardTitle>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>{client.location}</span>
                          </div>
                        </div>
                      </div>

                      <Badge variant="secondary" className="bg-muted text-foreground text-[11px] font-semibold rounded-lg shrink-0 px-2 py-0.5">
                        {client.categoryLabel}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 py-2 flex-grow space-y-4">
                    {/* Quote Review Box */}
                    <div className="relative p-4 rounded-xl bg-muted/40 border border-border/50 text-xs text-foreground/90 leading-relaxed italic">
                      <Quote className="h-4 w-4 text-primary/30 absolute top-2 right-2" />
                      "{client.review}"
                    </div>

                    {/* Owner / Rep */}
                    <div className="text-[11px] text-muted-foreground font-medium flex items-center justify-between">
                      <span>— {client.ownerName}</span>
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="h-3 w-3 fill-amber-500" /> {client.rating}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {client.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>

                  {/* Footer Stats */}
                  <div className="px-6 py-4 bg-muted/20 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span><strong className="text-foreground font-semibold">{client.ordersCount}</strong> Orders Served</span>
                    </div>
                    <span className="text-[11px]">Partner since {client.joinedYear}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-16 bg-card rounded-2xl border border-border space-y-3">
            <HeartHandshake className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold text-foreground">No Happy Clients Found</h3>
            <p className="text-xs text-muted-foreground">Try adjusting your search criteria or category filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
