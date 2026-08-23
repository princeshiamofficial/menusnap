import { Metadata } from "next";
import { Suspense } from "react";
import { getSummernoteDocByIdFromMySql } from "@/app/actions/summernote-docs";
import SummernoteDocEditClient from "./summernote-doc-edit-client";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getSummernoteDocByIdFromMySql(id);
  
  if (result.success && result.data) {
    return {
      title: `Edit ${result.data.title} | Summernote Docs | MenuSnap`,
    };
  }
  
  return {
    title: "Edit Summernote Doc | MenuSnap",
  };
}

export default function SummernoteDocEditPage({ params }: Props) {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-[#f8f9fa] flex items-center justify-center animate-pulse text-gray-500 font-medium font-sans text-xl">
        Loading Summernote Editor...
      </div>
    }>
      <SummernoteDocEditClient params={params} />
    </Suspense>
  );
}
