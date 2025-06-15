
"use client";

import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileArchive, BookOpenCheck, FileText, Building2, Globe2, Star } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  bgColorClass: string;
  textColorClass: string;
  iconColorClass: string;
}

function StatCard({ title, value, icon: Icon, bgColorClass, textColorClass, iconColorClass }: StatCardProps) {
  return (
    <Card className={`${bgColorClass} ${textColorClass} shadow-lg rounded-xl overflow-hidden`}>
      <CardContent className="p-4 sm:p-6 flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-white/20 ${iconColorClass}`}>
          <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-bold">{value}</p>
          <p className="text-xs sm:text-sm opacity-90">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface TemplateCardProps {
  imageUrl: string;
  title: string;
  description: string;
  tags: string[];
  isTopRated?: boolean;
  imageHint?: string;
}

function TemplateCard({ imageUrl, title, description, tags, isTopRated, imageHint }: TemplateCardProps) {
  return (
    <Card className="shadow-xl rounded-xl overflow-hidden w-full max-w-md mx-auto sm:max-w-sm">
      <CardHeader className="p-0 relative">
        <Image
          src={imageUrl}
          alt={title}
          width={600}
          height={400}
          className="w-full h-auto object-cover"
          data-ai-hint={imageHint || "menu design"}
        />
        {isTopRated && (
          <Badge variant="default" className="absolute top-3 right-3 bg-primary text-primary-foreground">
            <Star className="h-3 w-3 mr-1 fill-current" />
            TOP RATED
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-xl font-semibold mb-1">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-3">{description}</CardDescription>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="bg-muted text-muted-foreground">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/50">
        <Button variant="secondary" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">View Template</Button>
      </CardFooter>
    </Card>
  );
}


export default function DashboardPage() {
  const stats = [
    { title: "Designs", value: "12,365+", icon: FileArchive, bgColorClass: "bg-secondary", textColorClass: "text-secondary-foreground", iconColorClass: "text-white" },
    { title: "Customers", value: "4,332+", icon: Users, bgColorClass: "bg-primary", textColorClass: "text-primary-foreground", iconColorClass: "text-white" },
    { title: "Menu Book Production", value: "57,650+", icon: BookOpenCheck, bgColorClass: "bg-secondary", textColorClass: "text-secondary-foreground", iconColorClass: "text-white" },
    { title: "Menu Card Production", value: "43,456+", icon: FileText, bgColorClass: "bg-secondary", textColorClass: "text-secondary-foreground", iconColorClass: "text-white" },
    { title: "Our Coverage Thana", value: "639+", icon: Building2, bgColorClass: "bg-secondary", textColorClass: "text-secondary-foreground", iconColorClass: "text-white" },
    { title: "Our Coverage County", value: "13+", icon: Globe2, bgColorClass: "bg-secondary", textColorClass: "text-secondary-foreground", iconColorClass: "text-white" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map(stat => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div>
        <div className="flex items-center mb-4">
          <Star className="h-6 w-6 text-primary mr-2" />
          <h2 className="text-2xl font-semibold text-foreground">Top-Rated Templates</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Our most popular professionally designed templates for your restaurant menu.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <TemplateCard
            imageUrl="https://placehold.co/600x400.png"
            imageHint="restaurant menu"
            title="Golden Delights"
            description="Modern orange &amp; gold design with bold food photography."
            tags={["Restaurant", "Cafe", "Popular"]}
            isTopRated
          />
          {/* Add more TemplateCard components here as needed */}
        </div>
      </div>

      <div className="text-center mt-12">
        <Button size="lg" variant="default" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">View All Templates</Button>
      </div>
    </div>
  );
}

