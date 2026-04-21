
import { Metadata } from "next";
import { getOrderByIdFromMySql } from "@/app/actions/orders";
import BraveEditorClient from "./brave-editor-client";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getOrderByIdFromMySql(id);
  
  if (result.success && result.data) {
    const businessName = result.data.customerData?.restaurant || result.data.customer?.restaurant || "Brave Docs";
    return {
      title: `${businessName} | Brave Docs | MenuSnap`,
    };
  }
  
  return {
    title: "Brave Docs | MenuSnap",
  };
}

export default function Page() {
  return <BraveEditorClient />;
}
