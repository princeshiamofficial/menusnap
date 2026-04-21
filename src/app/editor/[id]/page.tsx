import { Metadata } from "next";
import { getOrderByIdFromMySql } from "@/app/actions/orders";
import EditorClient from "./editor-client";
import { decodeHtmlEntities } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getOrderByIdFromMySql(id);
  
  if (result.success && result.data) {
    const businessName = decodeHtmlEntities(result.data.customerData?.restaurant || "editor");
    return {
      title: `${businessName} | MenuSnap`,
    };
  }
  
  return {
    title: "Editor | MenuSnap",
  };
}

export default function PublicEditorPage() {
  return <EditorClient />;
}
