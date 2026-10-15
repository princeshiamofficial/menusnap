'use client';

import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { EbookLandingPage } from './ebook-landing-page';
import OriginalEbookPage from './original-ebook-page';
import type { EbookPageDesign } from '@/lib/ebook-page-design';

/** Uses an isolated viewport while rendering the same React page and stylesheet as the client page. */
export function EbookPagePreview({ design, ebookId, mobile }: { design: EbookPageDesign | null; ebookId: number; mobile: boolean }) {
  const [previewBody, setPreviewBody] = useState<HTMLElement | null>(null);
  const initialize = useCallback((frame: HTMLIFrameElement) => {
    const document = frame.contentDocument;
    if (!document) return;
    document.head.querySelectorAll('style,link[rel="stylesheet"]').forEach(node => node.remove());
    window.document.querySelectorAll('style,link[rel="stylesheet"]').forEach(node => document.head.appendChild(node.cloneNode(true)));
    setPreviewBody(document.body);
  }, []);
  const attachFrame = useCallback((frame: HTMLIFrameElement | null) => {
    if (frame?.contentDocument?.readyState === 'complete') initialize(frame);
  }, [initialize]);
  return (
    <div className="flex justify-center bg-slate-200/60 p-2 sm:p-4">
      <iframe ref={attachFrame} title="Client ebook page preview" sandbox="allow-same-origin" srcDoc="<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'></head><body></body></html>" onLoad={event => initialize(event.currentTarget)} className={`h-[75vh] min-h-[500px] w-full rounded-xl border-0 bg-white shadow-sm ${mobile ? 'max-w-[390px]' : ''}`} />
      {previewBody && createPortal(design ? <EbookLandingPage design={design} ebookId={ebookId} preview /> : <OriginalEbookPage preview />, previewBody)}
    </div>
  );
}
