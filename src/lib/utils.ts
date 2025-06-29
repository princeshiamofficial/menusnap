import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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
