import { Metadata } from "next";
import { getOrderByIdFromMySql } from "@/app/actions/orders";
import ShareClient from "./share-client";
import { decodeHtmlEntities } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getOrderByIdFromMySql(id);
  
  if (result.success && result.data) {
    const businessName = decodeHtmlEntities(result.data.customerData?.restaurant || "selection");
    return {
      title: `${businessName} | MenuSnap`,
    };
  }
  
  return {
    title: "Shared Selection | MenuSnap",
  };
}

export default function SharePage() {
  return <ShareClient />;
}
