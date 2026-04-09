import { TourInquireClient } from "@/components/tour-inquire-client";
import type { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.id;
  return {
    title: `Inquire Tour | NabTravel`,
    description: "Submit your inquiry for the perfect tour package with NabTravel.",
  };
}

export default async function TourInquirePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <TourInquireClient tourId={resolvedParams.id} />;
}
