import JSZip from 'jszip';
import { xml2js, type Element } from 'xml-js';
import sharp from 'sharp';

export const MAX_EBOOK_FILE_BYTES = 12 * 1024 * 1024;
export const MAX_EBOOK_TOTAL_BYTES = 24 * 1024 * 1024;

/** Checks file contents, normalizes images and extracts bounded DOCX text. */
export async function prepareEbookFile(name: string, buffer: Buffer) {
  if (!buffer.length || buffer.length > MAX_EBOOK_FILE_BYTES) throw new Error('Each file must be between 1 byte and 12 MB.');
  const extension = name.split('.').pop()?.toLowerCase();
  if (extension === 'pdf' && buffer.subarray(0, 5).toString() === '%PDF-') {
    return { buffer, mime: 'application/pdf', extension: 'pdf', text: '' };
  }
  if (extension === 'docx' && buffer.subarray(0, 2).toString() === 'PK') {
    const zip = await JSZip.loadAsync(buffer);
    // shortcut: bounded ZIP metadata guards DOCX expansion; use a streaming parser for larger documents.
    const entries = Object.values(zip.files);
    const uncompressedSize = entries.reduce((total, file) => total + ((file as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize || 0), 0);
    if (entries.length > 2000 || uncompressedSize > 50 * 1024 * 1024) throw new Error('The Word document expands beyond the 50 MB limit.');
    const document = zip.file('word/document.xml');
    if (!document) throw new Error('This is not a valid Word document.');
    const xml = await document.async('string');
    if (xml.length > 2_000_000 || /<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('This Word document cannot be safely imported.');
    const root = xml2js(xml, { compact: false }) as Element;
    const read = (node: Element): string => {
      if (node.type === 'text') return String(node.text ?? '');
      if (node.name === 'w:tab') return '\t';
      if (node.name === 'w:br') return '\n';
      return (node.elements || []).map(read).join('') + (node.name === 'w:p' ? '\n' : '');
    };
    const text = read(root).trim();
    if (!text) throw new Error('No readable text was found in this Word document. Export image-only Word documents as PDF first.');
    if (text.length > 100_000) throw new Error('Word documents must contain fewer than 100,000 characters. Split the document and upload smaller files.');
    return { buffer, mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extension: 'docx', text };
  }
  if (['png', 'jpg', 'jpeg', 'webp'].includes(extension || '')) {
    const normalized = await sharp(buffer, { limitInputPixels: 40_000_000 }).rotate().resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }).png().toBuffer();
    if (normalized.length > MAX_EBOOK_FILE_BYTES) throw new Error('The processed image exceeds the 12 MB file limit.');
    return { buffer: normalized, mime: 'image/png', extension: 'png', text: '' };
  }
  throw new Error('Upload a valid PDF, DOCX, PNG, JPG or WebP file.');
}
