'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowRight, BookOpen, CheckCircle2, Loader2, Star } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { submitEbookLead } from '@/app/actions/ebook';
import { ebookPageImageUrl, type EbookPageDesign } from '@/lib/ebook-page-design';
import { cn } from '@/lib/utils';

const themes = {
  amber: { text: 'text-orange-500', button: 'bg-orange-600 hover:bg-orange-700', soft: 'bg-orange-500/10', border: 'border-orange-500/25' },
  blue: { text: 'text-blue-500', button: 'bg-blue-600 hover:bg-blue-700', soft: 'bg-blue-500/10', border: 'border-blue-500/25' },
  emerald: { text: 'text-emerald-500', button: 'bg-emerald-600 hover:bg-emerald-700', soft: 'bg-emerald-500/10', border: 'border-emerald-500/25' },
  rose: { text: 'text-rose-500', button: 'bg-rose-600 hover:bg-rose-700', soft: 'bg-rose-500/10', border: 'border-rose-500/25' },
  mono: { text: 'text-slate-500', button: 'bg-slate-700 hover:bg-slate-600', soft: 'bg-slate-500/10', border: 'border-slate-500/25' },
};

/** Shared renderer for the admin's live page preview and the published /ebook page. */
export function EbookLandingPage({ design, ebookId, preview = false }: { design: EbookPageDesign; ebookId: number; preview?: boolean }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const theme = themes[design.theme];
  const dark = design.appearance === 'dark';
  const muted = dark ? 'text-slate-400' : 'text-slate-600';
  const card = dark ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-white shadow-sm';
  const button = cn('inline-flex max-w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-50', theme.button);
  const cover = design.hero.coverSourceId ? ebookPageImageUrl(ebookId, design.hero.coverSourceId, preview) : '/Ebook.png';

  return (
    <div className={cn('min-h-screen w-full min-w-0 break-words', dark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-950', design.typography === 'serif' ? 'font-serif' : 'font-sans')}>
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <span className="flex items-center gap-2 text-sm font-bold"><BookOpen className={cn('h-5 w-5 shrink-0', theme.text)} />MenuSnap</span>
        <a href="#download-section" className={cn('max-w-[60%] text-right text-sm font-semibold', theme.text)}>{design.hero.buttonLabel}</a>
      </header>
      <main>
        <section className={cn('mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-8 sm:px-8 sm:py-20', design.heroLayout === 'split' ? 'md:grid-cols-2 md:gap-16' : 'justify-items-center text-center')}>
          <div className={cn('min-w-0 max-w-2xl', design.heroLayout === 'book-focus' && 'max-w-3xl')}>
            {design.hero.eyebrow && <p className={cn('mb-5 text-xs font-bold uppercase tracking-[0.18em]', theme.text)}>{design.hero.eyebrow}</p>}
            <h1 className="text-3xl font-bold leading-snug tracking-tight sm:text-5xl sm:leading-snug lg:text-6xl lg:leading-snug">{design.hero.heading}</h1>
            <p className={cn('mt-6 whitespace-pre-line text-base leading-8 sm:text-lg', muted)}>{design.hero.description}</p>
            <a href="#download-section" className={cn(button, 'mt-8')}>{design.hero.buttonLabel}<ArrowDown className="h-4 w-4 shrink-0" /></a>
          </div>
          <div className={cn('relative flex w-full min-w-0 justify-center rounded-[2rem] border p-6 sm:p-10', theme.soft, theme.border, design.heroLayout === 'split' ? 'max-w-lg justify-self-center' : 'max-w-xl')}>
            <img src={cover} alt={design.title} className="h-auto max-h-[560px] w-full max-w-[360px] rounded-lg object-contain shadow-2xl" />
          </div>
        </section>

        {design.sections.map((section, sectionIndex) => (
          <section key={sectionIndex} className={cn('border-t px-5 py-14 sm:px-8 sm:py-20', dark ? 'border-white/5' : 'border-slate-200/70', sectionIndex % 2 === 0 && theme.soft)}>
            <div className="mx-auto max-w-6xl">
              <div className="mx-auto mb-9 max-w-2xl text-center">
                <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">{section.heading}</h2>
                {section.description && <p className={cn('mt-4 whitespace-pre-line text-base leading-7', muted)}>{section.description}</p>}
              </div>
              {section.type === 'faq' ? (
                <Accordion type="multiple" className="mx-auto max-w-3xl">
                  {section.items.map((item, index) => <AccordionItem key={index} value={String(index)} className={dark ? 'border-white/10' : 'border-slate-200'}><AccordionTrigger className="text-left text-base">{item.title}</AccordionTrigger><AccordionContent className={cn('whitespace-pre-line leading-7', muted)}>{item.description}</AccordionContent></AccordionItem>)}
                </Accordion>
              ) : section.type === 'cta' ? <div className="text-center"><a href="#download-section" className={button}>{design.hero.buttonLabel}<ArrowRight className="h-4 w-4" /></a></div> : (
                <div className={cn('grid min-w-0 gap-5', section.type === 'testimonials' ? 'md:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3')}>
                  {section.items.map((item, index) => (
                    <article key={index} className={cn('min-w-0 rounded-2xl border p-6', card)}>
                      {item.imageSourceId ? <img src={ebookPageImageUrl(ebookId, item.imageSourceId, preview)} alt={item.title} loading="lazy" className="mb-5 max-h-56 w-full rounded-xl object-contain" /> : section.type === 'chapters' ? <span className={cn('mb-4 inline-flex rounded-xl px-3 py-2 text-xs font-bold', theme.soft, theme.text)}>{String(index + 1).padStart(2, '0')}</span> : section.type === 'features' ? <CheckCircle2 className={cn('mb-4 h-6 w-6', theme.text)} /> : null}
                      {section.type === 'testimonials' && <div className={cn('mb-4 flex gap-1', theme.text)} aria-label="5 stars">{Array.from({ length: 5 }, (_, star) => <Star key={star} className="h-3.5 w-3.5 fill-current" />)}</div>}
                      <h3 className="text-lg font-semibold leading-7">{item.title}</h3>
                      <p className={cn('mt-3 whitespace-pre-line text-sm leading-7', muted)}>{item.description}</p>
                      {item.attribution && <p className={cn('mt-5 text-xs font-medium', theme.text)}>{item.attribution}</p>}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}

        <section id="download-section" className={cn('border-t px-5 py-16 sm:px-8 sm:py-24', dark ? 'border-white/10' : 'border-slate-200')}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">{design.download.heading}</h2>
            <p className={cn('mt-4 whitespace-pre-line text-base leading-7', muted)}>{design.download.description}</p>
            <form className="mt-8 flex min-w-0 flex-col gap-3 sm:flex-row" onSubmit={async event => {
              event.preventDefault();
              if (preview || submitting) return;
              const email = String(new FormData(event.currentTarget).get('email') || '');
              setSubmitting(true); setError(null);
              try {
                const result = await submitEbookLead(email);
                if (!result.success) throw new Error(result.error || 'Could not start the download. Please try again.');
                const link = document.createElement('a');
                link.href = '/Business Growth Guide By Color Hut.pdf';
                link.download = 'Business Growth Guide By Color Hut.pdf';
                link.click();
                router.push('/ebook/success');
              } catch (cause) { setError(cause instanceof Error ? cause.message : 'Please try again.'); }
              finally { setSubmitting(false); }
            }}>
              <label htmlFor="ebook-download-email" className="sr-only">Email address</label>
              <input id="ebook-download-email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="Your email address" disabled={submitting || preview} className={cn('min-w-0 flex-1 rounded-2xl border px-5 py-3.5 text-base outline-none focus:ring-2 focus:ring-offset-2', dark ? 'border-white/15 bg-white/5 text-white' : 'border-slate-300 bg-white text-slate-950')} />
              <button type="submit" disabled={submitting || preview} className={button}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDown className="h-4 w-4 shrink-0" />}{design.download.buttonLabel}</button>
            </form>
            {error && <p role="alert" className="mt-4 text-sm text-red-500">{error}</p>}
            {preview && <p className={cn('mt-4 text-xs', muted)}>Page preview · form submissions are disabled</p>}
          </div>
        </section>
      </main>
      <footer className={cn('px-5 pb-8 text-center text-xs', muted)}>MenuSnap · Color Hut</footer>
    </div>
  );
}
