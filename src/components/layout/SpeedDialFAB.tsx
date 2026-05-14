
"use client";

import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Image from 'next/image';
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
    action: () => { console.log('WhatsApp clicked'); window.open('https://wa.me/8801805561171', '_blank'); },
    ariaLabel: 'Chat on WhatsApp'
  },
  {
    name: 'Messenger',
    IconComponent: MessagesSquare,
    iconColor: 'text-white',
    bgColor: 'bg-blue-500 hover:bg-blue-600',
    action: () => { console.log('Messenger clicked'); window.open('https://www.facebook.com/messages/t/100335266150128', '_blank'); },
    ariaLabel: 'Chat on Messenger'
  },
  {
    name: 'Call Us',
    IconComponent: Phone,
    iconColor: 'text-white',
    bgColor: 'bg-orange-500 hover:bg-orange-600',
    action: () => { console.log('Call Us clicked'); window.location.href = 'tel:+8801919760626'; },
    ariaLabel: 'Call us'
  },
];

const helpText = "Need Help?";
const helpTextCharacters = Array.from(helpText);

const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 * i },
  }),
  exit: {
    opacity: 0,
    y: 10,
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
  const [showHelpTextVisual, setShowHelpTextVisual] = useState(true);
  const [showHelpImage, setShowHelpImage] = useState(false); // State for icon cycle
  const fabControls = useAnimation();
  const fabIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const helpTextCycleTimers = useRef<{ visible?: NodeJS.Timeout, hidden?: NodeJS.Timeout }>({});
  const iconCycleIntervalRef = useRef<NodeJS.Timeout | null>(null); // Ref for icon cycle timer

  useEffect(() => {
    // FAB pop animation logic
    const animateFAB = async () => {
      await fabControls.start({ // Base breathing animation
        scale: [1, 1.05, 1],
        y: [0, -4, 0], // Adding a subtle y-axis movement for bobbing
        transition: {
          scale: { duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
          y: { duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }
        }
      });
    };
    animateFAB();

    if (fabIntervalRef.current) clearInterval(fabIntervalRef.current);
    fabIntervalRef.current = setInterval(async () => {
      if (!isOpen) {
        await fabControls.start({
          scale: [1, 1.15, 1],
          transition: { duration: 0.6, ease: "easeInOut" }
        });
      }
    }, 10000);

    return () => {
      if (fabIntervalRef.current) clearInterval(fabIntervalRef.current);
      fabControls.stop();
    };
  }, [fabControls, isOpen]);

  useEffect(() => {
    if (helpTextCycleTimers.current.visible) clearTimeout(helpTextCycleTimers.current.visible);
    if (helpTextCycleTimers.current.hidden) clearTimeout(helpTextCycleTimers.current.hidden);

    if (isOpen) {
      setShowHelpTextVisual(false);
    } else {
      if (showHelpTextVisual) {
        helpTextCycleTimers.current.visible = setTimeout(() => {
          setShowHelpTextVisual(false);
        }, 10000);
      } else {
        helpTextCycleTimers.current.hidden = setTimeout(() => {
          setShowHelpTextVisual(true);
        }, 15000);
      }
    }

    return () => {
      if (helpTextCycleTimers.current.visible) clearTimeout(helpTextCycleTimers.current.visible);
      if (helpTextCycleTimers.current.hidden) clearTimeout(helpTextCycleTimers.current.hidden);
    };
  }, [isOpen, showHelpTextVisual]);

  // Effect to cycle the main FAB icon
  useEffect(() => {
    if (iconCycleIntervalRef.current) {
      clearInterval(iconCycleIntervalRef.current);
    }

    if (!isOpen) {
      // Reset to default icon immediately when closed
      setShowHelpImage(false);
      // Start the timer to cycle icons
      iconCycleIntervalRef.current = setInterval(() => {
        setShowHelpImage(prev => !prev);
      }, 3000); // Toggle every 3 seconds
    }

    return () => {
      if (iconCycleIntervalRef.current) {
        clearInterval(iconCycleIntervalRef.current);
      }
    };
  }, [isOpen]);


  return (
    <div className="fixed top-auto bottom-40 right-4 flex flex-col items-end z-50 md:bottom-4">
      <AnimatePresence>
        {showHelpTextVisual && !isOpen && (
          <motion.div
            className="mb-2 px-3 py-1 bg-card text-card-foreground text-xs font-medium rounded-full shadow-lg border border-border flex overflow-hidden"
            variants={textContainerVariants}
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
                {char === " " ? " " : char}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className={`flex flex-col-reverse items-end space-y-2 space-y-reverse overflow-hidden mb-2`}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        aria-hidden={!isOpen}
      >
        {contactOptionsList.map((option, index) => (
          <motion.div
            key={option.name}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -20 }}
            transition={{ duration: 0.2, delay: isOpen ? index * 0.05 : (contactOptionsList.length - index - 1) * 0.03, ease: "easeOut" }}
          >
            <Button
              onClick={option.action}
              variant="default"
              className="flex items-center justify-between w-40 h-10 md:w-48 md:h-12 rounded-full shadow-lg bg-card text-card-foreground hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring pl-6 pr-2 py-2"
              aria-label={option.ariaLabel}
              tabIndex={isOpen ? 0 : -1}
            >
              <span className="text-sm md:text-base font-medium mr-auto">{option.name}</span>
              <div className={`p-1.5 md:p-2 rounded-full ${option.bgColor} ml-2 shrink-0`}>
                <option.IconComponent className={`h-4 w-4 md:h-5 md:w-5 ${option.iconColor}`} />
              </div>
            </Button>
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full h-12 w-12 md:h-14 md:w-14 shadow-xl flex items-center justify-center overflow-hidden
                    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                    transition-colors duration-200
                    ${isOpen ? 'bg-gray-700 hover:bg-gray-800 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close contact options" : "Open contact options"}
        animate={fabControls}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close-icon" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 45 }}>
              <X className="h-6 w-6 md:h-7 md:w-7" />
            </motion.div>
          ) : showHelpImage ? (
            <motion.div key="help-image" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="h-full w-full relative">
              <Image
                src="/assets/help.png"
                alt="Help"
                fill
                sizes="(max-width: 768px) 48px, 56px"
                className="object-contain"
              />
            </motion.div>
          ) : (
            <motion.div key="message-icon" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
              <MessagesSquare className="h-6 w-6 md:h-7 md:w-7" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
