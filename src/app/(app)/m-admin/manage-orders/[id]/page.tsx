import { Metadata } from "next";
import { getOrderByIdFromMySql } from "@/app/actions/orders";
import OrderDetailsClient from "./order-details-client";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getOrderByIdFromMySql(id);
  
  if (result.success && result.data) {
    const businessName = result.data.customerData?.restaurant || result.data.customer?.restaurant || "Order Detail";
    return {
      title: `${businessName} | MenuSnap`,
    };
  }
  
  return {
    title: "Order Detail | MenuSnap",
  };
}

export default function OrderPage() {
  return <OrderDetailsClient />;
}
