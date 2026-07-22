import { Metadata } from "next";
import { Suspense } from "react";
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

export default function MagicDocPage({ params }: Props) {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-[#f8f9fa] flex items-center justify-center animate-pulse text-gray-500 font-medium font-sans text-xl">
        Loading Magic Doc...
      </div>
    }>
      <MagicDocClient params={params} />
    </Suspense>
  );
}
