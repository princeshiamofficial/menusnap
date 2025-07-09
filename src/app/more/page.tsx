"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HelpCircle, MessageSquare, Info, ChevronRight } from 'lucide-react';

const moreMenuItems = [
    { text: 'Help & Support', icon: HelpCircle, href: '#' },
    { text: 'Send Feedback', icon: MessageSquare, href: '#' },
    { text: 'About Color Hut', icon: Info, href: '#' },
];

export default function MorePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
            <Image
                src="https://erp.colorhutbd.xyz/file/uploads/68515c4146a92_Color%20hut%20logo.png"
                alt="Color Hut Logo"
                width={150}
                height={60}
                className="object-contain mx-auto mb-4"
                priority
            />
          <CardTitle>More Options</CardTitle>
          <CardDescription>
            Additional resources and information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {moreMenuItems.map((item) => (
              <li key={item.text}>
                <Link href={item.href} passHref legacyBehavior>
                  <a className="flex items-center justify-between rounded-md p-3 transition-colors hover:bg-accent hover:text-accent-foreground">
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{item.text}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
