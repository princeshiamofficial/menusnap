'use client';

import { useEffect, useState } from 'react';
import { FileText, ImageIcon, X } from 'lucide-react';

export function EbookAttachmentCard({ name, mime, url, file, onRemove, disabled = false }: {
  name: string;
  mime: string;
  url?: string;
  file?: File;
  onRemove?: () => void;
  disabled?: boolean;
}) {
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const isImage = mime.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(name);

  useEffect(() => {
    if (!file || !isImage) return;
    const objectUrl = URL.createObjectURL(file);
    setLocalUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, isImage]);

  const content = isImage ? (
    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
      {localUrl || url ? <img src={localUrl || url} alt={name} className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-slate-400" />}
    </div>
  ) : (
    <div className="flex h-24 w-40 max-w-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-3">
      <FileText className="h-6 w-6 text-orange-500" />
      <div className="min-w-0"><p className="truncate text-xs font-medium text-slate-700">{name}</p><p className="mt-0.5 text-[10px] uppercase text-slate-400">{name.split('.').pop() || 'File'}</p></div>
    </div>
  );

  return (
    <div className="relative max-w-full shrink-0" title={name}>
      {url ? <a href={url} target="_blank" rel="noreferrer" aria-label={`Download ${name}`} className="block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500">{content}</a> : content}
      {onRemove && <button type="button" aria-label={`Remove ${name}`} disabled={disabled} onClick={onRemove} className="absolute -right-1 -top-1 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-50"><X className="h-3.5 w-3.5" /></button>}
    </div>
  );
}
