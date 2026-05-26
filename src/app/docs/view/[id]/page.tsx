import { Metadata } from "next";
import { getMagicDocByIdFromMySql } from "@/app/actions/magic-docs";
import MagicDocViewClient from "./magic-doc-view-client";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getMagicDocByIdFromMySql(id);
  
  if (result.success && result.data) {
    return {
      title: `${result.data.title} | MenuSnap`,
    };
  }
  
  return {
    title: "View Doc | MenuSnap",
  };
}

export default function MagicDocViewPage() {
  return <MagicDocViewClient />;
}
