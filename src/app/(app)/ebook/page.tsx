import { ClientGate } from '@/components/auth/ClientGate';
import { EbookLandingPage } from '@/components/ebook/ebook-landing-page';
import OriginalEbookPage from '@/components/ebook/original-ebook-page';
import { getPublishedEbookPage } from '@/app/actions/ebook-studio';

export const dynamic = 'force-dynamic';

export default async function EBookPage() {
  const published = await getPublishedEbookPage();
  if (!published.success || !published.data) return <OriginalEbookPage />;
  return <ClientGate><EbookLandingPage design={published.data.design} ebookId={published.data.ebookId} /></ClientGate>;
}
