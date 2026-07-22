
import { Metadata } from "next";
import { Suspense } from "react";
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
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-[#f8f9fa] flex items-center justify-center animate-pulse text-gray-500 font-medium font-sans text-xl">
        Loading Brave Docs...
      </div>
    }>
      <BraveEditorClient />
    </Suspense>
  );
}
