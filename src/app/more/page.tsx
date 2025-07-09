
"use client";

import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/card';
import { HelpCircle, MessageSquare, Info, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const moreMenuItems = [
    { text: 'Help & Support', icon: HelpCircle, href: '#' },
    { text: 'Send Feedback', icon: MessageSquare, href: '#' },
    { text: 'About Color Hut', icon: Info, href: '#' },
];

function MoreOptionCard({ icon: Icon, text, href }: { icon: React.ElementType, text: string, href: string }) {
  return (
    <motion.div
      className="h-full"
      whileHover={{ y: -5, scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
        <Link href={href} passHref legacyBehavior>
            <a className="h-full block">
                <Card className="h-full shadow-md hover:shadow-xl hover:border-primary transition-all duration-300 flex flex-col items-center justify-center p-8 text-center bg-card">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                        <Icon className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground">{text}</CardTitle>
                </Card>
            </a>
        </Link>
    </motion.div>
  );
}

export default function MorePage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      };
    
      const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
        },
      };

  return (
    <div className="bg-muted min-h-screen">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <header>
                <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-card border rounded-full">
                    <MoreHorizontal className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">More Options</h1>
                    <p className="text-muted-foreground mt-1">
                        Find additional resources and information about our services.
                    </p>
                </div>
                </div>
            </header>
            <main>
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {moreMenuItems.map((item) => (
                         <motion.div key={item.text} variants={itemVariants}>
                            <MoreOptionCard icon={item.icon} text={item.text} href={item.href} />
                        </motion.div>
                    ))}
                </motion.div>
            </main>
        </div>
    </div>
  );
}
