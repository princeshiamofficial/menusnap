
"use client";

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X, Phone, MessageCircle, MessagesSquare } from 'lucide-react';

interface ContactOption {
  name: string;
  IconComponent: React.ElementType;
  iconColor: string;
  bgColor: string;
  action: () => void;
  ariaLabel: string;
}

const contactOptionsList: ContactOption[] = [
  { 
    name: 'WhatsApp', 
    IconComponent: MessageCircle, 
    iconColor: 'text-white', 
    bgColor: 'bg-green-500 hover:bg-green-600', 
    action: () => { console.log('WhatsApp clicked'); window.open('https://wa.me/YOUR_INTERNATIONAL_WHATSAPP_NUMBER_HERE', '_blank'); },
    ariaLabel: 'Chat on WhatsApp'
  },
  { 
    name: 'Messenger', 
    IconComponent: MessagesSquare, 
    iconColor: 'text-white', 
    bgColor: 'bg-blue-500 hover:bg-blue-600', 
    action: () => { console.log('Messenger clicked'); window.open('https://m.me/YOUR_FACEBOOK_PAGE_OR_USER_ID', '_blank'); },
    ariaLabel: 'Chat on Messenger' 
  },
  { 
    name: 'Call Us', 
    IconComponent: Phone, 
    iconColor: 'text-white', 
    bgColor: 'bg-orange-500 hover:bg-orange-600', 
    action: () => { console.log('Call Us clicked'); window.location.href = 'tel:YOUR_PHONE_NUMBER_HERE'; },
    ariaLabel: 'Call us'
  },
];

export function SpeedDialFAB(): ReactNode {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 flex flex-col items-end z-50">
      {/* Contact Options Container */}
      <div 
        className={`flex flex-col items-end space-y-3 overflow-hidden transition-all duration-300 ease-in-out mb-3
                    ${isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}
        aria-hidden={!isOpen}
      >
        {isOpen && contactOptionsList.map((option) => (
          <Button
            key={option.name}
            onClick={option.action}
            variant="default"
            className="flex items-center justify-between w-48 h-12 rounded-full shadow-lg bg-card text-card-foreground hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring pl-6 pr-2 py-2"
            aria-label={option.ariaLabel}
          >
            <span className="text-sm font-medium mr-auto">{option.name}</span>
            <div className={`p-2 rounded-full ${option.bgColor} ml-2 shrink-0`}>
              <option.IconComponent className={`h-5 w-5 ${option.iconColor}`} />
            </div>
          </Button>
        ))}
      </div>

      {/* Main Toggle FAB */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="default"
        className={`rounded-full h-16 w-16 shadow-xl flex items-center justify-center
                    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                    transition-colors duration-200
                    ${isOpen ? 'bg-gray-700 hover:bg-gray-800 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close contact options" : "Open contact options"}
      >
        {isOpen ? <X className="h-8 w-8" /> : <Plus className="h-8 w-8" />}
      </Button>
    </div>
  );
}

