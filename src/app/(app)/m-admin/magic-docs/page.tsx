import { Metadata } from "next";
import MagicDocsClient from "./magic-docs-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Magic Docs | MenuSnap Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MagicDocsPage() {
  return <MagicDocsClient />;
}
