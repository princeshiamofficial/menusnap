import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { parsePhoneNumberFromString } from 'libphonenumber-js'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const decodeHtmlEntities = (text: string | null | undefined): string => {
  // Using a consistent decoding method for both server and client to prevent hydration mismatches.
  if (!text) return '';

  let workText = text;
  let prevText;
  
  // The loop is necessary to handle nested entities (e.g., &amp;lt; becomes &lt; which becomes <).
  do {
      prevText = workText;

      // Decode numeric entities first, which is safer.
      workText = workText.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(Number(dec)));
      workText = workText.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
      
      // Decode the most common named entities.
      // &amp; MUST be the last one to be decoded, otherwise it will break other entities.
      workText = workText
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&');

  } while (workText !== prevText);
  
  return workText;
};

export function isValidWhatsApp(number: string): boolean {
  if (!number) return false;
  
  // Clean the number from spaces/dashes
  const cleaned = number.replace(/\D/g, '');
  
  // Truly friendly local validation: 
  // If it's a standard 11-digit BD number starting with 01, trust it for the UI phase
  if (cleaned.length === 11 && cleaned.startsWith('01')) {
    return true;
  }

  // Fallback to library for international formats (+880, etc.)
  const phoneNumber = parsePhoneNumberFromString(number, 'BD');
  if (!phoneNumber) return false;

  return phoneNumber.isValid() && (phoneNumber.getType() === 'MOBILE' || phoneNumber.getType() === 'FIXED_LINE_OR_MOBILE');
}
