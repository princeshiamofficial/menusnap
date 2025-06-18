
"use client";

import { useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessagesSquare, X, Phone, MessageCircle } from 'lucide-react';

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

const helpText = "Need Help?";
const helpTextCharacters = Array.from(helpText);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 * i },
  }),
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const characterVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 200,
    },
  },
};


export function SpeedDialFAB(): ReactNode {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-4 flex flex-col items-end z-50">
      {/* "Need Help?" Text with Typing Animation */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="mb-2 px-3 py-1.5 bg-card text-card-foreground text-sm font-medium rounded-full shadow-lg border border-border flex overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-hidden={true}
          >
            {helpTextCharacters.map((char, index) => (
              <motion.span
                key={`${char}-${index}`}
                variants={characterVariants}
                className="inline-block"
              >
                {char === " " ? "\u00A0" : char} {/* Render space as non-breaking space for layout */}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Options Container */}
      <motion.div 
        className={`flex flex-col items-end space-y-3 overflow-hidden mb-3`}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        aria-hidden={!isOpen}
      >
        {contactOptionsList.map((option, index) => (
          <motion.div
            key={option.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 20 }}
            transition={{ duration: 0.2, delay: isOpen ? index * 0.05 : (contactOptionsList.length - index - 1) * 0.03, ease: "easeOut" }}
          >
            <Button
              onClick={option.action}
              variant="default" 
              className="flex items-center justify-between w-48 h-12 rounded-full shadow-lg bg-card text-card-foreground hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring pl-6 pr-2 py-2"
              aria-label={option.ariaLabel}
              tabIndex={isOpen ? 0 : -1}
            >
              <span className="text-sm font-medium mr-auto">{option.name}</span>
              <div className={`p-2 rounded-full ${option.bgColor} ml-2 shrink-0`}>
                <option.IconComponent className={`h-5 w-5 ${option.iconColor}`} />
              </div>
            </Button>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Toggle FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full h-16 w-16 shadow-xl flex items-center justify-center
                    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                    transition-colors duration-200
                    ${isOpen ? 'bg-gray-700 hover:bg-gray-800 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close contact options" : "Open contact options"}
        whileHover={{ scale: 1.1 }}
        animate={{
          scale: [1, 1.05, 1], 
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
      >
        {isOpen ? <X className="h-8 w-8" /> : <MessagesSquare className="h-8 w-8" />}
      </motion.button>
    </div>
  );
}

