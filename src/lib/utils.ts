import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const decodeHtmlEntities = (text: string | null | undefined): string => {
  if (typeof document !== 'undefined') {
    // Client-side: use the browser's built-in parser which is robust and safe.
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text || '';
    return textarea.value;
  } else {
    // Server-side: A robust fallback for SSR to prevent hydration errors.
    if (!text) return '';

    let workText = text;
    let prevText;
    
    // Iteratively decode to handle nested entities (e.g., &amp;lt; -> &lt; -> <)
    // The loop continues as long as decoding changes the string.
    do {
        prevText = workText;

        // Decode numeric entities (decimal and hexadecimal) first.
        workText = workText.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(Number(dec)));
        workText = workText.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
        
        // Decode named entities. &amp; must be last.
        workText = workText
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&');

    } while (workText !== prevText);
    
    return workText;
  }
};
