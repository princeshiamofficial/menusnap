import { Metadata } from "next";
import { getMagicDocByIdFromMySql } from "@/app/actions/magic-docs";
import MagicDocClient from "./magic-doc-client";

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
    title: "Magic Doc | MenuSnap",
  };
}

export default function MagicDocPage() {
  return <MagicDocClient />;
}
