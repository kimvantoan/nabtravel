import { TourDetailClient } from "../../../components/tour-detail-client";

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <TourDetailClient tourId={resolvedParams.id} />;
}
