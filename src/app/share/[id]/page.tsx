import { Metadata } from "next";
import { Suspense } from "react";
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
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-[#f8f9fa] flex items-center justify-center animate-pulse text-gray-500 font-medium font-sans text-xl">
        Loading Shared Selection...
      </div>
    }>
      <ShareClient />
    </Suspense>
  );
}
