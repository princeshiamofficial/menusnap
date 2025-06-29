import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const decodeHtmlEntities = (text: string | null | undefined): string => {
  if (typeof document !== 'undefined') {
    // Client-side: use the browser's built-in parser which is robust
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text || '';
    return textarea.value;
  } else {
    // Server-side: a more robust decoding strategy for nested entities
    let workText = text || '';
    
    // A common issue is double-encoding, like &amp;amp; -> &amp; -> &.
    // We can loop until the string stops changing.
    let prevText;
    do {
        prevText = workText;
        workText = workText
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
    } while (workText !== prevText);
    
    // Now handle numeric entities, which might have been revealed (e.g., &amp;#39; -> &#39;)
    workText = workText.replace(/&#(\d+);/g, (match, dec) => {
        return String.fromCharCode(Number(dec));
    });

    return workText;
  }
};
