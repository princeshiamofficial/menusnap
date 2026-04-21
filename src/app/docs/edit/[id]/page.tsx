import { Metadata } from "next";
import { getMagicDocByIdFromMySql } from "@/app/actions/magic-docs";
import MagicDocEditClient from "./magic-doc-edit-client";

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
    title: "Edit Doc | MenuSnap",
  };
}

export default function MagicDocEditPage() {
  return <MagicDocEditClient />;
}
